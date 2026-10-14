/* Meal planner engine. Amounts land on 10 g steps, oil on 5 g, eggs as whole eggs. */
(function (root, factory) {
  const api = factory()
  if (typeof module !== "undefined" && module.exports) module.exports = api
  if (root) root.Planner = api
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEYS = ["kcal", "p", "f", "c"]

  const FOODS = {
    yogurt: food("Nonfat Greek yogurt", 59, 10.19, 0.39, 3.6, 0, 5.49, 907, "32 oz tub", "Trader Joe's"),
    oats: food("Rolled oats, dry", 389, 16.9, 6.9, 66.3, 10.6, 3.99, 510, "18 oz tub", "Trader Joe's"),
    banana: food("Banana", 89, 1.09, 0.33, 22.84, 2.6, 0.69, 453.6, "lb", "Trader Joe's"),
    berries: food("Frozen mixed berries", 45, 0.7, 0.4, 10, 4, 3.49, 454, "16 oz bag", "Trader Joe's"),
    milk: food("Skim milk", 34, 3.4, 0.1, 5, 0, 4.5, 3785, "gallon", "Trader Joe's"),
    chicken: food("Chicken breast, raw", 120, 22.5, 2.62, 0, 0, 3.25, 453.6, "lb", "Costco"),
    rice: food("White rice, dry", 365, 7.13, 0.66, 80, 1.3, 1, 453.6, "lb", "Costco"),
    lentils: food("Dry lentils", 352, 24.6, 1.06, 63.4, 10.7, 1.99, 454, "1 lb bag", "Trader Joe's"),
    broccoli: food("Broccoli", 34, 2.8, 0.4, 6.6, 2.6, 1.5, 453.6, "lb", "Costco"),
    oil: food("Olive oil", 884, 0, 100, 0, 0, 12, 682, "750 ml bottle", "Costco"),
    potato: food("Potato, raw", 77, 2.05, 0.09, 17.5, 2.1, 0.9, 453.6, "lb", "Trader Joe's"),
    sweetpotato: food("Sweet potato, raw", 86, 1.6, 0.1, 20.1, 3, 1.2, 453.6, "lb", "Trader Joe's"),
    mixedveg: food("Frozen mixed vegetables", 65, 2.6, 0.4, 13, 3.5, 1.5, 453.6, "lb", "Costco"),
    beef: food("93% lean beef mince, raw", 152, 20.85, 7, 0, 0, 5.5, 453.6, "lb", "Costco"),
    blackbeans: food("Black beans, drained", 132, 8.9, 0.5, 23.7, 8.7, 1, 240, "15 oz can, drained", "Trader Joe's"),
    pasta: food("Pasta, dry", 371, 13, 1.5, 74.7, 3.2, 1.49, 454, "1 lb box", "Trader Joe's"),
    passata: food("Tomato passata", 32, 1.4, 0.2, 6, 1.2, 2, 500, "jar", "Trader Joe's"),
    spinach: food("Spinach", 23, 2.9, 0.4, 3.6, 2.2, 2.49, 284, "bag", "Trader Joe's"),
    cottage: food("2% cottage cheese", 84, 11.1, 2.3, 4.3, 0, 3.49, 454, "16 oz tub", "Trader Joe's"),
    walnuts: food("Walnuts", 643, 14.3, 64.3, 14.3, 7.1, 7.99, 454, "16 oz bag", "Trader Joe's"),
    apple: food("Apple", 52, 0.26, 0.17, 13.8, 2.4, 1.5, 453.6, "lb", "Trader Joe's"),
    sardines: food("Sardines in water, drained", 185, 24.6, 10.5, 0, 0, 2, 120, "can", "Trader Joe's"),
    egg: {
      id: "egg",
      name: "Egg",
      each: { kcal: 72, p: 6.3, f: 4.8, c: 0.36, fiber: 0 },
      gramsEach: 50,
      packPrice: 3.5,
      packGrams: 12,
      packLabel: "dozen",
      store: "Trader Joe's",
      piece: true,
    },
  }

  function food(name, kcal, p, f, c, fiber, packPrice, packGrams, packLabel, store) {
    const id = name
    return {
      id,
      name,
      per100: { kcal, p, f, c, fiber },
      packPrice,
      packGrams,
      packLabel,
      store,
      piece: false,
    }
  }

  Object.keys(FOODS).forEach((id) => {
    FOODS[id].id = id
  })

  let liveFoods = FOODS

  function foodById(id) {
    return liveFoods[id]
  }

  function bindFoods(list) {
    const merged = Object.assign({}, FOODS)
    ;(Array.isArray(list) ? list : []).forEach((item) => {
      if (!item || !item.id || FOODS[item.id] || !item.per100) return
      merged[item.id] = item
    })
    liveFoods = merged
    return merged
  }

  const MEALS = [
    meal("breakfast", "breakfast", "Berry shake", "Blend it in the morning. Nothing is cooked.", [
      part("yogurt", "protein"),
      carb("oats", 80),
      carb("banana", 150),
      carb("berries", 40),
      carb("milk", 300),
    ]),
    meal("lunch-lentils", "lunch", "Chicken, rice, lentils", "Oven chicken, one pot of rice, one pot of lentils.", [
      part("chicken", "protein"),
      carb("rice", 80),
      carb("lentils", 50),
      micro("broccoli", 150),
      oil(),
    ]),
    meal("lunch-sweet", "lunch", "Chicken, sweet potato, beans", "Sweet potatoes share the oven with the chicken.", [
      part("chicken", "protein"),
      carb("sweetpotato", 400),
      carb("blackbeans", 120),
      micro("broccoli", 150),
      oil(),
    ]),
    meal("lunch-pasta", "lunch", "Chicken, pasta, tomato", "Boil the pasta. Spinach goes in the box frozen.", [
      part("chicken", "protein"),
      carb("pasta", 90),
      micro("passata", 120),
      micro("spinach", 80),
      oil(),
    ]),
    meal("lunch-rice", "lunch", "Chicken, rice, broccoli", "The plain version. Same chicken, just rice.", [
      part("chicken", "protein"),
      carb("rice", 120),
      micro("broccoli", 180),
      oil(),
    ]),
    meal("dinner-eggs", "dinner", "Eggs and potato", "Boil the eggs while the potatoes roast.", [
      count("egg", 1, 6),
      carb("potato", 350),
      micro("mixedveg", 150),
      oil(),
    ]),
    meal("dinner-beef", "dinner", "Beef mince and potato", "Brown the mince in a pan. Potatoes are already roasting.", [
      part("beef", "protein"),
      carb("potato", 350),
      micro("mixedveg", 150),
      oil(),
    ]),
    meal("dinner-sardines", "dinner", "Sardines and potato", "Open the can the day you eat it.", [
      fixed("sardines", 120),
      carb("potato", 350),
      micro("mixedveg", 150),
      oil(),
    ]),
    meal("dinner-chicken", "dinner", "Chicken and potato", "Uses the same tray as lunch.", [
      part("chicken", "protein"),
      carb("potato", 350),
      micro("mixedveg", 150),
      oil(),
    ]),
    meal("snack-apple", "snack", "Cottage cheese and apple", "No cooking.", [
      part("cottage", "protein"),
      fixed("apple", 180),
    ]),
    meal("snack-berries", "snack", "Cottage cheese and berries", "No cooking.", [
      part("cottage", "protein"),
      carb("berries", 150),
    ]),
    meal("snack-banana", "snack", "Yogurt, banana, and walnuts", "No cooking.", [
      part("yogurt", "protein"),
      fixed("banana", 120),
      fixed("walnuts", 10),
    ]),
    meal("snack-fruit", "snack", "Cottage cheese, apple, berries", "No cooking.", [
      part("cottage", "protein"),
      fixed("apple", 180),
      fixed("berries", 40),
    ]),
  ]

  function meal(id, slot, name, prep, parts) {
    return { id, slot, name, prep, parts }
  }
  function part(foodId, group) {
    return { food: foodId, group }
  }
  function carb(foodId, grams) {
    return { food: foodId, group: "carb", share: grams }
  }
  function micro(foodId, grams) {
    return { food: foodId, mode: "micro", grams }
  }
  function oil() {
    return { food: "oil", mode: "oil" }
  }
  function fixed(foodId, grams) {
    return { food: foodId, mode: "fixed", grams }
  }
  function count(foodId, min, max) {
    return { food: foodId, mode: "count", min, max }
  }

  const SLOTS = ["breakfast", "lunch", "snack", "dinner"]
  const SLOT_LABEL = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" }
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const DEFAULT_TARGETS = { kcal: 2500, p: 180, f: 65, c: 315 }

  /** Share of the day each slot is meant to cover. They sum to 1.
      At 2,500 kcal the shake is 200 g yogurt, 80 g oats, 150 g banana, 40 g berries, 300 g skim milk.
      Lunch stays near 40 g protein and 110 g carbs. Dinner carries more protein than the snack. */
  const DEFAULT_SHARES = {
    breakfast: { kcal: 683 / 2500, p: 46 / 180, f: 7 / 65, c: 114 / 315 },
    lunch: { kcal: 790 / 2500, p: 42 / 180, f: 20 / 65, c: 112 / 315 },
    snack: { kcal: 235 / 2500, p: 26 / 180, f: 6 / 65, c: 17 / 315 },
    dinner: { kcal: 792 / 2500, p: 66 / 180, f: 32 / 65, c: 72 / 315 },
  }

  /* Previous preset, before the shake moved to 300 g skim milk and a handful of berries. */
  const LIGHT_SNACK_SHARES = {
    breakfast: { kcal: 660 / 2500, p: 42 / 180, f: 9 / 65, c: 110 / 315 },
    lunch: { kcal: 790 / 2500, p: 42 / 180, f: 18 / 65, c: 112 / 315 },
    snack: { kcal: 235 / 2500, p: 26 / 180, f: 6 / 65, c: 17 / 315 },
    dinner: { kcal: 815 / 2500, p: 70 / 180, f: 32 / 65, c: 76 / 315 },
  }

  const HEAVY_SNACK_SHARES = {
    breakfast: { kcal: 660 / 2500, p: 42 / 180, f: 9 / 65, c: 110 / 315 },
    lunch: { kcal: 790 / 2500, p: 42 / 180, f: 18 / 65, c: 112 / 315 },
    snack: { kcal: 430 / 2500, p: 48 / 180, f: 10 / 65, c: 30 / 315 },
    dinner: { kcal: 620 / 2500, p: 48 / 180, f: 28 / 65, c: 63 / 315 },
  }

  const PREVIOUS_SHARES = {
    breakfast: { kcal: 0.272, p: 0.272, f: 0.143, c: 0.339 },
    lunch: { kcal: 0.369, p: 0.461, f: 0.317, c: 0.335 },
    dinner: { kcal: 0.266, p: 0.161, f: 0.476, c: 0.225 },
    snack: { kcal: 0.093, p: 0.106, f: 0.064, c: 0.101 },
  }

  const ROTATION = [
    { lunch: "lunch-lentils", snack: "snack-apple", dinner: "dinner-eggs" },
    { lunch: "lunch-sweet", snack: "snack-berries", dinner: "dinner-beef" },
    { lunch: "lunch-pasta", snack: "snack-banana", dinner: "dinner-sardines" },
    { lunch: "lunch-rice", snack: "snack-fruit", dinner: "dinner-chicken" },
    { lunch: "lunch-lentils", snack: "snack-apple", dinner: "dinner-beef" },
    { lunch: "lunch-sweet", snack: "snack-berries", dinner: "dinner-sardines" },
    { lunch: "lunch-rice", snack: "snack-banana", dinner: "dinner-eggs" },
  ]

  function zero() {
    return { kcal: 0, p: 0, f: 0, c: 0, fiber: 0 }
  }

  function add(into, extra) {
    KEYS.concat("fiber").forEach((k) => {
      into[k] += extra[k] || 0
    })
    return into
  }

  function sub(a, b) {
    const out = zero()
    KEYS.forEach((k) => {
      out[k] = a[k] - (b[k] || 0)
    })
    return out
  }

  function vector(food, amount) {
    if (food.piece) {
      const n = amount
      return {
        kcal: food.each.kcal * n,
        p: food.each.p * n,
        f: food.each.f * n,
        c: food.each.c * n,
        fiber: food.each.fiber * n,
      }
    }
    const per = food.per100
    const m = amount / 100
    return {
      kcal: per.kcal * m,
      p: per.p * m,
      f: per.f * m,
      c: per.c * m,
      fiber: (per.fiber || 0) * m,
    }
  }

  function perUnit(food) {
    if (food.piece) return { kcal: food.each.kcal, p: food.each.p, f: food.each.f, c: food.each.c }
    const per = food.per100
    return { kcal: per.kcal / 100, p: per.p / 100, f: per.f / 100, c: per.c / 100 }
  }

  function mixPerGram(parts) {
    const total = parts.reduce((s, p) => s + p.share, 0) || 1
    const out = { kcal: 0, p: 0, f: 0, c: 0 }
    parts.forEach((p) => {
      const u = perUnit(foodById(p.food))
      const w = p.share / total
      KEYS.forEach((k) => {
        out[k] += u[k] * w
      })
    })
    return out
  }

  function solveLinear(A, b) {
    const n = b.length
    const M = A.map((row, i) => row.concat(b[i]))
    for (let col = 0; col < n; col++) {
      let pivot = col
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
      }
      const hold = M[col]
      M[col] = M[pivot]
      M[pivot] = hold
      const div = M[col][col]
      if (Math.abs(div) < 1e-10) return null
      for (let c = col; c <= n; c++) M[col][c] /= div
      for (let r = 0; r < n; r++) {
        if (r === col) continue
        const f = M[r][col]
        for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
      }
    }
    return M.map((row) => row[n])
  }

  function leastSquares(cols, target) {
    const weights = {
      kcal: 4 / Math.max(target.kcal, 1),
      p: 5 / Math.max(target.p, 1),
      f: 4 / Math.max(target.f, 1),
      c: 3 / Math.max(target.c, 1),
    }
    const k = cols.length
    if (!k) return []
    const A = Array.from({ length: k }, () => Array(k).fill(0))
    const b = Array(k).fill(0)
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        KEYS.forEach((key) => {
          A[i][j] += weights[key] * cols[i][key] * cols[j][key]
        })
      }
      KEYS.forEach((key) => {
        b[i] += weights[key] * cols[i][key] * target[key]
      })
    }
    return solveLinear(A, b)
  }

  function nnls(cols, target) {
    const x = Array(cols.length).fill(0)
    let active = cols.map((_, i) => i)
    for (let iter = 0; iter < cols.length + 2 && active.length; iter++) {
      const sol = leastSquares(
        active.map((i) => cols[i]),
        target,
      )
      if (!sol) break
      let worst = -1
      sol.forEach((v, si) => {
        if (v < -1e-6 && (worst < 0 || v < sol[worst])) worst = si
      })
      if (worst < 0) {
        active.forEach((i, si) => {
          x[i] = Math.max(0, sol[si])
        })
        return x
      }
      x[active[worst]] = 0
      active.splice(worst, 1)
    }
    return x
  }

  function roundStep(value, step) {
    return Math.max(0, Math.round(value / step) * step)
  }

  function splitGroup(parts, total, step) {
    const sum = parts.reduce((s, p) => s + p.share, 0) || 1
    const grams = {}
    let used = 0
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        grams[p.food] = Math.max(0, roundStep(total - used, step))
      } else {
        const g = roundStep((total * p.share) / sum, step)
        grams[p.food] = g
        used += g
      }
    })
    return grams
  }

  function macrosOf(items) {
    const m = zero()
    items.forEach((item) => add(m, vector(foodById(item.food), item.amount)))
    return m
  }

  function costOf(items, prices) {
    return items.reduce((sum, item) => sum + lineCost(item, prices), 0)
  }

  function pricePer100(food, prices) {
    if (prices && prices[food.id] != null) return prices[food.id]
    return (food.packPrice / food.packGrams) * 100
  }

  function lineCost(item, prices) {
    const food = foodById(item.food)
    if (!food) return 0
    if (food.piece) return (pricePer100(food, prices) / 100) * item.amount
    return (pricePer100(food, prices) / 100) * item.amount
  }

  const WHOLE_FRUIT = { banana: 120, apple: 180 }

  /* A plate stays cookable. Meat is a serving, a potato is a potato, vegetables
     are a side, and oil or nuts are a spoon or a handful. The berry shake is
     the one recipe that does not use these limits. */
  const PORTION_BANDS = {
    chicken: { step: 10, min: 80, max: 400 },
    beef: { step: 10, min: 80, max: 400 },
    potato: { step: 10, min: 200, max: 450 },
    sweetpotato: { step: 10, min: 200, max: 500 },
    rice: { step: 10, min: 40, max: 180 },
    lentils: { step: 10, min: 40, max: 120 },
    pasta: { step: 10, min: 60, max: 200 },
    blackbeans: { step: 10, min: 40, max: 240 },
    oats: { step: 10, min: 40, max: 100 },
    broccoli: { step: 10, min: 80, max: 220 },
    spinach: { step: 10, min: 40, max: 160 },
    mixedveg: { step: 10, min: 80, max: 170 },
    passata: { step: 10, min: 80, max: 250 },
    berries: { step: 10, min: 40, max: 150 },
    yogurt: { step: 10, min: 150, max: 400 },
    cottage: { step: 10, min: 120, max: 400 },
    milk: { step: 10, min: 150, max: 500 },
    oil: { step: 5, min: 5, max: 40 },
    walnuts: { step: 5, min: 10, max: 30 },
    sardines: { step: 120, min: 120, max: 120 },
  }

  function inferredBand(food) {
    const per = food.per100 || { kcal: 0, p: 0, f: 0, c: 0 }
    if (per.kcal >= 500) return { step: 5, min: 10, max: 40 }
    if (per.p >= 15 && per.p * 4 >= per.kcal * 0.35) return { step: 10, min: 80, max: 400 }
    if (per.kcal <= 50) return { step: 10, min: 80, max: 200 }
    if (per.kcal <= 120 && per.c >= 8) return { step: 10, min: 150, max: 450 }
    if (per.kcal >= 280 && per.c >= 40) return { step: 10, min: 40, max: 180 }
    if (per.p >= 8 && per.kcal < 160) return { step: 10, min: 120, max: 400 }
    return { step: 10, min: 40, max: 250 }
  }

  function portionBand(food) {
    if (!food) return { step: 10, min: 40, max: 250 }
    if (food.piece) return { step: 1, min: 1, max: food.id === "egg" ? 6 : 8 }
    if (PORTION_BANDS[food.id]) return PORTION_BANDS[food.id]
    if (WHOLE_FRUIT[food.id]) {
      const one = WHOLE_FRUIT[food.id]
      return { step: one, min: one, max: one * 2 }
    }
    return inferredBand(food)
  }

  function listedBounds(food) {
    return portionBand(food)
  }

  function shakeRecipe(meal) {
    return meal && meal.id === "breakfast" && !Array.isArray(meal.foods)
  }

  function portionBounds(meal) {
    if (!meal || shakeRecipe(meal)) return null
    return { smart: true }
  }

  function amountLegal(id, grams) {
    if (id === "oil" && grams === 0) return true
    const band = portionBand(foodById(id))
    return grams + 1e-6 >= band.min && grams - 1e-6 <= band.max
  }

  function snapPortion(id, grams) {
    if (id === "oil" && grams < 5) return 0
    const band = portionBand(foodById(id))
    const stepped = roundStep(grams, band.step)
    return Math.min(band.max, Math.max(band.min, stepped))
  }

  function groupLegal(parts, total, step) {
    if (!parts.length) return true
    const split = splitGroup(parts, total, step)
    return parts.every((part) => amountLegal(part.food, split[part.food]))
  }

  function nearestLegal(parts, total, step) {
    if (!parts.length) return total
    const start = Math.max(0, roundStep(total, step))
    if (groupLegal(parts, start, step)) return start
    let best = null
    let bestDist = Infinity
    for (let grams = 0; grams <= 4000; grams += step) {
      if (!groupLegal(parts, grams, step)) continue
      const dist = Math.abs(grams - start)
      if (dist < bestDist) {
        best = grams
        bestDist = dist
      }
    }
    return best == null ? start : best
  }

  function listedScore(foods, amounts, target) {
    return errorScore(
      macrosOf(foods.map((food, i) => ({ food: food.id, amount: amounts[i] }))),
      target,
      false,
      foods.some((food) => WHOLE_FRUIT[food.id]),
    )
  }

  /* A meal you add is a list of foods. Each food stays in the meal.
     Grams are the best fit to that section's target. Nothing is typed in. */
  function scaleListed(meal, target, prices) {
    const foods = meal.foods.map((id) => foodById(id)).filter(Boolean)
    const guess = nnls(foods.map(perUnit), target)
    let amounts = foods.map((food, i) => {
      const bound = listedBounds(food)
      const rounded = roundStep(guess[i] || 0, bound.step)
      return Math.min(bound.max, Math.max(bound.min, rounded))
    })
    for (let pass = 0; pass < 80; pass++) {
      let best = amounts
      let bestScore = listedScore(foods, amounts, target)
      let changed = false
      foods.forEach((food, i) => {
        const bound = listedBounds(food)
        ;[-bound.step, bound.step].forEach((delta) => {
          const nextAmt = amounts[i] + delta
          if (nextAmt < bound.min || nextAmt > bound.max) return
          const trial = amounts.slice()
          trial[i] = nextAmt
          const score = listedScore(foods, trial, target)
          if (score < bestScore - 1e-9) {
            best = trial
            bestScore = score
            changed = true
          }
        })
      })
      if (!changed) break
      amounts = best
    }
    const items = foods.map((food, i) => ({ food: food.id, amount: amounts[i] }))
    const actual = macrosOf(items)
    return {
      items,
      actual,
      err: errorScore(actual, target, false),
      meal,
      cost: costOf(items, prices),
      target,
    }
  }

  function scaleMeal(mealId, target, prices, customMeals) {
    const meal = mealById(mealId, customMeals)
    if (!meal) return null
    if (Array.isArray(meal.foods)) return scaleListed(meal, target, prices)
    const countPart = meal.parts.find((p) => p.mode === "count")
    const fixedParts = meal.parts.filter((p) => p.mode === "fixed")
    const microParts = meal.parts.filter((p) => p.mode === "micro")
    const proteinParts = meal.parts.filter((p) => p.group === "protein").map((p) => ({ ...p, share: 1 }))
    const carbParts = meal.parts.filter((p) => p.group === "carb")
    const hasOil = meal.parts.some((p) => p.mode === "oil")
    const looseEnergy = fixedParts.some((p) => WHOLE_FRUIT[p.food])
    const choices = countPart ? range(countPart.min, countPart.max) : [0]

    let best = null
    choices.forEach((n) => {
      const counts = countPart ? { [countPart.food]: n } : {}
      const micros = {}
      microParts.forEach((p) => {
        micros[p.food] = p.grams
      })
      const bounds = portionBounds(meal)
      const solved = clampPlate(
        fitContinuous(target, counts, micros, fixedParts, proteinParts, carbParts, hasOil),
        bounds,
        proteinParts,
        carbParts,
      )
      const looseProtein = fixedParts.some((p) => p.food === "sardines")
      const refined = refine(solved, target, countPart, proteinParts, carbParts, hasOil, fixedParts, looseProtein, bounds, looseEnergy)
      const built = materialize(meal, refined, proteinParts, carbParts)
      const actual = macrosOf(built)
      const err = errorScore(actual, target, looseProtein, looseEnergy)
      if (!best || err < best.err) best = { items: built, actual, err, meal }
    })

    best.cost = costOf(best.items, prices)
    best.target = target
    return best
  }

  function range(min, max) {
    const out = []
    for (let n = min; n <= max; n++) out.push(n)
    return out
  }

  function fitContinuous(target, counts, micros, fixedParts, proteinParts, carbParts, hasOil) {
    const base = zero()
    fixedParts.forEach((p) => add(base, vector(foodById(p.food), p.grams)))
    Object.entries(counts).forEach(([id, n]) => add(base, vector(foodById(id), n)))
    Object.entries(micros).forEach(([id, g]) => add(base, vector(foodById(id), g)))
    const remain = sub(target, base)
    const cols = []
    const names = []
    if (proteinParts.length) {
      cols.push(mixPerGram(proteinParts))
      names.push("protein")
    }
    if (carbParts.length) {
      cols.push(mixPerGram(carbParts))
      names.push("carb")
    }
    if (hasOil) {
      cols.push(perUnit(foodById("oil")))
      names.push("oil")
    }
    const x = nnls(cols, remain)
    const state = { counts: { ...counts }, micros: { ...micros }, protein: 0, carb: 0, oil: 0 }
    names.forEach((name, i) => {
      state[name] = x[i] || 0
    })
    state.protein = roundStep(state.protein, 10)
    state.carb = roundStep(state.carb, 10)
    state.oil = roundStep(state.oil, 5)
    return state
  }

  function errorScore(actual, target, looseProtein, looseEnergy) {
    const w = { kcal: 12, p: 16, f: 12, c: 8 }
    let s = 0
    KEYS.forEach((k) => {
      const d = (actual[k] - target[k]) / Math.max(target[k], 1)
      if (looseEnergy && (k === "kcal" || k === "c") && d > 0) return
      let weight = w[k]
      if (k === "p" && looseProtein && d > 0) weight = 3
      s += weight * d * d
    })
    return s
  }

  function clampPlate(state, bounds, proteinParts, carbParts) {
    if (!bounds || !bounds.smart) return state
    state.protein = nearestLegal(proteinParts || [], state.protein, 10)
    state.carb = nearestLegal(carbParts || [], state.carb, 10)
    Object.keys(state.micros).forEach((id) => {
      state.micros[id] = snapPortion(id, state.micros[id])
    })
    if (state.oil > 40) state.oil = 40
    return state
  }

  function refine(state, target, countPart, proteinParts, carbParts, hasOil, fixedParts, looseProtein, bounds, looseEnergy) {
    let current = cloneState(state)
    for (let pass = 0; pass < 80; pass++) {
      let best = current
      let bestScore = scoreState(current, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein, looseEnergy)
      const moves = []
      moves.push({ protein: current.protein - 10 }, { protein: current.protein + 10 })
      moves.push({ carb: current.carb - 10 }, { carb: current.carb + 10 })
      if (hasOil) moves.push({ oil: current.oil - 5 }, { oil: current.oil + 5 })
      Object.keys(current.micros).forEach((id) => {
        moves.push({ micro: id, grams: current.micros[id] - 10 })
        moves.push({ micro: id, grams: current.micros[id] + 10 })
      })
      if (countPart) {
        moves.push({ count: current.counts[countPart.food] - 1 })
        moves.push({ count: current.counts[countPart.food] + 1 })
      }
      moves.forEach((move) => {
        const next = applyMove(current, move, countPart, bounds, proteinParts, carbParts)
        if (!next) return
        const s = scoreState(next, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein, looseEnergy)
        if (s < bestScore - 1e-9) {
          best = next
          bestScore = s
        }
      })
      if (best === current) break
      current = best
    }
    return current
  }

  function cloneState(state) {
    return {
      counts: { ...state.counts },
      micros: { ...state.micros },
      protein: state.protein,
      carb: state.carb,
      oil: state.oil,
    }
  }

  function applyMove(state, move, countPart, bounds, proteinParts, carbParts) {
    const next = cloneState(state)
    const smart = bounds && bounds.smart
    if (move.protein != null) {
      if (move.protein < 0) return null
      if (smart && !groupLegal(proteinParts || [], move.protein, 10)) return null
      next.protein = move.protein
    }
    if (move.carb != null) {
      if (smart) {
        if (!groupLegal(carbParts || [], move.carb, 10)) return null
      } else if (move.carb < 0) return null
      next.carb = move.carb
    }
    if (move.oil != null) {
      if (move.oil < 0) return null
      if (smart && move.oil > 40) return null
      next.oil = move.oil
    }
    if (move.micro) {
      if (smart) {
        if (!amountLegal(move.micro, move.grams)) return null
      } else if (move.grams < 40) return null
      next.micros[move.micro] = move.grams
    }
    if (move.count != null) {
      if (move.count < countPart.min || move.count > countPart.max) return null
      next.counts[countPart.food] = move.count
    }
    return next
  }

  function scoreState(state, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein, looseEnergy) {
    return errorScore(
      macrosOf(itemsFromState(state, proteinParts, carbParts, hasOil, fixedParts)),
      target,
      looseProtein,
      looseEnergy,
    )
  }

  function itemsFromState(state, proteinParts, carbParts, hasOil, fixedParts) {
    const items = []
    fixedParts.forEach((p) => items.push({ food: p.food, amount: p.grams }))
    Object.entries(state.counts).forEach(([foodId, n]) => {
      if (n > 0) items.push({ food: foodId, amount: n })
    })
    Object.entries(state.micros).forEach(([foodId, grams]) => {
      if (grams > 0) items.push({ food: foodId, amount: grams })
    })
    if (proteinParts.length && state.protein > 0) {
      const split = splitGroup(proteinParts, state.protein, 10)
      Object.entries(split).forEach(([foodId, grams]) => {
        if (grams > 0) items.push({ food: foodId, amount: grams })
      })
    }
    if (carbParts.length && state.carb > 0) {
      const split = splitGroup(carbParts, state.carb, 10)
      Object.entries(split).forEach(([foodId, grams]) => {
        if (grams > 0) items.push({ food: foodId, amount: grams })
      })
    }
    if (hasOil && state.oil > 0) items.push({ food: "oil", amount: state.oil })
    return items
  }

  function materialize(meal, state, proteinParts, carbParts) {
    const fixedParts = meal.parts.filter((p) => p.mode === "fixed")
    const hasOil = meal.parts.some((p) => p.mode === "oil")
    return itemsFromState(state, proteinParts, carbParts, hasOil, fixedParts)
  }

  function slotTarget(targets, shares, slot) {
    const share = shares[slot]
    return {
      kcal: targets.kcal * share.kcal,
      p: targets.p * share.p,
      f: targets.f * share.f,
      c: targets.c * share.c,
    }
  }

  function normalizeShares(shares) {
    const next = {}
    SLOTS.forEach((slot) => {
      next[slot] = { ...shares[slot] }
    })
    KEYS.forEach((k) => {
      const sum = SLOTS.reduce((s, slot) => s + (Number(next[slot][k]) || 0), 0) || 1
      SLOTS.forEach((slot) => {
        next[slot][k] = next[slot][k] / sum
      })
    })
    return next
  }

  function blankWeek() {
    return ROTATION.map((day) => ({ breakfast: "breakfast", ...day }))
  }

  function defaultState() {
    return {
      targets: { ...DEFAULT_TARGETS },
      shares: JSON.parse(JSON.stringify(DEFAULT_SHARES)),
      weeks: [blankWeek(), blankWeek(), blankWeek(), blankWeek()],
      activeWeek: 0,
      prices: {},
      shops: {},
      shopList: [],
      customMeals: [],
      customFoods: [],
      hiddenMeals: [],
      mealEdits: {},
      locks: { kcal: false, p: false, f: false, c: false },
    }
  }

  /* A lock holds that number when calories change. Protein can stay at 180
     while fat and carbs scale. More than one macro can be locked. */
  function cleanLocks(locks) {
    const next = { kcal: false, p: false, f: false, c: false }
    if (!locks || typeof locks !== "object") return next
    KEYS.forEach((key) => {
      next[key] = !!locks[key]
    })
    return next
  }

  function applyTargetEdit(targets, locks, key, value) {
    const next = {
      kcal: targets.kcal,
      p: targets.p,
      f: targets.f,
      c: targets.c,
    }
    const held = cleanLocks(locks)
    if (!KEYS.includes(key) || !Number.isFinite(value) || value <= 0 || held[key]) return next
    if (key === "kcal" && next.kcal > 0) {
      const ratio = value / next.kcal
      ;["p", "f", "c"].forEach((macro) => {
        if (held[macro]) return
        next[macro] = Math.max(1, Math.round(next[macro] * ratio))
      })
    }
    next[key] = value
    return next
  }

  function recipeFoods(meal) {
    if (!meal) return []
    if (Array.isArray(meal.foods)) return meal.foods.slice()
    const foods = []
    const seen = new Set()
    ;(meal.parts || []).forEach((part) => {
      if (!part.food || seen.has(part.food)) return
      seen.add(part.food)
      foods.push(part.food)
    })
    return foods
  }

  function sameFoods(a, b) {
    return a.length === b.length && a.every((id, i) => id === b[i])
  }

  function mealContext(arg) {
    if (Array.isArray(arg)) return { customMeals: arg, hiddenMeals: [], mealEdits: {} }
    const state = arg || {}
    return {
      customMeals: state.customMeals || [],
      hiddenMeals: state.hiddenMeals || [],
      mealEdits: state.mealEdits || {},
    }
  }

  function applyEdit(meal, edits) {
    const edit = edits && edits[meal.id]
    if (!edit) return meal
    const foods = edit.foods || []
    const original = recipeFoods(meal)
    if (sameFoods(foods, original)) {
      if (edit.name === meal.name) return meal
      return Object.assign({}, meal, { name: edit.name })
    }
    return { id: meal.id, slot: meal.slot, name: edit.name, foods: foods.slice(), prep: meal.prep }
  }

  function mealById(id, arg) {
    const ctx = mealContext(arg)
    if (ctx.hiddenMeals.indexOf(id) >= 0) return null
    const builtin = MEALS.find((m) => m.id === id)
    if (builtin) return applyEdit(builtin, ctx.mealEdits)
    return ctx.customMeals.find((m) => m.id === id) || null
  }

  function mealsFor(slot, arg) {
    const ctx = mealContext(arg)
    const hidden = new Set(ctx.hiddenMeals)
    return MEALS.filter((m) => m.slot === slot && !hidden.has(m.id))
      .map((m) => applyEdit(m, ctx.mealEdits))
      .concat(ctx.customMeals.filter((m) => m.slot === slot))
  }

  function scalePlan(state) {
    bindFoods(state.customFoods)
    const shares = normalizeShares(state.shares)
    const cache = {}
    SLOTS.forEach((slot) => {
      const target = slotTarget(state.targets, shares, slot)
      mealsFor(slot, state).forEach((m) => {
        cache[m.id] = scaleMeal(m.id, target, state.prices, state)
      })
    })
    const fits = {}
    cache.fittedDay = function (day) {
      const key = SLOTS.map((slot) => (day && day[slot]) || "").join("|")
      if (!fits[key]) fits[key] = fitDay(day, cache, state)
      return fits[key]
    }
    return cache
  }

  /* Eggs stop at six and sardines are one can, so those dinners cannot reach
     the protein share alone. A second side may come off the plate so chicken,
     beef, yogurt, or cottage can take that protein without blowing the calories.
     The berry shake stays on its own grams. */
  function isSideFood(food) {
    if (!food || food.piece) return false
    if (food.id === "oil" || WHOLE_FRUIT[food.id] || food.id === "sardines") return false
    const per = food.per100 || { kcal: 0, p: 0, f: 0, c: 0 }
    if (per.kcal >= 500) return false
    if (per.p >= 15 && per.p * 4 >= per.kcal * 0.35) return false
    return true
  }

  function dayMiss(actual, target) {
    const w = { kcal: 40, p: 55, f: 16, c: 12 }
    let score = 0
    KEYS.forEach((key) => {
      const delta = (actual[key] - target[key]) / Math.max(target[key], 1)
      score += w[key] * delta * delta
    })
    return score
  }

  function legalDayAmount(variable, amount) {
    if (variable.kind === "extra") {
      if (amount <= 0) return 0
      if (amount < variable.floor) return amount < variable.floor * 0.5 ? 0 : variable.floor
      return Math.min(variable.max, Math.max(variable.floor, roundStep(amount, variable.step)))
    }
    if (variable.kind === "oil") {
      if (amount < 2.5) return 0
      const stepped = roundStep(amount, 5)
      return stepped < 5 ? 0 : Math.min(40, stepped)
    }
    if (variable.kind === "egg") return Math.min(variable.max, Math.max(variable.min, Math.round(amount)))
    return Math.min(variable.max, Math.max(variable.min, roundStep(amount, variable.step)))
  }

  function fitDay(day, catalog, state) {
    const bySlot = {}
    SLOTS.forEach((slot) => {
      const scaled = day && catalog[day[slot]]
      if (!scaled) return
      bySlot[slot] = {
        items: scaled.items.map((item) => ({ food: item.food, amount: item.amount })),
        meal: scaled.meal,
        target: scaled.target,
      }
    })
    const variables = []
    SLOTS.forEach((slot) => {
      const scaled = bySlot[slot]
      if (!scaled || shakeRecipe(scaled.meal)) return
      const sides = []
      scaled.items.forEach((item, itemIndex) => {
        const food = foodById(item.food)
        if (!food || WHOLE_FRUIT[item.food] || item.food === "sardines") return
        if (food.piece) {
          variables.push({ slot, itemIndex, kind: "egg", step: 1, min: 1, max: food.id === "egg" ? 6 : 8 })
          return
        }
        if (item.food === "oil") {
          variables.push({ slot, itemIndex, kind: "oil", step: 5, min: 0, max: 40 })
          return
        }
        const band = portionBand(food)
        if (!isSideFood(food)) {
          variables.push({ slot, itemIndex, kind: "core", step: band.step, min: band.min, max: band.max })
          return
        }
        sides.push({ itemIndex, kcal: ((food.per100 && food.per100.kcal) || 0) * item.amount, band })
      })
      sides.sort((a, b) => b.kcal - a.kcal)
      sides.forEach((side, index) => {
        variables.push({
          slot,
          itemIndex: side.itemIndex,
          kind: index === 0 ? "primary" : "extra",
          step: side.band.step,
          min: index === 0 ? side.band.min : 0,
          max: side.band.max,
          floor: side.band.min,
        })
      })
    })

    function amountsOf() {
      return variables.map((variable) => bySlot[variable.slot].items[variable.itemIndex].amount)
    }

    function writeAmounts(amounts) {
      variables.forEach((variable, index) => {
        bySlot[variable.slot].items[variable.itemIndex].amount = amounts[index]
      })
    }

    function plateItems() {
      const items = []
      SLOTS.forEach((slot) => {
        if (!bySlot[slot]) return
        bySlot[slot].items.forEach((item) => {
          if (item.amount > 0) items.push(item)
        })
      })
      return items
    }

    function score(amounts) {
      writeAmounts(amounts)
      let value = dayMiss(macrosOf(plateItems()), state.targets)
      variables.forEach((variable, index) => {
        value += Math.abs(amounts[index] - original[index]) * 1e-5
        if (variable.kind === "extra" && amounts[index] === 0) value += 0.01
      })
      return value
    }

    const original = amountsOf()
    let current = original.slice()
    let currentScore = score(current)
    for (let pass = 0; pass < 80; pass++) {
      let best = current
      let bestScore = currentScore
      variables.forEach((variable, index) => {
        const proposals = [current[index] - variable.step, current[index] + variable.step]
        if (variable.kind === "extra") proposals.push(0, variable.floor)
        if (variable.kind === "oil") proposals.push(0)
        const seen = new Set()
        proposals.forEach((proposal) => {
          const nextAmount = legalDayAmount(variable, proposal)
          if (seen.has(nextAmount) || nextAmount === current[index]) return
          seen.add(nextAmount)
          const trial = current.slice()
          trial[index] = nextAmount
          const trialScore = score(trial)
          if (trialScore < bestScore - 1e-9) {
            best = trial
            bestScore = trialScore
          }
        })
      })
      if (best === current) break
      current = best
      currentScore = bestScore
    }
    writeAmounts(current)

    const fitted = {}
    SLOTS.forEach((slot) => {
      const scaled = bySlot[slot]
      if (!scaled) return
      const items = scaled.items.filter((item) => item.amount > 0)
      const actual = macrosOf(items)
      fitted[slot] = {
        items,
        actual,
        err: errorScore(actual, scaled.target, false, false),
        meal: scaled.meal,
        cost: costOf(items, state.prices),
        target: scaled.target,
      }
    })
    return fitted
  }

  function mealOnDay(state, cache, day, slot) {
    if (cache && cache.fittedDay) return cache.fittedDay(day)[slot]
    return cache[day[slot]]
  }

  function dayMeals(state, cache, day) {
    return SLOTS.map((slot) => mealOnDay(state, cache, day, slot)).filter(Boolean)
  }

  function sumMacros(list) {
    const m = zero()
    list.forEach((scaled) => add(m, scaled.actual))
    return m
  }

  function sumCost(list) {
    return list.reduce((s, scaled) => s + scaled.cost, 0)
  }

  function collect(state, cache, weekIndexes) {
    const totals = {}
    weekIndexes.forEach((w) => {
      state.weeks[w].forEach((day) => {
        dayMeals(state, cache, day).forEach((scaled) => {
          scaled.items.forEach((item) => {
            totals[item.food] = (totals[item.food] || 0) + item.amount
          })
        })
      })
    })
    return totals
  }

  function shopping(state, cache, weekIndexes) {
    bindFoods(state.customFoods)
    const totals = collect(state, cache, weekIndexes)
    const shops = state.shops || {}
    const lines = Object.entries(totals)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => {
        const food = foodById(id)
        if (!food) return null
        const packs = Math.ceil(amount / food.packGrams - 1e-9)
        const picked = shops[id] && String(shops[id]).trim() ? String(shops[id]).trim() : food.store
        return {
          id,
          name: food.name,
          store: picked,
          amount,
          piece: food.piece,
          packs,
          packLabel: food.packLabel,
          packPrice: packPriceOf(food, state.prices),
          cost: (pricePer100(food, state.prices) / 100) * amount,
        }
      })
      .filter(Boolean)
    const seen = new Set(lines.map((line) => line.id))
    ;(state.customFoods || []).forEach((food) => {
      if (!food || seen.has(food.id) || !foodById(food.id)) return
      const picked = shops[food.id] && String(shops[food.id]).trim() ? String(shops[food.id]).trim() : food.store
      lines.push({
        id: food.id,
        name: food.name,
        store: picked,
        amount: 0,
        piece: false,
        packs: 0,
        packLabel: food.packLabel,
        packPrice: packPriceOf(food, state.prices),
        cost: 0,
      })
    })
    return lines.sort((a, b) => a.name.localeCompare(b.name))
  }

  function closeShares(a, b) {
    if (!a || !b) return false
    return SLOTS.every((slot) =>
      KEYS.every((k) => Math.abs((Number(a[slot] && a[slot][k]) || 0) - (Number(b[slot] && b[slot][k]) || 0)) < 0.002),
    )
  }

  function cleanShopName(name) {
    return String(name || "").trim().slice(0, 40)
  }

  function cleanShops(shops) {
    const next = {}
    if (!shops || typeof shops !== "object") return next
    Object.keys(liveFoods).forEach((id) => {
      const name = cleanShopName(shops[id])
      if (name) next[id] = name
    })
    return next
  }

  function cleanShopList(list) {
    const names = []
    const seen = new Set(["costco", "trader joe's"])
    if (!Array.isArray(list)) return names
    list.forEach((name) => {
      const trimmed = cleanShopName(name)
      const key = trimmed.toLowerCase()
      if (!trimmed || seen.has(key)) return
      seen.add(key)
      names.push(trimmed)
    })
    return names.slice(0, 12)
  }

  function presetShares(shares) {
    if (!shares) return true
    return closeShares(shares, PREVIOUS_SHARES) || closeShares(shares, HEAVY_SNACK_SHARES) || closeShares(shares, LIGHT_SNACK_SHARES)
  }

  function packPriceOf(food, prices) {
    return (pricePer100(food, prices) / 100) * food.packGrams
  }

  function prep(state, cache, weekIndex) {
    bindFoods(state.customFoods)
    const totals = collect(state, cache, [weekIndex])
    const days = state.weeks[weekIndex].map((day, i) => ({
      name: DAYS[i],
      meals: SLOTS.map((slot) => {
        const scaled = cache[day[slot]]
        return { slot, name: scaled.meal.name }
      }),
    }))
    const g = (id) => totals[id] || 0
    const steps = []
    steps.push({
      title: "Set up",
      body: "Oven at 425°F. One sheet pan, one big pot, a frying pan if you are cooking beef. A scale. Boxes for each lunch and each dinner.",
    })
    if (g("chicken")) {
      steps.push({
        title: "Chicken, " + grams(g("chicken")) + " raw",
        body: "Salt it. Bake on the sheet until the thickest piece is 165°F, about 22 minutes. Slice and drop it into the chicken boxes.",
      })
    }
    if (g("potato") || g("sweetpotato")) {
      const oilForVeg = Math.round(g("oil"))
      steps.push({
        title: "Potatoes",
        body:
          [g("potato") ? grams(g("potato")) + " raw potato" : "", g("sweetpotato") ? grams(g("sweetpotato")) + " raw sweet potato" : ""]
            .filter(Boolean)
            .join(" and ") +
          ". Cube them, toss with some of the " +
          grams(oilForVeg) +
          " of olive oil for the week, and roast at 425°F for about 40 minutes.",
      })
    }
    if (g("rice")) {
      steps.push({
        title: "Rice, " + grams(g("rice")) + " dry",
        body: "Rinse, then simmer in about " + grams(g("rice") * 1.5) + " of water until the water is gone. Rest 10 minutes.",
      })
    }
    if (g("lentils")) {
      steps.push({
        title: "Lentils, " + grams(g("lentils")) + " dry",
        body: "Simmer in plenty of water for about 20 minutes, until tender. Drain.",
      })
    }
    if (g("pasta")) {
      steps.push({
        title: "Pasta, " + grams(g("pasta")) + " dry",
        body: "Boil in salted water until tender. Toss with the passata in the box.",
      })
    }
    if (g("beef")) {
      steps.push({
        title: "Beef mince, " + grams(g("beef")) + " raw",
        body: "Brown it in a pan with salt until there is no pink. Drain the fat you can see.",
      })
    }
    if (g("egg")) {
      steps.push({
        title: g("egg") + " eggs",
        body: "Cover with water, boil, then 9 more minutes. Cool them in the fridge. Peel the day you eat them.",
      })
    }
    const added = Object.keys(totals).filter((id) => totals[id] > 0 && !FOODS[id] && foodById(id))
    if (added.length) {
      steps.push({
        title: "Foods you added",
        body: added.map((id) => formatLine({ food: id, amount: Math.round(totals[id]) })).join(". ") + ". Weigh them into the boxes.",
      })
    }
    steps.push({
      title: "Boxes",
      body: "Vegetables can go in frozen. Sardines stay in the can until the morning you eat them. Shake and cottage cheese are not cooked. Cool the hot food within two hours. Keep three days in the fridge and freeze the rest. Thaw tomorrow's boxes in the fridge overnight. Reheat covered, with a spoon of water, for 2 or 3 minutes.",
    })
    const lunches = 7
    const dinners = 7
    return {
      days,
      steps,
      tools: ["Oven", "Sheet pan", "Pot", "Frying pan", "Microwave", "Scale"],
      boxes: lunches + dinners + " boxes. Six stay in the fridge (three days of lunch and dinner). Eight go in the freezer.",
    }
  }

  function grams(n) {
    return Math.round(n) + " g"
  }

  function money(n) {
    return "$" + n.toFixed(2)
  }

  function formatLine(item) {
    const food = foodById(item.food)
    if (!food) return item.amount + " g"
    if (food.piece) {
      const n = item.amount
      const word = food.name.toLowerCase()
      return n + " " + (n === 1 ? word : word + "s")
    }
    return formatAmount(item) + " " + food.name
  }

  function formatAmount(item) {
    const food = foodById(item.food)
    if (!food) return item.amount + " g"
    if (food.piece) {
      const n = item.amount
      return n + (n === 1 ? " egg" : " eggs")
    }
    if (item.food === "sardines" && item.amount === 120) return "1 can (120 g)"
    const whole = WHOLE_FRUIT[item.food]
    if (whole && item.amount >= whole && item.amount % whole === 0) {
      const n = item.amount / whole
      const word = item.food === "banana" ? "banana" : "apple"
      return n + " " + (n === 1 ? word : word + "s") + " (" + item.amount + " g)"
    }
    return item.amount + " g"
  }

  function cleanCustomMeals(list) {
    const meals = []
    const seen = new Set(MEALS.map((meal) => meal.id))
    if (!Array.isArray(list)) return meals
    list.forEach((meal) => {
      if (!meal || typeof meal !== "object") return
      const id = String(meal.id || "").trim().slice(0, 24)
      if (!/^c[a-z0-9]+$/.test(id) || seen.has(id) || SLOTS.indexOf(meal.slot) < 0) return
      const name = String(meal.name || "").trim().slice(0, 60)
      const foods = []
      const foodSeen = new Set()
      ;(Array.isArray(meal.foods) ? meal.foods : []).forEach((foodId) => {
        if (!foodById(foodId) || foodSeen.has(foodId)) return
        foodSeen.add(foodId)
        foods.push(foodId)
      })
      if (!name || foods.length < 1) return
      seen.add(id)
      meals.push({ id, slot: meal.slot, name, foods: foods.slice(0, 8) })
    })
    return meals.slice(0, 24)
  }

  function cleanHiddenMeals(list) {
    const ids = []
    const seen = new Set()
    if (!Array.isArray(list)) return ids
    list.forEach((id) => {
      const key = String(id || "")
      if (!MEALS.some((meal) => meal.id === key) || seen.has(key)) return
      seen.add(key)
      ids.push(key)
    })
    return ids
  }

  function cleanFoodList(list) {
    const foods = []
    const seen = new Set()
    ;(Array.isArray(list) ? list : []).forEach((foodId) => {
      if (!foodById(foodId) || seen.has(foodId)) return
      seen.add(foodId)
      foods.push(foodId)
    })
    return foods.slice(0, 8)
  }

  function cleanMealEdits(edits) {
    const next = {}
    if (!edits || typeof edits !== "object") return next
    MEALS.forEach((meal) => {
      const edit = edits[meal.id]
      if (!edit || typeof edit !== "object") return
      const name = String(edit.name || "").trim().slice(0, 60)
      const foods = cleanFoodList(edit.foods)
      if (!name || !foods.length) return
      if (name === meal.name && sameFoods(foods, recipeFoods(meal))) return
      next[meal.id] = { name, foods }
    })
    return next
  }

  function round2(n) {
    return Math.round(n * 100) / 100
  }

  function cleanCustomFoods(list) {
    const foods = []
    const seen = new Set()
    const names = new Set(Object.keys(FOODS).map((id) => FOODS[id].name.toLowerCase()))
    if (!Array.isArray(list)) return foods
    list.forEach((item) => {
      if (!item || typeof item !== "object") return
      const id = String(item.id || "").trim().slice(0, 24)
      if (!/^f[a-z0-9]+$/.test(id) || FOODS[id] || seen.has(id)) return
      const name = String(item.name || "").trim().slice(0, 60)
      if (!name || names.has(name.toLowerCase())) return
      const src = item.per100 || {}
      const per100 = {
        kcal: round2(Math.max(0, Number(src.kcal) || 0)),
        p: round2(Math.max(0, Number(src.p) || 0)),
        f: round2(Math.max(0, Number(src.f) || 0)),
        c: round2(Math.max(0, Number(src.c) || 0)),
        fiber: round2(Math.max(0, Number(src.fiber) || 0)),
      }
      if (per100.kcal + per100.p + per100.f + per100.c <= 0) return
      const packGrams = Number(item.packGrams)
      if (!Number.isFinite(packGrams) || packGrams <= 0 || packGrams > 50000) return
      const packPrice = Number(item.packPrice)
      const packLabel = String(item.packLabel || "pack").trim().slice(0, 24) || "pack"
      const store = cleanShopName(item.store) || "Trader Joe's"
      seen.add(id)
      names.add(name.toLowerCase())
      foods.push({
        id,
        name,
        per100,
        packPrice: Number.isFinite(packPrice) && packPrice >= 0 ? round2(packPrice) : 0,
        packGrams: round2(packGrams),
        packLabel,
        store,
        piece: false,
      })
    })
    return foods.slice(0, 40)
  }

  function sanitize(state) {
    const base = defaultState()
    const customFoods = cleanCustomFoods(state.customFoods)
    bindFoods(customFoods)
    const prices = {}
    const rawPrices = state.prices && typeof state.prices === "object" ? state.prices : {}
    Object.keys(liveFoods).forEach((id) => {
      const n = Number(rawPrices[id])
      if (Number.isFinite(n) && n >= 0) prices[id] = n
    })
    const next = {
      targets: { ...base.targets, ...(state.targets || {}) },
      shares: presetShares(state.shares) ? base.shares : state.shares,
      weeks: Array.isArray(state.weeks) ? state.weeks : base.weeks,
      activeWeek: Number.isInteger(state.activeWeek) ? state.activeWeek : 0,
      prices,
      shops: cleanShops(state.shops),
      shopList: cleanShopList(state.shopList),
      customMeals: cleanCustomMeals(state.customMeals),
      customFoods,
      hiddenMeals: cleanHiddenMeals(state.hiddenMeals),
      mealEdits: cleanMealEdits(state.mealEdits),
      locks: cleanLocks(state.locks),
    }
    KEYS.forEach((k) => {
      const n = Number(next.targets[k])
      next.targets[k] = Number.isFinite(n) && n > 0 ? n : base.targets[k]
    })
    if (next.activeWeek < 0 || next.activeWeek > 3) next.activeWeek = 0
    const weeks = next.weeks.slice(0, 4)
    while (weeks.length < 4) weeks.push(blankWeek())
    next.weeks = weeks.map((week, wi) => {
      const fallback = base.weeks[wi]
      const days = Array.isArray(week) ? week.slice(0, 7) : []
      while (days.length < 7) days.push(fallback[days.length])
      return days.map((day, di) => {
        const fb = fallback[di]
        const built = { breakfast: "breakfast", lunch: fb.lunch, snack: fb.snack, dinner: fb.dinner }
        SLOTS.forEach((slot) => {
          const id = day && day[slot]
          const found = mealById(id, next)
          if (found && found.slot === slot) {
            built[slot] = id
            return
          }
          const options = mealsFor(slot, next)
          if (options.length) built[slot] = options[0].id
          else {
            next.hiddenMeals = next.hiddenMeals.filter((hiddenId) => hiddenId !== fb[slot])
            built[slot] = fb[slot]
          }
        })
        return built
      })
    })
    return next
  }

  function load() {
    try {
      const raw = localStorage.getItem("plate-plan-v1")
      if (!raw) return defaultState()
      return sanitize(JSON.parse(raw))
    } catch (e) {
      return defaultState()
    }
  }

  function save(state) {
    localStorage.setItem("plate-plan-v1", JSON.stringify(state))
  }

  return {
    FOODS,
    foods: bindFoods,
    MEALS,
    SLOTS,
    SLOT_LABEL,
    DAYS,
    DEFAULT_TARGETS,
    defaultState,
    mealById,
    mealsFor,
    recipeFoods,
    scalePlan,
    scaleMeal,
    dayMeals,
    mealOnDay,
    sumMacros,
    sumCost,
    shopping,
    prep,
    formatAmount,
    formatLine,
    money,
    pricePer100,
    packPriceOf,
    load,
    save,
    sanitize,
    normalizeShares,
    slotTarget,
    closeShares,
    applyTargetEdit,
  }
})
