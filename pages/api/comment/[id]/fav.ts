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
  const session = await getServerSession(
    req as NextApiRequest,
    res as NextApiResponse,
    authOptions
  );

  if (!session || typeof session.user === "undefined") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const comment = await prisma.tweet.findFirst({
    where: {
      id: id as string,
    },
    include: {
      likes: true,
    },
  });

  if (!comment) {
    return res.status(404).json({ message: "Not Found" });
  }

  const user = (await prisma.user.findFirst({
    where: {
      email: session.user.email!,
    },
  }))!;

  let emails = Array.from(new Set(comment.likes));

  if (emails.filter((v) => v.email === user.email).length > 0) {
    emails = emails.filter((v) => v.email !== user.email);
  } else {
    emails.push(user);
  }

  const updatedTweet = await prisma.tweet.update({
    where: {
      id: id as string,
    },
    data: {
      likes: {
        set: emails as any,
      },
    },
    include: {
      likes: true,
    },
  });

  return res.json(updatedTweet);
}
