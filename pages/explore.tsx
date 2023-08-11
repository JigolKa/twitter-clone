import axios from "axios";
import { Loader2, Search, X } from "lucide-react";
import Head from "next/head";
import { useState } from "react";
import Feed from "~/components/Feed";
import { FetchedTweetSample } from "~/components/Tweet";
import { BasicProps } from "~/types";
import { URLParams, merge } from "~/utils";

export default function Explore() {
  const [tweets, setTweets] = useState<FetchedTweetSample[]>();
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = {
      q: (event.target as unknown as { q: HTMLInputElement }).q.value,
    };

    await search(data);
  };

  const search = async (data: Record<string, string>) => {
    setLoading(true);

    const response = await axios.get(`/api/tweet/search?${URLParams(data)}`, {
      timeout: 15000,
    });

    if (response.status === 200) {
      setTweets(response.data);
      setLoading(false);
    } else {
      alert("zhda");
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
          className="w-[92.5%] px-6 py-2 !outline-none peer"
          name="q"
          id="q"
          required
          minLength={3}
        />
        <button
          type="submit"
          className="w-[7.5%] peer-focus-within:stroke-blue-600 cursor-pointer"
        >
          <Search height={28} width={28} />
        </button>
      </form>

      {!isLoading ? (
        tweets && tweets.length > 0 ? (
          <>
            <Feed tweets={tweets} className="mt-6" />

            <Infos className="!mt-2 !h-48">
              <X className="mr-2 h-12 w-12" />
              <span className="text-center leading-snug">
                No more results to display
              </span>
            </Infos>
          </>
        ) : (
          <Infos>
            <Search className="mr-2 h-12 w-12" />
            <span className="text-center leading-snug">
              Search for something <br /> to get results
            </span>
          </Infos>
        )
      ) : (
        <Infos>
          <Loader2 className="mr-2 h-12 w-12 animate-spin" />
          <span>Loading...</span>
        </Infos>
      )}
    </>
  );
}

function Infos({ children, ...rest }: BasicProps) {
  return (
    <div {...merge("mt-6 h-96 w-full flex items-center justify-center", rest)}>
      <div className="flex flex-col gap-2 items-center">{children}</div>
    </div>
  );
}
