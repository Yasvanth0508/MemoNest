import { SidebarSection } from "@/components/layout/Sidebar";
import {
  Activity,
  AlertTriangle,
  Clock,
  HeartHandshake,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Users,
} from "lucide-react";

export const PATIENT_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Patient Experience",
    items: [
      { label: "Patient Home", href: "/patient", icon: LayoutDashboard },
      { label: "Health Memory", href: "/patient/memory", icon: Activity },
      { label: "Timeline", href: "/patient/timeline", icon: Clock },
      {
        label: "Medications",
        href: "/patient/medications",
        icon: Pill,
        badge: "Warning",
        badgeVariant: "danger",
      },
      {
        label: "Risks & Insights",
        href: "/patient/risks",
        icon: AlertTriangle,
        badge: "High",
        badgeVariant: "danger",
      },
    ],
  },
  {
    title: "Care & Support",
    items: [
      { label: "Care Team", href: "/patient#care-team", icon: Users },
      { label: "Consent Center", href: "/consent", icon: ShieldCheck, badge: "Active", badgeVariant: "success" },
      { label: "Daily Observations", href: "/caregiver/observations", icon: HeartHandshake },
    ],
  },
];
