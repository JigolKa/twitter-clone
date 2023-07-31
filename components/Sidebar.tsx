import {
  Book,
  BookMarked,
  BookOpenCheck,
  ChevronsUpDownIcon,
  Flame,
  GraduationCapIcon,
  Home,
  LineChartIcon,
  LucideIcon,
  Mail,
  MessageCircle,
  QrCode,
  School,
  Search,
  SearchIcon,
  Settings,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useContext } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { BasicProps } from "~/types";
import { cx, merge } from "~/utils";

type ItemProps = BasicProps & { preset?: "search" | "current" };

type ItemData = {
  icon: LucideIcon;
  text: string;
  path?: string;
};

const items: ItemData[] = [
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
  {
    icon: MessageCircle,
    text: "Private messages",
    path: "/messages",
  },
  {
    icon: QrCode,
    text: "Get my Realter code",
    path: "/code",
  },
];

type PropsWithItem = ItemProps & {
  item: ItemData;
} & { type: "item" };

type PropsWithNode = ItemProps & {
  html: ReactNode;
  path?: string;
} & { type: "node" };

function Item({ preset: _preset, ...rest }: PropsWithItem | PropsWithNode) {
  const router = useRouter();
  const isItem = rest.type === "item";
  const preset = isItem
    ? _preset
      ? _preset
      : router.asPath === rest.item.path
      ? "current"
      : void 0
    : rest.path && rest.path === router.asPath
    ? "current"
    : void 0;
  const iconProps = { height: 24, width: 24, className: "text-gray-500" };

  const node = (
    <div
      className={cx(
        "group flex gap-3 items-center tracking-tight cursor-pointer rounded-full py-4  px-8 transition min-w-[18rem] font-bold text-lg",
        {
          search:
            "text-gray-600 bg-gray-100 hover:bg-gray-50 transition border-2 border-spacing-2 mb-4 border-gray-300 rounded-lg",
          undefined: "text-gray-800 hover:bg-gray-200/70",
          current: "[&>*]:text-white bg-blue-600",
        }[preset ?? "undefined"]
      )}
      autoFocus={_preset === "current"}
      {...rest}
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
    <div className="relative">
      <div className="max-w-xl bg-white pl-[16rem] w-full min-h-full p-8 px-4 sticky top-0 right-0 max-h-[100vh] border-r overflow-auto">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-between h-full">
          <div className="tracking-tight">
            <div className="flex gap-4 items-center mb-8">
              <Image
                src={"/twitter.png"}
                alt="Twitter's logo"
                height={40}
                width={40}
              />
              <h1 className="text-2xl font-bold tracking-tighter">Realter</h1>
            </div>

            {/* <Item
              item={{ icon: SearchIcon, text: "Chercher", path: "/search" }}
              preset="search"
              type="item"
            /> */}

            <div className="flex flex-col gap-2 mt-6">
              {items.map((v) => (
                <Item item={v} key={v.text} type="item" />
              ))}
            </div>
          </div>

          <div className="gap-2 flex flex-col">
            <Item
              item={{ icon: Settings, text: "Paramètres", path: "/settings" }}
              type="item"
            />

            <Item
              type="node"
              html={
                <>
                  <div className="w-9 h-9 bg-blue-600 rounded-full shrink-0 ring-2 ring-gray-300 ring-offset-1 group-hover:ring-blue-950"></div>
                  <h4 className="font-bold tracking-tight text-md">John Doe</h4>
                </>
              }
              path="/account"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
