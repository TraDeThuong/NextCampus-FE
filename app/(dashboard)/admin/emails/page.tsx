import type { Metadata } from "next";
import TemplatesPage from "./TemplatesPage";

export const metadata: Metadata = {
  title: "Email Configuration",
};

export default function EmailsPage() {
  return <TemplatesPage />;
}


