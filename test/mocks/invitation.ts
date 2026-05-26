import { mockTeam } from "./team";
import { mockUser } from "./user";

export const mockInvitation = {
  id: "1",
  status: "PENDING",
  createdAt: new Date(),
  teamId: mockTeam.id,
  senderId: mockUser.id,
  recipientId: mockUser.id,
};
