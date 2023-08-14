import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Authorized" });
  }

  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const tweet = await prisma.tweet.findFirst({
    where: {
      id: id as string,
    },
    include: {
      likes: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!tweet) {
    return res.status(404).json({ message: "Not Found" });
  }

  const user = (await prisma.user.findFirst({
    where: {
      email: session.user.email!,
    },
    select: {
      id: true,
      email: true,
    },
  }))!;

  let ids = Array.from(new Set(tweet.likes.map((v) => ({ id: v.id })))) as {
    id?: string;
  }[];

  const isLiked = ids.filter((v) => v.id === user.id).length > 0;

  if (isLiked) {
    ids = ids.filter((v) => v.id !== user.id);
  } else {
    ids.push({ id: user.id });
  }

  const updatedTweet = await prisma.tweet.update({
    where: {
      id: id as string,
    },
    data: {
      likes: {
        set: ids,
      },
    },
    include: {
      likes: true,
    },
  });

  return res.json(updatedTweet);
}
