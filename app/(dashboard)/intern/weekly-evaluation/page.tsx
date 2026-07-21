

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá tuần",
};

export default function page() {
  return (
    <div>
       <h1> WEEKLY EVALUATION </h1>
       <p> Summary card: diem tuan truoc, diem trung binh, nhan xet cau leader,... </p>
       <p> Form de Intern tu cham diem hang tuan cua minh </p>
       <p> Xem nhung tuan truoc, diem minh tu cham va leader cham </p>
    </div>
  );
}

