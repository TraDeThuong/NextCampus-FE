"use client";

import React, { useState, useMemo } from "react";
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
  Calendar,
  CalendarPlus,
  CalendarX,
  FileX,
  ClipboardCheck,
  XCircle,
  Search,
  X,
  Globe,
  Mail,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
    description: "Sent when a user requests to reset their account password with security info",
    icon: Key,
    color: "amber",
    variables: ["fullName", "time", "ip", "location", "device", "os", "browser", "resetLink"],
    channels: ["email"],
    defaults: {
      titleTemplate: "",
      contentTemplate: "",
      emailSubjectTemplate: "[NexCampus] Yêu cầu khôi phục mật khẩu tài khoản",
      emailContentTemplate:
        'Chào {{fullName}},<br/><br/>Hệ thống NexCampus ghi nhận một yêu cầu khôi phục mật khẩu cho tài khoản của bạn với chi tiết thiết bị bên dưới:<br/><br/><table style="width:100%;border-collapse:collapse;margin:16px 0;background-color:#0f172a;color:#f8fafc;border-radius:8px;overflow:hidden;"><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;width:140px;">Thời gian yêu cầu:</td><td style="padding:10px 16px;font-weight:bold;">{{time}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Địa chỉ IP:</td><td style="padding:10px 16px;font-weight:bold;">{{ip}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Vị trí (ước tính):</td><td style="padding:10px 16px;font-weight:bold;">{{location}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Thiết bị:</td><td style="padding:10px 16px;font-weight:bold;">{{device}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Hệ điều hành:</td><td style="padding:10px 16px;font-weight:bold;">{{os}}</td></tr><tr><td style="padding:10px 16px;color:#94a3b8;">Trình duyệt:</td><td style="padding:10px 16px;font-weight:bold;">{{browser}}</td></tr></table>Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu mới (liên kết có hiệu lực trong 1 giờ):<br/><p style="margin: 20px 0;"><a href="{{resetLink}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;box-shadow:0 4px 12px rgba(79,70,229,0.3);">🔑 Đặt lại mật khẩu</a></p>Hoặc sao chép liên kết này vào trình duyệt:<br/><a href="{{resetLink}}">{{resetLink}}</a><br/><br/>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này hoặc liên hệ quản trị viên.<br/><br/>Trân trọng,<br/>Đội ngũ NexCampus.',
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
      emailSubjectTemplate: "[NexCampus] Cảnh báo bảo mật: Đăng nhập từ thiết bị/vị trí mới",
      emailContentTemplate:
        'Chào {{fullName}},<br/><br/>Hệ thống NexCampus ghi nhận một lượt đăng nhập mới vào tài khoản của bạn với chi tiết bảo mật bên dưới:<br/><br/><table style="width:100%;border-collapse:collapse;margin:16px 0;background-color:#0f172a;color:#f8fafc;border-radius:8px;overflow:hidden;"><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;width:140px;">Thời gian:</td><td style="padding:10px 16px;font-weight:bold;">{{time}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Địa chỉ IP:</td><td style="padding:10px 16px;font-weight:bold;">{{ip}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Vị trí (ước tính):</td><td style="padding:10px 16px;font-weight:bold;">{{location}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Thiết bị:</td><td style="padding:10px 16px;font-weight:bold;">{{device}}</td></tr><tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 16px;color:#94a3b8;">Hệ điều hành:</td><td style="padding:10px 16px;font-weight:bold;">{{os}}</td></tr><tr><td style="padding:10px 16px;color:#94a3b8;">Trình duyệt:</td><td style="padding:10px 16px;font-weight:bold;">{{browser}}</td></tr></table>Nếu chính bạn thực hiện đăng nhập này, bạn có thể bỏ qua email này.<br/><br/>Nếu <strong style="color:#ef4444;">ĐÂY KHÔNG PHẢI LÀ BẠN</strong>, tài khoản của bạn có nguy cơ bị xâm nhập. Vui lòng nhấn vào nút bên dưới để vô hiệu hóa phiên đăng nhập này ngay lập tức:<br/><p style="margin: 20px 0;"><a href="{{revokeUrl}}" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;box-shadow:0 4px 12px rgba(220,38,38,0.3);">⚠️ ĐÂY KHÔNG PHẢI TÔI (Khóa phiên ngay)</a></p>Trân trọng,<br/>Đội ngũ NexCampus.',
    },
  },
  {
    type: "MEETING_INVITATION",
    label: "Meeting Invitation",
    description: "Sent to invitees when they are invited to a meeting",
    icon: Calendar,
    color: "blue",
    variables: ["meetingTitle", "startTime", "creatorName"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Meeting Invitation: {{meetingTitle}}",
      contentTemplate: "{{creatorName}} invited you to a meeting at {{startTime}}.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "MEETING_CREATED",
    label: "Meeting Created",
    description: "Sent to attendees when a new meeting is scheduled",
    icon: CalendarPlus,
    color: "cyan",
    variables: ["meetingTitle", "startTime", "creatorName"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "New Meeting: {{meetingTitle}}",
      contentTemplate: "{{creatorName}} scheduled a meeting at {{startTime}}.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "MEETING_CANCELLED",
    label: "Meeting Cancelled",
    description: "Sent to attendees when a meeting is cancelled",
    icon: CalendarX,
    color: "rose",
    variables: ["meetingTitle", "startTime"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Meeting Cancelled: {{meetingTitle}}",
      contentTemplate: "The meeting {{meetingTitle}} at {{startTime}} has been cancelled.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "ABSENCE_SUBMITTED",
    label: "Absence Submitted",
    description: "Sent to leader/admin when an intern requests absence from a meeting",
    icon: FileX,
    color: "orange",
    variables: ["meetingTitle", "userName", "reason"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Leave Request: {{meetingTitle}}",
      contentTemplate: "{{userName}} submitted a leave request. Reason: {{reason}}",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "ABSENCE_REVIEWED",
    label: "Absence Reviewed",
    description: "Sent to intern when their absence request is reviewed",
    icon: ClipboardCheck,
    color: "emerald",
    variables: ["meetingTitle", "status"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Leave Request {{status}}: {{meetingTitle}}",
      contentTemplate: "Your leave request for {{meetingTitle}} has been {{status}}.",
      emailSubjectTemplate: null,
      emailContentTemplate: null,
    },
  },
  {
    type: "TASK_ASSIGNMENT_REJECTED",
    label: "Task Assignment Rejected",
    description: "Sent to assigner when a task assignment is rejected by a leader",
    icon: XCircle,
    color: "rose",
    variables: ["taskTitle", "internName"],
    channels: ["web", "email"],
    defaults: {
      titleTemplate: "Yêu cầu giao việc bị từ chối",
      contentTemplate: 'Yêu cầu giao việc "{{taskTitle}}" cho {{internName}} đã bị từ chối bởi leader quản lý.',
      emailSubjectTemplate: null,
      emailContentTemplate: null,
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
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-400/30",
    dot: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-400/30",
    dot: "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-400/30",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-400/30",
    dot: "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-400/30",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
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
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "webAndEmail" | "emailOnly">("all");

  const dbMap = useMemo(
    () => new Map(dbTemplates.map((item) => [item.type, item])),
    [dbTemplates]
  );

  // Filter templates by channel and search query
  const filteredTemplates = useMemo(() => {
    return TEMPLATE_CATALOG.filter((item) => {
      // 1. Channel Filter
      if (channelFilter === "webAndEmail") {
        const isOmni =
          (item.channels as readonly string[]).includes("web") &&
          (item.channels as readonly string[]).includes("email");
        if (!isOmni) return false;
      } else if (channelFilter === "emailOnly") {
        const isEmailOnly =
          !(item.channels as readonly string[]).includes("web") &&
          (item.channels as readonly string[]).includes("email");
        if (!isEmailOnly) return false;
      }

      // 2. Search Filter
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const labelVi = t.has(`admin.emails.catalog.${item.type}.label`)
        ? t(`admin.emails.catalog.${item.type}.label`).toLowerCase()
        : item.label.toLowerCase();
      const descVi = t.has(`admin.emails.catalog.${item.type}.description`)
        ? t(`admin.emails.catalog.${item.type}.description`).toLowerCase()
        : item.description.toLowerCase();
      const typeStr = item.type.toLowerCase();

      return (
        labelVi.includes(q) ||
        descVi.includes(q) ||
        typeStr.includes(q) ||
        item.label.toLowerCase().includes(q)
      );
    });
  }, [channelFilter, searchTerm, t]);

  return (
    <div
      className="
        rounded-3xl
        border border-border
        bg-card/90 dark:bg-[#0c1222]/90
        shadow-[0_12px_40px_rgba(0,0,0,.35)]
        backdrop-blur-xl
        overflow-hidden
        h-full
        flex flex-col
      "
    >
      {/* Header & Title */}
      <div className="border-b border-border/80 px-4 py-3.5 shrink-0 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {t("admin.emails.templates")}
          </p>
          <span className="rounded-full bg-primary-main/10 text-primary-light px-2 py-0.5 text-[11px] font-semibold">
            {filteredTemplates.length} / {TEMPLATE_CATALOG.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("admin.emails.catalog.searchPlaceholder")}
            className="
              w-full rounded-xl
              bg-background/80 border border-border
              px-9 py-2 text-xs text-foreground placeholder:text-muted/60
              outline-none transition-all duration-200
              focus:border-primary-light/50 focus:ring-1 focus:ring-primary-light/40
            "
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted hover:text-foreground cursor-pointer p-0.5 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Channel Filter Pills */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          <button
            type="button"
            onClick={() => setChannelFilter("all")}
            className={`
              rounded-lg px-2.5 py-1 text-[11px] font-semibold shrink-0 transition-all cursor-pointer
              ${
                channelFilter === "all"
                  ? "bg-primary-main text-white shadow-sm"
                  : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
              }
            `}
          >
            {t("admin.emails.catalog.allChannels")}
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter("webAndEmail")}
            className={`
              flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold shrink-0 transition-all cursor-pointer
              ${
                channelFilter === "webAndEmail"
                  ? "bg-primary-main text-white shadow-sm"
                  : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
              }
            `}
          >
            <Globe className="h-3 w-3" />
            <span>{t("admin.emails.catalog.webAndEmail")}</span>
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter("emailOnly")}
            className={`
              flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold shrink-0 transition-all cursor-pointer
              ${
                channelFilter === "emailOnly"
                  ? "bg-primary-main text-white shadow-sm"
                  : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
              }
            `}
          >
            <Mail className="h-3 w-3" />
            <span>{t("admin.emails.catalog.emailOnly")}</span>
          </button>
        </div>
      </div>

      {/* List */}
      <ul className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
        {filteredTemplates.length === 0 ? (
          <li className="py-12 px-4 text-center">
            <p className="text-xs text-muted">
              {t("admin.emails.catalog.noResults")}
            </p>
          </li>
        ) : (
          filteredTemplates.map((item) => {
            const colors = COLOR_MAP[item.color];
            const isSelected = selectedType === item.type;
            const hasDbRecord = dbMap.has(item.type);
            const Icon = item.icon;

            const label = t.has(`admin.emails.catalog.${item.type}.label`)
              ? t(`admin.emails.catalog.${item.type}.label`)
              : item.label;

            const description = t.has(
              `admin.emails.catalog.${item.type}.description`
            )
              ? t(`admin.emails.catalog.${item.type}.description`)
              : item.description;

            const hasWeb = (item.channels as readonly string[]).includes("web");
            const hasEmail = (item.channels as readonly string[]).includes("email");

            return (
              <li key={item.type}>
                <button
                  type="button"
                  onClick={() => onSelect(item.type)}
                  className={`
                    w-full flex items-start gap-3 rounded-2xl px-3 py-3
                    text-left transition-all duration-200 cursor-pointer
                    active:scale-[0.99]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light
                    ${
                      isSelected
                        ? `border ${colors.border} ${colors.bg} shadow-[0_0_20px_rgba(0,0,0,0.2)]`
                        : "border border-transparent hover:bg-white/5"
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300
                      ${
                        isSelected
                          ? `${colors.bg} ${colors.text} shadow-sm scale-105`
                          : "bg-white/5 text-muted hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-foreground font-bold" : "text-foreground/80"
                        }`}
                        title={label}
                      >
                        {label}
                      </span>

                      {/* Saved indicator or Channel icon */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasDbRecord && (
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`}
                            title={t("admin.emails.savedIndicator")}
                          />
                        )}
                        <span className="flex items-center gap-0.5 text-[10px] text-muted">
                          {hasWeb && <Globe className="h-3 w-3" />}
                          {hasEmail && <Mail className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Footer legend */}
      <div className="border-t border-border/80 px-4 py-3 flex items-center justify-between shrink-0 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          <p className="text-[11px] text-muted font-medium">
            {t("admin.emails.dotSaved")}
          </p>
        </div>
        <span className="text-[10px] text-muted font-mono uppercase">
          {selectedType}
        </span>
      </div>
    </div>
  );
}
