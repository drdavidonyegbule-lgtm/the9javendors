// Declarative schema for Drizzle. Seeded catalogue still lives in src/lib/marketplace-data.ts.
// Existing products table is not redefined here to avoid conflicting with the blank auto-generated baseline.

import { pgTable, uuid, text, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  label: text("label").notNull(),
  swatchColor: text("swatch_color"),
  swatchImage: text("swatch_image"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  priceOverride: numeric("price_override", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productVariantSizes = pgTable("product_variant_sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(0),
});
