import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SourceCodeBlock({
  title,
  code,
  language = "tsx",
}: {
  title: string
  code: string
  language?: string
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-slate-950 text-slate-100 shadow-sm">
      <CardHeader className="border-b border-slate-800 bg-slate-900/90 py-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-200">
          <span>{title}</span>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs uppercase text-slate-400">
            {language}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="overflow-x-auto p-4 text-sm leading-6">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
