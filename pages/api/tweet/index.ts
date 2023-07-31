import { NextApiRequest } from "next";
import { Handler } from "~/lib/api/types";
import { resolver } from "~/lib/middleware";
import prisma from "~/prisma/db";

const handler: Handler = async (params) => {
  const { html } = params.body;

  const tweet = await prisma.tweet.create({
    data: {
      html,
      author: {
        connect: {
          userId: "",
        },
      },
    },
  });
};

export default resolver(handler, {
  authorizedMethods: ["POST"],
  keys: ["html"],
});
