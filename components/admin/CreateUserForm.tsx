"use client"

import React, { useState } from "react";
import { useCreateUser } from "./../../hooks/users/useCreateUser";

export const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"LEADER" | "INTERN">("INTERN");

  // Gọi Hook React Query vừa viết ở trên
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Vui lòng nhập email");

    // Kích hoạt gọi API thông qua mutation
    mutate({ email, role });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Tạo Tài Khoản Mới (ADMIN)</h2>
      <form onSubmit={handleSubmit}>
        {/* Trường nhập Email */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email nhân viên:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* Trường chọn Chức vụ (Chỉ truyền chữ LEADER / INTERN) */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Chức vụ:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "LEADER" | "INTERN")}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="INTERN">Intern</option>
            <option value="LEADER">Leader</option>
          </select>
        </div>

        {/* Nút Submit điều khiển trạng thái Loading */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isPending ? "#ccc" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isPending ? "not-allowed" : "pointer"
          }}
        >
          {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>
    </div>
  );
};