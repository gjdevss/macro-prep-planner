# Plate

A meal plan you can open on your phone or your computer. Breakfast is the berry shake. Lunch, snack, and dinner each have four swaps. Changing the day targets changes the grams, not the foods.

The page is static. GitHub Pages can host it. What you type is stored in one shared plan, so the phone and the computer stay on the same week. Each browser also keeps a copy, so the page still opens if that shared copy is briefly unreachable.

## Put it on GitHub Pages

1. Create a new repository. Public is fine. Do not put your name, address, or receipts in it.
2. Upload this folder's files at the root of that repository: `index.html`, `planner.js`, `app.js`, `styles.css`, and `.nojekyll`.
3. In the repository, open Settings → Pages → Build and deployment. Choose Deploy from a branch. Branch `main`, folder `/ (root)`. Save.
4. Wait a minute. Open the Pages link in Safari on your phone and in the browser on your computer.

The default meals are visible to anyone who can open the link or the repository. A private repository does not hide a GitHub Pages site. The shared plan is also visible to anyone who reads the page source. That is the copy your phone and your computer both open.

## What stays when you close the tab

Closing the tab keeps the plan. Open the same page on your phone or your computer and the latest week is there. The page loads the shared plan when you open it, again when you come back to the tab, and about every 20 seconds while the tab stays open. A change on the phone shows up on the computer after that check. The shared copy does not disappear when you close the tab.

On Targets, **Reset plan** puts the meals, targets, prices, and shop marks back to the start.

## Open it on this computer before you upload

From this folder:

```bash
python3 -m http.server 4317
```

Then open `http://127.0.0.1:4317`.

## The plate

Default day: 2,500 kcal, 180 g protein, 65 g fat, 315 g carbs. Changing calories scales the other three with it. Lock a macro on Targets to hold that number: protein can stay at 180 g while fat and carbs scale, and two locks can be on at once. Amounts land on 10 g steps, oil on 5 g, eggs as whole eggs, sardines as one 120 g can. Each day is fitted to those targets. The page shows the real total.

At 2,500 calories the shake is 200 g Greek yogurt, 80 g oats, 150 g banana, 40 g berries, and 300 g skim milk. Lunch's own target stays near 40 g of protein. When dinner is eggs or sardines and cannot reach its protein, lunch or the snack takes the rest. A second side can come off that plate. Dinner still carries more of the protein than the snack on beef and chicken days.

Meals, between Shop and Prep, lists every meal and the grams it lands on at the current targets, before a day trims a side. Edit or remove any meal, including the ones that come with the plan. A new meal is a name and a list of foods. Grams are calculated. Every meal except the berry shake keeps each food in a cookable range, so a side cannot turn into most of the plate. Add a new food from that same list: name, the label numbers per 100 g, and the pack. It joins the food stickers and the shop list right away. A banana is one banana (120 g) and an apple is one apple (180 g). Eggs and sardines keep a real potato. Those edits sync with the rest of the plan.

The shop list is one list. A small menu next to each price notes the shop, starting with Costco and Trader Joe's, and you can add another. Switch the list between this week, two weeks, and the month. Prices are October 2026 shelf guesses. There is no live price connection.
