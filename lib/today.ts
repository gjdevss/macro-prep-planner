"use client"

import { useSyncExternalStore } from "react"
import { localDateStamp } from "@/lib/dates"

export function useTodayStamp() {
  return useSyncExternalStore(
    (listener) => {
      const id = window.setInterval(listener, 60_000)
      const onVisible = () => listener()
      document.addEventListener("visibilitychange", onVisible)
      return () => {
        window.clearInterval(id)
        document.removeEventListener("visibilitychange", onVisible)
      }
    },
    () => localDateStamp(new Date()),
    () => ""
  )
}
