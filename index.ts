import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { urls } from "./db/schema/urls";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const migrationClient = postgres(process.env.DATABASE_URL || "", { max: 1 });

migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });

const queryClient = postgres(process.env.DATABASE_URL || "");
const db = drizzle(queryClient);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/shorten", async (req, res) => {
  const originalUrl: string = req.body.url;
  const shortCode: string = req.body.shortcode;
  const password: string = req.body.password;

  if (!originalUrl) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!shortCode) {
    return res.status(400).json({ error: "Short URL is required" });
  }
  if (password !== process.env.upsertPassword) {
    return res.status(403).json({ error: "Unauthorised" });
  }

  let result = await db
    .insert(urls)
    .values({ short_code: shortCode, redirect_url: originalUrl })
    .onConflictDoUpdate({
      target: urls.short_code,
      set: { redirect_url: originalUrl },
    });

  if (result) {
    res.json({ originalUrl, shortCode });
  } else {
    res.status(500);
  }
});

app.get("/s/:shortCode", async (req, res) => {
  const shortCode: string = req.params.shortCode;
  const url_obj = (
    await db.select().from(urls).where(eq(urls.short_code, shortCode)).limit(1)
  )[0];

  const redirect_url = url_obj.redirect_url;

  if (redirect_url) {
    res.redirect(redirect_url);
  } else {
    res.status(404).send("Not Found");
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
