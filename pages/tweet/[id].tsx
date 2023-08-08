import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Feed from "~/components/Feed";
import {
  FetchedTweetSample,
  TweetElement,
  TweetSkeleton,
} from "~/components/Tweet";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { createRedisInstance } from "~/lib/redis";
import { useSWR } from "~/utils/hooks";

export type DetailedTweet = Omit<FetchedTweetSample, "comments"> & {
  author: {
    followedBy: {
      email: string;
    }[];
  };
  hits?: number;
  comments: FetchedTweetSample[];
};

interface TweetProps {
  hits: number;
}

export default function Tweet({ hits }: TweetProps) {
  const router = useRouter();
  const { data, mutate } = useSWR<DetailedTweet>(
    router.query ? `/api/tweet/${router.query.id}` : null
  );
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { data: user } = useSession();
  const toggle = () => setLoading((p) => !p);

  const comment = () => {
    if (!user) {
      return signIn();
    }

    toggle();

    axios
      .post(`/api/tweet/${router.query.id}/comment`, {
        message,
      })
      .finally(() => mutate())
      .catch((e) => {
        console.error(e);
        toast.error("An error occured. Please try again later");
      });

    toggle();
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
        <TweetElement tweet={{ ...data, hits }} preset="detailed" />
      ) : (
        <TweetSkeleton preset="detailed" />
      )}
      <h2 className="text-3xl tracking-tight font-bold mt-8">Comments</h2>

      {data ? (
        <Feed
          disableBodyLink
          mutateKey={`/api/tweet/${router.query.id}`}
          tweets={data.comments}
          className="mt-2"
        />
      ) : (
        <div className="grid gap-8 mt-4">
          {new Array(4).fill(0).map((_, i) => (
            <TweetSkeleton preset="feed" key={i} />
          ))}
        </div>
      )}

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
              <Button
                isLoading={isLoading}
                onClick={() => {
                  comment();
                }}
              >
                Submit
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
  console.log("🚀 ~ file: [id].tsx:86 ~ getServerSideProps ~ value:", value);

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
