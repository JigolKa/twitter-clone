import { Tweet, User } from "@prisma/client";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BasicProps } from "~/types";
import { cx, merge } from "~/utils";
import { useSWR } from "~/utils/hooks";
import axios from "axios";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import ActionsBar from "./ActionsBar";

export interface TweetProps {
  tweet: {
    tweetId: string;
    html: string;
    createdAt: Date;
    author: {
      userId: string;
      username: string;
      image: string | null;
    };
    favorites: {
      email: string;
    }[];
  };
}
function Post({ tweet }: TweetProps) {
  return (
    <div className="w-full p-4 bg-white transition hover:bg-gray-50 first:rounded-t last:rounded-b">
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

      <ActionsBar tweet={tweet} />
    </div>
  );
}

export default function Feed(props: BasicProps) {
  const { data } = useSWR<TweetProps["tweet"][]>("/api/tweet/feed");

  return data ? (
    <div {...merge("flex flex-col divide-y max-w-3xl", props)}>
      {data.map((v) => (
        <Post tweet={v} key={v.tweetId} />
      ))}
    </div>
  ) : null;
}
