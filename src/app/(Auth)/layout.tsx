import Auth_Header from "../../components/Auth_Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#EAE9F0]">
      <div className="w-full flex flex-col px-5 sm:px-10 py-8 sm:py-12 relative overflow-hidden">
        <div className="relative z-10 flex-1 flex flex-col pb-20 lg:pb-0">
          <Auth_Header />
          <div className="flex-1 flex items-center justify-center py-10 sm:py-14">
            <div className="w-full max-w-[480px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
