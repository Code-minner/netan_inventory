"use client";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 min-h-0 min-w-0 flex flex-col bg-[#EAE9F0] py-6 sm:py-10 lg:py-12 overflow-y-auto px-6">
      <div className="w-full max-w-[1800px] mx-auto">{children}</div>
    </main>
  );
}
