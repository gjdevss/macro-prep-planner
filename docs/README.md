# Plate

A meal plan you can open on your phone or your computer. Breakfast is the berry shake. Lunch, snack, and dinner each have four swaps. Changing the day targets changes the grams, not the foods.

The page is static. GitHub Pages can host it. What you type stays in the browser that you typed it in.

## Put it on GitHub Pages

1. Create a new repository. Public is fine. Do not put your name, address, or receipts in it.
2. Upload this folder's files at the root of that repository: `index.html`, `planner.js`, `app.js`, `styles.css`, and `.nojekyll`.
3. In the repository, open Settings → Pages → Build and deployment. Choose Deploy from a branch. Branch `main`, folder `/ (root)`. Save.
4. Wait a minute. Open the Pages link in Safari on your phone and in the browser on your computer.

The default meals are visible to anyone who can open the link or the repository. Your saved weeks, price edits, and targets are not in the repository. A private repository does not hide a GitHub Pages site.

## What stays when you close the tab

The plan is stored in that browser under the name `plate-plan-v1`. Closing the tab keeps it. Clearing browser data deletes it. The phone and the computer do not share it.

On Targets, **Copy plan** puts the whole plan on the clipboard. On the other device, open Targets, paste, and choose **Use pasted plan**. **Download plan** writes `plate-plan.json` if paste is awkward.

## Open it on this computer before you upload

From this folder:

```bash
python3 -m http.server 4317
```

Then open `http://127.0.0.1:4317`.

## The plate

Default day: 2,500 kcal, 180 g protein, 65 g fat, 315 g carbs. Changing calories scales the other three with it. Amounts land on 10 g steps, oil on 5 g, eggs as whole eggs, sardines as one 120 g can. The day can drift by a few dozen calories. The page shows the real total.

Lunch is the meal after training, so it carries most of the protein. Dinner carries more of the fat. The snack is optional.

Stores are Costco and Trader Joe's. Prices are October 2026 shelf guesses. Edit them on the shop list. They are remembered in the browser. There is no live price connection.
