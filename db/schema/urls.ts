import {
  integer,
  pgEnum,
  pgTable,
  index,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const urls = pgTable(
  "urls",
  {
    short_code: varchar("shortCode", { length: 10 }).notNull().primaryKey(),
    redirect_url: varchar("redirectUrl").notNull(),
  },
  (table) => {
    return {
      shortCodeIdx: index("shortCode_idx").on(table.short_code),
    };
  }
);
