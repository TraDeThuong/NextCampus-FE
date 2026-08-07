"use client";

import { useState, useRef } from "react";
import MeetingHeader from "./MeetingHeader";
import MeetingStats from "./MeetingStats";
import MeetingCalendar from "./MeetingCalendar";
import WeekMeetingsCard from "./WeekMeetingsCard";
import UpcomingMeetingsCard from "./UpcomingMeetingsCard";
import LeaveRequestsCard from "./LeaveRequestsCard";
import MeetingDetailModal from "./MeetingDetailModal";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/auth/useAuth";

export default function LeaderMeetingsClient() {
  const { state } = useAuth();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  function handleMeetingClick(id: string) {
    setSelectedMeetingId(id);
    setTimeout(() => openRef.current?.click(), 0);
  }

  return (
    <Modal>
      <div className="space-y-6">
        <MeetingHeader />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <MeetingStats />
          <UpcomingMeetingsCard onMeetingClick={handleMeetingClick} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <MeetingCalendar
              onMeetingClick={handleMeetingClick}
              currentUserId={state.user?.id}
            />
          </div>
          <div className="space-y-6">
            <WeekMeetingsCard onMeetingClick={handleMeetingClick} />
            <LeaveRequestsCard />
          </div>
        </div>

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
