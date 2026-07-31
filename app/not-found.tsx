import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-7xl font-extrabold text-primary-light">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
        <p className="max-w-md text-sm text-muted">
          The page you are looking for does not exist or has been moved to a different address.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
