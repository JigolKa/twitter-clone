import { Prisma } from "@prisma/client";
import prisma from "~/prisma/instance";

export async function isExisting(
  filter: Exclude<Prisma.UserFindFirstArgsBase["where"], undefined>
) {
  const user = await prisma.user.findFirst({ where: filter });

  return user;
}
