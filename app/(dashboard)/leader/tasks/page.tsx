
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý công việc",
};

export default function page() {
  return (
    <div>
      <h1> Task management </h1>
      <p> Create task </p>
      <p> Table: Tat ca task trong tuan </p>
      <p> Gui mail thong bao task tu dong </p>
    </div>
  );
}

