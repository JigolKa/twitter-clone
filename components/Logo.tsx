import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { BasicProps } from "~/types";

export default function Logo({ className }: BasicProps) {
  return (
    <Link href="/" className={cn("flex gap-4 items-center", className)}>
      <Image src={"/twitter.png"} alt="Twitter's logo" height={40} width={40} />
      <h1 className="text-2xl font-bold tracking-tighter">Twitter Clone</h1>
    </Link>
  );
}
