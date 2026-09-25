"use client";

import toast from "react-hot-toast";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function ToastTestPage() {
  const triggerLoadingToast = () => {
    const toastId = toast.loading("Đang đồng bộ dữ liệu hệ thống...");
    setTimeout(() => {
      toast.success("Đồng bộ hoàn tất!", { id: toastId });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Kiểm Tra Giao Diện Toast</h1>
        <ThemeToggle />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center">
        <button
          type="button"
          onClick={() => toast.success("Thao tác lưu thông tin thành công!")}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition cursor-pointer"
        >
          Toast Thành Công (Success)
        </button>

        <button
          type="button"
          onClick={() => toast.error("Có lỗi xảy ra trong quá trình cập nhật!")}
          className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 transition cursor-pointer"
        >
          Toast Thất Bại (Error)
        </button>

        <button
          type="button"
          onClick={() => toast("Thông báo: Hệ thống sẽ bảo trì vào 22:00", { icon: "ℹ️" })}
          className="px-4 py-2.5 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-500 transition cursor-pointer"
        >
          Toast Thông Tin (Info)
        </button>

        <button
          type="button"
          onClick={triggerLoadingToast}
          className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-500 transition cursor-pointer"
        >
          Toast Đang Tải (Loading)
        </button>
      </div>
    </div>
  );
}
