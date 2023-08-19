import { FetchedTweetSample } from "~/types";

const hot: SortFunction<FetchedTweetSample> = (a, b) => {
  return getHotScore(b) - getHotScore(a);
};

export type Sort = "default" | "new" | "hot";
export type SortFunction<T> = ((a: T, b: T) => number) | undefined;
export function sortTweets(
  tweets: FetchedTweetSample[],
  sort: Sort | undefined
) {
  const algorithms: Record<Sort, SortFunction<FetchedTweetSample>> = {
    default: undefined,
    new: (a, b) => +b.createdAt - +a.createdAt,
    hot,
  };

  return tweets.sort(algorithms[sort || "default"]);
}

function epochSeconds(date: string | Date) {
  date = typeof date === "string" ? new Date(date) : date;

  return Math.round(date.getTime() / 1000);
}

// Implemented from Reddit's hot algorithm
// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
function getHotScore(tweet: FetchedTweetSample) {
  const score = tweet.likes.length;
  const order = Math.log10(score);
  const seconds = epochSeconds(tweet.createdAt) - 1134028003;

  return +(order + seconds / 45000).toFixed(7);
}
