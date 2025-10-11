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
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Dashboard",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "#" },
      { label: "Features", href: "#" },
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
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-sidebar border-b border-sidebar-border">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-xl font-bold text-sidebar-foreground tracking-tight"
        >
          CREDX
        </Link>
      </div>
      {/* Center: Dropdowns */}
      <div className="flex-1 flex justify-center gap-8">
        {navItems.map((item, idx) => (
          <DropdownMenu key={item.label} open={hoveredIndex === idx}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sidebar-foreground text-base font-medium px-4 py-2 hover:bg-sidebar-accent focus:bg-sidebar-accent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-sidebar border-sidebar-border"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.links.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link
                    href={link.href}
                    className="w-full block px-2 py-1 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded"
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join Now
              </Button>
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border border-sidebar-border">
                <AvatarImage src="/avatar.png" alt="profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-sidebar border-sidebar-border min-w-[160px]">
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="block px-2 py-1 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="block px-2 py-1 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/logout"
                  className="block px-2 py-1 text-destructive hover:text-destructive hover:bg-destructive/10 rounded"
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
