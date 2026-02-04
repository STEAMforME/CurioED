import { apiClient } from "./client";
import type { MentorProfile, MentorSession } from "./types";

export const mentorApi = {
  listMentors(token: string | null) {
    return apiClient.get<MentorProfile[]>("/mentor/mentors", token || undefined);
  },
  listSessions(token: string | null) {
    return apiClient.get<MentorSession[]>("/mentor/sessions", token || undefined);
  },
};
