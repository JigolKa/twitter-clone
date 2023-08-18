import { CircleSlash2, XIcon } from "lucide-react";
import { useContext, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { Infos } from "~/pages/explore";
import { BasicProps, FetchedTweetSample, SimpleTweetProps } from "~/types";
import { fetcher, merge, omit } from "~/utils";
import { TweetElement, TweetSkeleton } from "./Tweet";
import { FeedContext } from "~/contexts/FeedContext";

type FeedProps = BasicProps & {
  tweetProps?: Partial<SimpleTweetProps>;
};
type LegacyFeedProps = FeedProps & {
  tweets: FetchedTweetSample[];
} & { isLegacy: true };
type FeedFetchingProps = FeedProps & {
  fetchUrl: string | null;
} & { isLegacy?: false };
const PAGE_SIZE = 15;

export default function Feed({
  tweetProps,
  ...rest
}: LegacyFeedProps | FeedFetchingProps) {
  const ctx = useContext(FeedContext);

  const { size, setSize, data, isLoading, isValidating, mutate } =
    useSWRInfinite<FetchedTweetSample[]>(
      (i) =>
        !rest.isLegacy && rest.fetchUrl
          ? `${
              rest.fetchUrl || "/api/tweet/feed"
            }?per_page=${PAGE_SIZE}&page=${i}`
          : null,
      fetcher
    );

  const tweets = (
    data ? [].concat(...(data as never[])) : []
  ) as FetchedTweetSample[];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
  const isRefreshing = isValidating && data && data.length === size;

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || isReachingEnd) return;

      const isBottom =
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight - 50;
      if (isBottom) setSize(size + 1);
    };

    ctx?.setFn(() => mutate);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, isReachingEnd]);

  function FeedRenderer({ tweets }: { tweets: FetchedTweetSample[] }) {
    return (
      <div {...merge("flex flex-col divide-y max-w-3xl", rest)}>
        {tweets.map((v) => (
          <TweetElement
            tweet={v}
            key={v.id}
            preset="feed"
            callback={() => mutate()}
            {...(tweetProps
              ? omit(tweetProps, "tweet", "preset", "callback")
              : {})}
          />
        ))}
      </div>
    );
  }

  return !rest.isLegacy ? (
    !isLoading ? (
      tweets.length > 0 ? (
        <>
          <FeedRenderer tweets={tweets ?? []} />
          {isLoadingMore && <FeedLoader count={6} />}
          {isReachingEnd && (
            <Infos className="!h-36">
              <XIcon height={40} width={40} />
              <span className="block font-semibold text-lg">No more tweet</span>
            </Infos>
          )}
        </>
      ) : (
        <Infos className="!h-36">
          <CircleSlash2 height={28} width={28} />
          <span className="block font-semibold text-lg">
            Nothing to show here
          </span>
        </Infos>
      )
    ) : (
      <FeedLoader />
    )
  ) : (
    <FeedRenderer tweets={rest.tweets} />
  );
}

function FeedLoader(props: BasicProps & { count?: number }) {
  return (
    <div {...merge("grid gap-8 mt-4", props)}>
      {new Array(props.count || 10).fill(0).map((_, i) => (
        <TweetSkeleton preset="feed" key={i} />
      ))}
    </div>
  );
}
