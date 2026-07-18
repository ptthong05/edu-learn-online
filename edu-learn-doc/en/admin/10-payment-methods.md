# Payment Methods

## Overview

Configure the accepted payment methods on the EduLearn platform.

## Access

`Admin Dashboard → Payment Methods`

## Supported Methods

| Method | Description |
|--------|-------------|
| Bank Transfer | Direct bank transfer payment |
| E-Wallet (MoMo, ZaloPay) | Payment via digital wallets |
| Credit Card | Visa, Mastercard |

## Configuring a Method

For each payment method:

| Field | Description |
|-------|-------------|
| Method Name | Display name shown to users |
| Instructions | Step-by-step payment guide |
| Account Details | Account number, bank name, QR Code |
| Status | Enabled / Disabled |

## Payment Flow

1. User selects a course and goes to **Checkout**
2. Selects a payment method
3. Completes transfer / scans QR code
4. Uploads proof of payment (receipt)
5. Admin confirms and updates order to `completed`
6. System automatically grants course access

## Notes

- Current system uses **manual payment confirmation** (Admin verifies)
- Automatic payment gateways (VNPay, Stripe) can be integrated in a future version
