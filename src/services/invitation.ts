import { prisma } from '../lib/prisma.ts';

/**
 * @param userId - id of the user
 * @param invitationId - id of the invitation
 * @return invitation object
 */
export async function acceptInvitation(userId: string, invitationId: string) {
  return await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { id: invitationId },
      select: {
        status: true,
        recipientId: true,
        teamId: true,
      },
    });

    if (
      !invitation ||
      invitation.recipientId !== userId ||
      invitation.status !== 'PENDING'
    ) {
      throw new Error('Invalid or expired invitation.');
    }

    await tx.user.update({
      where: { id: userId },
      data: { teamId: invitation.teamId },
    });

    const newInvitation = await tx.invitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' },
    });

    await tx.invitation.updateMany({
      where: {
        recipientId: userId,
        status: 'PENDING',
        id: { not: invitationId },
      },
      data: { status: 'DECLINED' },
    });

    return newInvitation;
  });
}

/**
 * Update invitation status to "declined"
 */
export async function declineInvitation(invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new Error('Invitation not found');
  }

  return await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'DECLINED' },
  });
}

export async function revokeInvitation(invitationId: string) {
  const invitation = await prisma.invitation.findUnique({ 
    where: { id: invitationId },
    select: { status: true },
  });

  if (!invitation || invitation.status !== "PENDING") {
    throw new Error("Invitation not found or unrevokable");
  }

  return await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED" },
  });
}

/**
 *  TODO:
 * Create invite record between sender & recipient
 * @async
 * @param senderId - id of sender
 * @param recipientId - id of recipient
 * @param teamId - id of team
 * @return invitation object
 */
export async function createOrSendInvitation(
  senderId: string,
  recipientId: string,
  teamId: string
) {
  const [sender, recipient, team, existingInvite] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { id: recipientId } }),
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.invitation.findFirst({
      where: { senderId, recipientId },
      select: { id: true, status: true },
    }),
  ]);

  if (!sender) {
    throw new Error("Sender's ID not found");
  }
  if (!recipient) {
    throw new Error("Recipient's ID not found");
  }
  if (!team) {
    throw new Error("Team's ID not found");
  }
  if (existingInvite && existingInvite.status === 'PENDING') {
    throw new Error('Invite already exists');
  }

  if (existingInvite) {
    return await prisma.invitation.update({
      where: { id: existingInvite.id },
      data: { status: 'PENDING' },
    });
  }

  return await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        senderId,
        recipientId,
        teamId,
        status: 'PENDING',
      },
    });
    await tx.user.update({
      where: { id: senderId },
      data: {
        sentInvites: {
          connect: {
            id: invitation.id,
          },
        },
      },
    });
    await tx.user.update({
      where: { id: recipientId },
      data: {
        receivedInvites: {
          connect: {
            id: invitation.id,
          },
        },
      },
    });
    return invitation;
  });
}

export async function fetchInvitations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { receivedInvites: true },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user.receivedInvites;
}
