import {
  useSession as NextAuthUseSession,
  SessionContextValue,
} from "next-auth/react";
import { getServerSession as NextAuthGetServerSession } from "next-auth";
import { useState } from "react";
import swr from "swr";
import { fetcher } from "..";

export function useForceUpdate() {
  const [_, setValue] = useState(0);

  return () => setValue((value) => value + 1);
}

export function useSWR<T>(url?: string | null) {
  const res = swr<T>(url, fetcher);

  return res;
}

export function useSession() {
  return NextAuthUseSession() as SessionContextValue & {
    data: {
      user: Session | null;
    };
  };
}

export async function getServerSession(
  ...props: Parameters<typeof NextAuthGetServerSession>
) {
  return (await NextAuthGetServerSession(...props)) as {
    user: Session | null;
    expires: string;
  } | null;
}

interface Session {
  id: string;
  email: string;
  name: string;
  image: string;
}
