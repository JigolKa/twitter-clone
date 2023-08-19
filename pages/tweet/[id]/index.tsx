import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import Feed from "~/components/Feed";
import { TweetElement, TweetSkeleton } from "~/components/Tweet";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { TOAST_ERROR_MESSAGE } from "~/config";
import { FeedContext } from "~/contexts/FeedContext";
import { createRedisInstance } from "~/lib/redis";
import { DetailedTweet } from "~/types";
import { useSWR } from "~/utils/hooks";

export interface HitsProps {
  hits: number;
}

export default function Tweet({ hits }: HitsProps) {
  const ctx = useContext(FeedContext);
  const router = useRouter();
  const { data, mutate } = useSWR<DetailedTweet>(
    router.query ? `/api/tweet/${router.query.id}` : null
  );
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { data: user } = useSession();

  const comment = () => {
    if (!user || !data) {
      return signIn();
    }

    setLoading(true);

    axios
      .post(`/api/tweet/${router.query.id}/comment`, {
        message,
      })
      .catch((e) => {
        toast.error(TOAST_ERROR_MESSAGE);
      })
      .finally(() => {
        mutate();
        ctx?.triggerRefresh?.();
      });

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>
          {data
            ? `${data.author.name} on Twitter Clone - ${data.message.slice(
                0,
                30
              )}${data.message.length > 30 && "..."}`
            : "Twitter Clone"}
        </title>
      </Head>

      {data ? (
        <TweetElement
          tweet={{ ...data, hits }}
          callback={() => mutate()}
          preset="detailed"
        />
      ) : (
        <TweetSkeleton preset="detailed" />
      )}
      <h2 className="text-3xl tracking-tight font-bold mt-8">Comments</h2>

      <Feed
        tweetProps={{
          disableBodyLink: true,
        }}
        fetchUrl={data ? `/api/tweet/${data.id}/feed` : null}
        className="mt-2"
      />

      {data && (
        <>
          <h3 className="text-2xl font-bold tracking-tight mt-8">
            Comment this Tweet
          </h3>
          <div className="grid gap-2 mt-4">
            <Textarea
              className="min-h-[8rem]"
              placeholder="What are your thoughts?"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
            <div className="w-full flex justify-end">
              <Button isLoading={isLoading} onClick={comment}>
                Comment
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const redis = createRedisInstance();

  const id = ctx.query.id as string;

  const value = await redis.get(id);

  if (!value) {
    await redis.set(id, 1);
  } else {
    await redis.incr(id);
  }

  await redis.quit();

  return {
    props: {
      hits: value ? +value + 1 : 1,
    },
  };
}
