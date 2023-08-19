import {
  ArrowUpDown,
  BadgePlus,
  CircleSlash2,
  Flame,
  LucideIcon,
  XIcon,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { FeedContext } from "~/contexts/FeedContext";
import { Infos } from "~/pages/explore";
import { BasicProps, FetchedTweetSample, SimpleTweetProps } from "~/types";
import { capitalize, fetcher, merge, omit } from "~/utils";
import { Sort } from "~/utils/sort";
import { TweetElement, TweetSkeleton } from "./Tweet";
import { Button } from "./ui/button";

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

const sorts: { text: Sort; icon: LucideIcon }[] = [
  { text: "default", icon: ArrowUpDown },
  { text: "new", icon: BadgePlus },
  { text: "hot", icon: Flame },
];

export default function Feed({
  tweetProps,
  ...rest
}: LegacyFeedProps | FeedFetchingProps) {
  const ctx = useContext(FeedContext);
  const [sort, setSort] = useState<Sort>("default");

  const { size, setSize, data, isLoading, isValidating, mutate } =
    useSWRInfinite<FetchedTweetSample[]>(
      (i) =>
        !rest.isLegacy && rest.fetchUrl
          ? `${
              rest.fetchUrl || "/api/tweet/feed"
            }?per_page=${PAGE_SIZE}&page=${i}&sort=${sort}`
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
      <div className="flex flex-col divide-y mt-6 lg:mt-3">
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

  const sortNode = (
    <div className="flex w-full justify-between items-center">
      <h2 className="text-xl font-semibold hidden sm:block">Sort:</h2>
      <div className="flex items-center justify-between sm:justify-normal sm:gap-3 w-full sm:w-fit">
        {sorts.map((v) => (
          <Button
            variant={v.text === sort ? undefined : "outline"}
            onClick={() => {
              if (v.text === sort) return;
              setSort(v.text);
            }}
            key={v.text}
          >
            <v.icon className="mr-2 h-4 w-4" />
            {capitalize(v.text)}
          </Button>
        ))}
      </div>
    </div>
  );

  return !rest.isLegacy ? (
    !isLoading ? (
      tweets.length > 0 ? (
        <div {...omit(rest, "fetchUrl")}>
          {sortNode}
          <FeedRenderer tweets={tweets ?? []} />
          {isLoadingMore && <FeedLoader count={6} />}
          {isReachingEnd && (
            <Infos className="!h-36">
              <XIcon height={40} width={40} />
              <span className="block font-semibold text-lg">No more tweet</span>
            </Infos>
          )}
        </div>
      ) : (
        <Infos className="!h-36">
          <CircleSlash2 height={28} width={28} />
          <span className="block font-semibold text-lg">
            Nothing to show here
          </span>
        </Infos>
      )
    ) : (
      <div {...omit(rest, "fetchUrl")}>
        {sortNode}
        <FeedLoader />
      </div>
    )
  ) : (
    <FeedRenderer tweets={rest.tweets} />
  );
}

function FeedLoader(props: BasicProps & { count?: number }) {
  return (
    <div {...merge("grid gap-8 mt-6", props)}>
      {new Array(props.count || 10).fill(0).map((_, i) => (
        <TweetSkeleton preset="feed" key={i} />
      ))}
    </div>
  );
}
