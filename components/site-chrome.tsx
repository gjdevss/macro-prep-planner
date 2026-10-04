"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/prep", label: "Prep" },
  { href: "/shop", label: "Shop" },
]

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-6 px-4 py-4 md:px-6">
        <Link href="/" className="min-w-0">
          <span className="block font-heading text-[1.7rem] leading-none tracking-tight text-foreground">
            Plain Plate
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            2,500 calories · high protein · high carb · low fat
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(pathname, link.href) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur md:hidden"
      aria-label="Sections"
    >
      <ul className="mx-auto grid max-w-5xl grid-cols-3 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground",
                  active && "text-primary"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
