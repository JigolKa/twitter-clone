import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Feed from "~/components/Feed";
import { FetchedTweetSample, TweetSkeleton } from "~/components/Tweet";
import { useSWR } from "~/utils/hooks";

export default function Home() {
  const session = useSession();
  const { data } = useSWR<FetchedTweetSample[]>("/api/tweet/feed");

  return (
    <>
      <Head>
        <title>Twitter Clone</title>
      </Head>

      <h1 className="text-4xl font-bold tracking-tighter">Home</h1>
      {session.data && <button onClick={() => signOut()}>sign out</button>}

      {data ? (
        <Feed className="mt-6" tweets={data} />
      ) : (
        <div className="grid gap-8 mt-4">
          {new Array(10).fill(0).map((_, i) => (
            <TweetSkeleton preset="feed" key={i} />
          ))}
        </div>
      )}
    </>
  );
}
