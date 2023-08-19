import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { FetchedTweetSample } from "~/types";
import { retrieveParameters } from "~/utils";
import { getServerSession } from "~/utils/hooks";
import { sortTweets } from "~/utils/sort";
import { authOptions } from "../../auth/[...nextauth]";

export const feedInclude = {
  likes: { select: { email: true } },
  comments: { select: { id: true } },
  retweets: {
    where: { isDeleted: false },
    select: { user: { select: { email: true } } },
  },
  author: {
    select: {
      id: true,
      image: true,
      name: true,
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { take, skip, sort } = retrieveParameters(req.query);

  const tweets = await prisma.tweet.findMany({
    include: feedInclude,
    where: {
      rootTweet: null,
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

  // await new Promise((res) => setTimeout(res, 999000));

  return res.json(sortTweets(json, sort).slice(skip, skip + take));
}
