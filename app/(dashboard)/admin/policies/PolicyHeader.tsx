"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FilePlus, FileText, Loader2 } from "lucide-react";
import { useCreateRegulation } from "@/hooks/regulation/useCreateRegulation";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import RichTextEditor from "@/components/ui/RichTextEditor";

const policySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  content: z.string().trim().min(1, "Content is required").max(150000, "Content is too long").refine(
    (val) => val.replace(/<[^>]*>/g, "").trim().length > 0,
    { message: "Content cannot be empty" }
  ),
  isActive: z.boolean(),
});

type FormValues = {
  title: string;
  content: string;
  isActive: boolean;
};

export default function PolicyHeader() {
  const { mutate: createPolicy, isPending } = useCreateRegulation();

  return (
    <Modal>
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold metal-text">
                Policy & Regulation Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage company policies, onboarding agreements, and documents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Modal.Open opens="add-policy">
                <button className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20">
                  <FilePlus className="h-4 w-4" />
                  Add Policy
                </button>
              </Modal.Open>
            </div>
          </div>
        </div>
      </MetalCard>

      <Modal.Window name="add-policy" size="md">
        <AddPolicyForm
          isPending={isPending}
          onSubmit={(data) => createPolicy(data)}
        />
      </Modal.Window>
    </Modal>
  );
}

function AddPolicyForm({
  isPending,
  onSubmit,
  onCloseModal,
}: {
  isPending: boolean;
  onSubmit: (data: FormValues) => void;
  onCloseModal?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      title: "",
      content: "",
      isActive: false,
    },
  });

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600";

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Create New Policy</h3>
          <p className="text-xs text-slate-400">
            Fill in the details below to publish a new regulation.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data);
          onCloseModal?.();
        })}
        className="mt-6 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Policy Title</label>
          <input
            type="text"
            placeholder="e.g., Company Onboarding Regulation 2026"
            {...register("title")}
            className={inputClass}
          />
          {errors.title && (
            <p className="text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Content</label>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Write policy details with beautiful Word-like formatting..."
              />
            )}
          />

          {errors.content && (
            <p className="text-xs text-red-400">{errors.content.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <label
            htmlFor="isActive"
            className="text-sm text-slate-300 cursor-pointer select-none"
          >
            Activate this policy immediately (will deactivate previous active policy)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
          <button
            type="button"
            onClick={onCloseModal}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <Button type="submit" disabled={isPending} variant="glass">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Policy"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
