import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "~/prisma/db";
import { SessionContext } from "~/types";
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
  const { data } = (await getServerSession(
    req as NextApiRequest,
    res as NextApiResponse,
    authOptions
  )) as SessionContext;
  console.log("🚀 ~ file: tweet.ts:28 ~ session:", data);

  if (!data || typeof data.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const tweet = await prisma.tweet.create({
    data: {
      authorId: data.user.userId,
      rootTweetId: id as string,
      message,
    },
  });

  return res.json(tweet);
}
