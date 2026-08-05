/**
 * i18n dictionary — layout shell scope only.
 * Covers: Header, AdminSidebar, LeaderSidebar, InternSidebar.
 */

export type Language = "vn" | "en";

export const translations = {
  // ── Header ──────────────────────────────────────────────────────────────
  "header.logout": { vn: "Đăng xuất", en: "Logout" },
  "header.loggingOut": { vn: "Đang đăng xuất...", en: "Logging out, please wait..." },
  "header.dashboard": { vn: "BẢNG ĐIỀU KHIỂN", en: "DASHBOARD" },

  // ── Admin Sidebar ────────────────────────────────────────────────────────
  "admin.nav.dashboard": { vn: "Tổng quan", en: "Dashboard" },
  "admin.nav.adminTeam": { vn: "Nhóm Admin", en: "Admin Team" },
  "admin.nav.leaders": { vn: "Leader", en: "Leaders" },
  "admin.nav.interns": { vn: "Thực tập sinh", en: "Interns" },
  "admin.nav.department": { vn: "Phòng ban", en: "Department" },
  "admin.nav.onboarding": { vn: "Onboarding", en: "Onboarding" },
  "admin.nav.mails": { vn: "Email", en: "Mails" },
  "admin.nav.meetings": { vn: "Cuộc họp", en: "Meetings" },
  "admin.nav.policies": { vn: "Chính sách", en: "Policies" },
  "admin.nav.activityLogs": { vn: "Nhật ký", en: "Activity Logs" },
  "admin.nav.profile": { vn: "Hồ sơ", en: "Profile" },

  // ── Leader Sidebar ───────────────────────────────────────────────────────
  "leader.nav.dashboard": { vn: "Tổng quan", en: "Dashboard" },
  "leader.nav.interns": { vn: "Thực tập sinh", en: "Interns" },
  "leader.nav.department": { vn: "Phòng ban", en: "Department" },
  "leader.nav.tasks": { vn: "Nhiệm vụ", en: "Tasks" },
  "leader.nav.dailyReports": { vn: "Báo cáo ngày", en: "Daily Reports" },
  "leader.nav.meetings": { vn: "Cuộc họp", en: "Meetings" },
  "leader.nav.weeklyEvaluation": { vn: "Đánh giá tuần", en: "Weekly Evaluation" },
  "leader.nav.profile": { vn: "Hồ sơ", en: "Profile" },

  // ── Intern Sidebar ───────────────────────────────────────────────────────
  "intern.nav.dashboard": { vn: "Tổng quan", en: "Dashboard" },
  "intern.nav.task": { vn: "Nhiệm vụ", en: "Task" },
  "intern.nav.dailyReport": { vn: "Báo cáo ngày", en: "Daily Report" },
  "intern.nav.meetings": { vn: "Cuộc họp", en: "Meetings" },
  "intern.nav.weeklyEvaluation": { vn: "Đánh giá tuần", en: "Weekly Evaluation" },
  "intern.nav.profile": { vn: "Hồ sơ", en: "Profile" },
} as const;

export type TranslationKey = keyof typeof translations;

export function translate(key: TranslationKey, lang: Language): string {
  return translations[key][lang];
}
