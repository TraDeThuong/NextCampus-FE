import type { AbstractIntlMessages } from "next-intl";

/**
 * Deep merge two objects. Arrays and primitives are overwritten.
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      );
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const globalForMessages = globalThis as unknown as {
  messageCache?: Record<string, AbstractIntlMessages>;
};

if (!globalForMessages.messageCache) {
  globalForMessages.messageCache = {};
}
const messageCache = globalForMessages.messageCache;
const shouldCacheMessages = process.env.NODE_ENV === "production";

/**
 * Tải toàn bộ các tệp thông điệp ngôn ngữ tổ chức theo Feature-based (Mô-đun/Tính năng).
 * Hỗ trợ đồng thời:
 * 1. Namespace theo tính năng: roles, departments, tasks, meetings, users...
 * 2. Namespace portal kế thừa (admin.*, leader.*, intern.*) bảo đảm tương thích ngược 100%.
 */
export async function loadLocaleMessages(
  locale: string,
): Promise<AbstractIntlMessages> {
  if (shouldCacheMessages && messageCache[locale]) {
    return messageCache[locale];
  }

  const files: Record<string, unknown> = {};

  // 1. Common (Dùng chung toàn hệ thống)
  const common = (await import(`../messages/${locale}/common.json`)).default;
  deepMerge(files, common);

  // 2. Navigation (Thanh điều hướng)
  const nav = (await import(`../messages/${locale}/nav.json`)).default;
  deepMerge(files, nav);

  // 3. Dashboards (Tổng quan)
  const dashboards = (await import(`../messages/${locale}/dashboards.json`)).default;
  deepMerge(files, dashboards);

  // 4. Users & Nhân sự (Admin Team, Leaders, Interns)
  const users = (await import(`../messages/${locale}/users.json`)).default;
  deepMerge(files, users);

  // 5. Roles & Phân quyền (Dynamic RBAC)
  const roles = (await import(`../messages/${locale}/roles.json`)).default;
  deepMerge(files, roles);

  // 6. Departments & Chức vụ
  const departments = (await import(`../messages/${locale}/departments.json`)).default;
  deepMerge(files, departments);

  // 7. Tasks (Quản lý và nộp nhiệm vụ)
  const tasks = (await import(`../messages/${locale}/tasks.json`)).default;
  deepMerge(files, tasks);

  // 8. Task Groups (Nhóm công việc)
  const taskGroups = (await import(`../messages/${locale}/task-groups.json`)).default;
  deepMerge(files, taskGroups);

  // 9. Daily Reports (Báo cáo ngày)
  const dailyReports = (await import(`../messages/${locale}/daily-reports.json`)).default;
  deepMerge(files, dailyReports);

  // 10. Meetings (Cuộc họp & Điểm danh)
  const meetings = (await import(`../messages/${locale}/meetings.json`)).default;
  deepMerge(files, meetings);

  // 11. Weekly Evaluations (Đánh giá tuần 12 tiêu chí)
  const weeklyEval = (await import(`../messages/${locale}/weekly-evaluations.json`)).default;
  deepMerge(files, weeklyEval);

  // 12. Onboarding (Đơn ứng tuyển & Tiếp nhận)
  const onboarding = (await import(`../messages/${locale}/onboarding.json`)).default;
  deepMerge(files, onboarding);

  // 13. Emails & Thông báo
  const emails = (await import(`../messages/${locale}/emails.json`)).default;
  deepMerge(files, emails);

  // 14. Regulations & Chính sách
  const regulations = (await import(`../messages/${locale}/regulations.json`)).default;
  deepMerge(files, regulations);

  // 15. Profile (Hồ sơ người dùng)
  const profile = (await import(`../messages/${locale}/profile.json`)).default;
  deepMerge(files, profile);

  // 16. Activity Logs (Nhật ký hoạt động)
  const activityLogs = (await import(`../messages/${locale}/activity-logs.json`)).default;
  deepMerge(files, activityLogs);

  // 17. Settings (Cấu hình hệ thống)
  const settings = (await import(`../messages/${locale}/settings.json`)).default;
  deepMerge(files, settings);

  const messages = files as AbstractIntlMessages;

  if (shouldCacheMessages) {
    messageCache[locale] = messages;
  }

  return messages;
}
