# Database Setup Instructions

## Important: Complete These Steps to Fix Registration and Orders

Your application requires some manual database configuration to work properly. Follow these steps:

### Step 1: Run the Database Setup Script

1. Open your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Open the file `SETUP_DATABASE.sql` from your project root
4. Copy the entire contents
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the script

This script will:
- ✅ Create automatic profile creation when users sign up
- ✅ Fix Row Level Security (RLS) policies for all tables
- ✅ Enable proper order creation and management
- ✅ Fix favorites functionality

### Step 2: Configure Email Settings (Optional)

If you want email verification for new users:

1. Go to **Authentication > Email Templates** in Supabase Dashboard
2. Enable **Confirm signup** email template
3. Customize the email template if desired
4. Users will need to verify their email before logging in

**Note:** By default, email confirmation is disabled, so users can log in immediately after registration.

### What This Fixes

#### 1. Registration Error
- **Problem:** "new row violates row-level security policy for table 'profiles'"
- **Solution:** Automatic profile creation trigger bypasses RLS

#### 2. Checkout/Order Errors
- **Problem:** "Failed to place order"
- **Solution:** Proper RLS policies allow authenticated users to create orders

#### 3. My Orders Loading Error
- **Problem:** "Failed to load orders"
- **Solution:** RLS policies allow users to view their own orders

#### 4. Favorites Issues
- **Problem:** Unable to add/remove favorites
- **Solution:** RLS policies properly configured for favorites table

### Verifying the Setup

After running the script, test the following:

1. ✅ Register a new account
2. ✅ Add items to favorites
3. ✅ Place an order through checkout
4. ✅ View your orders in "My Orders" page

### Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Verify RLS is enabled on all tables
3. Confirm the trigger was created successfully
4. Check that policies were created without errors

### Technical Details

The script creates:
- A trigger function `handle_new_user()` that runs on user signup
- RLS policies for `profiles`, `orders`, `order_items`, and `favorites` tables
- Proper security checks to ensure users can only access their own data
