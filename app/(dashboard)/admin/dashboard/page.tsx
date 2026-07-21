import type { Metadata } from "next";
import AdminStatsOverview from "@/components/stats/AdminStatsOverview";

export const metadata: Metadata = {
  title: "Tổng quan (Admin)",
};

export default function AdminDashboardPage() {
  return <AdminStatsOverview />;
}

