import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { feedInclude } from "../../tweet/feed";
import { FetchedTweetSample } from "~/components/Tweet";
import { UnwrapPromise } from "~/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const user = await prisma.user.findFirst({
    where: {
      id: id as string,
    },
    include: {
      tweets: {
        take: 15,
        where: {
          rootTweetId: null,
        },
        include: feedInclude,
      },
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
    tweets: user.tweets.map((v) => ({
      ...v,
      retweets: v.retweets.map((k) => ({ email: k.user.email })),
    })) as FetchedTweetSample[],
  };

  res.json(json);
  res.end();

  return json;
}

export type Profile = Exclude<UnwrapPromise<ReturnType<typeof handler>>, void>;
