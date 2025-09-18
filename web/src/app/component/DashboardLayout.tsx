// app/components/DashboardLayout.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState, createContext, useContext } from "react";
import {
  ChevronFirst,
  ChevronLast,
  LayoutDashboard,
  Globe,
  Megaphone,
  Wallet,
  LogOut,
  MoreVertical,
} from "lucide-react";

// Create a context for the sidebar state
const SidebarContext = createContext({ expanded: true });

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  // Your authentication logic (currently disabled for testing)
  useEffect(() => {
    if (!loading && !user) {
      // router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-900">
      {/* --- SIDEBAR --- */}
      

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-800 bg-slate-950 p-4">
          {/* You can add a page title or search bar here */}
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

// Custom NavItem component for cleaner code
function NavItem({ icon, text, href }: { icon: ReactNode; text: string; href: string }) {
  const { expanded } = useContext(SidebarContext);
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li
      className={`
        group relative flex items-center rounded-md px-3 py-2 font-medium
        cursor-pointer transition-colors
        ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }
      `}
    >
      <a href={href} className="flex w-full items-center">
        {icon}
        <span
          className={`
            overflow-hidden transition-all
            ${expanded ? "ml-3 w-full" : "w-0"}
          `}
        >
          {text}
        </span>
      </a>

      {/* Tooltip for collapsed sidebar */}
      {!expanded && (
        <div
          className={`
            invisible absolute left-full ml-6 -translate-x-3 rounded-md
            bg-indigo-600 px-2 py-1 text-sm text-white opacity-0
            transition-all group-hover:visible group-hover:translate-x-0 group-hover:opacity-100
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}