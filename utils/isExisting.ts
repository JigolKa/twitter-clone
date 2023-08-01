import { Prisma } from "@prisma/client";
import prisma from "~/prisma/db";

export async function isExisting(
  filter: Exclude<Prisma.UserFindFirstArgs["where"], undefined>
) {
  const user = await prisma.user.findFirst({ where: filter });

  return user;
}
