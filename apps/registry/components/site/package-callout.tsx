import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const points = [
  "Packages are stable reusable APIs.",
  "Registry items are installable and editable source code.",
  "common-react and interaction-react stay adapter-only.",
  "dock is headless.",
  "dock-react is thin.",
  "Runtimes own lifecycle and policies.",
]

export function PackageCallout() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Boundary callout</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
