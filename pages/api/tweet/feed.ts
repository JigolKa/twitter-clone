import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { authOptions } from "../auth/[...nextauth]";
import { FetchedTweetSample } from "~/components/Tweet";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const tweets = await prisma.tweet.findMany({
    take: 15,
    include: {
      likes: { select: { email: true } },
      comments: { select: { id: true } },
      retweets: { select: { user: { select: { email: true } } } },
      author: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
  });

  return res.json(
    tweets.map((v) => ({
      ...v,
      retweets: v.retweets.map((k) => ({ email: k.user.email })),
    })) as FetchedTweetSample[]
  );
}
