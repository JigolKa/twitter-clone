import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { FetchedTweetSample, UnwrapArray } from "~/types";
import { getServerSession } from "~/utils/hooks";
import { authOptions } from "../../auth/[...nextauth]";
import { feedInclude } from "../../tweet/feed";
import { sortTweets } from "~/utils/sort";
import { retrieveParameters } from "~/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { take, skip, sort, id } = retrieveParameters(req.query);

  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findFirst({
    where: {
      id: id as string,
    },
    include: {
      likes: {
        select: { id: true },
      },
      retweets: {
        where: { isDeleted: false },
        include: {
          tweet: { include: feedInclude },
        },
      },
      tweets: {
        where: {
          rootTweetId: null,
        },
        include: feedInclude,
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const unwrap = (v: UnwrapArray<typeof user.tweets>) => ({
    ...v,
    retweets: v.retweets.map((k) => ({ email: k.user.email })),
  });

  const isLoggedIn = session?.user && session?.user !== null;
  const likes = user.likes.map((v) => v.id);
  const retweets = user.retweets.map((v) => v.tweetId);

  const json = [...user.tweets, ...user.retweets]
    .map((v) => {
      const isRetweet = "isDeleted" in v;
      const id = isRetweet ? v.tweet.id : v.id;

      return {
        ...(isRetweet
          ? {
              ...unwrap(v.tweet),
              createdAt: v.createdAt,
            }
          : { ...unwrap(v) }),
        id: id,
        isRetweeted: isLoggedIn ? retweets.includes(id) : false,
        isLiked: isLoggedIn ? likes.includes(id) : false,
        isRetweet,
      };
    })
    .sort((a, b) => +b.createdAt - +a.createdAt) as FetchedTweetSample[];

  res.json(sortTweets(json, sort).slice(skip, skip + take));
  res.end();

  return json;
}
