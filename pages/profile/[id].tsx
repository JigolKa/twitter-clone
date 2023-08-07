import Image from "next/image";
import { useRouter } from "next/router";
import { useSWR, useSession } from "~/utils/hooks";
import { Profile } from "../api/user/[id]";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import axios from "axios";
import Link from "next/link";
import Feed from "~/components/Feed";

export default function Profile() {
  const { query } = useRouter();
  const session = useSession();
  const { data } = useSWR<Profile>(query.id ? `/api/user/${query.id}` : null);
  const [isSubscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!session || !session?.data) return;

    setSubscribed(data?.followedBy.includes(session.data.user.id) ?? false);
  }, [session, data]);

  const subscribe = () =>
    axios
      .post(`/api/user/${data?.id}/sub`)
      .then(() => setSubscribed((p) => !p));

  const isAuthor = session.data?.user?.id === data?.id;

  return (
    <div className="relative">
      <div className="h-80 w-full bg-[url('https://placehold.co/600x400/dddddd/dddddd')] bg-center bg-cover bg-no-repeat"></div>
      <div className="absolute top-32 left-0 w-full px-8 py-4 bg-white min-h-[260px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              height={56}
              width={56}
              className="rounded-full"
              src={data?.image!}
              alt={`${data?.name}'s profile picture`}
            />

            <h1 className="text-2xl tracking-tight font-bold">{data?.name}</h1>
          </div>

          {!isAuthor ? (
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
          )}
        </div>

        <p className="text-gray-700 max-w-prose mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus
          ex nisi reprehenderit dolor quas voluptates architecto, officia porro.
          Nesciunt impedit debitis atque officiis hic fugit voluptatibus
          similique recusandae dolorem cupiditate.
        </p>

        <h1 className="text-2xl font-bold tracking-tight mt-8">
          {data?.name}&apos;s Tweets
        </h1>
        <Feed tweets={data?.tweets ?? []} className="mt-4" />
      </div>
    </div>
  );
}
