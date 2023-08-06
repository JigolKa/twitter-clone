import { Retweet } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { userInfos } from ".";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("retweet called");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Authorized" });
  }

  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const user = (await prisma.user.findFirst({
    where: {
      email: session.user.email!,
    },
    include: {
      retweets: true,
    },
  }))!;

  const retweet = await prisma.retweet.findFirst({
    where: {
      tweetId: id as string,
    },
    include: {
      user: {
        select: userInfos,
      },
    },
  });

  let updatedRetweet: Retweet | null = null;

  if (!retweet) {
    updatedRetweet = await prisma.retweet.create({
      data: {
        tweetId: id as string,
        userId: user.id,
      },
    });
  } else {
    updatedRetweet = await prisma.retweet.update({
      where: {
        id: retweet.id,
      },
      data: {
        isDeleted: !retweet.isDeleted,
      },
    });
  }

  return res.json(updatedRetweet);
}
