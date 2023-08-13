import gst from "google-trends-api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  gst.dailyTrends(
    {
      geo: req.query.geo || "FR",
    },
    function (_: unknown, results: string) {
      const today = (JSON.parse(results) as { default: Results }).default
        .trendingSearchesDays;

      const json = today
        .map((j) =>
          j.trendingSearches.map((v) => ({
            traffic: v.formattedTraffic,
            queries: v.relatedQueries.map((k) => k.query),
            image: v.image.imageUrl,
            title: v.title.query,
          }))
        )
        .flat();

      res.json(json);
    }
  );
}

export interface Trend {
  traffic: string;
  queries: string[];
  image: string;
  title: string;
}

export interface Results {
  trendingSearchesDays: TrendingSearchesDay[];
  endDateForNextRequest: string;
  rssFeedPageUrl: string;
}

export interface TrendingSearchesDay {
  date: string;
  formattedDate: string;
  trendingSearches: TrendingSearch[];
}

export interface TrendingSearch {
  title: Title;
  formattedTraffic: string;
  relatedQueries: Title[];
  image: Image;
  articles: Article[];
  shareUrl: string;
}

export interface Article {
  title: string;
  timeAgo: string;
  source: string;
  image?: Image;
  url: string;
  snippet: string;
}

export interface Image {
  newsUrl: string;
  source: string;
  imageUrl: string;
}

export interface Title {
  query: string;
  exploreLink: string;
}
