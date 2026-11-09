# Stage 3: the functionality survey

Think of this as the wiring list. Before anyone pulls a cable, agree what needs power, what it'll cost each month and who pays the bill.

**Default to no back end.** Every moving part is something that can break, needs updating and costs money. Add one only when the owner can say what it earns.

Prices were read from suppliers' pages on 9 November 2026 and change often. **Re-read the supplier's page before quoting**, and write the date in `SCOPE.md`. Sources are in `research-2026-11.md`, next to this file. Convert dollars to pounds at the day's rate when reading costs back to the owner.

## Contents
- [The survey](#the-survey)
- [Stand-ins and real services](#stand-ins-and-real-services)
- [Prices at a glance](#prices-at-a-glance)
- [Uploads](#uploads)
- [Picking the database and login](#picking-the-database-and-login)
- [Calculators and AI features](#calculators-and-ai-features)
- [Writing SCOPE.md](#writing-scopemd)

## The survey

Go through these in plain words, using what the brief already tells you. For each yes, ask the follow-ups.

| Question | Follow-ups |
|---|---|
| **Forms.** Do people need to send you anything? | What fields? Who receives it? Roughly how many a month? Do they need a confirmation reply? |
| **Uploads.** Do people need to send photos or documents? | What kind, how big, how many? Who sees them, and when can they be deleted? |
| **Calculators, quotes, quizzes.** Should the site work anything out? | What goes in, what comes out? Who owns the formula, and is it secret? Must the result be saved or emailed? |
| **Apps inside the site.** Is there a tool people would use, or anything AI-powered? | What does it do? Who can use it? What would a runaway bill look like? |
| **Memory.** Does the site need to remember anything between visits? | What, for how long, and who looks at it? Often a spreadsheet or email inbox is enough. |
| **Logins.** Do people need their own private area? | Customers, staff or both? What do they see? Who approves them? If one private page for a few people, a shared password may do. |
| **Payments.** Will you take money? | One-off, deposits or subscriptions? How many products? Stock? Delivery rules and charges? |
| **Email.** Does the site need to send email? | Receipts and confirmations? Newsletters? Do you want an address at your own domain? |
| **Bookings.** Do people book a time, a table or a room? | One calendar or several? Deposits? Does it have to sync with an existing system? |
| **Editing.** Who'll change the words and photos, and how often? | Weekly, monthly or rarely? Is emailing the builder acceptable? |
| **Connections.** Does it need to talk to anything you already use? | CRM, accounts package, mailing list, stock system. |
| **Tracking.** Do you want to know how many people visit? | Is a simple count enough? Do you advertise? This decides whether a cookie banner is needed. |

## Stand-ins and real services

Every feature gets a stand-in for the preview, so the owner can try the experience before paying for the plumbing. A stand-in must be honest about what it is.

| Feature | Preview stand-in | The real thing |
|---|---|---|
| Form | Validates, then shows "on the live site this would be emailed to [name]". `assets/snippets/contact-form.html` does this, and offers a mailto link if a live send fails | Web3Forms or Formspree at low volume. A server route plus Resend for branded replies |
| File upload | A file picker showing the chosen file's name and a thumbnail, with "on the live site this is attached to your enquiry. Nothing has left your device". A mailto fallback can't attach files, so tell people to add it themselves | See [uploads](#uploads) |
| Calculator | The real logic, in the browser, if the formula isn't secret | The same in the browser, or a server route if it's secret |
| AI tool | Canned example answers, clearly labelled | A server route with every guard below |
| Database | Fictional data in a JSON file or the browser's storage | See below |
| Login | A pretend sign-in with a demo account and fictional data | Clerk or Supabase Auth. Never hand-rolled |
| Basket | Real behaviour in browser storage, wrapped in try/catch | Stripe Checkout, or Shopify for many products |
| Payment | A banner reading "Demo: no payment will be taken", with **disabled** card fields showing example text. No supplier logos, and no field that could capture a real card | Stripe Payment Links or hosted Checkout, so card details never touch the site |
| Sent email | Show the email on screen as it would arrive | Resend or Postmark |
| Booking | The date picker and a request form | Cal.com, or the system the owner already uses |
| Owner editing | A note on how it'll work | Pages CMS or Keystatic for simple sites, TinaCMS for richer editing |
| Visitor counts | Nothing. No tracking on previews | Cloudflare Web Analytics or Vercel Web Analytics. See `uk-legal.md` |

Invented prices in a preview carry a visible "indicative" tag.

## Prices at a glance

USD unless shown. As of 9 November 2026.

| Need | Option | Cost and catch |
|---|---|---|
| Forms | Web3Forms | Free to 250 a month. Pro $12 a month. Commercial terms not confirmed, so read them |
| | Formspree | Free to 50 a month, labelled for testing. Paid from $15 |
| Sending email | Resend | Free to 3,000 a month, 100 a day. Pro $20 |
| | Postmark | Free to 100 a month. From $15 for 10,000 |
| Database | Supabase | Free tier **pauses after a week idle**, so it isn't for a live client site. Pro from $25 a month |
| | Neon | Free tier has 1 GB per project and sleeps after 5 idle minutes, waking on the next request |
| | Turso | Free tier 5 GB. Developer $4.99 a month |
| | Convex | Free tier described as for personal projects and prototypes. Pro $25 per developer |
| Login | Clerk | Free to 50,000 monthly retained users. Pro $25 a month |
| | Supabase Auth | Included with Supabase |
| Payments | Stripe (UK) | Standard UK cards 1.5% + 20p, premium UK cards 2.8% + 20p, EEA 2.5% + 20p, international 3.15% + 20p. No monthly fee |
| Shop | Shopify (UK) | Basic £25 a month, or £19 paid yearly, and 2% + 25p online |
| Bookings | Cal.com | Free for one user. Teams $12 per user a month |
| Bot protection | Cloudflare Turnstile | Free tier, unlimited checks |
| Visitor counts | Cloudflare Web Analytics | Free. Says it uses no cookies or local storage to collect metrics. Works by pasting a script, with no DNS change |
| | Vercel Web Analytics | Included limits vary by plan. No third-party cookies; the visitor hash is discarded after 24 hours |

Hosting and domain costs are in `preview.md` and `plumbing.md`.

## Uploads

Photos and documents are personal data the moment they show a person, a home or a name. Pick the cheapest of these that works:

1. **No upload.** The confirmation email says "reply with your photos". Costs nothing, and the files live in an inbox the owner already looks after.
2. **A form service's upload feature.** Web3Forms includes it on Pro ($12 a month). Check the current size limits.
3. **A server route and storage**, such as Supabase Storage or Vercel Blob, for large files or files people come back to. Check file type and size on the server, keep the bucket private, and generate short-lived links.

Whichever you choose, write how long the files are kept in the privacy notice. Phone photos can carry the location they were taken, which matters if they ever get published.

## Picking the database and login

**Does it really need a database?** Enquiries can live in an inbox. A small product list can live in a file. Add a database when several people change the same data, customers have accounts, or the site has to look things up.

**One service or several?** If the site needs login, data and file storage together, Supabase on its paid plan keeps it under one roof. If it only needs a small data store, Neon or Turso is simpler.

**Login.** Prefer Clerk, or Supabase Auth when already using Supabase. Better Auth is a reasonable open-source option, now owned by Vercel. Don't start new builds on Auth.js, which has passed to Better Auth's stewardship and which third parties now describe as legacy. Never write your own.

**A shared password is not a login.** One password protecting one private page is fine (it's how many small sites gate a client area). It doesn't identify anybody and can't be revoked for one person.

**Check these in AI-generated data code:**

- Supabase's public key is meant to be visible, so every table needs row-level security switched on, or anyone can read it.
- Every server action must check who's asking, on the server. Hiding a button protects nothing.
- Have a person review anything generated for logins, payments or data access.

## Calculators and AI features

If a calculator has no secret and saves nothing, keep it in the browser. Nothing to host, nothing to attack.

An AI feature on a public page is a meter anyone can run up. It needs every one of these, and `assets/snippets/request-guard.ts` provides most of them:

1. The key in server environment variables only. Never with a public prefix like `NEXT_PUBLIC_`.
2. A **spend limit at the provider**. On Anthropic's platform you can't set one on the default workspace, so create a dedicated workspace for this site and cap that.
3. A daily limit across the whole site, in the app. Per-visitor limits are easy to dodge, so this is the one that matters most.
4. A per-visitor rate limit. In-memory counting doesn't work reliably on serverless hosting, so use a shared store such as Upstash Redis.
5. Caps on input length and output tokens.
6. Bot protection on the form.
7. An off switch. The guard's shared `feature-off` key works immediately. An environment variable only reaches new deployments, so it needs a redeploy.
8. A friendly message when it's busy or switched off, never a raw error.
9. A test: try to exceed each limit and confirm it stops.

Ask the model for structured JSON so the result can be displayed predictably. Don't log what visitors type.

## Writing SCOPE.md

Fill in `assets/templates/SCOPE.md`: one row per feature, then the total monthly and yearly running cost, then what was left out and why. Include hosting and domain. Read it back to the owner in pounds wherever possible, and say plainly which features cost the most to run.

Challenge anything that doesn't serve the one action. "Do you need that at launch, or could it come in month three?"
