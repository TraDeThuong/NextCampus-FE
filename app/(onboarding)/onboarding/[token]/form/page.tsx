"use client";

import { useEffect } from "react";
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
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import { getActiveRegulationService } from "@/services/regulation.service";
import Spinner from "@/components/ui/Spinner";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(9, "Phone must be at least 9 digits").max(15),
  departmentId: z.string().min(1, "Department is required"),
  positionId: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.coerce.number().int().positive("Must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass =
  "w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 hover:border-zinc-700 focus:border-sky-500/50 focus:shadow-[0_0_25px_rgba(21,174,245,0.15)] placeholder:text-zinc-600";

const selectClass = `${inputClass} appearance-none`;

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

  const { data: deptData, isLoading: deptLoading } = useDepartments();
  const departments = deptData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      departmentId: "",
      positionId: "",
      startDate: "",
      duration: undefined as any,
    },
  });

  const selectedDepartmentId = watch("departmentId");
  const { data: posData, isLoading: posLoading } =
    usePositions(selectedDepartmentId || undefined);
  const positions = posData?.data ?? [];

  // Reset position when department changes
  useEffect(() => {
    setValue("positionId", "");
  }, [selectedDepartmentId, setValue]);

  async function onSubmit(data: FormValues) {
    const reg = await getActiveRegulationService().catch(() => null);
    if (!reg) return;

    submitApp(
      {
        fullName: data.fullName,
        email,
        phone: data.phone,
        departmentId: data.departmentId,
        positionId: data.positionId,
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

        <Field label="Department" icon={Building2} error={errors.departmentId?.message}>
          <div className="relative">
            <select
              {...register("departmentId")}
              disabled={deptLoading}
              className={selectClass}
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {deptLoading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
            )}
          </div>
        </Field>

        <Field label="Position" icon={Briefcase} error={errors.positionId?.message}>
          <div className="relative">
            <select
              {...register("positionId")}
              disabled={!selectedDepartmentId || posLoading}
              className={selectClass}
            >
              <option value="">
                {!selectedDepartmentId
                  ? "Select department first..."
                  : "Select position..."}
              </option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {posLoading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
            )}
          </div>
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
