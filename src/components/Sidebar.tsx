"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import {
  CloseIcon,
  DashboardIcon,
  PaymentsIcon,
  ReportsIcon,
  TeamIcon,
  CustomersIcon,
  SettingsIcon,
  LogoutIcon,
} from "../../public/svg/svg";

const navItems = [
  { icon: DashboardIcon, label: "Dashboard", href: "/home" },
  { icon: CustomersIcon, label: "Clients", href: "/clients" },
  { icon: PaymentsIcon, label: "Payments", href: "/payments" },
  { icon: ReportsIcon, label: "Reports", href: "/reports" },
  { icon: TeamIcon, label: "Team", href: "/team" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-[19rem] max-w-[85vw] h-dvh min-h-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <Image
            src="/assets/logo.png"
            alt="Netan Logo"
            width={70}
            height={35}
            priority
          />
          <button onClick={close} className="lg:hidden text-black">
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${
                    isActive
                      ? "bg-[#2D266C]/30 text-[#2D266C]"
                      : "text-[#757575] hover:bg-[#2D266C]/10 hover:text-gray-900"
                  }
                `}
              >
                <item.icon
                  size={20}
                  filled={isActive}
                  className={isActive ? "text-[#2D266C]" : "text-[#757575]"}
                />
                <span className={`font-medium ${isActive ? "text-[#2D266C]" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#757575] hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogoutIcon size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
