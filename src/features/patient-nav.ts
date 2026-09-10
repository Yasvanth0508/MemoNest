import { SidebarSection } from "@/components/layout/Sidebar";
import {
  Bell,
  Clock,
  FileText,
  Home,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";

export const PATIENT_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Health Navigation",
    items: [
      {
        label: "Home",
        href: "/patient",
        icon: Home,
      },
      {
        label: "My Profile",
        href: "/patient/profile",
        icon: User,
      },
      {
        label: "Upload Records",
        href: "/patient/upload",
        icon: UploadCloud,
      },
      {
        label: "Reports",
        href: "/patient/reports",
        icon: FileText,
      },
      {
        label: "Health Timeline",
        href: "/patient/timeline",
        icon: Clock,
      },
      {
        label: "Consent & Sharing",
        href: "/patient/consent",
        icon: ShieldCheck,
      },
      {
        label: "Notifications",
        href: "/patient/notifications",
        icon: Bell,
        badge: "3",
        badgeVariant: "warning",
      },
    ],
  },
];

export const PATIENT_NAV_ITEMS = PATIENT_SIDEBAR_SECTIONS[0].items;
