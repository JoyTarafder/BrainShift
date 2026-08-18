# phases.md — Build Roadmap

Estimated for a solo builder working part-time alongside job search / other commitments. Adjust pace as needed — this is sequenced by dependency and risk, not by calendar week.

---

## Phase 0 — Setup (few days)
- [ ] Init Next.js + TypeScript + Tailwind project
- [ ] Set up MongoDB Atlas cluster + connection (`lib/db.ts`)
- [ ] Set up repo, `.env.example`, deploy skeleton to Vercel (confirm CI/CD works end to end early)
- [ ] Decide on domain name, buy/point domain

**Exit criteria:** Empty Next.js app live on Vercel at your domain.

---

## Phase 1 — Static Portfolio + Course List (no auth, no payment)
- [ ] Homepage (hero, credentials, about teaser, footer)
- [ ] About page
- [ ] Course model in MongoDB + seed 2-3 sample courses manually (via script, not UI yet)
- [ ] Course catalog page (read-only, pulls from DB)
- [ ] Course detail page (read-only)
- [ ] "Buy" button → for now, just `mailto:` or WhatsApp/Messenger link ("Contact to enroll")

**Exit criteria:** You have a live, shareable personal site with real course listings — usable for LinkedIn posts even before payment works.

---

## Phase 2 — Auth + Admin CRUD
- [ ] NextAuth.js setup (Credentials provider first; Google OAuth optional add-on)
- [ ] User model + roles (`admin`/`student`)
- [ ] `middleware.ts` route protection for `/admin/*`
- [ ] Admin course list page
- [ ] Admin course create/edit form (`CourseForm`)
- [ ] Admin archive/delete action
- [ ] Replace manual DB seeding — Joy can now manage courses entirely via UI

**Exit criteria:** You can log in as admin and fully manage courses (create/update/delete) without touching the database directly.

---

## Phase 3 — Student Accounts
- [ ] Student signup/login pages
- [ ] Student dashboard shell (`/dashboard`) — even if empty of purchases initially
- [ ] Order model (without payment yet — can stub as "manual/pending")

**Exit criteria:** Students can create accounts and see a dashboard shell.

---

## Phase 4 — Payment Integration (SSLCommerz)
- [ ] Apply for / configure SSLCommerz sandbox account
- [ ] `POST /api/orders` → create pending order
- [ ] `POST /api/payment/init` → SSLCommerz session
- [ ] Payment webhook handler → verify + update order status
- [ ] On success → auto-create `Enrollment`
- [ ] Switch "Buy" button on course detail page from mailto → real payment flow
- [ ] Test with sandbox bKash/Nagad/card flows
- [ ] Go live: swap sandbox keys for production SSLCommerz merchant keys

**Exit criteria:** A real student can pay real money and get enrolled automatically.

---

## Phase 5 — Content Delivery
- [ ] Course modules UI in admin form (add video links/PDFs/links per course)
- [ ] `/learn/[courseId]` page — gated by `Enrollment` check
- [ ] Student "My Courses" populated with real purchased courses
- [ ] Order history page

**Exit criteria:** Paying students can access the actual course content, not just a receipt.

---

## Phase 6 — Polish & Growth
- [ ] Testimonials system (manually added by admin first, later student-submitted)
- [ ] SEO basics (meta tags, sitemap, Open Graph images for LinkedIn sharing)
- [ ] Analytics (simple: Vercel Analytics or Plausible)
- [ ] Loading states / error states audit
- [ ] Mobile QA pass
- [ ] Optional: Bangla language toggle for public pages

**Exit criteria:** Platform is shareable, discoverable, and presentable as a portfolio piece (not just functional, but polished).

---

## Suggested Sequencing Rationale

- **Phase 1 before Phase 2**: gives you a live, shareable link almost immediately — good for momentum and for LinkedIn "building in public" posts, which is your established pattern.
- **Payment (Phase 4) deliberately after Admin CRUD (Phase 2)**: payment integration is the highest-risk, most fiddly part (SSLCommerz sandbox setup, webhook verification) — better to build it once the rest of the app is stable, so you're debugging payment issues in isolation.
- **Content delivery (Phase 5) after payment**: no point building a course player before you can reliably gate it behind a real purchase.

## Notes
- Each phase should get its own git branch/PR and, ideally, its own LinkedIn "build in public" post — consistent with your existing pattern of documenting the journey.
- If time is tight, Phases 0–3 alone already produce a very presentable portfolio project even without live payments.
