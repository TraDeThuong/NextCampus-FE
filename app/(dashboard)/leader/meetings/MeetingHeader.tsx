"use client";

import { Calendar, Plus } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import CreateMeetingModal from "./CreateMeetingModal";

export default function MeetingHeader() {
  return (
    <Modal>
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold metal-text">Meetings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your meetings and invitations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Modal.Open opens="create-meeting">
                <button className="flex items-center gap-2 rounded-xl border border-primary-main/30 bg-primary-main/10 px-4 py-2.5 text-sm font-medium text-primary-light transition hover:border-primary-main/50 hover:bg-primary-main/20">
                  <Calendar className="h-4 w-4" />
                  <Plus className="h-3.5 w-3.5" />
                  Schedule Meeting
                </button>
              </Modal.Open>
            </div>
          </div>
        </div>
      </MetalCard>
      <Modal.Window name="create-meeting" size="sm">
        <CreateMeetingModal />
      </Modal.Window>
    </Modal>
  );
}
