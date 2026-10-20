"use client";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 min-h-0 min-w-0 flex flex-col bg-[#EAE9F0] p-6 sm:p-10 lg:p-12 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto">{children}</div>
    </main>
  );
}
