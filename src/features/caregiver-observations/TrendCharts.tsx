"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  Activity,
  Brain,
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  Stethoscope,
  ClipboardEdit,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import styles from "./TrendCharts.module.css";

// 30-Day Fall & Near-Miss Timeline Data
const FALL_DATA = [
  { period: "Aug 11-17", falls: 0, nearMisses: 0, safeDays: 7 },
  { period: "Aug 18-24", falls: 0, nearMisses: 1, safeDays: 6 },
  { period: "Aug 25-31", falls: 0, nearMisses: 0, safeDays: 7 },
  { period: "Sep 01-07", falls: 0, nearMisses: 1, safeDays: 6 },
  { period: "Sep 08-10 (Current)", falls: 2, nearMisses: 2, safeDays: 1 },
];

// Mobility Stability Index (10 = Independent, 0 = Maximum Total Dependent)
const MOBILITY_DATA = [
  { date: "Aug 12", score: 8.5, assistMinutes: 15 },
  { date: "Aug 18", score: 8.2, assistMinutes: 20 },
  { date: "Aug 25", score: 7.8, assistMinutes: 25 },
  { date: "Aug 30", score: 7.0, assistMinutes: 35 },
  { date: "Sep 04", score: 6.0, assistMinutes: 45 },
  { date: "Sep 07", score: 5.2, assistMinutes: 55 },
  { date: "Sep 09", score: 4.5, assistMinutes: 70 },
  { date: "Sep 10", score: 4.0, assistMinutes: 85 },
];

// Confusion occurrences over past 30 days: Morning vs Evening
const CONFUSION_DATA = [
  { week: "Week 1 (Aug 11)", morning: 0, evening: 1 },
  { week: "Week 2 (Aug 18)", morning: 0, evening: 1 },
  { week: "Week 3 (Aug 25)", morning: 1, evening: 1 },
  { week: "Week 4 (Sep 01)", morning: 1, evening: 2 },
  { week: "Week 5 (Sep 08)", morning: 3, evening: 1 },
];

// Category Volume breakdown
const CATEGORY_DISTRIBUTION = [
  { category: "Mobility", count: 8, fill: "#122544" },
  { category: "Meals/Water", count: 6, fill: "#4E8B72" },
  { category: "Drowsiness", count: 5, fill: "#B58A43" },
  { category: "Medication", count: 5, fill: "#67B8BA" },
  { category: "Confusion", count: 4, fill: "#5F8FA0" },
  { category: "Falls", count: 2, fill: "#A85D58" },
];

// Recent Changes Recap
const RECENT_CHANGES = [
  {
    date: "Sep 10, 2026 (08:30)",
    category: "Fall Incident",
    event: "Bed-to-chair transfer fall, right knee contusion",
    caregiver: "Anita Desai",
    action: "Assisted onto chair, cold pack applied, daughter Priya alerted",
    severity: "critical",
  },
  {
    date: "Sep 09, 2026 (07:15)",
    category: "Fall Incident",
    event: "Unassisted bathroom transit fall with morning confusion",
    caregiver: "Anita Desai",
    action: "Safely helped up, oriented to room, vital signs checked",
    severity: "high",
  },
  {
    date: "Sep 07, 2026 (14:00)",
    category: "Drowsiness",
    event: "Heavy post-lunch sedation following new sleep medication",
    caregiver: "Anita Desai",
    action: "Scheduled earlier afternoon rest, hydrated with electrolyte water",
    severity: "medium",
  },
  {
    date: "Sep 05, 2026 (09:30)",
    category: "Confusion",
    event: "Morning disorientation upon waking, temporary memory lapse",
    caregiver: "Anita Desai",
    action: "Reoriented with family photos, settled after 20 minutes",
    severity: "medium",
  },
  {
    date: "Sep 04, 2026 (15:45)",
    category: "Mobility",
    event: "Sit-to-stand transfer difficulty; knee stiffness",
    caregiver: "Anita Desai",
    action: "Assisted transfer, recommended high-firm chair with armrests",
    severity: "medium",
  },
  {
    date: "Aug 29, 2026 (08:15)",
    category: "Confusion",
    event: "Mild temporal disorientation regarding clinic schedule",
    caregiver: "Anita Desai",
    action: "Reviewed wall calendar, reassured patient",
    severity: "low",
  },
  {
    date: "Aug 25, 2026 (11:00)",
    category: "Mobility",
    event: "Completed 15-min hallway walk with walker steadily",
    caregiver: "Anita Desai",
    action: "Supervised walk, good tolerance without dizziness",
    severity: "low",
  },
];

export interface TrendChartsProps {
  patientName?: string;
  className?: string;
}

export function TrendCharts({
  patientName = "Ravi Kumar",
  className,
}: TrendChartsProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={clsx(styles.container, className)}>
      {/* Overview & Key Indicators Header */}
      <div className={styles.headerSummary}>
        <div className={styles.summaryTop}>
          <div className={styles.summaryTitleGroup}>
            <h2 className={styles.title}>30-Day Caregiver Trend Analytics</h2>
            <p className={styles.subtitle}>
              Structured longitudinal signals logged by Anita Desai for {patientName} (ID: patient-001)
            </p>
          </div>

          <Badge variant="danger">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={13} />
              Elevated Fall Alert Active
            </span>
          </Badge>
        </div>

        {/* 4 Metric Cards */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>
              <AlertTriangle size={14} style={{ color: "var(--color-danger)" }} />
              Fall Frequency (30 Days)
            </span>
            <span className={clsx(styles.kpiValue, styles.kpiValue_danger)}>
              2 Falls
            </span>
            <span className={styles.kpiFootnote}>
              Both within past 48 hours during morning transfers
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>
              <TrendingDown size={14} style={{ color: "var(--color-warning)" }} />
              Mobility Independence Index
            </span>
            <span className={clsx(styles.kpiValue, styles.kpiValue_warning)}>
              4.0 / 10
            </span>
            <span className={styles.kpiFootnote}>
              Down from 8.5 on Aug 12 (knee stiffness & transfer instability)
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>
              <Brain size={14} style={{ color: "var(--color-info)" }} />
              Morning Confusion Spikes
            </span>
            <span className={clsx(styles.kpiValue, styles.kpiValue_warning)}>
              3 Episodes
            </span>
            <span className={styles.kpiFootnote}>
              Correlating with new evening sedative started Sep 06
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>
              <Activity size={14} style={{ color: "var(--color-success)" }} />
              Total Logged Observations
            </span>
            <span className={clsx(styles.kpiValue, styles.kpiValue_success)}>
              30 Signals
            </span>
            <span className={styles.kpiFootnote}>
              100% verified audit trail with caregiver timestamps
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Chart 1: Fall Frequency & Incident Tracking */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartTitle}>
                <AlertTriangle size={18} style={{ color: "var(--color-danger)" }} />
                Fall Frequency & Near-Misses
              </h3>
              <p className={styles.chartSubtitle}>
                Weekly incident count: 2 falls documented in current week
              </p>
            </div>
            <Badge variant="danger">2 Recent Falls</Badge>
          </div>

          <div className={styles.chartContainer}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FALL_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="period" stroke="var(--color-text-secondary)" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="var(--color-text-secondary)" fontSize={11} domain={[0, 4]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="falls" name="Falls (Witnessed)" fill="#A85D58" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nearMisses" name="Near-Miss / Balance Loss" fill="#B58A43" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartFootnote}>
            <Info size={14} className={styles.footnoteIcon} />
            <span>
              Transfer falls occurred during unassisted bed-to-chair and bathroom transit.
            </span>
          </div>
        </div>

        {/* Chart 2: Mobility Assistance Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartTitle}>
                <Activity size={18} style={{ color: "var(--color-primary)" }} />
                Mobility Stability Index
              </h3>
              <p className={styles.chartSubtitle}>
                Progression from walker independence to hands-on transfer assistance
              </p>
            </div>
            <Badge variant="warning">Declining</Badge>
          </div>

          <div className={styles.chartContainer}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOBILITY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mobilityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#67B8BA" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#67B8BA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={11} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Mobility Score (10=Max)"
                    stroke="#122544"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mobilityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartFootnote}>
            <Info size={14} className={styles.footnoteIcon} />
            <span>
              Sharp drop correlates with knee stiffness reported on Sep 04 and sedation.
            </span>
          </div>
        </div>

        {/* Chart 3: Confusion Occurrences Over Past 30 Days */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartTitle}>
                <Brain size={18} style={{ color: "var(--color-info)" }} />
                Confusion Occurrences Over Past 30 Days
              </h3>
              <p className={styles.chartSubtitle}>
                Morning disorientation vs evening sundowning episodes
              </p>
            </div>
            <Badge variant="outline">Morning Shift Spike</Badge>
          </div>

          <div className={styles.chartContainer}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONFUSION_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--color-text-secondary)" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="var(--color-text-secondary)" fontSize={11} domain={[0, 4]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="morning" name="Morning Confusion" fill="#B58A43" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evening" name="Evening Disorientation" fill="#5F8FA0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartFootnote}>
            <Info size={14} className={styles.footnoteIcon} />
            <span>
              Morning episodes tripled in Week 5 after new sleep medication was introduced.
            </span>
          </div>
        </div>

        {/* Chart 4: Total Observation Category Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h3 className={styles.chartTitle}>
                <ClipboardEdit size={18} style={{ color: "var(--color-primary)" }} />
                Caregiver Signals Distribution
              </h3>
              <p className={styles.chartSubtitle}>
                Categorized signal volume logged over past 30 days
              </p>
            </div>
            <Badge variant="secondary">30 Total</Badge>
          </div>

          <div className={styles.chartContainer}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CATEGORY_DISTRIBUTION}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-text-secondary)" fontSize={11} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="var(--color-text-secondary)"
                    fontSize={11}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Logged Signals" radius={[0, 4, 4, 0]}>
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartFootnote}>
            <Info size={14} className={styles.footnoteIcon} />
            <span>
              Mobility and hydration tracking represent over 45% of daily caregiver logging.
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Summary and Recent Changes Recap */}
      <div className={styles.recapSection}>
        <div className={styles.recapHeader}>
          <h3 className={styles.recapTitle}>Weekly Summary & Clinical Handoff</h3>
          <Badge variant="warning">Review Urged: Dr. Sharma</Badge>
        </div>

        {/* Narrative Box */}
        <div className={styles.clinicalNarrative}>
          <strong>Caregiver Summary Report (Week of Sep 04 – Sep 10, 2026):</strong>
          <br />
          Patient Ravi Kumar demonstrated an acute deterioration in transfer stability over the past 72 hours, resulting in two witnessed falls on Sep 09 (hallway/bathroom entrance) and Sep 10 (bedside chair transfer). Concurrently, morning grogginess and temporary disorientation episodes have increased since Sep 06 following evening sedative medication initiation. Right knee stiffness remains a barrier to independent sit-to-stand maneuvers.
        </div>

        {/* Chronological Recent Changes Table */}
        <div className={styles.timelineTableWrapper}>
          <table className={styles.timelineTable}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Category</th>
                <th>Logged Event</th>
                <th>Caregiver Action Taken</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_CHANGES.map((item, idx) => (
                <tr key={idx}>
                  <td className={styles.dateCell}>{item.date}</td>
                  <td>
                    <Badge
                      variant={
                        item.severity === "critical"
                          ? "danger"
                          : item.severity === "high"
                          ? "warning"
                          : item.severity === "medium"
                          ? "warning"
                          : "default"
                      }
                    >
                      {item.category}
                    </Badge>
                  </td>
                  <td className={styles.eventCell}>{item.event}</td>
                  <td className={styles.actionCell}>{item.action}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color:
                          item.severity === "critical"
                            ? "var(--color-danger)"
                            : item.severity === "high"
                            ? "var(--color-danger)"
                            : item.severity === "medium"
                            ? "var(--color-warning)"
                            : "var(--color-success)",
                      }}
                    >
                      {item.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Prompt Callout */}
        <div className={styles.actionsCard}>
          <div className={styles.actionPrompt}>
            <span className={styles.actionPromptTitle}>
              Need to log a fresh observation or report an incident?
            </span>
            <p className={styles.actionPromptText}>
              Caregiver entries immediately feed the AI structuring pipeline and update clinical risk boards.
            </p>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Button variant="outline" asChild size="sm">
              <Link href="/caregiver">
                Return to Dashboard
              </Link>
            </Button>

            <Button variant="primary" asChild size="sm">
              <Link href="/caregiver/report">
                <ClipboardEdit size={16} style={{ marginRight: 6 }} />
                Log New Observation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
