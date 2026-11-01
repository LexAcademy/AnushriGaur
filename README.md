# Lex Academy website
Responsive static website for UPSC Law Optional test series and mentorship with Advocate Anushri Gaur.

## Included
- `index.html` — homepage, educator profile, achievements, test-series and mentorship sections, enquiry form
- `styles.css` — responsive design and theme
- `config.js` — public settings, including Google Apps Script URL
- `app.js` — navigation and enquiry form submission
- `google-apps-script.gs` — Google Sheets enquiry receiver
- `privacy.html`, `terms.html` — draft policy pages to complete before launch
- `SETUP-GUIDE.md` — step-by-step deployment and editing instructions

## Database and cost
This version uses Google Sheets + Apps Script rather than Supabase. Keep the spreadsheet private. The Apps Script web app URL is public by design so visitors can submit enquiries; it is not a secret. It is an enquiry intake endpoint, not a secure student portal. Check Google's current free quotas/terms. Hosting can use GitHub Pages or Cloudflare Pages on their free tiers; custom domain names may cost extra.

Read `SETUP-GUIDE.md` before deployment. This package is not deployed or connected to a live database yet.
