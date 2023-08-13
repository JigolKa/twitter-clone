import { Tweet } from "@prisma/client";
import axios from "axios";
import {
  Flag,
  GripHorizontalIcon,
  Heart,
  LineChart,
  MessageCircle,
  Pencil,
  Repeat2,
  Share,
  Trash,
} from "lucide-react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { KeyedMutator, mutate } from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { BASE_URL } from "~/config";
import { DetailedTweet } from "~/pages/tweet/[id]";
import { BasicProps } from "~/types";
import { cx, getRelativeTime, merge, nestedCheck } from "~/utils";
import { useSession } from "~/utils/hooks";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

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
  mutateKey?: string | KeyedMutator<any>;
  disableBodyLink?: boolean;
  canBeEdited?: boolean;
  profileName?: string;
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
  hits?: number;
  isRetweet?: boolean;
}

const factory =
  (data: Session | null, mutateKey?: TweetProps["mutateKey"]) =>
  (url: string, setter: Dispatch<SetStateAction<boolean>>) =>
  () => {
    if (!data?.user) {
      return signIn();
    }

    setter((p) => !p);
    axios
      .post(url)
      .finally(() =>
        typeof mutateKey === "function"
          ? mutateKey()
          : mutate(mutateKey ?? "/api/tweet/feed")
      )
      .catch((e) => {
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
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session || !session?.data) return;

    setSubscribed(
      nestedCheck(tweet.author?.followedBy, "email", session.data.user?.email)
    );
  }, [session, tweet]);

  const subscribe = () => {
    if (!session.data) return signIn();

    axios
      .post(`/api/user/${tweet.author.id}/sub`)
      .then(() => setSubscribed((p) => !p));
  };

  const share = () => {
    navigator.clipboard.writeText(`${BASE_URL}/tweet/${tweet.id}`);

    toast.success("Link copied to clipboard!");
  };

  const isAuthor = session.data?.user?.id === tweet.author.id;

  return (
    <div {...merge("flex w-full justify-between items-center", rest)}>
      <Link
        href={`/profile/${tweet.author.id}`}
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
          className="rounded-full"
        />
        <h3 className="text-xl font-bold tracking-tight group-hover:underline">
          {tweet.author.name}
        </h3>
      </Link>

      <div className="flex gap-2">
        {!isAuthor && (
          <Button
            variant={isSubscribed ? "outline" : "default"}
            onClick={subscribe}
            className="rounded-full"
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}

        <DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-sm">
              <GripHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={share}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {!isAuthor && (
              <Link href={`/tweet/${tweet.id}/report`}>
                <DropdownMenuItem className="text-red-600">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </Link>
            )}
            {isAuthor && (
              <Link href={`/tweet/${tweet.id}/manage`}>
                <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SimpleHeader({ tweet }: Pick<SimpleTweetProps, "tweet">) {
  return (
    <>
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
        <span className="text-gray-700 text-sm">
          •&nbsp;&nbsp;
          {getRelativeTime(
            new Date(tweet[tweet.isRetweet ? "updatedAt" : "createdAt"])
          )}
        </span>
      </Link>
    </>
  );
}

export function TweetSkeleton({
  preset = "feed",
  ...rest
}: BasicProps & { preset: "feed" | "detailed" }) {
  return (
    <div {...rest}>
      <div className="flex items-center gap-4">
        <Skeleton
          className={cx(
            "rounded-full",
            preset === "feed" ? "h-8 w-8" : "h-10 w-10"
          )}
        />
        <Skeleton
          className={cx("w-[250px]", preset === "feed" ? "h-3" : "h-4")}
        />
      </div>

      <div
        className={cx(
          "grid gap-2 mt-4",
          preset === "feed" ? "[&>*]:h-2.5" : "[&>*]:h-3.5"
        )}
      >
        <Skeleton className="w-full" />
        <Skeleton className="w-full" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  );
}

export function TweetElement({
  preset,
  tweet,
  mutateKey,
  disableBodyLink,
  profileName,
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
  const isAuthor = tweet.author.id === data?.user.id;

  return (
    <div
      {...merge(
        cx(
          "w-full bg-white transition first:rounded-t last:rounded-b",
          preset === "feed" && "hover:bg-gray-50 p-4"
        ),
        rest
      )}
    >
      {tweet.isRetweet ? (
        <div className="flex gap-2 mb-3 text-sm text-gray-700 items-center">
          <Repeat2 {...iconProps} />
          <span>{profileName} retweeted</span>
        </div>
      ) : null}
      {preset === "feed" ? (
        <SimpleHeader tweet={tweet} />
      ) : (
        <DetailedHeader tweet={tweet} />
      )}

      {preset === "feed" ? (
        !disableBodyLink ? (
          <Link href={tweetLink}>{body}</Link>
        ) : (
          body
        )
      ) : (
        body
      )}

      <div className="flex mt-4 items-center gap-12 max-w-fit w-full justify-between">
        {tweet.comments &&
          (preset === "feed" ? (
            <Link href={tweetLink}>
              <ActionButton>
                <MessageCircle {...iconProps} />
                <span>{tweet.comments.length}</span>
              </ActionButton>
            </Link>
          ) : (
            <ActionButton>
              <MessageCircle {...iconProps} />
              <span>{tweet.comments.length}</span>
            </ActionButton>
          ))}

        {tweet.retweets ? (
          <ActionButton
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
          </ActionButton>
        ) : null}

        {tweet.likes ? (
          <ActionButton
            className={cx(isLiked && "text-red-600")}
            onClick={like}
          >
            <Heart {...iconProps} className={cx(isLiked && "fill-red-600")} />
            <span>{tweet.likes.length}</span>
          </ActionButton>
        ) : null}

        {tweet.hits && (
          <ActionButton className="hover:!bg-transparent !cursor-context-menu">
            <LineChart {...iconProps} />
            <span>{tweet.hits}</span>
          </ActionButton>
        )}

        {(rest.canBeEdited ?? isAuthor) && (
          <Link href={`/tweet/${tweet.id}/manage`}>
            <ActionButton>
              <Pencil {...iconProps} />
              <span>Manage</span>
            </ActionButton>
          </Link>
        )}
      </div>
    </div>
  );
}

function ActionButton({ children, ...rest }: BasicProps<"button">) {
  return (
    <button
      {...merge<"button">(
        "flex items-center gap-2 text-sm font-semibold p-2 rounded-lg hover:bg-gray-200 cursor-pointer",
        rest
      )}
    >
      {children}
    </button>
  );
}
