"use client";

import {
  ClipboardList,
  Upload,
  CheckCircle2,
  FileText,
  Star,
  Bell,
  Clock,
  Send,
  CheckSquare,
  XSquare,
  UserPlus,
  Key,
  ShieldAlert,
} from "lucide-react";
import type { NotificationTemplate } from "@/types/notificationTemplate";

// ─── Static template catalog ──────────────────────────────────────────────

export const TEMPLATE_CATALOG = [
  {
    type: "TASK_ASSIGNMENT",
    label: "Task Assigned",
    description: "Sent when a task is assigned to an intern",
    icon: ClipboardList,
    color: "cyan",
    variables: ["taskTitle", "deadline"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "You have been assigned a new task",
      contentTemplate: 'Task: "{{taskTitle}}". Deadline: {{deadline}}',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "TASK_SUBMISSION",
    label: "Task Submitted",
    description: "Sent to leader when an intern submits a task",
    icon: Upload,
    color: "blue",
    variables: ["internName", "taskTitle", "attempt"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "New submission requires review",
      contentTemplate:
        'Intern {{internName}} submitted work for task "{{taskTitle}}" (Attempt {{attempt}}).',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "SUBMISSION_REVIEW",
    label: "Submission Reviewed",
    description: "Sent to intern when their submission is reviewed",
    icon: CheckCircle2,
    color: "emerald",
    variables: ["taskTitle", "attempt", "reviewStatus"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Submission review result",
      contentTemplate:
        'Submission for task "{{taskTitle}}" (Attempt {{attempt}}) has been reviewed: {{reviewStatus}}.',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "DAILY_REPORT",
    label: "Daily Report",
    description: "Sent to leader when an intern submits a daily report",
    icon: FileText,
    color: "purple",
    variables: ["internName"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "New daily report submitted",
      contentTemplate:
        "Intern {{internName}} has submitted a daily report.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "WEEKLY_EVALUATION",
    label: "Weekly Evaluation",
    description: "Sent to intern when a weekly evaluation is published",
    icon: Star,
    color: "amber",
    variables: ["week", "totalScore"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "New weekly evaluation published",
      contentTemplate:
        "You have received a week {{week}} evaluation with a total score of {{totalScore}}/10.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "TASK_REMINDER",
    label: "Task Reminder",
    description: "Automated reminder for upcoming task deadlines",
    icon: Bell,
    color: "orange",
    variables: ["taskTitle", "deadline"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Task deadline reminder",
      contentTemplate:
        'Your task "{{taskTitle}}" is due on {{deadline}}. Please complete it on time.',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "EVALUATION_REMINDER",
    label: "Evaluation Reminder",
    description: "Automated reminder for leaders to complete evaluations",
    icon: Clock,
    color: "rose",
    variables: ["internName", "week"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Intern evaluation reminder",
      contentTemplate:
        'Intern {{internName}} has not been evaluated for week {{week}}. Please complete the evaluation.',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "APPLICATION_INVITE",
    label: "Onboarding Invitation",
    description: "Sent when inviting a candidate to submit onboarding policies",
    icon: Send,
    color: "cyan",
    variables: ["applyUrl"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Internship Application Invitation",
      emailContentTemplate:
        'Hello,<br/><br/>You have been invited to apply for an internship at NexCampus.<br/>Please click the link below to fill in your application (this link is single-use and expires after 24 hours):<br/><p style="margin: 16px 0;"><a href="{{applyUrl}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Submit Application</a></p>Or copy this link into your browser:<br/><a href="{{applyUrl}}">{{applyUrl}}</a><br/><br/>Best regards,<br/>The NexCampus Team.',
    },
  },
  {
    type: "APPLICATION_APPROVED",
    label: "Onboarding Approved",
    description: "Sent when a candidate onboarding registration is approved",
    icon: CheckSquare,
    color: "emerald",
    variables: ["email", "password", "loginUrl"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Your Intern Account Has Been Created",
      emailContentTemplate:
        'Welcome to NexCampus!<br/><br/>Your internship application at NexCampus has been approved.<br/>Your account has been successfully created on the system. Below are your login credentials:<br/><ul><li><strong>Login email:</strong> {{email}}</li><li><strong>Password:</strong> {{password}}</li></ul>Please visit <a href="{{loginUrl}}" style="color:#4f46e5;font-weight:bold;">NexCampus</a> to sign in and change your password to secure your account.<br/><br/>Best regards,<br/>The NexCampus Team.',
    },
  },
  {
    type: "APPLICATION_REJECTED",
    label: "Onboarding Rejected",
    description: "Sent when a candidate onboarding registration is rejected",
    icon: XSquare,
    color: "rose",
    variables: ["fullName", "position", "department"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Internship Application Result",
      emailContentTemplate:
        'Hello,<br/><br/>Thank you for your interest in applying for an internship at NexCampus.<br/>After careful consideration, we regret to inform you that your application does not meet our current selection criteria.<br/>Details about your application:<br/><ul><li><strong>Full name:</strong> {{fullName}}</li><li><strong>Position applied:</strong> {{position}}</li><li><strong>Department:</strong> {{department}}</li></ul>We hope to have the opportunity to work with you in future programs. Wishing you good health and success in your career journey ahead.<br/><br/>Best regards,<br/>The NexCampus Team.',
    },
  },
  {
    type: "USER_CREATED",
    label: "Account Created",
    description: "Sent when a new user account is created by an admin",
    icon: UserPlus,
    color: "blue",
    variables: ["email", "password", "loginUrl"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Your Account Has Been Created",
      emailContentTemplate:
        'Welcome to NexCampus!<br/><br/>Your account has been successfully created by an administrator. Below are your login credentials:<br/><ul><li><strong>Login email:</strong> {{email}}</li><li><strong>Password:</strong> {{password}}</li></ul>Please visit <a href="{{loginUrl}}" style="color:#4f46e5;font-weight:bold;">NexCampus</a> to sign in and change your password to secure your account.<br/><br/>Best regards,<br/>The NexCampus Team.',
    },
  },
  {
    type: "PASSWORD_RESET",
    label: "Password Reset Request",
    description: "Sent when a user requests to reset their account password with security info",
    icon: Key,
    color: "amber",
    variables: ["fullName", "time", "ip", "location", "device", "os", "browser", "resetLink"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Password Reset Request",
      emailContentTemplate:
        'Hello {{fullName}},<br/><br/>The NexCampus system received a password reset request for your account with the device details below:<br/><br/><table style="width:100%;border-collapse:collapse;margin:16px 0;background-color:#0f172a;color:#f8fafc;border-radius:8px;overflow:hidden;"><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;width:140px;">Request time:</td><td style="padding:10px 16px;font-weight:bold;">{{time}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">IP address:</td><td style="padding:10px 16px;font-weight:bold;">{{ip}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Location (estimated):</td><td style="padding:10px 16px;font-weight:bold;">{{location}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Device:</td><td style="padding:10px 16px;font-weight:bold;">{{device}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Operating system:</td><td style="padding:10px 16px;font-weight:bold;">{{os}}</td></tr><tr><td style="padding:10px 16px;color:#94a3b8;">Browser:</td><td style="padding:10px 16px;font-weight:bold;">{{browser}}</td></tr></table>Please click the link below to set a new password (link is valid for 1 hour):<br/><p style="margin: 20px 0;"><a href="{{resetLink}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;box-shadow:0 4px 12px rgba(79,70,229,0.3);">Reset Password</a></p>Or copy this link into your browser:<br/><a href="{{resetLink}}">{{resetLink}}</a><br/><br/>If you did not request this, please ignore this email or contact your administrator.<br/><br/>Best regards,<br/>The NexCampus Team.',
    },
  },
  {
    type: "SECURITY_ALERT",
    label: "Security Login Alert",
    description: "Sent when a login occurs with time, IP, location, device & revoke session button",
    icon: ShieldAlert,
    color: "rose",
    variables: ["fullName", "time", "ip", "location", "device", "os", "browser", "revokeUrl"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Security Alert: New Login Detected",
      emailContentTemplate:
        'Hello {{fullName}},<br/><br/>The NexCampus system detected a new login to your account with the security details below:<br/><br/><table style="width:100%;border-collapse:collapse;margin:16px 0;background-color:#0f172a;color:#f8fafc;border-radius:8px;overflow:hidden;"><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;width:140px;">Time:</td><td style="padding:10px 16px;font-weight:bold;">{{time}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">IP address:</td><td style="padding:10px 16px;font-weight:bold;">{{ip}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Location (estimated):</td><td style="padding:10px 16px;font-weight:bold;">{{location}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Device:</td><td style="padding:10px 16px;font-weight:bold;">{{device}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Operating system:</td><td style="padding:10px 16px;font-weight:bold;">{{os}}</td></tr><tr><td style="padding:10px 16px;color:#94a3b8;">Browser:</td><td style="padding:10px 16px;font-weight:bold;">{{browser}}</td></tr></table>If this was you, you can safely ignore this email.<br/><br/>If <strong style="color:#ef4444;">THIS WAS NOT YOU</strong>, your account may be compromised. Please click the button below to revoke this session immediately:<br/><p style="margin: 20px 0;"><a href="{{revokeUrl}}" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;box-shadow:0 4px 12px rgba(220,38,38,0.3);">THIS WAS NOT ME (Revoke Session Now)</a></p>Best regards,<br/>The NexCampus Team.',
    },
  },
] as const;

export type TemplateCatalogItem = (typeof TEMPLATE_CATALOG)[number];

// ─── Color map ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-400/30",
    dot: "bg-cyan-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-400/30",
    dot: "bg-blue-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-400/30",
    dot: "bg-purple-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-400/30",
    dot: "bg-orange-400",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-400/30",
    dot: "bg-rose-400",
  },
};

// ─── Component ────────────────────────────────────────────────────────────

type Props = {
  dbTemplates: NotificationTemplate[];
  selectedType: string;
  onSelect: (type: string) => void;
};

export default function TemplateSidebar({
  dbTemplates,
  selectedType,
  onSelect,
}: Props) {
  const dbMap = new Map(dbTemplates.map((t) => [t.type, t]));

  return (
    <div
      className="
        rounded-[28px]
        border border-white/10
        bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
        shadow-[0_12px_40px_rgba(0,0,0,.45)]
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Templates
        </p>
      </div>

      {/* List */}
      <ul className="p-2 space-y-1">
        {TEMPLATE_CATALOG.map((item) => {
          const colors = COLOR_MAP[item.color];
          const isSelected = selectedType === item.type;
          const hasDbRecord = dbMap.has(item.type);
          const Icon = item.icon;

          return (
            <li key={item.type}>
              <button
                type="button"
                onClick={() => onSelect(item.type)}
                className={`
                  w-full flex items-start gap-3 rounded-2xl px-3 py-3
                  text-left transition-all duration-200
                  ${
                    isSelected
                      ? `border ${colors.border} ${colors.bg}`
                      : "border border-transparent hover:bg-white/5"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                    ${isSelected ? `${colors.bg} ${colors.text}` : "bg-white/5 text-slate-400"}
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-300"}`}
                    >
                      {item.label}
                    </span>
                    {/* Saved indicator */}
                    {hasDbRecord && (
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`}
                        title="Template saved in database"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer legend */}
      <div className="border-t border-white/5 px-4 py-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        <p className="text-xs text-slate-600">Dot = saved in database</p>
      </div>
    </div>
  );
}
