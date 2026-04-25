import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Boxes, Dock, FileCode2 } from "lucide-react"
import Link from "next/link"

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/registry", label: "Registry" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 mb-8 pt-4">
      <div className="rounded-3xl border border-white/60 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Dock className="size-5" />
            </div>
            <div>
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Dockyard
              </Link>
              <p className="text-sm text-muted-foreground">
                Registry-driven building blocks for Dock
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition",
                  "hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Badge className="gap-1 rounded-full px-3 py-1 text-xs font-medium">
              <Boxes className="size-3.5" />
              Packages stay small
            </Badge>
            <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs font-medium">
              <FileCode2 className="size-3.5" />
              Registry ships source
            </Badge>
          </nav>
        </div>
      </div>
    </header>
  )
}
