import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { SidebarProvider } from "../../components/SidebarContext";
import { AuthProvider } from "../../components/AuthProvider";
import MainContent from "./MainContent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-dvh overflow-hidden bg-[#EAE9F0]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#EAE9F0]">
            <Header />
            <MainContent>{children}</MainContent>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}