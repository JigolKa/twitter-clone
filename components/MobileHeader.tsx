import { Grip } from "lucide-react";
import { useSession } from "~/utils/hooks";
import Logo from "./Logo";
import { InnerSidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function MobileHeader() {
  const session = useSession();

  return (
    <div className="flex lg:hidden w-full py-5 justify-between max-w-[100vw] px-6">
      <Logo />
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Grip className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="px-4">
          <InnerSidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
