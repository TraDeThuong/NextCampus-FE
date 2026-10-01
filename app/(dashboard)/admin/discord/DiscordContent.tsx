"use client";

import React, { useState } from "react";
import DiscordHeader from "./DiscordHeader";
import DiscordStats from "./DiscordStats";
import GlobalDiscordChannels from "./GlobalDiscordChannels";
import DepartmentRoutingTable from "./DepartmentRoutingTable";
import DiscordWebhookModal from "./DiscordWebhookModal";
import DiscordDeleteModal from "./DiscordDeleteModal";
import DiscordRoleSyncModal from "./DiscordRoleSyncModal";
import { useDiscordWebhooks } from "@/hooks/discord";
import { useDepartments } from "@/hooks/department/useDepartments";
import type {
  DiscordWebhookConfig,
  DiscordWebhookPurpose,
  DiscordWebhookScope,
} from "@/types/discord";

export default function DiscordContent() {
  const {
    data: webhooksData,
    isLoading: isWebhooksLoading,
    isFetching: isWebhooksFetching,
    isError: isWebhooksError,
    refetch: refetchWebhooks,
  } = useDiscordWebhooks();

  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
  } = useDepartments();

  const webhooks = webhooksData || [];
  const departments = departmentsData?.data || [];

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleSyncOpen, setIsRoleSyncOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] =
    useState<DiscordWebhookConfig | null>(null);
  const [deletingWebhook, setDeletingWebhook] =
    useState<DiscordWebhookConfig | null>(null);

  // Defaults for modal
  const [defaultDeptId, setDefaultDeptId] = useState<string | undefined>();
  const [defaultPurpose, setDefaultPurpose] = useState<
    DiscordWebhookPurpose | undefined
  >();
  const [defaultScope, setDefaultScope] = useState<
    DiscordWebhookScope | undefined
  >();

  // Open modal for generic create
  const handleOpenCreate = () => {
    setEditingWebhook(null);
    setDefaultDeptId(undefined);
    setDefaultPurpose(undefined);
    setDefaultScope(undefined);
    setIsModalOpen(true);
  };

  // Open modal with pre-selected global purpose (e.g. LEADERBOARD)
  const handleOpenCreateWithPurpose = (purpose: DiscordWebhookPurpose) => {
    setEditingWebhook(null);
    setDefaultDeptId(undefined);
    setDefaultPurpose(purpose);
    setDefaultScope("GLOBAL");
    setIsModalOpen(true);
  };

  // Open modal with pre-selected department and purpose
  const handleOpenCreateForDept = (
    deptId: string,
    purpose?: DiscordWebhookPurpose
  ) => {
    setEditingWebhook(null);
    setDefaultDeptId(deptId);
    setDefaultPurpose(purpose);
    setDefaultScope("DEPARTMENT");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (webhook: DiscordWebhookConfig) => {
    setEditingWebhook(webhook);
    setDefaultDeptId(webhook.departmentId || undefined);
    setDefaultPurpose(webhook.purpose);
    setDefaultScope(webhook.scope);
    setIsModalOpen(true);
  };

  // Open delete modal
  const handleOpenDelete = (webhook: DiscordWebhookConfig) => {
    setDeletingWebhook(webhook);
  };

  return (
    <div className="space-y-6">
      {/* Header with Cyberpunk styling, Add Webhook & Batch Role Sync buttons */}
      <DiscordHeader
        onOpenCreate={handleOpenCreate}
        onOpenRoleSync={() => setIsRoleSyncOpen(true)}
      />

      {/* 4 Stats Cards */}
      <DiscordStats
        webhooks={webhooks}
        isLoading={isWebhooksLoading}
        isError={isWebhooksError}
      />

      {/* Global Server Channels (#vinh-danh and #leader-hq) */}
      <GlobalDiscordChannels
        webhooks={webhooks}
        onOpenCreateWithPurpose={handleOpenCreateWithPurpose}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
      />

      {/* Department Routing Matrix Table */}
      <DepartmentRoutingTable
        departments={departments}
        webhooks={webhooks}
        isLoading={isDepartmentsLoading || isWebhooksLoading}
        isFetching={isWebhooksFetching}
        refetch={refetchWebhooks}
        onOpenCreateForDept={handleOpenCreateForDept}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
      />

      {/* Create / Edit Modal */}
      <DiscordWebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingWebhook={editingWebhook}
        departments={departments}
        defaultDepartmentId={defaultDeptId}
        defaultPurpose={defaultPurpose}
        defaultScope={defaultScope}
      />

      {/* Batch Role Sync Modal */}
      <DiscordRoleSyncModal
        isOpen={isRoleSyncOpen}
        onClose={() => setIsRoleSyncOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DiscordDeleteModal
        isOpen={!!deletingWebhook}
        onClose={() => setDeletingWebhook(null)}
        webhook={deletingWebhook}
      />
    </div>
  );
}
