import axios from "axios";
import { Flag, GripHorizontalIcon, Share, Trash } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BASE_URL } from "~/config";
import { BasicProps, DetailedTweetProps, SimpleTweetProps } from "~/types";
import { getRelativeTime, merge, nestedCheck, processCallback } from "~/utils";
import { useSession } from "~/utils/hooks";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type DetailedHeaderProps = BasicProps &
  Pick<DetailedTweetProps, "tweet" | "callback">;
export function DetailedHeader({
  tweet,
  callback,
  ...rest
}: DetailedHeaderProps) {
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
      .then((res) => processCallback(res, callback))
      .finally(() => setSubscribed((p) => !p));
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

export function SimpleHeader({ tweet }: Pick<SimpleTweetProps, "tweet">) {
  const title = `${tweet.author.name}'s profile picture`;

  return (
    <div className="flex gap-2 items-center">
      <Link
        className="flex items-center gap-3 lg:gap-2 max-w-fit group"
        href={`/profile/${tweet.author.id}`}
      >
        <Image
          src={
            tweet.author.image ??
            "https://avatars.githubusercontent.com/u/0000000?v=4"
          }
          alt={title}
          title={title}
          width={32}
          height={32}
          className="rounded-full lg:h-8 lg:w-8 w-7 h-7"
        />
        <span className="text-gray-700 group-hover:underline">
          {tweet.author.name}
        </span>
      </Link>

      <div className="text-gray-700 text-sm flex gap-2 items-center">
        <span>•</span>
        <span>{getRelativeTime(new Date(tweet.createdAt))}</span>
      </div>
    </div>
  );
}
