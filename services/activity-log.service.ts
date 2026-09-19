import api from "@/lib/axios";
import type { ActivityLog, ActivityLogQuery, ActivityLogResponse } from "@/types/activity-log";

function formatDetailsSummary(details: unknown): string {
  if (!details) return "";
  if (typeof details === "string") return details;
  if (typeof details === "object" && details !== null) {
    const d = details as Record<string, unknown>;
    if (Array.isArray(d.updatedFields) && d.updatedFields.length > 0) {
      return `Cập nhật: ${d.updatedFields.join(", ")}`;
    }
    if (typeof d.message === "string") return d.message;
    if (typeof d.title === "string") return d.title;
    if (typeof d.reason === "string") return `Lý do: ${d.reason}`;
    if (typeof d.status === "string") return `Trạng thái: ${d.status}`;
    try {
      return JSON.stringify(details);
    } catch {
      return "";
    }
  }
  return String(details);
}

export const activityLogService = {
  getActivityLogs: async (params?: ActivityLogQuery): Promise<ActivityLogResponse> => {
    // Map params to match backend expectations (from, to, actorId, etc.)
    const queryParams: Record<string, unknown> = {};

    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.order) queryParams.order = params.order;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.action) queryParams.action = params.action;
      if (params.targetType) queryParams.targetType = params.targetType;

      const fromVal = params.from || params.createdFrom;
      if (fromVal) {
        // Backend expects YYYY-MM-DD
        queryParams.from = fromVal.split("T")[0];
      }

      const toVal = params.to || params.createdTo;
      if (toVal) {
        queryParams.to = toVal.split("T")[0];
      }

      const actorVal = params.actorId || params.userId;
      if (actorVal) {
        queryParams.actorId = actorVal;
      }
    }

    const response = await api.get<Record<string, unknown>>("/activity-logs", {
      params: queryParams,
    });

    const resData = response.data || {};
    const rawItems = (Array.isArray(resData.items)
      ? resData.items
      : Array.isArray(resData.data)
        ? resData.data
        : []) as Array<Record<string, unknown>>;

    const total = Number(
      resData.total ??
        (resData.meta as Record<string, unknown>)?.total ??
        rawItems.length,
    );
    const page = Number(
      resData.page ??
        (resData.meta as Record<string, unknown>)?.page ??
        (params?.page || 1),
    );
    const limit = Number(
      resData.limit ??
        (resData.meta as Record<string, unknown>)?.limit ??
        (params?.limit || 20),
    );
    const totalPages = Number(
      resData.totalPages ??
        (resData.meta as Record<string, unknown>)?.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(1, limit))),
    );

    const normalizedItems: ActivityLog[] = rawItems.map((item) => {
      const actor = (item.actor || item.user || null) as Record<string, unknown> | null;
      const actorId = (item.actorId ?? item.userId ?? actor?.id ?? "") as string;
      const actorEmail = (actor?.email ?? "") as string;
      const actorFullName = (actor?.fullName ?? "") as string;
      const actorAvatar = (actor?.avatarUrl ?? null) as string | null;
      const actorRole = (actor?.role ?? null) as { name: string } | null;

      const rawDescription = typeof item.description === "string" && item.description.trim().length > 0
        ? item.description
        : formatDetailsSummary(item.details);

      return {
        id: String(item.id),
        userId: actorId,
        actorId: actorId || null,
        action: String(item.action || "UNKNOWN"),
        targetId: item.targetId ? String(item.targetId) : null,
        targetType: item.targetType ? String(item.targetType) : null,
        description: rawDescription,
        details: (item.details as Record<string, unknown> | unknown[] | string | null) ?? null,
        ipAddress: (item.ipAddress as string | null) ?? null,
        userAgent: (item.userAgent as string | null) ?? null,
        createdAt: String(item.createdAt || new Date().toISOString()),
        actor: actor
          ? {
              id: actorId,
              email: actorEmail,
              fullName: actorFullName,
              avatarUrl: actorAvatar,
              role: actorRole,
            }
          : null,
        user: {
          id: actorId,
          email: actorEmail,
          fullName: actorFullName,
          avatarUrl: actorAvatar,
          role: actorRole,
        },
      };
    });

    return {
      success: resData.success !== false,
      data: normalizedItems,
      items: normalizedItems,
      total,
      page,
      limit,
      totalPages,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },
};
