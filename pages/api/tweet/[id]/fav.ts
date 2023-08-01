import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Handler } from "~/lib/api/types";
import { resolver } from "~/lib/middleware";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "~/prisma/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Authorized" });
  }

  const { id } = req.query;
  const session = await getServerSession(
    req as NextApiRequest,
    res as NextApiResponse,
    authOptions
  );

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const tweet = await prisma.tweet.findFirst({
    where: {
      tweetId: id as string,
    },
    include: {
      favorites: true,
    },
  });

  if (!tweet) {
    return res.status(404).json({ message: "Not Found" });
  }

  const user = (await prisma.user.findFirst({
    where: {
      email: session.user.email!,
    },
  }))!;

  let emails = Array.from(new Set(tweet.favorites));
  console.log("🚀 ~ file: fav.ts:43 ~ emails:", emails);

  if (emails.filter((v) => v.email === user.email).length > 0) {
    emails = emails.filter((v) => v.email !== user.email);
  } else {
    emails.push(user);
  }

  const updatedTweet = await prisma.tweet.update({
    where: {
      tweetId: id as string,
    },
    data: {
      favorites: {
        set: emails,
      },
    },
    include: {
      favorites: true,
    },
  });

  return res.json(updatedTweet);
}
