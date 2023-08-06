import { Tweet } from "@prisma/client";
import axios from "axios";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { DetailedTweet } from "~/pages/tweet/[id]";
import { BasicProps } from "~/types";
import { cx, merge, nestedCheck } from "~/utils";
import { Button } from "./ui/button";

const iconProps: Record<string, number> = { height: 18, width: 18 };

export type SimpleTweetProps = TweetProps & {
  tweet: FetchedTweetSample;
  preset: "feed";
};
export type DetailedTweetProps = TweetProps & {
  tweet: DetailedTweet;
  preset: "detailed";
};
type TweetProps = BasicProps & {
  mutateKey?: string;
};

export interface FetchedTweetSample extends Tweet {
  likes: {
    email: string;
  }[];
  comments?: {
    id: string;
  }[];
  retweets: {
    email: string;
  }[];
  author: {
    id: string;
    image?: string;
    name?: string;
  };
}

const factory =
  (data: Session | null, mutateKey?: string) =>
  (url: string, setter: Dispatch<SetStateAction<boolean>>) =>
  () => {
    if (!data?.user) {
      return signIn();
    }

    setter((p) => !p);
    axios
      .post(url)
      .finally(() => mutate(mutateKey ?? "/api/tweet/feed"))
      .catch((e) => {
        console.log("🚀 ~ file: Feed.tsx:49 ~ e:", e);

        setter((p) => !p);
        toast(e);
      });
  };

function DetailedHeader({
  tweet,
  ...rest
}: BasicProps & Pick<DetailedTweetProps, "tweet">) {
  const [isSubscribed, setSubscribed] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (!session || !session?.data) return;

    setSubscribed(
      nestedCheck(tweet.author?.followedBy, "email", session.data.user?.email)
    );
  }, [session, tweet]);

  const subscribe = () =>
    axios
      .post(`/api/user/${tweet.author.id}/sub`)
      .then(() => setSubscribed((p) => !p));

  return (
    <div {...merge("flex w-full justify-between items-center", rest)}>
      <Link
        href={`/profile/${tweet.author.name}`}
        className="flex items-center gap-4 group"
      >
        <Image
          src={
            tweet.author.image ??
            "https://avatars.githubusercontent.com/u/0000000?v=4"
          }
          alt={`${tweet.author.name}'s profile picture`}
          height={40}
          width={40}
          className="rounded-full "
        />
        <h3 className="text-xl font-bold tracking-tight group-hover:underline">
          {tweet.author.name}
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
  );
}

function SimpleHeader({ tweet }: Pick<SimpleTweetProps, "tweet">) {
  return (
    <Link
      className="flex items-center gap-2 max-w-fit group"
      href={`/profile/${tweet.author.id}`}
    >
      <Image
        src={
          tweet.author.image ??
          "https://avatars.githubusercontent.com/u/0000000?v=4"
        }
        alt={`${tweet.author.name}'s profile picture`}
        title={`${tweet.author.name}'s profile picture`}
        width={32}
        height={32}
        className="rounded-full"
      />
      <span className="text-gray-700 group-hover:underline">
        {tweet.author.name}
      </span>
    </Link>
  );
}

export function TweetElement({
  preset,
  tweet,
  mutateKey,
  ...rest
}: DetailedTweetProps | SimpleTweetProps) {
  const { data } = useSession();
  const userEmail = data?.user?.email;

  const [isLiked, setLike] = useState(
    userEmail && tweet.likes
      ? nestedCheck(tweet.likes, "email", userEmail)
      : false
  );
  const [isRetweeted, setRetweet] = useState(
    userEmail && tweet.retweets
      ? nestedCheck(tweet.retweets, "email", userEmail)
      : false
  );

  const innerFactory = factory(data, mutateKey);

  const like = innerFactory(`/api/tweet/${tweet.id}/fav`, setLike);
  const retweet = innerFactory(`/api/tweet/${tweet.id}/retweet`, setRetweet);

  const body = (
    <p
      className={cx(
        "mt-2 text-lg",
        `pl-[${preset === "feed" ? 2 : 3}.5rem]`,
        0 &&
          "relative before:absolute before:left-[1rem] before:top-0 before:h-full before:w-[1px] before:bg-gray-300"
      )}
    >
      {tweet.message}
    </p>
  );
  const tweetLink = `/tweet/${tweet.id}`;

  return (
    <div
      {...merge(
        cx(
          "w-full p-4 bg-white transition first:rounded-t last:rounded-b",
          preset === "feed" && "hover:bg-gray-50"
        ),
        rest
      )}
    >
      {preset === "feed" ? (
        <SimpleHeader tweet={tweet} />
      ) : (
        <DetailedHeader tweet={tweet} />
      )}

      {preset === "feed" ? <Link href={tweetLink}>{body}</Link> : body}

      <div className="flex mt-4 items-center gap-12 max-w-fit w-full justify-between [&>*]:flex [&>*]:items-center [&>*]:gap-2 [&>*]:text-sm [&>*]:font-semibold [&>*]:p-2 [&>*]:rounded-lg hover:[&>*]:bg-gray-200 [&>*]:cursor-pointer">
        {tweet.comments ? (
          <Link href={tweetLink}>
            <MessageCircle {...iconProps} />
            <span>{tweet.comments.length}</span>
          </Link>
        ) : null}

        {tweet.retweets ? (
          <div
            className={cx(isRetweeted && "text-green-600")}
            onClick={retweet}
          >
            <Repeat2
              {...Object.keys(iconProps).reduce(
                (cum, cur) => ({ ...cum, [cur]: iconProps[cur] + 2 }),
                {} as Record<string, number>
              )}
              className={cx(isRetweeted && "fill-green-600")}
            />
            <span>{tweet.retweets.length}</span>
          </div>
        ) : null}

        {tweet.likes ? (
          <div className={cx(isLiked && "text-red-600")} onClick={like}>
            <Heart {...iconProps} className={cx(isLiked && "fill-red-600")} />
            <span>{tweet.likes.length}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
