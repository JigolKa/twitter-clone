import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message } = req.body;
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  const tweet = await prisma.tweet.create({
    data: {
      message,
      author: {
        connect: {
          email: session.user.email!,
        },
      },
    },
  });

  return res.json(tweet);
}
