import type { Team } from "../../src/generated/prisma/client.ts";
import { mockUser } from "./user.ts";

export const mockTeam: Team = {
  id: "1",
  name: "team",
  isRegistered: true,
  createdAt: new Date(),
  captainId: mockUser.id,
};
