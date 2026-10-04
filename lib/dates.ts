export function localDateStamp(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function weekStartStamp(stamp: string): string {
  if (!stamp) return ""
  const [year, month, day] = stamp.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - date.getDay())
  return localDateStamp(date)
}

export function formatLongDate(stamp: string): string {
  if (!stamp) return "Today"
  const [year, month, day] = stamp.split("-").map(Number)
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day))
}

export function formatWeekLabel(stamp: string): string {
  if (!stamp) return "This week"
  const [year, month, day] = stamp.split("-").map(Number)
  const formatted = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day))
  return `Week of ${formatted}`
}

export function weekdayIndex(stamp: string): number | null {
  if (!stamp) return null
  const [year, month, day] = stamp.split("-").map(Number)
  return new Date(year, month - 1, day).getDay()
}
