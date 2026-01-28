import React from "react";

export default function SummaryCard({ summary, downloadUrl }) {

  // Risk color mapping
  const riskColor = () => {
    const risk = summary.overall_risk?.toLowerCase();
    if (risk === "low") return "risk-low";
    if (risk === "medium") return "risk-medium";
    if (risk === "high") return "risk-high";
    return "risk-default";
  };

  // Compliance status text based on score
  const complianceText = () => {
    const score = summary.compliance_percent;
    if (score >= 90) return "Excellent Compliance";
    if (score >= 70) return "Good Compliance";
    return "Poor Compliance";
  };

  return (
    <div className="summary-page">
      <div className="summary-card">

        {/* Header */}
        <div className="summary-header">
          <div className="status-circle">
            <span className="status-check">✔</span>
          </div>
          <h2 className="summary-title">Inspection Complete</h2>
          <p className="summary-subtitle">
            Your GD&T drawing has been successfully analyzed
          </p>
        </div>

        <div className="divider"></div>

        {/* Summary List */}
        <div className="summary-list">
          <div className="summary-item">
            <span>Total Rules</span>
            <span className="summary-value">{summary.total_rules}</span>
          </div>
          <div className="summary-item">
            <span>Applicable Rules</span>
            <span className="summary-value">{summary.applicable_rules}</span>
          </div>
          <div className="summary-item">
            <span>Passed</span>
            <span className="summary-value">{summary.passed}</span>
          </div>
          <div className="summary-item">
            <span>Failed</span>
            <span className="summary-value">{summary.failed}</span>
          </div>
          <div className="summary-item">
            <span>Not Applicable</span>
            <span className="summary-value">{summary.not_applicable}</span>
          </div>
          <div className="summary-item">
            <span>Critical Issues</span>
            <span className="summary-value">{summary.critical_issues}</span>
          </div>
          <div className="summary-item">
            <span>Major Issues</span>
            <span className="summary-value">{summary.major_issues}</span>
          </div>
          <div className="summary-item">
            <span>Overall Risk</span>
            <span className={`summary-value ${riskColor()}`}>
              {summary.overall_risk}
            </span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Compliance Status */}
        <div className="score-section">
          <div className="score-title">Compliance Status</div>

          <div
            className="score-circle"
            style={{
              "--progress": summary.compliance_percent,
              "--progress-color": summary.compliance_percent >= 90 ? "#22c55e" :
                                  summary.compliance_percent >= 70 ? "#f59e0b" :
                                  "#ef4444",
            }}
          >
            <div className="score-text">{summary.compliance_percent}%</div>
          </div>

          <div className="score-subtitle">{complianceText()}</div>

          <a href={downloadUrl} className="download-btn">
            <span className="download-icon">⬇</span>
            Download Report
          </a>
        </div>
      </div>

      {/* ===== Issues Cards ===== */}
      {summary?.issues?.length > 0 && (
        <div className="issues-section">
          <h3 className="issues-title">Identified Issues</h3>

          <div className="issues-grid">
            {summary.issues.map((issue, index) => (
              <div className="issue-card" key={index}>
                <div className="issue-header">
                  Rule {issue.rule_id}
                </div>

                <div className="issue-body">
                  <div className="issue-block">
                    <span className="issue-label">Reason</span>
                    <p className="issue-text">{issue.reason}</p>
                  </div>

                  <div className="issue-block">
                    <span className="issue-label">Recommendation</span>
                    <p className="issue-text">{issue.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
