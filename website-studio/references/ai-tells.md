# How to avoid looking AI-made

**The glance test:** if someone could look at the page and say "AI made that" without hesitating, it fails. They should ask how it was made, not which AI made it.

This list was current in November 2026 and it ages quickly. When everyone avoids one default, a new one forms. Treat it as a floor and keep your own judgement.

## The tells

The code is what the inspector reports, and what to pass to `--allow` if the owner knowingly keeps it.

| Tell | Do this instead | Code |
|---|---|---|
| Oval pill badges and buttons | A shape chosen for the brand: square, slightly rounded, or plain text | `pills` |
| Reflex fonts (list below) | The procedure in `mockups.md` | `reflex-font` |
| Gradient-filled text | One solid colour. Emphasis through weight or size | `gradient-text` |
| Purple or indigo gradients | A palette taken from the brand or its physical object | `purple-gradient` |
| Italic accent words in headlines, often gold | Weight, scale, or one word in a solid colour | `italic-accent` |
| Coloured stripe down one side of a card | A full hairline, a tint, or nothing | `side-stripe` |
| Three or more identical cards of icon, heading, text | A ruled list, an uneven layout, one item given more room | `icon-grid` |
| Cards that lift on hover with a shadow | A colour or underline change, or nothing | `hover-lift` |
| Frosted-glass panels | A solid surface | `glass` |
| Circle-tick icons | Plain words, or a tick that belongs to the brand | `circle-tick` |
| A tiny capitalised label above every heading | Keep it on one or two sections at most | `eyebrow-formula` |
| 01, 02, 03 as the default rhythm | Fine once. Make it uneven, or lose the numbers | `numbered-steps` |
| Em dashes everywhere | Commas, full stops, rewrites | `em-dash` |
| Stock copy words | Say the specific thing | `stock-words` |
| Emoji as decoration | Nothing, or a drawn mark | `emoji` |

**The inspector can't see these. Check them yourself:**

- A centred hero sitting above three rounded cards.
- Big-number statistics strips, especially invented ones. "10,000 happy customers" needs to be true.
- Buzzword headlines that could apply to anyone. If a competitor could use the sentence unchanged, rewrite it.
- The same tagline repeated on one screen.
- "It's not X, it's Y" sentences, and sets of three everywhere.
- Colour blocks where a photograph should be, on a business that clearly has photographs to show.
- Every section the same height, the same padding and the same shape.

## The swapped default

Avoiding purple gradients often lands on the next default instead: **warm cream, a display serif, sage or terracotta, small mono labels and hairline rules.** This look is now being named as an AI tell too. Old businesses have their own version: **dark green or navy, brass or gold, an old-style serif and a drawn heirloom object.**

These can be the right answer. Use one only if the brief or brand kit demands it, and write the reason in DESIGN.md. If you find yourself here with no such reason, go back to the object, and look at the owner's strangest reference.

## Reflex fonts

Models reach for these by default, so they've become a signature. Avoid them on new designs unless the brand already uses them:

Fraunces, Newsreader, Lora, Crimson (and Pro, Text), Playfair Display, Cormorant (and Garamond), Syne, IBM Plex (Mono, Sans, Serif), Space Mono, Space Grotesk, Inter, DM Sans, DM Serif (Display, Text), Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Geist, Poppins, Montserrat, Manrope.

A brand that has already committed to one of these keeps it. Identity beats the list. Pass `--allow reflex-font` and note it in DESIGN.md.

## Other craft rules

- Body text at 16px or larger, with lines of about 65 to 75 characters.
- Vary spacing so the page has rhythm.
- Never pure `#000` or `#fff` on a brand surface: tint them slightly towards the brand.
- Animate opacity and transform only. Ease out, no bounce. Respect "reduce motion".
- Don't put a card inside a card. Reach for a modal only after inline options have failed.
- Name things as a customer would: "Book a table", not "Submit". The exception is the final button that commits someone to pay, which must say so. See `uk-legal.md`.

## Credit

The glance test, several of these rules, the font list, colour strategies and scene-sentence idea are adapted from the open-source [impeccable](https://github.com/pbakaus/impeccable) skill by Paul Bakaus (Apache 2.0), which is worth installing alongside this one. Details are in `THIRD-PARTY-NOTICES.md`.
