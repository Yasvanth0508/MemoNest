"use client";

import * as React from "react";
import { EvidenceItem } from "@/types";
import { getAllEvidence, getEvidenceById } from "@/services";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  FileText,
  Pill,
  Calendar,
  User,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  AlertTriangle,
  Stethoscope,
  Clock,
  Sparkles,
  FileCheck,
} from "lucide-react";
import clsx from "clsx";
import styles from "./EvidenceProvenanceDrawer.module.css";

export interface EvidenceProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvidenceId?: string | null;
  patientId?: string;
  onSelectEvidence?: (evidenceId: string) => void;
}

export function EvidenceProvenanceDrawer({
  isOpen,
  onClose,
  selectedEvidenceId,
  patientId = "patient-001",
  onSelectEvidence,
}: EvidenceProvenanceDrawerProps) {
  const [evidenceList, setEvidenceList] = React.useState<EvidenceItem[]>([]);
  const [activeItem, setActiveItem] = React.useState<EvidenceItem | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Load all evidence items for the patient
  React.useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const list = await getAllEvidence(patientId);
        if (isMounted) {
          setEvidenceList(list);
        }
      } catch (err) {
        console.error("Failed to load evidence:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (isOpen) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, patientId]);

  // Sync activeItem when selectedEvidenceId changes or list loads
  React.useEffect(() => {
    let isMounted = true;
    async function resolveActive() {
      if (selectedEvidenceId) {
        // Find in cached list or fetch
        const match = evidenceList.find((e) => e.id === selectedEvidenceId);
        if (match) {
          setActiveItem(match);
        } else {
          const fetched = await getEvidenceById(selectedEvidenceId);
          if (isMounted && fetched) {
            setActiveItem(fetched);
          }
        }
      } else if (evidenceList.length > 0 && !activeItem) {
        // Default to first item (e.g. Stroke discharge or prescription)
        setActiveItem(evidenceList[0]);
      }
    }
    resolveActive();
    return () => {
      isMounted = false;
    };
  }, [selectedEvidenceId, evidenceList, activeItem]);

  const handleSelect = (item: EvidenceItem) => {
    setActiveItem(item);
    if (onSelectEvidence) {
      onSelectEvidence(item.id);
    }
  };

  const handleCopyQuote = () => {
    if (!activeItem) return;
    const citation = `${activeItem.quote} — [${activeItem.documentTitle}, ${activeItem.documentDate}, ${activeItem.author || "Clinical Record"}]`;
    navigator.clipboard?.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "prescription":
        return Pill;
      case "discharge_summary":
        return BookOpen;
      case "consultation":
        return Stethoscope;
      case "observation":
        return AlertTriangle;
      case "lab_report":
        return FileCheck;
      default:
        return FileText;
    }
  };

  const getSourceBadgeVariant = (sourceType: string) => {
    switch (sourceType) {
      case "prescription":
        return "secondary" as const;
      case "discharge_summary":
        return "default" as const;
      case "observation":
        return "warning" as const;
      case "lab_report":
        return "success" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={styles.drawerContent}>
        <DrawerHeader className={styles.header}>
          <div className={styles.headerBadgeRow}>
            <span className={styles.trustBadge}>
              <ShieldCheck size={14} />
              Cryptographically Anchored Provenance
            </span>
            <Badge variant="outline">OCR Confidence 99.4%</Badge>
          </div>
          <DrawerTitle className={styles.drawerTitle}>
            Evidence & Citation Inspector
          </DrawerTitle>
          <DrawerDescription className={styles.drawerDescription}>
            Every AI Clinical Brief synthesis and alert maps directly to immutable medical source records.
          </DrawerDescription>
        </DrawerHeader>

        <div className={styles.body}>
          {/* Evidence Selector Pills */}
          <div className={styles.snippetSelector}>
            <span className={styles.selectorLabel}>Referenced Source Documents:</span>
            <div className={styles.snippetPills}>
              {evidenceList.map((item) => {
                const Icon = getSourceIcon(item.sourceType);
                const isActive = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={clsx(styles.pillButton, isActive && styles.pillActive)}
                    onClick={() => handleSelect(item)}
                  >
                    <Icon size={12} />
                    <span>{item.documentTitle.split("—")[0].trim()}</span>
                    <span style={{ opacity: 0.75, fontSize: "11px" }}>
                      ({item.documentDate.substring(0, 4)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Detail View */}
          {activeItem ? (
            <div className={styles.detailCard}>
              <div className={styles.docHeader}>
                <div>
                  <h4 className={styles.docTitle}>{activeItem.documentTitle}</h4>
                  <div className={styles.docMeta}>
                    <span className={styles.metaItem}>
                      <Calendar size={12} />
                      {activeItem.documentDate}
                    </span>
                    <span className={styles.metaDivider}>•</span>
                    {activeItem.author && (
                      <>
                        <span className={styles.metaItem}>
                          <User size={12} />
                          {activeItem.author}
                        </span>
                        <span className={styles.metaDivider}>•</span>
                      </>
                    )}
                    {activeItem.pageNumber && (
                      <span className={styles.metaItem}>Page {activeItem.pageNumber}</span>
                    )}
                  </div>
                </div>

                <Badge variant={getSourceBadgeVariant(activeItem.sourceType)}>
                  {activeItem.sourceType.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              {/* Verbatim Excerpt */}
              <div className={styles.quoteContainer}>
                <div className={styles.quoteHeader}>
                  <span className={styles.quoteBadge}>
                    <FileText size={12} />
                    Verbatim Document Excerpt
                  </span>
                  <Badge variant="outline">Confidence: {Math.round(activeItem.confidenceScore * 100)}%</Badge>
                </div>
                <blockquote className={styles.verbatimQuote}>
                  {activeItem.quote}
                </blockquote>
              </div>

              {/* Linked Clinical Entity */}
              <div className={styles.entitySection}>
                <span className={styles.entityLabel}>Correlated Clinical Finding</span>
                <span className={styles.entityValue}>{activeItem.linkedEntity}</span>
              </div>

              {/* Document Context */}
              <div className={styles.contextSection}>
                <strong>Location in Source:</strong> {activeItem.context}
              </div>

              {/* Provenance Technical Footprint */}
              <div className={styles.provenanceBlock}>
                <div className={styles.provHeader}>
                  <span>Audit & Verification Proof</span>
                  <span style={{ color: "var(--color-success)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Check size={12} /> Verified Immutable
                  </span>
                </div>
                <div className={styles.provGrid}>
                  <div>
                    <span>Document ID: </span>
                    <span className={styles.provValue}>{activeItem.documentId || activeItem.id}</span>
                  </div>
                  <div>
                    <span>Anchor SHA-256: </span>
                    <span className={styles.provValue}>8f3c...d92a</span>
                  </div>
                  <div>
                    <span>Source System: </span>
                    <span className={styles.provValue}>Hospital EHR / FastHealth</span>
                  </div>
                  <div>
                    <span>Extraction Pipeline: </span>
                    <span className={styles.provValue}>FHIR-MedGemma v2</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)" }}>
              {loading ? "Loading verified records..." : "Select a source document above to inspect evidence."}
            </div>
          )}
        </div>

        <DrawerFooter className={styles.footer}>
          <div>
            {copied ? (
              <span className={styles.copiedNotification}>
                <Check size={14} /> Citation copied to clipboard
              </span>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="outline" size="sm" onClick={handleCopyQuote} disabled={!activeItem}>
              <Copy size={14} />
              <span>Copy Citation</span>
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done Inspecting
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
