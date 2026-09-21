"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Copy, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { CreateApiKeyResult } from "@/types/integration";

interface RevealApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyResult: CreateApiKeyResult | null;
}

export default function RevealApiKeyModal({
  isOpen,
  onClose,
  apiKeyResult,
}: RevealApiKeyModalProps) {
  const t = useTranslations("admin.settings.apiKeys.reveal");
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  if (!apiKeyResult) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKeyResult.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="md">
      <div className="space-y-4 px-1 py-1">
        {/* Warning Alert */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">{t("warning")}</p>
          </div>
        </div>

        {/* Key Info */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted">
            Tên định danh:{" "}
            <strong className="text-foreground font-medium">{apiKeyResult.name}</strong>
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3.5 py-3">
            <code className="flex-1 font-mono text-xs text-primary-light break-all select-all">
              {showKey
                ? apiKeyResult.key
                : apiKeyResult.key.slice(0, 10) + "••••••••••••••••••••••••••••••••"}
            </code>

            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 text-muted hover:text-foreground transition-colors"
              title={showKey ? "Ẩn" : "Hiện"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {t("copyBtn")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border/40">
          <Button variant="primary" size="sm" onClick={onClose}>
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            {t("close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
