import type { Metadata } from "next"
import { ShopView } from "@/components/shop-view"

export const metadata: Metadata = {
  title: "Shop",
  description: "The weekly grocery list for Plain Plate: chicken, rice, yogurt, oats, potatoes, bananas, broccoli, olive oil.",
}

export default function Page() {
  return <ShopView />
}
