"use client";

import React, { useState } from "react";
import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useRoles } from "@/hooks/rbac/useRoles";
import MetalCard from "@/components/ui/MetalCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

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

  const roleOptions = [
    { label: "-- Mặc định --", value: "" },
    ...roles.map((r) => ({
      label: `${r.name} ${r.isSystem ? "(Hệ thống)" : "(Tùy chỉnh)"}`,
      value: r.id,
    })),
  ];

  return (
    <MetalCard className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-bold metal-text mb-4">Tạo Tài Khoản Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trường nhập Email */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1 mb-1.5">
            Email nhân viên
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            className="h-[42px] sm:h-[46px]"
          />
        </div>

        {/* Chọn Vai trò động */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1 mb-1.5">
            Vai trò (Role)
          </label>
          <Select
            options={roleOptions}
            value={roleId}
            onChange={(val) => setRoleId(val)}
            disabled={loadingRoles}
          />
        </div>

        {/* Nút Submit điều khiển trạng thái Loading */}
        <Button
          type="submit"
          variant="primary"
          disabled={isPending || loadingRoles}
          className="w-full h-[42px] sm:h-[46px]"
        >
          {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
        </Button>
      </form>
    </MetalCard>
  );
};