"use client";

import { CheckSquare } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

export default function InternTaskHeader() {
  return (
    <MetalCard>
      <div className="rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-cyan-400/10">
            <CheckSquare className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold metal-text">My Tasks</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and submit your assigned tasks.
            </p>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
