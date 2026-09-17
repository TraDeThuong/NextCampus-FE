"use client";

import React, { useState } from "react";
import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useRoles } from "@/hooks/rbac/useRoles";

export const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const { data: rolesRes, isLoading: loadingRoles } = useRoles();
  const roles = rolesRes?.data ?? [];

  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Vui lòng nhập email");

    const selectedRole = roles.find((r) => r.id === roleId);
    mutate({
      email,
      roleId: roleId || undefined,
      roleName: selectedRole?.name,
    });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Tạo Tài Khoản Mới</h2>
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

        {/* Chọn Vai trò động */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Vai trò (Role):</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loadingRoles}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">-- Mặc định --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.isSystem ? "(Hệ thống)" : "(Tùy chỉnh)"}
              </option>
            ))}
          </select>
        </div>

        {/* Nút Submit điều khiển trạng thái Loading */}
        <button
          type="submit"
          disabled={isPending || loadingRoles}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isPending ? "#ccc" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>
    </div>
  );
};