import Fuse from "fuse.js";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "~/prisma/db";

const fuseOptions: Fuse.IFuseOptions<unknown> = {
  keys: ["message", "author.name", "comments.message", "likes.name"],
  threshold: 0.5,
  includeMatches: true,
  minMatchCharLength: 3,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tweets = await prisma?.tweet.findMany({
    include: {
      author: {
        select: {
          name: true,
        },
      },
      comments: {
        select: {
          message: true,
        },
      },
    },
  });

  const fuse = new Fuse(tweets, fuseOptions);

  return res.json(
    fuse
      .search(decodeURIComponent(req.query.q as string))
      .sort((a, b) => a.refIndex - b.refIndex)
      .map((v) => v.item)
      .slice(0, 12)
  );
}
