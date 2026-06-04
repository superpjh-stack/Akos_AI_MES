"""Reusable Plotly chart components for Akos AI MES."""

from __future__ import annotations

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# ---------------------------------------------------------------------------
# OEE Gauge
# ---------------------------------------------------------------------------

def render_oee_gauge(value: float, title: str = "OEE") -> go.Figure:
    """Return a Plotly gauge figure for OEE (0-100 %).

    Colour zones:
      0-60  red (poor)
      60-75 orange (marginal)
      75-85 yellow (acceptable)
      85-100 green (world-class)
    """
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number+delta",
            value=value,
            title={"text": title, "font": {"size": 16, "color": "#f0f2f6"}},
            number={"suffix": "%", "font": {"size": 28, "color": "#f0f2f6"}},
            delta={"reference": 85, "increasing": {"color": "#2ecc71"}, "decreasing": {"color": "#e74c3c"}},
            gauge={
                "axis": {
                    "range": [0, 100],
                    "tickwidth": 1,
                    "tickcolor": "#6b7280",
                    "tickfont": {"color": "#9ba3af"},
                },
                "bar": {"color": "#4f8ef7", "thickness": 0.25},
                "bgcolor": "#1e2130",
                "borderwidth": 0,
                "steps": [
                    {"range": [0, 60], "color": "#4a1a1a"},
                    {"range": [60, 75], "color": "#4a3a1a"},
                    {"range": [75, 85], "color": "#3a3a1a"},
                    {"range": [85, 100], "color": "#1a3a1a"},
                ],
                "threshold": {
                    "line": {"color": "#2ecc71", "width": 3},
                    "thickness": 0.8,
                    "value": 85,
                },
            },
        )
    )
    fig.update_layout(
        height=220,
        margin=dict(l=20, r=20, t=40, b=10),
        paper_bgcolor="#1e2130",
        font_color="#f0f2f6",
    )
    return fig


# ---------------------------------------------------------------------------
# Defect Trend Line Chart
# ---------------------------------------------------------------------------

def render_defect_trend(df: pd.DataFrame) -> go.Figure:
    """Return a defect-rate trend line chart.

    Expected DataFrame columns: date (str/date), defect_rate (float, 0-100 %).
    Optional column: project_name — if present, one line per project.
    """
    if df is None or df.empty:
        fig = go.Figure()
        fig.update_layout(
            title="불량률 트렌드 (데이터 없음)",
            paper_bgcolor="#1e2130",
            plot_bgcolor="#1e2130",
            font_color="#9ba3af",
        )
        return fig

    color_col = "project_name" if "project_name" in df.columns else None

    fig = px.line(
        df,
        x="date",
        y="defect_rate",
        color=color_col,
        markers=True,
        title="불량률 트렌드 (%)",
        labels={"date": "날짜", "defect_rate": "불량률 (%)", "project_name": "프로젝트"},
        color_discrete_sequence=px.colors.qualitative.Plotly,
    )

    # Target line at 3 %
    fig.add_hline(
        y=3,
        line_dash="dash",
        line_color="#f39c12",
        annotation_text="목표 3%",
        annotation_position="bottom right",
        annotation_font_color="#f39c12",
    )

    fig.update_traces(line_width=2, marker_size=6)
    fig.update_layout(
        height=320,
        paper_bgcolor="#1e2130",
        plot_bgcolor="#151822",
        font_color="#f0f2f6",
        legend=dict(bgcolor="#1e2130"),
        xaxis=dict(gridcolor="#2d3348", showgrid=True),
        yaxis=dict(gridcolor="#2d3348", showgrid=True, ticksuffix="%"),
        margin=dict(l=10, r=10, t=50, b=10),
    )
    return fig


# ---------------------------------------------------------------------------
# Production Gantt Chart
# ---------------------------------------------------------------------------

def render_gantt(df: pd.DataFrame) -> go.Figure:
    """Return a Plotly Gantt / timeline chart for production orders.

    Expected DataFrame columns:
      - task / process_name : row label
      - start / planned_start : datetime-like
      - end / planned_end    : datetime-like
      - status               : string (used for colour)
    Optional:
      - project_name         : used as facet label
    """
    if df is None or df.empty:
        fig = go.Figure()
        fig.update_layout(
            title="생산 일정 간트 차트 (데이터 없음)",
            paper_bgcolor="#1e2130",
            plot_bgcolor="#1e2130",
            font_color="#9ba3af",
        )
        return fig

    # Normalise column names
    col_map: dict[str, str] = {}
    if "task" in df.columns:
        col_map["task"] = "task"
    elif "process_name" in df.columns:
        col_map["task"] = "process_name"
    else:
        df = df.copy()
        df["task"] = df.index.astype(str)
        col_map["task"] = "task"

    if "start" in df.columns:
        col_map["start"] = "start"
    elif "planned_start" in df.columns:
        col_map["start"] = "planned_start"
    else:
        col_map["start"] = df.columns[0]

    if "end" in df.columns:
        col_map["end"] = "end"
    elif "planned_end" in df.columns:
        col_map["end"] = "planned_end"
    else:
        col_map["end"] = df.columns[1]

    status_col = "status" if "status" in df.columns else None

    color_map = {
        "completed": "#2ecc71",
        "in_progress": "#4f8ef7",
        "pending": "#9ba3af",
        "delayed": "#e74c3c",
        "on_hold": "#f39c12",
    }

    fig = px.timeline(
        df,
        x_start=col_map["start"],
        x_end=col_map["end"],
        y=col_map["task"],
        color=status_col,
        color_discrete_map=color_map,
        title="생산 일정 간트 차트",
        labels={
            col_map["task"]: "공정",
            col_map["start"]: "시작",
            col_map["end"]: "종료",
            "status": "상태",
        },
    )
    fig.update_yaxes(autorange="reversed")
    fig.update_layout(
        height=400,
        paper_bgcolor="#1e2130",
        plot_bgcolor="#151822",
        font_color="#f0f2f6",
        legend=dict(bgcolor="#1e2130", title_text="상태"),
        xaxis=dict(gridcolor="#2d3348"),
        margin=dict(l=10, r=10, t=50, b=10),
    )
    return fig


# ---------------------------------------------------------------------------
# FAT Pie Chart (kept for backward compatibility)
# ---------------------------------------------------------------------------

def fat_pie_chart(summary: dict) -> go.Figure:
    """Pie chart for FAT pass/fail/pending distribution."""
    fig = px.pie(
        names=list(summary.keys()),
        values=list(summary.values()),
        title="FAT 검사 결과",
        color_discrete_map={
            "pass": "#2ecc71",
            "fail": "#e74c3c",
            "pending": "#f39c12",
            "waived": "#95a5a6",
        },
        hole=0.4,
    )
    fig.update_layout(
        height=300,
        paper_bgcolor="#1e2130",
        font_color="#f0f2f6",
        legend=dict(bgcolor="#1e2130"),
        margin=dict(l=10, r=10, t=50, b=10),
    )
    return fig


# ---------------------------------------------------------------------------
# SHAP Feature Importance Bar Chart
# ---------------------------------------------------------------------------

def render_shap_bar(features: list[str], shap_values: list[float]) -> go.Figure:
    """Horizontal bar chart of SHAP feature contributions."""
    df = pd.DataFrame({"feature": features, "shap": shap_values})
    df = df.sort_values("shap", key=abs, ascending=True)

    colors = ["#e74c3c" if v > 0 else "#4f8ef7" for v in df["shap"]]

    fig = go.Figure(
        go.Bar(
            x=df["shap"],
            y=df["feature"],
            orientation="h",
            marker_color=colors,
            text=[f"{v:+.3f}" for v in df["shap"]],
            textposition="outside",
        )
    )
    fig.update_layout(
        title="AI 예측 기여도 (SHAP)",
        height=max(250, len(features) * 36),
        paper_bgcolor="#1e2130",
        plot_bgcolor="#151822",
        font_color="#f0f2f6",
        xaxis=dict(gridcolor="#2d3348", zeroline=True, zerolinecolor="#6b7280"),
        yaxis=dict(gridcolor="#2d3348"),
        margin=dict(l=10, r=60, t=50, b=10),
    )
    return fig


# ---------------------------------------------------------------------------
# Defect Bar Chart (by category)
# ---------------------------------------------------------------------------

def render_defect_bar(df: pd.DataFrame) -> go.Figure:
    """Bar chart of defect counts by category/test item."""
    if df is None or df.empty:
        fig = go.Figure()
        fig.update_layout(
            title="불량 유형 분포 (데이터 없음)",
            paper_bgcolor="#1e2130",
            font_color="#9ba3af",
        )
        return fig

    cat_col = next((c for c in ["category", "test_item", "defect_type"] if c in df.columns), df.columns[0])
    val_col = next((c for c in ["count", "quantity", "value"] if c in df.columns), df.columns[-1])

    fig = px.bar(
        df,
        x=cat_col,
        y=val_col,
        title="불량 유형 분포",
        color=val_col,
        color_continuous_scale=["#4f8ef7", "#f39c12", "#e74c3c"],
        labels={cat_col: "유형", val_col: "건수"},
    )
    fig.update_layout(
        height=300,
        paper_bgcolor="#1e2130",
        plot_bgcolor="#151822",
        font_color="#f0f2f6",
        showlegend=False,
        xaxis=dict(gridcolor="#2d3348"),
        yaxis=dict(gridcolor="#2d3348"),
        margin=dict(l=10, r=10, t=50, b=10),
    )
    return fig
