import type { Metadata } from "next";
import LeaderMeetingsClient from "./LeaderMeetingsClient";

export const metadata: Metadata = { title: "Meetings" };

export default function Page() {
  return <LeaderMeetingsClient />;
}
