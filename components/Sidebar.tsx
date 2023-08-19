import { Flame, Home, LogIn, LogOut, LucideIcon, Search } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { BasicProps } from "~/types";
import { cx, merge } from "~/utils";
import { useSession } from "~/utils/hooks";
import Logo from "./Logo";

type ItemProps = BasicProps & { preset?: "current" };

type ItemData = {
  icon: LucideIcon;
  text: string;
  path?: string;
};

export const sidebarItems: ItemData[] = [
  {
    icon: Home,
    text: "Home",
    path: "/",
  },
  {
    icon: Search,
    text: "Explore",
    path: "/explore",
  },
  {
    icon: Flame,
    text: "Trends",
    path: "/trends",
  },
];

type PropsWithItem = ItemProps & {
  item: ItemData;
} & { type: "item" };

type PropsWithNode = ItemProps & {
  html: ReactNode;
  path?: string;
} & { type: "node" };

export function Item({
  preset: _preset,
  ...rest
}: PropsWithItem | PropsWithNode) {
  const router = useRouter();
  const isItem = rest.type === "item";
  const preset = isItem
    ? _preset
      ? _preset
      : router.pathname === rest.item.path
      ? "current"
      : void 0
    : rest.path && rest.path === router.pathname
    ? "current"
    : void 0;
  const iconProps = {
    height: 24,
    width: 24,
    className:
      preset === "current"
        ? "text-gray-900 font-extrabold stroke-[2px]"
        : "text-gray-500",
  };

  const node = (
    <div
      {...merge(
        cx(
          "group flex gap-3 items-center tracking-tight cursor-pointer rounded-full py-4 px-6 lg:px-8 transition font-semibold text-lg hover:bg-gray-200/70",
          {
            undefined: "text-gray-800",
            current: "!font-extrabold",
          }[preset ?? "undefined"]
        ),
        rest
      )}
    >
      {rest.type === "node" ? (
        rest.html
      ) : (
        <>
          <rest.item.icon {...iconProps} />
          <span className="text-gray-700">{rest.item.text}</span>
        </>
      )}
    </div>
  );

  return rest.type === "node" && rest.path ? (
    <Link href={rest.path}>{node}</Link>
  ) : rest.type === "item" && rest.item.path ? (
    <Link href={rest.item.path}>{node}</Link>
  ) : (
    node
  );
}

export default function Sidebar() {
  return (
    <div className="hidden lg:block w-80 xl:w-96 sticky top-0 left-0 bg-white h-full p-4 py-6 xl:p-8 border-r">
      <InnerSidebar />
    </div>
  );
}

export function InnerSidebar(props: BasicProps) {
  const session = useSession();

  return (
    <div
      {...merge(
        "flex min-h-[calc(100vh-4rem)] flex-col justify-between h-full lg:py-0 lg:pb-0 pb-9 py-4",
        props
      )}
    >
      <div className="tracking-tight">
        <Logo className="lg:mb-8 mb-12 justify-center" />
        <div className="flex flex-col gap-2 mt-6">
          {sidebarItems.map((v) => (
            <Item item={v} key={v.text} type="item" />
          ))}
          {session.data ? (
            <Item
              html={<span className="text-white text-lg">Tweet</span>}
              className="!bg-blue-600 hover:!bg-blue-700 flex justify-center"
              type="node"
              path="/tweet"
            />
          ) : null}
        </div>
      </div>

      {session.data?.user ? (
        <div className="gap-2 flex flex-col">
          <Item
            item={{
              icon: LogOut,
              text: "Sign out",
            }}
            onClick={() => signOut()}
            type="item"
          />
          <Item
            type="node"
            html={
              <>
                <Image
                  alt={`${session.data.user?.name}'s profile picture`}
                  src={
                    session.data.user?.image ||
                    "https://avatars.githubusercontent.com/u/0000000?v=4"
                  }
                  height={40}
                  width={40}
                  className="bg-blue-600 rounded-full shrink-0"
                ></Image>
                <h4 className="font-bold tracking-tight text-md">
                  {session.data.user?.name}
                </h4>
              </>
            }
            path={`/profile/${session.data.user.id}`}
          />
        </div>
      ) : (
        <Item
          onClick={() => signIn()}
          className="bg-blue-600 [&>*]:text-white [&>*]:hover:text-black"
          item={{ text: "Login", icon: LogIn }}
          type="item"
        />
      )}
    </div>
  );
}
