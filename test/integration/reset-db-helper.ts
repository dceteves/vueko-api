import prisma from "../../src/lib/prisma";

export default async () => {
  await prisma.$transaction([
    prisma.invitation.deleteMany(),
    prisma.team.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};
