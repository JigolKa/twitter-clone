import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Feed from "~/components/Feed";
import { FetchedTweetSample, TweetElement } from "~/components/Tweet";
import { useSWR } from "~/utils/hooks";

export type DetailedTweet = Omit<FetchedTweetSample, "comments"> & {
  author: {
    followedBy: {
      email: string;
    }[];
  };
  comments: FetchedTweetSample[];
};

export default function Tweet() {
  const router = useRouter();
  const { data } = useSWR<DetailedTweet>(
    router.query ? `/api/tweet/${router.query.id}` : null
  );

  const session = useSession();

  return data ? (
    <>
      <TweetElement tweet={data} preset="detailed" />
      <h2 className="text-3xl tracking-tight font-bold mt-8">Comments</h2>

      <Feed tweets={data.comments} className="mt-4" />
    </>
  ) : null;
}

/**
 * 
 * (
    <>
      <div className="flex w-full justify-between items-center">
        <Link
          href={`/profile/${data.author.name}`}
          className="flex items-center gap-4 group"
        >
          <Image
            src={
              data.author.image ??
              "https://avatars.githubusercontent.com/u/0000000?v=4"
            }
            alt={`${data.author.name}'s profile picture`}
            height={40}
            width={40}
            className="rounded-full"
          />
          <h3 className="text-xl font-bold tracking-tight group-hover:underline">
            {data.author.name}
          </h3>
        </Link>
        <Button
          variant={isSubscribed ? "outline" : "default"}
          onClick={subscribe}
          className="rounded-full !h-9"
        >
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
      <p className="mt-6 text-lg max-w-prose">{data.message}</p>
      <Separator className="mt-6" />
      <Separator className="mt-2" />

      <h2 className="text-3xl tracking-tight font-bold mt-8">Comments</h2>

      <div className="flex flex-col gap-4 mt-4">
        {data.comments?.map((v) => (
          <TweetElement
            mutateKey={`/api/tweet/${router.query.id}`}
            tweet={v}
            key={v.id}
          />
        ))}
      </div>
    </>
  ) 
*/
