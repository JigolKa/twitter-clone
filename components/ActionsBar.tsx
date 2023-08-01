import axios from "axios";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { BasicProps } from "~/types";
import { cx, merge } from "~/utils";
import { TweetProps } from "./Feed";

export default function ActionsBar({
  tweet,
  mutateKey,
  ...rest
}: BasicProps & { tweet: TweetProps["tweet"]; mutateKey?: string }) {
  const { data } = useSession();

  const iconProps: Record<string, number> = { height: 18, width: 18 };

  const [isLiked, setLike] = useState(
    data?.user?.email &&
      tweet.favorites.map((v) => v.email).includes(data.user.email)
  );
  const like = () => {
    setLike((p) => !p);
    axios
      .post(`/api/tweet/${tweet.tweetId}/fav`)
      .finally(() => mutate(mutateKey ?? "/api/tweet/feed"))
      .catch((e) => {
        setLike((p) => !p);
        toast(e);
      });
  };
  return (
    <div
      {...merge(
        "flex mt-4 items-center gap-12 max-w-fit w-full justify-between [&>*]:flex [&>*]:items-center [&>*]:gap-2 [&>*]:text-sm [&>*]:font-semibold [&>*]:p-2 [&>*]:rounded-lg hover:[&>*]:bg-gray-200 [&>*]:cursor-pointer",
        rest
      )}
    >
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
      <div className={cx(isLiked && "text-red-600")} onClick={like}>
        <Heart {...iconProps} className={cx(isLiked && "fill-red-600")} />
        <span>{tweet.favorites.length}</span>
      </div>
    </div>
  );
}
