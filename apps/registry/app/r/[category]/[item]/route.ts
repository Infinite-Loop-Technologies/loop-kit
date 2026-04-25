import { getRegistryItemManifest } from "@/lib/registry"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string; item: string }> }
) {
  const { category, item } = await params
  return NextResponse.json(await getRegistryItemManifest(category, item))
}
