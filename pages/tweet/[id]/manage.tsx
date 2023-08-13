import axios from "axios";
import { PenSquare, Trash2 } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Feed from "~/components/Feed";
import { TweetElement } from "~/components/Tweet";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { createRedisInstance } from "~/lib/redis";
import { capitalize } from "~/utils";
import { useSWR, useSession } from "~/utils/hooks";
import { DetailedTweet, HitsProps } from ".";

export default function Manage({ hits }: HitsProps) {
  const router = useRouter();
  const session = useSession();
  const { data: tweet, mutate } = useSWR<DetailedTweet>(
    router.query && session.data?.user ? `/api/tweet/${router.query.id}` : null
  );
  const [isLoading, setLoading] = useState(false);
  const isAuthor = session.data?.user?.id === tweet?.author.id;
  const isComment = tweet?.rootTweetId;
  const kind = isComment ? "comment" : "tweet";
  const editRef = useRef<HTMLTextAreaElement>(null);

  const closeDialog = () =>
    window?.document?.getElementById("closeDialog")?.click();

  const deleteTweet = async () => {
    setLoading(true);
    const response = await axios.post(`/api/tweet/${router.query.id}/delete`);

    setLoading(false);
    closeDialog();
    if (response.status !== 200) {
      toast.error("An error occured. Please try again later.");
    } else {
      toast.success(`${capitalize(kind)} deleted! Redirecting...`);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  const editTweet = async () => {
    if (!editRef.current || editRef.current?.value === tweet?.message)
      return editRef.current?.focus();

    setLoading(true);

    const response = await axios.patch(`/api/tweet/${router.query.id}`, {
      message: editRef.current.value,
    });

    setLoading(false);
    closeDialog();
    if (response.status !== 200) {
      toast.error("An error occured. Please try again later.");
    } else {
      mutate();
      toast.success(`${capitalize(kind)} edited!`);
    }
  };

  useEffect(() => {
    if ((session.status as string) === "loading") return;

    if (
      (session.status as string) === "unauthenticated" ||
      !session?.data?.user
    ) {
      signIn();
    } else if (!isAuthor) {
      router.push("/");
    }
  }, [isAuthor, session.status]);

  return isAuthor && tweet ? (
    <>
      <Head>
        <title>Manage my tweet - Twitter Clone</title>
      </Head>

      <h1 className="text-4xl font-bold tracking-tighter">Manage my tweet</h1>

      <TweetElement
        preset="feed"
        tweet={{ ...tweet, hits }}
        canBeEdited={false}
        className="hover:!bg-transparent mt-2"
      />

      <div className="flex gap-6 mt-4" id="actions">
        <Dialog>
          <DialogTrigger>
            <Button className="bg-red-600 text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete this {kind}</DialogTitle>
              <DialogDescription>
                Be aware that this action <b>cannot be</b> undone.
              </DialogDescription>
            </DialogHeader>
            <h2 className="font-semibold">
              Do you want to delete this {kind}?
            </h2>
            <DialogFooter className="!justify-between w-full mt-4">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={deleteTweet}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button>
              <PenSquare className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit this {kind}</DialogTitle>
            </DialogHeader>
            <Textarea ref={editRef} className="min-h-[120px]">
              {tweet.message}
            </Textarea>
            <DialogFooter className="!justify-between w-full mt-4">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={editTweet} isLoading={isLoading}>
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!isComment && (
        <>
          <h2 className="mt-8 font-bold font-xl">Comments</h2>
          <Feed tweets={tweet.comments} className="mt-2" />
        </>
      )}
    </>
  ) : null;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const redis = createRedisInstance();

  const id = ctx.query.id as string;

  const value = await redis.get(id);
  await redis.quit();

  return {
    props: {
      hits: value ? +value : 0,
    },
  };
}
