"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileText,
  CircleCheck,
} from "lucide-react";

import { getActiveRegulationService } from "@/services/regulation.service";
import type { Regulation } from "@/types/regulation";
import MetalCard from "@/components/ui/MetalCard";

import DOMPurify from "isomorphic-dompurify";

export default function PoliciesPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    getActiveRegulationService()
      .then((res) => setRegulation(res.data))
      .catch(() => setError("Failed to load policies."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-6 py-4 text-zinc-300 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span>Loading internship policies...</span>
        </div>
      </div>
    );
  }

  if (error || !regulation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex max-w-md items-start gap-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <AlertTriangle className="mt-0.5 h-6 w-6 text-red-400" />

          <div>
            <h2 className="font-semibold text-red-300">
              Unable to load policies
            </h2>

            <p className="mt-1 text-sm text-red-200/80">
              {error || "No active regulation found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(regulation.content);

return (
  <div className="w-full space-y-6 m-10mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-10">
    {/* Hero */}

    <MetalCard className="p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10">
          <ShieldCheck className="h-8 w-8 text-sky-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Internship Policies & Regulations
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            Please read all internship regulations carefully before continuing
            your onboarding process.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              Version{" "}
              <span className="font-semibold text-white">
                {regulation.version}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              Active Regulation
            </div>
          </div>
        </div>
      </div>
    </MetalCard>

    {/* Summary cards */}

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetalCard className="h-full p-5">
        <FileText className="mb-4 h-6 w-6 text-sky-400" />

        <h3 className="font-semibold text-white">
          Read Carefully
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Review all internship policies before submitting your application.
        </p>
      </MetalCard>

      <MetalCard className="h-full p-5">
        <CircleCheck className="mb-4 h-6 w-6 text-emerald-400" />

        <h3 className="font-semibold text-white">
          Compliance
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Interns must comply with company rules and internal regulations.
        </p>
      </MetalCard>

      <MetalCard className="h-full p-5 md:col-span-2 xl:col-span-1">
        <ShieldCheck className="mb-4 h-6 w-6 text-violet-400" />

        <h3 className="font-semibold text-white">
          Confirmation
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Confirm that you have read and accepted the regulations.
        </p>
      </MetalCard>
    </div>

    {/* Policy content */}

    <MetalCard className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">
          {regulation.title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Internship regulations document
        </p>
      </div>

      <div
        className="
          prose prose-invert
          max-h-[60vh]
          overflow-y-auto
          px-6 py-6
          md:px-8
          prose-headings:text-white
          prose-p:text-zinc-300
          prose-li:text-zinc-300
        "
        dangerouslySetInnerHTML={{
          __html: sanitizedContent,
        }}
      />
    </MetalCard>

    {/* Agreement */}

    <MetalCard className="p-5 md:p-6">
      <label className="flex cursor-pointer items-start gap-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-5 w-5 accent-sky-500"
        />

        <div className="min-w-0">
          <p className="font-medium text-white">
            I agree to the internship regulations.
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-400">
            I confirm that I have read, understood, and accepted all policies.
          </p>
        </div>
      </label>
    </MetalCard>

    {/* Button */}

    <button
      disabled={!agreed}
      onClick={() => router.push(`/onboarding/${params.token}/form`)}
      className="
        w-full rounded-2xl
        bg-gradient-to-r
        from-sky-500
        to-cyan-400
        px-6 py-4
        text-sm font-semibold text-white
        shadow-[0_0_35px_rgba(21,174,245,0.25)]
        transition-all
        hover:-translate-y-1
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      Agree & Continue
    </button>
  </div>
); 
}