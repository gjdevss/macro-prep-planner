import type { Metadata } from "next"
import { TodayView } from "@/components/today-view"

export const metadata: Metadata = {
  title: "Today",
  description:
    "Four plates a day for a 2,500 calorie high-protein, high-carb, low-fat cut. Weigh, reheat, eat.",
}

export default function Page() {
  return <TodayView />
}
