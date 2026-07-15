"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useVerifyInvite } from "@/hooks/application/useVerifyInvite";
import { useCreateApplication } from "@/hooks/application/useCreateApplication";
import { getActiveRegulationService } from "@/services/regulation.service";
import Spinner from "@/components/ui/Spinner";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(9, "Phone must be at least 9 digits").max(15),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.coerce.number().int().positive("Must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

const DEPARTMENTS = [
  "Engineering", "Design", "Marketing", "Data", "QA", "HR", "Product",
];

const POSITIONS = [
  "Backend Intern", "Frontend Intern", "Mobile Intern",
  "UI/UX Intern", "Graphic Intern", "Marketing Intern",
  "Data Intern", "DevOps Intern", "QA Intern", "HR Intern", "Product Intern",
];

const inputClass =
  "w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 hover:border-zinc-700 focus:border-sky-500/50 focus:shadow-[0_0_25px_rgba(21,174,245,0.15)] placeholder:text-zinc-600";

export default function FormPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const {
    data: verifyData,
    isPending: verifying,
    isError: tokenError,
  } = useVerifyInvite(token);

  const { mutate: submitApp, isPending: submitting } = useCreateApplication();

  const email = verifyData?.data?.email ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      department: "",
      position: "",
      startDate: "",
      duration: undefined as any,
    },
  });

  async function onSubmit(data: FormValues) {
    const reg = await getActiveRegulationService().catch(() => null);
    if (!reg) return;

    submitApp(
      {
        fullName: data.fullName,
        email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        startDate: data.startDate,
        duration: data.duration,
        token,
        regulationId: reg.data.id,
        acceptedRegulations: true,
      },
      {
        onSuccess: () => router.push(`/onboarding/${token}/success`),
      },
    );
  }

  if (verifying) {
    return (
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        <Spinner size="lg" />
        <p>Verifying invitation...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <h1 className="text-xl font-bold text-white">Invalid Invitation</h1>
        <p className="text-sm text-zinc-400">
          This invitation link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Intern Application</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Fill out your details to apply for the internship.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Full Name" icon={Mail} error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            placeholder="Nguyen Van A"
            className={inputClass}
          />
        </Field>

        <Field label="Email" icon={Mail}>
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} cursor-not-allowed opacity-60`}
          />
        </Field>

        <Field label="Phone" icon={Phone} error={errors.phone?.message}>
          <input
            {...register("phone")}
            placeholder="0987654321"
            className={inputClass}
          />
        </Field>

        <Field label="Department" icon={Building2} error={errors.department?.message}>
          <select {...register("department")} className={`${inputClass} appearance-none`}>
            <option value="">Select department...</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Position" icon={Briefcase} error={errors.position?.message}>
          <select {...register("position")} className={`${inputClass} appearance-none`}>
            <option value="">Select position...</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Start Date" icon={Calendar} error={errors.startDate?.message}>
          <input type="date" {...register("startDate")} className={inputClass} />
        </Field>

        <Field label="Duration (months)" icon={Clock} error={errors.duration?.message}>
          <input
            type="number"
            {...register("duration")}
            placeholder="3"
            min={1}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4 text-sm font-semibold text-white shadow-[0_0_35px_rgba(21,174,245,0.25)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
