import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thực tập sinh nhóm",
};

export default function page() {
  return (
    <div>
      <h1> INTERN </h1>
      <p> Bang de xem danh sach Intern: name, email, task,..... </p>
      <p> Xem chi tiet Intern, theo ID, tao route  </p>
    </div>
  );
}

