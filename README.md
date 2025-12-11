# Nico Burger Art - Gallery with Admin CMS

A modern art portfolio website featuring a dynamic public gallery and secure admin dashboard. Built with React, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **Single-page public gallery** with modal-based artwork details
- **Secure admin dashboard** with magic link authentication
- **Multi-image upload** with primary and secondary image handling (1-6 images per painting)
- **Smart image ordering** - secondary/in-situ image displays first in detail view
- **Drag-and-drop sorting** for artwork display order
- **Status management** (Available/Sold/Hidden)
- **Row Level Security (RLS)** for data protection
- **Mobile-optimized** with responsive design
- **Improved desktop preview layout** for full-height image viewing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### Local Development

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd nico-burger-art
   npm install
   ```

2. **Environment variables:**
   
   The `.env` file is already configured with the Supabase credentials.

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173`

## 🗄️ Supabase Setup

The database has been configured with the following:

### Tables Created
- `paintings` - Stores artwork data (title, dimensions, description, price, status, slug, sort order)
- `painting_images` - Stores multiple images per painting with primary and secondary designation (1-6 images per painting)

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- Public can view `available` and `sold` paintings
- Only `ndburger@iafrica.com` can create/update/delete paintings
- Email-based access control for admin operations

### Storage Bucket

**IMPORTANT:** You need to create the storage bucket manually:

1. Go to [Storage](https://supabase.com/dashboard/project/jsdwbhmokdmaztgelvtg/storage/buckets)
2. Click "Create bucket"
3. Name: `paintings`
4. Set to **Public** ✅
5. Click "Create bucket"

Storage policies have been automatically created by the migration.

### Authentication Configuration

**IMPORTANT:** Configure Auth redirect URLs:

1. Go to [Authentication → URL Configuration](https://supabase.com/dashboard/project/jsdwbhmokdmaztgelvtg/auth/url-configuration)
2. Add these redirect URLs:
   - **Local:** `http://localhost:5173/admin`
   - **Production:** `https://your-domain.com/admin` (add after deployment)

## 🔐 Admin Access

- **Admin route:** `/admin`
- **Authorized email:** `ndburger@iafrica.com`
- **Login method:** Magic link (check email for login link)

## 📝 Usage Guide

### Adding a Painting (Admin)

1. Go to `/admin` and sign in with magic link
2. Click "Add Painting"
3. Fill in details (Title is required)
4. Upload 1-6 images:
   - **Single image:** Automatically set as primary
   - **Two images:** First auto-set as primary, second auto-set as secondary
   - **Multiple images (3-6):** Click "Set as Primary" and "Set as Secondary" to designate images
   - **Primary image:** High-quality shot of the painting (no frame, clean crop)
   - **Secondary image:** In-situ shot (painting framed on wall) - displays first in detail view
   - **Additional images:** Detail shots, texture closeups, etc.
5. Add alt text for the primary image
6. Click "Create Painting"

### Managing Paintings

- **Reorder:** Drag paintings using the grip handle
- **Edit:** Click pencil icon
- **Mark Sold/Available:** Click checkmark/refresh icon
- **Hide/Unhide:** Click eye icon (hidden paintings don't appear publicly)
- **Delete:** Click trash icon (requires confirmation)

### Image Guidelines

- **Supported formats:** JPEG, PNG, WEBP
- **Recommended size:** 1600px on the longest edge
- **Max file size:** 5MB per image
- **Count:** 1-6 images per painting
- **Alt text:** Required for primary image (accessibility)
- **Primary image purpose:** Main product shot (no frame, clean background)
- **Secondary image purpose:** In-situ/lifestyle shot (framed, on wall) - shown first in detail modal
- **Additional images:** Varying detail shots, angles, and textures

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Backend:** Supabase (Database, Auth, Storage)
- **State Management:** TanStack Query (React Query)
- **Drag & Drop:** @dnd-kit
- **Carousel:** Embla Carousel
- **Form Handling:** React Hook Form + Zod validation

## 🔒 Security

- ✅ Row Level Security (RLS) enforced on all tables
- ✅ Email-based admin access control
- ✅ Magic link authentication (no passwords)
- ✅ Client-side validation with Zod
- ✅ Server-side RLS policies
- ✅ Secure storage policies
- ✅ Input sanitization

## 📦 Deployment

### Vercel (Recommended)

```bash
# Build project
npm run build

# Deploy
vercel --prod
```

**Post-deployment:**
1. Set environment variables in Vercel Dashboard
2. Update Supabase Auth redirect URLs with production domain
3. Test admin login and image uploads

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
netlify deploy --prod --dir=dist
```

## 🐛 Troubleshooting

### Can't sign in to admin
- Verify email is exactly `ndburger@iafrica.com`
- Check spam folder for magic link email
- Ensure Auth redirect URLs are configured in Supabase

### Images not loading
- Verify `paintings` storage bucket is created and set to **Public**
- Check storage policies are in place

### Can't save painting
- Ensure you're signed in as admin
- Check RLS policies in Supabase
- For multiple images (2+), ensure one is marked as primary and one as secondary

### Slug conflicts
- System automatically appends numbers to duplicate slugs (e.g., "painting-title-2")

## 📄 License

All rights reserved © 2025 Nico Burger Art

## 🤝 Support

Website by [Lomio.co.za](https://lomio.co.za)

For technical issues, check the [Supabase Dashboard](https://supabase.com/dashboard/project/jsdwbhmokdmaztgelvtg).
