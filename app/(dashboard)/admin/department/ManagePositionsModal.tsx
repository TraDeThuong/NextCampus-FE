"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import type { Department } from "@/types/department";
import { useCreatePosition } from "@/hooks/department/useCreatePosition";
import { useUpdatePosition } from "@/hooks/department/useUpdatePosition";
import { useDeletePosition } from "@/hooks/department/useDeletePosition";
import {
  PREDEFINED_POSITIONS,
  GENERAL_POSITIONS,
} from "@/types/department";
import { useRBAC } from "@/hooks/rbac/useRBAC";

interface ManagePositionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export default function ManagePositionsModal({
  isOpen,
  onClose,
  department,
}: ManagePositionsModalProps) {
  const t = useTranslations();
  const { can } = useRBAC();
  const canCreatePos = can("POSITION_CREATE");
  const canUpdatePos = can("POSITION_UPDATE");
  const canDeletePos = can("POSITION_DELETE");

  const { mutate: createPosition, isPending: creating } = useCreatePosition();
  const { mutate: updatePosition } = useUpdatePosition();
  const { mutate: deletePosition } = useDeletePosition();

  const [newPositionName, setNewPositionName] = useState("");
  const [addPosSuggestIdx, setAddPosSuggestIdx] = useState(0);
  const [originalNewPosTyped, setOriginalNewPosTyped] = useState("");

  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editingPosName, setEditingPosName] = useState("");
  const [editPosSuggestIdx, setEditPosSuggestIdx] = useState(0);
  const [originalEditPosTyped, setOriginalEditPosTyped] = useState("");

  if (!department) return null;

  const predefinedForDept =
    PREDEFINED_POSITIONS[department.name] || GENERAL_POSITIONS;

  const newPosExists = department.positions.some(
    (p) => p.name.toLowerCase().trim() === newPositionName.toLowerCase().trim()
  );

  const handleAddPosition = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newPositionName.trim();
    if (!trimmed) return;
    if (newPosExists) {
      toast.error(t("admin.department.positionExistsWarning"));
      return;
    }

    createPosition(
      {
        name: trimmed,
        departmentId: department.id,
      },
      {
        onSuccess: () => {
          setNewPositionName("");
          setOriginalNewPosTyped("");
        },
      }
    );
  };

  const handleAddPosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      const matches = predefinedForDept.filter((p) =>
        p.toLowerCase().includes(originalNewPosTyped.toLowerCase())
      );
      if (matches.length > 0) {
        e.preventDefault();
        if (matches.length === 1) {
          setNewPositionName(matches[0]);
        } else {
          const index = addPosSuggestIdx % matches.length;
          setNewPositionName(matches[index]);
          setAddPosSuggestIdx(index + 1);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleAddPosition(e);
    }
  };

  const handleUpdatePos = (posId: string, currentName: string) => {
    const trimmed = editingPosName.trim();
    if (trimmed && trimmed !== currentName) {
      const exists = department.positions.some(
        (p) => p.id !== posId && p.name.toLowerCase().trim() === trimmed.toLowerCase()
      );
      if (exists) {
        toast.error(t("admin.department.positionExistsWarning"));
        return;
      }
      updatePosition({
        id: posId,
        payload: { name: trimmed },
      });
    }
    setEditingPosId(null);
  };

  const handleEditPosKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    posId: string,
    originalName: string
  ) => {
    if (e.key === "Tab") {
      const matches = predefinedForDept.filter((p) =>
        p.toLowerCase().includes(originalEditPosTyped.toLowerCase())
      );
      if (matches.length > 0) {
        e.preventDefault();
        if (matches.length === 1) {
          setEditingPosName(matches[0]);
        } else {
          const index = editPosSuggestIdx % matches.length;
          setEditingPosName(matches[index]);
          setEditPosSuggestIdx(index + 1);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleUpdatePos(posId, originalName);
    } else if (e.key === "Escape") {
      setEditingPosId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-0 sm:p-1 text-left">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <Briefcase className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t("admin.department.positionsOf", { name: department.name })}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.department.positionsCount", {
                count: department.positions.length,
              })}
            </p>
          </div>
        </div>

        {/* Existing Positions List */}
        <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {department.positions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-6 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted/50" />
              <p className="mt-2 text-xs text-muted italic">
                {t("admin.department.noPositionsDefined")}
              </p>
            </div>
          ) : (
            department.positions.map((pos) => {
              const isEditing = editingPosId === pos.id;

              return (
                <div
                  key={pos.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/50 px-3.5 py-2.5 transition hover:border-border-strong hover:bg-card/70"
                >
                  {isEditing ? (
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        list={`positions-list-edit-${pos.id}`}
                        value={editingPosName}
                        onChange={(e) => {
                          setEditingPosName(e.target.value);
                          setOriginalEditPosTyped(e.target.value);
                          setEditPosSuggestIdx(0);
                        }}
                        onKeyDown={(e) =>
                          handleEditPosKeyDown(e, pos.id, pos.name)
                        }
                        onBlur={() => handleUpdatePos(pos.id, pos.name)}
                        className="w-full rounded-lg border border-cyan-400/50 bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-cyan-400/30"
                        autoFocus
                      />
                      <datalist id={`positions-list-edit-${pos.id}`}>
                        {predefinedForDept.map((posName) => (
                          <option key={posName} value={posName} />
                        ))}
                      </datalist>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-foreground truncate">
                      {pos.name}
                    </span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setEditingPosId(null)}
                        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition"
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4 shrink-0" />
                      </button>
                    ) : (
                      <>
                        {canUpdatePos && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPosId(pos.id);
                              setEditingPosName(pos.name);
                              setOriginalEditPosTyped(pos.name);
                              setEditPosSuggestIdx(0);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition active:scale-95 cursor-pointer"
                            aria-label={`Edit ${pos.name}`}
                            title={t("admin.department.rename")}
                          >
                            <Edit3 className="h-4 w-4 shrink-0" />
                          </button>
                        )}
                        {canDeletePos && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  t("admin.department.deletePositionConfirm", {
                                    name: pos.name,
                                  })
                                )
                              ) {
                                deletePosition({
                                  id: pos.id,
                                  departmentId: department.id,
                                });
                              }
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer"
                            aria-label={`Delete ${pos.name}`}
                            title={t("admin.department.delete")}
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Position Form */}
        {canCreatePos && (
          <form
            onSubmit={handleAddPosition}
            className="mt-5 border-t border-border pt-4 space-y-2"
          >
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
            {t("admin.department.addPositionField")}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                list={`positions-list-add-${department.id}`}
                value={newPositionName}
                onChange={(e) => {
                  setNewPositionName(e.target.value);
                  setOriginalNewPosTyped(e.target.value);
                  setAddPosSuggestIdx(0);
                }}
                onKeyDown={handleAddPosKeyDown}
                placeholder={t("admin.department.addPositionPlaceholderRow")}
                disabled={creating}
                className={`w-full rounded-xl border bg-card px-4 py-2 text-sm text-foreground h-[42px] sm:h-[46px] outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60 ${
                  newPosExists
                    ? "border-amber-400/50"
                    : "border-border"
                }`}
              />
              <datalist id={`positions-list-add-${department.id}`}>
                {predefinedForDept.map((posName) => (
                  <option key={posName} value={posName} />
                ))}
              </datalist>
              {newPosExists && (
                <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{t("admin.department.positionExistsWarning")}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={creating || !newPositionName.trim() || newPosExists}
              className="
                inline-flex h-[42px] sm:h-[46px] items-center justify-center gap-1.5
                rounded-xl px-5
                bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                text-xs sm:text-sm font-semibold text-white
                shadow-[0_0_20px_rgba(21,174,245,0.25)]
                transition-all duration-300
                hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(21,174,245,0.4)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                cursor-pointer select-none shrink-0
              "
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Plus className="h-4 w-4 shrink-0" />
              )}
              <span>{t("admin.department.add")}</span>
            </button>
          </div>
        </form>
      )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 mt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card/60 px-5 h-[42px] text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:border-border-strong active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none"
          >
            {t("admin.department.cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
