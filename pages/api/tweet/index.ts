import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message } = req.body;

  const tweet = await prisma.tweet.create({
    data: {
      message,
      author: {
        connect: {
          id: "",
        },
      },
    },
  });
}
