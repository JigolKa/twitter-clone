import { signIn, useSession, signOut } from "next-auth/react";
import Feed from "~/components/Feed";

export default function Home() {
  const session = useSession();

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tighter">Home</h1>
      <Feed className="mt-6" />
    </>
  );
}
