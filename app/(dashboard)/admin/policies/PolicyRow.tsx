"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Play, Trash2, Loader2, Calendar } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Regulation } from "@/types/regulation";
import { useUpdateRegulation } from "@/hooks/regulation/useUpdateRegulation";
import { useDeleteRegulation } from "@/hooks/regulation/useDeleteRegulation";
import { useActivateRegulation } from "@/hooks/regulation/useActivateRegulation";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";

type PolicyRowProps = {
  policy: Regulation;
};

const policySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof policySchema>;

export default function PolicyRow({ policy }: PolicyRowProps) {
  const { mutate: updatePolicy, isPending: updating } = useUpdateRegulation();
  const { mutate: deletePolicy, isPending: deleting } = useDeleteRegulation();
  const { mutate: activatePolicy, isPending: activating } = useActivateRegulation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formattedCreatedDate = new Date(policy.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedUpdatedDate = new Date(policy.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Modal>
      <Table.Row>
        {/* Title */}
        <div className="flex flex-col min-w-0 pr-4">
          <p className="truncate text-sm font-semibold text-white">
            {policy.title}
          </p>
          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {policy.content.replace(/<[^>]*>/g, "")}
          </span>
        </div>

        {/* Version */}
        <div className="text-sm font-medium text-slate-400">
          v{policy.version}
        </div>

        {/* Created At */}
        <div className="text-sm text-slate-400 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          {formattedCreatedDate}
        </div>

        {/* Last Updated */}
        <div className="text-sm text-slate-400 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          {formattedUpdatedDate}
        </div>

        {/* Status */}
        <div>
          <span
            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              policy.isActive
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 bg-slate-800/40 text-slate-400"
            }`}
          >
            {policy.isActive ? "Active" : "Draft/Inactive"}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="relative flex justify-end" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
              <Modal.Open opens={`edit-policy-${policy.id}`}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Content
                </button>
              </Modal.Open>

              {!policy.isActive && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    activatePolicy(policy.id);
                  }}
                  disabled={activating}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  <Play className="h-4 w-4" />
                  {activating ? "Activating..." : "Set as Active"}
                </button>
              )}

              <Modal.Open opens={`delete-policy-${policy.id}`}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Policy
                </button>
              </Modal.Open>
            </div>
          )}
        </div>
      </Table.Row>

      <Modal.Window name={`edit-policy-${policy.id}`} size="md">
        <EditPolicyForm
          policy={policy}
          isPending={updating}
          onSubmit={(data) => updatePolicy({ id: policy.id, payload: data })}
        />
      </Modal.Window>

      <Modal.Window name={`delete-policy-${policy.id}`} size="sm">
        <DeleteConfirm
          title={policy.title}
          isPending={deleting}
          onConfirm={(onCloseModal) => {
            deletePolicy(policy.id, {
              onSuccess: () => onCloseModal?.(),
            });
          }}
        />
      </Modal.Window>
    </Modal>
  );
}

function EditPolicyForm({
  policy,
  isPending,
  onSubmit,
  onCloseModal,
}: {
  policy: Regulation;
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
      title: policy.title,
      content: policy.content,
    },
  });

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600";

  return (
    <div className="px-2 py-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <Edit2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Edit Policy</h3>
          <p className="text-xs text-slate-400">
            Make changes to the policy title and content.
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
          <input type="text" {...register("title")} className={inputClass} />
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
                placeholder="Edit policy details with beautiful Word-like formatting..."
              />
            )}
          />
          {errors.content && (
            <p className="text-xs text-red-400">{errors.content.message}</p>
          )}
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
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirm({
  title,
  isPending,
  onConfirm,
  onCloseModal,
}: {
  title: string;
  isPending: boolean;
  onConfirm: (close?: () => void) => void;
  onCloseModal?: () => void;
}) {
  return (
    <div className="px-2 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <Trash2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">Delete Policy</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
        Are you sure you want to delete policy <strong>{title}</strong>? This action cannot be undone.
      </p>

      <div className="flex justify-center gap-3 pt-6">
        <button
          type="button"
          onClick={onCloseModal}
          disabled={isPending}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(onCloseModal)}
          disabled={isPending}
          className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 text-sm text-white transition disabled:opacity-50 flex items-center justify-center"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Confirm Delete"
          )}
        </button>
      </div>
    </div>
  );
}
