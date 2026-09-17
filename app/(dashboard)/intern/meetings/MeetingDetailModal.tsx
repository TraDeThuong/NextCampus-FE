"use client";

import { useState } from "react";
import { MapPin, Video, Users, Clock, CheckCircle2, XCircle, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { useMeeting } from "@/hooks/meeting/useMeeting";
import { useMeetingAbsences } from "@/hooks/meeting/useMeetingAbsences";
import { useUpdateMeeting } from "@/hooks/meeting/useUpdateMeeting";
import { useReviewAbsence } from "@/hooks/meeting/useReviewAbsence";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRsvpMeeting } from "@/hooks/meeting/useRsvpMeeting";
import { useSubmitAbsence } from "@/hooks/meeting/useSubmitAbsence";

interface Props { meetingId: string; onCloseModal?: () => void; }

const STATUS_BADGE: Record<string, string> = { SCHEDULED: "bg-blue-500/20 text-blue-300", ONGOING: "bg-emerald-500/20 text-emerald-300", COMPLETED: "bg-violet-500/20 text-violet-300", CANCELLED: "bg-red-500/20 text-red-300", DRAFT: "bg-slate-500/20 text-slate-300" };
const INVITATION_ICON: Record<string, { Icon: typeof Clock; color: string }> = { ACCEPTED: { Icon: CheckCircle2, color: "text-emerald-400" }, PENDING: { Icon: Clock, color: "text-amber-400" }, DECLINED: { Icon: XCircle, color: "text-red-400" } };

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }

export default function MeetingDetailModal({ meetingId, onCloseModal }: Props) {
  const t = useTranslations("intern.meetings.detailModal");
  const { data: meetingData, isPending, isError } = useMeeting(meetingId);
  const { data: absencesData } = useMeetingAbsences(meetingId);
  const updateMeeting = useUpdateMeeting(); const reviewAbsence = useReviewAbsence();
  const { state } = useAuth(); const rsvpMeeting = useRsvpMeeting(); const submitAbsence = useSubmitAbsence();
  const [confirmAction, setConfirmAction] = useState<"cancel" | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false); const [leaveReason, setLeaveReason] = useState("");

  if (isPending) return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !meetingData) return <div className="flex flex-col items-center gap-3 py-16 text-center"><AlertTriangle className="h-8 w-8 text-red-400" /><p className="text-sm text-slate-400">{t("loadError")}</p></div>;

  const meeting = meetingData.data; const absences = absencesData?.data ?? []; const currentUser = state.user;
  const myParticipant = meeting.participants.find((p) => p.userId === currentUser?.id);
  const myStatus = myParticipant?.invitationStatus;
  const isHostOrOrganizer = myParticipant?.participantRole === "HOST" || myParticipant?.participantRole === "ORGANIZER";
  const leaderCount = meeting.participants.filter((p) => p.participantRole === "PARTICIPANT").length;

  function handleCancel() { updateMeeting.mutate({ id: meeting.id, payload: { status: "CANCELLED" } }, { onSuccess: () => onCloseModal?.() }); }
  function handleReview(absenceId: string, status: "APPROVED" | "REJECTED") { reviewAbsence.mutate({ absenceId, payload: { status } }); }
  function handleAccept() { rsvpMeeting.mutate({ id: meeting.id, payload: { status: "ACCEPTED" } }); }
  function handleDecline() { if (!leaveReason.trim()) return; rsvpMeeting.mutate({ id: meeting.id, payload: { status: "DECLINED" } }); submitAbsence.mutate({ meetingId: meeting.id, payload: { reason: leaveReason } }); setShowLeaveForm(false); setLeaveReason(""); }

  return (
    <div className="space-y-5">
      <div><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold text-white">{meeting.title}</h3><span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-medium mr-20 ${STATUS_BADGE[meeting.status] || STATUS_BADGE.DRAFT}`}>{meeting.status}</span></div>{meeting.description && <p className="mt-2 text-sm leading-relaxed text-slate-400">{meeting.description}</p>}</div>

      <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3 text-sm text-slate-300"><Calendar className="h-4 w-4 shrink-0 text-slate-500" /><span>{formatDate(meeting.startTime)}</span></div>
        <div className="flex items-center gap-3 text-sm text-slate-300"><Clock className="h-4 w-4 shrink-0 text-slate-500" /><span>{formatTime(meeting.startTime)} — {formatTime(meeting.endTime)}</span></div>
        {meeting.location && <div className="flex items-center gap-3 text-sm text-slate-300"><MapPin className="h-4 w-4 shrink-0 text-slate-500" /><span>{meeting.location}</span></div>}
        {meeting.meetingLink && <div className="flex items-center gap-3 text-sm text-slate-300"><Video className="h-4 w-4 shrink-0 text-slate-500" /><a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="truncate text-primary-light hover:underline">{meeting.meetingLink}</a></div>}
        <div className="flex items-center gap-3 text-sm text-slate-300"><Users className="h-4 w-4 shrink-0 text-slate-500" /><span>{meeting.visibility === "TEAM" ? t("allMembers") : t("leaders", { n: leaderCount, plural: leaderCount !== 1 ? "s" : "" })}</span></div>
      </div>

      {!isHostOrOrganizer && myParticipant && meeting.status !== "COMPLETED" && meeting.status !== "CANCELLED" && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          {showLeaveForm ? (
            <div className="space-y-3"><p className="text-sm font-medium text-slate-200">{myStatus === "ACCEPTED" ? t("leaveMeeting") : t("declineInvitation")}</p><textarea rows={2} placeholder={t("reasonPlaceholder")} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-primary-main/50 placeholder:text-slate-600 resize-none" />
              <div className="flex items-center gap-2"><button type="button" onClick={() => { setShowLeaveForm(false); setLeaveReason(""); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:text-white">{t("cancel")}</button><button type="button" onClick={handleDecline} disabled={!leaveReason.trim() || rsvpMeeting.isPending || submitAbsence.isPending} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30 disabled:opacity-50">{t("confirm")}</button></div></div>
          ) : (
            <div className="flex items-center justify-between"><p className="text-sm text-slate-400">{myStatus === "ACCEPTED" ? t("youAccepted") : t("youInvited")}</p>
              <div className="flex items-center gap-2">
                {myStatus === "PENDING" && <button type="button" onClick={handleAccept} disabled={rsvpMeeting.isPending} className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />{t("accept")}</button>}
                <button type="button" onClick={() => setShowLeaveForm(true)} className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"><XCircle className="h-3.5 w-3.5" />{myStatus === "ACCEPTED" ? t("leave") : t("decline")}</button></div></div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-slate-500"><span>{t("host")} <span className="text-slate-300">{meeting.host.fullName || meeting.host.email}</span></span><span>{t("createdBy")} <span className="text-slate-300">{meeting.creator.fullName || meeting.creator.email}</span></span></div>

      {meeting.participants.length > 0 && (
        <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t("participants")}</h4>
          <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-2">{meeting.participants.map((p) => { const { Icon, color } = INVITATION_ICON[p.invitationStatus] || INVITATION_ICON.PENDING; return <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"><Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} /><span className="flex-1 truncate text-slate-300">{p.user.fullName || p.user.email}</span><span className="shrink-0 text-xs text-slate-600">{p.participantRole}</span></div>; })}</div></div>
      )}

      {absences.length > 0 && (
        <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t("absenceRequests")}</h4>
          <div className="space-y-2">{absences.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{a.participant.user.fullName || a.participant.user.email}</p><p className="mt-0.5 text-xs text-slate-400">{a.reason}</p>{a.reviewNote && <p className="mt-0.5 text-xs italic text-slate-500">{t("note")} {a.reviewNote}</p>}</div>
                {a.status === "PENDING" ? <div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => handleReview(a.id, "APPROVED")} disabled={reviewAbsence.isPending} className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30">{t("approve")}</button><button type="button" onClick={() => handleReview(a.id, "REJECTED")} disabled={reviewAbsence.isPending} className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/30">{t("reject")}</button></div> : <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{a.status}</span>}
              </div></div>))}
          </div></div>
      )}

      {meeting.status !== "COMPLETED" && meeting.status !== "CANCELLED" && (
        <div className="border-t border-white/10 pt-4">
          {confirmAction ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" /><div className="flex-1"><p className="text-sm font-medium text-red-300">{t("cancelMeetingTitle")}</p><p className="mt-1 text-xs text-slate-400">{t("cancelMeetingDesc")}</p><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => setConfirmAction(null)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:text-white">{t("noKeepIt")}</button><button type="button" onClick={handleCancel} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30">{t("yesCancelIt")}</button></div></div></div></div>
          ) : (
            <div className="flex items-center justify-end gap-2"><Button variant="glass" size="sm" onClick={() => setConfirmAction("cancel")} disabled={updateMeeting.isPending}>{updateMeeting.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}<span className="ml-1">{t("cancelMeeting")}</span></Button></div>
          )}
        </div>
      )}
    </div>
  );
}
