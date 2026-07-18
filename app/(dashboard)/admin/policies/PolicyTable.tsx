"use client";

import { AlertTriangle } from "lucide-react";
import { useRegulations } from "@/hooks/regulation/useRegulations";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import PolicyRow from "./PolicyRow";

const COLUMNS = "minmax(250px, 3fr) 80px 150px 150px 120px 60px";

export default function PolicyTable() {
  const { data, isPending, isError } = useRegulations();

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
        <p className="text-sm text-slate-400">Failed to load policies.</p>
      </MetalCard>
    );
  }

  if (regulations.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-slate-500">No policies found.</p>
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
          <div>Policy & Description</div>
          <div>Version</div>
          <div>Created Date</div>
          <div>Last Updated</div>
          <div>Status</div>
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
