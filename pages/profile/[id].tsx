import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Feed from "~/components/Feed";
import { TweetSkeleton } from "~/components/Tweet";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { toUnix } from "~/utils";
import { useSWR, useSession } from "~/utils/hooks";
import { Profile } from "../api/user/[id]";

export default function Profile() {
  const { query } = useRouter();
  const session = useSession();
  const { data, mutate } = useSWR<Profile>(
    query.id ? `/api/user/${query.id}` : null
  );
  const [isSubscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!session || !session?.data) return;

    setSubscribed(data?.followedBy.includes(session.data.user.id) ?? false);
  }, [session, data]);

  const subscribe = () => {
    if (!session.data) {
      return signIn();
    }

    axios
      .post(`/api/user/${data?.id}/sub`)
      .then(() => setSubscribed((p) => !p));
  };

  const isAuthor = session.data?.user?.id === data?.id;

  const image = (
    <Image
      height={56}
      width={56}
      className="rounded-full"
      src={data?.image!}
      alt={`${data?.name}'s profile picture`}
    />
  );

  return (
    <>
      <div className="h-80 w-full bg-[url('https://placehold.co/600x400/dddddd/dddddd')] bg-center bg-cover bg-no-repeat"></div>
      <div className="-mt-32 w-full px-8 py-4 bg-white min-h-[260px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {data ? (
              data?.image ? (
                <Link href={data?.image!} target="_blank">
                  {image}
                </Link>
              ) : (
                image
              )
            ) : (
              <Skeleton className="h-14 w-14 rounded-full" />
            )}

            {data ? (
              <h1 className="text-2xl tracking-tight font-bold">
                {data?.name}
              </h1>
            ) : (
              <Skeleton className="h-4 w-48" />
            )}
          </div>

          {data &&
            (!isAuthor ? (
              <Button
                variant={isSubscribed ? "outline" : "default"}
                onClick={subscribe}
                className="rounded-full"
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            ) : (
              <Link href={"/account/settings"}>
                <Button variant="outline">Settings</Button>
              </Link>
            ))}
        </div>
        {data ? (
          <p className="text-gray-700 max-w-prose mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptatibus ex nisi reprehenderit dolor quas voluptates architecto,
            officia porro. Nesciunt impedit debitis atque officiis hic fugit
            voluptatibus similique recusandae dolorem cupiditate.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {new Array(2).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-3" />
            ))}
            <Skeleton className="w-2/3 h-3" />
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight mt-8">
          {data ? `${data?.name}'s Tweets` : "This profile's Tweets"}
        </h1>

        {data ? (
          <Feed
            tweets={data?.tweets ?? []}
            tweetProps={{
              profileName: !isAuthor ? data?.name! : "You",
              mutateKey: mutate,
            }}
            className="mt-4"
          />
        ) : (
          <div className="grid gap-8 mt-4">
            {new Array(10).fill(0).map((_, i) => (
              <TweetSkeleton preset="feed" key={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
