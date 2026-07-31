"use client"

import React, { useState } from "react";
import { useCreateUser } from "./../../hooks/users/useCreateUser";

export const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"LEADER" | "INTERN">("INTERN");

  // React Query mutation hook
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter an email");

    // Trigger API call via mutation
    mutate({ email, roleName: role });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Create New Account (ADMIN)</h2>
      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Employee email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* Role selection (passes LEADER or INTERN string) */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "LEADER" | "INTERN")}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="INTERN">Intern</option>
            <option value="LEADER">Leader</option>
          </select>
        </div>

        {/* Submit button with loading state */}
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
          {isPending ? "Processing..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};