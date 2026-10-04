export type Macros = {
  kcal: number
  protein: number
  carb: number
  fat: number
  fiber: number
}

export type Food = {
  id: string
  name: string
  per100g: Macros
  source: string
}

export type Ingredient = {
  foodId: string
  grams: number
}

export type Meal = {
  id: string
  name: string
  minutes: number
  lede: string
  steps: string
  ingredients: Ingredient[]
}

export type ShopSection = "Proteins" | "Carbs" | "Produce" | "Pantry"

export type ShopItem = {
  id: string
  section: ShopSection
  name: string
  amount: string
  note: string
}

export type PrepStep = {
  id: string
  minutes: string
  title: string
  body: string
}

export type CookSession = {
  id: string
  title: string
  dek: string
  clock: string
  active: string
  steps: PrepStep[]
}

export type SpiceMix = {
  salt: string
  pepper: string
  garlic: string
  onion: string
  paprika: string
}

const ZERO: Macros = { kcal: 0, protein: 0, carb: 0, fat: 0, fiber: 0 }

/** USDA FoodData Central, per 100 g. Ready-to-eat weights unless noted. */
export const FOODS: Record<string, Food> = {
  oats: {
    id: "oats",
    name: "Rolled oats, dry",
    per100g: { kcal: 379, protein: 13.15, carb: 67.7, fat: 6.52, fiber: 10.6 },
    source: "Oats, regular and quick, dry",
  },
  yogurt: {
    id: "yogurt",
    name: "Nonfat Greek yogurt",
    per100g: { kcal: 59, protein: 10.19, carb: 3.6, fat: 0.39, fiber: 0 },
    source: "Yogurt, Greek, plain, nonfat",
  },
  banana: {
    id: "banana",
    name: "Banana, peeled",
    per100g: { kcal: 89, protein: 1.09, carb: 22.84, fat: 0.33, fiber: 2.6 },
    source: "Bananas, raw",
  },
  chicken: {
    id: "chicken",
    name: "Chicken breast, cooked",
    per100g: { kcal: 165, protein: 31.02, carb: 0, fat: 3.57, fiber: 0 },
    source: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
  },
  rice: {
    id: "rice",
    name: "White rice, cooked",
    per100g: { kcal: 130, protein: 2.69, carb: 28.17, fat: 0.28, fiber: 0.4 },
    source: "Rice, white, long-grain, cooked",
  },
  broccoli: {
    id: "broccoli",
    name: "Broccoli",
    per100g: { kcal: 35, protein: 2.38, carb: 7.18, fat: 0.41, fiber: 3.3 },
    source: "Broccoli, cooked, boiled, drained",
  },
  potato: {
    id: "potato",
    name: "Potato, cooked, skin on",
    per100g: { kcal: 93, protein: 2.5, carb: 21.15, fat: 0.13, fiber: 2.2 },
    source: "Potatoes, baked, flesh and skin",
  },
  oil: {
    id: "oil",
    name: "Olive oil",
    per100g: { kcal: 884, protein: 0, carb: 0, fat: 100, fiber: 0 },
    source: "Oil, olive",
  },
}

export const TARGET_KCAL = 2500
export const DAYS = 7
/** Cooked weight ÷ raw weight for a roasted boneless breast. */
export const CHICKEN_COOKED_YIELD = 0.75
/** Cooked rice weight ÷ dry rice weight. */
export const RICE_COOKED_PER_DRY = 2.8
/** Cooked potato weight ÷ raw potato weight after microwaving. */
export const POTATO_COOKED_YIELD = 0.85
export const RICE_WATER_PER_DRY = 1.5
const OIL_G_PER_ML = 0.91
const GRAMS_PER_LB = 453.59237
/** Spice spoons are written against this raw-chicken batch, then scaled. */
const SPICE_BASE_RAW_G = 3360

export const MEALS: Meal[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    minutes: 2,
    lede: "A bowl, a scale, a spoon. Nothing gets cooked.",
    steps:
      "Put a bowl on the scale and tare it. Add 80 g of rolled oats, tare, add 250 g of yogurt, tare, add 120 g of peeled banana. Stir. Cinnamon is free. If you want the oats softer, stir and let it sit while you get dressed.",
    ingredients: [
      { foodId: "oats", grams: 80 },
      { foodId: "yogurt", grams: 250 },
      { foodId: "banana", grams: 120 },
    ],
  },
  {
    id: "lunch",
    name: "Lunch",
    minutes: 4,
    lede: "The Sunday box, reheated, plus frozen broccoli.",
    steps:
      "Vent the lid and add a splash of water so the rice doesn't dry out. Microwave until steaming: about 2–3 minutes from the fridge, or 4–6 if you forgot to thaw it. Weigh 150 g of frozen broccoli into a bowl and microwave it about 3 minutes. Pour 12 g of olive oil on the broccoli. Salt it. Eat the rice plate after a morning workout.",
    ingredients: [
      { foodId: "chicken", grams: 180 },
      { foodId: "rice", grams: 280 },
      { foodId: "broccoli", grams: 150 },
      { foodId: "oil", grams: 12 },
    ],
  },
  {
    id: "dinner",
    name: "Dinner",
    minutes: 8,
    lede: "Chicken from the box. Potato and broccoli from the microwave.",
    steps:
      "Prick a russet and microwave it 6–8 minutes, turning once, until a knife slides through. Rest a minute. Weigh 400 g, skin included. If it's over, save the extra in the fridge and cook less tomorrow. If it's under, microwave a second small one. Reheat the chicken with a splash of water until steaming. Microwave 150 g of frozen broccoli. Add 12 g of olive oil. Eat this plate after an evening workout.",
    ingredients: [
      { foodId: "chicken", grams: 180 },
      { foodId: "potato", grams: 400 },
      { foodId: "broccoli", grams: 150 },
      { foodId: "oil", grams: 12 },
    ],
  },
  {
    id: "evening",
    name: "Evening bowl",
    minutes: 1,
    lede: "The bowl that keeps you out of the kitchen later.",
    steps:
      "300 g of the same yogurt and 140 g of banana. Eat it whenever the day has a hole — mid-afternoon, or after dinner. Mustard, hot sauce, soy sauce, lemon, vinegar, and cinnamon can go on any plate. Peanut butter, cheese, and extra oil cannot.",
    ingredients: [
      { foodId: "yogurt", grams: 300 },
      { foodId: "banana", grams: 140 },
    ],
  },
]

export function scaleMacros(per100: Macros, grams: number): Macros {
  const factor = grams / 100
  return {
    kcal: per100.kcal * factor,
    protein: per100.protein * factor,
    carb: per100.carb * factor,
    fat: per100.fat * factor,
    fiber: per100.fiber * factor,
  }
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carb: a.carb + b.carb,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
  }
}

export function ingredientMacros(ingredient: Ingredient): Macros {
  const food = FOODS[ingredient.foodId]
  if (!food) throw new Error(`Unknown food ${ingredient.foodId}`)
  return scaleMacros(food.per100g, ingredient.grams)
}

export function mealMacros(meal: Meal): Macros {
  return meal.ingredients.reduce(
    (sum, ingredient) => addMacros(sum, ingredientMacros(ingredient)),
    ZERO
  )
}

export function dayTotals(): Macros {
  return MEALS.reduce((sum, meal) => addMacros(sum, mealMacros(meal)), ZERO)
}

export function gramsOf(foodId: string, meals: Meal[] = MEALS): number {
  return meals.reduce(
    (sum, meal) =>
      sum +
      meal.ingredients
        .filter((ingredient) => ingredient.foodId === foodId)
        .reduce((inner, ingredient) => inner + ingredient.grams, 0),
    0
  )
}

export type WeekMath = {
  cookedChickenG: number
  rawChickenG: number
  cookedRiceG: number
  dryRiceG: number
  cookedPotatoG: number
  rawPotatoG: number
  oatsG: number
  yogurtG: number
  bananaG: number
  broccoliG: number
  oilG: number
  oilMl: number
  bananaCount: number
}

export function weekMath(): WeekMath {
  const cookedChickenG = gramsOf("chicken") * DAYS
  const cookedRiceG = gramsOf("rice") * DAYS
  const cookedPotatoG = gramsOf("potato") * DAYS
  const oilG = gramsOf("oil") * DAYS
  return {
    cookedChickenG,
    rawChickenG: cookedChickenG / CHICKEN_COOKED_YIELD,
    cookedRiceG,
    dryRiceG: cookedRiceG / RICE_COOKED_PER_DRY,
    cookedPotatoG,
    rawPotatoG: cookedPotatoG / POTATO_COOKED_YIELD,
    oatsG: gramsOf("oats") * DAYS,
    yogurtG: gramsOf("yogurt") * DAYS,
    bananaG: gramsOf("banana") * DAYS,
    broccoliG: gramsOf("broccoli") * DAYS,
    oilG,
    oilMl: oilG / OIL_G_PER_ML,
    bananaCount: 16,
  }
}

const numberFormat = new Intl.NumberFormat("en-US")

export function formatCount(value: number): string {
  return numberFormat.format(Math.round(value))
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = Math.round((grams / 1000) * 100) / 100
    const text = kg.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")
    return `${text} kg`
  }
  return `${Math.round(grams)} g`
}

export function formatBuy(grams: number): string {
  const weight = formatWeight(grams)
  if (grams < 400) return weight
  const pounds = grams / GRAMS_PER_LB
  return `${weight} (${pounds.toFixed(1)} lb)`
}

function tspPhrase(tsp: number): string {
  const whole = Math.floor(tsp + 1e-9)
  const remainder = Math.round((tsp - whole) * 2) / 2
  const fraction = remainder === 0.5 ? "1/2" : ""
  let amount = ""
  if (whole && fraction) amount = `${whole} ${fraction}`
  else if (whole) amount = String(whole)
  else amount = fraction || "0"
  const unit = tsp > 1 ? "teaspoons" : "teaspoon"
  return `${amount} ${unit}`
}

export function formatSpoons(tspExact: number): string {
  const tsp = Math.round(tspExact * 2) / 2
  const tablespoons = Math.floor(tsp / 3 + 1e-9)
  const remainder = Math.round((tsp - tablespoons * 3) * 2) / 2
  const parts: string[] = []
  if (tablespoons > 0) {
    parts.push(`${tablespoons} tablespoon${tablespoons === 1 ? "" : "s"}`)
  }
  if (remainder > 0) parts.push(tspPhrase(remainder))
  return parts.join(" plus ") || "a pinch"
}

export function spiceForRawChicken(rawGrams: number): SpiceMix {
  const scale = rawGrams / SPICE_BASE_RAW_G
  return {
    salt: formatSpoons(12 * scale),
    pepper: formatSpoons(2 * scale),
    garlic: formatSpoons(6 * scale),
    onion: formatSpoons(2 * scale),
    paprika: formatSpoons(2 * scale),
  }
}

export function weeklyShop(): ShopItem[] {
  const week = weekMath()
  const potatoBuy = Math.round(week.rawPotatoG / 50) * 50
  return [
    {
      id: "chicken",
      section: "Proteins",
      name: "Chicken breast, boneless and skinless",
      amount: formatBuy(week.rawChickenG),
      note: "Not thighs — the fat misses this plate. Breast loses about a quarter of its weight in the oven, which leaves fourteen portions of 180 g cooked.",
    },
    {
      id: "yogurt",
      section: "Proteins",
      name: "Plain nonfat Greek yogurt",
      amount: formatBuy(week.yogurtG),
      note: "About 10 g of protein per 100 g. Regular yogurt is half the protein. Skyr is fine if the label looks like that. Four 1 kg tubs covers the week with a little left over.",
    },
    {
      id: "rice",
      section: "Carbs",
      name: "Dry white rice",
      amount: formatBuy(week.dryRiceG),
      note: "Jasmine, basmati, or long grain. Not microwave cups, and not anything with oil already in it. This cooks up to 280 g in each lunch.",
    },
    {
      id: "oats",
      section: "Carbs",
      name: "Rolled oats",
      amount: formatBuy(week.oatsG),
      note: "Old-fashioned oats. Not sweetened packets, and not steel-cut — those need a pot. These soften in the yogurt.",
    },
    {
      id: "potato",
      section: "Produce",
      name: "Russet potatoes",
      amount: formatBuy(potatoBuy),
      note: "Weigh 400 g after cooking, skin included. They lose some water in the microwave, so the bag is heavier than seven times 400 g. Sweet potatoes work, but they take longer, so stay with russets.",
    },
    {
      id: "banana",
      section: "Produce",
      name: "Bananas",
      amount: `${week.bananaCount} medium`,
      note: `${formatCount(week.bananaG)} g peeled across the week: 120 g at breakfast and 140 g in the evening bowl. The sticker size is a guess. Weigh the fruit. Buy a couple extra if the bunch looks small.`,
    },
    {
      id: "broccoli",
      section: "Produce",
      name: "Frozen broccoli florets",
      amount: formatBuy(week.broccoliG),
      note: "Weigh it frozen and microwave it when you eat. Don't cook it on Sunday. It gets tired in the fridge, and fresh broccoli adds washing.",
    },
    {
      id: "oil",
      section: "Pantry",
      name: "Olive oil",
      amount: `${formatCount(week.oilG)} g`,
      note: `About ${formatCount(week.oilMl)} ml, a little over 3/4 cup for the week. Measured on the plate, 12 g at lunch and 12 g at dinner. The sheet pan stays dry.`,
    },
    {
      id: "spices",
      section: "Pantry",
      name: "Salt, pepper, garlic powder, onion powder, smoked paprika",
      amount: "One shaker each",
      note: "The amounts for the chicken are on the Prep page. Shake iodized salt on the potatoes during the week if the batch salt isn't iodized.",
    },
  ]
}

export function shopListText(items: ShopItem[] = weeklyShop()): string {
  const lines = ["Plain Plate — one week", ""]
  let section = ""
  for (const item of items) {
    if (item.section !== section) {
      if (section) lines.push("")
      section = item.section
      lines.push(section)
    }
    lines.push(`${item.name} — ${item.amount}`)
  }
  return lines.join("\n")
}

type Batch = {
  days: number
  rawChickenG: number
  dryRiceG: number
  spice: SpiceMix
}

function batchForDays(days: number): Batch {
  const week = weekMath()
  const rawChickenG = (week.rawChickenG / DAYS) * days
  return {
    days,
    rawChickenG,
    dryRiceG: (week.dryRiceG / DAYS) * days,
    spice: spiceForRawChicken(rawChickenG),
  }
}

function riceStep(batch: Batch): PrepStep {
  const water = Math.round(batch.dryRiceG * RICE_WATER_PER_DRY)
  const halfRice = Math.round(batch.dryRiceG / 2)
  const halfWater = Math.round(halfRice * RICE_WATER_PER_DRY)
  return {
    id: "rice",
    minutes: "5 min, then it cooks itself",
    title: "Start the rice and the oven",
    body: `Heat the oven to 425°F (220°C). Rinse ${formatCount(batch.dryRiceG)} g of dry rice until the water runs mostly clear. Put it in a pot with ${formatCount(water)} g of water — grams and milliliters match for water — and 1 teaspoon of salt. Bring it to a boil, cover, and cook on low for 12 minutes. Turn the heat off and leave the lid on for 10 minutes. If the pot is small, do that twice with ${formatCount(halfRice)} g of rice and ${formatCount(halfWater)} g of water.`,
  }
}

function seasonStep(batch: Batch, id = "season"): PrepStep {
  return {
    id,
    minutes: "8 min",
    title: "Season the chicken",
    body: `Pat ${formatWeight(batch.rawChickenG)} of boneless skinless breast dry. Toss it with ${batch.spice.salt} of kosher salt, ${batch.spice.pepper} of black pepper, ${batch.spice.garlic} of garlic powder, ${batch.spice.onion} of onion powder, and ${batch.spice.paprika} of smoked paprika. If you only have fine table salt, use half as many spoons. No oil. The oil is measured later, on the plate, so the fat stays where the plan put it.`,
  }
}

function roastSteps(batch: Batch): PrepStep[] {
  const first: PrepStep = {
    id: "roast-1",
    minutes: "20 min, mostly waiting",
    title: batch.rawChickenG > 1600 ? "Roast the first pan" : "Roast the chicken",
    body: `Line a sheet pan with parchment. Lay the breasts on it so they don't touch. ${
      batch.rawChickenG > 1600
        ? "About half the chicken fits on one pan without steaming itself. Use two pans in the same oven if they both fit, and skip the second round."
        : "This amount fits on one pan. Use two pans if you need the space so the meat roasts instead of steaming."
    } Cook until a thermometer in the thickest piece reads 165°F (74°C). Start checking at 18 minutes. Thick pieces can take 25. Rest 5 minutes, uncovered.`,
  }
  if (batch.rawChickenG <= 1600) return [first]
  return [
    first,
    {
      id: "roast-2",
      minutes: "20 min, mostly waiting",
      title: "Roast the second pan",
      body: "Repeat with the rest of the chicken. While it cooks, fluff the rice and spread it on a tray so it stops steaming. A covered pot of rice stays in the warm danger zone for a long time. Don't leave it.",
    },
  ]
}

function portionStep(batch: Batch): PrepStep {
  const portions = batch.days * 2
  return {
    id: "portion",
    minutes: "15 min",
    title: `Weigh ${portions} portions`,
    body: `Make ${batch.days} lunch boxes and ${batch.days} dinner boxes. Every lunch box gets 180 g of cooked chicken and 280 g of cooked rice. Every dinner box gets 180 g of cooked chicken and nothing else. The potato is cooked the day you eat it. If the chicken doesn't divide evenly, split it into ${portions} equal piles and write the real grams on the lid. Eat that. A 10 g miss is about 16 calories. Don't go back to the store midweek to chase 180.`,
  }
}

export function sessionsFor(mode: "sunday" | "split"): CookSession[] {
  if (mode === "sunday") {
    const batch = batchForDays(7)
    return [
      {
        id: "sunday-week",
        title: "Sunday",
        dek: "One cook for the week. Fridge for three days, freezer for four.",
        clock: "About 70 minutes",
        active: "About 35 minutes of that is hands-on",
        steps: [
          riceStep(batch),
          seasonStep(batch),
          ...roastSteps(batch),
          portionStep(batch),
          {
            id: "chill",
            minutes: "5 min",
            title: "Fridge, freezer, labels",
            body: "Monday, Tuesday, and Wednesday go in the fridge. Thursday through Sunday go in the freezer. Write the day and the meal on the lid. Boxes should be in the fridge or freezer within 2 hours of the chicken coming out of the oven. Each night from Wednesday on, move the next day's lunch and dinner from the freezer to the fridge. They thaw overnight. You don't cook again until next Sunday.",
          },
        ],
      },
    ]
  }

  const sunday = batchForDays(3)
  const wednesday = batchForDays(4)
  return [
    {
      id: "sunday-half",
      title: "Sunday",
      dek: "Cook Monday through Wednesday. Freeze the raw chicken you aren't cooking yet.",
      clock: "About 50 minutes",
      active: "About 25 minutes of that is hands-on",
      steps: [
        riceStep(sunday),
        seasonStep(sunday),
        ...roastSteps(sunday),
        portionStep(sunday),
        {
          id: "chill-sunday",
          minutes: "5 min",
          title: "Fridge the meals, freeze the rest of the raw chicken",
          body: `These boxes go in the fridge and get eaten Monday through Wednesday. Label them. Cold within 2 hours. The other ${formatWeight(wednesday.rawChickenG)} of raw chicken goes in the freezer tonight, sealed. Raw chicken should not sit in the fridge from Sunday until Wednesday. The extra rice stays in the bag.`,
        },
      ],
    },
    {
      id: "tuesday-thaw",
      title: "Tuesday night",
      dek: "Two minutes. This is what makes Wednesday fast.",
      clock: "2 minutes",
      active: "All of it is hands-on",
      steps: [
        {
          id: "thaw-raw",
          minutes: "2 min",
          title: "Move the raw chicken to the fridge",
          body: "Take the frozen raw chicken out of the freezer and put it in the fridge. It will be ready to cook Wednesday. If you forget until Wednesday, seal it and thaw it in cold water, changing the water every 30 minutes. Don't thaw it on the counter.",
        },
      ],
    },
    {
      id: "wednesday-half",
      title: "Wednesday",
      dek: "Cook Thursday through Sunday. Everything stays in the fridge.",
      clock: "About 70 minutes",
      active: "About 30 minutes of that is hands-on",
      steps: [
        { ...riceStep(wednesday), id: "rice-wed" },
        seasonStep(wednesday, "season-wed"),
        ...roastSteps(wednesday).map((step) => ({
          ...step,
          id: `${step.id}-wed`,
        })),
        { ...portionStep(wednesday), id: "portion-wed" },
        {
          id: "chill-wed",
          minutes: "5 min",
          title: "Fridge only",
          body: "These boxes stay in the fridge, labeled Thursday through Sunday. Eat them by Sunday. Cooked chicken and rice are a 3-to-4-day food. Don't save a box for next Monday.",
        },
      ],
    },
  ]
}

export type RoundedPlate = {
  kcal: number
  protein: number
  carb: number
  fat: number
  fiber: number
}

export function roundedPlate(): RoundedPlate {
  const totals = dayTotals()
  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein),
    carb: Math.round(totals.carb),
    fat: Math.round(totals.fat),
    fiber: Math.round(totals.fiber),
  }
}

export function answerParagraph(): string {
  const plate = roundedPlate()
  return `The lowest-time way to eat ${formatCount(TARGET_KCAL)} calories of whole food on a high-protein, high-carb, low-fat cut is to stop rotating meals. Eight foods. Four plates. Every day, including rest days. This plate is ${formatCount(plate.kcal)} kcal, ${formatCount(plate.protein)} g protein, ${formatCount(plate.carb)} g carbohydrate, and ${formatCount(plate.fat)} g fat. You roast chicken and cook rice once on Sunday, freeze half, and the rest of the week is a reheat, a microwave, and a yogurt bowl.`
}

export const RULES: { title: string; body: string }[] = [
  {
    title: "The scale is the cook",
    body: "Weigh what goes on the plate. Cups drift, and on a low-fat plan the olive oil is where a guess shows up.",
  },
  {
    title: "Oil goes on the food, not the pan",
    body: "12 g at lunch and 12 g at dinner. Parchment under the chicken. A second splash of oil in the pan doubles the fat on that meal.",
  },
  {
    title: "If it isn't listed, it isn't in the day",
    body: "Mustard, hot sauce, soy sauce, lemon, vinegar, salsa by the spoon, and cinnamon are free. Peanut butter, cheese, cooking oil, and protein bars are not on this plate.",
  },
]

export const STALL = {
  title: "If the cut stalls",
  body: "Eat this exactly for 14 days. If your weight has not moved down, take 150 g of cooked rice out of lunch. That is about 200 calories. Change nothing else. Don't invent a new menu, and don't cut the chicken.",
}

export const SAFETY = [
  "Chicken is done at 165°F (74°C) in the thickest piece, not when the outside looks white.",
  "Cool food in shallow boxes. A deep closed pot of rice stays warm for hours.",
  "Thaw in the fridge. If you are late, thaw a sealed bag in cold water and change the water every half hour.",
  "Reheat until the food is steaming.",
  "If a box smells off, throw it out. This food is cheap. Getting sick is not.",
]

export const GEAR: { name: string; why: string }[] = [
  { name: "A scale that reads 1 gram", why: "Every plate is a number. This is the one tool that matters." },
  { name: "An instant-read thermometer", why: "A full tray of chicken is done by temperature, not by the clock." },
  { name: "14 containers with lids", why: "Seven lunches, seven dinners. A liter is plenty. Deli containers work." },
  { name: "A sheet pan and parchment", why: "Parchment replaces oil and saves you from scrubbing." },
  { name: "A pot with a lid", why: "700 g of dry rice in one go, or two smaller batches." },
  {
    name: "Freezer space for 8 boxes",
    why: "Thursday through Sunday. If you cook twice instead, you only need room for a bag of raw chicken.",
  },
]

export function intakeFit(kg: number): {
  proteinPerKg: number
  fatPerKg: number
  notes: string[]
} {
  const totals = dayTotals()
  const proteinPerKg = totals.protein / kg
  const fatPerKg = totals.fat / kg
  const notes: string[] = []
  const fatDeficit = 0.5 * kg - totals.fat
  if (fatDeficit > 1) {
    const teaspoons = Math.max(1, Math.ceil(fatDeficit / 4.5))
    notes.push(
      `Fat is ${fatPerKg.toFixed(2)} g per kg, under a 0.5 g/kg floor. Add ${teaspoons} teaspoon${teaspoons === 1 ? "" : "s"} of olive oil on the potato (about ${Math.round(teaspoons * 4.5)} g, ${Math.round(teaspoons * 40)} kcal).`
    )
  }
  if (proteinPerKg < 1.6) {
    notes.push(
      "Protein is under 1.6 g per kg, which is light for holding muscle in a cut. Add 50 g of cooked chicken at dinner and shrink the evening banana from 140 g to 50 g. Calories stay put. Protein goes up by about 15 g."
    )
  }
  if (notes.length === 0) {
    notes.push(
      `At this weight the plate is ${proteinPerKg.toFixed(1)} g of protein per kg and ${fatPerKg.toFixed(2)} g of fat per kg. Protein is high enough to hold onto muscle. Fat is low, and still around the floor.`
    )
  }
  return { proteinPerKg, fatPerKg, notes }
}

export const SOURCES = Object.values(FOODS).map((food) => food.source)
