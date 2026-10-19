# Swathoni Travels Website

Swathoni Travels is a static multi-page travel website for a Kenya safari and Diani Beach travel brand. The site presents curated safari, coast, culture, and custom journey experiences with strong editorial visuals, interactive galleries, enquiry flows, and responsive layouts.

## Pages

- `index.html` - Homepage with hero image carousel, signature journey section, destination highlights, traveller stories, and a fixed "Plan my safari" CTA.
- `experiences.html` - Experiences page with animated scene switching, filterable gallery, per-card lightbox image collections, traveller story carousel, and enquiry form.
- `about.html` - Brand story page with layered landscape hero, Swathoni Way gallery controls, culture/travel narrative sections, and visual transitions.
- `contact.html` - Contact and enquiry page with a demo contact form and location-focused content.

## Key Features

- Responsive static HTML/CSS/JavaScript implementation.
- Homepage hero carousel with reduced-motion support.
- Fixed floating safari CTA on the homepage.
- Filterable experiences gallery.
- Lightbox where each gallery card can open its own image collection.
- Traveller story carousels on homepage and experiences page.
- Interactive journey image switcher on the homepage.
- About page layered SVG wave hero using local imagery.
- Demo enquiry forms that prepare/copy enquiry details rather than submitting to a backend.

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

Open `index.html` directly in a browser, or use VS Code Live Server for smoother local navigation between pages.

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
- Connect enquiry forms to a verified email service or backend before launch.
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
