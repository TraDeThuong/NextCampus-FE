"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Users,
  KeyRound,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import type { Role } from "@/types/rbac";
import Table from "@/components/ui/Table";

interface RoleRowProps {
  role: Role;
  onOpenEdit: (role: Role) => void;
  onOpenPermissions: (role: Role) => void;
  onOpenUsers: (role: Role) => void;
  onOpenDelete: (role: Role) => void;
}

export default function RoleRow({
  role,
  onOpenEdit,
  onOpenPermissions,
  onOpenUsers,
  onOpenDelete,
}: RoleRowProps) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const isDeletable = !role.isSystem && role.userCount === 0;

  // Standardized 3-Dots Portal Action Menu (Rule 76-82 of AGENTS.md)
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) {
      setMenuOpen(false);
      return;
    }

    const MENU_WIDTH = Math.min(190, vw - 24);
    const ESTIMATED_HEIGHT = 180;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;

    const maxHeight = openUpward
      ? Math.min(260, Math.max(100, spaceAbove - 16))
      : Math.min(260, Math.max(100, spaceBelow - 16));

    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8));

    setMenuStyle({
      position: "fixed",
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? vh - rect.top + 6 : undefined,
      left,
      width: MENU_WIDTH,
      maxHeight,
      overflowY: "auto",
      zIndex: 9999,
    });
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!menuOpen) {
      updateMenuPosition();
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <Table.Row className="group transition-colors duration-150 hover:bg-card/40">
      {/* 1. Role Name & Description */}
      <div className="flex items-start gap-3 min-w-0 pr-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            role.isSystem
              ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-400"
              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {role.isSystem ? (
            <ShieldCheck className="h-5 w-5 shrink-0" />
          ) : (
            <Sparkles className="h-5 w-5 shrink-0" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground group-hover:text-cyan-400 transition-colors truncate">
            {role.name}
          </p>
          <p
            title={role.description || t("admin.roles.table.noDescription")}
            className="mt-0.5 text-xs text-muted-foreground line-clamp-1 max-w-sm"
          >
            {role.description || t("admin.roles.table.noDescription")}
          </p>
        </div>
      </div>

      {/* 2. Role Type Badge */}
      <div className="flex items-center">
        {role.isSystem ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
            <Lock className="h-3 w-3 shrink-0" />
            <span>{t("admin.roles.table.systemBadge")}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>{t("admin.roles.table.customBadge")}</span>
          </span>
        )}
      </div>

      {/* 3. Users Count */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onOpenUsers(role)}
          title={t("admin.roles.table.usersBtn")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-cyan-400/40 hover:text-cyan-400 hover:bg-cyan-500/5 active:scale-95 group/btn cursor-pointer"
        >
          <Users className="h-3.5 w-3.5 shrink-0 text-muted group-hover/btn:text-cyan-400" />
          <span className="font-medium text-foreground group-hover/btn:text-cyan-400">
            {t("admin.roles.table.usersCountLabel", {
              count: role.userCount,
            })}
          </span>
        </button>
      </div>

      {/* 4. Permissions Count */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onOpenPermissions(role)}
          title={t("admin.roles.table.permissionsBtn")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/5 active:scale-95 group/btn cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5 shrink-0 text-cyan-400 group-hover/btn:text-emerald-400" />
          <span className="font-medium text-foreground group-hover/btn:text-emerald-400">
            {t("admin.roles.table.permissionsCountLabel", {
              count: role.permissions?.length ?? 0,
            })}
          </span>
        </button>
      </div>

      {/* 5. Actions 3-Dots Menu Trigger */}
      <div className="flex items-center justify-end">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={`role-action-menu-${menuId}`}
          onClick={toggleMenu}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-card/40 text-muted transition hover:border-white/20 hover:bg-card hover:text-foreground active:scale-95"
          title={t("admin.roles.table.moreActions")}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen &&
          createPortal(
            <div
              ref={menuRef}
              id={`role-action-menu-${menuId}`}
              role="menu"
              style={menuStyle}
              className="rounded-2xl border border-white/10 bg-[#0c1322]/95 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.6)] backdrop-blur-2xl animate-fadeIn"
            >
              {/* Users item */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenUsers(role);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-foreground/90 transition hover:bg-indigo-500/15 hover:text-indigo-300 active:scale-98"
              >
                <Users className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>{t("admin.roles.table.usersBtn")}</span>
              </button>

              {/* Permissions item */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPermissions(role);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-foreground/90 transition hover:bg-cyan-500/15 hover:text-cyan-300 active:scale-98"
              >
                <KeyRound className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>{t("admin.roles.table.permissionsBtn")}</span>
              </button>

              {/* Edit item */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenEdit(role);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-foreground/90 transition hover:bg-white/10 hover:text-foreground active:scale-98"
              >
                <Edit2 className="h-4 w-4 shrink-0 text-muted" />
                <span>{t("admin.roles.table.editBtn")}</span>
              </button>

              {/* Delete item */}
              <button
                type="button"
                role="menuitem"
                disabled={!isDeletable}
                onClick={() => {
                  if (!isDeletable) return;
                  setMenuOpen(false);
                  onOpenDelete(role);
                }}
                title={
                  role.isSystem
                    ? t("admin.roles.table.deleteDisabledSystem")
                    : role.userCount > 0
                    ? t("admin.roles.table.deleteDisabledUsers", {
                        count: role.userCount,
                      })
                    : t("admin.roles.table.deleteBtn")
                }
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition active:scale-98 ${
                  isDeletable
                    ? "text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
                    : "text-muted/40 cursor-not-allowed opacity-50"
                }`}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>{t("admin.roles.table.deleteBtn")}</span>
              </button>
            </div>,
            document.body,
          )}
      </div>
    </Table.Row>
  );
}
