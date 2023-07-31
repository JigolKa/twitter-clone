import { Router } from "next/router";
import nProgress from "nprogress";
import { Toaster } from "react-hot-toast";
import Sidebar from "~/components/Sidebar";
import "~/styles/globals.css";
import { AppProps } from "~/types";
import "../styles/loading.scss";

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex min-w-[100vw]">
        <Sidebar />
        <div className="pl-[4.5rem] py-[3rem]">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}
