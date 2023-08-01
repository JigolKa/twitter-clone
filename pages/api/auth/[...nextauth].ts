import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import Auth0Provider from "next-auth/providers/auth0";
import DiscordProvider from "next-auth/providers/discord";
import prisma from "~/prisma/db";
import { omit } from "~/utils";

const discordScopes = ["identify", "email"].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: discordScopes } },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      const emails = (
        await prisma.user.findMany({ select: { email: true } })
      ).map((v) => v.email);
      console.log(
        "🚀 ~ file: [...nextauth].ts:29 ~ signIn: ~ emails:",
        emails,
        user
      );

      if (emails.includes(user.email ?? "")) return true;

      const _ = await prisma.user.create({
        data: {
          ...omit(user, "email", "id", "name"),
          username: user.name || user.email!,
          email: user.email!,
        },
      });

      return true;
    },

    session: async ({ session }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: session.user?.email!,
        },
      });

      return {
        ...session,
        user: {
          ...session.user,
          userId: user?.userId,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
