"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { reviewApplicationService } from "@/services/application.service";
import type { ReviewApplicationPayload, ApplicationInviteRow } from "@/types/application";

type InviteListData = { data: ApplicationInviteRow[]; meta: any };

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
      const prev = queryClient.getQueriesData<InviteListData>({
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

      return { prev };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-invites"] });
    },

    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      toast.error("Failed to review application.");
    },
  });
}
