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

Some features use external resources:

- Google Fonts
- GSAP and ScrollTrigger on `experiences.html`
- Remote imagery in a few sections

An internet connection is recommended while previewing.

## Notes Before Publishing

- Replace placeholder/sample traveller stories with real approved testimonials.
- Confirm all photography has usage rights.
- Connect enquiry forms to a verified email service or backend before launch.
- Verify contact details, map/location references, and booking email copy.
- Review image sizes for production performance.
