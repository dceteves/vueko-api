import axios from "axios";
import type { User, Team, Invitation, ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
export const userApi = {
  getMe: async () => {
    const response = await api.get<User>("/api/users/me");
    return response.data;
  },

  getUser: async (userId: string) => {
    const response = await api.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  updateTimezone: async (userId: string, timezone: number) => {
    const response = await api.patch<User>(`/api/users/${userId}/${timezone}`);
    return response.data;
  },
};

// Team API
export const teamApi = {
  getTeams: async () => {
    const response = await api.get<Team[]>("/api/team");
    return response.data;
  },

  getTeam: async (teamId: string) => {
    const response = await api.get<Team>(`/api/team/${teamId}`);
    return response.data;
  },

  createTeam: async (name: string) => {
    const response = await api.post<Team>("/api/team", { name });
    return response.data;
  },

  updateTeamName: async (teamId: string, name: string) => {
    const response = await api.patch<Team>(`/api/team/${teamId}`, { name });
    return response.data;
  },

  deleteTeam: async (teamId: string) => {
    const response = await api.delete(`/api/team/${teamId}`);
    return response.data;
  },
};

// Invitation API
export const invitationApi = {
  getMyInvitations: async () => {
    const response = await api.get<Invitation[]>("/api/invitation/me");
    return response.data;
  },

  createInvitation: async (teamId: string, recipientId: string) => {
    const response = await api.post<Invitation>("/api/invitation", {
      teamId,
      recipientId,
    });
    return response.data;
  },

  respondToInvitation: async (
    invitationId: string,
    action: "accept" | "decline",
  ) => {
    const response = await api.patch<Invitation>(
      `/api/invitation/${invitationId}/${action}`,
    );
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: (provider: "discord" | "osu") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },

  logout: async () => {
    await api.get("/logout");
  },

  checkAuth: async () => {
    try {
      const response = await api.get<User>("/api/users/me");
      return { authenticated: true, user: response.data };
    } catch (error) {
      return { authenticated: false, user: null };
    }
  },

  checkAdmin: async () => {
    try {
      const response = await api.get<{ isAdmin: boolean }>("/api/admin/check");
      return response.data.isAdmin;
    } catch (error) {
      return false;
    }
  },
};

export default api;
