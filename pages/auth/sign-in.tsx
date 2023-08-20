import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { Component } from "~/types";
import { cx } from "~/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faGithub,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/router";
import { TOAST_ERROR_MESSAGE } from "~/config";
import Link from "next/link";

const errors: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked with another account. Please select another provider/email.",
};

const SignIn: Component = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  return (
    <div className="h-full min-h-[90vh] w-full flex items-center justify-center">
      <div className="p-4 border border-gray-100 shadow-md text-center rounded w-[30rem]">
        <h1 className="tracking-tight text-3xl font-bold">Welcome back!</h1>

        <p
          className={cx(
            "mt-2",
            router.query.error
              ? "text-red-600 text-md"
              : "text-gray-700 text-sm"
          )}
        >
          {router.query.error
            ? errors[router.query.error as string] ?? TOAST_ERROR_MESSAGE
            : "You can sign in with the following providers:"}
        </p>

        <div className="flex flex-col gap-3 mt-8">
          {Object.values(providers).map((provider) => (
            <button
              key={provider.name}
              className={cx(
                "w-full py-3 rounded-full flex items-center text-lg justify-center gap-3 transition hover:bg-gray-200",
                {
                  github: "bg-gray-800 hover:bg-black text-white",
                  discord: "bg-blue-600 text-white hover:bg-blue-700",
                }[provider.name.toLowerCase()]
              )}
              onClick={() => signIn(provider.id)}
            >
              <FontAwesomeIcon
                icon={
                  { google: faGoogle, discord: faDiscord, github: faGithub }[
                    provider.name.toLowerCase()
                  ]!
                }
                size="lg"
              />
              <span>{provider.name}</span>
            </button>
          ))}
        </div>

        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 hover:underline mt-8 max-w-fit mx-auto block"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
};

SignIn.hasSidebar = false;
export default SignIn;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
