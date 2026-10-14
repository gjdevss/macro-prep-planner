/* Plate. The plan is shared, so the phone and the computer open the same week. */
(function () {
  const P = window.Planner
  const app = document.getElementById("app")
  const SYNC_PAGE = "https://rentry.co/plateplan47c1e9533ff1"
  const SYNC_EDIT = "https://rentry.co/api/edit/plateplan47c1e9533ff1"
  const SYNC_CODE = "b73d767c61d1fed04f2d635f"

  let state = P.load()
  let rev = Number(localStorage.getItem("plate-plan-rev") || 0)
  let writeId = localStorage.getItem("plate-plan-write") || ""
  let syncStatus = "Opening the shared plan…"
  let pushing = false
  let pushAgain = false
  let pushForce = false
  let epoch = 0
  let pullPromise = null
  let view = "plan"
  let dayIndex = 0
  let shopScope = "month"
  let picker = null
  let notice = ""
  let cacheKey = ""
  let scaledCache = null

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]))
  }

  function round0(n) {
    return Math.round(n).toLocaleString("en-US")
  }

  function grams(n) {
    return round0(n) + " g"
  }

  function rememberMeta() {
    localStorage.setItem("plate-plan-rev", String(rev))
    localStorage.setItem("plate-plan-write", writeId)
  }

  function newWriteId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  function editingField() {
    const el = document.activeElement
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")
  }

  function paintStatus() {
    const foot = document.querySelector(".foot")
    if (foot) foot.textContent = syncStatus
  }

  function localEdited() {
    return JSON.stringify(state) !== JSON.stringify(P.defaultState())
  }

  function articleText(html) {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const article = doc.querySelector(".entry-text article")
    return article ? article.textContent.trim() : ""
  }

  async function readRemote() {
    const res = await fetch(SYNC_PAGE + "?t=" + Date.now(), { cache: "no-store" })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(String(res.status))
    const text = articleText(await res.text())
    if (!text.startsWith("{")) return null
    try {
      const data = JSON.parse(text)
      if (!data || typeof data !== "object" || !data.state || typeof data.rev !== "number") return null
      return data
    } catch (err) {
      return null
    }
  }

  async function writeRemote(body) {
    const res = await fetch(SYNC_EDIT, {
      method: "POST",
      body: new URLSearchParams({
        edit_code: SYNC_CODE,
        text: JSON.stringify(body),
      }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const payload = await res.json()
    if (String(payload.status) !== "200") throw new Error(payload.content || "save failed")
  }

  function envelope() {
    return { rev, updatedAt: Math.floor(Date.now() / 1000), writeId, state }
  }

  function adopt(remote) {
    const before = remote.state && remote.state.shares
    state = P.sanitize(remote.state)
    rev = remote.rev || 0
    writeId = remote.writeId || ""
    P.save(state)
    rememberMeta()
    cacheKey = ""
    if (!P.closeShares(before, state.shares)) {
      rev += 1
      writeId = newWriteId()
      rememberMeta()
      pushNow(true)
    }
  }

  async function pushNow(force) {
    if (rev <= 0) return
    if (pushing) {
      pushAgain = true
      pushForce = pushForce || !!force
      return
    }
    pushing = true
    const hand = !!force
    syncStatus = "Saving the shared plan…"
    paintStatus()
    try {
      const remote = await readRemote()
      if (remote && (remote.rev || 0) > rev) {
        if (!hand) {
          if (!editingField()) {
            adopt(remote)
            syncStatus = "Plan synced."
            render()
          }
          return
        }
        rev = remote.rev + 1
        writeId = newWriteId()
        rememberMeta()
      }
      if (remote && (remote.rev || 0) === rev && remote.writeId === writeId) {
        syncStatus = "Plan synced."
        return
      }
      await writeRemote(envelope())
      const check = await readRemote()
      if (check && check.writeId !== writeId) {
        if (!hand && (check.rev || 0) >= rev) {
          if (!editingField()) {
            adopt(check)
            render()
          }
        } else if ((check.rev || 0) < rev) {
          await writeRemote(envelope())
        } else if (hand) {
          rev = (check.rev || rev) + 1
          writeId = newWriteId()
          rememberMeta()
          await writeRemote(envelope())
        }
      }
      syncStatus = "Plan synced."
    } catch (err) {
      syncStatus = "Saved on this device. The shared copy will catch up when the connection is back."
    } finally {
      pushing = false
      paintStatus()
      if (pushAgain) {
        const again = pushForce
        pushAgain = false
        pushForce = false
        pushNow(again)
      }
    }
  }

  function pull() {
    if (pullPromise) return pullPromise
    const seen = epoch
    pullPromise = pullBody(seen).finally(() => {
      pullPromise = null
    })
    return pullPromise
  }

  async function pullBody(seen) {
    try {
      const remote = await readRemote()
      if (epoch !== seen || pushing) return
      if (!remote) {
        if (rev > 0 || localEdited()) {
          if (rev <= 0) {
            rev = 1
            writeId = newWriteId()
            rememberMeta()
          }
          await pushNow(false)
        } else {
          syncStatus = "Plan synced."
          paintStatus()
        }
        return
      }
      const remoteNewer = (remote.rev || 0) > rev
      const collided = (remote.rev || 0) === rev && remote.writeId && writeId && remote.writeId !== writeId
      if ((remoteNewer || collided) && !editingField()) {
        adopt(remote)
        syncStatus = "Plan synced."
        render()
        return
      }
      if ((remote.rev || 0) < rev) {
        await pushNow(false)
        return
      }
      if (!P.closeShares(remote.state && remote.state.shares, state.shares)) {
        rev += 1
        writeId = newWriteId()
        rememberMeta()
        P.save(state)
        await pushNow(true)
        return
      }
      syncStatus = "Plan synced."
      paintStatus()
    } catch (err) {
      syncStatus = "Saved on this device. The shared copy will catch up when the connection is back."
      paintStatus()
    }
  }

  function commit() {
    state = P.sanitize(state)
    epoch += 1
    rev += 1
    writeId = newWriteId()
    P.save(state)
    rememberMeta()
    cacheKey = ""
    render()
    pushNow(true)
  }

  function getCache() {
    const key = JSON.stringify({ t: state.targets, s: state.shares, p: state.prices })
    if (key !== cacheKey) {
      cacheKey = key
      scaledCache = P.scalePlan(state)
    }
    return scaledCache
  }

  function itemMacros(item) {
    const food = P.FOODS[item.food]
    if (food.piece) {
      return {
        kcal: food.each.kcal * item.amount,
        p: food.each.p * item.amount,
        f: food.each.f * item.amount,
        c: food.each.c * item.amount,
      }
    }
    const m = item.amount / 100
    return {
      kcal: food.per100.kcal * m,
      p: food.per100.p * m,
      f: food.per100.f * m,
      c: food.per100.c * m,
    }
  }

  function macroLine(m) {
    return round0(m.kcal) + " kcal, " + round0(m.p) + " P, " + round0(m.f) + " F, " + round0(m.c) + " C"
  }

  function usedLabel(line) {
    if (line.id === "egg") return line.amount + (line.amount === 1 ? " egg" : " eggs")
    if (line.id === "sardines") {
      const cans = Math.round(line.amount / 120)
      return cans + (cans === 1 ? " can" : " cans")
    }
    return grams(line.amount)
  }

  function buyLabel(line) {
    const n = line.packs
    const unit = line.packLabel
    return "Buy " + n + " " + unit
  }

  function flash(text) {
    notice = text
    render()
    window.setTimeout(() => {
      if (notice === text) {
        notice = ""
        render()
      }
    }, 3500)
  }

  function assign(day, slot, mealId) {
    const meal = P.mealById(mealId)
    if (!meal || meal.slot !== slot) return
    state.weeks[state.activeWeek][day][slot] = mealId
    picker = null
    commit()
  }

  function render() {
    const cache = getCache()
    const monthCost = monthBuy(cache)
    app.innerHTML =
      '<div class="app">' +
      shell(monthCost) +
      (view === "plan" ? renderPlan(cache) : "") +
      (view === "month" ? renderMonth(cache) : "") +
      (view === "shop" ? renderShop(cache) : "") +
      (view === "meals" ? renderMeals(cache) : "") +
      (view === "prep" ? renderPrep(cache) : "") +
      (view === "targets" ? renderTargets() : "") +
      (picker ? renderPicker(cache) : "") +
      (notice ? '<div class="toast">' + esc(notice) + "</div>" : "") +
      '<p class="foot">' + esc(syncStatus) + "</p></div>"
  }

  function shell(monthCost) {
    const tabs = [
      ["plan", "Plan"],
      ["month", "Month"],
      ["shop", "Shop"],
      ["meals", "Meals"],
      ["prep", "Prep"],
      ["targets", "Targets"],
    ]
    const buttons = tabs
      .map(([id, label]) => '<button type="button" data-view="' + id + '" class="' + (view === id ? "on" : "") + '">' + label + "</button>")
      .join("")
    return (
      '<header class="top">' +
      '<div class="brand"><h1>Pl<span>a</span>te</h1><p>Raw weights. Same calories when you swap a meal.</p></div>' +
      '<div class="top-side"><div class="cost-pill"><strong>' +
      P.money(monthCost) +
      '</strong><span>this month, to buy</span></div>' +
      '<button type="button" class="ghost" data-view="targets">Targets</button></div></header>' +
      '<nav class="nav-top">' +
      buttons +
      "</nav>" +
      '<nav class="nav-bottom">' +
      buttons +
      "</nav>"
    )
  }

  function renderPlan(cache) {
    const week = state.weeks[state.activeWeek]
    const day = week[dayIndex]
    const meals = P.dayMeals(state, cache, day)
    const totals = P.sumMacros(meals)
    const dayCost = P.sumCost(meals)
    const kcalOff = Math.abs(totals.kcal - state.targets.kcal)
    const weeks = [0, 1, 2, 3]
      .map((i) => '<button type="button" class="week-btn' + (i === state.activeWeek ? " on" : "") + '" data-week="' + i + '">Week ' + (i + 1) + "</button>")
      .join("")
    const board = week
      .map((d, i) => {
        const t = P.sumMacros(P.dayMeals(state, cache, d))
        const slots = P.SLOTS.map((slot) => {
          const scaled = cache[d[slot]]
          return (
            '<button type="button" class="mini" data-day="' +
            i +
            '" data-open-slot="' +
            slot +
            '" data-drop-day="' +
            i +
            '" data-drop-slot="' +
            slot +
            '"><small>' +
            P.SLOT_LABEL[slot] +
            "</small><b>" +
            esc(scaled.meal.name) +
            "</b></button>"
          )
        }).join("")
        return (
          '<article class="day-col' +
          (i === dayIndex ? " on" : "") +
          '"><button type="button" class="day-head" data-day="' +
          i +
          '"><span class="dow">' +
          P.DAYS[i].slice(0, 3) +
          '</span><span class="kcal">' +
          round0(t.kcal) +
          " kcal</span></button>" +
          slots +
          "</article>"
        )
      })
      .join("")
    const blocks = P.SLOTS.map((slot) => {
      const scaled = P.mealOnDay(state, cache, day, slot)
      const items = scaled.items
        .map((item) => {
          const m = itemMacros(item)
          return (
            "<li><span class=\"food\">" +
            esc(P.formatAmount(item)) +
            " " +
            esc(P.FOODS[item.food].name) +
            "</span> <span class=\"muted\">(" +
            macroLine(m) +
            ")</span></li>"
          )
        })
        .join("")
      return (
        '<section class="slot-block"><button type="button" class="slot-hit" data-open-slot="' +
        slot +
        '" data-drop-day="' +
        dayIndex +
        '" data-drop-slot="' +
        slot +
        '"><span><em>' +
        P.SLOT_LABEL[slot] +
        "</em><strong>" +
        esc(scaled.meal.name) +
        "</strong><span class=\"macros\">" +
        macroLine(scaled.actual) +
        " · " +
        P.money(scaled.cost) +
        '</span></span><span class="swap">Change</span></button><ul class="ingredients">' +
        items +
        "</ul></section>"
      )
    }).join("")
    const banner =
      kcalOff > 100
        ? '<p class="note">This day is ' +
          round0(totals.kcal) +
          " kcal. The target is " +
          round0(state.targets.kcal) +
          ". Ten gram steps" +
          (day.dinner === "dinner-sardines" ? " and a whole can of sardines" : "") +
          " move the total. The number here is the real plate.</p>"
        : ""
    return (
      '<div class="week-row">' +
      weeks +
      "</div>" +
      '<div class="day-switch">' +
      P.DAYS.map(
        (name, i) =>
          '<button type="button" class="day-chip' +
          (i === dayIndex ? " on" : "") +
          '" data-day="' +
          i +
          '">' +
          name.slice(0, 3) +
          "</button>",
      ).join("") +
      "</div>" +
      '<div class="board">' +
      board +
      "</div>" +
      '<section class="panel"><div class="panel-head"><div><h2>' +
      P.DAYS[dayIndex] +
      "</h2><p class=\"muted\">Week " +
      (state.activeWeek + 1) +
      " · " +
      P.money(dayCost) +
      " of food</p></div></div>" +
      '<div class="totals">' +
      stat(round0(totals.kcal), "kcal", Math.abs(totals.kcal - state.targets.kcal) > 100) +
      stat(round0(totals.p) + " g", "protein", Math.abs(totals.p - state.targets.p) > 12) +
      stat(round0(totals.f) + " g", "fat", Math.abs(totals.f - state.targets.f) > 8) +
      stat(round0(totals.c) + " g", "carbs", Math.abs(totals.c - state.targets.c) > 25) +
      stat(round0(totals.fiber) + " g", "fiber", false) +
      "</div>" +
      banner +
      blocks +
      "</section>"
    )
  }

  function stat(value, label, off) {
    return '<div class="stat' + (off ? " off" : "") + '"><b>' + value + "</b><span>" + label + "</span></div>"
  }

  function renderPicker(cache) {
    const slot = picker.slot
    const pickedDay = state.weeks[state.activeWeek][picker.day]
    const current = pickedDay[slot]
    const options = P.mealsFor(slot)
      .map((meal) => {
        const scaled = P.mealOnDay(state, cache, Object.assign({}, pickedDay, { [slot]: meal.id }), slot)
        const bits = scaled.items.map((item) => P.formatAmount(item) + " " + P.FOODS[item.food].name).join(" · ")
        return (
          '<button type="button" class="meal-pick' +
          (meal.id === current ? " on" : "") +
          '" draggable="true" data-drag-meal="' +
          meal.id +
          '" data-pick-meal="' +
          meal.id +
          '"><b>' +
          esc(meal.name) +
          "</b><span class=\"macros\">" +
          macroLine(scaled.actual) +
          " · " +
          P.money(scaled.cost) +
          "</span><span class=\"hint\">" +
          esc(bits) +
          "</span></button>"
        )
      })
      .join("")
    const only = options.length === 1 ? '<p class="hint">Breakfast is this shake every morning. Change the day targets and the grams change with them.</p>' : ""
    return (
      '<div class="sheet-back" data-close="1"><div class="sheet" role="dialog" aria-label="Choose a meal"><h3>' +
      P.DAYS[picker.day] +
      " " +
      P.SLOT_LABEL[slot].toLowerCase() +
      "</h3>" +
      only +
      options +
      '<div class="action-row" style="margin-top:0.8rem"><button type="button" class="ghost" data-close="1">Close</button></div></div></div>'
    )
  }

  function renderMonth(cache) {
    const cards = state.weeks
      .map((week, wi) => {
        const days = week
          .map((day, di) => {
            const lunch = cache[day.lunch]
            const dinner = cache[day.dinner]
            return (
              '<div class="mini-day"><b>' +
              P.DAYS[di].slice(0, 3) +
              "</b>" +
              esc(lunch.meal.name) +
              "<br>" +
              esc(dinner.meal.name) +
              "</div>"
            )
          })
          .join("")
        const cost = weekBuy(cache, wi)
        return (
          '<article class="week-card' +
          (wi === state.activeWeek ? " on" : "") +
          '"><div class="panel-head"><div><h3>Week ' +
          (wi + 1) +
          '</h3><p class="muted">' +
          P.money(cost) +
          ' to buy</p></div><button type="button" class="solid" data-open-week="' +
          wi +
          '">Open</button></div><div class="mini-days">' +
          days +
          "</div></article>"
        )
      })
      .join("")
    return (
      '<section class="panel"><div class="panel-head"><div><h2>Four weeks</h2><p class="muted">The month starts as the same rotation four times. Change a week, then copy it if you want the shopping list to match.</p></div></div>' +
      '<div class="action-row"><button type="button" class="solid" data-copy-week="1">Copy week ' +
      (state.activeWeek + 1) +
      " across the month</button></div></section>" +
      '<div class="month" style="margin-top:0.8rem">' +
      cards +
      "</div>"
    )
  }

  function weekIndexes() {
    if (shopScope === "month") return [0, 1, 2, 3]
    if (shopScope === "biweek") return state.activeWeek < 2 ? [0, 1] : [2, 3]
    return [state.activeWeek]
  }

  function shopRangeLabel() {
    if (shopScope === "week") return "Week " + (state.activeWeek + 1)
    if (shopScope === "biweek") return state.activeWeek < 2 ? "Weeks 1 and 2" : "Weeks 3 and 4"
    return "All four weeks"
  }

  function buyCost(line) {
    return line.packs * line.packPrice
  }

  function weekBuy(cache, weekIndex) {
    return P.shopping(state, cache, [weekIndex]).reduce((sum, line) => sum + buyCost(line), 0)
  }

  function rangeBuy(cache, indexes) {
    return P.shopping(state, cache, indexes).reduce((sum, line) => sum + buyCost(line), 0)
  }

  function monthBuy(cache) {
    return rangeBuy(cache, [0, 1, 2, 3])
  }

  function renderMeals(cache) {
    const groups = P.SLOTS.map((slot) => {
      const cards = P.mealsFor(slot)
        .map((meal) => {
          const scaled = cache[meal.id]
          const items = scaled.items
            .map((item) => {
              const m = itemMacros(item)
              return (
                "<li><span class=\"food\">" +
                esc(P.formatAmount(item)) +
                " " +
                esc(P.FOODS[item.food].name) +
                "</span> <span class=\"muted\">(" +
                macroLine(m) +
                ")</span></li>"
              )
            })
            .join("")
          return (
            '<article class="meal-card"><h4>' +
            esc(meal.name) +
            '</h4><p class="macros">' +
            macroLine(scaled.actual) +
            " · " +
            P.money(scaled.cost) +
            '</p><ul class="ingredients">' +
            items +
            "</ul></article>"
          )
        })
        .join("")
      return '<section class="meal-group"><h3>' + P.SLOT_LABEL[slot] + "</h3><div class=\"meal-grid\">" + cards + "</div></section>"
    }).join("")
    return (
      '<section class="panel"><div class="panel-head"><div><h2>Meals</h2><p class="muted">Thirteen meals at the current targets. The grams move when the targets move. Olive oil is only in the meals that list it.</p></div></div>' +
      '<div class="meal-groups">' +
      groups +
      "</div></section>"
    )
  }

  function renderShop(cache) {
    const lines = P.shopping(state, cache, weekIndexes())
    const total = lines.reduce((sum, line) => sum + buyCost(line), 0)
    const rows = lines
      .map((line) => {
        const food = P.FOODS[line.id]
        const store = line.store
        return (
          '<div class="line"><div><strong>' +
          esc(line.name) +
          '</strong><div class="buy">Use ' +
          esc(usedLabel(line)) +
          " · " +
          esc(buyLabel(line)) +
          '</div></div><div class="price-col"><label class="price">Pack price<input inputmode="decimal" data-price="' +
          line.id +
          '" value="' +
          line.packPrice.toFixed(2) +
          '" aria-label="' +
          esc(line.name) +
          ' pack price"></label><select class="shop-pick" data-shop-for="' +
          line.id +
          '" aria-label="Shop for ' +
          esc(line.name) +
          '">' +
          shopChoices()
            .map((name) => '<option' + (name === store ? " selected" : "") + ">" + esc(name) + "</option>")
            .join("") +
          '<option value="__add__">Add shop…</option></select></div><div class="money">' +
          P.money(buyCost(line)) +
          '<div class="buy">per ' +
          esc(food.packLabel) +
          "</div></div></div>"
        )
      })
      .join("")
    return (
      '<section class="panel"><div class="grand"><div><h2>Shopping</h2><p class="muted">' +
      esc(shopRangeLabel()) +
      ". October 2026 shelf guesses. Change a price, and note the shop if you want.</p></div><strong>" +
      P.money(total) +
      "</strong></div>" +
      '<div class="scope-row"><button type="button" class="scope' +
      (shopScope === "week" ? " on" : "") +
      '" data-shop="week">This week</button><button type="button" class="scope' +
      (shopScope === "biweek" ? " on" : "") +
      '" data-shop="biweek">Two weeks</button><button type="button" class="scope' +
      (shopScope === "month" ? " on" : "") +
      '" data-shop="month">This month</button></div>' +
      rows +
      '<p class="hint">Buy counts are packs rounded up. The dollar figure is those packs, so it sits a little above the food you will actually eat.</p></section>'
    )
  }

  function renderPrep(cache) {
    const plan = P.prep(state, cache, state.activeWeek)
    const steps = plan.steps
      .map((step, i) => '<div class="step"><div class="n">' + (i + 1) + "</div><div><strong>" + esc(step.title) + "</strong><p>" + esc(step.body) + "</p></div></div>")
      .join("")
    const tools = plan.tools.map((tool) => "<span>" + esc(tool) + "</span>").join("")
    const menu = plan.days
      .map(
        (day) =>
          '<span class="menu-chip"><b>' +
          day.name.slice(0, 3) +
          "</b> " +
          esc(day.meals.map((m) => m.name).join(" · ")) +
          "</span>",
      )
      .join("")
    return (
      '<section class="panel"><div class="panel-head"><div><h2>Sunday cook</h2><p class="muted">Week ' +
      (state.activeWeek + 1) +
      ". Oven, one pot, a pan if there is beef. A slow cooker is optional and unused here.</p></div></div>" +
      '<div class="tools">' +
      tools +
      "</div>" +
      '<p class="hint">' +
      esc(plan.boxes) +
      " Shared fridge: one shelf corner for the fresh boxes, one freezer corner for the rest. If the freezer is full, cook Sunday and again Wednesday.</p>" +
      steps +
      '<p class="hint">Use iodized salt. In a New York winter, a vitamin D pill is separate from the food. Cool the rice within two hours. Fridge life is 3 or 4 days, then the freezer.</p>' +
      '<div class="tools" style="margin-top:0.8rem">' +
      menu +
      "</div></section>"
    )
  }

  function renderTargets() {
    const t = state.targets
    const fields = [
      ["kcal", "Calories", t.kcal],
      ["p", "Protein, g", t.p],
      ["f", "Fat, g", t.f],
      ["c", "Carbs, g", t.c],
    ]
      .map(
        ([key, label, value]) =>
          '<label>' +
          label +
          '<input inputmode="decimal" data-target="' +
          key +
          '" value="' +
          value +
          '"></label>',
      )
      .join("")
    const used = P.normalizeShares(state.shares)
    const rows = P.SLOTS.map((slot) => {
      const cells = ["kcal", "p", "f", "c"]
        .map((key) => {
          const shown = Math.round(state.shares[slot][key] * 1000) / 10
          return '<td><input inputmode="decimal" data-share="' + slot + '" data-key="' + key + '" value="' + shown + '"></td>'
        })
        .join("")
      return "<tr><th>" + P.SLOT_LABEL[slot] + "</th>" + cells + "</tr>"
    }).join("")
    const sums = ["kcal", "p", "f", "c"]
      .map((key) => {
        const sum = P.SLOTS.reduce((s, slot) => s + Number(state.shares[slot][key] || 0), 0)
        return Math.round(sum * 100)
      })
      .join(" / ")
    const usedLine = P.SLOTS.map((slot) => {
      return (
        P.SLOT_LABEL[slot] +
        " " +
        Math.round(used[slot].kcal * 100) +
        "/" +
        Math.round(used[slot].p * 100) +
        "/" +
        Math.round(used[slot].f * 100) +
        "/" +
        Math.round(used[slot].c * 100)
      )
    }).join(" · ")
    return (
      '<section class="panel"><h2>Day targets</h2><p class="muted" style="margin:0.35rem 0 0.8rem">These four numbers resize every meal. They do not change which foods are in the meal. Changing calories scales protein, fat, and carbs with it. Change those three on their own when you want a different shape. 2,500 kcal, 180 g protein, 65 g fat, and 315 g carbs is the plate this was built around.</p>' +
      '<div class="targets">' +
      fields +
      "</div>" +
      '<details><summary>How the day is split</summary><p class="hint">Each number is a percent of the day. Columns are calories, protein, fat, carbs. Breakfast is about 45 g of protein. Lunch stays near 40 g. Both stay around 100 to 120 g of carbs. Dinner carries more of the protein than the snack. Typed sums: ' +
      sums +
      '.</p><table class="shares"><thead><tr><th></th><th>Kcal</th><th>Protein</th><th>Fat</th><th>Carbs</th></tr></thead><tbody>' +
      rows +
      "</tbody></table><p class=\"hint\">Used as " +
      esc(usedLine) +
      '.</p><button type="button" class="ghost" data-normalize="1">Make each column add to 100</button></details>' +
      '<div class="action-row" style="margin-top:1rem"><button type="button" class="ghost" data-reset="1">Reset plan</button></div></section>'
    )
  }

  app.addEventListener("click", (event) => {
    const viewBtn = event.target.closest("[data-view]")
    if (viewBtn) {
      view = viewBtn.dataset.view
      picker = null
      render()
      return
    }
    if (event.target.classList.contains("sheet-back") || event.target.closest("button[data-close]")) {
      picker = null
      render()
      return
    }
    const weekBtn = event.target.closest("[data-week]")
    if (weekBtn) {
      state.activeWeek = Number(weekBtn.dataset.week)
      commit()
      return
    }
    const openWeek = event.target.closest("[data-open-week]")
    if (openWeek) {
      state.activeWeek = Number(openWeek.dataset.openWeek)
      view = "plan"
      dayIndex = 0
      commit()
      return
    }
    const dayBtn = event.target.closest("[data-day]")
    if (dayBtn && !event.target.closest("[data-open-slot]")) {
      dayIndex = Number(dayBtn.dataset.day)
      render()
      return
    }
    const openSlot = event.target.closest("[data-open-slot]")
    if (openSlot) {
      const day = openSlot.dataset.day != null ? Number(openSlot.dataset.day) : dayIndex
      dayIndex = day
      picker = { day, slot: openSlot.dataset.openSlot }
      render()
      return
    }
    const pick = event.target.closest("[data-pick-meal]")
    if (pick && picker) {
      assign(picker.day, picker.slot, pick.dataset.pickMeal)
      return
    }
    const shopBtn = event.target.closest("[data-shop]")
    if (shopBtn) {
      shopScope = shopBtn.dataset.shop
      render()
      return
    }
    if (event.target.closest("[data-copy-week]")) {
      const src = state.weeks[state.activeWeek].map((day) => ({ ...day }))
      state.weeks = [0, 1, 2, 3].map(() => src.map((day) => ({ ...day })))
      commit()
      flash("Week " + (state.activeWeek + 1) + " is now the whole month.")
      return
    }
    if (event.target.closest("[data-normalize]")) {
      state.shares = P.normalizeShares(state.shares)
      commit()
      return
    }
    if (event.target.closest("[data-reset]")) {
      if (window.confirm("Reset meals, targets, prices, and shop marks?")) {
        state = P.defaultState()
        commit()
      }
      return
    }
  })

  function shopChoices() {
    const names = []
    const seen = new Set()
    function add(name) {
      const trimmed = String(name || "").trim()
      if (!trimmed) return
      const key = trimmed.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      names.push(trimmed)
    }
    add("Costco")
    add("Trader Joe's")
    ;(state.shopList || []).forEach(add)
    Object.keys(state.shops || {}).forEach((id) => add(state.shops[id]))
    return names
  }

  app.addEventListener("change", (event) => {
    const target = event.target.closest("[data-target]")
    if (target) {
      const n = Number(target.value)
      if (Number.isFinite(n) && n > 0) {
        if (target.dataset.target === "kcal" && state.targets.kcal > 0) {
          const ratio = n / state.targets.kcal
          state.targets.p = Math.max(1, Math.round(state.targets.p * ratio))
          state.targets.f = Math.max(1, Math.round(state.targets.f * ratio))
          state.targets.c = Math.max(1, Math.round(state.targets.c * ratio))
        }
        state.targets[target.dataset.target] = n
      }
      commit()
      return
    }
    const share = event.target.closest("[data-share]")
    if (share) {
      const n = Number(share.value)
      if (Number.isFinite(n)) state.shares[share.dataset.share][share.dataset.key] = n / 100
      commit()
      return
    }
    const price = event.target.closest("[data-price]")
    if (price) {
      const food = P.FOODS[price.dataset.price]
      const n = Number(price.value)
      if (price.value.trim() === "") delete state.prices[food.id]
      else if (Number.isFinite(n) && n >= 0) state.prices[food.id] = (n / food.packGrams) * 100
      commit()
      return
    }
    const shop = event.target.closest("[data-shop-for]")
    if (shop) {
      const id = shop.dataset.shopFor
      const food = P.FOODS[id]
      if (!food) return
      if (shop.value === "__add__") {
        const typed = window.prompt("Shop name")
        const name = typed && typed.trim().slice(0, 40)
        if (!name) {
          render()
          return
        }
        const existing = shopChoices().find((choice) => choice.toLowerCase() === name.toLowerCase())
        const chosen = existing || name
        if (!existing) {
          state.shopList = (state.shopList || []).concat(chosen).slice(0, 12)
        }
        state.shops = state.shops || {}
        state.shops[id] = chosen
        commit()
        return
      }
      const current = (state.shops && state.shops[id]) || food.store
      if (current === shop.value) return
      state.shops = state.shops || {}
      state.shops[id] = shop.value
      commit()
    }
  })

  app.addEventListener("dragstart", (event) => {
    const meal = event.target.closest("[data-drag-meal]")
    if (!meal) return
    event.dataTransfer.setData("text/plain", meal.dataset.dragMeal)
    event.dataTransfer.effectAllowed = "copy"
  })

  app.addEventListener("dragover", (event) => {
    const zone = event.target.closest("[data-drop-slot]")
    if (!zone) return
    event.preventDefault()
    zone.classList.add("over")
  })

  app.addEventListener("dragleave", (event) => {
    const zone = event.target.closest("[data-drop-slot]")
    if (zone) zone.classList.remove("over")
  })

  app.addEventListener("drop", (event) => {
    const zone = event.target.closest("[data-drop-slot]")
    if (!zone) return
    event.preventDefault()
    const mealId = event.dataTransfer.getData("text/plain")
    assign(Number(zone.dataset.dropDay), zone.dataset.dropSlot, mealId)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && picker) {
      picker = null
      render()
    }
  })

  render()
  pull()
  setInterval(() => {
    if (document.visibilityState === "visible") pull()
  }, 20000)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pull()
  })
  window.addEventListener("focus", () => pull())
  window.PlateSync = { pull }
})()
