import { useState, useEffect } from "react";

const SCORE_DATA = {
  factors: [
    {
      id: "bilateral",
      label: "Bilateral operation",
      description: "Surgery performed on both sides",
      points: 2,
      or: "2.06",
      ci: "1.45–2.94",
      p: "<0.001",
    },
    {
      id: "minicraniotomy",
      label: "Minicraniotomy",
      description: "Rather than burr hole drainage",
      points: 2,
      or: "1.65",
      ci: "1.08–2.52",
      p: "0.021",
    },
    {
      id: "gcs_low",
      label: "Pre-operative GCS < 15",
      description: "Any reduction in consciousness level",
      points: 1,
      or: "1.55",
      ci: "1.11–2.15",
      p: "0.009",
    },
    {
      id: "short_symptoms",
      label: "Symptom duration ≤ 3 days",
      description: "Acute or rapidly progressive presentation",
      points: 1,
      or: "1.72",
      ci: "1.24–2.39",
      p: "0.001",
    },
    {
      id: "walking_aid",
      label: "Walking aid required",
      description: "Pre-morbid use of mobility aid",
      points: 1,
      or: "1.39",
      ci: "1.00–1.93",
      p: "0.051",
    },
    {
      id: "antiplatelet",
      label: "Antiplatelet therapy",
      description: "Aspirin, clopidogrel, or similar",
      points: 1,
      or: "1.34",
      ci: "0.94–1.91",
      p: "0.109",
    },
  ],
  risks: {
    0: { rate: 5.5, n: 289, events: 16 },
    1: { rate: 9.1, n: 386, events: 35 },
    2: { rate: 12.2, n: 393, events: 48 },
    3: { rate: 17.9, n: 234, events: 42 },
    4: { rate: 22.1, n: 163, events: 36 },
    5: { rate: 28.6, n: 63, events: 18, label: "5+" },
  },
  categories: {
    low: { label: "Low", range: "0–1", rate: 7.6, n: 675, events: 51 },
    moderate: { label: "Moderate", range: "2–3", rate: 14.4, n: 627, events: 90 },
    high: { label: "High", range: "4–8", rate: 23.9, n: 226, events: 54 },
  },
  performance: {
    auc: 0.653,
    auc_cv: 0.642,
    brier: 0.108,
    n: 1528,
    events: 195,
    hl_p: 0.985,
  },
};

function getRiskCategory(score) {
  if (score <= 1) return "low";
  if (score <= 3) return "moderate";
  return "high";
}

function getRiskColour(category) {
  const map = {
    low: { bg: "#e8f5e9", border: "#388e3c", text: "#1b5e20", accent: "#4caf50" },
    moderate: { bg: "#fff3e0", border: "#f57c00", text: "#e65100", accent: "#ff9800" },
    high: { bg: "#ffebee", border: "#d32f2f", text: "#b71c1c", accent: "#f44336" },
  };
  return map[category];
}

function GaugeChart({ score, maxScore = 8 }) {
  const category = getRiskCategory(score);
  const colours = getRiskColour(category);
  const riskData = SCORE_DATA.risks[Math.min(score, 5)];
  const riskPct = riskData ? riskData.rate : 0;

  const angle = -90 + (score / maxScore) * 180;
  const radius = 88;
  const cx = 120;
  const cy = 110;

  const segmentAngles = [
    { start: -90, end: -90 + (2 / maxScore) * 180, colour: "#4caf50" },
    { start: -90 + (2 / maxScore) * 180, end: -90 + (4 / maxScore) * 180, colour: "#ff9800" },
    { start: -90 + (4 / maxScore) * 180, end: 90, colour: "#f44336" },
  ];

  function arcPath(startAngle, endAngle, r) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  const needleRad = (angle * Math.PI) / 180;
  const needleLen = 70;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <svg viewBox="0 0 240 140" style={{ width: "100%", maxWidth: 320 }}>
      {segmentAngles.map((seg, i) => (
        <path
          key={i}
          d={arcPath(seg.start, seg.end, radius)}
          fill="none"
          stroke={seg.colour}
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.25"
        />
      ))}
      <path
        d={arcPath(-90, angle, radius)}
        fill="none"
        stroke={colours.accent}
        strokeWidth="16"
        strokeLinecap="round"
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={colours.text}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
      <circle cx={cx} cy={cy} r="5" fill={colours.text} />
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="22" fontWeight="700" fill={colours.text} fontFamily="'DM Serif Display', Georgia, serif">
        {riskPct}%
      </text>
      <text x={32} y={cy + 8} textAnchor="middle" fontSize="10" fill="#888" fontFamily="'Source Sans 3', sans-serif">
        0
      </text>
      <text x={208} y={cy + 8} textAnchor="middle" fontSize="10" fill="#888" fontFamily="'Source Sans 3', sans-serif">
        8
      </text>
    </svg>
  );
}

function BarDistribution({ score }) {
  const maxN = Math.max(...Object.values(SCORE_DATA.risks).map((r) => r.n));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
      {Object.entries(SCORE_DATA.risks).map(([s, data]) => {
        const isActive = parseInt(s) === Math.min(score, 5);
        const cat = getRiskCategory(parseInt(s));
        const colours = getRiskColour(cat);
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                width: 18,
                textAlign: "right",
                color: isActive ? colours.text : "#999",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {data.label || s}
            </span>
            <div
              style={{
                flex: 1,
                height: isActive ? 20 : 14,
                background: "#f0f0f0",
                borderRadius: 4,
                overflow: "hidden",
                transition: "height 0.3s",
              }}
            >
              <div
                style={{
                  width: `${(data.n / maxN) * 100}%`,
                  height: "100%",
                  background: isActive ? colours.accent : "#d0d0d0",
                  borderRadius: 4,
                  transition: "all 0.4s ease",
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                width: 50,
                color: isActive ? colours.text : "#999",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {data.rate}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CSDHReopeationScore() {
  const [selections, setSelections] = useState({});
  const [showMethodology, setShowMethodology] = useState(false);

  const score = SCORE_DATA.factors.reduce((sum, f) => {
    return sum + (selections[f.id] ? f.points : 0);
  }, 0);

  const category = getRiskCategory(score);
  const colours = getRiskColour(category);
  const catData = SCORE_DATA.categories[category];
  const riskData = SCORE_DATA.risks[Math.min(score, 5)];

  const toggle = (id) => {
    setSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      style={{
        fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
        maxWidth: 680,
        margin: "0 auto",
        padding: "24px 16px",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: "#1a1a2e",
            margin: "0 0 6px 0",
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}
        >
          CSDH Reoperation Risk Score
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#777",
            margin: 0,
            fontWeight: 300,
            letterSpacing: "0.3px",
          }}
        >
          Predicting return to theatre after chronic subdural haematoma evacuation
        </p>
      </div>

      {/* Risk Factors */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: "18px 16px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid #eee",
        }}
      >
        <h2
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "#999",
            margin: "0 0 14px 0",
          }}
        >
          Risk Factors
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SCORE_DATA.factors.map((factor) => {
            const isSelected = !!selections[factor.id];
            return (
              <button
                key={factor.id}
                onClick={() => toggle(factor.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: isSelected ? `2px solid ${getRiskColour(getRiskCategory(score)).accent}` : "2px solid transparent",
                  background: isSelected ? getRiskColour(getRiskCategory(score)).bg : "#f8f8f8",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    border: isSelected ? "none" : "2px solid #ccc",
                    background: isSelected ? getRiskColour(getRiskCategory(score)).accent : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSelected && (
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1 5L4.5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? "#1a1a2e" : "#444",
                      lineHeight: 1.3,
                    }}
                  >
                    {factor.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
                    {factor.description}
                  </div>
                </div>

                <div
                  style={{
                    background: isSelected ? getRiskColour(getRiskCategory(score)).accent : "#e0e0e0",
                    color: isSelected ? "white" : "#888",
                    borderRadius: 12,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  +{factor.points}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Panel */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: "20px 16px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: `2px solid ${colours.border}30`,
          transition: "border-color 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 48,
                  fontWeight: 400,
                  color: colours.text,
                  lineHeight: 1,
                  transition: "color 0.3s ease",
                }}
              >
                {score}
              </span>
              <span style={{ fontSize: 16, color: "#999" }}>/8</span>
            </div>

            <div
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: colours.bg,
                color: colours.text,
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.3s ease",
              }}
            >
              {catData.label} Risk ({catData.range})
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              Estimated reoperation rate:{" "}
              <strong style={{ color: colours.text, fontSize: 15, transition: "color 0.3s" }}>
                {riskData ? riskData.rate : "—"}%
              </strong>
              <br />
              <span style={{ fontSize: 12, color: "#888" }}>
                Based on {riskData ? riskData.events : 0}/{riskData ? riskData.n : 0} patients at score {score >= 5 ? "5+" : score}
              </span>
            </div>
          </div>

          <div style={{ width: 180, flexShrink: 0 }}>
            <GaugeChart score={score} />
          </div>
        </div>

        {/* Distribution */}
        <div style={{ marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#aaa",
              marginBottom: 6,
            }}
          >
            Score distribution (n = {SCORE_DATA.performance.n})
          </div>
          <BarDistribution score={score} />
        </div>
      </div>

      {/* Risk Category Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {Object.entries(SCORE_DATA.categories).map(([key, cat]) => {
          const c = getRiskColour(key);
          const isActive = key === category;
          return (
            <div
              key={key}
              style={{
                background: isActive ? c.bg : "white",
                border: isActive ? `2px solid ${c.border}` : "1px solid #eee",
                borderRadius: 10,
                padding: "12px 10px",
                textAlign: "center",
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 2px 8px ${c.accent}25` : "none",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? c.text : "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {cat.label}
              </div>
              <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>Score {cat.range}</div>
              <div
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22,
                  color: isActive ? c.text : "#bbb",
                  transition: "color 0.3s",
                }}
              >
                {cat.rate}%
              </div>
              <div style={{ fontSize: 10, color: "#aaa" }}>
                {cat.events}/{cat.n}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid #eee",
        }}
      >
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#999" }}>
            Methodology and Validation
          </span>
          <span
            style={{
              transform: showMethodology ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
              color: "#999",
              fontSize: 16,
            }}
          >
            ▼
          </span>
        </button>

        {showMethodology && (
          <div style={{ padding: "0 16px 18px", fontSize: 13, color: "#555", lineHeight: 1.7 }}>
            <div style={{ marginBottom: 14 }}>
              <strong style={{ color: "#333" }}>Study population:</strong> {SCORE_DATA.performance.n} patients with chronic subdural haematoma (CSDH) undergoing primary surgical evacuation across 6 hospitals. Overall reoperation rate: {((SCORE_DATA.performance.events / SCORE_DATA.performance.n) * 100).toFixed(1)}% ({SCORE_DATA.performance.events}/{SCORE_DATA.performance.n}).
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ color: "#333" }}>Derivation:</strong> Candidate predictors were screened through univariate analysis (chi-squared for categorical, Mann-Whitney U for continuous variables). Variables significant at p &lt; 0.1 were entered into multivariable logistic regression. Integer score weights were assigned proportional to the beta coefficients, with the smallest coefficient (~0.3) mapped to 1 point.
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ textAlign: "left", padding: "6px 4px", color: "#666" }}>Factor</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#666" }}>OR (95% CI)</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#666" }}>p</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#666" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_DATA.factors.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "6px 4px" }}>{f.label}</td>
                    <td style={{ textAlign: "center", padding: "6px 4px" }}>
                      {f.or} ({f.ci})
                    </td>
                    <td style={{ textAlign: "center", padding: "6px 4px" }}>{f.p}</td>
                    <td style={{ textAlign: "center", padding: "6px 4px", fontWeight: 600 }}>{f.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ color: "#333" }}>Discrimination:</strong> Apparent AUC {SCORE_DATA.performance.auc}, 10-fold cross-validated AUC {SCORE_DATA.performance.auc_cv}. Brier score {SCORE_DATA.performance.brier}.
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ color: "#333" }}>Calibration:</strong> Hosmer-Lemeshow goodness-of-fit test p = {SCORE_DATA.performance.hl_p}, indicating no significant lack of fit. Dual validation using both statsmodels and scikit-learn confirmed concordant coefficient estimates (maximum prediction difference &lt; 0.001).
            </div>

            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #ffe082",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#795548",
                lineHeight: 1.6,
              }}
            >
              <strong>Clinical note:</strong> This score is derived from a multicentre retrospective cohort and has not been externally validated. It is intended as a clinical adjunct to support decision-making, not to replace clinical judgement. The moderate discriminatory performance (AUC 0.64) reflects the multifactorial nature of CSDH recurrence. Prospective external validation is recommended before routine clinical use.
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 20, padding: "0 12px" }}>
        Derived from multicentre CSDH data (n = {SCORE_DATA.performance.n}) · For research purposes only
      </div>
    </div>
  );
}
