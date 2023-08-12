import { BasicProps } from "~/types";
import { merge, omit } from "~/utils";
import { FetchedTweetSample, SimpleTweetProps, TweetElement } from "./Tweet";

type FeedProps = BasicProps & {
  tweets: FetchedTweetSample[];
  tweetProps?: Partial<SimpleTweetProps>;
};

export default function Feed({ tweets, tweetProps, ...rest }: FeedProps) {
  return (
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
  );
}
