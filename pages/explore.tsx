import axios from "axios";
import { CircleSlash2, Loader2, Search, X } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Feed from "~/components/Feed";
import { TOAST_ERROR_MESSAGE } from "~/config";
import { BasicProps, FetchedTweetSample } from "~/types";
import { URLParams, merge } from "~/utils";

export default function Explore() {
  const [tweets, setTweets] = useState<FetchedTweetSample[] | null>();
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      if (!router.query.q || !inputRef.current) return;

      inputRef.current.value = router.query.q as string;

      await search({ q: encodeURIComponent(router.query.q as string) });
    })();
  }, [router.query]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = {
      q: encodeURIComponent(
        (event.target as unknown as { q: HTMLInputElement }).q.value
      ),
    };

    await search(data);
  };

  const search = async (data: Record<string, string>) => {
    setLoading(true);

    const response = await axios.get<FetchedTweetSample[]>(
      `/api/tweet/search?${URLParams(data)}`,
      {
        timeout: 15000,
      }
    );

    if (response.status === 200) {
      setTweets(response.data.length > 0 ? response.data : null);
      setLoading(false);
    } else {
      toast.error(TOAST_ERROR_MESSAGE);
    }
  };

  return (
    <>
      <Head>
        <title>Explore - Twitter Clone</title>
      </Head>

      <h1 className="text-4xl font-bold tracking-tighter">Explore</h1>

      <p className="text-gray-700 mt-4">
        You can search for tags and author name
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-2 flex rounded-full overflow-hidden w-full ring-2 group focus-within:ring-2 focus-within:ring-blue-600 ring-black group items-center"
      >
        <input
          type="text"
          className="lg:w-[92.5%] w-[90%] px-6 py-2 !outline-none peer"
          name="q"
          id="q"
          required
          minLength={3}
          ref={inputRef}
        />
        <button
          type="submit"
          className="lg:w-[7.5%] w-[10%] peer-focus-within:stroke-blue-600 cursor-pointer"
        >
          <Search height={28} width={28} />
        </button>
      </form>

      {!isLoading ? (
        tweets && tweets.length > 0 ? (
          <>
            <Feed tweets={tweets} isLegacy className="mt-6" />

            <Infos className="!mt-2 !h-48">
              <X className="h-12 w-12" />
              <span className="text-center leading-snug">
                No more results to display
              </span>
            </Infos>
          </>
        ) : tweets === null ? (
          <Infos>
            <CircleSlash2 className="h-12 w-12" />
            <span className="text-center leading-snug">
              Your search did not <br /> return any results
            </span>
          </Infos>
        ) : (
          <Infos>
            <Search className="h-12 w-12" />
            <span className="text-center leading-snug">
              Search for something <br /> to get results
            </span>
          </Infos>
        )
      ) : (
        <Infos>
          <Loader2 className="h-12 w-12 animate-spin" />
          <span>Loading...</span>
        </Infos>
      )}
    </>
  );
}

export function Infos({ children, ...rest }: BasicProps) {
  return (
    <div {...merge("mt-6 h-96 w-full flex items-center justify-center", rest)}>
      <div className="flex flex-col gap-3 items-center">{children}</div>
    </div>
  );
}
