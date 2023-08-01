import { Tweet, User } from "@prisma/client";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { BasicProps } from "~/types";
import { cx, merge } from "~/utils";
import { useSWR } from "~/utils/hooks";

interface TweetProps {
  tweet: Pick<Tweet, "html" | "tweetId"> & {
    author: Pick<User, "image" | "email" | "username">;
  };
}
function Post({ tweet }: TweetProps) {
  const iconProps: Record<string, number> = { height: 18, width: 18 };

  return (
    <div className="w-full p-4 bg-white transition hover:bg-gray-100 first:rounded-t last:rounded-b">
      <Link
        className="flex items-center gap-2 max-w-fit group"
        href={`/profile/${tweet.author.username}`}
      >
        <Image
          src={
            tweet.author.image ??
            "https://avatars.githubusercontent.com/u/0000000?v=4"
          }
          alt={`${tweet.author.username}'s profile picture`}
          title={`${tweet.author.username}'s profile picture`}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-gray-700 group-hover:underline">
          {tweet.author.username}
        </span>
      </Link>
      <Link href={`/tweet/${tweet.tweetId}`}>
        <p
          className={cx(
            "mt-2 pl-[2.5rem] text-lg ",
            0 &&
              "relative before:absolute before:left-[1rem] before:top-0 before:h-full before:w-[1px] before:bg-gray-300"
          )}
        >
          {tweet.html}
        </p>
      </Link>

      <div className="flex mt-4 items-center gap-12 [&>*]:flex [&>*]:items-center [&>*]:gap-2 [&>*]:text-sm">
        <div>
          <MessageCircle {...iconProps} />
          <span>2</span>
        </div>
        <div>
          <Repeat2
            {...Object.keys(iconProps).reduce(
              (cum, cur) => ({ ...cum, [cur]: iconProps[cur] + 2 }),
              {} as Record<string, number>
            )}
          />
          <span>2</span>
        </div>
        <div>
          <Heart {...iconProps} />
          <span>2</span>
        </div>
      </div>
    </div>
  );
}

export default function Feed(props: BasicProps) {
  const { data } = useSWR<TweetProps["tweet"][]>("/api/tweet/feed");

  useEffect(() => console.log(data), [data]);

  return data ? (
    <div {...merge("flex flex-col divide-y max-w-3xl", props)}>
      {data.map((v) => (
        <Post tweet={v} key={v.tweetId} />
      ))}
    </div>
  ) : null;
}
