"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { reviewApplicationService } from "@/services/application.service";
import type { ReviewApplicationPayload, ApplicationInviteRow, Application } from "@/types/application";

type InviteListData = { data: ApplicationInviteRow[]; meta: any };
type AppListData = { data: Application[]; meta: any };

export function useReviewApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: ReviewApplicationPayload;
        }) => reviewApplicationService(id, payload),

        onMutate: ({ id, payload }) => {
            // Optimistic update: application-invites cache
            const prevInvites = queryClient.getQueriesData<InviteListData>({
                queryKey: ["application-invites"],
            });

            queryClient.setQueriesData<InviteListData>(
                { queryKey: ["application-invites"] },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((inv) =>
                            inv.application?.id === id
                                ? {
                                      ...inv,
                                      application: {
                                          ...inv.application,
                                          status: payload.status,
                                      },
                                  }
                                : inv,
                        ),
                    };
                },
            );

            // Optimistic update: applications cache (PendingInternsTable)
            const prevApps = queryClient.getQueriesData<AppListData>({
                queryKey: ["applications"],
            });

            queryClient.setQueriesData<AppListData>(
                { queryKey: ["applications"] },
                (old) => {
                    if (!old) return old;
                    if (payload.status === "APPROVED" || payload.status === "REJECTED") {
                        // Remove from pending list
                        return {
                            ...old,
                            data: old.data.filter((app) => app.id !== id),
                            meta: { ...old.meta, total: old.meta.total - 1 },
                        };
                    }
                    return old;
                },
            );

            return { prevInvites, prevApps };
        },

        onSuccess: (_data, { payload }) => {
            toast.success(
                payload.status === "APPROVED"
                    ? "Application approved. Intern account created."
                    : "Application rejected.",
            );
            queryClient.invalidateQueries({ queryKey: ["application-invites"] });
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },

        onError: (_err, _vars, ctx) => {
            ctx?.prevInvites?.forEach(([key, data]) =>
                queryClient.setQueryData(key, data),
            );
            ctx?.prevApps?.forEach(([key, data]) =>
                queryClient.setQueryData(key, data),
            );
            toast.error("Failed to review application.");
        },
    });
}
