"use client";

import { FileSpreadsheet, Plus, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TaskImportModal from "./TaskImportModal";
import TaskCreateModal from "./TaskCreateModal";
import TaskGroupCreateModal from "./TaskGroupCreateModal";

export default function LeaderTaskHeader() {
  const t = useTranslations("leader.tasks");

  return (
    <MetalCard>
      <div className="rounded-3xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Modal>
              <Modal.Open opens="import">
                <Button variant="glass" size="md">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />{t("importTasks")}
                </Button>
              </Modal.Open>
              <Modal.Window name="import" size="md"><TaskImportModal /></Modal.Window>
            </Modal>

            <Modal>
              <Modal.Open opens="create-task">
                <Button variant="primary" size="md">
                  <Plus className="h-4 w-4 mr-2" />{t("createTask")}
                </Button>
              </Modal.Open>
              <Modal.Window name="create-task" size="md"><TaskCreateModal /></Modal.Window>
            </Modal>

            <Modal>
              <Modal.Open opens="create-group">
                <Button variant="glass" size="md">
                  <Layers className="h-4 w-4 mr-2" />{t("createGroup")}
                </Button>
              </Modal.Open>
              <Modal.Window name="create-group" size="sm"><TaskGroupCreateModal /></Modal.Window>
            </Modal>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
