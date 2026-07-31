"use client";

import { Building2 } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

export default function DepartmentHeader() {
    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-cyan-400 shrink-0" />
                            <h2 className="text-2xl font-bold metal-text">
                                Department Overview
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            View departments and manage their job positions.
                        </p>
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}
