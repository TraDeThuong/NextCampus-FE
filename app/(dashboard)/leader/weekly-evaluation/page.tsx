import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá tuần",
};

export default function page() {
  return (
    <div>
      <h1> Weekly Evaluation </h1>
      <p> Form Cham diem Intern </p>
      <p> Xem diem ma Intern tu cham </p>
    </div>
  );
}

