import { Search } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { URLParams } from "~/utils";
import { useSWR } from "~/utils/hooks";
import { Trend } from "./api/trends";

export default function Trends() {
  const { data } = useSWR<Trend[]>(
    typeof window !== "undefined"
      ? `/api/trends?geo=${(navigator.language.includes("-")
          ? navigator.language.split("-")[1]
          : navigator.language
        ).toUpperCase()}`
      : null
  );

  return (
    <>
      <Head>
        <title>Trends - Twitter Clone</title>
      </Head>

      <h1 className="text-4xl font-bold tracking-tighter">
        Trends in your country
      </h1>

      <ul className="mt-6">
        {data?.map((v, i) => (
          <div
            key={v.title}
            className="flex justify-between items-center py-4 lg:px-3 first:border-t-0 border-t border-t-gray-200 transition hover:bg-gray-100"
          >
            <div className="flex gap-3 lg:gap-4 items-center">
              <h4 className="text-gray-700">{i + 1}.</h4>
              <span className="lg:text-lg">{v.title}</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 text-sm lg:text-md">
              <span className="max-w-min lg:max-w-fit block">
                {`${v.traffic.toLocaleString()}+ searches`}
              </span>
              <Link
                href={`/explore?${URLParams({ q: v.title })}`}
                title="Search it"
              >
                <Search />
              </Link>
            </div>
          </div>
        ))}
      </ul>
    </>
  );
}
