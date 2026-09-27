import {
  LayoutDashboard,
  Users,
  Activity,
  ScanLine,
  Receipt,
  MessageCircle,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { NavKey } from "./constants";

// Shared nav definition used by both the desktop Sidebar and the mobile drawer.
export const NAV: { key: NavKey; label: string; href: string; icon: LucideIcon }[] = [
  { key: "queue", label: "Queue · Today", href: "/", icon: LayoutDashboard },
  { key: "patients", label: "Patients", href: "/patients", icon: Users },
  { key: "physio", label: "Physiotherapy", href: "/physio", icon: Activity },
  { key: "imaging", label: "X-ray · Imaging", href: "/imaging", icon: ScanLine },
  { key: "billing", label: "Billing", href: "/billing", icon: Receipt },
  { key: "messages", label: "WhatsApp", href: "/messages", icon: MessageCircle },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3 },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];
