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
    milk: food("1% milk", 42, 3.4, 1, 5, 0, 4.5, 3785, "gallon", "Trader Joe's"),
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

  const MEALS = [
    meal("breakfast", "breakfast", "Berry shake", "Blend it in the morning. Nothing is cooked.", [
      part("yogurt", "protein"),
      carb("oats", 80),
      carb("banana", 120),
      carb("berries", 80),
      carb("milk", 200),
      oil(),
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
      carb("apple", 180),
    ]),
    meal("snack-berries", "snack", "Cottage cheese and berries", "No cooking.", [
      part("cottage", "protein"),
      carb("berries", 150),
    ]),
    meal("snack-banana", "snack", "Yogurt and banana", "No cooking.", [
      part("yogurt", "protein"),
      carb("banana", 120),
      oil(),
    ]),
    meal("snack-fruit", "snack", "Cottage cheese, apple, berries", "No cooking.", [
      part("cottage", "protein"),
      carb("apple", 120),
      carb("berries", 80),
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

  /** Share of the day each slot is meant to cover. They sum to 1. */
  const DEFAULT_SHARES = {
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
      const u = perUnit(FOODS[p.food])
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
    items.forEach((item) => add(m, vector(FOODS[item.food], item.amount)))
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
    const food = FOODS[item.food]
    if (food.piece) return (pricePer100(food, prices) / 100) * item.amount
    return (pricePer100(food, prices) / 100) * item.amount
  }

  function scaleMeal(mealId, target, prices) {
    const meal = MEALS.find((m) => m.id === mealId)
    const countPart = meal.parts.find((p) => p.mode === "count")
    const fixedParts = meal.parts.filter((p) => p.mode === "fixed")
    const microParts = meal.parts.filter((p) => p.mode === "micro")
    const proteinParts = meal.parts.filter((p) => p.group === "protein").map((p) => ({ ...p, share: 1 }))
    const carbParts = meal.parts.filter((p) => p.group === "carb")
    const hasOil = meal.parts.some((p) => p.mode === "oil")
    const choices = countPart ? range(countPart.min, countPart.max) : [0]

    let best = null
    choices.forEach((n) => {
      const counts = countPart ? { [countPart.food]: n } : {}
      const micros = {}
      microParts.forEach((p) => {
        micros[p.food] = p.grams
      })
      const solved = fitContinuous(target, counts, micros, fixedParts, proteinParts, carbParts, hasOil)
      const looseProtein = fixedParts.some((p) => p.food === "sardines")
      const refined = refine(solved, target, countPart, proteinParts, carbParts, hasOil, fixedParts, looseProtein)
      const built = materialize(meal, refined, proteinParts, carbParts)
      const actual = macrosOf(built)
      const err = errorScore(actual, target, looseProtein)
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
    fixedParts.forEach((p) => add(base, vector(FOODS[p.food], p.grams)))
    Object.entries(counts).forEach(([id, n]) => add(base, vector(FOODS[id], n)))
    Object.entries(micros).forEach(([id, g]) => add(base, vector(FOODS[id], g)))
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
      cols.push(perUnit(FOODS.oil))
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

  function errorScore(actual, target, looseProtein) {
    const w = { kcal: 12, p: 16, f: 12, c: 8 }
    let s = 0
    KEYS.forEach((k) => {
      const d = (actual[k] - target[k]) / Math.max(target[k], 1)
      let weight = w[k]
      if (k === "p" && looseProtein && d > 0) weight = 3
      s += weight * d * d
    })
    return s
  }

  function refine(state, target, countPart, proteinParts, carbParts, hasOil, fixedParts, looseProtein) {
    let current = cloneState(state)
    for (let pass = 0; pass < 80; pass++) {
      let best = current
      let bestScore = scoreState(current, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein)
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
        const next = applyMove(current, move, countPart)
        if (!next) return
        const s = scoreState(next, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein)
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

  function applyMove(state, move, countPart) {
    const next = cloneState(state)
    if (move.protein != null) {
      if (move.protein < 0) return null
      next.protein = move.protein
    }
    if (move.carb != null) {
      if (move.carb < 0) return null
      next.carb = move.carb
    }
    if (move.oil != null) {
      if (move.oil < 0) return null
      next.oil = move.oil
    }
    if (move.micro) {
      if (move.grams < 40) return null
      next.micros[move.micro] = move.grams
    }
    if (move.count != null) {
      if (move.count < countPart.min || move.count > countPart.max) return null
      next.counts[countPart.food] = move.count
    }
    return next
  }

  function scoreState(state, target, proteinParts, carbParts, hasOil, fixedParts, looseProtein) {
    return errorScore(
      macrosOf(itemsFromState(state, proteinParts, carbParts, hasOil, fixedParts)),
      target,
      looseProtein,
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
    }
  }

  function mealById(id) {
    return MEALS.find((m) => m.id === id)
  }

  function mealsFor(slot) {
    return MEALS.filter((m) => m.slot === slot)
  }

  function scalePlan(state) {
    const shares = normalizeShares(state.shares)
    const cache = {}
    SLOTS.forEach((slot) => {
      const target = slotTarget(state.targets, shares, slot)
      mealsFor(slot).forEach((m) => {
        cache[m.id] = scaleMeal(m.id, target, state.prices)
      })
    })
    return cache
  }

  function dayMeals(state, cache, day) {
    return SLOTS.map((slot) => cache[day[slot]]).filter(Boolean)
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
    const totals = collect(state, cache, weekIndexes)
    const lines = Object.entries(totals)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => {
        const food = FOODS[id]
        const packs = Math.ceil(amount / food.packGrams - 1e-9)
        const cost = food.piece
          ? (pricePer100(food, state.prices) / 100) * amount
          : (pricePer100(food, state.prices) / 100) * amount
        return {
          id,
          name: food.name,
          store: food.store,
          amount,
          piece: food.piece,
          packs,
          packLabel: food.packLabel,
          packPrice: packPriceOf(food, state.prices),
          cost,
        }
      })
    const stores = ["Costco", "Trader Joe's"]
    return stores.map((store) => ({
      store,
      lines: lines.filter((line) => line.store === store).sort((a, b) => a.name.localeCompare(b.name)),
    }))
  }

  function packPriceOf(food, prices) {
    return (pricePer100(food, prices) / 100) * food.packGrams
  }

  function prep(state, cache, weekIndex) {
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

  function formatAmount(item) {
    const food = FOODS[item.food]
    if (food.piece) {
      const n = item.amount
      return n + (n === 1 ? " egg" : " eggs")
    }
    if (item.food === "sardines") return "1 can (120 g)"
    return item.amount + " g"
  }

  function sanitize(state) {
    const base = defaultState()
    const next = {
      targets: { ...base.targets, ...(state.targets || {}) },
      shares: state.shares || base.shares,
      weeks: Array.isArray(state.weeks) ? state.weeks : base.weeks,
      activeWeek: Number.isInteger(state.activeWeek) ? state.activeWeek : 0,
      prices: state.prices && typeof state.prices === "object" ? state.prices : {},
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
          const found = mealById(id)
          if (found && found.slot === slot) built[slot] = id
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
    MEALS,
    SLOTS,
    SLOT_LABEL,
    DAYS,
    DEFAULT_TARGETS,
    defaultState,
    mealById,
    mealsFor,
    scalePlan,
    scaleMeal,
    dayMeals,
    sumMacros,
    sumCost,
    shopping,
    prep,
    formatAmount,
    money,
    pricePer100,
    packPriceOf,
    load,
    save,
    sanitize,
    normalizeShares,
    slotTarget,
  }
})
