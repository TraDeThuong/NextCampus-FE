"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-400" />
      <div>
        <h1 className="text-3xl font-bold text-white">Application Submitted!</h1>
        <p className="mt-3 max-w-md text-sm text-zinc-400">
          Your application has been received. You will receive an email with
          login instructions once your application is approved.
        </p>
      </div>
      <p className="text-xs text-zinc-600">
        You can close this page now.
      </p>
    </div>
  );
}
