import { useState } from "react";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const API_KEY = "YOUR_KEY_HERE";

const SCORE_COLORS = {
  hot: { bg: "#FF4500", text: "#fff", label: "🔥 HOT" },
  warm: { bg: "#FF8C00", text: "#fff", label: "⚡ WARM" },
  cold: { bg: "#1a3a5c", text: "#7ab3d4", label: "❄️ COLD" },
};

function getTier(score) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

function ScoreBar({ score }) {
  const color = score >= 70 ? "#FF4500" : score >= 40 ? "#FF8C00" : "#1a5c8c";
  return (
    <div style={{ background: "#0a1628", borderRadius: 4, height: 6, width: "100%", marginTop: 6 }}>
      <div
        style={{
          width: `${score}%`,
          height: "100%",
          background: color,
          borderRadius: 4,
          transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 8px ${color}88`,
        }}
      />
    </div>
  );
}

export default function LeadScorer() {
  const [input, setInput] = useState("");
  const [niche, setNiche] = useState("Roofing");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const niches = ["Roofing", "HVAC", "Solar", "Plumbing", "Landscaping", "Painting", "General Contractor"];

  async function scoreLeads() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);

    const prompt = `You are a lead scoring expert for ${niche} companies. 

Score each of the following leads from 0-100 based on how likely they are to need and buy ${niche} services. Consider signals like: business type, location, size, how established they are, and any other relevant context.

Leads to score:
${input}

Return ONLY a valid JSON array. No markdown, no explanation, just the JSON array.
Each object must have exactly these fields:
- "name": string (lead name or company)
- "score": number (0-100)  
- "reason": string (1 sharp sentence explaining the score)

Example format:
[{"name":"ABC Roofing","score":82,"reason":"Established contractor likely to need materials and subcontractors."}]`;

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const sorted = parsed.sort((a, b) => b.score - a.score);
      setResults(sorted);
    } catch (e) {
      setError("Couldn't parse results. Make sure each lead is on its own line.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060d1a",
      fontFamily: "'Courier New', monospace",
      color: "#c9dff0",
      padding: "0",
    }}>
      <div style={{
        borderBottom: "1px solid #0f2744",
        padding: "28px 40px 24px",
        background: "linear-gradient(180deg, #080f1f 0%, #060d1a 100%)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          width: 42, height: 42,
          background: "linear-gradient(135deg, #FF4500, #FF8C00)",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          boxShadow: "0 0 20px #FF450055",
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: "#fff" }}>LEADSCORE AI</div>
          <div style={{ fontSize: 11, color: "#4a7fa8", letterSpacing: 3, marginTop: 2 }}>INTELLIGENT PROSPECT RANKING</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
          <span style={{ fontSize: 11, color: "#4a7fa8", letterSpacing: 2 }}>SYSTEM ACTIVE</span>
        </div>
      </div>

      <div style={{ padding: "36px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: 3, color: "#4a7fa8", display: "block", marginBottom: 8 }}>
              PASTE LEADS (one per line)
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"John Smith - ABC Construction, Vancouver\nSunrise Roofing, North Shore\nMike Johnson - 15yr contractor, Burnaby"}
              rows={6}
              style={{
                width: "100%",
                background: "#080f1f",
                border: "1px solid #0f2744",
                borderRadius: 6,
                padding: "14px 16px",
                color: "#c9dff0",
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, letterSpacing: 3, color: "#4a7fa8", display: "block", marginBottom: 8 }}>
              NICHE
            </label>
            <select
              value={niche}
              onChange={e => setNiche(e.target.value)}
              style={{
                width: "100%",
                background: "#080f1f",
                border: "1px solid #0f2744",
                borderRadius: 6,
                padding: "14px 16px",
                color: "#c9dff0",
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={scoreLeads}
              disabled={loading || !input.trim()}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "14px",
                background: loading ? "#0f2744" : "linear-gradient(135deg, #FF4500, #FF8C00)",
                border: "none",
                borderRadius: 6,
                color: loading ? "#4a7fa8" : "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                letterSpacing: 3,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 0 20px #FF450055",
              }}
            >
              {loading ? "ANALYZING..." : "RUN SCORE"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#ff4444", fontSize: 12, marginBottom: 16, padding: "10px 14px", background: "#1a0808", borderRadius: 6, border: "1px solid #440000" }}>
            ⚠ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a7fa8", animation: "pulse 1.5s infinite" }}>
              ◈ SCORING LEADS ◈
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a7fa8" }}>
                RESULTS — {results.length} LEADS RANKED
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {["hot","warm","cold"].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SCORE_COLORS[t].bg }} />
                    <span style={{ fontSize: 10, letterSpacing: 2, color: "#4a7fa8" }}>{t.toUpperCase()} {results.filter(r => getTier(r.score) === t).length}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((lead, i) => {
                const tier = getTier(lead.score);
                const tc = SCORE_COLORS[tier];
                return (
                  <div
                    key={i}
                    style={{
                      background: "#080f1f",
                      border: `1px solid ${tier === "hot" ? "#FF450033" : tier === "warm" ? "#FF8C0033" : "#0f2744"}`,
                      borderRadius: 8,
                      padding: "16px 20px",
                      display: "grid",
                      gridTemplateColumns: "28px 1fr auto",
                      gap: 16,
                      alignItems: "start",
                      animation: `fadeIn 0.4s ease ${i * 0.07}s both`,
                    }}
                  >
                    <div style={{ color: "#4a7fa8", fontSize: 12, fontWeight: 700, paddingTop: 2 }}>#{i + 1}</div>
                    <div>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{lead.name}</div>
                      <div style={{ color: "#7ab3d4", fontSize: 12, lineHeight: 1.5 }}>{lead.reason}</div>
                      <ScoreBar score={lead.score} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: tc.bg,
                        textShadow: `0 0 15px ${tc.bg}88`,
                        lineHeight: 1,
                      }}>{lead.score}</div>
                      <div style={{
                        fontSize: 9,
                        letterSpacing: 2,
                        color: tc.bg,
                        marginTop: 6,
                        background: `${tc.bg}22`,
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: `1px solid ${tc.bg}44`,
                      }}>{tc.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        textarea:focus { border-color: #1a4a7a !important; }
        select option { background: #080f1f; }
      `}</style>
    </div>
  );
}