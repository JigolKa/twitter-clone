import { SessionProvider } from "next-auth/react";
import { Router } from "next/router";
import nProgress from "nprogress";
import { Toaster } from "react-hot-toast";
import MobileHeader from "~/components/MobileHeader";
import Sidebar from "~/components/Sidebar";
import FeedProvider from "~/contexts/FeedContext";
import "~/styles/globals.css";
import { AppProps } from "~/types";
import "../styles/loading.scss";
import { Analytics } from "@vercel/analytics/react";
// import { Provider } from "next-auth/client";

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <FeedProvider>
        <Analytics />
        <Toaster position="bottom-right" reverseOrder={false} />
        {typeof Component.hasSidebar === "undefined" || Component.hasSidebar ? (
          <div className="flex-col lg:flex-row flex max-w-6xl relative mx-auto">
            <Sidebar />
            <MobileHeader />
            <div className="py-4 lg:py-8 px-6 xl:px-8 lg:max-w-2xl xl:max-w-3xl w-full">
              <Component {...pageProps} />
            </div>
          </div>
        ) : (
          <Component {...pageProps} />
        )}
      </FeedProvider>
    </SessionProvider>
  );
}
