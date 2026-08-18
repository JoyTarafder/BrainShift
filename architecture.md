# architecture.md — Personal Tutor Website

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│         Next.js Frontend (React + Tailwind + TS)         │
└───────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌───────────────────────▼───────────────────────────────────┐
│                Next.js App (Vercel)                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │  Pages/App  │  │ API Routes  │  │  Middleware (Auth)   │ │
│  │  Router     │  │ (/api/*)    │  │                      │ │
│  └────────────┘  └─────┬──────┘  └──────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                           │
        ┌──────────────────┼───────────────────┬──────────────────┐
        ▼                  ▼                    ▼                  ▼
 ┌─────────────┐   ┌───────────────┐   ┌────────────────┐  ┌──────────────┐
 │  MongoDB     │   │  NextAuth.js   │   │  SSLCommerz     │  │  Cloudinary   │
 │  Atlas       │   │  (sessions,    │   │  (payment       │  │  (media       │
 │  (data)      │   │   OAuth)       │   │   gateway)      │  │   storage)    │
 └─────────────┘   └───────────────┘   └────────────────┘  └──────────────┘
```

## 2. Folder Structure (Next.js App Router)

```
tutor-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── courses/page.tsx          # Catalog
│   │   └── courses/[slug]/page.tsx   # Course detail
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (student)/
│   │   ├── dashboard/page.tsx        # My Courses
│   │   ├── dashboard/orders/page.tsx
│   │   └── learn/[courseId]/page.tsx # Course content viewer
│   ├── (admin)/
│   │   ├── admin/page.tsx            # Admin overview
│   │   ├── admin/courses/page.tsx    # Course list
│   │   ├── admin/courses/new/page.tsx
│   │   └── admin/courses/[id]/edit/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── courses/route.ts          # GET (list), POST (create)
│       ├── courses/[id]/route.ts     # GET, PUT, DELETE
│       ├── orders/route.ts           # POST (create order)
│       ├── payment/init/route.ts     # SSLCommerz session init
│       └── payment/webhook/route.ts  # Payment success/fail callback
├── components/
│   ├── ui/                           # Buttons, cards, inputs (Tailwind)
│   ├── CourseCard.tsx
│   ├── CourseForm.tsx
│   └── Navbar.tsx / Footer.tsx
├── lib/
│   ├── db.ts                         # MongoDB connection
│   ├── auth.ts                       # NextAuth config
│   ├── sslcommerz.ts                 # Payment helper
│   └── validators.ts                 # Zod schemas
├── models/
│   ├── User.ts
│   ├── Course.ts
│   ├── Order.ts
│   └── Enrollment.ts
├── middleware.ts                     # Route protection (admin/student)
└── types/
    └── index.ts
```

## 3. Data Models

### User
```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  passwordHash?: string,       // null if OAuth-only
  role: "admin" | "student",
  createdAt: Date
}
```

### Course
```ts
{
  _id: ObjectId,
  title: string,
  slug: string,
  description: string,
  subject: string,
  price: number,               // in BDT
  thumbnailUrl: string,
  syllabus: string[],
  modules: [
    { title: string, type: "video" | "pdf" | "link", url: string }
  ],
  status: "draft" | "published" | "archived",
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```ts
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  amount: number,
  status: "pending" | "paid" | "failed" | "refunded",
  paymentMethod: "bkash" | "nagad" | "card" | string,
  transactionId: string,
  createdAt: Date
}
```

### Enrollment
```ts
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  orderId: ObjectId,
  enrolledAt: Date,
  progress: number             // optional, % complete
}
```

## 4. Key Flows

### 4.1 Course Purchase Flow
1. Student clicks "Buy" on course detail page.
2. Frontend calls `POST /api/orders` → creates `Order` with status `pending`.
3. Backend calls `POST /api/payment/init` → gets SSLCommerz session URL.
4. Student redirected to SSLCommerz to pay (bKash/Nagad/card).
5. SSLCommerz redirects back to `/api/payment/webhook` with result.
6. Webhook verifies payment → updates `Order.status = "paid"` → creates `Enrollment`.
7. Student redirected to `/dashboard` with success message.

### 4.2 Admin Course CRUD Flow
1. Admin logs in → middleware checks `role === "admin"` for `/admin/*` routes.
2. Admin fills `CourseForm` → `POST /api/courses` (create) or `PUT /api/courses/[id]` (edit).
3. Delete: soft-delete preferred → `status = "archived"` rather than hard delete, to preserve order history integrity.

## 5. Auth & Authorization

- **NextAuth.js** with Credentials provider (email/password) + optional Google provider.
- JWT session strategy (simpler for Vercel serverless).
- `middleware.ts` protects:
  - `/admin/*` → `role === "admin"` only
  - `/dashboard/*`, `/learn/*` → any authenticated student
- Course content (`/learn/[courseId]`) additionally checks an `Enrollment` record exists for that student + course before rendering content.

## 6. Payment Integration Notes

- SSLCommerz requires a merchant account (sandbox available for dev/testing before going live).
- Store `transactionId` from SSLCommerz for reconciliation.
- Webhook endpoint must verify the request signature/hash SSLCommerz sends — never trust client-side "payment success" redirects alone for unlocking content.

## 7. Deployment

- **Frontend + API**: Vercel (free tier sufficient for MVP)
- **Database**: MongoDB Atlas free tier (M0 cluster)
- **Media**: Cloudinary free tier for thumbnails/PDFs
- **Domain**: custom domain pointed to Vercel

## 8. Security Considerations

- Hash passwords with bcrypt (if using Credentials provider).
- Validate all API inputs with Zod before hitting DB.
- Rate-limit auth endpoints (e.g. via Vercel Edge Middleware or simple in-memory limiter for MVP).
- Never expose `SSLCOMMERZ_STORE_PASSWORD` or DB URI client-side — keep in `.env`, server-only.
- Sanitize any HTML content admin enters (course description) to avoid stored XSS if rendering as HTML.
