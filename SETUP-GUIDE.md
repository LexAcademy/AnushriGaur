# Lex Academy website — setup and editing guide

## Recommended free setup
- **Website hosting:** GitHub Pages (static site hosting; use a public repository only if you are comfortable with the website source being public) or Cloudflare Pages.
- **Enquiry database:** Google Sheets.
- **Form receiver:** Google Apps Script web app.
- **Admin / records:** open the private Sheet while signed in to the academy's Google account. Share it only with trusted administrators.
- **Payments:** manual UPI/bank transfer instructions; verify each payment manually. Do not collect UPI PINs, passwords or card data.
- **Analytics:** optional and can be omitted to keep the site simple and privacy-friendly.

These options can be used without a recurring hosting/database subscription, subject to the providers' current terms and quotas. A custom domain name is optional and normally costs money.

## A. Create the enquiry database in Google Sheets
1. Sign in to the Google account that will own the academy's enquiries.
2. Create a new Google Sheet named `Lex Academy Enquiries`.
3. Copy the Sheet ID from its URL. It is the part between `/d/` and `/edit`, for example `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`.
4. Open **Extensions → Apps Script**.
5. Replace the starter code with the contents of `google-apps-script.gs`.
6. In the code, replace `REPLACE_WITH_GOOGLE_SHEET_ID` with the Sheet ID.
7. Save. Choose `setupSheet` from the function selector and click **Run**. Approve the requested Google permissions. Confirm an `Enquiries` tab appears with headings.
8. In Apps Script choose **Deploy → New deployment → Web app**.
9. Set **Execute as: Me**. Set access to **Anyone** so website visitors can submit an enquiry without signing into Google. Deploy and copy the Web App URL ending in `/exec`.
10. In `config.js`, paste the URL as the value for `googleScriptUrl`.
11. Keep the Google Sheet itself restricted. **Do not** use “Publish to web” and do not share the sheet with “Anyone with the link”.
12. Submit a test enquiry on the published website and verify that one new row appears. Test with a dummy email/phone first, then delete the test row.

**Important security note:** an Apps Script endpoint available to anyone on the internet can receive spam or abusive submissions. The script validates fields and limits length, but that is not a complete anti-spam system. Review the sheet regularly; if abuse occurs, switch the enquiry form to a Google Form with built-in spam controls or add stronger protection. Never store sensitive data in this form.

## B. Optional Google Form fallback
If you prefer the simplest, more robust no-code form:
1. Create a Google Form with fields for name, email, phone, target exam, programme and message.
2. In Form settings, do not require users to sign in unless you intentionally want that restriction.
3. In **Responses**, link it to the private Google Sheet.
4. Copy the public responder link.
5. Paste it into `googleFormUrl` in `config.js`. The “Open enquiry form in a new tab” link will appear.
6. If you use Google Forms, you can remove the custom form section from `index.html` or leave it as a secondary route; do not imply the custom form is connected unless `googleScriptUrl` is configured and tested.

## C. Publish the website free
### Option 1: GitHub Pages
1. Create/sign in to GitHub and create a repository, e.g. `lex-academy-site`.
2. Upload the website files from this folder into the repository root (the files should not be buried in an extra nested folder).
3. In the repository, open **Settings → Pages**.
4. Choose deployment from the `main` branch and `/ (root)`, then Save.
5. Wait for GitHub to publish the site and open the URL shown on the Pages settings screen.
6. After any future changes, upload/commit the changed files; the site republishes automatically.

### Option 2: Cloudflare Pages
1. Create/sign in to Cloudflare and connect your GitHub repository.
2. Create a Pages project, choose the repository, and set framework preset to **None**.
3. Leave build command blank and set the output directory to `/` (repository root).
4. Deploy and use the assigned `pages.dev` address. A custom domain is optional and may cost money.

Free-tier features and quotas can change; confirm the current provider terms before launch. Do not upload private student records or the Google Sheet itself into the website repository.

## D. Change website text
You can use a basic text editor (Notepad, VS Code, etc.). Keep a backup copy before editing.
- **Website name/tagline:** search and replace `Lex Academy` and `Think like a lawyer. Write like a topper.` in `index.html`; also update `config.js` if desired.
- **Hero headline/introduction:** edit the first `<section class="hero" id="home">` in `index.html`.
- **Educator biography/achievements:** edit the `section id="educator"` text in `index.html`. Preserve careful wording and the achievement disclaimer.
- **Test-series content:** edit `section id="programs"`.
- **Mentorship:** edit `section id="mentorship"`.
- **Fees, dates, schedule, contact information:** add only verified, current information. Avoid promising ranks or outcomes.
- **Privacy and refunds:** replace every bracketed placeholder in `privacy.html` and `terms.html` before launch.

Use the existing HTML tags as they are; for example, change only the words inside `<h2>...</h2>` to update a heading. If you remove a section, also check its navigation link.

## E. Change educator photo or other images
1. Obtain a high-quality photo with the educator's permission and rights to use it.
2. Add it to the site folder, e.g. `images/anushri-gaur.jpg`.
3. In `index.html`, find `<div class="profile-art">` and replace that block with:
   `<div class="profile-art photo-panel"><img src="images/anushri-gaur.jpg" alt="Advocate Anushri Gaur"><p>ADVOCATE · LAW OPTIONAL MENTOR</p><a href="https://www.linkedin.com/in/anushri-gaur-aab3ba107/" target="_blank" rel="noopener">View LinkedIn profile ↗</a></div>`
4. Add this to the end of `styles.css`:
   `.photo-panel{display:block;overflow:hidden}.photo-panel img{width:100%;height:280px;object-fit:cover;border-radius:4px}.photo-panel p{margin-top:16px}`
5. Add any new images to the same folder and commit/upload them along with the website. Use compressed JPG/WebP files to keep the site fast. Do not hotlink a photo from LinkedIn; use an authorised local image.

## F. Edit logo, colours and layout
- Colours are defined at the top of `styles.css` under `:root` (`--navy`, `--gold`, `--cream`).
- Fonts are loaded from Google Fonts; if you want no third-party font request, remove the `@import` line and the site falls back to system fonts.
- Logo text and the round “L” mark are in the header and footer of `index.html`. Search for `brand-mark`.
- The site is responsive; check desktop and mobile after changing layout styles.

## G. Admin workflow and student records
- The private Google Sheet is the admin console. Use columns to update `Status` (e.g. New, Contacted, Payment instructions sent, Payment received, Enrolled, Closed).
- Filter rows, use Google Sheets filters, and add columns only if needed. Limit access to the academy owner and named staff.
- Enable two-step verification on the Google account. Do not share its password.
- Consider a separate academy Google account rather than a personal account.
- Collect only data you need, define how long you retain it, and delete enquiries when no longer required.

## H. Analytics
To keep the setup free and simple, analytics are not enabled by default. You can add a privacy-respecting analytics provider later, after reviewing its free-tier terms and updating the privacy notice. Hosting providers may show basic traffic information depending on configuration.

## I. Pre-launch checklist
- [ ] Confirm spelling, achievements and claims with Advocate Anushri Gaur.
- [ ] Add approved educator photo, official email and WhatsApp number if desired.
- [ ] Set up the Google Sheet and Apps Script URL, then test submissions.
- [ ] Keep the Sheet private and enable two-step verification.
- [ ] Complete Privacy Notice and Terms/Refund Policy; obtain appropriate review.
- [ ] Test all navigation links, mobile layout and enquiry submissions.
- [ ] Confirm the manual payment process and send payment details only from verified official channels.
- [ ] Test the site on a phone and desktop before sharing it publicly.
