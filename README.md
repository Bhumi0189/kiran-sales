# Kiran Sales - Medical Uniforms E-commerce

## Project Overview
Kiran Sales is a full-stack e-commerce web application specializing in premium medical uniforms and healthwear. The platform offers a wide range of products including surgical scrubs, doctor coats, nurse uniforms, and hospital linen. Designed for healthcare professionals and institutions, the site provides a seamless shopping experience with features like user authentication, shopping cart, wishlist, and bulk order support.

## Features
- Browse and shop medical uniforms by category and gender
- User authentication and profile management
- Add products to cart and manage cart items
- Wishlist functionality for favorite products
- Bulk order support for hospitals and clinics
- Responsive design with modern UI components
- Admin and team order management (implied by folder structure)
- API routes for products, wishlist, and other backend functionality

## Technology Stack
- Framework: Next.js 14 (React 18)
- Language: TypeScript
- Styling: Tailwind CSS with shadcn/ui components
- State Management: React Context (e.g., cart-context, auth-context)
- Data Fetching: SWR for caching and revalidation
- UI Libraries: Radix UI, Lucide React icons
- Other: bcryptjs, zod, dotenv, recharts, and more

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kiran-sales-ecommerce
   ```

2. Install dependencies using your preferred package manager (npm, yarn, or pnpm):
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory and add necessary environment variables (e.g., database connection, API keys).

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs linting checks

## Project Structure

```
kiran-sales-ecommerce/
├── .gitignore
├── components.json
├── import-products.js
├── middleware.ts
├── next.config.mjs
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── products-bulk.json
├── README.md
├── tsconfig.json
├── app/
│   ├── about/
│   ├── admin/
│   ├── api/
│   ├── checkout/
│   ├── client-guard.tsx
│   ├── contact/
│   ├── globals.css
│   ├── layout.tsx
│   ├── orders/
│   ├── page.tsx
│   ├── page.tsx.temp
│   ├── products/
│   └── profile/
├── components/
│   ├── auth-dialog.tsx
│   ├── cart-sheet.tsx
│   ├── product-card.tsx
│   └── ui/ (shadcn/ui components)
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── auth-context.tsx
│   ├── cart-context.tsx
│   └── utils.ts
├── public/
│   └── (images and static assets)
├── scripts/
│   └── import-products.js
└── styles/
    └── (additional styles if any)
```

## Contact

For inquiries, support, or bulk orders, please contact:

- Email: info@kiransales.com
- Phone: +91 98765 43210
- Location: Mumbai, Maharashtra

---

© 2024 Kiran Sales. All rights reserved.
