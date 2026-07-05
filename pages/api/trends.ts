import gst from "google-trends-api";
import { NextApiRequest, NextApiResponse } from "next";
import GoogleTrendsApi from "@shaivpidadi/trends-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const tmp = await GoogleTrendsApi.dailyTrends({
    geo: req.query.geo || "FR", // Default: 'US'
  });
  const result: Trend[] = tmp.data.summary;
  // console.log(req.query);
  result.sort((a, b) => Number(b.traffic) - Number(a.traffic));
  res.json(result);

  // gst.dailyTrends(
  //   {
  //     geo: req.query.geo || "FR",
  //   },
  //   function (_: unknown, results: string) {
  //     console.log(results);
  //     const today = (JSON.parse(results) as { default: Results }).default
  //       .allTrendingStories;

  //     const json = today
  //       .map((j) => ({
  //         // traffic: transformTraffic(j.traffic),
  //         traffic: j.traffic,
  //         // queries: v.relatedQueries.map((k) => k.query),
  //         image: j.image?.imageUrl,
  //         title: j.title,
  //       }))
  //       .flat();
  //     // .sort((a, b) => b.traffic - a.traffic);

  //     res.json(json);
  //   },
  // );
}

// type TrafficUnit = "K" | "M";
// function transformTraffic(v: string): number {
//   let traffic = 0;
//   const map: Record<TrafficUnit, number> = {
//     K: 1_000,
//     M: 1_000_000,
//   };

//   for (const key in map) {
//     const element = map[key as TrafficUnit];

//     if (v.includes(key.toString())) {
//       v = v.replace(`${key}+`, "");
//       traffic = +v * element;

//       return traffic;
//     }
//   }

//   return NaN;
// }

export interface Trend {
  traffic: string;
  title: string;
}

export interface Results {
  allTrendingStories: Array<{
    title: string;
    traffic: string;
    image?: {
      newsUrl: string;
      source: string;
      imageUrl: string;
    };
    articles: Array<{
      title: string;
      url: string;
      source: string;
      time: string;
      snippet: string;
    }>;
    shareUrl: string;
    startTime: number; // Unix timestamp
    endTime?: number; // Unix timestamp (optional)
  }>;
}

// export interface Results {
//   trendingSearchesDays: TrendingSearchesDay[];
//   endDateForNextRequest: string;
//   rssFeedPageUrl: string;
// }

// export interface TrendingSearchesDay {
//   date: string;
//   formattedDate: string;
//   trendingSearches: TrendingSearch[];
// }

// export interface TrendingSearch {
//   title: Title;
//   formattedTraffic: string;
//   relatedQueries: Title[];
//   image: Image;
//   articles: Article[];
//   shareUrl: string;
// }

// export interface Article {
//   title: string;
//   timeAgo: string;
//   source: string;
//   image?: Image;
//   url: string;
//   snippet: string;
// }

// export interface Image {
//   newsUrl: string;
//   source: string;
//   imageUrl: string;
// }

// export interface Title {
//   query: string;
//   exploreLink: string;
// }
