"use client";

export default function MeetingHeader() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#101827] via-[#1a2235] to-[#0f172a] p-6">
      <div>
        <h2 className="text-2xl font-bold metal-text">Meetings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Meetings you are invited to participate in.
        </p>
      </div>
    </div>
  );
}
