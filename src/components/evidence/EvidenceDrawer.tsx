"use client";

import * as React from "react";
import { EvidenceItem } from "@/types";
import { evidenceService } from "@/services";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  FileSearch,
  Calendar,
  User,
  CheckCircle2,
  BookOpen,
  Quote,
  ShieldCheck,
  Layers,
} from "lucide-react";
import clsx from "clsx";
import styles from "./EvidenceDrawer.module.css";

export interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceId?: string | null;
  evidenceIds?: string[];
  initialEvidenceItem?: EvidenceItem | null;
  title?: string;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  evidenceId,
  evidenceIds,
  initialEvidenceItem,
  title = "Clinical Provenance & Evidence",
}: EvidenceDrawerProps) {
  const [items, setItems] = React.useState<EvidenceItem[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsLoading(true);

    async function loadEvidence() {
      try {
        if (initialEvidenceItem) {
          if (active) {
            setItems([initialEvidenceItem]);
            setSelectedIndex(0);
            setIsLoading(false);
          }
          return;
        }

        const idsToFetch: string[] = [];
        if (evidenceIds && evidenceIds.length > 0) {
          idsToFetch.push(...evidenceIds);
        } else if (evidenceId) {
          idsToFetch.push(evidenceId);
        }

        if (idsToFetch.length > 0) {
          const loadedItems: EvidenceItem[] = [];
          for (const id of idsToFetch) {
            const item = await evidenceService.getEvidenceById(id);
            if (item) loadedItems.push(item);
          }
          if (active) {
            setItems(loadedItems);
            setSelectedIndex(0);
            setIsLoading(false);
          }
        } else {
          if (active) {
            setItems([]);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error loading evidence:", err);
        if (active) setIsLoading(false);
      }
    }

    loadEvidence();

    return () => {
      active = false;
    };
  }, [isOpen, evidenceId, evidenceIds, initialEvidenceItem]);

  const currentItem = items[selectedIndex] || null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={styles.drawerContainer}>
        <DrawerHeader>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <FileSearch size={20} />
            </div>
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>
                Verified clinical documentation supporting AI insights
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className={styles.drawerBody}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton style={{ height: 40, width: "100%" }} />
              <Skeleton style={{ height: 120, width: "100%" }} />
              <Skeleton style={{ height: 80, width: "100%" }} />
            </div>
          ) : !currentItem ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-secondary)" }}>
              <BookOpen size={36} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
              <p>No verified evidence records found for this entry.</p>
            </div>
          ) : (
            <>
              {/* Multi-evidence Tabs */}
              {items.length > 1 && (
                <div className={styles.selectorSection}>
                  <div className={styles.selectorLabel}>
                    Cited Records ({items.length})
                  </div>
                  <div className={styles.snippetTabs}>
                    {items.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={clsx(
                          styles.snippetTab,
                          index === selectedIndex && styles.snippetTabActive
                        )}
                      >
                        Evidence #{index + 1}: {item.sourceType.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Card */}
              <div className={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <Badge variant="secondary">
                    {currentItem.sourceType.replace("_", " ").toUpperCase()}
                  </Badge>
                  <div className={styles.confidenceBadge}>
                    <CheckCircle2 size={13} />
                    <span>{Math.round(currentItem.confidenceScore * 100)}% Confidence</span>
                  </div>
                </div>

                <h4 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--color-primary)" }}>
                  {currentItem.documentTitle}
                </h4>

                {/* Quoted Provenance Extract */}
                <div className={styles.provenanceBlock}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--color-secondary)" }}>
                    <Quote size={14} />
                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>
                      Exact Verified Excerpt
                    </span>
                  </div>
                  <p className={styles.provenanceQuote}>{currentItem.quote}</p>
                </div>

                {/* Metadata Grid */}
                <div className={styles.metaGrid}>
                  <div className={styles.metaField}>
                    <span className={styles.metaLabel}>Document Date</span>
                    <span className={styles.metaValue}>
                      <Calendar size={13} />
                      {currentItem.documentDate}
                    </span>
                  </div>

                  {currentItem.author && (
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Clinician / Author</span>
                      <span className={styles.metaValue}>
                        <User size={13} />
                        {currentItem.author}
                      </span>
                    </div>
                  )}

                  {currentItem.pageNumber !== undefined && (
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Document Page</span>
                      <span className={styles.metaValue}>
                        Page {currentItem.pageNumber}
                      </span>
                    </div>
                  )}

                  <div className={styles.metaField}>
                    <span className={styles.metaLabel}>Linked Entity</span>
                    <span className={styles.entityTag}>
                      <Layers size={11} />
                      {currentItem.linkedEntity}
                    </span>
                  </div>
                </div>

                {/* Clinical Context */}
                {currentItem.context && (
                  <div className={styles.contextSection}>
                    <div className={styles.contextLabel}>Section / Clinical Context</div>
                    <div>{currentItem.context}</div>
                  </div>
                )}
              </div>

              {/* Compliance & Audit Notice */}
              <div className={styles.auditNotice}>
                <ShieldCheck size={16} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                <span>
                  Every clinical observation is linked to verifiable source documentation with tamper-resistant audit integrity.
                </span>
              </div>
            </>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Evidence
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
