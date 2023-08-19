import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { getServerSession } from "~/utils/hooks";
import { authOptions } from "../../auth/[...nextauth]";
import { feedInclude } from "../feed";
import { FetchedTweetSample } from "~/types";
import { retrieveParameters } from "~/utils";
import { sortTweets } from "~/utils/sort";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { take, skip, id, sort } = retrieveParameters(req.query);
  const session = await getServerSession(req, res, authOptions);

  const tweets = await prisma.tweet.findMany({
    include: feedInclude,
    where: {
      rootTweetId: id as string,
    },
  });

  const user = session?.user
    ? await prisma.user.findFirst({
        where: {
          id: session?.user.id,
        },
        include: {
          likes: {
            select: {
              id: true,
            },
          },
          retweets: {
            select: {
              tweetId: true,
            },
          },
        },
      })
    : null;

  const isLoggedIn = user && session?.user && session?.user !== null;
  const likes = user?.likes.map((v) => v.id);
  const retweets = user?.retweets.map((v) => v.tweetId);

  const json = tweets.map((v) => ({
    ...v,
    retweets: v.retweets.map((k) => ({ email: k.user.email })),
    isLiked: isLoggedIn && likes ? likes.includes(v.id) : false,
    isRetweeted: isLoggedIn && retweets ? retweets.includes(v.id) : false,
  })) as FetchedTweetSample[];

  return res.json(sortTweets(json, sort).slice(skip, skip + take));
}
