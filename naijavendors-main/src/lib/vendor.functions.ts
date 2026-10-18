import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProductById } from "./use-products";

/** Legacy vendor lookup — marketplace is product-first. Returns null. */
export const getVendor = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(150) }).parse(data))
  .handler(async () => null);

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().min(1).max(150) }).parse(data))
  .handler(async ({ data }) => getProductById(data.id) ?? null);
