import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import ActionsBar from "~/components/ActionsBar";
import { Separator } from "~/components/ui/separator";
import { useSWR } from "~/utils/hooks";

type Data = {
  author: {
    userId: string;
    username: string;
    image: string | null;
  };
  favorites: {
    email: string;
  }[];
} & {
  tweetId: string;
  html: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function Tweet() {
  const router = useRouter();
  const { data } = useSWR<Data>(
    router.query && `/api/tweet/${router.query.id}`
  );

  return data ? (
    <>
      <Link
        href={`/profile/${data.authorId}`}
        className="flex items-center gap-4"
      >
        <Image
          src={
            data.author.image ??
            "https://avatars.githubusercontent.com/u/0000000?v=4"
          }
          alt={`${data.author.username}'s profile picture`}
          height={48}
          width={48}
          className="rounded-full"
        />
        <h3 className="text-2xl font-bold tracking-tight">
          {data.author.username}
        </h3>
      </Link>
      <p className="mt-6 text-lg max-w-prose">{data.html}</p>
      <Separator className="mt-6" />
      <ActionsBar
        tweet={data}
        className="!mt-2"
        mutateKey={`/api/tweet/${router.query.id}`}
      />
      <Separator className="mt-2" />

      <h2 className="text-3xl tracking-tight font-bold mt-8">Comments</h2>
    </>
  ) : null;
}
