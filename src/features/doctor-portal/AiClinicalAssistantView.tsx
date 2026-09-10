"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  History,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Brain,
} from "lucide-react";
import clsx from "clsx";
import styles from "./AiClinicalAssistantView.module.css";

const SUGGESTED_QUERIES = [
  "Summarize the patient's fall-risk history.",
  "Are there any potential drug interactions with this medication?",
  "How has medication adherence changed over the last six months?",
  "Summarize recent cognitive changes.",
];

export function AiClinicalAssistantView() {
  const {
    assistantQueries,
    isAiProcessing,
    activeQueryTraceStep,
    askAssistant,
    openEvidenceDrawer,
    selectedPatient,
  } = useDoctorStore();

  const [inputQuery, setInputQuery] = React.useState("");

  const handleRunQuery = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isAiProcessing) return;
    setInputQuery("");
    await askAssistant(text);
  };

  const latestQuery = assistantQueries[0];

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <Sparkles size={22} color="#67B8BA" />
            <span>AI Clinical Decision Support Assistant</span>
          </h1>
          <p className={styles.subheading}>
            Evidence-grounded natural-language query interface for {selectedPatient.name}
          </p>
        </div>

        <div className={styles.disclaimerBanner}>
          <AlertCircle size={16} />
          <span>AI output is decision support and does not constitute a diagnosis.</span>
        </div>
      </section>

      {/* Query Input Box & Suggested Chips */}
      <section className={styles.inputCard}>
        <form
          className={styles.inputForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery();
          }}
        >
          <input
            type="text"
            className={styles.queryInput}
            placeholder="Ask a clinical question (e.g., 'Summarize recent fall cluster and medication correlations')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAiProcessing}
          />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!inputQuery.trim() || isAiProcessing}
          >
            {isAiProcessing ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Ask</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>Suggested Clinical Prompts:</span>
          {SUGGESTED_QUERIES.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              className={styles.promptChip}
              onClick={() => handleRunQuery(prompt)}
              disabled={isAiProcessing}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* 5-Layer AI Orchestration Workflow Visualization */}
      {(isAiProcessing || latestQuery) && (
        <section className={styles.orchestrationTraceCard} aria-label="AI Orchestration Workflow">
          <div className={styles.traceHeader}>
            <div className={styles.traceTitle}>
              <Brain size={16} color="#67B8BA" />
              <span>5-Layer Multi-Agent Clinical Workflow</span>
            </div>

            {isAiProcessing ? (
              <span style={{ fontSize: "12px", color: "#67B8BA", fontWeight: 700 }}>
                Processing Stage {activeQueryTraceStep} of 5...
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: "#4E8B72", fontWeight: 700 }}>
                ✓ Complete Multi-Agent Trace Synthesized
              </span>
            )}
          </div>

          <div className={styles.traceStepsGrid}>
            <div
              className={clsx(
                styles.stepBox,
                (isAiProcessing && activeQueryTraceStep >= 1) || (!isAiProcessing && styles.stepBoxActive)
              )}
            >
              <span className={styles.stepNumber}>Layer 1</span>
              <span className={styles.stepName}>Intake & Query</span>
              <span style={{ color: "#68717C" }}>Parsed semantic clinical intent</span>
            </div>

            <div
              className={clsx(
                styles.stepBox,
                (isAiProcessing && activeQueryTraceStep >= 2) || (!isAiProcessing && styles.stepBoxActive)
              )}
            >
              <span className={styles.stepNumber}>Layer 2</span>
              <span className={styles.stepName}>Retrieval Agent</span>
              <span style={{ color: "#68717C" }}>Multi-source EHR & logs scanned</span>
            </div>

            <div
              className={clsx(
                styles.stepBox,
                (isAiProcessing && activeQueryTraceStep >= 3) || (!isAiProcessing && styles.stepBoxActive)
              )}
            >
              <span className={styles.stepNumber}>Layer 3</span>
              <span className={styles.stepName}>Polypharmacy Agent</span>
              <span style={{ color: "#68717C" }}>Beers Criteria & interactions evaluated</span>
            </div>

            <div
              className={clsx(
                styles.stepBox,
                (isAiProcessing && activeQueryTraceStep >= 4) || (!isAiProcessing && styles.stepBoxActive)
              )}
            >
              <span className={styles.stepNumber}>Layer 4</span>
              <span className={styles.stepName}>Decline Trajectory</span>
              <span style={{ color: "#68717C" }}>Digital twin deviations correlated</span>
            </div>

            <div
              className={clsx(
                styles.stepBox,
                (isAiProcessing && activeQueryTraceStep >= 5) || (!isAiProcessing && styles.stepBoxActive)
              )}
            >
              <span className={styles.stepNumber}>Layer 5</span>
              <span className={styles.stepName}>Synthesis Agent</span>
              <span style={{ color: "#68717C" }}>Source-grounded answer generated</span>
            </div>
          </div>
        </section>
      )}

      {/* Latest AI Synthesis Result */}
      {latestQuery && (
        <article className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <span style={{ fontSize: "12px", color: "#68717C", fontWeight: 700 }}>
                Doctor Question ({latestQuery.timestamp}):
              </span>
              <h2 className={styles.queryEcho}>"{latestQuery.query}"</h2>
            </div>
          </div>

          <div className={styles.answerBox}>
            <p style={{ margin: 0 }}>{latestQuery.answer}</p>
          </div>

          {/* Source-Backed Citations */}
          <div className={styles.citationsArea}>
            <h3 className={styles.citationsTitle}>Supporting Evidentiary Sources</h3>
            <div className={styles.citationsList}>
              {latestQuery.sourceReferences.map((ref, rIdx) => (
                <div key={rIdx} className={styles.citationCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#122544" }}>{ref.title}</span>
                    <span style={{ fontSize: "11px", color: "#68717C" }}>{ref.date}</span>
                  </div>
                  <p style={{ margin: 0, fontStyle: "italic", color: "#4B5563" }}>
                    "{ref.quote}"
                  </p>
                  <button
                    type="button"
                    style={{
                      marginTop: "4px",
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#67B8BA",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onClick={() => openEvidenceDrawer(ref.evidenceId || "ev-rx-zolpidem-01")}
                  >
                    <FileText size={11} />
                    <span>[Inspect Source Provenance]</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>
      )}

      {/* Query History for Audit Purposes */}
      <section className={styles.historySection} aria-labelledby="query-history-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <History size={16} color="#122544" />
            <h2 id="query-history-heading" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#122544" }}>
              Clinical Query History (Audited)
            </h2>
          </div>
          <span style={{ fontSize: "12px", color: "#68717C" }}>
            All queries logged for clinical compliance
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {assistantQueries.slice(1).map((q) => (
            <div
              key={q.id}
              style={{
                background: "#fbfbf9",
                border: "1px solid #eef2f1",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#122544" }}>{q.query}</div>
                <div style={{ fontSize: "12px", color: "#68717C", marginTop: "4px" }}>
                  {q.timestamp} • {q.sourceReferences.length} Source References
                </div>
              </div>

              <button
                type="button"
                style={{
                  background: "#ffffff",
                  border: "1px solid #dde2e1",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => handleRunQuery(q.query)}
              >
                Re-Run Query
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
