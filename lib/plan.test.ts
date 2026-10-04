import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  DAYS,
  FOODS,
  MEALS,
  TARGET_KCAL,
  dayTotals,
  formatSpoons,
  gramsOf,
  intakeFit,
  mealMacros,
  roundedPlate,
  sessionsFor,
  shopListText,
  spiceForRawChicken,
  weekMath,
  weeklyShop,
} from "./plan.ts"

describe("the plate", () => {
  it("lands on the 2,500 calorie high-protein high-carb low-fat cut", () => {
    const totals = dayTotals()
    assert.ok(totals.kcal >= 2490 && totals.kcal <= 2520, `kcal ${totals.kcal}`)
    assert.ok(totals.protein >= 200 && totals.protein <= 215, `protein ${totals.protein}`)
    assert.ok(totals.carb >= 300 && totals.carb <= 340, `carb ${totals.carb}`)
    assert.ok(totals.fat >= 45 && totals.fat <= 52, `fat ${totals.fat}`)
    assert.ok(totals.fiber >= 30, `fiber ${totals.fiber}`)

    const proteinKcal = (totals.protein * 4) / totals.kcal
    const carbKcal = (totals.carb * 4) / totals.kcal
    const fatKcal = (totals.fat * 9) / totals.kcal
    assert.ok(proteinKcal > 0.3 && proteinKcal < 0.38)
    assert.ok(carbKcal > 0.48)
    assert.ok(fatKcal < 0.2)
    assert.equal(TARGET_KCAL, 2500)
    assert.equal(roundedPlate().kcal, Math.round(totals.kcal))
  })

  it("uses the same cooked chicken portion at lunch and dinner", () => {
    const lunch = MEALS.find((meal) => meal.id === "lunch")
    const dinner = MEALS.find((meal) => meal.id === "dinner")
    assert.ok(lunch && dinner)
    const lunchChicken = lunch.ingredients.find((item) => item.foodId === "chicken")
    const dinnerChicken = dinner.ingredients.find((item) => item.foodId === "chicken")
    assert.equal(lunchChicken?.grams, 180)
    assert.equal(dinnerChicken?.grams, 180)
    assert.equal(gramsOf("oil"), 24)
    assert.equal(MEALS.length, 4)
    assert.equal(Object.keys(FOODS).length, 8)
  })

  it("sums meals to the day", () => {
    const fromMeals = MEALS.map((meal) => mealMacros(meal)).reduce(
      (sum, macros) => ({
        kcal: sum.kcal + macros.kcal,
        protein: sum.protein + macros.protein,
        carb: sum.carb + macros.carb,
        fat: sum.fat + macros.fat,
        fiber: sum.fiber + macros.fiber,
      }),
      { kcal: 0, protein: 0, carb: 0, fat: 0, fiber: 0 }
    )
    assert.deepEqual(fromMeals, dayTotals())
  })
})

describe("the week", () => {
  it("converts plate grams into shop amounts", () => {
    const week = weekMath()
    assert.equal(week.cookedChickenG, 180 * 2 * DAYS)
    assert.equal(week.rawChickenG, 3360)
    assert.equal(week.dryRiceG, 700)
    assert.equal(week.oatsG, 560)
    assert.equal(week.yogurtG, 3850)
    assert.equal(week.bananaG, 1820)
    assert.equal(week.broccoliG, 2100)
    assert.equal(week.oilG, 168)
    assert.ok(Math.abs(week.oilMl - 185) < 2)
  })

  it("lists every food once, in shop order", () => {
    const items = weeklyShop()
    assert.deepEqual(
      items.map((item) => item.id),
      ["chicken", "yogurt", "rice", "oats", "potato", "banana", "broccoli", "oil", "spices"]
    )
    assert.match(items[0].amount, /3\.36 kg/)
    assert.match(items[2].amount, /700 g/)
    assert.match(shopListText(items), /Plain Plate — one week/)
  })
})

describe("prep", () => {
  it("formats the full-week spice mix in tablespoons", () => {
    assert.equal(formatSpoons(12), "4 tablespoons")
    assert.equal(formatSpoons(6), "2 tablespoons")
    assert.equal(formatSpoons(2), "2 teaspoons")
    assert.equal(formatSpoons(0.5), "1/2 teaspoon")
    assert.equal(formatSpoons(3.5), "1 tablespoon plus 1/2 teaspoon")
    const spice = spiceForRawChicken(3360)
    assert.equal(spice.salt, "4 tablespoons")
    assert.equal(spice.garlic, "2 tablespoons")
  })

  it("writes one Sunday session that cooks the whole week", () => {
    const sessions = sessionsFor("sunday")
    assert.equal(sessions.length, 1)
    const text = sessions[0].steps.map((step) => step.body).join(" ")
    assert.match(text, /700 g of dry rice/)
    assert.match(text, /1,050 g of water/)
    assert.match(text, /3\.36 kg/)
    assert.match(text, /4 tablespoons of kosher salt/)
    assert.match(text, /freezer/)
    assert.equal(new Set(sessions[0].steps.map((step) => step.id)).size, sessions[0].steps.length)
  })

  it("splits the week without leaving raw chicken in the fridge for three days", () => {
    const sessions = sessionsFor("split")
    assert.deepEqual(
      sessions.map((session) => session.id),
      ["sunday-half", "tuesday-thaw", "wednesday-half"]
    )
    const sunday = sessions[0].steps.map((step) => step.body).join(" ")
    const wednesday = sessions[2].steps.map((step) => step.body).join(" ")
    assert.match(sunday, /300 g of dry rice/)
    assert.match(wednesday, /400 g of dry rice/)
    assert.match(sunday, /freezer/)
    const ids = sessions.flatMap((session) => session.steps.map((step) => step.id))
    assert.equal(new Set(ids).size, ids.length)
  })
})

describe("body weight", () => {
  it("accepts a typical lifting cut and flags a low fat intake for a heavier person", () => {
    const typical = intakeFit(90)
    assert.ok(typical.proteinPerKg > 2)
    assert.ok(typical.fatPerKg >= 0.5)
    assert.match(typical.notes[0], /protein per kg/)

    const heavier = intakeFit(110)
    assert.ok(heavier.notes.some((note) => note.includes("olive oil")))
  })
})
