import UserRepository from "../repositories/user.ts";
import { extractProfile } from "../utils/prisma.ts";
import { ok, err, type Result } from "../utils/result.ts";

import type { User } from "../generated/prisma/client.ts";
import type { OsuProfile, DiscordProfile } from "../types/passport.types.ts";
import type { Profile } from "passport";
import { NotProvidedError, UnexpectedError } from "../utils/error.ts";

export default class UserService {
  private repo: UserRepository;

  constructor(repo?: UserRepository) {
    this.repo = repo || new UserRepository();
  }

  // TODO: ?
  //private async invoke(op: () => void, args);

  /**
   * TODO:
   * User creation
   * @async
   * @param refreshToken
   * @param refreshToken
   * @param profile - Object containing user info
   * @return user
   */
  async userFromProfile<T extends Profile>(
    accessToken: string,
    refreshToken: string,
    profile: T,
  ): Promise<Result<User>> {
    if (!accessToken) {
      return err(new NotProvidedError("Access token"));
    }
    if (!refreshToken) {
      return err(new NotProvidedError("Refresh token"));
    }

    const data = extractProfile(profile);

    if (!data) {
      return err(new Error("Invalid profile provided"));
    }

    const { where, update } = data;

    const user = await this.repo.upsert({
      where,
      update,
      create: { ...where, ...update },
    });

    return ok(user);
  }

  /**
   * Fetch user from id
   * @async
   * @throws User not found Error
   * @param id User ID
   */
  async findUser(id: string): Promise<Result<User>> {
    if (!id) {
      return err(new NotProvidedError("Id"));
    }
    const user = await this.repo.findUnique({ where: { id } });

    return ok(user);
  }

  /**
   * Attach Osu credentials to existing user
   * @async
   */
  async linkOsuProfile(id: string, profile: OsuProfile): Promise<Result<User>> {
    if (!id) {
      return err(new NotProvidedError("Id"));
    }

    try {
      const user = await this.repo.update({
        where: { id },
        data: {
          osuId: profile.id,
          osuUsername: profile.username,
          osuAvatar: profile.avatar_url,
          countryCode: profile.country_code,
        },
      });
      return ok(user);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Helper function for DiscordStrategy
   * Link discord id and username to user record
   * @async
   * @throws error
   * @param id
   * @param profile Discord profile (discordId and discordUsername)
   * @return user promise
   */
  async linkDiscordProfile(
    id: string,
    profile: DiscordProfile,
  ): Promise<Result<User>> {
    if (!id) {
      return err(new NotProvidedError("Id"));
    }

    try {
      const user = await this.repo.update({
        where: { id: id },
        data: {
          discordId: profile.id,
          discordUsername: profile.username,
        },
      });
      return ok(user);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Helper function for DiscordStrategy
   * @async
   * @throws error
   * @param id
   */
  async dropDiscordCredentials(id: string): Promise<Result<User>> {
    if (!id) {
      return err(new NotProvidedError("Id"));
    }

    try {
      const user = await this.repo.update({
        where: { id: id },
        data: {
          discordId: null,
          discordUsername: null,
        },
      });
      return ok(user);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Update timezone field of user
   * @async
   * @throws Invalid timezone error
   */
  async updateTimezone(id: string, timezone: number): Promise<Result<User>> {
    if (!id) {
      return err(new NotProvidedError("Id"));
    }
    if (timezone < -12 || timezone > 14) {
      return err(new NotProvidedError("Invalid timezone"));
    }

    try {
      const user = await this.repo.update({
        where: { id },
        data: { timezone },
      });
      return ok(user);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }
}
