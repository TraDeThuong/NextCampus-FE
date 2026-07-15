"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import ApplicationDetail from "../ApplicationDetailModal";
import MetalCard from "@/components/ui/MetalCard";

export default function InviteDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/onboarding"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Onboarding
      </Link>

      <MetalCard className="p-8">
        <ApplicationDetail id={params.id} />
      </MetalCard>
    </div>
  );
}
