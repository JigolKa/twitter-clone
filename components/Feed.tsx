import { BasicProps } from "~/types";
import { merge } from "~/utils";
import { FetchedTweetSample, TweetElement } from "./Tweet";

type FeedProps = BasicProps & {
  tweets: FetchedTweetSample[];
  mutateKey?: string;
  disableBodyLink?: boolean;
};

export default function Feed({
  tweets,
  mutateKey,
  disableBodyLink,
  ...rest
}: FeedProps) {
  return (
    <div {...merge("flex flex-col divide-y max-w-3xl", rest)}>
      {tweets.map((v) => (
        <TweetElement
          tweet={v}
          disableBodyLink={disableBodyLink}
          key={v.id}
          preset="feed"
          mutateKey={mutateKey}
        />
      ))}
    </div>
  );
}
