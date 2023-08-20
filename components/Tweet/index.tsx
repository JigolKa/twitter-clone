import axios from "axios";
import { Heart, LineChart, MessageCircle, Pencil, Repeat2 } from "lucide-react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { TOAST_ERROR_MESSAGE } from "~/config";
import {
  BasicProps,
  DetailedTweetProps,
  SimpleTweetProps,
  TweetProps,
} from "~/types";
import { cx, merge, processCallback } from "~/utils";
import { useSession } from "~/utils/hooks";
import { Skeleton } from "../ui/skeleton";
import { DetailedHeader, SimpleHeader } from "./Header";

const iconProps: Record<string, number> = { height: 18, width: 18 };

const factory =
  (data: Session | null, callback?: TweetProps["callback"]) =>
  (url: string) =>
  () => {
    if (!data?.user) {
      return signIn();
    }

    axios
      .post(url)
      .then((res) => processCallback(res, callback))
      .catch(() => {
        toast.error(TOAST_ERROR_MESSAGE);
      });
  };

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
  callback,
  disableBodyLink,
  profileName,
  ...rest
}: DetailedTweetProps | SimpleTweetProps) {
  const { data } = useSession();

  const innerFactory = factory(data, callback);

  const like = innerFactory(`/api/tweet/${tweet.id}/fav`);
  const retweet = innerFactory(`/api/tweet/${tweet.id}/retweet`);

  const body = (
    <p
      className={cx(
        "mt-3 lg:mt-2 lg:text-lg",
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
          preset === "feed" && "hover:bg-gray-50 p-2 pt-3.5 lg:p-4"
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
        <DetailedHeader tweet={tweet} callback={callback} />
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

      <div className="flex mt-3 lg:mt-4 items-center gap-6 lg:gap-12 max-w-fit w-full justify-between">
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
            className={cx(tweet.isRetweeted && "text-green-600")}
            onClick={retweet}
          >
            <Repeat2
              {...Object.keys(iconProps).reduce(
                (cum, cur) => ({ ...cum, [cur]: iconProps[cur] + 2 }),
                {} as Record<string, number>
              )}
              className={cx(tweet.isRetweeted && "fill-green-600")}
            />
            <span>{tweet.retweets.length}</span>
          </ActionButton>
        ) : null}

        {tweet.likes ? (
          <ActionButton
            className={cx(tweet.isLiked && "text-red-600")}
            onClick={like}
          >
            <Heart
              {...iconProps}
              className={cx(tweet.isLiked && "fill-red-600")}
            />
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
