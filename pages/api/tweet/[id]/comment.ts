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

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const comment = await prisma.tweet.create({
    data: {
      message,
      author: {
        connect: {
          email: session.user.email!,
        },
      },
      rootTweet: {
        connect: {
          id: id as string,
        },
      },
    },
  });

  const updatedTweet = await prisma.tweet.update({
    where: {
      id: id as string,
    },
    data: {
      comments: {
        connect: {
          id: comment.id,
        },
      },
    },
  });

  return res.json(updatedTweet);
}
