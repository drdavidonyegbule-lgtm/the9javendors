import { test, expect } from "bun:test";
import { sitemapProductSlugs } from "./sitemap-products.server.ts";

function mockClient(batches) {
  const calls = [];
  return { calls, from(table) {
    expect(table).toBe("products");
    return { select(columns) {
      expect(columns).toBe("slug");
      return { eq(column, value) {
        expect(column).toBe("is_hidden"); expect(value).toBe(false);
        return { order(column) {
          expect(column).toBe("id");
          return { range(start, end) {
            calls.push([start, end]); return Promise.resolve(batches.shift());
          } };
        } };
      } };
    } };
  } };
}

test("public product sitemap reads all batches using hidden-product exclusion", async () => {
  const client = mockClient([{ data: [{ slug: "rice" }], error: null }, { data: [{ slug: "fabric" }], error: null }, { data: [], error: null }]);
  expect(await sitemapProductSlugs(client)).toEqual(["rice", "fabric"]);
  expect(client.calls).toEqual([[0, 999], [1, 1000], [2, 1001]]);
});

test("a later query failure rejects instead of returning partial product URLs", async () => {
  const client = mockClient([{ data: [{ slug: "rice" }], error: null }, { data: null, error: new Error("query failed") }]);
  await expect(sitemapProductSlugs(client)).rejects.toThrow("Public sitemap product query failed");
});