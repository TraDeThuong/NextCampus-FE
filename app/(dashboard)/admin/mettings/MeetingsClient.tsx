"use client";

import { useState, useRef } from "react";
import MeetingHeader from "./MeetingHeader";
import MeetingStats from "./MeetingStats";
import MeetingCalendar from "./MeetingCalendar";
import WeekMeetingsCard from "./WeekMeetingsCard";
import LeaveRequestsCard from "./LeaveRequestsCard";
import MeetingDetailModal from "./MeetingDetailModal";
import Modal from "@/components/ui/Modal";

export default function MeetingsClient() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  function handleMeetingClick(id: string) {
    setSelectedMeetingId(id);
    // Trigger Modal.Open click programmatically
    setTimeout(() => openRef.current?.click(), 0);
  }

  return (
    <Modal>
      <div className="space-y-6">
        <MeetingHeader />
        <MeetingStats />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <MeetingCalendar onMeetingClick={handleMeetingClick} />
          </div>
          <div className="space-y-6">
            <WeekMeetingsCard onMeetingClick={handleMeetingClick} />
            <LeaveRequestsCard />
          </div>
        </div>

        {/* Hidden trigger for Modal.Window */}
        <Modal.Open opens="meeting-detail">
          <button ref={openRef} className="hidden" />
        </Modal.Open>

        <Modal.Window name="meeting-detail" size="md">
          <MeetingDetailModal
            meetingId={selectedMeetingId ?? ""}
            onCloseModal={() => setSelectedMeetingId(null)}
          />
        </Modal.Window>
      </div>
    </Modal>
  );
}
