import type { Metadata } from "next";
import NotFoundContent from "@/components/common/NotFoundContent";

export const metadata: Metadata = {
  title: "404 - Not Found",
};

export default function NotFound() {
  return <NotFoundContent />;
}
