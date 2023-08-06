import { signOut, useSession } from "next-auth/react";
import Feed from "~/components/Feed";
import { FetchedTweetSample } from "~/components/Tweet";
import { useSWR } from "~/utils/hooks";

export default function Home() {
  const session = useSession();
  const { data } = useSWR<FetchedTweetSample[]>("/api/tweet/feed");

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tighter">Home</h1>
      <button onClick={() => signOut()}>sign out</button>

      {data ? <Feed className="mt-6" tweets={data} /> : null}
    </>
  );
}
