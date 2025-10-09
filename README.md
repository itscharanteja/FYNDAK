# 🏆 FYNDAK - Real-time Auction Platform

A modern, full-stack auction application built with React TypeScript, Supabase, and Tailwind CSS. Features real-time bidding, automatic auction ending, payment integration, and comprehensive admin controls.

![FYNDAK Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=FYNDAK+Auction+Platform)

## ✨ Features

### 🎯 Core Functionality

- **Real-time Bidding System** - Live bid updates using Supabase real-time subscriptions
- **Automatic Auction Ending** - Scheduled functions to end auctions and determine winners
- **User Authentication** - Secure signup/login with profile management
- **Admin Dashboard** - Complete auction management with analytics
- **Payment Integration** - Swish payment system with QR codes and verification

### 🎨 User Experience

- **Dark/Light Theme Toggle** - Smooth transitions with system preference detection
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Image Upload & Compression** - Local file upload with automatic optimization
- **Real-time Notifications** - Live updates for bid status and auction endings

### 🔒 Security & Performance

- **Row Level Security (RLS)** - Database-level access controls
- **Image Compression** - Automatic image optimization before storage
- **TypeScript** - Full type safety throughout the application
- **Performance Optimized** - Efficient queries and caching strategies

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom theme
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful, customizable icons

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - Robust relational database with advanced features
- **Real-time Subscriptions** - Live data updates
- **Storage** - File upload and management
- **Edge Functions** - Server-side logic

### Additional Tools

- **QRCode.js** - QR code generation for payments
- **Canvas API** - Client-side image compression
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase Account** (free tier available)

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/itscharanteja/FYNDAK.git
cd FYNDAK
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Supabase Setup

#### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: FYNDAK (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Wait for the project to be created (2-3 minutes)

#### 3.2 Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOi...`)

#### 3.3 Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **Important**: Replace `your-project-id` and `your-anon-key-here` with your actual values from Step 3.2

### Step 4: Database Setup

#### 4.1 Run the Initial Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/00000000000000_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

This will create:

- All necessary tables (profiles, products, bids)
- Database functions for auction management
- Row Level Security policies
- Storage bucket for images
- Indexes for optimal performance

#### 4.2 Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `profiles` - User profile information
   - `products` - Auction items
   - `bids` - User bids on products
3. Go to **Storage** and verify the `product-images` bucket exists

### Step 5: Create an Admin User

#### 5.1 Sign Up Through the App

1. Start the development server (see Step 6)
2. Navigate to the signup page
3. Create your admin account

#### 5.2 Make User an Admin

1. In Supabase dashboard, go to **Table Editor** → **profiles**
2. Find your user profile
3. Edit the row and set `is_admin` to `true`
4. Save the changes

### Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

## 📱 Using the Application

### For Regular Users

#### 1. **Account Creation**

- Navigate to `/signup`
- Fill in your details (name, email, password)
- Verify your email if required
- Complete your profile information

#### 2. **Browsing Auctions**

- View all active auctions on the products page
- See current prices, time remaining, and product details
- Filter and search for specific items

#### 3. **Placing Bids**

- Click on any active auction
- Enter your bid amount (must be higher than current price)
- Confirm your bid
- Track your bids in the dashboard

#### 4. **Payment Process** (for won auctions)

- Go to your dashboard
- Find auctions you've won
- Click "Pay Here" to start payment process
- Enter your phone number for Swish verification
- Scan the QR code with your Swish app
- Wait for admin verification

### For Administrators

#### 1. **Creating Auctions**

- Access the Admin Panel
- Click "Add New Product"
- Fill in product details:
  - **Name**: Product title
  - **Description**: Detailed description
  - **Image**: Upload from local storage or provide URL
  - **Starting Price**: Minimum bid amount
  - **End Time**: When the auction should end
- Submit to create the auction

#### 2. **Managing Auctions**

- View all auctions in the admin panel
- Edit existing auctions
- End auctions manually if needed
- Delete inappropriate listings

#### 3. **Managing Bids & Payments**

- View all bidders for each auction
- See payment status for won bids
- Verify Swish payments using provided phone numbers
- Update payment status once verified

## 🔧 Configuration

### Theme Configuration

The app supports both light and dark themes with automatic system preference detection.

To customize themes, edit `src/contexts/ThemeContext.tsx`:

```typescript
// Custom theme colors can be added to tailwind.config.js
export const themes = {
  light: {
    background: "bg-white",
    text: "text-gray-900",
    // ... other properties
  },
  dark: {
    background: "bg-gray-900",
    text: "text-white",
    // ... other properties
  },
};
```

### Payment Configuration

Currently configured for Swish payments. To modify:

1. Update QR code generation in `src/components/Dashboard/Dashboard.tsx`
2. Modify payment verification logic
3. Update admin verification interface

## 📊 Database Schema

### Tables

#### `profiles`

- Extends Supabase auth.users with additional profile information
- Fields: full_name, avatar_url, phone, address, is_admin

#### `products`

- Stores auction items
- Fields: name, description, image_url, starting_price, current_price, end_time, status

#### `bids`

- Stores user bids on products
- Fields: product_id, bidder_id, amount, status, payment_status, payment_phone

### Key Functions

#### `end_auctions()`

- Automatically called to end expired auctions
- Determines winners and updates bid statuses
- Can be triggered by cron jobs

#### `end_auction_rpc(product_uuid)`

- Manual auction ending for admins
- Returns winner information
- Used by the admin interface

## 🚀 Deployment

### Prerequisites for Production

- **Supabase Production Project** (upgrade from free tier if needed)
- **Domain name** (optional but recommended)
- **SSL Certificate** (automatic with most hosting providers)

### Option 1: Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Push your code to GitHub/GitLab
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy

3. **Configure Domain** (optional)
   - Add your custom domain in Vercel settings
   - Update DNS records as instructed

### Option 2: Netlify

1. **Build the Project**

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your repository for automatic deployments
   - Configure environment variables in site settings

### Option 3: Traditional Hosting

1. **Build for Production**

   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload contents of `dist` folder to your web server
   - Configure web server to serve `index.html` for all routes

### Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test user registration and login
- [ ] Create a test auction as admin
- [ ] Test bidding functionality
- [ ] Verify payment flow works
- [ ] Check responsive design on mobile devices
- [ ] Test theme switching
- [ ] Verify real-time updates work

## 🧪 Testing

### Manual Testing Checklist

#### Authentication

- [ ] User can sign up with email
- [ ] User can log in with credentials
- [ ] User profile is created automatically
- [ ] Password reset works (if implemented)

#### Auctions

- [ ] Users can view all active auctions
- [ ] Auction details display correctly
- [ ] Time remaining updates in real-time
- [ ] Ended auctions show as ended

#### Bidding

- [ ] Users can place bids on active auctions
- [ ] Bid amount validation works
- [ ] Real-time bid updates work
- [ ] Users can see their bid history

#### Admin Functions

- [ ] Admin can create new auctions
- [ ] Image upload and compression works
- [ ] Admin can edit existing auctions
- [ ] Admin can end auctions manually
- [ ] Admin can see all bidders
- [ ] Payment verification interface works

#### Payment System

- [ ] Won auction shows payment option
- [ ] QR code generates correctly
- [ ] Phone number submission works
- [ ] Admin can verify payments

### Running Tests

Currently, the project doesn't include automated tests. To add testing:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add test scripts to package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

## 🔍 Troubleshooting

### Common Issues

#### Environment Variables Not Working

**Problem**: App shows connection errors
**Solution**:

- Ensure `.env.local` file is in the root directory
- Verify variable names start with `VITE_`
- Restart development server after changes

#### Database Connection Errors

**Problem**: "Failed to fetch" errors
**Solution**:

- Check Supabase project URL and API key
- Verify your Supabase project is active
- Check browser network tab for specific error details

#### Migration Fails

**Problem**: SQL errors when running migration
**Solution**:

- Ensure you have a fresh Supabase project
- Copy the entire migration file content
- Run in SQL Editor, not CLI
- Check for any existing tables with same names

#### Images Not Uploading

**Problem**: Image upload fails with 400 error
**Solution**:

- Verify storage bucket exists
- Check RLS policies are applied
- Ensure file size is reasonable (< 10MB)
- Check browser console for specific errors

#### Real-time Updates Not Working

**Problem**: Bids don't update in real-time
**Solution**:

- Check browser network tab for WebSocket connections
- Verify Supabase real-time is enabled
- Check RLS policies allow reading bid data
- Try refreshing the page

### Performance Issues

#### Slow Loading

- Optimize images (already implemented)
- Enable caching on your hosting provider
- Consider implementing lazy loading for auction lists

#### High Database Usage

- Review and optimize queries
- Implement pagination for large auction lists
- Add database indexes for frequently queried fields

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
   - Manual testing of affected features
   - Check responsive design
   - Verify theme switching works
5. **Commit with descriptive messages**
   ```bash
   git commit -m "Add: detailed feature description"
   ```
6. **Push and create Pull Request**

### Code Style Guidelines

- **TypeScript**: Use proper typing, avoid `any`
- **React**: Functional components with hooks
- **CSS**: Use Tailwind classes, avoid custom CSS when possible
- **Functions**: Keep functions small and focused
- **Comments**: Document complex logic and business rules

### Adding New Features

#### Adding a New Page

1. Create component in `src/components/YourFeature/`
2. Add routing in `src/App.tsx`
3. Update navigation if needed
4. Add proper TypeScript interfaces

#### Adding Database Features

1. Create migration file with timestamp
2. Test migration on development database
3. Update TypeScript interfaces in `src/lib/supabase.ts`
4. Add RLS policies for security

## 📚 Additional Resources

### Supabase Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

### React & TypeScript

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Payment Integration

- [Swish for Business](https://www.swish.nu/foretag)
- [QR Code Standards](https://www.qr-code-generator.com/guides/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team** - For the amazing Backend-as-a-Service platform
- **Vercel Team** - For the excellent hosting and build tools
- **Tailwind CSS Team** - For the utility-first CSS framework
- **React Team** - For the powerful frontend library

## 📞 Support

For support and questions:

1. **Check the troubleshooting section** in this README
2. **Search existing GitHub issues**
3. **Create a new issue** with detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS information
   - Screenshots if relevant

---

**Built with ❤️ using React, TypeScript, Supabase, and Tailwind CSS**

> 🚀 **Ready to start your auction platform?** Follow the setup guide above and you'll be running FYNDAK in less than 30 minutes!
