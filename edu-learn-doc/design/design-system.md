# EduLearn Design System

## Brand Colors

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#eef2ff` | Light backgrounds |
| `primary-100` | `#e0e7ff` | Hover backgrounds |
| `primary-500` | `#6366f1` | Icons, borders |
| `primary-600` | `#4f46e5` | Primary buttons, links |
| `primary-700` | `#4338ca` | Hover state buttons |

### Secondary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-500` | `#a855f7` | Accents |
| `secondary-600` | `#9333ea` | Gradient partner |
| `secondary-700` | `#7e22ce` | Hover secondary |

### Semantic Colors
| Purpose | Color |
|---------|-------|
| Success | `#22c55e` (green-500) |
| Warning | `#f59e0b` (amber-500) |
| Error | `#ef4444` (red-500) |
| Info | `#3b82f6` (blue-500) |

---

## Typography

### Font Family
- **Primary**: Poppins (Google Fonts)
- **Fallback**: sans-serif

### Font Scale (Responsive)

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | `text-3xl` (30px) | `text-5xl` (48px) | `text-6xl` (60px) |
| H2 | `text-2xl` (24px) | `text-3xl` (30px) | `text-4xl` (36px) |
| H3 | `text-xl` (20px) | `text-2xl` (24px) | `text-3xl` (30px) |
| Body | `text-sm` (14px) | `text-base` (16px) | `text-lg` (18px) |
| Small | `text-xs` (12px) | `text-sm` (14px) | `text-sm` (14px) |

---

## Spacing System

### Container
```css
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Section Padding (Responsive)
```css
py-12 md:py-16 lg:py-20
```

### Grid Gaps
```css
gap-4 md:gap-6 lg:gap-8
```

### Card Padding
```css
p-4 md:p-6 lg:p-8
```

---

## Button Styles

### Primary Button
```html
<button class="btn-primary">
  Label
</button>
```
- Background: gradient from `primary-600` to `secondary-600`
- Padding: `px-4 py-2` (mobile) → `px-6 py-3` (desktop)
- Border radius: `rounded-xl`
- Hover: `shadow-lg` + `-translate-y-0.5`

### Secondary Button
```html
<button class="btn-secondary">
  Label
</button>
```
- Border: `2px border-primary-600`
- Text: `text-primary-600`
- Hover: Fill with primary color

### Outline Button
```html
<button class="btn-outline">
  Label
</button>
```
- Border: `1px border-gray-300`
- Hover: `border-primary-500 text-primary-600`

---

## Card Component

```html
<div class="card">
  Content
</div>
```
- Background: `white`
- Border radius: `rounded-xl`
- Shadow: `shadow-card` → hover `shadow-card-hover`
- Hover lift: `hover:-translate-y-1`
- Padding: `p-4 md:p-6 lg:p-8`

---

## Grid Layouts

### 4-column course grid
```css
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
```

### 2-column split layout
```css
grid grid-cols-1 md:grid-cols-2 gap-8
```

---

## Border Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Small elements |
| `rounded-xl` | 12px | Buttons, inputs |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-3xl` | 24px | Large feature cards |
| `rounded-full` | 9999px | Avatars, badges |

---

## Shadows

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation |
| `shadow-md` | Default cards |
| `shadow-lg` | Dropdowns, modals |
| `shadow-xl` | Floating elements |

---

## Navbar

- Height: `h-16 lg:h-20`
- Background: White with `backdrop-blur`
- Position: `sticky top-0 z-50`
- Border: `border-b border-gray-100`

---

## Logo Fallback (No Image)

When no logo is uploaded:
- Show a colored square with rounded corners
- Background: `primary-600` (or brand primary color)
- Text: First 2 uppercase characters of website name
- Font: `font-black text-white`
- Right side: Website name and slogan

---

## Animation Classes

| Class | Effect |
|-------|--------|
| `animate-pulse-slow` | Slow pulsing (badge indicators) |
| `hover:-translate-y-0.5` | Micro lift on hover |
| `hover:-translate-y-1` | Card lift on hover |
| `transition-all duration-300` | Smooth all-property transitions |
