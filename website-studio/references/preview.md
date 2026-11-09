# Stage 4: the shareable preview

The show home. It looks and behaves like the finished site, and nothing behind the walls is connected. The owner can walk people round it before paying for domain, email or services.

Hosting terms and link behaviour catch people out, so read "Which way to share it" before offering a link.

## Contents
- [Build it](#build-it)
- [Which way to share it](#which-way-to-share-it)
- [Vercel: the plan comes first](#vercel-the-plan-comes-first)
- [Vercel: a private link](#vercel-a-private-link)
- [Vercel: a public link](#vercel-a-public-link)
- [Adding a password](#adding-a-password)
- [The Cloudflare route](#the-cloudflare-route)
- [Taking feedback](#taking-feedback)

## Build it

1. Build the agreed pages in `site/`, following DESIGN.md.
2. Add every stand-in from `SCOPE.md`.
3. Add the preview kit from `assets/preview-kit/`:
   - `preview-ribbon.html`: paste into every page, straight after `<body>`.
   - `<meta name="robots" content="noindex,nofollow">` on every page.
   - `vercel.json` in `site/`: adds the same instruction as a header and gives clean addresses. On Cloudflare, use `_headers` instead.
4. Publish from inside `site/`, so only that folder goes up. PRODUCT.md, DESIGN.md, `studio/` and `qa/` sit outside it and never leave the machine. Keep working files out of `site/`.
5. Use fictional data only. Real prices are fine when they're public. Invented ones carry an "indicative" tag.
6. Stand-ins collect nothing. No live waitlist, real form send or analytics on a preview.
7. Internal links should work both by double-click and on the host, so use `contact.html` style links.

Then check it. For a Next.js build, run it first and give the inspector its local address.

```
node <skill-folder>/scripts/check-site.mjs site --stage preview --forbid "Name Never To Appear"
```

Fix the failures and read the slices. The inspector doesn't press buttons, so try every stand-in yourself with a browser tool if you have one, or ask the owner to: submit the form empty and then filled in, run the calculator at its limits, walk through the checkout.

## Which way to share it

Get the owner's clear yes before anything goes on an address.

| | Send a file | Private Vercel link | Public link |
|---|---|---|---|
| What it is | A zip of `site/` only | A link that opens one locked preview | A web address anyone can open |
| Who can open it | The people sent it | Anyone with that exact link, until revoked | Anyone with the address |
| Cost | Nothing | Plan rules below | Plan rules below, or free on Cloudflare |
| Best for | One or two people | Most previews | Sharing widely and testing on many phones |

Recommend the file if only one or two people need to see it, or if the budget won't stretch to a host. Zip `site/` and nothing else: the project root holds the brief, the never-say list and possibly secrets. Email filters often strip `.html` attachments, so a zip or a shared drive link is safer.

Otherwise recommend the private link.

## Vercel: the plan comes first

As of Vercel's fair-use page, updated 14 September 2026:

- **The free Hobby plan is for non-commercial personal use only.** Commercial use covers advertising a product or service, taking payment, and being paid to create, update or host the site. A preview of a business's website counts, even for a few weeks.
- **Pro is $20 a month per seat** and includes $20 of usage. One Pro account held by the builder can host many previews.

Tell the owner this before deploying, and put it in `SCOPE.md`. If the cost doesn't fit their budget, send a file or use Cloudflare.

## Vercel: a private link

Ordinary Vercel preview addresses ask the visitor to sign in with Vercel, so a client without an account hits a wall. A Shareable Link gets them past that, for that one deployment, without making anything public. It's available on all plans, limited to one per account on Hobby.

**Name the project yourself.** Left alone, the command takes the name from the folder and can land on an existing project with the same name. Everything here deploys from a folder called `site`, so client B could overwrite client A's preview. The name also appears in addresses, so keep it neutral if the client is confidential.

```
npm install -g vercel
vercel login
cd site
vercel project ls --filter <neutral-project-name>
```

**If that lists a project with exactly this name, stop and choose another.** Vercel won't warn you: adding or linking a name that's taken joins the existing project. When the name is free:

```
vercel project add <neutral-project-name>
vercel link --yes --project <neutral-project-name>
vercel deploy
```

Once linked, the folder remembers its project, and later runs of `vercel deploy` update it.

If a permission rule blocks a command, give the owner those lines to run in their own terminal.

Then, in the Vercel dashboard: open the project, then **Deployments**, then the deployment, then **Share**, and choose **Anyone with the link**. To withdraw it, switch back to **Only people with access**. Each new deployment needs its own share, so share the final one.

Then open the plain deployment address, signed out, and confirm it's locked. An account's default settings can switch protection off.

## Vercel: a public link

Use only if the owner wants a public address, and only after the naming steps above, so the folder is linked to the right project. To Vercel this is a "production" deployment, even though for the business it's only a preview, and `<project-name>.vercel.app` opens for everybody.

```
vercel deploy --prod
```

Then confirm search engines are being told to stay away. In Windows PowerShell type `curl.exe` rather than `curl`.

```
curl -I https://<project-name>.vercel.app
```

Look for `x-robots-tag: noindex`, then open the address on a phone, signed out. `noindex` keeps search engines out but lets anybody in who has the address. A link nobody has guessed isn't protection, so use the private link, a password or a file for anything sensitive.

## Adding a password

| Option | Cost | How it behaves |
|---|---|---|
| The included `middleware.js` | No extra charge | The browser asks for a password. Good for keeping casual visitors out of a public address |
| Vercel Password Protection | $20 per project a month on Pro | Managed by Vercel from the dashboard |

To use the included gate, on a plain static site, copy `middleware.js` from `assets/preview-kit/` into `site/`. On Next.js 16 and later the same logic belongs in `proxy.ts`. Link the folder first, using the naming steps above. Then the owner runs this, because it asks them to type the password:

```
vercel env add PREVIEW_PASSWORD production
vercel deploy --prod
```

It stays locked if the password isn't set. Run the inspector on the local folder, because it can't get past the password, then check the live address with `curl -I`, which should return 401.

This gate hides a preview. It's not a customer login, and it must come out before launch.

## The Cloudflare route

Static files on Cloudflare Workers are free and unlimited. Cloudflare's documents state no commercial restriction on its free plan, but that's an absence of a statement, so read the current terms. Its documents now say to start new projects on Workers rather than Pages. This route suits static sites. If the scope needs server routes, read Cloudflare's current docs first.

Use the `_headers` file from the preview kit in `site/`.

```
cd site
npx wrangler login
npx wrangler deploy --assets . --name <neutral-project-name> --compatibility-date <today, as YYYY-MM-DD>
```

The address is `<neutral-project-name>.<account>.workers.dev`, and it's public. The included password gate doesn't work here, so use a file if the content is sensitive. Get the owner's yes first, as with Vercel.

## Taking feedback

Send the link with three questions, or you'll get "looks nice":

1. Could you tell within five seconds what this business does and what to do next?
2. What did you try to do that didn't work the way you expected?
3. What's missing, or wrong?

Allow one round of changes, then get a yes to move to the plumbing. If the preview isn't going ahead, tell the owner the link is still up and ask whether to take it down.
