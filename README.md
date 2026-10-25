# Swathoni Travels Website

Swathoni Travels is a static multi-page travel website for a Kenya safari and Diani Beach travel brand. The site presents curated safari, coast, culture, and custom journey experiences with strong editorial visuals, interactive galleries, enquiry flows, and responsive layouts.

## Pages

- `index.html` - Homepage with hero image carousel, signature journey section, destination highlights, traveller stories, and a fixed "Plan my safari" CTA.
- `experiences.html` - Experiences page with animated scene switching, filterable gallery, per-card lightbox image collections, traveller story carousel, and enquiry form.
- `about.html` - Brand story page with layered landscape hero, Swathoni Way gallery controls, culture/travel narrative sections, and visual transitions.
- `contact.html` - Contact and enquiry page with an email enquiry form and location-focused content.

## Key Features

- Responsive static HTML/CSS/JavaScript implementation.
- Homepage hero carousel with reduced-motion support.
- Fixed floating safari CTA on the homepage.
- Filterable experiences gallery.
- Lightbox where each gallery card can open its own image collection.
- Traveller story carousels on homepage and experiences page.
- Interactive journey image switcher on the homepage.
- About page layered SVG wave hero using local imagery.
- Enquiry forms that POST to `api/send-mail.php`, which sends journey details to swafric.wildfotografie@gmail.com through SMTP. Both forms show submission status without opening an email app.

## Project Structure

```text
swathoni/
  index.html
  styles.css
  script.js
  experiences.html
  experiences.css
  experiences.js
  about.html
  about.css
  about.js
  contact.html
  contact.css
  contact.js
  images/
```

## Running Locally

Run `php -S 127.0.0.1:8000 api/router.php` from the project directory and open `http://127.0.0.1:8000`. A static server or opening HTML files directly cannot execute `api/send-mail.php`.

> **Multilingual feature:** the translated text is loaded from JSON files
> (`translations/en.json`, `translations/nl.json`) via `fetch`, so the language
> switcher only works when served over HTTP (e.g. VS Code Live Server, `python
> -m http.server`, or your production host). Opening HTML files directly with
> `file://` will not load translations.

Some features use external resources:

- Google Fonts
- GSAP and ScrollTrigger on `experiences.html`
- Remote imagery in a few sections

An internet connection is recommended while previewing.

## Multilingual support

The site is available in English (`en`) and Dutch (`nl`).

- Translation files: `translations/en.json` and `translations/nl.json`.
- Shared translation engine: `translations.js` (vanilla JS, no dependencies).
- A language selector (EN / NL) is integrated into the header navigation on every page.
- The chosen language is saved in `localStorage` and restored when navigating between pages or returning to the site; the `<html lang>` attribute updates accordingly.
- Translation keys are shared between both languages and fall back safely to English when a key is missing.

Because translations are fetched as JSON, preview the site over HTTP (Live Server or `python -m http.server`) so the language switcher works.

## Notes Before Publishing

- Replace placeholder/sample traveller stories with real approved testimonials.
- Confirm all photography has usage rights.
- Configure and verify SMTP credentials before launch (see below).
- Verify contact details, map/location references, and booking email copy.
- Review image sizes for production performance.

## SEO and production URL

The site currently uses `https://swathoni.vercel.app/` as its public base URL.
Each page has a unique search title and description, a canonical URL, Open Graph
and Twitter sharing metadata, and JSON-LD describing the organization, website
and page. Secondary pages include breadcrumb structured data. Social previews
use the existing `images/beach.jpeg` photo.

`robots.txt` allows crawling and points to `sitemap.xml`, which lists all four
canonical page URLs. Upload these files at the deployment root with the HTML.
After deployment, verify that the canonical pages, sitemap and social preview
image return successfully, then submit the sitemap in Google Search Console.

When moving to a custom domain, replace `https://swathoni.vercel.app/` in all four
HTML files, `robots.txt` and `sitemap.xml` with the final HTTPS URL. Keep canonical
URLs, structured data, social URLs and the sitemap consistent, and redirect the
old host to the new one through the hosting provider.

Structured data intentionally excludes unverified contact details and sample
reviews. Search engine indexing and search appearance require a deployed site
and are not guaranteed by metadata alone.

## PHP enquiry delivery

Both forms POST to `api/send-mail.php`. The server validates entries, then sends through authenticated SMTP using [PHPMailer](https://github.com/PHPMailer/PHPMailer). The recipient defaults to `swafric.wildfotografie@gmail.com`. As requested, the form email is used in the From and Reply-To headers. The SMTP login is separate; the provider may enforce its own allowed sender addresses. SMTP acceptance does not guarantee inbox delivery.

Deploy on PHP 8.1+ hosting with OpenSSL, outbound SMTP access, and Composer dependencies installed with `composer install --no-dev --optimize-autoloader`. Upload `vendor/` if Composer is unavailable on the host. Static hosting cannot execute this endpoint.

### Environment configuration

The local `.env` is ignored by Git. Copy `.env.example` for a fresh checkout. Hosting environment variables override file values. The file supports plain or quoted `KEY=value` entries and full-line `#` comments; it does not expand variables or backslash escapes.

Gmail defaults are configured:

- `SWATHONI_MAIL_TO=swafric.wildfotografie@gmail.com`
- `SWATHONI_SMTP_HOST=smtp.gmail.com`
- `SWATHONI_SMTP_PORT=587`
- `SWATHONI_SMTP_ENCRYPTION=tls`
- `SWATHONI_SMTP_AUTH=true`
- `SWATHONI_SMTP_USERNAME=swafric.wildfotografie@gmail.com`
- `SWATHONI_SMTP_PASSWORD=` (fill this in locally)

Use an [app password](https://support.google.com/mail/answer/185833) for the Gmail account, with 2-Step Verification enabled, rather than the regular account password. Replace the `your_app_password_here` placeholder from `.env.example` with that account's app password in the ignored `.env` file. Enter the 16 characters without grouping spaces. Google's [SMTP settings](https://support.google.com/mail/answer/7104828?hl=en) require authentication and STARTTLS on port 587. For another provider, replace the SMTP settings with that provider's values; encryption can be `tls` or `ssl`.

If a form submission returns HTTP 503 and the PHP log says `SMTP Error: Could not authenticate`, check that `SWATHONI_SMTP_USERNAME` is the account that issued `SWATHONI_SMTP_PASSWORD`, and that the password is a current app password rather than the account password or the example placeholder. Check hosting environment variables too: they override `.env`. The accompanying `QUIT command failed` message is a consequence of the failed SMTP session, not a separate form error. Retry the form after correcting the credentials; the local SMTP sink tests below do not verify a live Gmail login.

For a local test relay only, use `SWATHONI_SMTP_AUTH=false` and `SWATHONI_SMTP_ENCRYPTION=none` with its host and port. Credentials are required when authentication is enabled. The endpoint reports errors when configuration is incomplete or the SMTP server rejects sending, preserving the form contents. Diagnostic details appear in the PHP server log; passwords and SMTP transcripts are not printed.

Use `php -S 127.0.0.1:8000 api/router.php` for local preview. A plain PHP development server does not provide a mail relay: the old `localhost:25` setting needs a separately running SMTP server. The router blocks HTTP access to `.env` files. On Apache 2.4, upload `.htaccess` with overrides enabled; other servers need an equivalent environment-file deny rule.

Run `python tests/test_smtp.py` to test the PHP endpoint against a local SMTP sink. These tests send no external emails and override the local credentials.

For the configured Vercel PHP runtime, add the SMTP variables from `.env` in the project environment settings and redeploy. The local `.env` is ignored by Git and will not be available to a deployment built from the repository. `api/mail-config.php` reads the project-root `.env` locally, and `api/send-mail.php` loads the project-root Composer autoloader.

### Vercel deployment and PHPMailer

Set Vercel's Root Directory to the folder containing `vercel.json`, `composer.json`, `composer.lock`, `api/`, and `scripts/`. Use the Other framework preset and leave Install Command, Build Command, and Output Directory overrides unset. Do not set the Root Directory to `api/`. Commit both Composer files and `scripts/check-mailer.php`.

The [vercel-php runtime](https://github.com/vercel-community/php#%EF%B8%8F-faq) installs Composer production dependencies automatically, then runs the Composer `vercel` hook. Our hook verifies that PHPMailer can be loaded before the function is packaged. Look for `Installing Composer dependencies` and `PHPMailer verified for deployment.` in the build logs. `api/send-mail.php` loads `vendor/autoload.php` from the project root; the Vercel function exclusions keep vendor files in the bundle. No separate global PHPMailer installation is needed.

`.vercelignore` excludes local vendor files and environment files from CLI uploads. Composer rebuilds `vendor/` on Vercel; configure the SMTP values in Vercel's Environment Variables for the deployment environment. Redeploy with the existing build cache disabled after applying these changes. Do not add `vendor/**` to `functions.excludeFiles`, which would remove the generated library from the function.

### Language switcher checks

`tests/test_language.cjs` checks Windows Chrome hover/keyboard behavior and WebKit with an iPhone viewport and touch input across all four pages. It also checks blocked storage, legacy media-query listeners, and failed translation downloads. Install Playwright as a development tool and run `npx playwright install webkit`, then `node tests/test_language.cjs`. Chrome must also be installed. If Playwright is installed outside this project, set `SWATHONI_PLAYWRIGHT` to that package's absolute path. For Chrome-only checks (including mobile touch emulation), pass `--chromium-only`. These are browser simulations, not physical iPhone tests.
