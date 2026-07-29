// ─── Enums ────────────────────────────────────────────────────────────────

export type MeetingType = "ONLINE" | "OFFLINE" | "HYBRID";

export type MeetingStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export type MeetingVisibility = "PRIVATE" | "TEAM";

export type ParticipantRole = "HOST" | "ORGANIZER" | "PARTICIPANT";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type AttendanceStatus = "UNKNOWN" | "ATTENDED" | "ABSENT";

export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED";

// ─── Shared ───────────────────────────────────────────────────────────────

export interface UserBrief {
  id: string;
  email: string;
  fullName: string | null;
}

// ─── Entities ─────────────────────────────────────────────────────────────

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  participantRole: ParticipantRole;
  invitationStatus: InvitationStatus;
  attendanceStatus: AttendanceStatus;
  responseAt: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  user: UserBrief;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  createdBy: string;
  hostId: string;
  location: string | null;
  meetingType: MeetingType;
  meetingLink: string | null;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  visibility: MeetingVisibility;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: UserBrief;
  host: UserBrief;
  participants: MeetingParticipant[];
  _count: { participants: number; absences: number };
}

export interface AbsenceRequest {
  id: string;
  meetingId: string;
  participantId: string;
  reason: string;
  attachmentUrl: string | null;
  status: AbsenceStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  participant: { id: string; userId: string; user: UserBrief };
  reviewer: UserBrief | null;
}

// ─── Response Wrappers ────────────────────────────────────────────────────

export interface MeetingListResponse {
  success: boolean;
  data: Meeting[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MeetingSuccessResponse {
  success: boolean;
  data: Meeting;
}

export interface MeetingDeleteResponse {
  success: boolean;
  message: string;
}

export interface ParticipantSuccessResponse {
  success: boolean;
  data: MeetingParticipant;
}

export interface InviteResultResponse {
  success: boolean;
  data: { added: number; skipped: number };
}

export interface AbsenceListResponse {
  success: boolean;
  data: AbsenceRequest[];
}

export interface AbsenceSuccessResponse {
  success: boolean;
  data: AbsenceRequest;
}

// ─── Query Params ─────────────────────────────────────────────────────────

export interface MeetingQueryParams {
  title?: string;
  status?: MeetingStatus;
  meetingType?: MeetingType;
  visibility?: MeetingVisibility;
  createdBy?: string;
  hostId?: string;
  participantId?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
  endTimeFrom?: string;
  endTimeTo?: string;
  sortBy?: "createdAt" | "startTime" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  hostId: string;
  location?: string;
  meetingType: MeetingType;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  status?: "DRAFT" | "SCHEDULED";
  visibility?: MeetingVisibility;
  participantIds?: string[];
}

export interface UpdateMeetingPayload {
  title?: string;
  description?: string | null;
  hostId?: string;
  location?: string | null;
  meetingType?: MeetingType;
  meetingLink?: string | null;
  startTime?: string;
  endTime?: string;
  status?: MeetingStatus;
  visibility?: MeetingVisibility;
}

export interface InviteParticipantsPayload {
  participantIds: string[];
}

export interface RsvpPayload {
  status: "ACCEPTED" | "DECLINED";
}

export interface SubmitAbsencePayload {
  reason: string;
  attachmentUrl?: string;
}

export interface ReviewAbsencePayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}
