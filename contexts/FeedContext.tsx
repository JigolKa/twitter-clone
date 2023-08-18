import { Dispatch, SetStateAction, createContext, useState } from "react";
import { KeyedMutator } from "swr";
import { BasicProps } from "~/types";

interface FeedContext {
  triggerRefresh: KeyedMutator<any> | null;
  setFn: Dispatch<SetStateAction<KeyedMutator<any> | null>>;
}

export const FeedContext = createContext<FeedContext | null>(null);

export default function FeedProvider({
  children,
}: Pick<BasicProps, "children">) {
  const [fn, setFn] = useState<FeedContext["triggerRefresh"]>(null);

  return (
    <FeedContext.Provider value={{ setFn, triggerRefresh: fn }}>
      {children}
    </FeedContext.Provider>
  );
}
