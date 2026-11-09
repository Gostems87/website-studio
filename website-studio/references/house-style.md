# House style: moves proven on real builds

Open this in Stage 2, after the owner's brief is written. These moves have been tested on real sites and survived review.

They're moves, not templates. A site assembled from all of them looks like a template. Pick what the brief earns.

## Contents
- [The moves that travel to any project](#the-moves-that-travel-to-any-project)
- [Recipe 1: the working thing as the pitch](#recipe-1-the-working-thing-as-the-pitch)
- [Recipe 2: the supplied brand kit](#recipe-2-the-supplied-brand-kit)
- [Recipe 3: heritage without the costume](#recipe-3-heritage-without-the-costume)
- [Common faults in reviews](#common-faults-in-reviews)

## The moves that travel to any project

**Write a scene before choosing a colour** (an idea adapted from impeccable, see `THIRD-PARTY-NOTICES.md`). One sentence: who, where, what light, what mood. "A Sunday morning on a boat, a phone held up against low sun, looking for someone who can fix an engine before Tuesday." If the sentence doesn't force light or dark, add detail until it does. Put it at the top of DESIGN.md.

**Name colours by job, then give them values.** `surface`, `ink`, `ink-soft`, `accent`, `accent-text`, `rule`. The layout only ever refers to jobs. When the brand changes, change the values and the whole site re-skins with no layout work.

**Keep a darker accent for text.** A bright accent that looks good as a button often fails contrast as small text. Define two: `accent` for fills, `accent-text` for words. Record each pairing's contrast ratio in DESIGN.md.

**Let one colour be a signal.** If a colour carries a meaning, use it for nothing else.

**Separate sections with rules and bands.** A hairline in a faint tint of the ink, or a full band of the brand's dark colour. Don't invent extra tints. If the kit has one light colour, the site has one light colour.

**Get voice from weight and scale.** Light at display size against Semibold labels, or a medium-weight headline with one word dropped to Light. Big jumps: 1.25 or more between steps, and hero type set with `clamp()` so it fills a desktop and still fits a phone.

**Check the numerals.** Some typefaces default to old-style figures, so £7.50 reads as "£7.5o". On any site with prices set `font-variant-numeric: lining-nums`, plus `tabular-nums` where figures stack in columns.

**Write the anti-references.** List in PRODUCT.md what this site must not look like, by name. Include any earlier version of the site if it was wrong.

**Record what's kept on purpose.** If the owner likes something the checks object to, write it in DESIGN.md under "Kept on purpose" and pass it to the inspector with `--allow`. Their call beats the rulebook, and the record stops a later session "fixing" it.

**Be honest about placeholders.** Drawn illustrations, labelled frames, or a plain caption saying the photograph is coming. Stock photos never pose as the owner's own work, staff or products. Invented prices get a visible "indicative" tag.

**Give the waiting state some character.** A loader drawn in the site's own colours, a sentence in the site's own voice. Empty, loading, error and success states are where templates show themselves.

## Recipe 1: the working thing as the pitch

For consultants, studios, software, anyone whose claim is "I'm good at this". The idea: **don't describe the skill, let the visitor use it on the page.**

- Hero: one short, memorable line at very large scale, with weight contrast and perhaps one word in the accent colour.
- Beside it, instead of a row of big statistics, a narrow ruled column of a few plain facts.
- Two actions only: try it, and get one.
- Each tool section: a label and title on one side, a two-line explanation on the other, a hairline beneath, then the working thing.
- Results appear in a contrasting panel beside the inputs, so input and output read as one machine.
- What you offer goes in a dark band as a ruled list, not cards.
- End with a direct question and a short form.
- Details that help: a small corner radius, a faint page texture, a staggered rise on load that respects reduced motion.

**Starting values only. Change them.** Paper `#f1eee4`, panel `#e7e2d4`, ink `#191812`, ink-soft `#4e4b40`, hairline `#d3cdbe`, signal `#d9532a`, signal-text `#ab3817`.

**Warning.** Warm paper, near-black ink, mono labels and hairlines sit close to the most copied look in AI design right now. It earns its place only when the working tool makes the page unmistakably useful. Without that, choose something else. Check any filled button in a bright accent: white text on a strong orange usually fails contrast at button size, so darken the fill or use dark text.

## Recipe 2: the supplied brand kit

For a client who already has a logo, colours and fonts. The kit is the law and the site's job is to obey it beautifully.

- **DESIGN.md opens by naming the kit as the source of truth.** Anything the kit didn't supply is marked as a house choice.
- Map the kit to jobs in a table: token, hex, kit colour name, where it's used. Include a row for any derived colour and justify it.
- **One family, used hard.** If the kit gives one typeface, don't add a second. Use its full weight range. Self-host the font files so nothing loads from a third party.
- **The logo is drawn once** as an SVG `<symbol>`, cropped to the artwork, coloured through CSS variables, and only ever in the variants the kit supplies. Write down its minimum size and test that size on a phone. Never split it, stretch it or retype it as live text.
- Name the colour strategy, and let it match how the brand describes itself. A brand that calls itself bold shouldn't be a pale page with one coloured button.
- **Read like the thing being sold.** Match the page structure to the real-world object the customer already understands: a price list, a timetable, a catalogue, a menu.
- **The basket is a quiet companion.** A drawer from the right, full-width on phones, about 420px on desktop. Hide it with `visibility: hidden` when closed, or its shadow bleeds onto the page edge and its buttons stay in the tab order.
- **A site can launch before its shop.** A waitlist or an order-by-email button is honest and captures demand before any payment system exists. It collects real personal data, so it belongs in Stage 5, with the owner's yes and a privacy notice live. In a preview, it's a stand-in like any other.

## Recipe 3: heritage without the costume

For old firms, makers and anything with history. Age comes through type, colour and detail, never flags or bunting.

- Pick the physical object first: a stamp and a ledger, a shop ticket, a printed label. Everything follows from it.
- Square corners everywhere. Tags are letterpress tickets: a rectangle, a 1px rule, uppercase with tracking, or plain small caps separated by middle dots.
- One stamp or roundel in SVG can be the brand mark and the favicon.
- Prices in the same ink as their heading. Coloured prices look like a supermarket.
- Photography full-bleed or in a plain 1px frame. Never rounded, never in circles.
- Motion: opacity and transform only, under 250ms, no bounce.
- Check any metallic accent. It often looks right as a rule and fails as small text, so keep a darker version for words.
- This recipe sits next to the swapped default in `ai-tells.md`. Make sure the object is specific to this business, or choose another route.

## Common faults in reviews

Check for these in every design review.

- **The thing for sale is buried.** Get to the offer within about one and a half screens.
- **Products as postage stamps.** Where the product is the hero, let some items run large.
- **Long lists of identical rows.** Any long list needs a change of pace: a feature row, a pull-out, a photograph.
- **The same tagline repeated** in the first screen. Say it once.
- **A label over every heading.** Fine once or twice. On every section it's a formula.
- **The four-up numbered steps grid.** Make it uneven, or let one step carry a photograph.
- **Contact buttons that aren't contact.** The main button in a contact section should start a conversation.
- **Quiet promises broken.** Tap targets smaller than the page's own rule. A logo that shrinks below its own minimum on phones.
- **Third-party logos in photographs.** Look at clothing, vans, mugs and signs in every image before it goes on the page.
