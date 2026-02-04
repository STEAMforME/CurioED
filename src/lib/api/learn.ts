import { apiClient } from "./client";
import type { Course, Lesson } from "./types";

export const learnApi = {
  listCourses(token: string | null) {
    return apiClient.get<Course[]>("/learn/courses", token || undefined);
  },
  getCourse(id: string, token: string | null) {
    return apiClient.get<Course>(`/learn/courses/${id}`, token || undefined);
  },
  getLesson(id: string, token: string | null) {
    return apiClient.get<Lesson>(`/learn/lessons/${id}`, token || undefined);
  },
};
