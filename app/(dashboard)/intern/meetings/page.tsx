import type { Metadata } from "next";
import InternMeetingsClient from "./InternMeetingsClient";

export const metadata: Metadata = { title: "Meetings" };
export default function Page() { return <InternMeetingsClient />; }
