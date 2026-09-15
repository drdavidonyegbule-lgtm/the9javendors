import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import {
  buttonGhost,
  buttonPrimary,
  buttonSmall,
  cardBase,
  inputBase,
  labelBase,
  panelBase,
} from "@/components/ui-classes";
import { adminListProducts, adminSaveProduct } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: ProductFormPage,
});

const CATEGORIES = [
  "Foodstuff",
  "Cooking & Kitchen",
  "Household",
  "Electronics",
  "Personal Care",
  "General",
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  isAvailable: boolean;
  isHidden: boolean;
  supplierName: string;
  supplierPhone: string;
  supplierCost: string;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  category: "Foodstuff",
  isAvailable: true,
  isHidden: false,
  supplierName: "",
  supplierPhone: "",
  supplierCost: "",
};

function ProductFormPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchProducts = useServerFn(adminListProducts);
  const saveProduct = useServerFn(adminSaveProduct);

  const { data: products, isPending } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchProducts(),
  });

  const existing = useMemo(
    () => (isNew ? null : (products ?? []).find((product) => product.id === id) ?? null),
    [products, id, isNew],
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !existing || loadedId === existing.id) return;
    setForm({
      name: existing.name,
      description: existing.description,
      price: String(existing.price),
      category: existing.category,
      isAvailable: existing.isAvailable,
      isHidden: existing.isHidden,
      supplierName: existing.supplierName,
      supplierPhone: existing.supplierPhone,
      supplierCost: existing.supplierCost === null ? "" : String(existing.supplierCost),
    });
    setImagePath(existing.imagePath);
    setPreviewUrl(existing.imageUrl);
    setLoadedId(existing.id);
  }, [existing, isNew, loadedId]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      saveProduct({
        data: {
          id: isNew ? null : id,
          name: form.name,
          description: form.description,
          price: Number(form.price) || 0,
          category: form.category,
          imagePath,
          imageUrl: imagePath ? null : existing?.imageUrl ?? null,
          isAvailable: form.isAvailable,
          isHidden: form.isHidden,
          supplierName: form.supplierName,
          supplierPhone: form.supplierPhone,
          supplierCost: form.supplierCost === "" ? null : Number(form.supplierCost),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "public"] });
      navigate({ to: "/admin/products" });
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not save the product."),
  });

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That photo is larger than 10MB. Please choose a smaller one.");
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { data: signed, error: signError } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signError) throw new Error(signError.message);

      setImagePath(path);
      setPreviewUrl(signed?.signedUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Please enter a selling price greater than zero.");
      return;
    }
    save.mutate();
  }

  if (!isNew && isPending) {
    return <p className="text-sm text-muted-foreground">Loading product…</p>;
  }

  if (!isNew && !existing) {
    return (
      <div className={cardBase}>
        <h1 className="text-2xl font-extrabold">Product not found</h1>
        <Link to="/admin/products" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const priceNumber = Number(form.price) || 0;
  const costNumber = form.supplierCost === "" ? null : Number(form.supplierCost) || 0;
  const margin = costNumber === null ? null : priceNumber - costNumber;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">{isNew ? "Add product" : "Edit product"}</h1>
        <Link to="/admin/products" className={buttonSmall}>
          Back to products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className={cardBase}>
          <div>
            <label className={labelBase} htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              className={inputBase}
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Mama Gold Rice 50kg"
              required
            />
          </div>

          <div className="mt-5">
            <label className={labelBase} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              className={inputBase}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="What the customer is buying, size, brand and any useful details."
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelBase} htmlFor="price">
                Selling price (₦)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                className={inputBase}
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="45000"
                required
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Customers will see {formatNaira(priceNumber)}
              </p>
            </div>
            <div>
              <label className={labelBase} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className={inputBase}
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
              >
                {[...new Set([...CATEGORIES, form.category])].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-primary)]"
                checked={form.isAvailable}
                onChange={(event) => update("isAvailable", event.target.checked)}
              />
              Available to buy
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-primary)]"
                checked={form.isHidden}
                onChange={(event) => update("isHidden", event.target.checked)}
              />
              Hide from the shop
            </label>
          </div>

          <div className={`${panelBase} mt-6`}>
            <h2 className="text-sm font-bold">Supplier details (staff only)</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Customers never see this. It is only here to help you buy the item.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelBase} htmlFor="supplierName">
                  Supplier name
                </label>
                <input
                  id="supplierName"
                  className={inputBase}
                  value={form.supplierName}
                  onChange={(event) => update("supplierName", event.target.value)}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="supplierPhone">
                  Supplier phone
                </label>
                <input
                  id="supplierPhone"
                  className={inputBase}
                  value={form.supplierPhone}
                  onChange={(event) => update("supplierPhone", event.target.value)}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="supplierCost">
                  Cost price (₦)
                </label>
                <input
                  id="supplierCost"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className={inputBase}
                  value={form.supplierCost}
                  onChange={(event) => update("supplierCost", event.target.value)}
                />
              </div>
            </div>
            {margin !== null ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Difference between your price and cost: {formatNaira(margin)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={cardBase}>
            <h2 className="text-sm font-bold">Product photo</h2>
            <div className="mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
              {previewUrl ? (
                <img src={previewUrl} alt={form.name || "Product photo"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
                  No photo yet. Upload a clear picture of the product.
                </div>
              )}
            </div>

            <label className={`${buttonGhost} mt-4 w-full cursor-pointer`}>
              {uploading ? "Uploading…" : previewUrl ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleFile(file);
                }}
              />
            </label>

            {previewUrl ? (
              <button
                type="button"
                className={`${buttonSmall} mt-3`}
                onClick={() => {
                  setImagePath(null);
                  setPreviewUrl(null);
                }}
              >
                Remove photo
              </button>
            ) : null}

            <p className="mt-3 text-xs text-muted-foreground">JPG, PNG or WebP up to 10MB.</p>
          </div>

          <div className={cardBase}>
            {error ? (
              <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground">
                {error}
              </p>
            ) : null}
            <button type="submit" className={`${buttonPrimary} w-full`} disabled={save.isPending || uploading}>
              {save.isPending ? "Saving…" : isNew ? "Add product" : "Save changes"}
            </button>
            <Link to="/admin/products" className={`${buttonGhost} mt-3 w-full`}>
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
