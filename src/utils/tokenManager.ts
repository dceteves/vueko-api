import prisma from "../lib/prisma.ts";
import type { UserModel } from "../generated/prisma/models.ts";

export default class TokenManager {
  async getValidAccessToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.accessToken || !user.tokenExpiresAt) {
      throw new Error("No OAuth account found");
    }

    const isExpired =
      user.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired) {
      return user.accessToken;
    }

    return await this.refreshUserToken(user);
  }

  async refreshUserToken(user: UserModel) {
    try {
      console.log(`Refreshing token for ${user.osuUsername}`);

      const response = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "applicaation/json",
        },
        body: JSON.stringify({
          client_id: process.env.OSU_ID,
          client_secret: process.env.OSU_SECRET,
          grant_type: "refresh_token",
          refresh_token: user.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokens = await response.json();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      console.log(`✅ Token refreshed for ${user.osuUsername}`);
      return tokens.access_token;
    } catch (error) {
      console.error(
        `Token refresh failed for ${user.osuUsername}:`,
        (error as Error).message,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        },
      });
      throw new Error("Token refresh failed - reauthentication required");
    }
  }

  async refreshAllExpiredTokens() {
    const expiredUsers = await prisma.user.findMany({
      where: {
        refreshToken: { not: null },
        tokenExpiresAt: {
          lt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
    });

    console.log(`Found ${expiredUsers.length} tokens needing refresh`);

    let successful: number = 0;
    const errors: { id: string; error: string }[] = [];

    for (const user of expiredUsers) {
      try {
        await this.refreshUserToken(user);
        successful += 1;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errors.push({
          id: user.id,
          error: (error as Error).message,
        });
      }
    }
    return { successful, errors };
  }
}
