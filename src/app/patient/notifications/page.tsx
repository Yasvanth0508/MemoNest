"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  FileCheck,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import clsx from "clsx";
import { PatientPortalShell } from "@/components/patient";
import {
  patientPortalStore,
  PatientNotification,
} from "@/services/patient-portal.service";
import styles from "./notifications.module.css";

const CATEGORY_TABS = [
  { label: "All Alerts", value: "all" },
  { label: "Medication", value: "medication" },
  { label: "Appointments", value: "appointment" },
  { label: "Health Records", value: "health_record" },
  { label: "Consent & Privacy", value: "consent" },
  { label: "Caregiver", value: "caregiver" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<PatientNotification[]>(() =>
    patientPortalStore.getNotifications()
  );
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  React.useEffect(() => {
    const unsub = patientPortalStore.subscribe(() => {
      setNotifications([...patientPortalStore.getNotifications()]);
    });
    return unsub;
  }, []);

  const filteredNotifs = React.useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const handleMarkAsRead = (id: string) => {
    patientPortalStore.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    patientPortalStore.markAllNotificationsAsRead();
  };

  const handleReadAloud = (notif: PatientNotification) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `${notif.title}. ${notif.message}. Received ${notif.timeDisplay}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryIcon = (cat: PatientNotification["category"]) => {
    switch (cat) {
      case "medication":
        return <Pill size={26} />;
      case "appointment":
        return <Calendar size={26} />;
      case "health_record":
        return <FileCheck size={26} />;
      case "consent":
        return <ShieldCheck size={26} />;
      case "caregiver":
        return <HeartHandshake size={26} />;
      default:
        return <Bell size={26} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const speechSummary = `You are in your Notification Center. You have ${unreadCount} unread reminders, including your morning medication reminder and tomorrow's appointment with Dr. Rajesh Sharma.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              Gentle reminders about your medications, doctor visits, and health record updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={18} />
              <span>Mark All as Read</span>
            </button>
          )}
        </header>

        {/* Category Tabs */}
        <div className={styles.filterScrollRow} role="tablist" aria-label="Notification categories">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.value;
            const count =
              tab.value === "all"
                ? notifications.length
                : notifications.filter((n) => n.category === tab.value).length;

            return (
              <button
                key={tab.value}
                type="button"
                className={clsx(styles.filterChip, isActive && styles.filterChipActive)}
                onClick={() => setActiveCategory(tab.value)}
                role="tab"
                aria-selected={isActive}
              >
                <span>{tab.label}</span>
                <span style={{ opacity: 0.8, fontSize: "13px" }}> ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        {filteredNotifs.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DDE2E1",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <Bell size={48} color="#94A3B8" style={{ margin: "0 auto 16px auto" }} />
            <h2 style={{ fontSize: "22px", color: "#1E293B", margin: "0 0 8px 0" }}>
              All Caught Up!
            </h2>
            <p style={{ fontSize: "16px", color: "#64748B", margin: 0 }}>
              There are no new notifications in this category.
            </p>
          </div>
        ) : (
          <div className={styles.notifList} role="feed" aria-label="Notifications Feed">
            {filteredNotifs.map((notif) => {
              return (
                <article
                  key={notif.id}
                  className={clsx(
                    styles.notifCard,
                    !notif.isRead && styles.notifCardUnread
                  )}
                >
                  {!notif.isRead && <span className={styles.unreadDot} aria-label="Unread notification" />}

                  <div className={`${styles.iconBox} ${styles[`icon_${notif.category}`] || ""}`}>
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className={styles.notifContent}>
                    <div className={styles.notifHeader}>
                      <span className={styles.categoryTag}>
                        {notif.category.replace(/_/g, " ")}
                      </span>
                      <span className={styles[`severity_${notif.severity}`]}>
                        {notif.severity === "attention"
                          ? "Attention Needed"
                          : notif.severity === "gentle"
                          ? "Gentle Reminder"
                          : "Health Update"}
                      </span>
                      <span className={styles.timestamp}>• {notif.timeDisplay}</span>
                    </div>

                    <h2 className={styles.notifTitle}>{notif.title}</h2>
                    <p className={styles.notifMessage}>{notif.message}</p>

                    <div className={styles.actionsRow}>
                      {notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          className={styles.actionBtn}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <span>{notif.actionLabel || "View"}</span>
                          <ArrowRight size={16} />
                        </Link>
                      ) : (
                        notif.actionLabel && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              alert("Medication marked as completed for today!");
                            }}
                          >
                            <Check size={16} />
                            <span>{notif.actionLabel}</span>
                          </button>
                        )
                      )}

                      {!notif.isRead && (
                        <button
                          type="button"
                          className={styles.readBtn}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <Check size={16} />
                          <span>Mark as Read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className={styles.readBtn}
                        onClick={() => handleReadAloud(notif)}
                        aria-label="Read notification aloud"
                      >
                        <Volume2 size={16} />
                        <span>Listen Aloud</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PatientPortalShell>
  );
}
