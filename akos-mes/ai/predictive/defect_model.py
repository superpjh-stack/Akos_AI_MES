"""
Defect prediction model for Akos AI MES.
XGBoost + RandomForest ensemble with SHAP explanations.
"""
from __future__ import annotations

import logging
import warnings
from typing import Any

import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

warnings.filterwarnings("ignore", category=UserWarning)
logger = logging.getLogger(__name__)

FEATURE_COLUMNS = [
    "설비사양",        # equipment specification score (0-10)
    "BOM복잡도",       # BOM complexity (number of unique items)
    "공정이상횟수",    # number of process anomalies
    "자재품질등급",    # material quality grade (1=best, 5=worst)
    "설계변경횟수",    # number of design change orders
]

RISK_SCALE = 10.0  # output scale (0-10)


def generate_sample_data(n_samples: int = 1000, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic training data for the defect prediction model."""
    rng = np.random.default_rng(random_state)

    df = pd.DataFrame({
        "설비사양":     rng.uniform(1.0, 10.0, n_samples),
        "BOM복잡도":    rng.integers(10, 500, n_samples).astype(float),
        "공정이상횟수": rng.integers(0, 20, n_samples).astype(float),
        "자재품질등급": rng.integers(1, 6, n_samples).astype(float),
        "설계변경횟수": rng.integers(0, 15, n_samples).astype(float),
    })

    # Synthetic label: higher anomalies, worse material, more design changes → defect
    logit = (
        -3.0
        + 0.15 * df["공정이상횟수"]
        + 0.30 * df["자재품질등급"]
        + 0.20 * df["설계변경횟수"]
        - 0.10 * df["설비사양"]
        + 0.005 * df["BOM복잡도"]
        + rng.normal(0, 0.5, n_samples)
    )
    prob = 1 / (1 + np.exp(-logit))
    df["불량여부"] = (rng.uniform(0, 1, n_samples) < prob).astype(int)

    logger.info("Generated %d sample rows (defect rate=%.2f%%)",
                n_samples, df["불량여부"].mean() * 100)
    return df


class DefectPredictor:
    """
    XGBoost + RandomForest ensemble defect risk predictor.

    Usage
    -----
    predictor = DefectPredictor()
    df = generate_sample_data()
    predictor.train(df)
    result = predictor.predict({"설비사양": 7, "BOM복잡도": 150, ...})
    """

    feature_columns = FEATURE_COLUMNS

    def __init__(self) -> None:
        self._xgb = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric="logloss",
            random_state=42,
            verbosity=0,
        )
        self._rf = RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            random_state=42,
            n_jobs=-1,
        )
        self._ensemble = VotingClassifier(
            estimators=[("xgb", self._xgb), ("rf", self._rf)],
            voting="soft",
            weights=[0.6, 0.4],
        )
        self._scaler = StandardScaler()
        self._is_trained = False
        self._shap_explainer: Any = None
        self._train_X: np.ndarray | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self, df: pd.DataFrame) -> dict:
        """
        Train ensemble on DataFrame containing feature_columns + '불량여부'.

        Returns
        -------
        dict with cross-validation ROC-AUC score.
        """
        missing = [c for c in self.feature_columns if c not in df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")
        if "불량여부" not in df.columns:
            raise ValueError("Target column '불량여부' not found in DataFrame")

        X = df[self.feature_columns].values.astype(float)
        y = df["불량여부"].values.astype(int)

        X_scaled = self._scaler.fit_transform(X)

        scores = cross_val_score(self._ensemble, X_scaled, y, cv=5,
                                 scoring="roc_auc", n_jobs=-1)
        self._ensemble.fit(X_scaled, y)

        # Build SHAP explainer on XGBoost component (faster than ensemble)
        self._xgb.fit(X_scaled, y)
        self._shap_explainer = shap.TreeExplainer(self._xgb)
        self._train_X = X_scaled
        self._is_trained = True

        result = {
            "cv_roc_auc_mean": float(scores.mean()),
            "cv_roc_auc_std": float(scores.std()),
            "n_samples": len(df),
            "defect_rate": float(y.mean()),
        }
        logger.info("DefectPredictor trained: AUC=%.4f ± %.4f",
                    result["cv_roc_auc_mean"], result["cv_roc_auc_std"])
        return result

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(self, features: dict) -> dict:
        """
        Predict defect risk for a single sample.

        Parameters
        ----------
        features : dict with keys matching feature_columns

        Returns
        -------
        dict:
            risk_score  : float 0-10
            risk_level  : str (낮음/중간/높음/매우높음)
            defect_prob : float 0-1
            top_causes  : list of top-3 contributing features with SHAP values
        """
        if not self._is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        X = self._feature_vector(features)
        X_scaled = self._scaler.transform(X)

        defect_prob = float(self._ensemble.predict_proba(X_scaled)[0, 1])
        risk_score = round(defect_prob * RISK_SCALE, 2)
        risk_level = self._risk_level(risk_score)

        shap_vals = self._shap_explainer.shap_values(X_scaled)[0]
        top_causes = self._top_causes(shap_vals, n=3)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "defect_prob": round(defect_prob, 4),
            "top_causes": top_causes,
        }

    def explain(self, features: dict) -> dict:
        """
        Return full SHAP values for a single sample.

        Returns
        -------
        dict mapping feature name → shap value
        """
        if not self._is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        X = self._feature_vector(features)
        X_scaled = self._scaler.transform(X)
        shap_vals = self._shap_explainer.shap_values(X_scaled)[0]

        return {col: float(shap_vals[i]) for i, col in enumerate(self.feature_columns)}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _feature_vector(self, features: dict) -> np.ndarray:
        row = [float(features.get(col, 0.0)) for col in self.feature_columns]
        return np.array([row])

    @staticmethod
    def _risk_level(score: float) -> str:
        if score >= 7.0:
            return "매우높음"
        if score >= 5.0:
            return "높음"
        if score >= 3.0:
            return "중간"
        return "낮음"

    def _top_causes(self, shap_vals: np.ndarray, n: int = 3) -> list[dict]:
        pairs = sorted(
            zip(self.feature_columns, shap_vals),
            key=lambda x: abs(x[1]),
            reverse=True,
        )
        return [
            {"feature": col, "shap_value": round(float(val), 4),
             "direction": "증가" if val > 0 else "감소"}
            for col, val in pairs[:n]
        ]
