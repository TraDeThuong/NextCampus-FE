"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Mail, UserPlus, RotateCcw } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useApplicationInvites } from "@/hooks/application/useApplicationInvites";
import type { GetApplicationInvitesParams } from "@/types/application";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import OnboardingRow from "./OnboardingRow";

const COLUMNS =
  "minmax(200px,2fr) minmax(130px,1.2fr) minmax(130px,1.2fr) 115px 110px 105px 44px";

export default function OnboardingTable() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params: GetApplicationInvitesParams = useMemo(() => {
    const p: GetApplicationInvitesParams = {};
    const email = searchParams.get("email");
    const inviteStatus = searchParams.get("inviteStatus");
    const applicationStatus = searchParams.get("applicationStatus");
    const department = searchParams.get("departmentId");
    const position = searchParams.get("positionId");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (email) p.email = email;
    if (inviteStatus)
      p.inviteStatus =
        inviteStatus as GetApplicationInvitesParams["inviteStatus"];
    if (applicationStatus)
      p.applicationStatus =
        applicationStatus as GetApplicationInvitesParams["applicationStatus"];
    if (department) p.departmentId = department;
    if (position) p.positionId = position;
    if (createdFrom) p.createdFrom = createdFrom;
    if (createdTo) p.createdTo = createdTo;
    if (page) p.page = Number(page);
    if (limit) p.limit = Number(limit);

    return p;
  }, [searchParams]);

  const { data, isPending, isError, refetch, isFetching } =
    useApplicationInvites(params);

  const invites = data?.data ?? [];
  const meta = data?.meta;

  const hasFilters = Boolean(
    searchParams.get("email") ||
    searchParams.get("inviteStatus") ||
    searchParams.get("applicationStatus") ||
    searchParams.get("departmentId") ||
    searchParams.get("positionId") ||
    searchParams.get("createdFrom") ||
    searchParams.get("createdTo"),
  );

  function goToPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  }

  function clearAllFilters() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("email");
    p.delete("inviteStatus");
    p.delete("applicationStatus");
    p.delete("departmentId");
    p.delete("positionId");
    p.delete("createdFrom");
    p.delete("createdTo");
    p.set("page", "1");
    router.push(`${pathname}?${p.toString()}`);
  }

  if (isPending) {
    return (
      <MetalCard className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-rose-300">
          {t("admin.onboarding.loadTableError")}
        </p>
      </MetalCard>
    );
  }

  if (invites.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-base font-medium text-foreground">
          {t("admin.onboarding.noInvites")}
        </p>
        <p className="text-xs sm:text-sm text-muted max-w-md">
          {t("admin.onboarding.noInvitesDescription")}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-card/60 px-4 py-2 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("admin.onboarding.clearFilters")}
          </button>
        ) : (
          <Modal.Open opens="invite-intern">
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t("admin.onboarding.inviteIntern")}
            </button>
          </Modal.Open>
        )}
      </MetalCard>
    );
  }

  return (
    <Modal>
      <Table
        columns={COLUMNS}
        className="
          bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
          shadow-[0_12px_40px_rgba(0,0,0,.45)]
          hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
          transition-shadow duration-500
        "
      >
        <Table.Header>
          <div>{t("admin.onboarding.colCandidate")}</div>
          <div>{t("admin.onboarding.colDept")}</div>
          <div>{t("admin.onboarding.colPosition")}</div>
          <div>{t("admin.onboarding.colInvite")}</div>
          <div>{t("admin.onboarding.colApp")}</div>
          <div>{t("admin.onboarding.colSent")}</div>
          <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
        </Table.Header>

        <Table.Body
          data={invites}
          render={(invite) => (
            <OnboardingRow key={invite.id} invite={invite} />
          )}
        />

        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <div className="flex w-full items-center justify-between gap-4 text-sm">
              <p className="text-muted">
                {t("admin.onboarding.pagination", {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  total: meta.total,
                })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => goToPage(meta.page - 1)}
                  aria-label="Previous page"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                  aria-label="Next page"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Table.Footer>
        )}
      </Table>
    </Modal>
  );
}
