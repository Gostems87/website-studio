# UK legal checklist

**This isn't legal advice, and never describe a site as "compliant".** Draft the pages, then hand the owner the list of decisions at the end. If the business isn't based in the UK, say that this file doesn't apply and find the local rules.

Checked 9 November 2026. Where a date or rule is marked "verify", read the current government page before relying on it. Sources are in `research-2026-11.md`, next to this file.

## Cookies and tracking

The rules changed on 5 February 2026, when the Data (Use and Access) Act 2025 amended PECR. The ICO finalised its guidance on 29 April 2026. Maximum fines rose to UK GDPR levels: £17.5 million or 4 percent of global turnover.

| What the site does | What's needed |
|---|---|
| Only strictly necessary cookies | No banner. Explain them in the privacy notice |
| Remembers appearance or preferences | No consent needed, but clear information and a free, simple opt-out |
| Statistics used only to improve the site, with aggregate output and any supplier acting only as a processor | No consent needed, but clear information and a free, simple opt-out |
| Advertising, tracking pixels, cross-site profiling | Prior consent |
| Embeds that set cookies (maps, videos, social feeds) | Prior consent, or load them only after a click |

**Google Analytics probably doesn't fit the statistics exception**, because data goes to Google for more than just your site. That's an inference and not an ICO ruling. Either put it behind consent, or use a cookieless counter.

**Cookieless doesn't mean exempt.** PECR covers storing or accessing information on a visitor's device, and the ICO doesn't treat cookieless methods as automatically outside it. Treat tools such as Cloudflare Web Analytics and Vercel Web Analytics as relying on the statistics exception. Confirm from the supplier's terms that it acts only as your processor. If it does, no banner is needed, but a plain explanation in the privacy notice and a free, simple opt-out always are. `assets/snippets/visit-counter.html` provides the opt-out for Cloudflare's counter. With Vercel's you have to build it, using its `beforeSend` option and a saved setting.

**Default plan:** no tracking cookies at all, a cookieless counter with an opt-out if any, and no banner unless the scope demands one. A site that needs no banner is faster and nicer to use. If a banner is needed, Accept and Reject must be equally prominent, and nothing fires before Accept. The inspector fails any live page that sets known tracking cookies on first load.

## Privacy notice

Needed if the site collects any personal data, and a contact form counts. Always include:

- who you are and how to contact you
- each purpose, and the lawful basis for it
- how long data is kept
- people's rights, and the right to complain to the ICO
- how to complain to the business itself, a statutory right since 19 June 2026 (verify the current ICO wording)

Where relevant: who receives the data (name each form, email, hosting and payment service), transfers outside the UK (many of these are US companies), legitimate interests, the right to withdraw consent, automated decisions.

Mark it "draft, owner to approve".

**ICO fee:** most businesses handling personal data must pay it, including sole traders, unless exempt. Reported tiers from February 2025 were £52, £78 and £3,763. Remind the owner to check.

## Marketing email

"Join our list" needs a clear, unticked opt-in that says what they'll receive. The exception is the soft opt-in for a business's existing customers on similar products. Every email needs a working unsubscribe. Check the ICO's direct marketing guidance.

## Who you are

Goes in the footer or a contact or legal page.

| Who | Show |
|---|---|
| Any business with a website (E-Commerce Regulations 2002) | Name, a geographic address, an email address, VAT number if registered, and trade or professional register details if any |
| Sole trader or partnership using a trading name | Also full names and an address where documents can be served |
| Limited company | Also registered name, place of registration, company number, registered office, and that it's limited |
| Selling online | Also clear prices, including delivery |

**Working from home?** These rules can put a home address on the public internet. Raise it with the owner before publishing, and have them check whether a business or service address can be used instead.

## Selling to consumers

**Before they buy (Consumer Contracts Regulations 2013):** the main characteristics, total price including delivery, the trader's identity and address, delivery arrangements, and the right to cancel.

**The final button must say they're paying.** Regulation 14 requires wording that makes the obligation to pay clear, such as "Pay now" or "Order with obligation to pay". If it doesn't, the customer isn't bound by the contract. A plain "Book" or "Continue" won't do on that last step.

**14-day right to cancel.** The exceptions include goods made to the customer's specification, goods "liable to deteriorate or expire rapidly", and sealed hygiene goods once unsealed. **Don't write a blanket "no returns" policy.** How far "deteriorate rapidly" stretches for perishable goods with a long shelf life isn't settled by any source found, so get a view from Trading Standards or a solicitor. If the required cancellation information isn't given, the period can be extended by up to 12 months.

**Deposits and services sold online.**

- A consumer generally has 14 days to cancel a service agreed at a distance.
- Accommodation, catering and leisure services for a specific date or period are excluded from that right. A B&B or table deposit may therefore fall outside it, and the owner's own terms and general consumer law decide what happens.
- For other services, the trader mustn't begin within the 14 days unless the consumer expressly asks. Someone who cancels after an early start owes only a proportionate amount, and nothing if the required information wasn't given. The right to cancel ends only once the service is fully performed and the consumer has acknowledged that it would.
- So a deposit form for such a service needs a clear, separate request to start early if that may happen.
- Don't default to "non-refundable". It may not hold. Have a person check the wording.

**Reviews and pricing (Digital Markets, Competition and Consumers Act 2024, in force 6 April 2025).** No fake or incentivised reviews without disclosure. Compulsory fees must be in the headline price rather than appearing at checkout.

**Subscriptions or box schemes.** A new regime under the same Act is reported for January 2027, but the date has moved repeatedly. Verify on gov.uk. Expect requirements for information before signing up, renewal reminders, easy online cancellation and a cooling-off period.

## Accessibility

Build to WCAG 2.2 AA. For private businesses the duty comes from the Equality Act 2010, which requires reasonable adjustments and doesn't name a standard, so WCAG is the sensible target and passing it isn't a legal guarantee.

If the business sells to consumers in the EU, the European Accessibility Act may apply. Micro-businesses are exempt for services only. Flag this for a human check.

## Legal items for a human

Hand this list over, filled in for this project:

- [ ] Privacy notice reviewed and approved by the owner
- [ ] ICO fee paid or exemption confirmed
- [ ] Analytics and cookies decision made, with an opt-out if a counter is used
- [ ] Terms of sale reviewed, if selling
- [ ] Cancellation position confirmed for this product or service, including any deposit
- [ ] Final payment button wording checked
- [ ] Address shown on the site agreed with the owner
- [ ] Subscription rules checked, if applicable
- [ ] Marketing email consent wording checked, if there's a list
- [ ] Sector rules checked (food labelling and allergens, financial promotions, regulated professions and so on)
- [ ] EU customers: accessibility and privacy position checked
- [ ] Permission held for every testimonial, client name and photograph of a person
