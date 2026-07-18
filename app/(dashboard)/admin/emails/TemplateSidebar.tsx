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
      titleTemplate: "Bạn đã được giao công việc mới",
      contentTemplate: 'Công việc: "{{taskTitle}}". Hạn nộp: {{deadline}}',
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
      titleTemplate: "Bản nộp bài mới cần duyệt",
      contentTemplate:
        'Thực tập sinh {{internName}} đã nộp bài cho công việc "{{taskTitle}}" (Lần {{attempt}}).',
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
      titleTemplate: "Kết quả duyệt bài nộp",
      contentTemplate:
        'Bài nộp cho công việc "{{taskTitle}}" (Lần {{attempt}}) đã được duyệt: {{reviewStatus}}.',
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
      titleTemplate: "Báo cáo hàng ngày mới",
      contentTemplate:
        "Thực tập sinh {{internName}} đã gửi báo cáo hàng ngày.",
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
      titleTemplate: "Đánh giá hàng tuần mới",
      contentTemplate:
        "Bạn nhận được đánh giá tuần {{week}} với tổng điểm là {{totalScore}}/10.",
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
      titleTemplate: "Nhắc nhở hoàn thành công việc",
      contentTemplate:
        'Công việc "{{taskTitle}}" của bạn có hạn nộp vào lúc {{deadline}}. Vui lòng hoàn thành đúng hạn.',
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
      titleTemplate: "Nhắc nhở đánh giá thực tập sinh",
      contentTemplate:
        'Thực tập sinh {{internName}} chưa có đánh giá cho tuần {{week}}. Vui lòng thực hiện đánh giá.',
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
      emailSubjectTemplate: "[NexCampus] Thư mời nộp đơn đăng ký thực tập",
      emailContentTemplate:
        'Chào bạn,<br/><br/>Bạn đã nhận được lời mời tham gia ứng tuyển thực tập tại NexCampus.<br/>Vui lòng nhấn vào liên kết dưới đây để điền thông tin đơn ứng tuyển (liên kết này chỉ có giá trị sử dụng một lần và hết hạn sau 24 giờ):<br/><p style="margin: 16px 0;"><a href="{{applyUrl}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Nộp đơn ứng tuyển</a></p>Hoặc sao chép liên kết này vào trình duyệt của bạn:<br/><a href="{{applyUrl}}">{{applyUrl}}</a><br/><br/>Trân trọng,<br/>Đội ngũ NexCampus.',
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
      emailSubjectTemplate: "[NexCampus] Tài khoản thực tập sinh của bạn đã được tạo",
      emailContentTemplate:
        'Chào mừng bạn đến với NexCampus!<br/><br/>Đơn đăng ký thực tập của bạn tại NexCampus đã được phê duyệt.<br/>Tài khoản của bạn đã được khởi tạo thành công trên hệ thống. Dưới đây là thông tin đăng nhập của bạn:<br/><ul><li><strong>Email đăng nhập:</strong> {{email}}</li><li><strong>Mật khẩu:</strong> {{password}}</li></ul>Vui lòng truy cập <a href="{{loginUrl}}" style="color:#4f46e5;font-weight:bold;">NexCampus</a> để đăng nhập và đổi mật khẩu của bạn để bảo mật tài khoản.<br/><br/>Trân trọng,<br/>Đội ngũ NexCampus.',
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
      emailSubjectTemplate: "[NexCampus] Kết quả đăng ký thực tập tại NexCampus",
      emailContentTemplate:
        'Chào bạn,<br/><br/>Cảm ơn bạn đã quan tâm và nộp đơn đăng ký thực tập tại NexCampus.<br/>Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng đơn đăng ký của bạn chưa phù hợp với các tiêu chí tuyển chọn hiện tại của chúng tôi.<br/>Thông tin chi tiết về đơn đăng ký của bạn:<br/><ul><li><strong>Họ và tên:</strong> {{fullName}}</li><li><strong>Vị trí ứng tuyển:</strong> {{position}}</li><li><strong>Phòng ban:</strong> {{department}}</li></ul>Chúng tôi rất hy vọng sẽ có cơ hội được hợp tác với bạn trong các chương trình tiếp theo. Chúc bạn luôn nhiều sức khỏe và thành công trên con đường sự nghiệp sắp tới.<br/><br/>Trân trọng,<br/>Đội ngũ NexCampus.',
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
      emailSubjectTemplate: "[NexCampus] Tài khoản của bạn đã được tạo",
      emailContentTemplate:
        'Chào mừng bạn đến với NexCampus!<br/><br/>Tài khoản của bạn đã được quản trị viên khởi tạo thành công trên hệ thống. Dưới đây là thông tin đăng nhập của bạn:<br/><ul><li><strong>Email đăng nhập:</strong> {{email}}</li><li><strong>Mật khẩu:</strong> {{password}}</li></ul>Vui lòng truy cập <a href="{{loginUrl}}" style="color:#4f46e5;font-weight:bold;">NexCampus</a> để đăng nhập và đổi mật khẩu của bạn để bảo mật tài khoản.<br/><br/>Trân trọng,<br/>Đội ngũ NexCampus.',
    },
  },
  {
    type: "PASSWORD_RESET",
    label: "Password Reset Request",
    description: "Sent when a user requests to reset their account password",
    icon: Key,
    color: "amber",
    variables: ["resetLink"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Khôi phục mật khẩu",
      emailContentTemplate:
        'Bạn đã yêu cầu khôi phục mật khẩu tài khoản NexCampus.<br/>Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu mới (liên kết có hiệu lực trong 1 giờ):<br/><p style="margin: 16px 0;"><a href="{{resetLink}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Đặt lại mật khẩu</a></p>Hoặc sao chép liên kết này vào trình duyệt:<br/><a href="{{resetLink}}">{{resetLink}}</a>',
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
