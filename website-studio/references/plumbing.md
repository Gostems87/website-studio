# Stage 5: the plumbing

Connect the water and electricity. Work through this in order and tick each step off in `studio/GO-LIVE.md`.

Details change, so read the supplier's current instructions for anything that touches DNS, payments or email. Prices and dates here were checked on 9 November 2026.

## Contents
1. [Accounts](#1-accounts)
2. [The domain](#2-the-domain)
3. [Replace the stand-ins](#3-replace-the-stand-ins)
4. [Hosting](#4-hosting)
5. [Connect the domain](#5-connect-the-domain)
6. [Email on the domain](#6-email-on-the-domain)
7. [Legal pages](#7-legal-pages)
8. [Being found](#8-being-found)
9. [Security headers](#9-security-headers)
10. [Remove the scaffolding](#10-remove-the-scaffolding)
11. [Final checks](#11-final-checks)
12. [Launch and handover](#12-launch-and-handover)

## 1. Accounts

The owner creates every account in their own name and invites the builder. The business should be able to fire its web person without losing its website. Needed: domain registrar, hosting, Stripe, email and analytics, whichever apply. Use a shared business email for logins, with two-step sign-in switched on.

Passwords and keys never go through chat, email or a commit.

## 2. The domain

- Search for the name and check it's not close to a trademark or competitor. Prefer short, spellable, `.co.uk` or `.com`.
- Compare **renewal** prices. Some registrars have cheap first years and steep renewals.
- Options include Namecheap and Cloudflare. Cloudflare sells at cost, and its documents confirm transfers of `.co.uk` domains but don't clearly confirm new registrations, so check before relying on it.
- Switch on auto-renew and write the renewal date in `GO-LIVE.md`. A lapsed domain takes the website and email with it.

Get a clear yes before buying.

## 3. Replace the stand-ins

Go through `SCOPE.md` a row at a time. Keep a test mode on everything until the final checks.

- Keys go in the host's environment variables, and in a git-ignored `.env` locally. Add a `.env.example` listing names without values.
- A key meant to be public, such as a Web3Forms access key or Stripe publishable key, may sit in the page. Mark it in a comment so nobody mistakes it for a leak.

**Forms.** Send a real test. Keep the honeypot, add Turnstile if spam appears. Check it arrives, and check the failure message. If sending fails, keep what the visitor typed.

**Uploads.** Test the size and type limits, and confirm the files aren't publicly reachable. See `functionality.md`.

**Email.** Send from your own domain after step 6. Set reply-to as the customer on enquiry notifications.

**Database.** Row-level security on every table, backups on, a paid tier if the free one pauses.

**Logins.** Test sign-up, sign-in, sign-out and password reset. Test that one user cannot reach another's data by changing an address or ID.

**Payments.**
- Use Stripe Payment Links or hosted Checkout, so card details go directly to Stripe and the site never touches them. Stripe says this reduces your security obligations, though a business must still complete its annual security attestation. Confirm the right form and how Strong Customer Authentication applies with Stripe.
- Build in test mode. Mark an order paid only from a **signature-verified webhook**, never from the visitor landing on a thank-you page, which anyone can visit.
- Show the full price, including any compulsory charges, up front.
- For a single fixed sum, such as a deposit, a Stripe Payment Link is enough. Decide with the owner what happens if the job is cancelled, and put it in the terms.

**AI features.** Every guard in `functionality.md`, tested by trying to break the limits.

## 4. Hosting

Pick a host that allows commercial use and fits the budget in `SCOPE.md`:

| Host | Cost | Suits |
|---|---|---|
| Vercel Pro | $20 a month per seat, including $20 of usage | Next.js, server routes, logins, the path this file describes |
| Cloudflare Workers | Static requests free and unlimited | Static sites on a tight budget. Cloudflare now steers new projects here rather than Pages. Set headers in `_headers`, add the domain in the dashboard, and read Cloudflare's current steps (the bare domain generally needs the DNS hosted at Cloudflare) |

If the budget and the scope conflict, tell the owner which feature is forcing the cost. Self-host fonts. Compress images and set their width and height so the page doesn't jump around.

Use a new project for the real site if the preview name was temporary.

## 5. Connect the domain

**Before touching anything, write down every existing DNS record**, especially MX, SPF, DKIM and DMARC. Changing nameservers without copying these stops the owner's email. If the domain is already in use, get a clear yes first.

Never type DNS values from memory or from this file. Vercel's documentation now gives project-specific values and sources disagree on the older shared ones. Read them from the project's Domains page, or:

```
vercel domains add example.co.uk <project-name>
vercel domains inspect example.co.uk
```

- Add both `example.co.uk` and `www.example.co.uk`. One is the main address and the other redirects to it.
- Remove any old AAAA records on the bare domain.
- HTTPS is issued automatically once the records are right.
- Changes can take from minutes to a day or so to spread.

## 6. Email on the domain

Choose by need:

| Need | Use |
|---|---|
| hello@ forwarded to an existing inbox | Cloudflare Email Routing: free, receive-and-forward only, and the domain's DNS must be on Cloudflare |
| Real mailboxes | Google Workspace (Business Starter £5.90 per user a month, list price) or Microsoft 365 (around £5.40 to £5.75, sources vary) |
| Website confirmations | Resend or Postmark, set up on its own subdomain, such as `mail.example.co.uk` |

**If nothing at all sends mail as this domain,** publish two records so nobody can forge mail from it: an SPF record of `v=spf1 -all` and a DMARC record of `v=DMARC1; p=reject`. First list every possible sender with the owner: a mailbox on the domain, invoicing or booking software, a printer, a mailing list. If there's any doubt, don't publish these, because they make genuine mail from the domain fail. An owner whose address is on a different domain, such as a Gmail, is the typical case.

For any domain that sends mail, publish all three of these. Think of them as the signed letterhead that proves mail is really from you:

- **SPF:** who may send for this domain. One record only; merge them if there are several.
- **DKIM:** a signature. The email provider supplies the record.
- **DMARC:** what to do with failures. Start with `v=DMARC1; p=none; rua=mailto:<owner's address>`, and tighten later.

Gmail and Outlook only strictly require all three from bulk senders, but a small business benefits from them anyway. Test by sending to a Gmail and an Outlook address and checking it reaches the inbox.

## 7. Legal pages

Open `uk-legal.md`. Draft the privacy notice, footer details, cookie plan and, for shops, the terms. Mark them as drafts for the owner to approve.

## 8. Being found

- A unique title and description on every page, one main heading, descriptive addresses.
- `sitemap.xml` and `robots.txt`. Set a canonical address.
- A social share image and `og:` tags, a favicon.
- `LocalBusiness` structured data for local firms, matching the real name, address and phone number exactly.
- Verify the site in Google Search Console and submit the sitemap. Check Google's current steps. For local firms, a Google Business Profile usually matters more than anything on the site.

**Don't promise AI-search visibility or sell `llms.txt`.** Google says AI search needs no special files or markup, and normal good practice is enough. A 137,000-domain study by Ahrefs (June 2026) found 97 percent of `llms.txt` files got no requests at all. Clear, well-structured pages with real information are the honest answer.

## 9. Security headers

In `vercel.json`, replacing the preview's `X-Robots-Tag`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
    ]
  }]
}
```

Remove `microphone=()` if the site uses voice input. Vercel adds HTTPS enforcement itself. Add a Content-Security-Policy once you know which outside services the page uses; a wrong one breaks the site, so test it in report-only mode first.

## 10. Remove the scaffolding

Remove this preview code from the site:

- the preview ribbon on every page
- `noindex` in the pages and `X-Robots-Tag` in `vercel.json`
- the `middleware.js` password gate and `PREVIEW_PASSWORD`
- every demo banner, mock checkout and "on the live site" message, including the block marked as preview code in the contact form
- "indicative" tags, once real prices are in
- Tailwind's CDN, if it was used

## 11. Final checks

```
node <skill-folder>/scripts/check-site.mjs https://www.example.co.uk --stage live --forbid "Name Never To Appear"
```

The checker also tests DNS, email records, redirects, tracking cookies and headers. Then do these by hand:

- [ ] Switch Stripe to live keys and make one real purchase, then refund it (Stripe keeps its fee, so this costs a few pence)
- [ ] One real form submission, received in the right inbox
- [ ] Every email the site sends, read on a phone
- [ ] Every page on a real phone
- [ ] Keyboard only: can you reach and use everything?
- [ ] Core Web Vitals: main content within 2.5 seconds, interactions within 200ms, layout shift under 0.1. Field data takes weeks to arrive; use Google's PageSpeed Insights at launch
- [ ] Fresh-eyes review by someone who didn't build it

## 12. Launch and handover

Get the owner's go. Deploy. Check the address yourself, signed out, on a phone.

Fill in the handover section of `studio/GO-LIVE.md` and walk the owner through it: who owns each account, renewal dates, monthly costs, how to change something, and what to do if the site goes down.

Take down any temporary preview once the owner agrees.
