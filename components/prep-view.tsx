"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { GEAR, SAFETY, sessionsFor, type CookSession } from "@/lib/plan"
import { formatWeekLabel, weekStartStamp } from "@/lib/dates"
import { useLocalSet, useLocalString } from "@/lib/storage"
import { useTodayStamp } from "@/lib/today"
import { cn } from "@/lib/utils"

export function PrepView() {
  const stamp = useTodayStamp()
  const week = weekStartStamp(stamp)
  const [mode, setMode] = useLocalString("plain-plate-prep-mode", "sunday")
  const prepMode = mode === "split" ? "split" : "sunday"
  const sessions = sessionsFor(prepMode)

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{formatWeekLabel(week)}</p>
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          Cook once. Eat seven times.
        </h1>
        <p className="text-base leading-7 text-pretty text-foreground/80">
          Sunday is the whole cook: chicken and rice, weighed into boxes. Potatoes, broccoli, oats, yogurt, and
          bananas stay uncooked until you eat them. Freeze Thursday through Sunday so nothing sits in the fridge past
          its date.
        </p>
      </div>

      <div className="grid max-w-xl grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <Button
          type="button"
          variant={prepMode === "sunday" ? "default" : "ghost"}
          className="h-10"
          aria-pressed={prepMode === "sunday"}
          onClick={() => setMode("sunday")}
        >
          One Sunday
        </Button>
        <Button
          type="button"
          variant={prepMode === "split" ? "default" : "ghost"}
          className="h-10"
          aria-pressed={prepMode === "split"}
          onClick={() => setMode("split")}
        >
          Twice a week
        </Button>
      </div>

      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        {prepMode === "sunday"
          ? "This is the low-time version. One hour-ish on Sunday, then reheating. Pick twice a week only if you don't want cooked food in the freezer."
          : "Cook Monday through Wednesday on Sunday, and Thursday through Sunday on Wednesday. Freeze the raw chicken you're saving — don't leave it in the fridge from Sunday to Wednesday."}
      </p>

      <div className="space-y-10">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} storageKey={`plain-plate-prep-${week}-${session.id}`} />
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <h2 className="font-heading text-xl tracking-tight">Food safety</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">
            {SAFETY.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-fat" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <h2 className="font-heading text-xl tracking-tight">What you need once</h2>
          <ul className="mt-3 space-y-3">
            {GEAR.map((item) => (
              <li key={item.name}>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-sm leading-6 text-muted-foreground">{item.why}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

function SessionCard({ session, storageKey }: { session: CookSession; storageKey: string }) {
  const checks = useLocalSet(storageKey)
  const done = checks.count === session.steps.length
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl tracking-tight">{session.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{session.dek}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {session.clock}
          <span className="block">{session.active}</span>
        </p>
      </div>
      <ol className="space-y-3">
        {session.steps.map((step, index) => {
          const checked = checks.selected.has(step.id)
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5",
                checked && "bg-protein/8"
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`${session.id}-${step.id}`}
                  checked={checked}
                  onCheckedChange={() => checks.toggle(step.id)}
                  className="mt-1 size-6"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label htmlFor={`${session.id}-${step.id}`} className="font-heading text-xl tracking-tight">
                      {index + 1}. {step.title}
                    </label>
                    <span className="text-xs text-muted-foreground">{step.minutes}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/80">{step.body}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {done ? (
        <p className="text-sm text-primary">
          {session.title} is done. The eating part is on Today.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {checks.count} of {session.steps.length} steps checked.
        </p>
      )}
    </section>
  )
}
