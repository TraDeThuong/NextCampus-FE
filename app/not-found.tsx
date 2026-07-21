import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-7xl font-extrabold text-primary-light">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Không tìm thấy trang</h2>
        <p className="max-w-md text-sm text-muted">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
