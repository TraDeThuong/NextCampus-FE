export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyPayload {
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

export interface CreateApiKeyResult extends ApiKeyItem {
  key: string;
}

export interface CreateApiKeyResponse {
  success: boolean;
  data: CreateApiKeyResult;
  message: string;
}

export interface ApiKeyListResponse {
  success: boolean;
  data: ApiKeyItem[];
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string | null;
  secretMasked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookListResponse {
  success: boolean;
  data: WebhookItem[];
}

export interface CreateWebhookPayload {
  url: string;
  events?: string[];
  secret?: string;
  description?: string;
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  isActive?: boolean;
  secret?: string;
  description?: string;
}

export interface WebhookDeliveryItem {
  id: string;
  webhookEndpointId: string;
  userId: string;
  event: string;
  payload: Record<string, unknown>;
  signature: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  statusCode: number | null;
  responseBody: string | null;
  attempts: number;
  lastError: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveriesResponse {
  success: boolean;
  data: {
    items: WebhookDeliveryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WebhookDeliveriesQuery {
  page?: number;
  limit?: number;
  status?: string;
  event?: string;
}
