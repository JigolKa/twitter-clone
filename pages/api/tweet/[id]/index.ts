import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";
import { getServerSession } from "~/utils/hooks";
import { authOptions } from "../../auth/[...nextauth]";
import { DetailedTweet } from "~/types";

export const userInfos = {
  id: true,
  name: true,
  image: true,
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  const session = await getServerSession(req, res, authOptions);

  switch (req.method) {
    case "GET": {
      const user = await prisma.user.findFirst({
        where: {
          id: session?.user?.id,
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
      });

      if (!user) {
        console.error(session);
        return res
          .status(404)
          .json({ message: "Your account is not linked properly." });
      }

      const tweet = await prisma.tweet.findFirst({
        where: {
          id: id,
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
          retweets: {
            where: {
              isDeleted: false,
            },
            select: { user: { select: { email: true } } },
          },
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

      if (!tweet) {
        return res.status(404).json({ message: "Not Found" });
      }

      const isLoggedIn = session?.user && session?.user !== null;

      const likes = user.likes.map((v) => v.id);
      const retweets = user.retweets.map((v) => v.tweetId);

      return res.json({
        ...tweet,
        retweets: tweet?.retweets.map((v) => ({ email: v.user.email })),
        comments: tweet?.comments.map((v) => ({
          ...v,
          retweets: v.retweets.map((k) => ({ email: k.user.email })),
          isLiked: isLoggedIn ? likes.includes(v.id) : false,
          isRetweeted: isLoggedIn ? retweets.includes(v.id) : false,
        })),
        isLiked: isLoggedIn ? likes.includes(id) : false,
        isRetweeted: isLoggedIn ? retweets.includes(id) : false,
      } as DetailedTweet);
    }

    case "PATCH": {
      const { message } = req.body;

      if (!message) return res.status(400).json({ message: "Bad Request" });

      if (!session || !session.user)
        return res.status(401).json({ message: "Not Authorized" });

      const tweet = await prisma.tweet.findFirst({
        where: {
          id: id,
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
          id: id,
        },
        data: {
          message,
        },
      });

      return res.json(updatedTweet);
    }
  }
}
