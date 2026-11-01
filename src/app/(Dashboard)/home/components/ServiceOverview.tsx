"use client";

import {
  ServiceOverviewDesignIcon,
  ServiceOverviewUUxIcon,
  ServiceOverviewWebIcon,
} from "@/public/svg/svg";

const OVERVIEW_CARDS = [
  {
    title: "Design & Branding",
    Icon: ServiceOverviewDesignIcon,
  },
  {
    title: "UI/UX Design",
    Icon: ServiceOverviewUUxIcon,
  },
  {
    title: "Web Development",
    Icon: ServiceOverviewWebIcon,
  },
] as const;

export default function ServiceOverview({
  services,
}: {
  services: { title: string; count: number }[];
}) {
  const counts = new Map(
    services.map((service) => [service.title, service.count]),
  );

  return (
    <div className="bg-white p-7 sm:p-8 rounded-xl border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-8">
        Service Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OVERVIEW_CARDS.map(({ title, Icon }) => {
          const count = counts.get(title) ?? 0;
          return (
            <div
              key={title}
              className="border border-gray-100 rounded-xl p-5 flex flex-col min-h-[160px] sm:min-h-[180px]"
            >
              <div className="mb-auto">
                <Icon size={48} />
              </div>
              <div className="pt-4">
                <p className="text-xs text-gray-600 mb-1 leading-snug">
                  {title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {String(count).padStart(2, "0")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
