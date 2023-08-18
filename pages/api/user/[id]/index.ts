import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { UnwrapPromise } from "~/types";
import { getServerSession } from "~/utils/hooks";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findFirst({
    where: {
      id: id as string,
    },
    include: {
      followedBy: {
        select: {
          id: true,
        },
      },
      following: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const json = {
    ...user,
    following: user.following.map((v) => v.id),
    followedBy: user.followedBy.map((v) => v.id),
  };

  res.json(json);
  res.end();

  return json;
}

export type ProfileInfo = Exclude<
  UnwrapPromise<ReturnType<typeof handler>>,
  void
>;
