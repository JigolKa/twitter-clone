import { hash } from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface User {
  username: string;
  email: string;
  password: string;
  image?: string;
}
let users: User[] = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "john1234",
  },
  {
    username: "mary_smith",
    email: "mary.smith@example.com",
    password: "mary9876",
  },
  {
    username: "alex_johnson",
    email: "alex.johnson@example.com",
    password: "alexpass1",
  },
  {
    username: "sara_jackson",
    email: "sara.jackson@example.com",
    password: "sara5678",
  },
  {
    username: "michael_brown",
    email: "michael.brown@example.com",
    password: "brownie123",
  },
  {
    username: "lisa_carter",
    email: "lisa.carter@example.com",
    password: "carter456",
  },
  {
    username: "peter_miller",
    email: "peter.miller@example.com",
    password: "millerpass",
  },
  {
    username: "emily_jones",
    email: "emily.jones@example.com",
    password: "emily789",
  },
  {
    username: "robert_wilson",
    email: "robert.wilson@example.com",
    password: "wilson2023",
  },
  {
    username: "jennifer_adams",
    email: "jennifer.adams@example.com",
    password: "adams4567",
  },
];

let tweets = [
  {
    email: "john.doe@example.com",
    text: "Excited to announce the launch of our new website! 🚀 #NewWebsite #LaunchDay",
  },
  {
    email: "mary.smith@example.com",
    text: "Just finished reading an amazing book! Highly recommend it to everyone. 📚 #BookRecommendation #ReadingList",
  },
  {
    email: "alex.johnson@example.com",
    text: "Had a great time hiking with friends this weekend. The views were breathtaking! 🏞️ #HikingAdventure #NatureLovers",
  },
  {
    email: "sara.jackson@example.com",
    text: "Attended an inspiring tech conference today. So much to learn and implement in my projects! 💡 #TechConference #Learning",
  },
  {
    email: "michael.brown@example.com",
    text: "Enjoying my vacation on a beautiful island. Relaxation mode: ON! 🏝️ #VacationMode #IslandLife",
  },
  {
    email: "lisa.carter@example.com",
    text: "Just had the best homemade pizza ever! 🍕❤️ #Foodie #PizzaLover",
  },
  {
    email: "peter.miller@example.com",
    text: "Excited about the upcoming movie release. Can't wait to watch it with friends! 🍿🎬 #MovieNight #Excited",
  },
  {
    email: "emily.jones@example.com",
    text: "Loving the new workout routine. Feeling healthier and stronger every day! 💪 #FitnessJourney #HealthyLiving",
  },
  {
    email: "robert.wilson@example.com",
    text: "Had a great time volunteering at the local animal shelter today. Adopt, don't shop! 🐶🐱 #AnimalAdoption #Volunteer",
  },
  {
    email: "jennifer.adams@example.com",
    text: "Spent the afternoon gardening. Nothing beats the satisfaction of growing your own vegetables. 🌿🥕 #Gardening #GreenThumb",
  },
  {
    text: "Excited for the weekend! 🎉",
    email: "john.doe@example.com",
  },
  {
    text: "Just had the best meal at a new restaurant! Highly recommend it. #foodie",
    email: "mary.smith@example.com",
  },
  {
    text: "Feeling grateful for all the amazing people in my life. #blessed",
    email: "alex.johnson@example.com",
  },
  {
    text: "Working on a new project. Can't wait to share it with you all! #coding",
    email: "sara.jackson@example.com",
  },
  {
    text: "Enjoying a relaxing day at the beach. ☀️ #vacation",
    email: "michael.brown@example.com",
  },
  {
    text: "Just finished reading a great book. Any book recommendations? 📚",
    email: "lisa.carter@example.com",
  },
  {
    text: "Attending an exciting tech conference today! #techevents",
    email: "peter.miller@example.com",
  },
  {
    text: "Had a fun day exploring the city with friends. #citylife",
    email: "emily.jones@example.com",
  },
  {
    text: "Watching my favorite team play. Go team! 🏀 #sports",
    email: "robert.wilson@example.com",
  },
  {
    text: "Just adopted a new puppy! 🐶 #puppylove",
    email: "jennifer.adams@example.com",
  },
  {
    text: "What a beautiful sunset! 🌅 #nature",
    email: "john.doe@example.com",
  },
  {
    text: "Trying out a new recipe for dinner tonight. #cooking",
    email: "mary.smith@example.com",
  },
  {
    text: "Feeling motivated to achieve my goals. #ambition",
    email: "alex.johnson@example.com",
  },
  {
    text: "Just had a productive meeting at work. #worklife",
    email: "sara.jackson@example.com",
  },
  {
    text: "Spending quality time with family today. #familytime",
    email: "michael.brown@example.com",
  },
  {
    text: "Attended a fascinating art exhibition. #art",
    email: "lisa.carter@example.com",
  },
  {
    text: "Exploring new hiking trails this weekend. #hiking",
    email: "peter.miller@example.com",
  },
  {
    text: "Enjoying a cup of coffee and a good book. #coffee",
    email: "emily.jones@example.com",
  },
  {
    text: "Trying out a new workout routine. #fitness",
    email: "robert.wilson@example.com",
  },
  {
    text: "Attending a music concert tonight! #music",
    email: "jennifer.adams@example.com",
  },
  {
    text: "Just got a promotion at work. Hard work pays off! #career",
    email: "john.doe@example.com",
  },
  {
    text: "Celebrating my birthday with friends and family. 🎂 #birthday",
    email: "mary.smith@example.com",
  },
  {
    text: "Weekend getaway with my loved ones. #weekendvibes",
    email: "alex.johnson@example.com",
  },
  {
    text: "Learning a new language. Bonjour! #languagelearning",
    email: "sara.jackson@example.com",
  },
  {
    text: "Enjoying the beautiful weather outside. #sunnyday",
    email: "michael.brown@example.com",
  },
  {
    text: "Just finished a challenging puzzle. #puzzles",
    email: "lisa.carter@example.com",
  },
  {
    text: "Attending a charity event to support a great cause. #charity",
    email: "peter.miller@example.com",
  },
  {
    text: "Weekend BBQ with friends! #bbq",
    email: "emily.jones@example.com",
  },
  {
    text: "Exploring a new city during my vacation. #travel",
    email: "robert.wilson@example.com",
  },
  {
    text: "Just started a new blog. Excited to share my thoughts with the world! #blogging",
    email: "jennifer.adams@example.com",
  },
  {
    text: "Trying out a new hobby. #hobbies",
    email: "john.doe@example.com",
  },
  {
    text: "Having a movie night with popcorn and friends. #movienight",
    email: "mary.smith@example.com",
  },
  {
    text: "Enjoying a beautiful day at the park. #nature",
    email: "alex.johnson@example.com",
  },
  {
    text: "Feeling inspired by motivational quotes. #inspiration",
    email: "sara.jackson@example.com",
  },
  {
    text: "Just completed a challenging workout. Feeling strong! 💪 #exercise",
    email: "michael.brown@example.com",
  },
  {
    text: "Attending a book signing event. #booklovers",
    email: "lisa.carter@example.com",
  },
  {
    text: "Trying out a new art project. #creativity",
    email: "peter.miller@example.com",
  },
  {
    text: "Weekend road trip with friends. #roadtrip",
    email: "emily.jones@example.com",
  },
  {
    text: "Reflecting on the past year and setting new goals. #newyear",
    email: "robert.wilson@example.com",
  },
  {
    text: "Spending a quiet evening at home with a good book. #reading",
    email: "jennifer.adams@example.com",
  },
  {
    text: "Trying out a new yoga class. Namaste! #yoga",
    email: "john.doe@example.com",
  },
  {
    text: "Attending a local community event. #community",
    email: "mary.smith@example.com",
  },
  {
    text: "Cheering on my favorite sports team. #sports",
    email: "alex.johnson@example.com",
  },
  {
    text: "Just adopted a new kitten! 🐱 #kitten",
    email: "sara.jackson@example.com",
  },
  {
    text: "Attending a live theater performance. #theater",
    email: "michael.brown@example.com",
  },
  {
    text: "Trying out a new recipe for dessert. #dessert",
    email: "lisa.carter@example.com",
  },
  {
    text: "Attending a technology meetup. #tech",
    email: "peter.miller@example.com",
  },
  {
    text: "Having a picnic with friends in the park. #picnic",
    email: "emily.jones@example.com",
  },
  {
    text: "Feeling grateful for all the support from my friends. #gratitude",
    email: "robert.wilson@example.com",
  },
  {
    text: "Trying out a new meditation practice. #meditation",
    email: "jennifer.adams@example.com",
  },
];

function shuffle<T>(array: T[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const flags = ["tweets"];
(async () => {
  if (flags.includes("users")) {
    for (let i = 0; i < users.length; i++) {
      users[i] = {
        ...users[i],
        password: await hash(users[i].password),
        image: `https://i.pravatar.cc/150?u=${users[i].email}`,
      };
    }

    const data = await prisma?.user.createMany({
      data: users,
    });
    console.log("🚀 ~ file: seed.ts:75 ~ data:", data);
  } else if (flags.includes("tweets")) {
    let ids = (await prisma.user.findMany()).map((v) => v.userId);

    for (let i = 0; i < tweets.length; i++) {
      tweets[i] = {
        html: tweets[i].text,
        authorId: ids[0],
      } as any;

      ids = shuffle(ids);
    }

    const data = await prisma.tweet.createMany({
      data: tweets as any,
    });
    console.log("🚀 ~ file: seed.ts:358 ~ data:", data);
  }
})();
