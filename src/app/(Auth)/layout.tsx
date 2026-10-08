import Auth_Header from "../../components/Auth_Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#EAE9F0]">
      <div className="w-full lg:w-[100%] flex flex-col px-4 sm:px-8 py-6 sm:py-8 relative overflow-hidden">
        <div className="relative z-10 flex-1 flex flex-col pb-28 lg:pb-0">
          <Auth_Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[500px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
