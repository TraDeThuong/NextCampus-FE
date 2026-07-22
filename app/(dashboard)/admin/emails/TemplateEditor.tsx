"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Globe,
  Mail,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  Info,
} from "lucide-react";
import type { NotificationTemplate } from "@/types/notificationTemplate";
import { useUpsertNotificationTemplate } from "@/hooks/notificationTemplate/useUpsertNotificationTemplate";
import { useResetNotificationTemplate } from "@/hooks/notificationTemplate/useResetNotificationTemplate";
import Button from "@/components/ui/Button";
import { TEMPLATE_CATALOG } from "./TemplateSidebar";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────

type Channel = "web" | "email";

const schema = z.object({
  webTitle: z.string().max(200).optional(),
  webContent: z.string().max(2000).optional(),
  emailSubject: z.string().max(200).optional(),
  emailContent: z.string().max(10000).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Sample values for Live Preview ───────────────────────────────────────

const SAMPLE_VALUES: Record<string, string> = {
  taskTitle: "Xây dựng tính năng đăng nhập",
  deadline: "25/07/2026 17:00",
  internName: "Nguyễn Văn A",
  attempt: "2",
  reviewStatus: "APPROVED",
  week: "4",
  totalScore: "8.5",
  applyUrl: "https://nexcampus.vn/onboarding/invite-token-abc123xyz",
  email: "candidate@example.com",
  password: "SecureTempPassword123!",
  loginUrl: "https://nexcampus.vn/login",
  fullName: "Trần Thị B",
  position: "NodeJS Developer Intern",
  department: "Product Engineering",
  resetLink: "https://nexcampus.vn/reset-password?token=reset-token-xyz789",
  time: "21/07/2026 22:00:00",
  ip: "113.161.12.34",
  location: "TP. Hồ Chí Minh, Việt Nam",
  device: "Desktop",
  os: "Windows 11",
  browser: "Google Chrome",
  revokeUrl: "https://nexcampus.vn/security-alert?token=sample-revoke-token-123",
};

function interpolatePreview(template: string): string {
  let processed = template;

  // 1. Replace variables inside href="..." or href='...' raw, to avoid breaking HTML syntax
  processed = processed.replace(/(href=["'])(.*?)(["'])/gi, (match, prefix, content, suffix) => {
    const cleanContent = content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return SAMPLE_VALUES[key] !== undefined ? SAMPLE_VALUES[key] : "#";
    });
    return prefix + cleanContent + suffix;
  });

  // 2. Wrap remaining variables outside href attributes with styled <mark> tags
  processed = processed.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return SAMPLE_VALUES[key] !== undefined
      ? `<mark class="bg-cyan-500/20 text-cyan-300 rounded px-0.5 font-mono">${SAMPLE_VALUES[key]}</mark>`
      : `<span class="text-red-400 font-mono">{{${key}}}</span>`;
  });

  return processed;
}

// ─── Sub-components ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </label>
  );
}

function VariableChips({
  variables,
  onInsert,
}: {
  variables: readonly string[];
  onInsert: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(v)}
          className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/20 active:scale-95"
          title={`Insert {{${v}}}`}
        >
          {"{{" + v + "}}"}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

type Props = {
  type: string;
  template: NotificationTemplate | null;
};

export default function TemplateEditor({ type, template }: Props) {
  const { mutate: upsert, isPending: saving } = useUpsertNotificationTemplate();
  const { mutate: reset, isPending: resetting } = useResetNotificationTemplate();

  const [channel, setChannel] = useState<Channel>("web");

  // Find catalog meta for the current type
  const meta = TEMPLATE_CATALOG.find((t) => t.type === type);

  if (!meta) return null;

  // Helper to determine effective email content (fallback to catalog if old DB template lacks new variables)
  const getEffectiveEmailContent = (t: NotificationTemplate | null, m: typeof meta) => {
    if (!t?.emailContentTemplate) return m.defaults.emailContentTemplate ?? "";
    if (t.type === "PASSWORD_RESET" && !t.emailContentTemplate.includes("{{ip}}")) {
      return m.defaults.emailContentTemplate ?? "";
    }
    return t.emailContentTemplate;
  };

  // Effective defaults: DB record values, else catalog defaults
  const defaults = {
    webTitle: template?.titleTemplate ?? meta?.defaults.titleTemplate ?? "",
    webContent: template?.contentTemplate ?? meta?.defaults.contentTemplate ?? "",
    emailSubject: template?.emailSubjectTemplate ?? meta?.defaults.emailSubjectTemplate ?? "",
    emailContent: getEffectiveEmailContent(template, meta),
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Switch to first available channel of this template if current channel not supported
  useEffect(() => {
    if (meta && !(meta.channels as readonly string[]).includes(channel)) {
      setChannel(meta.channels[0] as Channel);
    }
  }, [type, meta, channel]);

  // Reset form when selected template changes
  useEffect(() => {
    resetForm({
      webTitle: template?.titleTemplate ?? meta?.defaults.titleTemplate ?? "",
      webContent: template?.contentTemplate ?? meta?.defaults.contentTemplate ?? "",
      emailSubject: template?.emailSubjectTemplate ?? meta?.defaults.emailSubjectTemplate ?? "",
      emailContent: getEffectiveEmailContent(template, meta),
    });
  }, [type, template, meta, resetForm]);

  // Watch live values
  const webTitle = watch("webTitle");
  const webContent = watch("webContent");
  const emailSubject = watch("emailSubject");
  const emailContent = watch("emailContent");

  // Cursor refs for variable insertion — must be merged with RHF refs
  const webTitleRef = useRef<HTMLInputElement>(null);
  const webContentRef = useRef<HTMLTextAreaElement>(null);
  const emailSubjectRef = useRef<HTMLInputElement>(null);
  const emailContentRef = useRef<HTMLTextAreaElement>(null);
  const lastFocusedRef = useRef<
    "webTitle" | "webContent" | "emailSubject" | "emailContent"
  >("webContent");

  // Destructure RHF refs so we can merge them with our DOM refs
  const { ref: webTitleRhfRef, ...webTitleRest } = register("webTitle");
  const { ref: webContentRhfRef, ...webContentRest } = register("webContent");
  const { ref: emailSubjectRhfRef, ...emailSubjectRest } = register("emailSubject");
  const { ref: emailContentRhfRef, ...emailContentRest } = register("emailContent");

  function insertVariable(varName: string) {
    const field = lastFocusedRef.current;
    const token = `{{${varName}}}`;

    const getEl = () => {
      if (field === "webTitle") return webTitleRef.current;
      if (field === "webContent") return webContentRef.current;
      if (field === "emailSubject") return emailSubjectRef.current;
      if (field === "emailContent") return emailContentRef.current;
      return null;
    };

    const el = getEl();
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const current = (watch(field) as string) ?? "";
    const newValue =
      current.substring(0, start) + token + current.substring(end);

    setValue(field, newValue, { shouldDirty: true });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  function onSave(data: FormValues) {
    if (!meta) return;

    // Helper to check missing variables in title/content
    const checkChannelVariables = (titleStr: string = "", contentStr: string = "", channelName: string) => {
      const combined = `${titleStr} ${contentStr}`;
      const missing: string[] = [];
      for (const variable of meta.variables) {
        if (!combined.includes(`{{${variable}}}`)) {
          missing.push(`{{${variable}}}`);
        }
      }
      if (missing.length > 0) {
        toast.error(`Missing required variables in ${channelName} template: ${missing.join(", ")}`);
        return false;
      }
      return true;
    };

    if ((meta.channels as readonly string[]).includes("web")) {
      if (!data.webTitle?.trim()) {
        toast.error("Web notification title is required");
        return;
      }
      if (!data.webContent?.trim()) {
        toast.error("Web notification content is required");
        return;
      }
      if (!checkChannelVariables(data.webTitle, data.webContent, "Web")) {
        return;
      }
    }

    if ((meta.channels as readonly string[]).includes("email")) {
      if (!data.emailSubject?.trim()) {
        toast.error("Email subject is required");
        return;
      }
      if (!data.emailContent?.trim()) {
        toast.error("Email content is required");
        return;
      }
      if (!checkChannelVariables(data.emailSubject, data.emailContent, "Email")) {
        return;
      }
    }

    const titleTemplate =
      data.webTitle?.trim() ||
      data.emailSubject?.trim() ||
      meta.defaults.emailSubjectTemplate ||
      "Notification";

    const contentTemplate =
      data.webContent?.trim() || "Notification";

    upsert({
      type,
      payload: {
        titleTemplate,
        contentTemplate,
        emailSubjectTemplate: data.emailSubject || null,
        emailContentTemplate: data.emailContent || null,
      },
    });
  }

  function onReset() {
    if (!template?.id) return;
    reset(template.id, {
      onSuccess: () => {
        resetForm({
          webTitle: meta?.defaults.titleTemplate ?? "",
          webContent: meta?.defaults.contentTemplate ?? "",
          emailSubject: meta?.defaults.emailSubjectTemplate ?? "",
          emailContent: meta?.defaults.emailContentTemplate ?? "",
        });
      },
    });
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600 font-mono";

  const previewTitle =
    channel === "web"
      ? webTitle || meta.defaults.titleTemplate || "—"
      : emailSubject ||
        webTitle ||
        meta.defaults.emailSubjectTemplate ||
        meta.defaults.titleTemplate ||
        "—";

  const previewContent =
    channel === "web"
      ? webContent || meta.defaults.contentTemplate || "—"
      : emailContent ||
        webContent ||
        meta.defaults.emailContentTemplate ||
        meta.defaults.contentTemplate ||
        "—";

  const Icon = meta.icon;

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
      {/* Editor Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{meta.label}</h3>
            <p className="text-xs text-slate-500">{meta.description}</p>
          </div>
        </div>

        {/* Type badge */}
        <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-400">
          {type}
        </span>
      </div>

      {/* Channel Tabs */}
      <div className="border-b border-white/10 px-6 flex gap-1 pt-3">
        {(meta.channels as readonly string[]).includes("web") && (
          <button
            type="button"
            onClick={() => setChannel("web")}
            className={`
              flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition
              ${
                channel === "web"
                  ? "border border-b-0 border-white/10 bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }
            `}
          >
            <Globe className="h-3.5 w-3.5" />
            Web
          </button>
        )}

        {(meta.channels as readonly string[]).includes("email") && (
          <button
            type="button"
            onClick={() => setChannel("email")}
            className={`
              flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition
              ${
                channel === "email"
                  ? "border border-b-0 border-white/10 bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }
            `}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
            {(meta.channels as readonly string[]).includes("web") &&
              !template?.emailSubjectTemplate &&
              !template?.emailContentTemplate && (
                <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                  Inherits Web
                </span>
              )}
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
        {channel === "web" && (
          <>
            {/* Web Title */}
            <div className="space-y-2">
              <FieldLabel>Notification Title</FieldLabel>
              <input
                {...webTitleRest}
                ref={(el) => { webTitleRhfRef(el); webTitleRef.current = el; }}
                type="text"
                placeholder="e.g., Bạn đã được giao công việc mới"
                onFocus={() => (lastFocusedRef.current = "webTitle")}
                className={inputClass}
              />
              {errors.webTitle && (
                <p className="text-xs text-red-400">
                  {errors.webTitle.message}
                </p>
              )}
            </div>

            {/* Web Content */}
            <div className="space-y-2">
              <FieldLabel>Notification Content</FieldLabel>
              <textarea
                {...webContentRest}
                ref={(el) => { webContentRhfRef(el); webContentRef.current = el; }}
                rows={4}
                placeholder="Write the notification body. Use {{variable}} for dynamic values."
                onFocus={() => (lastFocusedRef.current = "webContent")}
                className={`${inputClass} resize-none`}
              />
              {errors.webContent && (
                <p className="text-xs text-red-400">
                  {errors.webContent.message}
                </p>
              )}
            </div>
          </>
        )}

        {channel === "email" && (
          <>
            {/* Email Subject */}
            <div className="space-y-2">
              <FieldLabel>Email Subject</FieldLabel>
              <p className="text-xs text-slate-500">
                If empty, falls back to the Web Notification Title.
              </p>
              <input
                {...emailSubjectRest}
                ref={(el) => { emailSubjectRhfRef(el); emailSubjectRef.current = el; }}
                type="text"
                placeholder={webTitle ? `Falls back to: "${webTitle}"` : "Inherits Web Title"}
                onFocus={() => (lastFocusedRef.current = "emailSubject")}
                className={inputClass}
              />
            </div>

            {/* Email Content */}
            <div className="space-y-2">
              <FieldLabel>Email Body</FieldLabel>
              <p className="text-xs text-slate-500">
                If empty, falls back to the Web Notification Content.
              </p>
              <textarea
                {...emailContentRest}
                ref={(el) => { emailContentRhfRef(el); emailContentRef.current = el; }}
                rows={5}
                placeholder={webContent ? `Falls back to:\n"${webContent}"` : "Inherits Web Content"}
                onFocus={() => (lastFocusedRef.current = "emailContent")}
                className={`${inputClass} resize-y min-h-[150px] max-h-[500px]`}
              />
            </div>
          </>
        )}

        {/* Available Variables */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FieldLabel>Available Variables</FieldLabel>
            <Info className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">
              Click to insert at cursor
            </span>
          </div>
          <VariableChips
            variables={meta.variables}
            onInsert={insertVariable}
          />
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FieldLabel>Live Preview</FieldLabel>
            <Eye className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">
              Sample values substituted
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <style dangerouslySetInnerHTML={{ __html: `
              .preview-html ul {
                list-style-type: disc !important;
                padding-left: 1.25rem !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              .preview-html ol {
                list-style-type: decimal !important;
                padding-left: 1.25rem !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              .preview-html li {
                display: list-item !important;
                margin-bottom: 0.25rem !important;
              }
              .email-paper {
                background-color: #ffffff !important;
                color: #1e293b !important;
                border-radius: 16px !important;
                padding: 1.5rem !important;
                width: 100% !important;
                max-width: 600px !important;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important;
                border: 1px solid #e2e8f0 !important;
                line-height: 1.6 !important;
                text-align: left !important;
              }
              .email-paper a {
                color: #3b82f6 !important;
                text-decoration: underline !important;
              }
              .email-paper a[style*="background-color"] {
                color: #ffffff !important;
                text-decoration: none !important;
              }
              .email-paper mark {
                background-color: #ecfeff !important;
                color: #0891b2 !important;
              }
            `}} />

            {channel === "email" ? (
              <div className="space-y-4">
                {/* Email Subject block */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <span className="shrink-0 text-xs font-semibold text-slate-500 w-16">
                    Subject
                  </span>
                  <p
                    className="text-sm text-slate-200 font-semibold preview-html"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(interpolatePreview(previewTitle), { ADD_ATTR: ["style", "target"] }),
                    }}
                  />
                </div>

                {/* Simulated Email Canvas */}
                <div className="rounded-xl bg-slate-950/80 p-6 flex justify-center border border-white/5">
                  <div
                    className="email-paper preview-html text-sm"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(interpolatePreview(previewContent), { ADD_ATTR: ["style", "target"] }),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Web Title block */}
                <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                  <span className="shrink-0 text-xs font-semibold text-slate-500 w-16 pt-0.5">
                    Title
                  </span>
                  <p
                    className="text-sm text-slate-200 font-semibold preview-html"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(interpolatePreview(previewTitle), { ADD_ATTR: ["style", "target"] }),
                    }}
                  />
                </div>

                {/* Web Content block */}
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-xs font-semibold text-slate-500 w-16 pt-0.5">
                    Content
                  </span>
                  <p
                    className="text-sm text-slate-300 leading-relaxed preview-html"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(interpolatePreview(previewContent), { ADD_ATTR: ["style", "target"] }),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          {/* Restore Default — only visible if template exists in DB */}
          <div>
            {template?.id ? (
              <button
                type="button"
                onClick={onReset}
                disabled={resetting}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 transition hover:text-white hover:bg-white/10 disabled:opacity-50"
              >
                {resetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Restore Default
              </button>
            ) : (
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                Using dispatcher fallback — save to persist
              </p>
            )}
          </div>

          {/* Save */}
          <Button
            type="submit"
            disabled={saving || (!isDirty && !!template)}
            variant="glass"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
