# PROJECT RULES - USDT BASED MLM PLAN

## PROJECT OVERVIEW
This is a USDT (TRC20) based MLM investment platform with referral system. All business logic must strictly follow the rules defined below.

---

## 1. AUTHENTICATION & USER MANAGEMENT

### Login System
- **Method**: Mobile number with OTP verification
- **One user = One account only**
- Multiple accounts detection results in permanent account freeze
- Auth pages (`/auth/*`) must NOT have header or footer

### User Registration
- Mobile number is the primary identifier
- OTP verification required for registration
- Each mobile number can only register once

---

## 2. INVESTMENT RULES

### Investment Limits
- **Minimum investment**: 10 USDT
- **No maximum limit** (except Special Investor Plan threshold)
- Users can add investments **multiple times**
- **Total investment is cumulative** (sum of all investments)

### Investment Restrictions
- **Interest reinvestment is NOT allowed**
- Investment can only be added, not withdrawn until conditions are met

### Special Investor Plan
- **Threshold**: 10,000 USDT or more
- **Fixed daily interest**: 1% (not variable)
- **No team or referral requirements**
- **No referral income applicable**
- Monthly withdrawal only
- Payout within 24 hours
- Recommended capital lock-in: 90 days

---

## 3. DAILY INTEREST (REWARD) SYSTEM

### Base Interest
- **Base daily interest**: 0.50%
- Interest is calculated **daily**
- Interest accumulates in dashboard but remains **locked** until conditions are met

### Interest Calculation Formula
```
Base Interest = 0.50%
Bonus Interest = (Number of Direct Active Referrals / 10) * 0.05%
Total Daily Interest = Base Interest + Bonus Interest
Maximum Cap = 2.00% per day
```

### Interest Cap Rules
- For every **10 direct active referrals**, interest increases by **0.05%**
- **Maximum interest cap**: 2.00% per day
- Interest calculation stops at 2.00% even if user has more referrals

### Interest Lock Condition
- Interest withdrawal is **NOT allowed** until total investment reaches **500 USDT**
- Interest accumulates but cannot be withdrawn
- Interest reinvestment is **NOT allowed** at any time

---

## 4. WITHDRAWAL SYSTEM

### Withdrawal Lock Condition
**Until total investment reaches 500 USDT:**
- ❌ Interest withdrawal NOT allowed
- ❌ Principal withdrawal NOT allowed
- ❌ Interest reinvestment NOT allowed

**Once total investment reaches 500 USDT:**
- ✅ Interest withdrawal is unlocked
- ✅ Monthly withdrawal cycle starts

### Interest Withdrawal Rules
- **Frequency**: Once per month only
- **Minimum withdrawal**: 20 USDT
- **Maximum withdrawal**: 30% of monthly interest accumulated
- **Processing time**: Within 24 hours
- **Network/gas fee**: Paid by user (deducted from withdrawal amount)

### Principal Withdrawal
- Principal withdrawal rules to be defined (not specified in requirements)

---

## 5. REFERRAL INCOME SYSTEM

### Critical Conditions
- **Referral income is ONLY applicable if referrer has minimum total investment of 500 USDT**
- If total investment is below 500 USDT, referral income will **NOT be credited**
- Referral income is **NOT paid in cash**
- Referral income is **NOT added to interest**
- Referral income is **directly added to investment balance only**

### Referral Percentage Slabs
| Direct Referrals | Referral Income Percentage |
|-----------------|---------------------------|
| 10 - 49         | 0.5%                      |
| 50 - 90         | 1.0%                      |
| 91 - 120        | 1.5%                      |
| 121 - 150       | 2.0%                      |
| 151+            | 3.0% (Maximum)            |

### Referral Income Calculation
- Calculated on **direct referrals only** (not downline)
- Based on **active referrals** (users who have invested)
- Percentage applied to referral's investment amount
- Added directly to referrer's investment balance (not wallet)

---

## 6. SAFETY & CONTROL RULES

### Account Security
- **Multiple accounts detected**: Permanent freeze
- **60 days inactivity**: Interest paused (resumes on activity)
- **Large withdrawals**: Require manual admin approval
- **Suspicious activity**: Account review and hold

### Admin Controls
- Admin can freeze/unfreeze accounts
- Admin can approve/reject withdrawal requests
- Admin can review and manage user accounts
- Admin can view all transactions and activities

---

## 7. SYSTEM SUSTAINABILITY LOGIC

### Key Principles
- ❌ No interest compounding
- ❌ No cash referral payouts
- ✅ Monthly withdrawal system only
- ✅ Hard interest cap enforced (2.00% max)
- ✅ Designed for long-term (2+ years) operation

### Interest Calculation
- Interest is calculated daily but **not compounded**
- Previous day's interest does not earn interest
- Only principal investment earns interest

---

## 8. USER FLOW SUMMARY

1. User registers via mobile number
2. OTP verification required
3. User starts investment from 10 USDT minimum
4. Interest shows daily but remains **locked** until 500 USDT investment
5. Referral income credited **only after** 500 USDT investment reached
6. Once investment reaches 500 USDT:
   - Interest withdrawal unlocks
   - Referral benefits unlock
7. Monthly withdrawal requested and paid within 24 hours

---

## 9. FRONTEND STRUCTURE RULES

### Auth Pages (`/auth/*`)
- **NO header**
- **NO footer**
- Clean, minimal design
- Pages: `/auth/login`, `/auth/register`, `/auth/verify-otp`

### User Pages (`/user/*`)
- **User header** (navigation, user info, logout)
- **User footer** (links, copyright)
- Pages:
  - `/user/dashboard` - Main dashboard with stats
  - `/user/investment` - Add/view investments
  - `/user/referrals` - Referral network and income
  - `/user/withdrawal` - Withdrawal requests
  - `/user/profile` - User profile and settings

### Admin Pages (`/admin/*`)
- **Admin header only** (no footer)
- Pages:
  - `/admin/dashboard` - Admin overview
  - `/admin/users` - User management
  - `/admin/investments` - Investment management
  - `/admin/withdrawals` - Withdrawal approvals
  - `/admin/settings` - System settings

---

## 10. BACKEND API RULES

### API Base URL
- Development: `http://localhost:3500`
- Production: To be configured in `.env`

### Required Endpoints

#### Authentication
- `POST /api/auth/register` - Register with mobile
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Dashboard data

#### Investment
- `POST /api/investment/add` - Add investment
- `GET /api/investment/history` - Investment history
- `GET /api/investment/current` - Current investment stats

#### Referral
- `GET /api/referral/network` - Referral network
- `GET /api/referral/income` - Referral income history
- `GET /api/referral/stats` - Referral statistics

#### Withdrawal
- `POST /api/withdrawal/request` - Request withdrawal
- `GET /api/withdrawal/history` - Withdrawal history
- `GET /api/withdrawal/status/:id` - Check withdrawal status

#### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/investments` - All investments
- `GET /api/admin/withdrawals` - All withdrawals
- `PUT /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `PUT /api/admin/withdrawals/:id/reject` - Reject withdrawal

---

## 11. DATABASE SCHEMA REQUIREMENTS

### User Schema
- Mobile number (unique, required)
- OTP verification status
- Total investment (cumulative)
- Current investment balance
- Interest balance (locked/unlocked)
- Referral code
- Referrer ID
- Direct referrals count
- Account status (active, frozen, inactive)
- Last activity date
- Created date

### Investment Schema
- User ID
- Amount
- Transaction hash (USDT)
- Status (pending, confirmed)
- Date
- Type (new investment, referral income)

### Withdrawal Schema
- User ID
- Amount
- Requested amount
- Network fee
- Status (pending, approved, rejected, processed)
- Request date
- Processed date
- Transaction hash
- Admin notes

### Referral Schema
- Referrer ID
- Referred user ID
- Referral income amount
- Date credited
- Status (active, inactive)

---

## 12. CALCULATION LOGIC

### Daily Interest Calculation
```javascript
function calculateDailyInterest(user) {
  const baseInterest = 0.50; // 0.50%
  const activeReferrals = user.directActiveReferrals;
  const bonusInterest = Math.floor(activeReferrals / 10) * 0.05;
  const totalInterest = Math.min(baseInterest + bonusInterest, 2.00); // Cap at 2.00%
  
  const dailyInterest = (user.totalInvestment * totalInterest) / 100;
  return dailyInterest;
}
```

### Referral Income Calculation
```javascript
function calculateReferralIncome(referrer, referredUserInvestment) {
  // Check if referrer has minimum 500 USDT investment
  if (referrer.totalInvestment < 500) {
    return 0; // No referral income
  }
  
  const referralCount = referrer.directReferrals;
  let percentage = 0;
  
  if (referralCount >= 151) percentage = 3.0;
  else if (referralCount >= 121) percentage = 2.0;
  else if (referralCount >= 91) percentage = 1.5;
  else if (referralCount >= 50) percentage = 1.0;
  else if (referralCount >= 10) percentage = 0.5;
  else return 0;
  
  const referralIncome = (referredUserInvestment * percentage) / 100;
  // Add directly to investment balance, not wallet
  return referralIncome;
}
```

### Withdrawal Validation
```javascript
function validateWithdrawal(user, requestedAmount) {
  // Check if user has reached 500 USDT investment
  if (user.totalInvestment < 500) {
    return { valid: false, error: 'Minimum 500 USDT investment required' };
  }
  
  // Check minimum withdrawal
  if (requestedAmount < 20) {
    return { valid: false, error: 'Minimum withdrawal is 20 USDT' };
  }
  
  // Check monthly withdrawal limit (30% of monthly interest)
  const monthlyInterest = user.monthlyInterestAccumulated;
  const maxWithdrawal = (monthlyInterest * 30) / 100;
  
  if (requestedAmount > maxWithdrawal) {
    return { valid: false, error: 'Maximum withdrawal is 30% of monthly interest' };
  }
  
  // Check if user has already withdrawn this month
  if (user.lastWithdrawalDate && isSameMonth(user.lastWithdrawalDate, new Date())) {
    return { valid: false, error: 'Only one withdrawal per month allowed' };
  }
  
  return { valid: true };
}
```

---

## 13. UI/UX RULES

### Design Principles
- Minimal, modern, light theme
- Use CSS variables from `globals.css`
- Color scheme: Navy blue, dark purple, gray, white
- Responsive design for mobile and desktop

### Component Structure
- Reusable components in `/src/components`
- Module-specific components in respective module folders
- Shared components (headers, footers) in `/src/components/shared`

### State Management
- Use React Context for auth and user state
- Custom hooks for data fetching
- Local state for form inputs

---

## 14. SECURITY RULES

### Frontend
- Validate all inputs before submission
- Sanitize user inputs
- Protect routes with middleware
- Store tokens securely (httpOnly cookies preferred)

### Backend
- Validate all API requests
- Sanitize database inputs
- Use JWT for authentication
- Rate limiting on sensitive endpoints
- CORS configuration
- Input validation middleware

---

## 15. ERROR HANDLING

### Frontend
- Show user-friendly error messages
- Handle network errors gracefully
- Loading states for async operations
- Form validation feedback

### Backend
- Consistent error response format
- Proper HTTP status codes
- Error logging
- Don't expose sensitive information in errors

---

## 16. TESTING REQUIREMENTS

### Critical Paths to Test
1. User registration and OTP verification
2. Investment addition and cumulative calculation
3. Interest calculation with referral bonuses
4. Referral income calculation (500 USDT threshold)
5. Withdrawal lock/unlock at 500 USDT
6. Monthly withdrawal limits
7. Special Investor Plan (10,000 USDT+)
8. Multiple account detection
9. Inactivity handling (60 days)

---

## 17. IMPORTANT DISCLAIMERS

- This is a digital reward & participation model
- Returns are variable and not guaranteed
- Platform does not promise fixed income
- Subject to platform terms and risk disclosures
- All calculations must be transparent to users

---

## 18. DEVELOPMENT NOTES

- Always validate business rules before implementing features
- Test edge cases (boundary values: 500 USDT, 10 referrals, etc.)
- Ensure calculations are accurate and match requirements
- Document any deviations from these rules
- Keep code modular and maintainable
- Follow existing code style and patterns

---

**Last Updated**: [Current Date]
**Version**: 1.0

