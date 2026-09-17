"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRegulations } from "@/hooks/regulation/useRegulations";
import type { RegulationQueryParams } from "@/types/regulation";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import PolicyRow from "./PolicyRow";

const COLUMNS = "minmax(250px, 2fr) 100px 150px 150px 160px 40px";

export default function PolicyTable() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const params: RegulationQueryParams = useMemo(() => {
    const p: RegulationQueryParams = {};
    const title = searchParams.get("title");
    const isActive = searchParams.get("isActive");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (title) p.title = title;
    if (isActive) p.isActive = isActive === "true";
    if (page) p.page = Number(page);
    if (limit) p.limit = Number(limit);

    return p;
  }, [searchParams]);

  const { data, isPending, isError } = useRegulations(params);

  const regulations = data?.items ?? [];

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
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-400">{t("admin.policies.loadError")}</p>
      </MetalCard>
    );
  }

  if (regulations.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-slate-500">{t("admin.policies.noPolicies")}</p>
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
          <div>{t("admin.policies.colTitle")}</div>
          <div>{t("admin.policies.colVersion")}</div>
          <div>{t("admin.policies.colCreated")}</div>
          <div>{t("admin.policies.colUpdated")}</div>
          <div>{t("admin.policies.colStatus")}</div>
          <div />
        </Table.Header>

        <Table.Body
          data={regulations}
          render={(policy) => <PolicyRow key={policy.id} policy={policy} />}
        />
      </Table>
    </Modal>
  );
}
