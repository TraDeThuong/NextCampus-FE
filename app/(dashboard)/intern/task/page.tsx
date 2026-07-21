import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Công việc của tôi",
};

export default function page() {
  return (
    <div>
      <h1> TASK </h1>
      <p> Intern nhan task hang tuan, hang ngay tai day </p>
      <p> Xem chi tiet task </p>
      <p> Lam xong task thi dien daily report </p>
    </div>
  );
}

