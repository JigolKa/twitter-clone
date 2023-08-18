import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { FetchedTweetSample } from "~/types";
import { shuffle } from "~/utils";
import { feedInclude } from ".";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const tweets = await prisma.tweet.findMany({
    include: feedInclude,
  });

  const randomizedSet = shuffle(
    tweets.map((v) => ({
      ...v,
      retweets: v.retweets.map((k) => ({ email: k.user.email })),
    }))
  ) as FetchedTweetSample[];

  return res.json(randomizedSet.slice(0, 15));
}
