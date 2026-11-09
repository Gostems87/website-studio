# Stage 2: visual mock-ups

The owner should see real options in hours, before anyone has spent money on plumbing.

Three directions is this skill's choice. No published research settles the right number; three gives real contrast and is few enough for a non-technical owner to decide. Tools in this space offer anywhere from two to four.

## 1. Gather the brand inputs

Logo, colours, fonts, photographs, three admired sites and one disliked. Real inputs change the output far more than adjectives do.

If the owner has a brand kit, use recipe 2 in `house-style.md`. The kit is fixed, so the three directions differ in layout, pacing and imagery.

## 2. Write the foundations

Before any code, write down:

- **The scene:** one sentence on who is looking, where, in what light and what mood. It should force light or dark. A direction can picture a different moment and reach a different answer, as long as the scene is honest.
- **The object:** what this business is as a thing in the world.
- **The three words**, from the survey.

## 3. Define three directions that differ in kind

Fill in this table first and show it to yourself. Each direction must differ from the others on at least three rows. If they differ only in colour, start again.

| | A | B | C |
|---|---|---|---|
| The idea, in one line | | | |
| The physical object | | | |
| Theme (light, dark or colour-led) | | | |
| Colour strategy | | | |
| Type voice | | | |
| Page structure | | | |
| What the first screen shows | | | |
| Role of imagery | | | |

One direction can be the sensible one. At least one should make the owner slightly nervous.

Colour strategies: **Restrained** (tinted neutrals with one accent up to about 10 percent), **Committed** (one colour carries 30 to 60 percent), **Full palette** (three or four named roles), **Drenched** (the surface is the colour).

## 4. Choose fonts on purpose

For each direction (adapted from impeccable, see `THIRD-PARTY-NOTICES.md`):

1. Take the three words and the object.
2. Write down the three fonts you'd reach for first. Any that are on the avoid list in `ai-tells.md` are out.
3. Look through a real catalogue (Google Fonts, Bunny Fonts, Fontshare, Velvetyne, or a paid foundry if there's budget) with the object in mind. A museum caption, a fabric label, a concert poster, a mid-century diner receipt.
4. Check the result against your first instinct. "Elegant" doesn't have to mean serif. "Warm" doesn't have to mean soft. If you've ended up back at your first instinct, go round again.
5. Check that it has the weights you need and proper numerals if there are prices.

Hosted fonts are fine in a mock-up. Self-host them before launch.

## 5. Build the home pages

- One self-contained HTML file each: `mockups/direction-a.html` and so on. Inline the CSS. Tailwind's CDN is acceptable here and only here.
- **Real words from the brief.** Never lorem ipsum. Copy is design: a generic headline can't be saved by good type.
- Real photographs if supplied. Otherwise honest placeholders: a drawn illustration or a labelled frame saying what photograph goes there. Stock images never pose as the owner's own work.
- Make it behave: working navigation, a phone menu, hover and focus states, and a plausible version of the one action.
- Write in the owner's voice. No em dashes, no stock words, and no invented numbers or testimonials. A real proof point, or a labelled gap.
- Name the colours by job (see `house-style.md`), so the winning direction can be re-skinned cheaply.

## 6. Look at your own work

For each direction:

```
node <skill-folder>/scripts/check-site.mjs mockups/direction-a.html --out qa/direction-a
```

Read the desktop and phone images in `slices/` and judge them honestly. Work through:

- Fix everything under "Must fix".
- Does it pass the glance test in `ai-tells.md`? Is it one of the swapped defaults listed there? If so, replace it before the owner sees it.
- Error messages or panels showing on load? Text colliding with a drawing? Fix what the inspector can't see.
- Is the one action obvious within a second?
- Does the first screen say what's for sale?
- If you covered the logo, could this be a competitor's site? Then it isn't finished.

## 7. Present them

Copy `assets/templates/compare.html` to `mockups/index.html` and fill in the three one-line ideas. It shows each direction at desktop or phone width in one window, and opens by double-click.

Tell the owner in plain English what each direction is trying to do, which you'd pick and why. Ask what they'd take from each.

## 8. Lock the winner

Allow one round of mixing ("A's hero with B's colours"). Then write `DESIGN.md` from `assets/templates/DESIGN.md`. It follows the DESIGN.md format published by Google Labs, the closest thing to a standard, though still alpha. Google's `npx @google/design.md lint` command printed nothing on Windows in testing, even on a broken file, so silence doesn't mean a pass. Measure the contrast pairs yourself and write the figures in the file.

From here every page follows DESIGN.md. Changes to the look change that file first.

## 9. Extend it

Copy the winner to `site/index.html` and build the other page types there, usually a service or product page, an about page and a contact page, in the locked system. `mockups/` stays as the record of the choice, and Stage 4 carries on in `site/`. Vary section rhythm from page to page. Show the owner how it looks and works before starting Stage 3.
