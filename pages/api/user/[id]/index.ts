import { NextApiRequest, NextApiResponse } from "next";
import { FetchedTweetSample } from "~/components/Tweet";
import prisma from "~/prisma/db";
import { UnwrapArray, UnwrapPromise } from "~/types";
import { feedInclude } from "../../tweet/feed";

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
      retweets: {
        where: { isDeleted: false },
        include: {
          tweet: { include: feedInclude },
        },
      },
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

  const unwrap = (v: UnwrapArray<typeof user.tweets>) => ({
    ...v,
    retweets: v.retweets.map((k) => ({ email: k.user.email })),
  });

  const json = {
    ...user,
    following: user.following.map((v) => v.id),
    followedBy: user.followedBy.map((v) => v.id),
    tweets: [...user.tweets, ...user.retweets]
      .map((v) =>
        "isDeleted" in v
          ? { ...unwrap(v.tweet), isRetweet: true }
          : { ...unwrap(v), isRetweet: false }
      )
      .sort(
        (a, b) =>
          +b[b.isRetweet ? "updatedAt" : "createdAt"] -
          +a[a.isRetweet ? "updatedAt" : "createdAt"]
      ) as FetchedTweetSample[],
  };

  res.json(json);
  res.end();

  return json;
}

export type Profile = Exclude<UnwrapPromise<ReturnType<typeof handler>>, void>;
