import { NextApiRequest, NextApiResponse } from "next";
import { DetailedTweet } from "~/pages/tweet/[id]";
import prisma from "~/prisma/db";

export const userInfos = {
  id: true,
  name: true,
  image: true,
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const tweet = await prisma.tweet.findFirst({
    where: {
      id: id as string,
    },
    include: {
      likes: { select: { email: true } },
      comments: {
        include: {
          retweets: { select: { user: { select: { email: true } } } },
          likes: { select: { email: true } },
          author: {
            select: {
              id: true,
              image: true,
              name: true,
            },
          },
        },
      },
      retweets: { select: { user: { select: { email: true } } } },
      author: {
        select: {
          id: true,
          image: true,
          name: true,
          followedBy: true,
        },
      },
    },
  });

  return res.json({
    ...tweet,
    retweets: tweet?.retweets.map((v) => ({ email: v.user.email })),
    comments: tweet?.comments.map((v) => ({
      ...v,
      retweets: v.retweets.map((k) => ({ email: k.user.email })),
    })),
  } as DetailedTweet);
}
