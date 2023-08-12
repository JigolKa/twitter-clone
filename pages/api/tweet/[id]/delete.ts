import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send(`Cannot ${req.method} this endpoint`);

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user)
    return res.status(401).json({ message: "Not Authorized" });

  const { id } = req.query;

  const tweet = await prisma?.tweet.findFirst({
    where: {
      id: id as string,
    },
    include: {
      rootTweet: { include: { author: { select: { email: true } } } },
      author: {
        select: {
          email: true,
        },
      },
    },
  });

  const isAuthor = session.user.email === tweet?.author.email;

  if (!isAuthor) return res.status(403).json({ message: "Forbidden" });

  const deletedTweet = await prisma.tweet.delete({
    where: {
      id: id as string,
    },
  });

  return res.json(deletedTweet);
}
