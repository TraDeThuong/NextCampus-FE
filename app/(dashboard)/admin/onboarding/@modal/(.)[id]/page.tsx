"use client";

import { useParams, useRouter } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import ApplicationDetail from "../../ApplicationDetailModal";


export default function InterceptedDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={() => router.back()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100vh-4rem)] w-full max-w-[min(96vw,72rem)] overflow-y-auto rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        {/* Chrome line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        {/* Close button */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:text-foreground"
        >
          <HiXMark className="h-5 w-5" />
        </button>

        <ApplicationDetail id={params.id} />
      </div>
    </div>
  );
}
