# design.md — Personal Tutor Website

## 1. Design Principles

- **Trust-first**: A tutor site sells credibility as much as content — clean typography, real photo, clear credentials, visible testimonials.
- **Low friction to buy**: Course → price → buy button should never be more than 2 clicks away.
- **Bilingual-friendly**: Copy should work in English, with room for Bangla labels/toggles later (Joy already writes bilingual content).
- **Fast & simple**: No heavy animation/JS bloat — this is a conversion-focused site, not a design showcase.

## 2. Visual Direction

- **Tone**: Professional but approachable — not corporate-cold, not overly playful. Think "credible young engineer-educator," not "big edtech brand."
- **Color palette** (suggested):
  - Primary: Deep indigo/blue (`#1E3A8A` range) — trust, education
  - Accent: Warm amber/orange (`#F59E0B` range) — CTA buttons, highlights
  - Neutral: Slate grays for text/background (`#0F172A` dark text, `#F8FAFC` light bg)
  - Avoid pure black/white — softer contrast is easier to read long-term
- **Typography**:
  - Headings: A geometric sans (e.g. "Sora" or "Space Grotesk") — feels technical/modern, fits engineer identity
  - Body: A readable sans (e.g. "Inter" or "IBM Plex Sans") — Plex Sans also has decent Bangla glyph support if bilingual UI is added later
- **Imagery**: Real photo of Joy on homepage/about (builds trust far more than stock icons). Course thumbnails should be simple, consistent (same template/frame) rather than random stock images.

## 3. Layout Direction (Key Pages)

### Homepage
```
[ Navbar: Logo | Courses | About | Login/Signup ]

[ Hero Section ]
  - Headline: e.g. "Learn to Code the Right Way — 1-on-1 & Course-Based Tutoring"
  - Subtext: 1-liner on who Joy is (engineer + tutor)
  - CTA: "Browse Courses" button
  - Photo of Joy (right side or background, subtle)

[ Credentials strip ]
  - CSE @ IUB | CloudCoder Internship | X students taught (small trust badges)

[ Featured Courses (3-4 cards) ]

[ Testimonials (carousel or 3-card grid) ]

[ About teaser + "Read more" ]

[ Footer: contact, socials (LinkedIn), copyright ]
```

### Course Catalog
```
[ Filter bar: Subject | Price range | Search ]
[ Grid of CourseCard components: thumbnail, title, price, short desc, "View" ]
```

### Course Detail
```
[ Left: thumbnail/video preview, syllabus list, "what you'll learn" ]
[ Right (sticky): price, "Buy Now" button, duration, level, refund note ]
[ Below: testimonials specific to this course, if any ]
```

### Admin — Course List
```
[ Table: Title | Status | Price | Enrollments | Actions (Edit/Archive) ]
[ "+ New Course" button top right ]
```

### Admin — Course Form (Create/Edit)
```
[ Simple vertical form: Title, Slug (auto-gen), Description (rich text or markdown),
  Subject, Price, Thumbnail upload, Modules (repeatable: title + type + url) ]
[ Save Draft | Publish buttons ]
```

### Student Dashboard ("My Courses")
```
[ Grid of purchased CourseCards → click opens /learn/[courseId] ]
[ Sidebar or tab: Order history ]
```

## 4. Component Inventory (reusable)

| Component | Used in |
|---|---|
| `Navbar` / `Footer` | All pages |
| `CourseCard` | Catalog, homepage, dashboard |
| `CourseForm` | Admin create/edit |
| `Badge` (status: draft/published) | Admin course list |
| `Button` (primary/secondary/danger variants) | Everywhere |
| `Modal` (confirm delete/archive) | Admin actions |
| `Testimonial Card` | Homepage, course detail |
| `Empty State` | Dashboard when no courses purchased yet |

## 5. Responsive Behavior

- Mobile-first Tailwind breakpoints (`sm`, `md`, `lg`).
- Catalog grid: 1 col mobile → 2 col tablet → 3 col desktop.
- Admin tables: convert to stacked cards on mobile (tables are painful on small screens).
- Sticky "Buy Now" bar on mobile course-detail page (since sidebar layout collapses).

## 6. Accessibility & Polish Notes

- Sufficient color contrast (WCAG AA) for text on colored buttons.
- All course thumbnails need `alt` text.
- Form validation errors shown inline, not just toast — helps on slow mobile connections common in target market.
- Loading skeletons for course catalog (avoid layout shift on slow networks).

## 7. Reference

- See `phases.md` for when each of these gets built.
- See `architecture.md` for underlying data/component wiring.
