"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCreateMeeting } from "@/hooks/meeting/useCreateMeeting";
import { internService } from "@/services/intern.service";
import { leaderService } from "@/services/leader.service";
import type { CreateMeetingPayload, MeetingType } from "@/types/meeting";

interface Props {
  onCloseModal?: () => void;
  defaultDate?: Date;
}

function toLocalDatetimeString(d: Date) {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

const createMeetingFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().optional().default(""),
    meetingType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
    location: z.string().optional().default(""),
    meetingLink: z.string().optional().default(""),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    status: z.enum(["DRAFT", "SCHEDULED"]),
  })
  .superRefine((d, ctx) => {
    if (new Date(d.startTime) >= new Date(d.endTime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time must be before end time", path: ["endTime"] });
    }
    if ((d.meetingType === "ONLINE" || d.meetingType === "HYBRID") && !d.meetingLink) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Meeting link required", path: ["meetingLink"] });
    }
    if (d.status === "SCHEDULED" && new Date(d.startTime) <= new Date()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time must be in the future", path: ["startTime"] });
    }
  });

interface FormValues {
  title: string;
  description?: string;
  meetingType: "ONLINE" | "OFFLINE" | "HYBRID";
  location?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  status: "DRAFT" | "SCHEDULED";
}

export default function CreateMeetingModal({ onCloseModal, defaultDate }: Props) {
  const { state } = useAuth();
  const currentUser = state.user;
  const createMeeting = useCreateMeeting();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  const { data: internsData } = useQuery({
    queryKey: ["interns", { leaderId: currentUser?.id }],
    queryFn: () => internService.getInterns({ leaderId: currentUser!.id, limit: 100 }),
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5,
  });

  const { data: leadersData } = useQuery({
    queryKey: ["leaders", { limit: 100 }],
    queryFn: () => leaderService.getLeaders({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const interns = internsData?.data ?? [];
  const leaders = (leadersData?.data ?? [])
    .filter((l) => l.userId !== currentUser?.id)
    .map((l) => ({ id: l.userId, fullName: l.user.fullName || l.user.email }));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createMeetingFormSchema) as any,
    defaultValues: {
      meetingType: "ONLINE",
      status: "SCHEDULED",
      startTime: defaultDate ? toLocalDatetimeString(defaultDate) : "",
      endTime: defaultDate ? toLocalDatetimeString(new Date(defaultDate.getTime() + 3600000)) : "",
      title: "",
      description: "",
      location: "",
      meetingLink: "",
    },
  });

  const watchMeetingType = watch("meetingType");

  function toggleParticipant(id: string) {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(data: FormValues) {
    if (!currentUser) return;
    if (selectedParticipantIds.length === 0) {
      toast.error("Select at least one participant.");
      return;
    }

    const payload: CreateMeetingPayload = {
      title: data.title,
      description: data.description || undefined,
      hostId: currentUser.id,
      meetingType: data.meetingType,
      location: data.location || undefined,
      meetingLink: data.meetingLink || undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      visibility: "PRIVATE",
      status: data.status,
      participantIds: selectedParticipantIds,
    };

    createMeeting.mutate(payload, { onSuccess: () => onCloseModal?.() });
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary-main/50 placeholder:text-slate-600";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.15em] text-slate-400";

  return (
    <div className="px-1 py-4 ">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Schedule Meeting</h3>
          <p className="text-xs text-slate-500">
            {selectedParticipantIds.length > 0
              ? `${selectedParticipantIds.length} participant${selectedParticipantIds.length > 1 ? "s" : ""} invited`
              : "Invite your interns and other leaders"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input type="text" placeholder="Sprint Planning" {...register("title")} className={`${inputClass} mt-1`} />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea rows={2} placeholder="Meeting agenda..." {...register("description")} className={`${inputClass} mt-1 resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Host</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-main/20 text-xs text-primary-light">
              {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || "?"}
            </div>
            <span className="text-sm text-slate-300">{currentUser?.fullName || currentUser?.email || "You"}</span>
            <span className="ml-auto text-xs text-slate-600">auto</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Meeting Type *</label>
          <div className="mt-2 flex gap-3">
            {(["ONLINE", "OFFLINE", "HYBRID"] as MeetingType[]).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="radio" value={type} {...register("meetingType")} className="accent-primary-main" />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
          {errors.meetingType && <p className="mt-1 text-xs text-red-400">{errors.meetingType.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input type="text" placeholder="Room 201" {...register("location")} className={`${inputClass} mt-1`} />
        </div>

        {(watchMeetingType === "ONLINE" || watchMeetingType === "HYBRID") && (
          <div>
            <label className={labelClass}>Meeting Link *</label>
            <input type="url" placeholder="https://meet.google.com/..." {...register("meetingLink")} className={`${inputClass} mt-1`} />
            {errors.meetingLink && <p className="mt-1 text-xs text-red-400">{errors.meetingLink.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Time *</label>
            <input type="datetime-local" {...register("startTime")} className={`${inputClass} mt-1`} />
            {errors.startTime && <p className="mt-1 text-xs text-red-400">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className={labelClass}>End Time *</label>
            <input type="datetime-local" {...register("endTime")} className={`${inputClass} mt-1`} />
            {errors.endTime && <p className="mt-1 text-xs text-red-400">{errors.endTime.message}</p>}
          </div>
        </div>

        {/* Participants — always visible for Leader */}
        <div className="space-y-3 flex gap-10">
          {interns.length > 0 && (
            <div className = "w-126">
              <label className={labelClass}><Users className="mr-1 inline h-3.5 w-3.5" />Your Interns</label>
              <div className="mt-1.5 h-[200px] space-y-0.5 overflow-y-auto custom-scrollbar rounded-xl border border-white/10 bg-white/[0.02] p-2">
                {interns.map((intern) => (
                  <label key={intern.userId} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition ${selectedParticipantIds.includes(intern.userId) ? "bg-primary-main/10" : "hover:bg-white/5"}`}>
                    <input type="checkbox" checked={selectedParticipantIds.includes(intern.userId)} onChange={() => toggleParticipant(intern.userId)} className="accent-primary-main" />
                    <span className="text-sm text-slate-300">{intern.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {leaders.length > 0 && (
            <div className = "w-126">
              <label className={labelClass}>Other Leaders</label>
              <div className="mt-1.5 h-[200px] space-y-0.5 overflow-y-auto custom-scrollbar rounded-xl border border-white/10 bg-white/[0.02] p-2">
                {leaders.map((leader) => (
                  <label key={leader.id} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition ${selectedParticipantIds.includes(leader.id) ? "bg-primary-main/10" : "hover:bg-white/5"}`}>
                    <input type="checkbox" checked={selectedParticipantIds.includes(leader.id)} onChange={() => toggleParticipant(leader.id)} className="accent-primary-main" />
                    <span className="text-sm text-slate-300">{leader.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedParticipantIds.length > 0 && (
            <p className="text-xs text-slate-500">{selectedParticipantIds.length} selected</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="mt-2 flex gap-3">
            {(["SCHEDULED", "DRAFT"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="radio" value={s} {...register("status")} className="accent-primary-main" />
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={onCloseModal} disabled={createMeeting.isPending} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">
            Cancel
          </button>
          <Button type="submit" disabled={createMeeting.isPending} variant="primary">
            {createMeeting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Meeting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
