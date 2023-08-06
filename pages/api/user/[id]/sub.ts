import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Authorized" });
  }

  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: id as string,
    },
  });

  if (!targetUser) {
    return res.status(404).json({ message: "Not Found" });
  }

  const user = (await prisma.user.findFirst({
    where: {
      email: session.user.email!,
    },
    include: {
      following: true,
    },
  }))!;

  const isFollowing = user.following.map((v) => v.id).includes(id as string);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      following: {
        [isFollowing ? "disconnect" : "connect"]: {
          id: id as string,
        },
      },
    },
    include: {
      likes: true,
    },
  });

  return res.json(updatedUser);
}
