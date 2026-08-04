import UserService from "../../services/user.ts";
import type { UserRequest, UserResponse } from "../../types/handler.types.ts";

export default class UserHandler {
  private service: UserService;

  constructor(service?: UserService) {
    this.service = service || new UserService();
  }

  me(req: UserRequest, res: UserResponse) {
    if (!req.user) {
      res.status(404).json({ message: "User not authenticated or found" });
    } else {
      res.json(req.user);
    }
  }

  async findUser(req: UserRequest, res: UserResponse) {
    const result = await this.service.findUser(req.params.userId);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async unlinkDiscordAccount(req: UserRequest, res: UserResponse) {
    const result = await this.service.dropDiscordCredentials(req.user!.id); // User ensured via middleware

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async patchTimeZone(req: UserRequest, res: UserResponse) {
    const { userId } = req.params;
    const { timezone } = req.body;

    const result = await this.service.updateTimezone(userId, timezone);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }
}
