"use client";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 min-h-0 min-w-0 flex flex-col bg-[#EAE9F0] p-5 sm:p-8 lg:p-10 overflow-y-auto">
      {children}
    </main>
  );
}
