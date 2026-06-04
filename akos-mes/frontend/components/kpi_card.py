"""KPI Card component for Akos AI MES — manufacturing-floor style metrics."""

import streamlit as st


def render_kpi_card(title: str, value, delta=None, color: str = "#1f77b4", help_text: str = ""):
    """Render a styled KPI metric card.

    Parameters
    ----------
    title : str
        Card label shown above the value.
    value : str | int | float
        Primary metric value (already formatted as desired).
    delta : str | int | float | None
        Change indicator shown below the value (positive = green, negative = red).
    color : str
        Accent hex colour for the top border stripe.
    help_text : str
        Tooltip text shown on hover.
    """
    # CSS injected once per session via a hidden div keyed to the colour so
    # multiple cards with different accent colours all work.
    border_css = f"""
    <style>
    .kpi-card-{color.replace('#', '')} {{
        border-top: 4px solid {color};
        border-radius: 8px;
        padding: 12px 16px 8px 16px;
        background: #1e2130;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        margin-bottom: 4px;
    }}
    .kpi-title {{
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #9ba3af;
        margin-bottom: 4px;
    }}
    .kpi-value {{
        font-size: 2rem;
        font-weight: 700;
        color: #f0f2f6;
        line-height: 1.15;
    }}
    .kpi-delta-pos {{ color: #2ecc71; font-size: 0.82rem; font-weight: 600; }}
    .kpi-delta-neg {{ color: #e74c3c; font-size: 0.82rem; font-weight: 600; }}
    .kpi-delta-neu {{ color: #9ba3af; font-size: 0.82rem; }}
    </style>
    """

    # Determine delta display
    delta_html = ""
    if delta is not None:
        try:
            num = float(str(delta).replace("%", "").replace("+", ""))
            if num > 0:
                delta_html = f'<div class="kpi-delta-pos">▲ {delta}</div>'
            elif num < 0:
                delta_html = f'<div class="kpi-delta-neg">▼ {delta}</div>'
            else:
                delta_html = f'<div class="kpi-delta-neu">— {delta}</div>'
        except ValueError:
            delta_html = f'<div class="kpi-delta-neu">{delta}</div>'

    title_attr = f' title="{help_text}"' if help_text else ""
    card_class = f"kpi-card-{color.replace('#', '')}"

    html = f"""
    {border_css}
    <div class="{card_class}"{title_attr}>
        <div class="kpi-title">{title}</div>
        <div class="kpi-value">{value}</div>
        {delta_html}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)
