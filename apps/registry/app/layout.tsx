import { ThemeProvider } from "@/components/providers/theme-provider"
import { SiteShell } from "@/components/site/site-shell"
import { getRegistryCategories } from "@/lib/registry"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Dockyard",
  description: "Registry-driven Dock ecosystem scaffold",
}

const themeInitScript = `
try {
  const storageKey = "theme";
  const storedTheme = localStorage.getItem(storageKey);
  const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
    ? storedTheme
    : "system";
  const resolvedTheme = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
} catch {}
`

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const categories = await getRegistryCategories()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteShell categories={categories}>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
