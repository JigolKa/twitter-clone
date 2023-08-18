import { Tweet } from "@prisma/client";
import { AxiosResponse } from "axios";
import { IncomingMessage } from "http";
import { NextApiRequest } from "next";
import { Session } from "next-auth";
import { SessionContextValue } from "next-auth/react";
import { AppProps as _AppProps } from "next/app";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { NextRequest } from "next/server";
import { ComponentProps } from "react";

export type BasicProps<T extends keyof JSX.IntrinsicElements = "div"> =
  ComponentProps<T>;
export type UnwrapPromise<T> = T extends Promise<infer D> ? D : T;
export type UnwrapArray<T> = T extends Array<infer D> ? D : T;

export type CrossServerRequest =
  | NextApiRequest
  | (IncomingMessage & {
      cookies: NextApiRequestCookies;
    })
  | NextRequest;

export type AppProps = _AppProps & {
  Component: _AppProps["Component"] & {
    container?: boolean;
  };
};
export type Component = AppProps["Component"];

export type SessionContext = SessionContextValue & {
  data: Session & {
    user: {
      userId: string;
    };
  };
};

export type SimpleTweetProps = TweetProps & {
  tweet: FetchedTweetSample;
  preset: "feed";
};
export type DetailedTweetProps = TweetProps & {
  tweet: DetailedTweet;
  preset: "detailed";
};
export type TweetProps = BasicProps & {
  callback?: string | ((res: AxiosResponse) => any);
  disableBodyLink?: boolean;
  canBeEdited?: boolean;
  profileName?: string;
};

export interface FetchedTweetSample extends Tweet {
  likes: {
    email: string;
  }[];
  comments?: {
    id: string;
  }[];
  retweets: {
    email: string;
  }[];
  author: {
    id: string;
    image?: string;
    name?: string;
  };
  hits?: number;
  isRetweet?: boolean;
  isLiked: boolean;
  isRetweeted: boolean;
}

export type DetailedTweet = Omit<FetchedTweetSample, "comments"> & {
  author: {
    followedBy: {
      email: string;
    }[];
  };
  hits?: number;
  comments: FetchedTweetSample[];
};
