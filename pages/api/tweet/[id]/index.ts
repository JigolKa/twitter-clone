import { NextApiRequest, NextApiResponse } from "next";
import { DetailedTweet } from "~/pages/tweet/[id]";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { authOptions } from "../../auth/[...nextauth]";

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

  switch (req.method) {
    case "GET": {
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

    case "PATCH": {
      const { message } = req.body;

      if (!message) return res.status(400).json({ message: "Bad Request" });

      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user)
        return res.status(401).json({ message: "Not Authorized" });

      const tweet = await prisma.tweet.findFirst({
        where: {
          id: id as string,
        },
        include: {
          author: {
            select: {
              email: true,
            },
          },
        },
      });

      const isAuthor = session.user?.email === tweet?.author.email;

      if (!isAuthor) return res.status(403).json({ message: "Forbidden" });

      const updatedTweet = await prisma.tweet.update({
        where: {
          id: id as string,
        },
        data: {
          message,
        },
      });

      return res.json(updatedTweet);
    }
  }
}
