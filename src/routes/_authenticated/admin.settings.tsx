import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { buttonPrimary, cardBase, inputBase, labelBase } from "@/components/ui-classes";
import { adminGetSettings, adminSaveSettings, type AdminSettings } from "@/lib/admin.functions";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (₦)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GHS", symbol: "₵", label: "Ghanaian Cedi (₵)" },
];

const EMPTY: AdminSettings = {
  storeName: "",
  storePhone: "",
  storeEmail: "",
  storeWhatsapp: "",
  storeAddress: "",
  deliveryFee: 0,
  alertEmail: "",
  currencyCode: "NGN",
  currencySymbol: "₦",
  storeHours: "",
};

function SettingsPage() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(adminGetSettings);
  const saveSettings = useServerFn(adminSaveSettings);

  const { data, isPending } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings(),
  });

  const [form, setForm] = useState<AdminSettings>(EMPTY);
  const [deliveryFeeText, setDeliveryFeeText] = useState("0");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data || loaded) return;
    setForm(data);
    setDeliveryFeeText(String(data.deliveryFee));
    setLoaded(true);
  }, [data, loaded]);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = useMutation({
    mutationFn: () =>
      saveSettings({ data: { ...form, deliveryFee: Number(deliveryFeeText) || 0 } }),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not save the settings."),
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  const feeNumber = Number(deliveryFeeText) || 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        These details show on your website and control what customers pay for delivery.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          if (!form.alertEmail.includes("@")) {
            setError("Please enter a valid email address for new order alerts.");
            return;
          }
          save.mutate();
        }}
        className="mt-6 grid gap-6 lg:grid-cols-2"
      >
        <div className={cardBase}>
          <h2 className="text-sm font-bold">Store details</h2>
          <div className="mt-4 flex flex-col gap-5">
            <Field label="Store name" value={form.storeName} onChange={(v) => update("storeName", v)} />
            <Field
              label="Phone number"
              value={form.storePhone}
              onChange={(v) => update("storePhone", v)}
              placeholder="+234 803 000 0000"
            />
            <Field
              label="WhatsApp number"
              value={form.storeWhatsapp}
              onChange={(v) => update("storeWhatsapp", v)}
              placeholder="+234 803 000 0000"
            />
            <Field
              label="Public email"
              type="email"
              value={form.storeEmail}
              onChange={(v) => update("storeEmail", v)}
            />
            <div>
              <label className={labelBase} htmlFor="storeAddress">
                Address
              </label>
              <textarea
                id="storeAddress"
                rows={3}
                className={inputBase}
                value={form.storeAddress}
                onChange={(event) => update("storeAddress", event.target.value)}
              />
            </div>
            <div>
              <label className={labelBase} htmlFor="storeHours">
                Store hours
              </label>
              <textarea
                id="storeHours"
                rows={3}
                className={inputBase}
                value={form.storeHours}
                onChange={(event) => update("storeHours", event.target.value)}
                placeholder="Monday to Saturday, 8am - 6pm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Shown on your Contact page so customers know when you answer.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={cardBase}>
            <h2 className="text-sm font-bold">Money and delivery</h2>
            <div className="mt-4 flex flex-col gap-5">
              <div>
                <label className={labelBase} htmlFor="currency">
                  Currency
                </label>
                <select
                  id="currency"
                  className={inputBase}
                  value={form.currencyCode}
                  onChange={(event) => {
                    const choice = CURRENCIES.find((c) => c.code === event.target.value);
                    if (!choice) return;
                    setSaved(false);
                    setForm((current) => ({
                      ...current,
                      currencyCode: choice.code,
                      currencySymbol: choice.symbol,
                    }));
                  }}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelBase} htmlFor="deliveryFee">
                  Standard delivery charge
                </label>
                <input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className={inputBase}
                  value={deliveryFeeText}
                  onChange={(event) => {
                    setSaved(false);
                    setDeliveryFeeText(event.target.value);
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Customers pay {formatMoney(feeNumber, form.currencySymbol)} for delivery at
                  checkout. You can still record the real cost later on each order.
                </p>
              </div>
            </div>
          </div>

          <div className={cardBase}>
            <h2 className="text-sm font-bold">Order alerts</h2>
            <div className="mt-4">
              <Field
                label="Send new order alerts to"
                type="email"
                value={form.alertEmail}
                onChange={(v) => update("alertEmail", v)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className={cardBase}>
            {error ? (
              <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="mb-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
                Settings saved.
              </p>
            ) : null}
            <button type="submit" className={`${buttonPrimary} w-full`} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <label className={labelBase} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={inputBase}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
