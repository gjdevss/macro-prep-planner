"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import {
  FOODS,
  MEALS,
  RULES,
  SOURCES,
  STALL,
  TARGET_KCAL,
  addMacros,
  answerParagraph,
  dayTotals,
  intakeFit,
  mealMacros,
  roundedPlate,
  type Macros,
} from "@/lib/plan"
import { formatLongDate, weekdayIndex } from "@/lib/dates"
import { useLocalSet, useLocalString } from "@/lib/storage"
import { useTodayStamp } from "@/lib/today"
import { cn } from "@/lib/utils"

const numberFormat = new Intl.NumberFormat("en-US")

function formatKcal(value: number) {
  return numberFormat.format(Math.round(value))
}

export function TodayView() {
  const stamp = useTodayStamp()
  const eaten = useLocalSet(stamp ? `plain-plate-eaten-${stamp}` : "plain-plate-eaten")
  const thaw = useLocalSet(stamp ? `plain-plate-thaw-${stamp}` : "plain-plate-thaw")
  const [mode] = useLocalString("plain-plate-prep-mode", "sunday")
  const plate = dayTotals()
  const rounded = roundedPlate()
  const eatenMacros = MEALS.filter((meal) => eaten.selected.has(meal.id)).reduce(
    (sum, meal) => addMacros(sum, mealMacros(meal)),
    { kcal: 0, protein: 0, carb: 0, fat: 0, fiber: 0 }
  )
  const eatenPct = plate.kcal === 0 ? 0 : Math.min(100, (eatenMacros.kcal / plate.kcal) * 100)
  const weekday = weekdayIndex(stamp)
  const prepMode = mode === "split" ? "split" : "sunday"

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{formatLongDate(stamp)}</p>
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          Same four plates. Eat, then get on with the day.
        </h1>
        <p className="text-base leading-7 text-pretty text-foreground/80">{answerParagraph()}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          The cooking is on the{" "}
          <Link href="/prep" className="font-medium text-primary underline-offset-4 hover:underline">
            Prep
          </Link>{" "}
          page. The grocery list is on{" "}
          <Link href="/shop" className="font-medium text-primary underline-offset-4 hover:underline">
            Shop
          </Link>
          . Most days the kitchen is a scale and a microwave, about 15 minutes, and the microwave is doing the waiting.
        </p>
      </div>

      <DayBanner
        weekday={weekday}
        mode={prepMode}
        thawed={thaw.selected.has("moved")}
        onThaw={() => thaw.toggle("moved")}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="order-2 space-y-4 lg:order-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-2xl tracking-tight">The plates</h2>
            <p className="text-sm text-muted-foreground">Any order. The day is the sum.</p>
          </div>
          {MEALS.map((meal, index) => (
            <MealCard
              key={meal.id}
              index={index}
              meal={meal}
              eaten={eaten.selected.has(meal.id)}
              onToggle={() => eaten.toggle(meal.id)}
            />
          ))}
        </div>

        <aside className="order-1 space-y-4 lg:sticky lg:top-4 lg:order-2">
          <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Eaten today</p>
                <p className="font-heading text-5xl leading-none tracking-tight tabular-nums">
                  {formatKcal(eatenMacros.kcal)}
                </p>
              </div>
              <p className="pb-1 text-right text-sm text-muted-foreground tabular-nums">
                of {formatKcal(plate.kcal)}
                <span className="block">{eaten.count} of {MEALS.length} plates</span>
              </p>
            </div>
            <Progress value={eatenPct} className="mt-4 w-full flex-col gap-2">
              <ProgressLabel className="sr-only">Calories eaten today</ProgressLabel>
            </Progress>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MacroStat label="Protein" eaten={eatenMacros.protein} total={plate.protein} tone="text-protein" />
              <MacroStat label="Carbs" eaten={eatenMacros.carb} total={plate.carb} tone="text-carb" />
              <MacroStat label="Fat" eaten={eatenMacros.fat} total={plate.fat} tone="text-fat" />
            </dl>
            <CalorieBar macros={plate} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {rounded.kcal - TARGET_KCAL === 0
                ? `On the ${formatKcal(TARGET_KCAL)} target.`
                : `${formatKcal(Math.abs(rounded.kcal - TARGET_KCAL))} kcal ${rounded.kcal > TARGET_KCAL ? "over" : "under"} the ${formatKcal(TARGET_KCAL)} target.`}{" "}
              {rounded.fiber} g of fiber from the oats, potatoes, broccoli, and bananas.
            </p>
            {eaten.count > 0 ? (
              <Button variant="ghost" className="mt-2 px-0" onClick={eaten.clear}>
                Clear today
              </Button>
            ) : null}
          </section>
          <WeightCard />
        </aside>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {RULES.map((rule) => (
          <article key={rule.title} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="font-heading text-lg tracking-tight">{rule.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{rule.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-dashed border-border bg-card/60 p-4 sm:p-5">
        <h2 className="font-heading text-xl tracking-tight">{STALL.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{STALL.body}</p>
      </section>

      <footer className="max-w-3xl space-y-2 text-xs leading-5 text-muted-foreground">
        <p>
          Plate numbers are USDA FoodData Central values for ready-to-eat food, summed from the grams above.
          Each plate&apos;s calories are rounded, so the four numbers can add to a calorie or two off the 2,506 total.
          They are not a hand total of 4 × protein + 4 × carbs + 9 × fat, which runs a few calories higher.
          Broccoli is weighed frozen and counted with cooked values. The gap is small next to the rest of the day.
        </p>
        <p>
          Nonfat Greek yogurt uses USDA&apos;s 59 kcal and 10 g protein per 100 g. A tub like Fage 0% is closer
          to 53 kcal. If that&apos;s yours, the day is about 30 calories lower. Leave it.
        </p>
        <p>Sources: {SOURCES.join("; ")}.</p>
        <p>
          This is a meal plan, not medical advice. If you have a medical condition or a history of disordered
          eating, talk with a clinician before running fat this low.
        </p>
      </footer>
    </div>
  )
}

function DayBanner({
  weekday,
  mode,
  thawed,
  onThaw,
}: {
  weekday: number | null
  mode: "sunday" | "split"
  thawed: boolean
  onThaw: () => void
}) {
  if (weekday === null) return null
  const cookDay = mode === "sunday" ? weekday === 0 : weekday === 0 || weekday === 3
  const thawCooked = mode === "sunday" && weekday >= 3 && weekday <= 6
  const thawRaw = mode === "split" && weekday === 2

  if (!cookDay && !thawCooked && !thawRaw) return null

  return (
    <div className="rounded-xl bg-primary px-4 py-3 text-primary-foreground sm:px-5">
      {cookDay ? (
        <p className="text-sm leading-6">
          Today is a cook day.{" "}
          <Link href="/prep" className="font-medium underline underline-offset-4">
            Open the Sunday steps
          </Link>
          {mode === "split" && weekday === 3 ? " — use the Wednesday session." : "."}
        </p>
      ) : null}
      {thawCooked || thawRaw ? (
        <div className="flex items-start gap-3">
          <Checkbox
            id="thaw-tomorrow"
            checked={thawed}
            onCheckedChange={onThaw}
            className="mt-0.5 size-5 border-primary-foreground/40 data-checked:bg-primary-foreground data-checked:text-primary"
            aria-label="Tomorrow's food is thawing in the fridge"
          />
          <label htmlFor="thaw-tomorrow" className="text-sm leading-6">
            {thawRaw
              ? "Move the frozen raw chicken to the fridge so Wednesday's cook can start on time."
              : "Move tomorrow's lunch and dinner from the freezer to the fridge."}
          </label>
        </div>
      ) : null}
    </div>
  )
}

function MealCard({
  index,
  meal,
  eaten,
  onToggle,
}: {
  index: number
  meal: (typeof MEALS)[number]
  eaten: boolean
  onToggle: () => void
}) {
  const macros = mealMacros(meal)
  return (
    <article
      data-eaten={eaten ? "true" : "false"}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 data-[eaten=true]:bg-protein/8 sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-sm text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-heading text-2xl tracking-tight">{meal.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{meal.lede}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl tabular-nums tracking-tight">{formatKcal(macros.kcal)}</p>
          <p className="text-xs text-muted-foreground">{meal.minutes} min</p>
        </div>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium tabular-nums">
        <span className="text-protein">{Math.round(macros.protein)}g protein</span>
        <span className="text-carb">{Math.round(macros.carb)}g carb</span>
        <span className="text-fat">{Math.round(macros.fat)}g fat</span>
      </p>
      <ul className="mt-4 divide-y divide-border">
        {meal.ingredients.map((ingredient) => (
          <li key={`${meal.id}-${ingredient.foodId}`} className="flex items-baseline justify-between gap-4 py-2">
            <span className="text-sm">{FOODS[ingredient.foodId].name}</span>
            <span className="font-heading text-lg tabular-nums tracking-tight">{ingredient.grams} g</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-6 text-foreground/80">{meal.steps}</p>
      <div className="mt-4 flex items-center gap-3">
        <Checkbox
          id={`${meal.id}-eaten`}
          checked={eaten}
          onCheckedChange={onToggle}
          className="size-6"
        />
        <label htmlFor={`${meal.id}-eaten`} className="text-sm font-medium">
          {eaten ? "Eaten" : "Mark eaten"}
        </label>
      </div>
    </article>
  )
}

function MacroStat({
  label,
  eaten,
  total,
  tone,
}: {
  label: string
  eaten: number
  total: number
  tone: string
}) {
  return (
    <div className="rounded-lg bg-muted/70 px-2 py-2">
      <dt className={cn("text-xs font-medium", tone)}>{label}</dt>
      <dd className="mt-1 text-sm tabular-nums">
        {Math.round(eaten)}
        <span className="text-muted-foreground">/{Math.round(total)}g</span>
      </dd>
    </div>
  )
}

function CalorieBar({ macros }: { macros: Macros }) {
  const protein = macros.protein * 4
  const carb = macros.carb * 4
  const fat = macros.fat * 9
  const total = protein + carb + fat
  return (
    <div className="mt-4">
      <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
        <div className="bg-protein" style={{ width: `${(protein / total) * 100}%` }} />
        <div className="bg-carb" style={{ width: `${(carb / total) * 100}%` }} />
        <div className="bg-fat" style={{ width: `${(fat / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        The bar is calories, not grams. Protein and carbs are most of the plate. Fat is {Math.round(macros.fat)} g
        and still about {Math.round((fat / total) * 100)}% of the calories.
      </p>
    </div>
  )
}

function WeightCard() {
  const [unit, setUnit] = useLocalString("plain-plate-unit", "lb")
  const [amount, setAmount] = useLocalString("plain-plate-weight", "")
  const shownUnit = unit === "kg" ? "kg" : "lb"
  const parsed = Number.parseFloat(amount)
  const kg = shownUnit === "lb" ? parsed / 2.2046226218 : parsed
  const valid = Number.isFinite(kg) && kg >= 35 && kg <= 250
  const started = amount.trim().length > 0
  const fit = valid ? intakeFit(kg) : null

  function switchUnit(option: "lb" | "kg") {
    if (option === shownUnit) return
    if (Number.isFinite(parsed)) {
      const converted = option === "kg" ? parsed / 2.2046226218 : parsed * 2.2046226218
      setAmount(String(Math.round(converted * 10) / 10))
    }
    setUnit(option)
  }

  return (
    <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="font-heading text-lg tracking-tight">Your weight</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        The plate stays the same. This only checks protein and fat per kilo, which is what matters on a lifting cut.
      </p>
      <div className="mt-3 flex gap-2">
        <Input
          inputMode="decimal"
          value={amount}
          placeholder={shownUnit === "lb" ? "185" : "84"}
          aria-label={`Body weight in ${shownUnit}`}
          onChange={(event) => setAmount(event.target.value)}
          className="h-10"
        />
        <div className="grid grid-cols-2 rounded-lg bg-muted p-0.5">
          {(["lb", "kg"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={shownUnit === option ? "default" : "ghost"}
              className="h-9 px-3"
              aria-pressed={shownUnit === option}
              onClick={() => switchUnit(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      {started && !valid ? (
        <p className="mt-3 text-sm leading-6 text-destructive" role="alert">
          Enter a weight between {shownUnit === "lb" ? "80 and 550 lb" : "35 and 250 kg"}.
        </p>
      ) : null}
      {!started ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add a weight to see whether {roundedPlate().fat} g of fat is enough for you. Under about 0.5 g per kg, the note tells you how many extra teaspoons to pour.
        </p>
      ) : null}
      {fit ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm tabular-nums">
            <span className="text-protein">{fit.proteinPerKg.toFixed(1)} g/kg protein</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-fat">{fit.fatPerKg.toFixed(2)} g/kg fat</span>
          </p>
          {fit.notes.map((note) => (
            <p key={note} className="text-sm leading-6 text-foreground/80">
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  )
}
