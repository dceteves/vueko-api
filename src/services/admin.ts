import AdminRepository from "../repositories/admin.ts";
import UserRepository from "../repositories/user.ts";
import { ok, err, type Result } from "../utils/result.ts";

import type { Admin } from "../generated/prisma/client.ts";
import { NotProvidedError, UnexpectedError } from "../utils/error.ts";

export default class AdminService {
  private adminRepo: AdminRepository;
  private userRepo: UserRepository;

  constructor(adminRepo?: AdminRepository, userRepo?: UserRepository) {
    this.adminRepo = adminRepo || new AdminRepository();
    this.userRepo = userRepo || new UserRepository();
  }

  /**
   * Add admin role to a user
   * @async
   * @param userId User ID to make admin
   * @param createdBy User ID of who is creating this admin (optional)
   */
  async addAdmin(userId: string, createdBy?: string): Promise<Result<Admin>> {
    if (!userId) {
      return err(new NotProvidedError("User ID"));
    }

    try {
      // Verify user exists
      await this.userRepo.findUnique({ where: { id: userId } });

      // Check if already admin
      const existingAdmin = await this.adminRepo
        .findUnique({
          where: { userId },
        })
        .catch(() => null);

      if (existingAdmin) {
        return ok(existingAdmin);
      }

      // Create admin record
      const admin = await this.adminRepo.create({
        data: {
          userId,
          createdBy,
        },
      });

      return ok(admin);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Remove admin role from a user
   * @async
   * @param userId User ID to remove admin role from
   */
  async removeAdmin(userId: string): Promise<Result<Admin>> {
    if (!userId) {
      return err(new NotProvidedError("User ID"));
    }

    try {
      const admin = await this.adminRepo.delete({
        where: { userId },
      });

      return ok(admin);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Check if a user is an admin
   * @async
   * @param userId User ID to check
   */
  async isAdmin(userId: string): Promise<Result<boolean>> {
    if (!userId) {
      return err(new NotProvidedError("User ID"));
    }

    try {
      const admin = await this.adminRepo
        .findUnique({
          where: { userId },
        })
        .catch(() => null);

      return ok(!!admin);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Get all admins
   * @async
   */
  async getAllAdmins(): Promise<Result<Admin[]>> {
    try {
      const admins = await this.adminRepo.findMany({
        include: {
          user: true,
        },
      });

      return ok(admins);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Get admin by user ID
   * @async
   * @param userId User ID
   */
  async getAdminByUserId(userId: string): Promise<Result<Admin>> {
    if (!userId) {
      return err(new NotProvidedError("User ID"));
    }

    try {
      const admin = await this.adminRepo.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return ok(admin);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }
}
