"use client";

import { useState, useRef } from "react";
import MeetingHeader from "./MeetingHeader";
import MeetingStats from "./MeetingStats";
import MeetingCalendar from "./MeetingCalendar";
import UpcomingMeetingsCard from "./UpcomingMeetingsCard";
import WeekMeetingsCard from "./WeekMeetingsCard";
import LeaveRequestsCard from "./LeaveRequestsCard";
import MeetingDetailModal from "./MeetingDetailModal";
import RecentNotifications from "@/components/meetings/RecentNotifications";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/auth/useAuth";

export default function MeetingsClient() {
  const { state } = useAuth();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  function handleMeetingClick(id: string) {
    setSelectedMeetingId(id);
    // Programmatically open Modal.Window
    setTimeout(() => openRef.current?.click(), 0);
  }

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header */}
        <MeetingHeader />

        {/* Full-width Stat Cards (2 cols mobile, 4 cols desktop) */}
        <MeetingStats />

        {/* Main Dashboard: Calendar (2 cols) + Borderless Right Sidebar (1 col) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Calendar View */}
          <div className="xl:col-span-2">
            <MeetingCalendar
              onMeetingClick={handleMeetingClick}
              currentUserId={state.user?.id}
            />
          </div>

          {/* Borderless Right Panel (Rule 46) */}
          <div className="space-y-6 xl:col-span-1">
            <UpcomingMeetingsCard onMeetingClick={handleMeetingClick} />
            <WeekMeetingsCard onMeetingClick={handleMeetingClick} />
            <LeaveRequestsCard />
            <RecentNotifications />
          </div>
        </div>

        {/* Hidden trigger for Modal.Window */}
        <Modal.Open opens="meeting-detail">
          <button ref={openRef} className="hidden" aria-hidden="true" />
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
