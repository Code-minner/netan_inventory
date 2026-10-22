"use client";

export default function ServiceOverview({
  services,
}: {
  services: { title: string; count: number }[];
}) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-lg border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-8">
        Service Overview
      </h2>

      {services.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">
          Services appear after clients complete their forms.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((service) => (
            <div
              key={service.title}
              className="border border-gray-100 rounded-lg p-5 flex flex-col justify-end sm:aspect-square min-h-[120px]"
            >
              <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                {service.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {service.count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
