# Design System Documentation
## Futuristic Theme with Neon Green Accents

This document outlines the complete design system used in the Safe Space application. Use this as a reference when building new applications with the same visual identity.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Styles](#component-styles)
6. [Effects & Animations](#effects--animations)
7. [Grid Background Pattern](#grid-background-pattern)
8. [Theme Implementation](#theme-implementation)
9. [Code Examples](#code-examples)

---

## Design Philosophy

**Theme:** Futuristic, Modern, Clean  
**Primary Accent:** Neon Green (HSL: 142° 76% 50%)  
**Aesthetic:** Dark mode preferred with subtle grid pattern, glowing effects, and smooth transitions  
**Mood:** Professional yet approachable, tech-forward, safe and secure

### Key Principles

- **Dark-First Design:** Dark mode is the primary experience, with light mode as an alternative
- **Neon Accents:** Green neon glow effects for interactive elements and focus states
- **Subtle Grid:** Background grid pattern adds depth without distraction
- **Smooth Transitions:** All interactions use 300ms transitions for polished feel
- **Glowing Borders:** Cards and inputs glow on hover/focus in dark mode
- **High Contrast:** Text remains readable in both themes

---

## Color System

### Light Theme Colors

```css
--background: 0 0% 100%          /* Pure white */
--foreground: 222.2 84% 4.9%     /* Near black */
--card: 0 0% 100%                /* White */
--card-foreground: 222.2 84% 4.9% /* Near black */
--primary: 142 76% 36%           /* Green (darker for light mode) */
--primary-foreground: 0 0% 100%   /* White */
--secondary: 210 40% 96.1%        /* Light gray */
--secondary-foreground: 222.2 47.4% 11.2% /* Dark gray */
--muted: 210 40% 96.1%           /* Light gray */
--muted-foreground: 215.4 16.3% 46.9% /* Medium gray */
--accent: 142 76% 36%             /* Green */
--accent-foreground: 0 0% 100%    /* White */
--destructive: 0 84.2% 60.2%      /* Red */
--destructive-foreground: 210 40% 98% /* Off-white */
--border: 214.3 31.8% 91.4%      /* Light gray */
--input: 214.3 31.8% 91.4%       /* Light gray */
--ring: 142 76% 36%              /* Green */
--radius: 0.5rem                  /* 8px border radius */
```

### Dark Theme Colors

```css
--background: 0 0% 3%             /* Very dark (almost black) */
--foreground: 142 70% 58%         /* Neon green text */
--card: 0 0% 5%                   /* Slightly lighter than background */
--card-foreground: 142 70% 58%    /* Neon green */
--primary: 142 76% 50%            /* Bright neon green */
--primary-foreground: 0 0% 0%     /* Black */
--secondary: 0 0% 8%               /* Dark gray */
--secondary-foreground: 142 70% 58% /* Neon green */
--muted: 0 0% 8%                  /* Dark gray */
--muted-foreground: 142 50% 45%   /* Muted green */
--accent: 142 76% 50%             /* Bright neon green */
--accent-foreground: 0 0% 0%     /* Black */
--destructive: 0 62.8% 30.6%      /* Dark red */
--destructive-foreground: 210 40% 98% /* Off-white */
--border: 0 0% 12%                /* Dark gray */
--input: 0 0% 12%                 /* Dark gray */
--ring: 142 76% 50%               /* Bright neon green */
```

### Color Usage Guidelines

- **Primary Green:** Use for primary actions, links, and important UI elements
- **Foreground:** Main text color (dark in light mode, neon green in dark mode)
- **Muted:** Secondary text, placeholders, and less important information
- **Border:** Subtle borders that glow in dark mode
- **Card:** Elevated surfaces with subtle glow on hover

---

## Typography

### Font Stack

Default system font stack (no custom fonts required):
- System UI fonts for optimal performance
- Sans-serif fallback

### Font Sizes

```css
text-xs    /* 0.75rem / 12px */
text-sm    /* 0.875rem / 14px */
text-base  /* 1rem / 16px */
text-lg    /* 1.125rem / 18px */
text-xl    /* 1.25rem / 20px */
text-2xl   /* 1.5rem / 24px */
text-3xl   /* 1.875rem / 30px */
```

### Font Weights

- **Regular:** 400 (default)
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

### Typography Classes

```css
/* Headings */
.text-2xl.font-semibold.leading-none.tracking-tight  /* Card titles */
.text-xl.font-bold                                   /* Page titles */
.text-lg.font-medium                                 /* Section headers */

/* Body text */
.text-sm.text-muted-foreground                       /* Descriptions, secondary text */
.text-xs.text-muted-foreground                       /* Captions, timestamps */
```

---

## Spacing & Layout

### Container

```css
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;    /* 16px */
  padding-right: 1rem;
  max-width: 1400px;     /* 2xl breakpoint */
}
```

### Padding & Margins

Standard spacing scale (Tailwind):
- `p-1` = 0.25rem (4px)
- `p-2` = 0.5rem (8px)
- `p-3` = 0.75rem (12px)
- `p-4` = 1rem (16px)
- `p-6` = 1.5rem (24px)
- `p-8` = 2rem (32px)

### Border Radius

```css
--radius: 0.5rem        /* 8px - default */
rounded-md              /* calc(var(--radius) - 2px) = 6px */
rounded-sm              /* calc(var(--radius) - 4px) = 4px */
rounded-lg              /* var(--radius) = 8px */
```

---

## Component Styles

### Buttons

#### Default Button (Primary)
```css
bg-primary text-primary-foreground
hover:bg-primary/90
dark:glow-green-sm
dark:hover:glow-green
transition-all duration-300
```

#### Outline Button
```css
border border-input bg-background
hover:bg-accent hover:text-accent-foreground
dark:border-primary/30
dark:hover:border-primary/60
dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]
transition-all duration-300
```

#### Button Sizes
- `h-10 px-4 py-2` (default)
- `h-9 px-3` (sm)
- `h-11 px-8` (lg)
- `h-10 w-10` (icon)

### Cards

```css
rounded-lg border bg-card text-card-foreground shadow-sm
transition-all duration-300
dark:border-primary/20
dark:hover:border-primary/40
dark:hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]
hover:shadow-lg
```

**Card Structure:**
- `CardHeader`: `p-6` with `space-y-1.5`
- `CardTitle`: `text-2xl font-semibold leading-none tracking-tight`
- `CardDescription`: `text-sm text-muted-foreground`
- `CardContent`: `p-6 pt-0`
- `CardFooter`: `p-6 pt-0` with flex layout

### Inputs & Textareas

```css
h-10 w-full rounded-md border border-input bg-background
px-3 py-2 text-sm
ring-offset-background
focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
dark:border-primary/20
dark:focus-visible:border-primary/60
dark:focus-visible:shadow-[0_0_15px_rgba(34,197,94,0.2)]
transition-all duration-300
```

**Textarea:**
- Same as input but with `min-h-[80px]`

### Headers

```css
border-b bg-background/95 backdrop-blur
supports-[backdrop-filter]:bg-background/60
```

---

## Effects & Animations

### Glow Effects

#### Green Glow (Large)
```css
.glow-green {
  box-shadow: 
    0 0 20px rgba(34, 197, 94, 0.3),
    0 0 40px rgba(34, 197, 94, 0.2);
}
```

#### Green Glow (Small)
```css
.glow-green-sm {
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}
```

#### Border Glow
```css
.border-glow {
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}
```

#### Text Glow
```css
.text-glow {
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}
```

### Shadow Effects

#### Card Hover (Dark Mode)
```css
dark:hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]
```

#### Input Focus (Dark Mode)
```css
dark:focus-visible:shadow-[0_0_15px_rgba(34,197,94,0.2)]
```

#### Button Hover (Dark Mode)
```css
dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]
```

### Transitions

All interactive elements use:
```css
transition-all duration-300
```

### Animations

#### Confetti Animation
```css
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

animation: confetti 3s ease-out forwards;
```

---

## Grid Background Pattern

### Light Mode
```css
background-image: 
  linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

### Dark Mode
```css
background-image: 
  linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px);
background-size: 50px 50px;
```

**Implementation:**
- Applied to `body` element
- Grid size: 50px × 50px
- Opacity: 3% (light), 5% (dark)
- Color: RGB(34, 197, 94) - neon green

---

## Theme Implementation

### Setup Requirements

1. **Tailwind Config**
```typescript
// tailwind.config.ts
darkMode: ["class"]
```

2. **CSS Variables**
All colors use HSL format with CSS variables for easy theme switching.

3. **Theme Provider**
Use a theme provider that:
- Supports 'light', 'dark', and 'system' modes
- Persists theme preference in localStorage
- Applies theme class to root element

### Theme Toggle Component

```tsx
// Theme toggle button with sun/moon icons
// Toggles between light, dark, and system
```

---

## Code Examples

### Complete CSS Setup

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 142 76% 36%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3%;
    --foreground: 142 70% 58%;
    --card: 0 0% 5%;
    --card-foreground: 142 70% 58%;
    --primary: 142 76% 50%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 8%;
    --secondary-foreground: 142 70% 58%;
    --muted: 0 0% 8%;
    --muted-foreground: 142 50% 45%;
    --accent: 142 76% 50%;
    --accent-foreground: 0 0% 0%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 0 0% 12%;
    --input: 0 0% 12%;
    --ring: 142 76% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    background-image: 
      linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  
  .dark body {
    background-image: 
      linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px);
  }
}

@layer utilities {
  .glow-green {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.2);
  }
  
  .glow-green-sm {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
  
  .border-glow {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
  
  .text-glow {
    text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  }
}
```

### Button Component Example

```tsx
<Button 
  variant="default" 
  size="lg"
  className="w-full"
>
  <Sparkles className="h-5 w-5 mr-2" />
  Generate Report
</Button>

<Button 
  variant="outline" 
  size="sm"
>
  Cancel
</Button>
```

### Card Component Example

```tsx
<Card>
  <CardHeader>
    <CardTitle>Campaign Report</CardTitle>
    <CardDescription>
      AI-powered analysis of feedback
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### Input Component Example

```tsx
<Input 
  type="text" 
  placeholder="Enter campaign title"
  className="w-full"
/>
```

### Header Example

```tsx
<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold">App Name</h1>
      <ThemeToggle />
    </div>
  </div>
</header>
```

---

## Design Tokens Summary

### Primary Color
- **HSL:** `142 76% 50%` (dark mode)
- **HSL:** `142 76% 36%` (light mode)
- **RGB:** `rgb(34, 197, 94)`
- **Hex:** `#22c55e` (approximate)

### Spacing Scale
- Base unit: `0.25rem` (4px)
- Common sizes: `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`

### Border Radius
- Default: `0.5rem` (8px)
- Small: `0.375rem` (6px)
- Extra Small: `0.25rem` (4px)

### Transitions
- Duration: `300ms`
- Timing: `ease` (default)

### Grid Pattern
- Size: `50px × 50px`
- Color: `rgba(34, 197, 94, 0.03-0.05)`

---

## Quick Reference Checklist

When implementing this design system in a new app:

- [ ] Set up CSS variables for light/dark themes
- [ ] Configure Tailwind with `darkMode: ["class"]`
- [ ] Add grid background pattern to body
- [ ] Implement glow utility classes
- [ ] Style buttons with neon effects in dark mode
- [ ] Add hover glow effects to cards
- [ ] Style inputs with focus glow in dark mode
- [ ] Set up theme provider with localStorage persistence
- [ ] Add smooth transitions (300ms) to all interactive elements
- [ ] Use consistent spacing scale
- [ ] Apply border radius consistently
- [ ] Test both light and dark modes

---

## Notes

- **Accessibility:** Ensure sufficient contrast ratios in both themes
- **Performance:** Grid pattern uses CSS gradients (GPU accelerated)
- **Browser Support:** Modern browsers with CSS custom properties support
- **Responsive:** Design is mobile-first with breakpoints at sm, md, lg, xl, 2xl

---

**Last Updated:** 2024  
**Version:** 1.0  
**Theme Name:** Futuristic Neon Green


