import { http } from "@/lib/api-client";
import type { AiModelStatusDto, SystemSettingsDto } from "./types";

export const systemStatusApi = {
  getAiStatus: () => http.get<AiModelStatusDto>("/api/admin/system/ai-status").then((r) => r.data),
  getSettings: () => http.get<SystemSettingsDto>("/api/admin/system/settings").then((r) => r.data),
};
