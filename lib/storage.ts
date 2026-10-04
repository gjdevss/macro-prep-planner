"use client"

import { useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = () => listener()
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private browsing can block storage. The page still works for the session.
  }
  emit()
}

export function useLocalString(key: string, fallback = "") {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback
  )
  const set = (next: string) => write(key, next)
  return [value, set] as const
}

export function useLocalSet(key: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key) ?? "[]",
    () => "[]"
  )
  let ids: string[] = []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      ids = parsed
    }
  } catch {
    ids = []
  }
  const selected = new Set(ids)
  const toggle = (id: string) => {
    const next = new Set(ids)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    write(key, JSON.stringify([...next].sort()))
  }
  const clear = () => write(key, "[]")
  return { selected, toggle, clear, count: selected.size }
}
