# Promo Code Testing Guide

## Test Promo Codes Available

I've created several test promo codes for verification:

1. **TEST20** - 20% discount (Test Influencer)
2. **WELCOME10** - 10% discount (Welcome Campaign)  
3. **VIP30** - 30% discount (VIP Program)

## Testing the Promo Code Flow

### 1. Test Signup with Promo Code
1. Go to `/auth?mode=signup&ref=TEST20`
2. Complete signup form
3. Verify that the referral code is pre-filled
4. Complete signup
5. Check that `user_promotions` table has a record for the new user

### 2. Test Subscription Purchase with Promo
1. After signup, go to subscription page
2. Select a plan (not starter)
3. The promo code should be automatically detected and applied
4. Verify discount is shown in UI and pricing is reduced
5. Complete subscription
6. Verify `user_subscriptions.discount_applied` and `referral_code` are saved

### 3. Test Manual Promo Code Entry
1. Sign up without referral code
2. Go to subscription page with `?ref=WELCOME10`
3. Verify 10% discount is applied
4. Complete subscription

### 4. Test Promo Code During Checkout
1. Use localStorage: `localStorage.setItem('applied-referral-code', 'VIP30')`
2. Go to subscription page
3. Verify 30% discount is applied

## Expected Behavior

- ✅ Promo codes applied during signup are stored in `user_promotions`
- ✅ Promo codes are automatically detected during subscription purchase
- ✅ Discounts are calculated correctly (rounded to 2 decimal places)
- ✅ Final price and discount amount are displayed in UI
- ✅ `discount_applied` and `referral_code` are saved to database
- ✅ Success toasts show discount details
- ✅ Invalid/expired codes show appropriate error messages

## Database Verification

Check these tables after testing:
```sql
-- Check promo codes
SELECT * FROM promo_codes;

-- Check user promotions
SELECT * FROM user_promotions;

-- Check subscription with discount
SELECT user_id, plan_id, discount_applied, referral_code FROM user_subscriptions WHERE discount_applied > 0;
```

## Admin Management

Super admins can:
- View all promo codes in `/dashboard/superadmin`
- Create new promo codes with specific discount percentages
- See which users have applied promo codes
- Delete promo codes if needed
