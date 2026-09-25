import type { Meeting } from "@/types/meeting";

/**
 * Returns true if the user is participating in the meeting (as creator, host, or participant).
 * Used to hide meetings that the current user is not attending.
 */
export function isUserParticipating(
  meeting: Meeting,
  userId?: string | null,
): boolean {
  if (!userId) return false;
  if (meeting.createdBy === userId) return true;
  if (meeting.hostId === userId) return true;
  if (meeting.host?.id === userId) return true;
  const participant = meeting.participants?.find((p) => p.userId === userId);
  if (!participant) return false;
  return participant.invitationStatus !== "DECLINED";
}
