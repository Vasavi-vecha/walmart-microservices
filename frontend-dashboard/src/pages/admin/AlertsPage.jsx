// src/pages/admin/AlertsPage.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { useAppContext } from "../../context/AppContext"; // 👈 1. Bring in the central context hook

function AlertsPage() {
  // Extract custom local simulation warnings from AuthContext
  const { alerts: authAlerts, resolveAlert } = useAuth();
  
  // 👈 2. Extract live low stock notifications directly from the primary AppContext
  const { state, dispatch } = useAppContext();
  const { alerts: appAlerts } = state;

  // 👈 3. Merge both stream variables together into a single master loop array
  const combinedAlerts = [...appAlerts, ...authAlerts];

  const [actioningId, setActioningId] = useState(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState([]);

  function acknowledgeAlert(alertId) {
    setAcknowledgedIds((prev) => [...prev, alertId]);
    
    // Also update central context state if it belongs to the global store reducer
    dispatch({ type: "ACKNOWLEDGE_ALERT", payload: alertId });
    
    alert("Alert has been acknowledged successfully!");
  }

  async function handleResolveClick(alertId) {
    setActioningId(alertId);
    
    // Resolve inside local auth simulation states
    resolveAlert(alertId); 
    
    // Resolve inside global AppContext state engines
    dispatch({ type: "RESOLVE_ALERT", payload: alertId });

    setActioningId(null);
  }

  // Filter view state to display only unresolved alerts across both frameworks
  const activeAlerts = combinedAlerts.filter(a => !a.resolved);

  return (
    <div className="page-wrapper">
      <section className="panel panel-wide">
        <p className="section-label">Alerts</p>
        <h3>Smart Alerts</h3>
        <p className="section-text">
          Monitor operational issues, inventory risk, and smart incident signals (Auto-refreshing).
        </p>

        {activeAlerts.length === 0 ? (
          <div className="empty-box">
            <h3>No alerts available</h3>
            <p>New alerts will appear here when system thresholds are crossed.</p>
          </div>
        ) : (
          <div className="alerts-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {activeAlerts.map((alert) => {
              const isAcknowledged = acknowledgedIds.includes(alert.id) || alert.acknowledged;
              
              // Handle mapping fallback keys gracefully between both schema types
              const alertSeverity = alert.severity || alert.type || "WARNING";
              const alertTitle = alert.title || alert.service || "System Event Signal";
              const alertMessage = alert.description || alert.message || "Threshold status updated.";
              const alertSource = alert.source || alert.service || "System Core";
              const alertCategory = alert.category || "Security";
              const alertTime = alert.time || alert.timestamp || "Just now";

              // Visual styling color map switcher
              const isCritical = alertSeverity === "Critical" || alertSeverity === "INCIDENT";

              return (
                <article className="alert-card" key={alert.id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "20px", borderRadius: "8px", textAlign: "left" }}>
                  <div className="alert-card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ textAlign: "left" }}>
                      <p className="section-label" style={{ color: isCritical ? "#ef4444" : "#ff9f00", fontWeight: "bold", margin: 0, textTransform: "uppercase" }}>
                        {alertSeverity}
                      </p>
                      <h4 style={{ margin: "4px 0", textAlign: "left", color: "#0f172a", fontSize: "16px", fontWeight: "600" }}>
                        {alertTitle}
                      </h4>
                    </div>

                    <div className="alert-badge-group" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="severity-badge" style={{ background: isCritical ? "#fee2e2" : "#fffbeb", color: isCritical ? "#b91c1c" : "#b45309", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                        {alertSeverity}
                      </span>

                      <span className={`small-badge ${isAcknowledged ? "neutral" : "danger"}`} style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: isAcknowledged ? "#e2e8f0" : "#fee2e2", color: isAcknowledged ? "#475569" : "#b91c1c" }}>
                        {isAcknowledged ? "Acknowledged" : "Open"}
                      </span>
                    </div>
                  </div>

                  <p className="alert-description" style={{ margin: "12px 0", color: "#334155", textAlign: "left", fontSize: "14px", lineHeight: "20px" }}>
                    {alertMessage}
                  </p>

                  <div className="alert-meta-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                    <div style={{ textAlign: "left" }}>
                      <p className="mobile-order-label" style={{ margin: "0 0 4px 0", color: "#64748b", fontWeight: "bold" }}>Source</p>
                      <span style={{ color: "#334155" }}>{alertSource}</span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p className="mobile-order-label" style={{ margin: "0 0 4px 0", color: "#64748b", fontWeight: "bold" }}>Category</p>
                      <span style={{ color: "#334155" }}>{alertCategory}</span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p className="mobile-order-label" style={{ margin: "0 0 4px 0", color: "#64748b", fontWeight: "bold" }}>Time</p>
                      <span style={{ color: "#334155" }}>{alertTime}</span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p className="mobile-order-label" style={{ margin: "0 0 4px 0", color: "#64748b", fontWeight: "bold" }}>Status</p>
                      <span style={{ color: "#334155" }}>{isAcknowledged ? "Acknowledged" : "Open"}</span>
                    </div>
                  </div>

                  <div className="alert-actions" style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-start" }}>
                    <button
                      className="ghost-btn"
                      onClick={() => acknowledgeAlert(alert.id)}
                      disabled={isAcknowledged || actioningId === alert.id}
                      style={{ padding: "8px 16px", cursor: isAcknowledged ? "not-allowed" : "pointer", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px" }}
                    >
                      {isAcknowledged ? "Acknowledged" : "Acknowledge"}
                    </button>

                    <button
                      className="primary-btn"
                      onClick={() => handleResolveClick(alert.id)}
                      disabled={actioningId === alert.id}
                      style={{ padding: "8px 16px", cursor: "pointer", background: "#ff9f00", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "13px" }}
                    >
                      {actioningId === alert.id ? "Syncing..." : "Resolve"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AlertsPage;