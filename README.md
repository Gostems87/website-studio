# Website Studio

A Claude Code skill that takes a business from "I need a website" to a fully live site, in plain English, one stage at a time.

Think of it as building a house. It asks how you live, shows you drawings, agrees the wiring, opens a show home people can walk round, then connects the water and electricity and hands over the keys. You say yes at the end of each stage, so nothing expensive or public happens by surprise.

## The five stages

**1. Design survey.** Twelve plain questions at most. What are you selling, who buys it, and what's the one thing a visitor should do? Ramble, paste links or send photos. Claude pulls out the answers and reads them back on one page.

**2. Visual mock-ups.** Three genuinely different home pages, written with your real words, that you can click around on a desktop or phone view. You pick one and mix in anything you liked from the others. That choice becomes the locked design for the whole site.

**3. Functionality survey.** Do you need forms, calculators, apps, a database, logins, payments, email or bookings? Each one gets a line showing what it does, which service would power it, what that costs each month, and who owns the account. Anything that isn't earning its keep comes off the list.

**4. Shareable preview.** The whole site, looking and behaving as it will, with safe stand-ins behind the scenes. Forms explain where they'd send. Checkouts take no money. Share it as a file, or as a temporary web link on Vercel.

**5. The plumbing.** Buy the domain, connect the real services, set up email on your own address, draft the legal pages, run the final checks, launch and get a handover sheet showing who owns what and when it renews.

## What makes it different

**It avoids the AI look.** The design guidance comes from real builds and their reviews, including the mistakes, and warns against the look that's replacing purple gradients as the new AI default.

**It looks at its own work.** A built-in inspector opens each page in a real browser on a desktop and a phone, takes full screenshots and checks for sideways scrolling, broken images, poor contrast, buttons too small for a thumb, tell-tale AI design habits and missing go-live items.

**It tells you the awkward things early.** Which free plans don't allow business use. Which free databases go to sleep. What a Vercel link needs before a client can open it. What has to appear on a UK business website. The figures are dated and the skill re-checks them before quoting.

**You stay in charge.** It stops and asks before putting anything on a public address, buying anything, changing a domain already in use, switching on real payments, emailing real people or deleting anything. Every account ends up in the business owner's name.

## What you need

- [Claude Code](https://claude.com/claude-code)
- [Node.js](https://nodejs.org) 22 or newer
- Google Chrome or Microsoft Edge, for the inspector
- Stages 1 to 3 cost nothing beyond Claude Code. Costs for hosting, the domain and services come later, and you approve them first

## Install

**Easiest:** open Claude Code and say:

> Install the Claude Code skill from https://github.com/Gostems87/website-studio into my global skills folder.

**By hand:**

1. On this page click the green **Code** button, then **Download ZIP**, and unzip it.
2. Inside you'll find a folder called `website-studio` with a `SKILL.md` file in it. Copy that inner folder into `.claude\skills\` in your user folder (`C:\Users\<your-username>\.claude\skills\` on Windows, `~/.claude/skills/` on a Mac). Create the `skills` folder if it isn't there.
3. Restart Claude Code.

## Use it

Just ask:

> I need a website for my dog-grooming business.

> Mock up a new site for this client. Here's their current one: example.co.uk

> We've got the design agreed. Put it on a link I can share.

> The preview's approved. Let's connect the domain and go live.

It remembers which stage you've reached through files in your project folder, so you can stop and come back.

## Good to know

- UK focus. The legal checklist and prices are written for UK businesses. Elsewhere, the design and build stages work as they are, and the legal file needs replacing with local rules.
- The legal checklist is a prompt for sensible decisions and isn't legal advice. The skill never declares a site "compliant", and it hands you a list of items for a person to decide.
- Supplier prices and terms were checked on 9 November 2026. The sources are in [research-2026-11.md](website-studio/references/research-2026-11.md).

## What's in this repository

`website-studio/` is the skill itself, the folder you copy. `SKILL.md` is the method, `references/` holds the detail for each stage and the dated research behind it, `assets/` holds the templates and preview kit, `scripts/check-site.mjs` is the inspector, and the licence files sit alongside.

## Credit

Parts of the design guidance, including the font-choosing method, font-avoid list, glance test, colour strategies and scene sentence, are adapted from the open-source [impeccable](https://github.com/pbakaus/impeccable) skill by Paul Bakaus (Apache 2.0), which pairs well with this one. The `DESIGN.md` template follows the [format published by Google Labs](https://github.com/google-labs-code/design.md).

## Licence

MIT: see [LICENSE](LICENSE). Use it, change it, share it, at your own risk, as the licence says. A few parts adapted from impeccable stay under Apache 2.0, and [the notices file](website-studio/THIRD-PARTY-NOTICES.md) lists them.
