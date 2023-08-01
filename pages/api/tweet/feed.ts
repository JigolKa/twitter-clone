import { getServerSession } from "next-auth";
import { Handler } from "~/lib/api/types";
import { resolver } from "~/lib/middleware";
import prisma from "~/prisma/db";
import { authOptions } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

const handler: Handler = async (params) => {
  const session = await getServerSession(
    params.req as NextApiRequest,
    params.res as NextApiResponse,
    authOptions
  );

  const tweets = await prisma.tweet.findMany({
    take: 15,
    select: {
      tweetId: true,
      html: true,
      createdAt: true,
      author: { select: { userId: true, username: true, image: true } },
    },
  });

  return {
    data: tweets,
  };
};

export default resolver(handler, {
  isAuthorized: async (req, res) => {
    const session = await getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions
    );

    return session && typeof session.user !== "undefined" ? true : false;
  },
});
