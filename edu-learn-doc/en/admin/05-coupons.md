# Coupon Management

## Overview

Create and manage discount codes to run promotions for users.

## Access

`Admin Dashboard → Coupons`

## Creating a New Coupon

### Basic Fields

| Field | Required | Description |
|-------|----------|-------------|
| Coupon Code | ✅ | Alphanumeric string (e.g. SAVE50) |
| Discount Type | ✅ | `percent` (%) or `fixed` (currency) |
| Discount Value | ✅ | Percentage or fixed amount |
| Max Discount | ❌ | Cap on discount amount (for % type) |
| Minimum Order | ❌ | Minimum order value to apply coupon |
| Max Uses | ❌ | Total usage limit |
| Expiry Date | ❌ | Date after which coupon is invalid |
| Status | ✅ | `active` / `inactive` |

## Discount Types

| Type | Example | Meaning |
|------|---------|---------|
| `percent` | 20 | Deducts 20% from the order total |
| `fixed` | 50000 | Deducts a fixed amount directly |

## Usage Tracking

- **Times Used**: How many times the coupon has been applied
- **Total Discounted**: Total money saved via this coupon
- **Order List**: All orders that applied this coupon

## Search & Filter

- Search by **coupon code**
- Filter by **status** (active/inactive)
- Filter **valid / expired** coupons
