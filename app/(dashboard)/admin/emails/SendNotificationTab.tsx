"use client";

import { useEffect, useRef, useState } from "react";
import {
  Globe,
  Mail,
  Send,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import { TEMPLATE_CATALOG } from "./TemplateSidebar";
import { notificationService } from "@/services/notification.service";
import { getUsersService } from "@/services/user.service";
import type { User } from "@/types/user";
import Button from "@/components/ui/Button";
import DOMPurify from "isomorphic-dompurify";

type Channel = "web" | "email";

export default function SendNotificationTab() {
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

  // Debounced search recipient on email input change
  useEffect(() => {
    if (!email || !email.includes("@")) {
      setRecipient(null);
      setSearchError("");
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await getUsersService({ email, limit: 1 });
        const user = res.data?.[0];
        if (user) {
          setRecipient(user);
        } else {
          setRecipient(null);
          setSearchError("No user found with this email in database.");
        }
      } catch (err) {
        setRecipient(null);
        setSearchError("Failed to verify email.");
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email]);

  // Handle template selection to prefill form
  function handleSelectTemplate(type: string) {
    setSelectedTemplateType(type);
    if (!type) {
      return;
    }

    const meta = TEMPLATE_CATALOG.find((t) => t.type === type);
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

    const isEmailValid = email.includes("@") && email.trim().length > 3;
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!sendWeb && !sendEmail) {
      toast.error("Please select at least one dispatch channel (Web or Email)");
      return;
    }
    if (sendWeb) {
      if (!recipient) {
        toast.error("A registered user account is required to send Web notifications.");
        return;
      }
      if (!webTitle.trim() || !webContent.trim()) {
        toast.error("Web notification title and content are required.");
        return;
      }
    }
    if (sendEmail) {
      const finalSubject = emailSubject.trim() || webTitle.trim();
      const finalContent = emailContent.trim() || webContent.trim();
      if (!finalSubject || !finalContent) {
        toast.error("Email subject and content are required (or Web fields must be filled to inherit).");
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

      toast.success("Notification dispatched successfully!");
      // Reset form on success
      setWebTitle("");
      setWebContent("");
      setEmailSubject("");
      setEmailContent("");
      setSelectedTemplateType("");
      setEmail("");
      setRecipient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch notification.");
    } finally {
      isSubmittingRef.current = false;
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600 font-mono";

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
      <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,.45)]">
        {/* Recipient Lookup */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recipient Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., intern@nexcampus.vn"
              className={inputClass}
            />
            <div className="absolute right-3 top-3.5 text-slate-500">
              {searching ? (
                <Spinner size="sm" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          </div>

          {recipient && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Found Registered User: <strong>{recipient.fullName}</strong> ({recipient.role?.name})
              </span>
            </div>
          )}

          {!recipient && email.includes("@") && email.trim().length > 3 && !searching && (
            <div className={`flex items-center gap-3 rounded-xl p-3 text-xs border ${
              sendWeb 
                ? "border-red-500/20 bg-red-500/5 text-red-400" 
                : "border-amber-500/20 bg-amber-500/5 text-amber-400"
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {sendWeb 
                  ? "User not registered in database. Cannot send Web notification. Please uncheck Web channel to send Email only."
                  : "Onboarding Candidate / Guest: Message will be sent directly to this email address via SMTP."}
              </span>
            </div>
          )}
        </div>

        {/* Template Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pre-fill from Template (Optional)
          </label>
          <select
            value={selectedTemplateType}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 px-4 text-sm text-slate-300 outline-none transition focus:border-cyan-400/50"
          >
            <option value="">-- Select Template --</option>
            {TEMPLATE_CATALOG.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Channels Checkbox */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Dispatch Channels
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWeb}
                onChange={(e) => setSendWeb(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0"
              />
              Web Notification
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0"
              />
              Email Message
            </label>
          </div>
        </div>

        {/* Form Editors */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10 pt-1">
            {sendWeb && (
              <button
                type="button"
                onClick={() => setChannel("web")}
                className={`
                  flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-medium transition
                  ${
                    channel === "web"
                      ? "border border-b-0 border-white/10 bg-white/5 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                <Globe className="h-3.5 w-3.5" />
                Web Content
              </button>
            )}

            {sendEmail && (
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`
                  flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-medium transition
                  ${
                    channel === "email"
                      ? "border border-b-0 border-white/10 bg-white/5 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                <Mail className="h-3.5 w-3.5" />
                Email Content
              </button>
            )}
          </div>

          {/* Editors body */}
          {channel === "web" && sendWeb && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Notification Body
                </label>
                <textarea
                  value={webContent}
                  onChange={(e) => setWebContent(e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {channel === "email" && sendEmail && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Falls back to Web Title"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Email Body
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={5}
                  placeholder="Falls back to Web Content. HTML tags supported."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="border-t border-white/5 pt-4 flex justify-end">
          <Button
            onClick={handleSend}
            disabled={
              sending || 
              !email.includes("@") || 
              email.trim().length <= 3 || 
              (sendWeb && !recipient)
            }
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-[0_4px_20px_rgba(6,182,212,0.25)] rounded-xl px-5 py-2.5 disabled:opacity-50"
          >
            {sending ? (
              <Spinner size="sm" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Notification
          </Button>
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,.45)]">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Preview
          </label>
          <Eye className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-xs text-slate-600">Actual text dispatch preview</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 min-h-[300px]">
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
          `}} />

          {channel === "email" && sendEmail ? (
            <div className="space-y-4">
              {/* Subject */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="shrink-0 text-xs font-semibold text-slate-500 w-16">
                  Subject
                </span>
                <p className="text-sm text-slate-200 font-semibold preview-html">
                  {previewTitle}
                </p>
              </div>

              {/* Email Content */}
              <div className="rounded-xl bg-slate-950/80 p-6 flex justify-center border border-white/5">
                <div
                  className="email-paper preview-html text-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(previewContent, { ADD_ATTR: ["style", "target"] }),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                <span className="shrink-0 text-xs font-semibold text-slate-500 w-16 pt-0.5">
                  Title
                </span>
                <p className="text-sm text-slate-200 font-semibold preview-html">
                  {previewTitle}
                </p>
              </div>

              {/* Content */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-xs font-semibold text-slate-500 w-16 pt-0.5">
                  Content
                </span>
                <p
                  className="text-sm text-slate-300 leading-relaxed preview-html"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(previewContent, { ADD_ATTR: ["style", "target"] }),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
