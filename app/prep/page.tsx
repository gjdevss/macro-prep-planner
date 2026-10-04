import type { Metadata } from "next"
import { PrepView } from "@/components/prep-view"

export const metadata: Metadata = {
  title: "Prep",
  description: "The Sunday cook for a week of high-protein, high-carb, low-fat meals.",
}

export default function Page() {
  return <PrepView />
}
