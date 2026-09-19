"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Globe,
  Mail,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  UserX,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import Select, { type SelectOption } from "@/components/ui/Select";
import { TEMPLATE_CATALOG } from "./TemplateSidebar";
import { notificationService } from "@/services/notification.service";
import { getUsersService } from "@/services/user.service";
import type { User } from "@/types/user";
import DOMPurify from "isomorphic-dompurify";

type Channel = "web" | "email";

export default function SendNotificationTab() {
  const t = useTranslations();
  const isSubmittingRef = useRef(false);
  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedTemplateType, setSelectedTemplateType] = useState("");
  const [sendWeb, setSendWeb] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  // Form Fields
  const [webTitle, setWebTitle] = useState("");
  const [webContent, setWebContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const [channel, setChannel] = useState<Channel>("web");
  const [sending, setSending] = useState(false);

  // Options for template dropdown
  const templateOptions = useMemo<SelectOption[]>(() => {
    return [
      { value: "", label: t("admin.emails.selectTemplate") },
      ...TEMPLATE_CATALOG.map((item) => {
        const itemLabel = t.has(`admin.emails.catalog.${item.type}.label`)
          ? t(`admin.emails.catalog.${item.type}.label`)
          : item.label;
        return {
          value: item.type,
          label: `${itemLabel} (${item.type})`,
        };
      }),
    ];
  }, [t]);

  // Debounced search recipient on email input change
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = email.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!isValid) {
        setRecipient(null);
        setSearchError("");
        return;
      }

      setSearching(true);
      setSearchError("");
      try {
        const res = await getUsersService({ email: trimmed, limit: 1 });
        const user = res.data?.[0];
        if (user && user.email.toLowerCase() === trimmed.toLowerCase()) {
          setRecipient(user);
        } else {
          setRecipient(null);
          setSearchError(t("admin.emails.noUserFound"));
        }
      } catch {
        setRecipient(null);
        setSearchError(t("admin.emails.verifyEmailFailed"));
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email, t]);

  // Handle template selection to prefill form
  function handleSelectTemplate(type: string) {
    setSelectedTemplateType(type);
    if (!type) {
      return;
    }

    const meta = TEMPLATE_CATALOG.find((item) => item.type === type);
    if (meta) {
      setWebTitle(meta.defaults.titleTemplate || "");
      setWebContent(meta.defaults.contentTemplate || "");
      setEmailSubject(meta.defaults.emailSubjectTemplate || "");
      setEmailContent(meta.defaults.emailContentTemplate || "");

      // Adjust channel settings depending on template capabilities
      const hasWeb = (meta.channels as readonly string[]).includes("web");
      setSendWeb(hasWeb);
      setSendEmail((meta.channels as readonly string[]).includes("email"));

      // Shift tab view to available channel
      if (!hasWeb) {
        setChannel("email");
      } else {
        setChannel("web");
      }
    }
  }

  async function handleSend() {
    if (isSubmittingRef.current) return;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isEmailValid) {
      toast.error(t("admin.emails.validEmailRequired"));
      return;
    }
    if (!sendWeb && !sendEmail) {
      toast.error(t("admin.emails.selectChannel"));
      return;
    }
    if (sendWeb) {
      if (!recipient) {
        toast.error(t("admin.emails.registeredUserRequired"));
        return;
      }
      if (!webTitle.trim() || !webContent.trim()) {
        toast.error(t("admin.emails.webFieldsRequired"));
        return;
      }
    }
    if (sendEmail) {
      const finalSubject = emailSubject.trim() || webTitle.trim();
      const finalContent = emailContent.trim() || webContent.trim();
      if (!finalSubject || !finalContent) {
        toast.error(t("admin.emails.emailFieldsRequired"));
        return;
      }
    }

    isSubmittingRef.current = true;
    setSending(true);
    try {
      await notificationService.sendCustomNotification({
        email,
        title: webTitle,
        content: webContent,
        emailSubject: emailSubject || undefined,
        emailContent: emailContent || undefined,
        sendWeb,
        sendEmail,
      });

      toast.success(t("admin.emails.notifSent"));
      // Reset form on success
      setWebTitle("");
      setWebContent("");
      setEmailSubject("");
      setEmailContent("");
      setSelectedTemplateType("");
      setEmail("");
      setRecipient(null);
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("admin.emails.notifFailed");
      toast.error(errMsg);
    } finally {
      isSubmittingRef.current = false;
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-xl bg-card border border-border text-foreground px-4 py-2.5 sm:py-3 text-sm h-[42px] sm:h-[46px] outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-muted/60";

  const textareaClass =
    "w-full rounded-xl bg-card border border-border text-foreground px-4 py-2.5 sm:py-3 text-sm outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-muted/60 custom-scrollbar";

  const previewTitle =
    channel === "web"
      ? webTitle || "—"
      : emailSubject || webTitle || "—";

  const previewContent =
    channel === "web"
      ? webContent || "—"
      : emailContent || webContent || "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Configuration Form */}
      <div className="space-y-6 rounded-3xl border border-border bg-card/90 dark:bg-[#0c1222]/90 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,.35)] backdrop-blur-xl">
        {/* Recipient Lookup */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
            {t("admin.emails.recipientEmail")}
            <span className="text-danger font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("admin.emails.emailPlaceholder")}
              className={`${inputClass} pr-10`}
            />
            <div className="absolute right-3.5 top-3 text-muted pointer-events-none">
              {searching ? (
                <Spinner size="sm" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          </div>

          {recipient && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-emerald-400 text-xs sm:text-sm shadow-sm animate-fadeIn">
              <UserCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {t("admin.emails.foundUser", {
                    name: recipient.fullName ?? "",
                    role: recipient.role?.name ?? "",
                  })}
                </p>
                <p className="text-xs text-muted mt-0.5">{recipient.email}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            </div>
          )}

          {!recipient &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
            !searching && (
              <div
                className={`flex items-start gap-3 rounded-2xl p-3.5 text-xs sm:text-sm border shadow-sm animate-fadeIn ${
                  sendWeb
                    ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-300"
                }`}
              >
                {sendWeb ? (
                  <UserX className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-relaxed">
                    {sendWeb
                      ? t("admin.emails.userNotRegistered")
                      : t("admin.emails.guestUser")}
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Standardized Select for Template */}
        <div className="space-y-2">
          <Select
            label={t("admin.emails.prefillTemplate")}
            placeholder={t("admin.emails.selectTemplate")}
            options={templateOptions}
            value={selectedTemplateType}
            onChange={(val) => handleSelectTemplate(val)}
            searchable
          />
        </div>

        {/* Channels Checkbox Cards */}
        <div className="space-y-2.5 border-t border-border/80 pt-5">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none block">
            {t("admin.emails.dispatchChannels")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Web Card */}
            <label
              className={`
                flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 select-none
                ${
                  sendWeb
                    ? "border-cyan-400/40 bg-cyan-500/10 text-foreground shadow-sm"
                    : "border-border bg-card/60 text-muted hover:border-border-strong hover:bg-white/5"
                }
              `}
            >
              <input
                type="checkbox"
                checked={sendWeb}
                onChange={(e) => setSendWeb(e.target.checked)}
                className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 min-w-0">
                <Globe
                  className={`h-4 w-4 shrink-0 ${
                    sendWeb ? "text-cyan-400" : "text-muted"
                  }`}
                />
                <span className="text-xs sm:text-sm font-medium">
                  {t("admin.emails.webNotification")}
                </span>
              </div>
            </label>

            {/* Email Card */}
            <label
              className={`
                flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 select-none
                ${
                  sendEmail
                    ? "border-cyan-400/40 bg-cyan-500/10 text-foreground shadow-sm"
                    : "border-border bg-card/60 text-muted hover:border-border-strong hover:bg-white/5"
                }
              `}
            >
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 min-w-0">
                <Mail
                  className={`h-4 w-4 shrink-0 ${
                    sendEmail ? "text-cyan-400" : "text-muted"
                  }`}
                />
                <span className="text-xs sm:text-sm font-medium">
                  {t("admin.emails.emailMessage")}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Form Editors */}
        <div className="border-t border-border/80 pt-5 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border/80 pt-1">
            {sendWeb && (
              <button
                type="button"
                onClick={() => setChannel("web")}
                className={`
                  flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${
                    channel === "web"
                      ? "border border-b-0 border-border bg-card text-cyan-400 shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span>{t("admin.emails.webContent_tab")}</span>
              </button>
            )}

            {sendEmail && (
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`
                  flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${
                    channel === "email"
                      ? "border border-b-0 border-border bg-card text-cyan-400 shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{t("admin.emails.emailContent_tab")}</span>
              </button>
            )}
          </div>

          {/* Editors body */}
          {channel === "web" && sendWeb && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                  {t("admin.emails.notifTitle")}
                  <span className="text-danger font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder={t("admin.emails.titlePlaceholder")}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                  {t("admin.emails.notifContent")}
                  <span className="text-danger font-bold">*</span>
                </label>
                <textarea
                  value={webContent}
                  onChange={(e) => setWebContent(e.target.value)}
                  rows={5}
                  placeholder={t("admin.emails.contentPlaceholder")}
                  className={`${textareaClass} resize-none`}
                />
              </div>
            </div>
          )}

          {channel === "email" && sendEmail && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                  {t("admin.emails.emailSubject")}
                  <span className="text-danger font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={
                    webTitle
                      ? `${t("admin.emails.fallsBackWebTitle")}: "${webTitle}"`
                      : t("admin.emails.fallsBackWebTitle")
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                  {t("admin.emails.emailBody")}
                  <span className="text-danger font-bold">*</span>
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={6}
                  placeholder={
                    webContent
                      ? `${t("admin.emails.fallsBackWebContent")}:\n"${webContent}"`
                      : t("admin.emails.fallsBackWebContent")
                  }
                  className={`${textareaClass} resize-y min-h-[140px] max-h-[480px]`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Send Action Button */}
        <div className="border-t border-border/80 pt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={
              sending ||
              !email.includes("@") ||
              email.trim().length <= 3 ||
              (sendWeb && !recipient)
            }
            className="
              group relative inline-flex items-center justify-center gap-2 overflow-hidden
              rounded-xl sm:rounded-2xl
              h-[42px] sm:h-[46px] px-6 sm:px-8
              bg-gradient-to-r from-(--primary-main) to-(--primary-light)
              text-sm font-semibold text-white
              shadow-[0_0_25px_rgba(21,174,245,0.25)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(21,174,245,0.4)] hover:brightness-110
              active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
              disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer select-none
            "
          >
            <span
              className="
                pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12
                bg-white/30 blur-lg
                transition-all duration-700
                group-hover:left-[130%]
              "
            />
            <span className="relative flex items-center gap-2">
              {sending ? (
                <Spinner size="sm" />
              ) : (
                <Send className="h-4 w-4 shrink-0" />
              )}
              <span>{t("admin.emails.sendNotification")}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="space-y-6 rounded-3xl border border-border bg-card/90 dark:bg-[#0c1222]/90 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,.35)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted">
              {t("admin.emails.livePreview")}
            </label>
            <Eye className="h-4 w-4 text-cyan-400 shrink-0" />
          </div>
          <span className="text-xs text-muted">
            {t("admin.emails.actualPreview")}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4 min-h-[320px] shadow-inner">
          <style
            dangerouslySetInnerHTML={{
              __html: `
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
                max-width: 620px !important;
                box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
                border: 1px solid #e2e8f0 !important;
                line-height: 1.6 !important;
                text-align: left !important;
              }
              .email-paper a {
                color: #2563eb !important;
                text-decoration: underline !important;
              }
              .email-paper a[style*="background-color"] {
                color: #ffffff !important;
                text-decoration: none !important;
              }
            `,
            }}
          />

          {channel === "email" && sendEmail ? (
            <div className="space-y-4">
              {/* Envelope Meta Header */}
              <div className="rounded-xl border border-border bg-card p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted w-14 shrink-0">
                    {t("admin.emails.subject")}:
                  </span>
                  <p className="text-foreground font-semibold preview-html truncate">
                    {previewTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <span className="font-semibold w-14 shrink-0">
                    {t("admin.emails.recipientEmail")}:
                  </span>
                  <span className="font-mono text-cyan-400">
                    {email.trim() || "recipient@example.com"}
                  </span>
                </div>
              </div>

              {/* Email Content Canvas */}
              <div className="rounded-2xl bg-slate-950/80 p-4 sm:p-6 flex justify-center border border-border">
                <div
                  className="email-paper preview-html text-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(previewContent, {
                      ADD_ATTR: ["style", "target"],
                    }),
                  }}
                />
              </div>
            </div>
          ) : (
            /* Simulated Web Notification Popover Item */
            <div className="rounded-2xl border border-cyan-400/20 bg-card p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                    <Bell className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    NexCampus System
                  </span>
                </div>
                <span className="text-[11px] text-muted">
                  {t("admin.emails.justNow")}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground preview-html">
                  {previewTitle}
                </p>
                <p className="text-xs sm:text-sm text-muted leading-relaxed preview-html">
                  {previewContent}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
