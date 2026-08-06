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

/**
 * Load all message files for a given locale and merge them into one object.
 */
export async function loadLocaleMessages(
  locale: string,
): Promise<AbstractIntlMessages> {
  const files: Record<string, unknown> = {};

  // Common
  const common = (await import(`../messages/${locale}/common.json`)).default;
  deepMerge(files, common);

  // Admin
  const adminNav = (await import(`../messages/${locale}/admin/nav.json`))
    .default;
  deepMerge(files, adminNav);

  const adminDashboard = (
    await import(`../messages/${locale}/admin/dashboard.json`)
  ).default;
  deepMerge(files, adminDashboard);

  const adminTeam = (
    await import(`../messages/${locale}/admin/admin-team.json`)
  ).default;
  deepMerge(files, adminTeam);

  const adminLeaders = (
    await import(`../messages/${locale}/admin/leaders.json`)
  ).default;
  deepMerge(files, adminLeaders);

  const adminInterns = (
    await import(`../messages/${locale}/admin/interns.json`)
  ).default;
  deepMerge(files, adminInterns);

  const adminDepartment = (
    await import(`../messages/${locale}/admin/department.json`)
  ).default;
  deepMerge(files, adminDepartment);

  const adminOnboarding = (
    await import(`../messages/${locale}/admin/onboarding.json`)
  ).default;
  deepMerge(files, adminOnboarding);

  const adminEmails = (
    await import(`../messages/${locale}/admin/emails.json`)
  ).default;
  deepMerge(files, adminEmails);

  const adminMeetings = (
    await import(`../messages/${locale}/admin/meetings.json`)
  ).default;
  deepMerge(files, adminMeetings);

  const adminPolicies = (
    await import(`../messages/${locale}/admin/policies.json`)
  ).default;
  deepMerge(files, adminPolicies);

  const adminProfile = (
    await import(`../messages/${locale}/admin/profile.json`)
  ).default;
  deepMerge(files, adminProfile);

  const adminActivityLogs = (
    await import(`../messages/${locale}/admin/activity-logs.json`)
  ).default;
  deepMerge(files, adminActivityLogs);

  // Leader
  const leaderNav = (await import(`../messages/${locale}/leader/nav.json`))
    .default;
  deepMerge(files, leaderNav);

  const leaderDashboard = (
    await import(`../messages/${locale}/leader/dashboard.json`)
  ).default;
  deepMerge(files, leaderDashboard);

  const leaderInterns = (
    await import(`../messages/${locale}/leader/interns.json`)
  ).default;
  deepMerge(files, leaderInterns);

  const leaderDepartment = (
    await import(`../messages/${locale}/leader/department.json`)
  ).default;
  deepMerge(files, leaderDepartment);

  const leaderTasks = (
    await import(`../messages/${locale}/leader/tasks.json`)
  ).default;
  deepMerge(files, leaderTasks);

  const leaderDailyReports = (
    await import(`../messages/${locale}/leader/daily-reports.json`)
  ).default;
  deepMerge(files, leaderDailyReports);

  const leaderMeetings = (
    await import(`../messages/${locale}/leader/meetings.json`)
  ).default;
  deepMerge(files, leaderMeetings);

  const leaderWeeklyEval = (
    await import(`../messages/${locale}/leader/weekly-evaluation.json`)
  ).default;
  deepMerge(files, leaderWeeklyEval);

  const leaderProfile = (
    await import(`../messages/${locale}/leader/profile.json`)
  ).default;
  deepMerge(files, leaderProfile);

  // Intern
  const internNav = (await import(`../messages/${locale}/intern/nav.json`))
    .default;
  deepMerge(files, internNav);

  const internDashboard = (
    await import(`../messages/${locale}/intern/dashboard.json`)
  ).default;
  deepMerge(files, internDashboard);

  const internTasks = (
    await import(`../messages/${locale}/intern/tasks.json`)
  ).default;
  deepMerge(files, internTasks);

  const internDailyReport = (
    await import(`../messages/${locale}/intern/daily-report.json`)
  ).default;
  deepMerge(files, internDailyReport);

  const internMeetings = (
    await import(`../messages/${locale}/intern/meetings.json`)
  ).default;
  deepMerge(files, internMeetings);

  const internWeeklyEval = (
    await import(`../messages/${locale}/intern/weekly-evaluation.json`)
  ).default;
  deepMerge(files, internWeeklyEval);

  const internProfile = (
    await import(`../messages/${locale}/intern/profile.json`)
  ).default;
  deepMerge(files, internProfile);

  return files as AbstractIntlMessages;
}