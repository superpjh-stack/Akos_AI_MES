"""
Cost and lead-time prediction model for Akos AI MES.
LightGBM with feature engineering, confidence intervals via quantile regression.
"""
from __future__ import annotations

import logging
import warnings
from typing import Any

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings("ignore", category=UserWarning)
logger = logging.getLogger(__name__)

FEATURE_COLUMNS = [
    "프로젝트유형",   # project type: string category
    "설비수량",       # number of equipment units
    "BOM항목수",      # number of BOM line items
    "납품거리",       # delivery distance (km)
    "고객등급",       # customer tier (1=premium, 3=standard)
]

LEADTIME_FEATURE_COLUMNS = [
    "프로젝트유형",
    "설비수량",
    "BOM항목수",
    "납품거리",
    "고객등급",
    "예측원가",       # predicted cost (from predict())
]


def generate_cost_sample_data(n_samples: int = 800, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic training data for the cost predictor."""
    rng = np.random.default_rng(random_state)
    project_types = ["수변전", "배전반", "태양광", "ESS", "자동화"]

    df = pd.DataFrame({
        "프로젝트유형": rng.choice(project_types, n_samples),
        "설비수량":     rng.integers(1, 30, n_samples).astype(float),
        "BOM항목수":    rng.integers(20, 600, n_samples).astype(float),
        "납품거리":     rng.uniform(10, 500, n_samples),
        "고객등급":     rng.integers(1, 4, n_samples).astype(float),
    })

    type_base = {"수변전": 80_000, "배전반": 55_000, "태양광": 120_000,
                 "ESS": 150_000, "자동화": 95_000}
    base = df["프로젝트유형"].map(type_base)

    cost = (
        base
        + df["설비수량"] * 3_000
        + df["BOM항목수"] * 120
        + df["납품거리"] * 50
        - df["고객등급"] * 2_000
        + rng.normal(0, 8_000, n_samples)
    )
    df["원가"] = cost.clip(lower=10_000)

    leadtime = (
        15
        + df["설비수량"] * 1.5
        + df["BOM항목수"] * 0.05
        + df["납품거리"] * 0.03
        + df["고객등급"] * (-1.5)
        + rng.normal(0, 3, n_samples)
    )
    df["납기일수"] = leadtime.clip(lower=7).round()

    return df


class CostPredictor:
    """
    LightGBM-based cost and lead-time predictor.

    Usage
    -----
    predictor = CostPredictor()
    df = generate_cost_sample_data()
    predictor.train(df)
    result = predictor.predict({...})
    lt = predictor.predict_leadtime({...})
    """

    feature_columns = FEATURE_COLUMNS

    def __init__(self) -> None:
        # Main cost model (median)
        self._model_median = LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=40,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="quantile",
            alpha=0.5,
            random_state=42,
            verbose=-1,
        )
        # Lower / upper bound models for confidence interval
        self._model_lower = LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=40,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="quantile",
            alpha=0.10,
            random_state=42,
            verbose=-1,
        )
        self._model_upper = LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=40,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="quantile",
            alpha=0.90,
            random_state=42,
            verbose=-1,
        )
        # Lead-time model
        self._model_leadtime = LGBMRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=5,
            num_leaves=31,
            random_state=42,
            verbose=-1,
        )
        self._le = LabelEncoder()
        self._is_trained = False
        self._train_cost_mean: float = 0.0

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self, df: pd.DataFrame) -> dict:
        """
        Train cost and lead-time models.

        Expects columns: FEATURE_COLUMNS + ['원가', '납기일수']
        """
        df = df.copy()
        df["프로젝트유형_enc"] = self._le.fit_transform(df["프로젝트유형"])

        X = self._build_features(df)
        y_cost = df["원가"].values.astype(float)
        y_lt = df["납기일수"].values.astype(float)

        self._train_cost_mean = float(y_cost.mean())

        self._model_median.fit(X, y_cost)
        self._model_lower.fit(X, y_cost)
        self._model_upper.fit(X, y_cost)

        # For lead-time add predicted cost as feature
        X_lt = np.column_stack([X, self._model_median.predict(X)])
        self._model_leadtime.fit(X_lt, y_lt)

        # CV MAPE on cost
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        mape_scores = []
        for train_idx, val_idx in kf.split(X):
            m = LGBMRegressor(n_estimators=300, learning_rate=0.05,
                               max_depth=6, num_leaves=40,
                               objective="quantile", alpha=0.5,
                               verbose=-1, random_state=42)
            m.fit(X[train_idx], y_cost[train_idx])
            preds = m.predict(X[val_idx])
            mape = float(np.mean(np.abs((y_cost[val_idx] - preds) / y_cost[val_idx])) * 100)
            mape_scores.append(mape)

        self._is_trained = True
        result = {
            "cv_mape_mean": round(float(np.mean(mape_scores)), 2),
            "cv_mape_std": round(float(np.std(mape_scores)), 2),
            "n_samples": len(df),
        }
        logger.info("CostPredictor trained: MAPE=%.2f%% ± %.2f%%",
                    result["cv_mape_mean"], result["cv_mape_std"])
        return result

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(self, features: dict) -> dict:
        """
        Predict project cost with 80% confidence interval.

        Returns
        -------
        dict:
            predicted_cost    : float (KRW)
            lower_bound       : float (10th percentile)
            upper_bound       : float (90th percentile)
            mape_estimate     : float (%)
            confidence_width  : float (%)
        """
        if not self._is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        X = self._feature_row(features)
        median = float(self._model_median.predict(X)[0])
        lower = float(self._model_lower.predict(X)[0])
        upper = float(self._model_upper.predict(X)[0])

        confidence_width = round((upper - lower) / max(median, 1) * 100, 2)

        return {
            "predicted_cost": round(median, 0),
            "lower_bound": round(lower, 0),
            "upper_bound": round(upper, 0),
            "mape_estimate": None,  # filled at train time
            "confidence_width_pct": confidence_width,
            "currency": "KRW",
        }

    def predict_leadtime(self, features: dict) -> dict:
        """
        Predict lead time in calendar days.

        Returns
        -------
        dict:
            predicted_days : int
            range_min      : int
            range_max      : int
        """
        if not self._is_trained:
            raise RuntimeError("Model not trained. Call train() first.")

        cost_result = self.predict(features)
        X = self._feature_row(features)
        X_lt = np.column_stack([X, [[cost_result["predicted_cost"]]]])

        days = float(self._model_leadtime.predict(X_lt)[0])
        days = max(days, 7.0)

        return {
            "predicted_days": int(round(days)),
            "range_min": int(round(days * 0.85)),
            "range_max": int(round(days * 1.20)),
            "estimated_cost": cost_result["predicted_cost"],
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _encode_project_type(self, val: str) -> int:
        try:
            return int(self._le.transform([val])[0])
        except ValueError:
            return 0  # unknown category → first class

    def _feature_row(self, features: dict) -> np.ndarray:
        proj_enc = self._encode_project_type(str(features.get("프로젝트유형", "")))
        row_dict = {
            "프로젝트유형_enc": proj_enc,
            "설비수량":         float(features.get("설비수량", 1)),
            "BOM항목수":        float(features.get("BOM항목수", 50)),
            "납품거리":         float(features.get("납품거리", 100)),
            "고객등급":         float(features.get("고객등급", 2)),
        }
        return self._build_features(pd.DataFrame([row_dict]))

    def _build_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        # Feature engineering
        df["비용밀도"] = df["BOM항목수"] / df["설비수량"].clip(lower=1)
        df["거리_설비"] = df["납품거리"] * df["설비수량"]

        cols = [
            "프로젝트유형_enc",
            "설비수량",
            "BOM항목수",
            "납품거리",
            "고객등급",
            "비용밀도",
            "거리_설비",
        ]
        return df[cols].values.astype(float)
