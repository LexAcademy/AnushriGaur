# Lex Academy website

Static GitHub Pages site for UPSC Law Optional, Gujarat and Rajasthan Judiciary preparation.

## SEO changelog

- Added the judiciary and UPSC practice hub and dedicated Gujarat Judiciary, Rajasthan Judiciary and UPSC Law MCQ pages. The source HTML includes exam-specific practice guidance, question coverage and worked samples.
- Connected the practice pages to the homepage, exam guides, Law Optional mentorship and test-series pages. Added visible breadcrumbs and matching structured data, plus consistent WebSite and organization identifiers.
- Updated page titles, descriptions, social metadata and self-referencing canonicals. The sitemap lists the canonical public pages. The legacy quiz URL and its query variants remain available with a crawlable `noindex` directive, as does the payment page. Explicit exam pages always load their own bank and canonicalise query variants to the clean URL.
- Kept the navy and gold theme and reused the existing quiz CSS, JavaScript and JSON banks. The UPSC quiz counts 50 distinct answers across filters in the same browser and sends the learner to the homepage enquiry section when they proceed. Quiz progress and the limit use browser storage.
- Added skip links, clearer mobile navigation controls, lazy loading for below-fold homepage images and earlier discovery of the existing fonts.

## GitHub Pages

1. Extract the ZIP. Copy its **contents** to your existing Pages publishing folder and commit them, including `.nojekyll`, `CNAME`, `assets/`, `images/` and `question-banks/`. Keep any existing Google verification file. The publishing folder should contain `index.html` directly.
2. In **Settings → Pages**, confirm the existing source branch and folder, and check that the custom domain is `lexacademy.in`. Enable **Enforce HTTPS** when available. [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. After deployment, open the homepage, sitemap, three MCQ pages and a legacy query URL. Check the filters, answer feedback, saved progress and enquiry link. Preview locally with an HTTP server so browsers can fetch the JSON banks. The homepage enquiry form uses the existing WhatsApp flow.

## Google Search Console

1. Open the existing `lexacademy.in` property or add a **Domain** property and verify ownership with the DNS TXT record Google provides. [Add a Search Console property](https://support.google.com/webmasters/answer/34592)
2. In **Sitemaps**, submit `https://lexacademy.in/sitemap.xml`. Review the report after Google processes it. [Google sitemap guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
3. Use **URL Inspection → Test live URL** on the homepage, practice hub, three MCQ pages and the Law Optional programme pages. Request indexing for those priority URLs after the live test passes. Expect legacy quiz URLs to be excluded by `noindex`. [URL Inspection guide](https://support.google.com/webmasters/answer/12482179)
4. In **Performance**, compare impressions, clicks and average position by page and query. Start with searches related to UPSC Law Optional, judiciary MCQ practice, Gujarat Civil Judge PYQs and RJS prelims practice.

When replacing a question bank, review the associated practice page’s counts, source-year coverage and sample alongside the JSON update.
