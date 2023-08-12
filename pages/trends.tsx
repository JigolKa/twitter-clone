import Head from "next/head";
import Image from "next/image";
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

      <div className="grid grid-cols-2 w-full gap-4 mt-6">
        {data?.map((v) => (
          <Link
            key={v.title}
            className="rounded-sm px-6 py-4 shadow-md bg-gray-50 hover:bg-gray-100 transition font-semibold flex items-center gap-4"
            href={`/explore?${URLParams({ q: v.title })}`}
          >
            <Image
              src={v.image}
              alt=""
              height={48}
              width={48}
              className="rounded-sm"
            />
            <span className="text-lg">{v.title}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
