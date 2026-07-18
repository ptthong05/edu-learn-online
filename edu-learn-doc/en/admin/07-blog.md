# Blog Management

## Overview

EduLearn includes an integrated blog system for sharing articles, news, and learning guides.

## Access

`Admin Dashboard → Blog`

## Blog Post List

| Column | Description |
|--------|-------------|
| Title | Post title |
| Author | Writer |
| Category | Post classification |
| Views | Number of reads |
| Status | `published` / `draft` |
| Created At | Publication date |

## Creating a New Post

| Field | Required | Description |
|-------|----------|-------------|
| Title | ✅ | Post title |
| Slug | ✅ | URL-friendly string (auto-generated from title) |
| Content | ✅ | Post body (Rich Text supported) |
| Thumbnail | ❌ | Featured image |
| Tags | ❌ | Classification labels |
| Status | ✅ | `published` / `draft` |
| Summary | ❌ | Short excerpt shown in the listing page |

## Post Statuses

| Status | Meaning |
|--------|---------|
| `published` | Publicly visible on the blog page |
| `draft` | Saved draft, visible to Admin only |

## Features

- **Search**: Find by title or content
- **Filter**: By status, author, date range
- **Pagination**: 10 posts per page
