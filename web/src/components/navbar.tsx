"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";

const navItems = [
  {
    label: "Dashboard",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/features" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
    ],
  },
];

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-gray-950 border-b border-gray-800">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          credx
        </Link>
      </div>
      {/* Center: Dropdowns */}
      <div className="flex-1 flex justify-center gap-8">
        {navItems.map((item, idx) => (
          <DropdownMenu key={item.label} open={hoveredIndex === idx}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white text-base font-medium px-4 py-2 hover:bg-gray-900 focus:bg-gray-900"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-gray-900 border-gray-800"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="w-full block px-2 py-1 text-gray-200 hover:text-white hover:bg-gray-800 rounded"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
      {/* Right: Profile Avatar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            resolvedTheme === "dark" ? setTheme("light") : setTheme("dark");
          }}
        >
          {mounted ? resolvedTheme === "dark" ? <Sun /> : <Moon /> : null}
        </Button>

        {user === null ? (
          <div>
            <Link href="/login">
              <Button variant="ghost" className="text-white">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Sign Up
              </Button>
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border border-gray-700">
                <AvatarImage src="/avatar.png" alt="profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800 min-w-[160px]">
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="block px-2 py-1 text-gray-200 hover:text-white hover:bg-gray-800 rounded"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="block px-2 py-1 text-gray-200 hover:text-white hover:bg-gray-800 rounded"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/logout"
                  className="block px-2 py-1 text-red-400 hover:text-red-600 hover:bg-gray-800 rounded"
                >
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
