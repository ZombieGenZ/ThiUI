# Bolt AI - E-Commerce Furniture Store Project Prompt

## Project Overview
Create a modern, full-featured e-commerce furniture store with React, TypeScript, Vite, Tailwind CSS, and Supabase backend.

## Core Features Required

### 1. User Authentication & Profile Management
- Email/password authentication using Supabase Auth
- User registration with email confirmation
- Password reset functionality with secure token handling
- User profile management (full name, phone, address, avatar)
- Sign out functionality with proper session cleanup
- Auto-populate user information in forms (checkout, profile)

### 2. Product Catalog & Filtering
- Product listing with grid/list view toggle
- Category-based filtering (Living Room, Bedroom, Dining, Office, Outdoor)
- Price range filter (slider from $0-$5000)
- Minimum rating filter (1-5 stars)
- Search functionality
- Sort options (featured, newest, price low-high, price high-low, name A-Z)
- Product detail pages with image galleries
- Stock quantity tracking
- New/featured product badges

### 3. Shopping Cart & Checkout
- Add to cart with quantity selection
- Cart item management (update quantity, remove items)
- Item selection for partial checkout
- Persistent cart using Supabase (logged-in users)
- Real-time subtotal, tax, shipping calculation
- Multiple payment methods:
  - Credit Card
  - Debit Card
  - PayPal
  - Bank Transfer (integrated with PayOS payment gateway)
  - Cash on Delivery
- Voucher/discount code system
- Auto-fill shipping information from user profile
- Order confirmation and tracking

### 4. Order Management
- Order history page
- Order status tracking (pending, processing, shipped, delivered, cancelled)
- Order details with item breakdown
- Payment status tracking
- Re-order functionality

### 5. Reviews & Ratings
- Product reviews with star ratings (1-5)
- Only allow reviews from verified purchasers
- Display average rating and review count
- Review sorting and filtering
- Helpful count for reviews

### 6. Favorites/Wishlist
- Add/remove products from favorites
- Favorites page with quick add-to-cart
- Persistent favorites storage

### 7. Payment Integration
- PayOS integration for bank transfers
- Redirect to PayOS payment gateway
- Handle payment success/failure callbacks
- Update order status based on payment status

## Technical Requirements

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Supabase Client
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Animations**: AOS (Animate On Scroll)

### Backend & Database
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth with email/password
- **Real-time**: Supabase Realtime (optional for order updates)
- **Storage**: Supabase Storage for product images (if needed)

### Database Schema

#### Tables Required:
1. **profiles** - Extended user information
   - id (uuid, FK to auth.users)
   - full_name, phone, address, avatar_url
   - loyalty_points, loyalty_tier
   - created_at, updated_at

2. **categories** - Product categories
   - id, name, slug, parent_id
   - image_url, description, display_order

3. **products** - Product catalog
   - id, name, slug, description, category_id
   - base_price, sale_price
   - style, room_type, materials, dimensions, weight
   - sku, stock_quantity, images[], video_url
   - rating, review_count
   - is_featured, is_new, status

4. **orders** - Customer orders
   - id, user_id, order_number
   - status, payment_method, payment_status
   - subtotal, shipping_cost, tax, discount, total_amount
   - shipping_address (jsonb), contact_info (jsonb)
   - voucher_id, voucher_discount
   - created_at, updated_at

5. **order_items** - Order line items
   - id, order_id, product_id, variant_id
   - quantity, unit_price, price, subtotal

6. **cart_items** - Shopping cart
   - id, user_id, product_id, variant_id, quantity

7. **favorites** - Wishlist items
   - id, user_id, product_id

8. **reviews** - Product reviews
   - id, product_id, user_id, order_id
   - rating, title, comment, images[]
   - is_verified_purchase, status, helpful_count

9. **vouchers** - Discount codes
   - id, code, discount_type, discount_value
   - min_purchase, max_discount, usage_limit, used_count
   - valid_from, valid_until, is_active

10. **voucher_usage** - Voucher usage tracking
    - id, voucher_id, user_id, order_id, discount_amount

### Row Level Security (RLS)
- Enable RLS on all tables
- Users can only view/modify their own data
- Products, categories, and approved reviews are public
- Implement proper policies for each table

### Design Requirements
- Modern, clean, professional aesthetic
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible UI components
- Loading states and error handling
- Toast notifications for user feedback
- Skeleton loaders for content loading

### Color Scheme
- Primary: Custom brand color (avoid purple/indigo)
- Neutral: Gray scale for text and backgrounds
- Accent: For CTAs and highlights
- Success/Error/Warning: Standard semantic colors
- Use Tailwind's color system

### Performance Optimization
- Code splitting and lazy loading
- Image optimization with lazy loading
- Debounced search and filters
- Efficient database queries
- Caching strategies

## Key User Flows

### 1. Shopping Flow
```
Browse Products → Filter/Search → View Details → Add to Cart →
Checkout → Payment → Order Confirmation
```

### 2. Authentication Flow
```
Register → Email Confirmation → Login → Browse →
Logout or Continue Shopping
```

### 3. Password Reset Flow
```
Forgot Password → Enter Email → Receive Reset Link →
Click Link → Set New Password → Sign Out → Login with New Password
```

### 4. Review Flow
```
Purchase Product → Order Delivered → Write Review →
Submit Rating & Comment → Review Appears on Product Page
```

### 5. PayOS Payment Flow
```
Select Bank Transfer → Fill Checkout Form → Click Place Order →
Redirect to PayOS → Complete Payment → Return to Success Page
```

## Important Implementation Notes

### Authentication
- Always use `maybeSingle()` instead of `single()` for single-row queries
- Handle session expiry gracefully
- Sign out user after password change for security
- Validate reset tokens before showing password reset form

### Reviews
- Load reviews separately from product data to avoid join errors
- Use individual queries for each review's profile data if needed
- Only show verified purchases with proper badge

### Checkout
- Pre-fill user information from profile
- Validate all required fields before submission
- Calculate taxes and shipping dynamically
- Support multiple currencies (USD base, VND for PayOS)

### PayOS Integration
- Store PayOS credentials in environment variables
- Generate proper signatures for payment requests
- Handle both success and failure callbacks
- Update order status based on payment result

### Filters
- All filters should update results in real-time
- Rating filter shows products with rating >= selected value
- Price filter uses a range slider
- Category filter supports multiple selections
- Clear all filters button available

## File Structure
```
src/
├── components/        # Reusable UI components
├── contexts/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # External service clients (Supabase, PayOS)
├── pages/           # Page components
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── assets/          # Static assets
```

## Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYOS_CLIENT_ID=your_payos_client_id
VITE_PAYOS_API_KEY=your_payos_api_key
VITE_PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

## Sample Data
- At least 20 furniture products across 5 categories
- 5 active vouchers with different discount types
- Sample reviews (15-30 per product) for demonstration
- Product images from Pexels

## Testing Checklist
- [ ] User registration and login
- [ ] Password reset flow
- [ ] Product browsing and filtering
- [ ] Search functionality
- [ ] Add to cart and cart management
- [ ] Checkout with all payment methods
- [ ] PayOS payment flow (requires test credentials)
- [ ] Order tracking
- [ ] Review submission (verified purchase)
- [ ] Favorites management
- [ ] Voucher application
- [ ] Profile updates
- [ ] Responsive design on all devices
- [ ] Loading states and error handling

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Deployment Notes
- Build optimized production bundle
- Configure environment variables on hosting platform
- Set up database migrations on Supabase
- Enable RLS policies
- Test PayOS integration in production environment
- Set up proper CORS headers for API requests

## Additional Features (Optional)
- Product comparison
- Recently viewed products
- Email notifications for orders
- Admin dashboard for order management
- Analytics and reporting
- Social sharing
- Live chat support
- Multi-language support
- Currency conversion
- Gift cards
- Loyalty program integration

## Security Considerations
- Never expose API keys in client code
- Validate all user inputs
- Sanitize data before database operations
- Use HTTPS for all requests
- Implement rate limiting for sensitive operations
- Secure payment data handling
- Regular security audits
- Keep dependencies updated

## Accessibility Requirements
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators
- Alternative text for images

---

This prompt provides everything needed to build a production-ready e-commerce furniture store. Follow best practices for React, TypeScript, and Supabase development throughout the implementation.
