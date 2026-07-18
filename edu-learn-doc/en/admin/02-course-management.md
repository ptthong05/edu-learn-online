# Course Management

## Overview

The course management module allows admins to create, edit, delete and manage the status of courses on the platform.

## Access

`Admin Dashboard → Courses`

## Course List

The table displays all courses with the following columns:
- **Course Name** – Course title
- **Category** – Classification category
- **Price / Sale Price** – Pricing information
- **Students** – Number of enrolled students
- **Status** – `active` / `inactive`
- **Actions** – View, Edit, Delete

## Creating a New Course

### Basic Information
| Field | Required | Description |
|-------|----------|-------------|
| Course Name | ✅ | Display title |
| Short Description | ✅ | Brief summary |
| Full Description | ❌ | Detailed content (HTML supported) |
| Category | ✅ | Select from category list |
| Thumbnail | ❌ | Course cover image |
| Preview Video | ❌ | Preview video URL |

### Pricing
| Field | Required | Description |
|-------|----------|-------------|
| Original Price | ✅ | Listed price |
| Sale Price | ❌ | Discounted price (leave empty = no discount) |
| Free Course | ❌ | Checkbox for free courses |

## Status Management

| Status | Meaning |
|--------|---------|
| `active` | Course is visible and purchasable |
| `inactive` | Hidden from user-facing pages |
