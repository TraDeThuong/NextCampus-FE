"use client";

import { useEffect, useState } from "react";
import { Mail, Send, X } from "lucide-react";

import { useCreateInvite } from "@/hooks/application/useCreateInvite";

import Button from "@/components/ui/Button";

interface InviteInternModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteInternModal({
  open,
  onClose,
}: InviteInternModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { mutate: createInvite, isPending } = useCreateInvite();

  function resetForm() {
    setEmail("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function validateEmail(value: string) {
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address";
    }

    return "";
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setEmail(value);

    if (error) {
      setError(validateEmail(value));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    createInvite(
      {
        email: email.trim(),
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        resetForm();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/75
        p-4
        backdrop-blur-xl
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full max-w-xl overflow-hidden

          rounded-[32px]
          border border-white/10

          bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]

          backdrop-blur-3xl

          transition-all duration-300
        "
      >
        {/* Glow */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute -bottom-32 right-[-60px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Metallic line */}
        <div
          className="
            absolute inset-x-0 top-0 h-px
            bg-gradient-to-r
            from-transparent
            via-white/80
            to-transparent
          "
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <h2 className="chrome-text text-4xl metal-glow">
                Invite Intern
              </h2>

              <p className="mt-3 max-w-md text-sm text-muted">
                Send an onboarding invitation link to the candidate and start
                the application process.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="
                flex h-11 w-11 shrink-0 items-center justify-center

                rounded-2xl
                border border-white/10

                bg-white/5

                transition-all duration-300

                hover:rotate-90
                hover:border-white/20
                hover:bg-white/10
              "
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-200">
                Candidate Email
              </label>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  placeholder="candidate@gmail.com"
                  onChange={handleEmailChange}
                  disabled={isPending}
                  className={`
                    w-full rounded-2xl border
                    ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_25px_rgba(239,68,68,0.25)]"
                        : "border-white/10 focus:border-cyan-400/50 focus:shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                    }
                    bg-white/5
                    py-4 pl-14 pr-5
                    text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-slate-500
                  `}
                />
              </div>

              {error && (
                <p className="mt-2 text-sm font-medium text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="
                  rounded-2xl
                  border border-white/10

                  bg-white/5

                  px-5 py-3

                  text-sm font-medium text-slate-300

                  transition-all duration-300

                  hover:border-white/20
                  hover:bg-white/10
                  hover:text-white

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={isPending}
                variant="glass"
              >
                <Send className="h-4 w-4 mr-2" />

                {isPending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}