import UserService from "../../services/user.ts";
import type { UserRequest, UserResponse } from "../../types/handler.types.ts";

function me(req: UserRequest, res: UserResponse) {
  if (!req.user) {
    res.json({ message: "User not authenticated or found" });
  } else {
    res.json(req.user);
  }
}

async function findUser(req: UserRequest, res: UserResponse) {
  const user = await UserService.fetchUser(req.params.userId);

  if (!user) {
    res.json({ message: "User not found" });
  } else {
    res.json(user);
  }
}

async function unlinkDiscordAccount(req: UserRequest, res: UserResponse) {
  if (!req.user) {
    res.json({ message: "user not found" });
    return;
  }

  try {
    const newUser = await UserService.dropDiscordCredentials(req.user.id); // User ensured via middleware
    res.json(newUser);
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
}

async function patchTimeZone(req: UserRequest, res: UserResponse) {
  try {
    const { userId } = req.params;
    const { timezone } = req.body;
    const newUser = await UserService.updateTimezone(userId, timezone);
    res.json(newUser);
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
}

export default {
  me,
  findUser,
  unlinkDiscordAccount,
  patchTimeZone,
};
