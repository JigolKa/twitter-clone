import { useSession } from "next-auth/react";
import Head from "next/head";
import Feed from "~/components/Feed";

export default function Home() {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Twitter Clone</title>
      </Head>

      <h1 className="text-4xl font-bold tracking-tighter">Home</h1>

      <Feed
        className="mt-6"
        fetching={{
          fetchUrl: "/api/tweet/feed",
        }}
      />
    </>
  );
}
