# Twitter Clone

## Install dependencies

```bash
npm install
```

## Set up your .env variables

1. This project uses Redis for the analytics on each post. You'll need to provide these 3 variables:
   You can adjust the [configuration](/lib/redis.ts) if needed

```
REDIS_PASSWORD=""
REDIS_HOST=""
REDIS_PORT=""
```

2. To generate the `NEXTAUTH_SECRET` variable, just type the below command and copy the output string.

```
openssl rand -hex 32
```

3. To set up authentication, you're not forced to follow my configuration.
   You can remove some providers, add others...
   However, if you want to setup Github, Discord and Google, make sure to read [this useful blog post](https://refine.dev/blog/nextauth-google-github-authentication-nextjs/#for-googleprovider-make-sure-you-have-a-google-account) (This cover the Google and Github providers).

   To set up Discord, go [here](https://discord.com/developers/applications), then create a new application.
   Once created, go in the `OAuth2 > General` tab. You will see a client ID and a client secret appear. You may need to click on the `Reset Secret` to make your secret visible.

4. The Prisma schema has been built for a CockroachDB database, but you are free to change this (Don't forget to make the appropriate changes in the schema).

## Run the development server:

```bash
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
