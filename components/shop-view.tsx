"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { shopListText, weeklyShop, type ShopSection } from "@/lib/plan"
import { formatWeekLabel, weekStartStamp } from "@/lib/dates"
import { useLocalSet } from "@/lib/storage"
import { useTodayStamp } from "@/lib/today"
import { cn } from "@/lib/utils"

const SECTIONS: ShopSection[] = ["Proteins", "Carbs", "Produce", "Pantry"]

export function ShopView() {
  const stamp = useTodayStamp()
  const week = weekStartStamp(stamp)
  const items = weeklyShop()
  const cart = useLocalSet(week ? `plain-plate-shop-${week}` : "plain-plate-shop")
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")
  const pct = items.length === 0 ? 0 : (cart.count / items.length) * 100

  async function copyList() {
    try {
      await navigator.clipboard.writeText(shopListText(items))
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{formatWeekLabel(week)}</p>
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          One bag. Eight foods.
        </h1>
        <p className="text-base leading-7 text-pretty text-foreground/80">
          Buy this once. It is every meal until next week. In the US it often lands around $60–80, and chicken plus
          Greek yogurt are most of that. Sale chicken moves the number more than anything else.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Progress value={pct} className="w-full max-w-md flex-col gap-2">
          <div className="flex w-full items-baseline justify-between gap-3">
            <ProgressLabel>In the cart</ProgressLabel>
            <ProgressValue>{() => `${cart.count} of ${items.length}`}</ProgressValue>
          </div>
        </Progress>
        <div className="flex items-center gap-3">
          <Button type="button" className="h-10 px-4" onClick={copyList}>
            {copyState === "copied" ? "Copied" : "Copy list"}
          </Button>
          {cart.count > 0 ? (
            <Button type="button" variant="ghost" className="h-10" onClick={cart.clear}>
              Clear checks
            </Button>
          ) : null}
        </div>
      </div>
      {copyState === "failed" ? (
        <p className="text-sm text-destructive" role="alert">
          Clipboard blocked. Select the amounts on this page and copy them by hand.
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Shopping list copied." : ""}
      </p>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section} className="space-y-3">
            <h2 className="font-heading text-2xl tracking-tight">{section}</h2>
            <ul className="space-y-3">
              {items
                .filter((item) => item.section === section)
                .map((item) => {
                  const checked = cart.selected.has(item.id)
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-xl bg-card p-4 ring-1 ring-foreground/10",
                        checked && "bg-protein/8"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`shop-${item.id}`}
                          checked={checked}
                          onCheckedChange={() => cart.toggle(item.id)}
                          className="mt-1 size-6"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <label htmlFor={`shop-${item.id}`} className="font-medium">
                              {item.name}
                            </label>
                            <span className="font-heading text-lg tabular-nums tracking-tight">{item.amount}</span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.note}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
