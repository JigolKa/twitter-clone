import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const tweet = await prisma.tweet.findFirst({
    where: {
      tweetId: id as string,
    },
    include: {
      author: { select: { userId: true, username: true, image: true } },
      favorites: { select: { email: true } },
    },
  });

  return res.json(tweet);
}
