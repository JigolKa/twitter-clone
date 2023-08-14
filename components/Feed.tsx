import { BasicProps } from "~/types";
import { merge, omit } from "~/utils";
import { FetchedTweetSample, SimpleTweetProps, TweetElement } from "./Tweet";
import { Infos } from "~/pages/explore";
import { CircleSlash2 } from "lucide-react";

type FeedProps = BasicProps & {
  tweets: FetchedTweetSample[];
  tweetProps?: Partial<SimpleTweetProps>;
};

export default function Feed({ tweets, tweetProps, ...rest }: FeedProps) {
  return tweets.length > 0 ? (
    <div {...merge("flex flex-col divide-y max-w-3xl", rest)}>
      {tweets.map((v) => (
        <TweetElement
          tweet={v}
          key={v.id}
          preset="feed"
          {...(tweetProps ? omit(tweetProps, "tweet", "preset") : {})}
        />
      ))}
    </div>
  ) : (
    <Infos className="!h-48">
      <CircleSlash2 height={28} width={28} />
      <span className="block font-semibold text-lg">Nothing to show here</span>
    </Infos>
  );
}
