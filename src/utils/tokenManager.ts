import prisma from '../prisma';

export default class TokenManager {
  async getValidAccessToken(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.accessToken) {
      throw new Error('No OAuth account found');
    }

    const isExpired = user.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);
    if (isExpired) {
      return user.accessToken;
    }

    return await this.refreshUserToken(user);
  }

  async refreshUserToken(user) {
    try {
      console.log(`Refreshing token for ${user.osuUsername}`);

      const response = await fetch('https://osu.ppy.sh/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'applicaation/json',
        },
        body: JSON.stringify({
          client_id: process.env.OSU_ID,
          client_secret: process.env.OSU_SECRET,
          grant_type: 'refresh_token',
          refresh_token: user.refreshToken,
        })
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
          tokenExpiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        }
      });

      console.log(`✅ Token refreshed for ${user.osuUsername}`);
      return tokens.access_token;
    } catch (error) {
      console.error(`❌ Token refresh failed for ${user.osuUsername}:`, error.message);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null
        }
      });
      throw new Error('Token refresh failed - reauthentication required');
    }
  }

  async refreshAllExpiredTokens() {
    const expiredUsers = await prisma.user.findMany({
      where: {
        refreshToken: { not: null },
        tokenExpiresAt: {
          lt: new Date(Date.now() + 5 * 60 * 1000)
        }
      }
    });
    
    console.log(`Found ${expiredUsers.length} tokens needing refresh`);

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const user of expiredUsers) {
      try {
        await this.refreshUserToken(user);
        results.successful++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.failed++;
        results.errors.push({
          username: user.osuUsername,
          error: error.message
        });
      }
    }
    return results;
  }
}
