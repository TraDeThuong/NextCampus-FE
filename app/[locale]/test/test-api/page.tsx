"use client";

import { useState } from "react";
import { useCreateApplication } from "@/hooks/application/useCreateApplication";

export default function TestApiPage() {
    const [result, setResult] = useState<unknown>(null);

    const { mutate, isPending } = useCreateApplication();

    function handleTest() {
        mutate(
            {
                fullName: "Test User",
                email: "test@example.com",
                phone: "0123456789",
                preferredDepartment: "Engineering",
                preferredPosition: "Backend Intern",
                startDate: "2026-07-15",
                duration: 3,
                token: "test-token",
                regulationId: "00000000-0000-0000-0000-000000000001",
                acceptedRegulations: true,
            },
            {
                onSuccess(data) {
                    console.log(data);
                    setResult(data);
                },

                onError(error) {
                    console.error(error);
                },
            }
        );
    }

    return (
        <div className="p-10">
            <button
                onClick={handleTest}
                disabled={isPending}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {isPending ? "Creating..." : "Test API"}
            </button>

            <pre className="mt-6">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
