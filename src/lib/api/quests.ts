import { apiClient } from "./client";
import type { Quest } from "./types";

export const questsApi = {
  listQuests(token: string | null) {
    return apiClient.get<Quest[]>("/quests", token || undefined);
  },
  getQuest(id: string, token: string | null) {
    return apiClient.get<Quest>(`/quests/${id}`, token || undefined);
  },
};
