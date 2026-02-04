import { apiClient } from "./client";
import type { User } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse>("/auth/login", payload);
  },
  me(token: string) {
    return apiClient.get<User>("/auth/me", token);
  },
};
