/* eslint-disable @typescript-eslint/no-explicit-any */

import AdminService from "../../services/admin.ts";
import type { AdminRequest, AdminResponse } from "../../types/handler.types.ts";

export default class AdminHandler {
  private service: AdminService;

  constructor(service?: AdminService) {
    this.service = service || new AdminService();
  }

  async checkAdmin(req: AdminRequest, res: AdminResponse) {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ isAdmin: false });
    }

    const result = await this.service.isAdmin(userId);

    if (result.ok) {
      res.json({ isAdmin: result.value });
    } else {
      res.status(500).json({ message: result.error.message });
    }
  }

  async addAdmin(req: AdminRequest, res: AdminResponse) {
    const { userId } = req.params;
    const createdBy = (req.user as any)?.id;

    const result = await this.service.addAdmin(userId, createdBy);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(400).json({ message: result.error.message });
    }
  }

  async removeAdmin(req: AdminRequest, res: AdminResponse) {
    const { userId } = req.params;

    const result = await this.service.removeAdmin(userId);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async getAllAdmins(_req: AdminRequest, res: AdminResponse) {
    const result = await this.service.getAllAdmins();

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(500).json({ message: result.error.message });
    }
  }

  async getAdminByUserId(req: AdminRequest, res: AdminResponse) {
    const { userId } = req.params;

    const result = await this.service.getAdminByUserId(userId);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }
}
