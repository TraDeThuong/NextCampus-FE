"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

function SecurityAlertContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Liên kết khóa phiên không hợp lệ hoặc đã thiếu thông tin xác thực.");
      return;
    }

    let isMounted = true;

    authService
      .revokeSession(token)
      .then((res) => {
        if (isMounted) {
          setStatus("success");
          setMessage(res.message || "Đã vô hiệu hóa thành công tất cả các phiên đăng nhập!");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus("error");
          const errMsg =
            err?.response?.data?.message ||
            "Không thể khóa phiên. Thẻ xác thực có thể đã hết hạn hoặc không hợp lệ.";
          setMessage(errMsg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060816] text-slate-100">
      <div className="w-full max-w-md">
        <MetalCard className="p-8 text-center space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-bold metal-text">Đang khóa phiên đăng nhập...</h1>
              <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát để hệ thống bảo vệ tài khoản của bạn.</p>
              <Spinner size="lg" />
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-10 w-10" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-emerald-400">Đã Bảo Vệ Tài Khoản!</h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Các hành động đã được thực thi:</span>
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>Tất cả phiên đăng nhập trên thiết bị khác đã bị thu hồi.</li>
                  <li>Mã Refresh Token hiện tại đã bị vô hiệu hóa.</li>
                  <li>Khuyên dùng: Bạn nên đổi mật khẩu mới ngay để đảm bảo an toàn.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link href="/forgot-password" className="w-full">
                  <Button variant="primary" className="w-full justify-center gap-2">
                    <span>Đặt lại mật khẩu mới</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="glass" className="w-full justify-center">
                    Quay lại trang Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-rose-400">Không Thể Khóa Phiên</h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Link href="/forgot-password" className="w-full">
                  <Button variant="primary" className="w-full justify-center">
                    Đổi mật khẩu ngay
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="glass" className="w-full justify-center">
                    Trở về Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </MetalCard>
      </div>
    </div>
  );
}

export default function SecurityAlertPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#060816]">
          <Spinner size="lg" />
        </div>
      }
    >
      <SecurityAlertContent />
    </Suspense>
  );
}
