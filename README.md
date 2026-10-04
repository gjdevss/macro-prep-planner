# Plain Plate

A 2,500 calorie day for a strength-training cut: high protein, high carb, low fat, eight whole foods, cooked once on Sunday.

The plate is about **2,506 kcal**, **206 g protein**, **318 g carbohydrate**, and **48 g fat**. Lunch and dinner are the same 180 g of cooked chicken. Breakfast and the evening bowl are oats or a banana in nonfat Greek yogurt. You roast the chicken and cook the rice once, freeze half, and every other meal is a scale and a microwave.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3847](http://localhost:3847).

- **Today** is the four plates, with grams and a check when you have eaten them.
- **Prep** is the Sunday cook. There is a twice-a-week version if you do not want cooked food in the freezer.
- **Shop** is the weekly grocery list.

Checks stay in this browser. Nothing is sent anywhere.

## The food

| Plate | What you weigh |
| --- | --- |
| Breakfast | 80 g rolled oats, 250 g nonfat Greek yogurt, 120 g banana |
| Lunch | 180 g cooked chicken breast, 280 g cooked white rice, 150 g broccoli, 12 g olive oil |
| Dinner | 180 g cooked chicken breast, 400 g cooked potato with skin, 150 g broccoli, 12 g olive oil |
| Evening bowl | 300 g nonfat Greek yogurt, 140 g banana |

Numbers come from USDA FoodData Central. If your yogurt tub disagrees, trust the tub. The portions live in `lib/plan.ts`.

`npm test` checks that the day still lands on this cut.
