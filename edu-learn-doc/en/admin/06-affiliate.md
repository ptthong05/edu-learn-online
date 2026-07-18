# Affiliate System

## Overview

EduLearn provides an affiliate system that allows users to earn commissions by referring customers to purchase courses.

## Access

`Admin Dashboard → Affiliate`

## Managing Affiliates

### Affiliate List

| Column | Description |
|--------|-------------|
| User | Affiliate name & email |
| Referral Code | Unique referral link code |
| Total Revenue | Revenue generated via their link |
| Commission | Total commission earned |
| Withdrawn | Amount already paid out |
| Balance | Current available balance |
| Status | `active` / `suspended` |

## Commission Rate

The admin configures the default commission rate (e.g. 20% per successful referred order).

## Managing Withdrawals

When an affiliate requests a withdrawal:

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting admin review |
| `approved` | Approved, processing transfer |
| `rejected` | Request denied |
| `completed` | Transfer completed |

### Processing a Withdrawal
1. Go to **Affiliate → Withdrawal Requests**
2. View the affiliate bank account details
3. Manually process the bank transfer
4. Update status to `completed`

## Affiliate Statistics

- **Total Affiliates**: Number of participants
- **Revenue from Affiliates**: Total referred revenue
- **Commissions Payable**: Total commissions owed
- **Paid Out**: Total already transferred

## Affiliate Notifications

Admins can send announcements to all or specific affiliates via the **Affiliate Notifications** feature.
