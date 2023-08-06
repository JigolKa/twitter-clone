import { BasicProps } from "~/types";
import { merge } from "~/utils";
import { useSWR } from "~/utils/hooks";
import { FetchedTweetSample, TweetElement } from "./Tweet";

export default function Feed({
  tweets,
  ...rest
}: BasicProps & { tweets: FetchedTweetSample[] }) {
  return (
    <div {...merge("flex flex-col divide-y max-w-3xl", rest)}>
      {tweets.map((v) => (
        <TweetElement tweet={v} key={v.id} preset="feed" />
      ))}
    </div>
  );
}
