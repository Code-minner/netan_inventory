export type CatalogService = {
  id: string;
  title: string;
  price: number;
};

/** Priced services shown on the client onboarding form. */
export const SERVICE_CATALOG: CatalogService[] = [
  { id: "uiux", title: "UI/UX Design", price: 500_000 },
  { id: "cloud", title: "Cloud Services & Solutions", price: 2_500_000 },
  { id: "web", title: "Website Development", price: 1_500_000 },
  { id: "brand", title: "Brand Identity", price: 750_000 },
  { id: "mobile", title: "Mobile App Development", price: 3_000_000 },
  { id: "seo", title: "SEO & Digital Marketing", price: 400_000 },
];

/** Fixed home dashboard Service Overview cards (matches product UI). */
export const SERVICE_OVERVIEW_BUCKETS = [
  {
    title: "Design & Branding",
    catalogIds: ["brand", "seo"] as const,
  },
  {
    title: "UI/UX Design",
    catalogIds: ["uiux"] as const,
  },
  {
    title: "Web Development",
    catalogIds: ["web", "cloud", "mobile"] as const,
  },
] as const;

export type PaymentPercent = 50 | 80 | 100;

export function getServicesByIds(ids: string[]) {
  const set = new Set(ids);
  return SERVICE_CATALOG.filter((s) => set.has(s.id));
}

export function sumServicePrices(services: CatalogService[]) {
  return services.reduce((total, s) => total + s.price, 0);
}

export function amountForPercent(total: number, percent: PaymentPercent) {
  return Math.round((total * percent) / 100);
}
