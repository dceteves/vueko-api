import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.ts";
import { prisma } from "../lib/prisma.ts";

/**
 * @param captainId - id of the captain
 * @param teamName - name of the team
 * @return team object
 */
export async function createTeam(captainId: string, teamName: string) {
  const user = await prisma.user.findUnique({
    where: { id: captainId },
    select: {
      teamId: true,
      discordId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.discordId) {
    throw new Error("User does not have Discord linked");
  }

  if (user.teamId) {
    throw new Error("User is already on a team");
  }

  try {
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name: teamName,
          captainId: captainId,
        },
      });
      await tx.user.update({
        where: { id: captainId },
        data: { teamId: newTeam.id },
      });
      return newTeam;
    });
    return team;
  } catch (err) {
    throw err as Error;
  }
}

export async function fetchTeams() {
  return await prisma.team.findMany({});
}
export async function fetchTeam(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }
  return team;
}

export async function updateTeam(teamId: string, newName: string) {
  const team = await prisma.team.update({
    where: { id: teamId },
    data: { name: newName },
    select: { id: true, name: true },
  });
  if (!team) {
    throw new Error("Team not found");
  }
  return team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { members: { select: { id: true } } },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  await prisma.$transaction(async (tx: TransactionClient) => {
    const memberPromises = team.members.map((member) => {
      tx.user.update({
        where: { id: member.id },
        data: { teamId: null },
        select: { id: true },
      });
    });

    await Promise.all([
      ...memberPromises,
      tx.team.delete({ where: { id: teamId } }),
    ]);
  });
}
