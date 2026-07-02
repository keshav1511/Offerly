# Offerly Design System

This document establishes the official Design System, UI guidelines, and UX constraints for **Offerly**, a production-quality AI Career Copilot. It defines the visual variables, layout spacing, structural interfaces, and core design principles to guarantee visual consistency and premium quality across the entire SaaS application.

---

## 1. Brand Identity

### Brand Name
**Offerly** (often stylized as **OFFERLY.** in monospace typography).

### Mission
To simplify the job search by providing candidates with high-resolution semantic matches, automated resume optimization, and robust lifecycle tracking. Offerly removes the guesswork from job hunting.

### Vision
To become the definitive, high-performance workstation for professional career progression, offering an experience that feels closer to an IDE or trading platform than a generic job board.

### Brand Personality
- **Technical & Precise**: We prioritize data clarity, clean lines, and lightning-fast responsiveness.
- **Intelligent & Focused**: We present insights cleanly, avoiding decorative clutter.
- **High Contrast**: Like Nothing or Vercel, we lean heavily into monochrome layouts punctuated by sharp, intentional red highlights.

### Tone of Voice & Writing Style
- **Direct & Active**: Avoid passive or generic text (e.g., use "Parse Resume" instead of "Your resume is now being parsed by the system").
- **Professional & Objective**: Avoid exclamation points and emojis in functional areas. Let the data speak for itself.
- **Systematic**: Technical labels should use uppercase monospace formats (e.g., `STATUS: INTERVIEWING`, `MATCH_SCORE: 92%`).

---

## 2. Color Palette

Offerly utilizes a high-contrast, monochrome color scheme inspired by Nothing and Vercel, using pure blacks, bright whites, and a range of technical cool grays, with **Nothing Red** as the primary functional accent.

### Light Mode

| Token | CSS Variable | Hex Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Black)** | `--primary` | `#000000` | Main text, primary buttons, headers |
| **Secondary** | `--secondary` | `#F4F4F5` | Secondary buttons, select backgrounds |
| **Background (White)** | `--background` | `#FFFFFF` | Root app background |
| **Surface** | `--card` | `#FFFFFF` | Card backgrounds, table panels |
| **Border** | `--border` | `#E4E4E7` | Thin, sharp structural dividers |
| **Accent (Nothing Red)**| `--accent` | `#FF0000` | Focus states, critical metrics, logo dots |
| **Success (Green)** | `--success` | `#10B981` | Positive matches, signed offers |
| **Warning (Amber)** | `--warning` | `#F59E0B` | System limits, pending notifications |
| **Danger (Red)** | `--destructive` | `#EF4444` | Deletions, API failure alerts |
| **Info (Blue)** | `--info` | `#3B82F6` | Explanatory panels, neutral guides |
| **Muted** | `--muted` | `#71717A` | Placeholder text, secondary labels |
| **Hover** | `--hover` | `#FAFAFA` | Subtle background changes on list hover |
| **Active** | `--active` | `#F4F4F5` | Item pressed states |
| **Focus** | `--focus` | `#000000` | Focus outlines and rings |
| **Disabled** | `--disabled` | `#E4E4E7` | Unclickable icons and buttons |

### Dark Mode

| Token | CSS Variable | Hex Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Primary (White)** | `--primary` | `#F4F4F6` | Main text, primary buttons, headers |
| **Secondary** | `--secondary` | `#1E1E1F` | Secondary buttons, select backgrounds |
| **Background (Black)** | `--background` | `#0A0A0A` | Root app dark background |
| **Surface** | `--card` | `#0F0F10` | Card backgrounds, table panels |
| **Border** | `--border` | `#222223` | Thin, sharp structural dividers |
| **Accent (Nothing Red)**| `--accent` | `#FF0000` | Focus states, critical metrics, logo dots |
| **Success (Green)** | `--success` | `#059669` | Positive matches, signed offers |
| **Warning (Amber)** | `--warning` | `#D97706` | System limits, pending notifications |
| **Danger (Red)** | `--destructive` | `#DC2626` | Deletions, API failure alerts |
| **Info (Blue)** | `--info` | `#2563EB` | Explanatory panels, neutral guides |
| **Muted** | `--muted` | `#A1A1AA` | Placeholder text, secondary labels |
| **Hover** | `--hover` | `#121213` | Subtle background changes on list hover |
| **Active** | `--active` | `#1E1E1F` | Item pressed states |
| **Focus** | `--focus` | `#FFFFFF` | Focus outlines and rings |
| **Disabled** | `--disabled` | `#1A1A1B` | Unclickable icons and buttons |

---

## 3. Typography

Offerly uses a geometric sans-serif for interface hierarchy, paired with a specialized monospace font for technical metrics, tags, statuses, and data tables.

- **Primary Font**: **Inter** or **Outfit** (Clean, neutral geometric shapes for maximum readability in panels and lists).
- **Secondary Font**: **Inter** (Optimized for long-form reading, such as CV content and job descriptions).
- **Monospace Font**: **JetBrains Mono** or **Geist Mono** (Technical readouts, metrics, labels, status text, and code previews).

### Typographic Scale

| Style | Font | Size (px) | Weight | Line Height | Case / Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Heading** | Outfit | `64px` | Bold (`700`) | `1.1` | Uppercase, tracking-tighter |
| **H1 Heading** | Outfit | `36px` | Bold (`700`) | `1.2` | Uppercase, tracking-tighter |
| **H2 Heading** | Outfit | `24px` | SemiBold (`660`) | `1.3` | Uppercase, tracking-tight |
| **H3 Heading** | Outfit | `18px` | SemiBold (`660`) | `1.4` | Uppercase, tracking-normal |
| **Body Large** | Inter | `16px` | Regular (`400`) | `1.5` | Sentence, tracking-normal |
| **Body Regular** | Inter | `14px` | Regular (`400`) | `1.5` | Sentence, tracking-normal |
| **Body Small** | Inter | `12px` | Regular (`400`) | `1.4` | Sentence, tracking-normal |
| **Technical Label** | Monospace| `11px` | Medium (`500`) | `1.2` | Uppercase, tracking-widest |
| **Button Text** | Monospace| `12px` | SemiBold (`600`) | `1.2` | Uppercase, tracking-wider |
| **Caption** | Inter | `10px` | Regular (`400`) | `1.3` | Sentence, tracking-wide |

---

## 4. Spacing System

Offerly strictly enforces a **4px baseline grid** to maintain horizontal and vertical alignment.

- **`4px` (Micro)**: Border adjustments, tiny icon-to-text gaps, internal checkbox padding.
- **`8px` (Small)**: Gaps between related text elements (e.g., subtitle directly under title), button internal horizontal/vertical padding.
- **`12px` (Small-Medium)**: List item gaps, tag list separations, padding inside inputs.
- **`16px` (Medium)**: Default gap between form fields, internal padding for small cards, gap between columns on tablet devices.
- **`24px` (Large)**: Default spacing inside cards, sidebar navigation gaps, main desktop layout gutters.
- **`32px` (Large-XL)**: Page header to page content margin, layout section dividers on dashboard panels.
- **`48px` (XL)**: Section separations on marketing and landing pages.
- **`64px` (XXL)**: Hero layout margins, major system transition divisions.

---

## 5. Border Radius

To maintain the **Nothing-inspired geometric aesthetic**, we reject rounded blobs. Everything is built with sharp, precise edges.

- **Buttons**: `0px` (Sharp corner standard).
- **Cards**: `0px` (Sharp corner standard, highlighted by solid border lines).
- **Inputs**: `0px` (Sharp corner standard).
- **Dialogs & Modals**: `0px` (Sharp, clean modular windows).
- **Tooltips**: `2px` (Subtle radius allowed only at micro-scale to separate from page lines).
- **Checkboxes & Switches**: `0px` (Checkboxes are square; switches use sharp rectangular sliding caps).

---

## 6. Elevation & Shadows

We avoid heavy, diffuse shadows. Instead, we use solid black outlines or double-borders to represent depth, keeping the UI flat and technical.

- **Low Elevation (Cards)**: No shadow. Flat borders: `1px solid var(--border)`.
- **Medium Elevation (Dropdowns/Popovers)**: `2px solid var(--primary)` or a double-border outline:
  - `box-shadow: 2px 2px 0px 0px rgba(0,0,0,1)` (in light mode) / `rgba(255,255,255,1)` (in dark mode).
- **High Elevation (Dialogs/Modals)**: Solid black shadow overlays:
  - `box-shadow: 6px 6px 0px 0px rgba(0,0,0,1)` (in light mode) / `rgba(255,255,255,1)` (in dark mode) with a clean border outline.
- **Floating Action Buttons (FAB)**: Same as Medium Elevation.

---

## 7. Buttons

Buttons follow strict geometric, uppercase formatting.

### Variants
- **Primary**: Solid background (`var(--primary)`), text is `var(--primary-foreground)`.
- **Secondary**: Light background (`var(--secondary)`), text is `var(--secondary-foreground)`.
- **Ghost**: Transparent background, no border. Subtle background color shifts on hover.
- **Outline**: Transparent background, `1px solid var(--border)` outline.
- **Danger**: Solid red background (`var(--destructive)`), white text.
- **Success**: Solid green background (`var(--success)`), white text.
- **Loading**: Disabled state with an inline, rotating loader and hidden label.
- **Disabled**: Slate/zinc background, opacity `0.4`, unclickable cursor.

### Sizes
- **Small (sm)**: Height `32px`, horizontal padding `12px`, text size `10px`.
- **Medium (md)**: Height `40px`, horizontal padding `16px`, text size `12px`.
- **Large (lg)**: Height `48px`, horizontal padding `24px`, text size `14px`.
- **Icon Button**: Aspect ratio `1:1`, padded equally on all sides.

---

## 8. Input Components

Inputs are configured with a solid border, uppercase labels, and monospace placeholder text.

- **Text & Email**: Sharp `0px` text box with a `1px` border, switching to `1px solid var(--accent)` on focus.
- **Password**: Includes a monospace toggle button `[SHOW]`/`[HIDE]` on the right.
- **OTP**: Six separate square text fields (`48px` x `48px`), centering monospace numbers, focusing fields sequentially.
- **Dropdown**: Select trigger utilizing custom Lucide chevron icons, popovers display list items with custom hover states.
- **Search**: Input prefix icon (`Search` from Lucide) and optional `[Ctrl+K]` badge inside.
- **Resume Upload Dropzone**: Dotted/dashed border container with a hover highlight state, displaying upload metadata upon completion.
- **Checkbox / Radio**: Custom square indicator. Radios are square boxes containing an inner solid square indicator on check.
- **Switch**: Rectangle outer container (`40px` x `20px`) with a sliding square toggle block.
- **Textarea**: Auto-expanding input block with line count indicators.

---

## 9. Cards

Cards serve as the core modular panels in Offerly.

- **Dashboard Cards**: Display overview analytics. Include a header, absolute number metric in JetBrains Mono, and a sparkline or change indicator.
- **Company Cards**: Standard details panel showing the company logo, name, location, and matching roles indicator.
- **Job Cards**: Details panel showing job title, company name, match percentage badge (Nothing Red), tags list, and date published.
- **Resume Cards**: Represents a resume version, displaying version code (e.g., `V1.2_SENIOR_ARCHITECT`), ATS match score, and action buttons to customize or export.
- **Analytics Cards**: High-contrast chart container displaying application statistics, application counts, and interviews scheduled.

---

## 10. Icons

We standardize on the **Lucide React** icon family.

### Usage Rules
1. **Stroke Width**: Standardized at `1.5px` (never use thick `2px` or thin `1px` strokes).
2. **Coloring**: Icons must inherit the text color (`currentColor`) to ensure compatibility with dark/light mode automatically.
3. **Sizing**:
   - Small (inline with text): `14px` x `14px` (`h-3.5 w-3.5`).
   - Medium (default navigation/button): `18px` x `18px` (`h-4.5 w-4.5`).
   - Large (card header/profile highlights): `24px` x `24px` (`h-6 w-6`).
4. **No colored fills**: Icons must remain outlines (no solid shapes) to align with our minimal design system.

---

## 11. Animations & Transitions

Animations are used sparingly to focus attention, not for decoration.

- **Easing Curves**:
  - Main transition: `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-fast, responsive custom ease).
- **Durations**:
  - Micro-interactions (hover, click): `150ms`.
  - Page transitions: `250ms`.
  - Drawer slide-ins: `300ms`.
- **Page Transitions**: Simple fade-in and slide-up:
  - `initial: { opacity: 0, y: 10 }`, `animate: { opacity: 1, y: 0 }`.
- **Button Press**: scale compression: `whileTap: { scale: 0.98 }`.
- **Loading Skeleton**: High-frequency pulsing: `animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`.
- **Sidebar slide**: Horizontal offset slide transition with opacity overlay.

---

## 12. Grid & Layout System

Offerly layout uses a 12-column layout grid on desktop interfaces.

- **Desktop (1024px and up)**: 12 columns, gutter `24px`, margin `24px`.
- **Tablet (768px - 1023px)**: 8 columns, gutter `16px`, margin `16px`.
- **Mobile (under 768px)**: 4 columns, gutter `12px`, margin `12px`.
- **Container widths**:
  - Small: `768px`.
  - Medium: `1024px`.
  - Large: `1280px`.
  - Max: `1536px`.

---

## 13. Responsive Rules

Design layouts adapt fluidly across devices:

- **Desktop ($\ge 1280$px)**: Full layout including the fixed sidebar dashboard.
- **Laptop ($1024$px - $1279$px)**: Collapsed icon-only sidebar navigation.
- **Tablet ($768$px - $1023$px)**: Top navigation header with a menu drawer, layout grids transition to 2 columns.
- **Phone ($480$px - $767$px)**: Single column layouts, actions transition to full-width block buttons.
- **Small Phone ($< 480$px)**: Typography scales down by `2px`, metadata wraps onto multiple lines.

---

## 14. Accessibility (a11y)

- **Contrast**: Text must satisfy WCAG 2.1 Level AA ratios ($\ge 4.5:1$ for body, $\ge 3:1$ for headers).
- **Keyboard navigation**: Every interactive item must be focusable using `Tab` key routing. Focus states must display a solid focus ring: `outline: 2px solid var(--accent)`.
- **ARIA Attributes**: Screen readers must receive explicit updates (e.g., `aria-expanded`, `aria-hidden`, and `aria-live` blocks on status loaders).
- **Reduced Motion**: Respect system preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 15. Dashboard Style Guide

- **Sidebar**: Fixed width `240px`. Dark background (even in light mode) for strong structural separation. Display logo at top, followed by navigation links (Icon + Monospace labels), and user profile badge at the bottom.
- **Top Navigation**: Height `64px`. Displays current folder/location name, search trigger, and notifications icon.
- **Statistics Cards**: Features a minimalist, border-only design with a large metric in JetBrains Mono and a secondary change percentage (e.g., `+12% vs last month`).
- **Tables**: Horizontal grid lines only (no vertical borders). Text left-aligned, numbers right-aligned. Header row must be capitalized monospace.
- **Charts**: Custom monochrome vector line graphs with a single red accent line. No filled color areas under lines.
- **Profile Section**: Double-column dashboard showing settings on the left and resume portfolios on the right.

---

## 16. Landing Page Style Guide

- **Hero**: Clean layouts. Large display typography, tagline, and two key buttons. Include a dot-matrix background pattern behind the text.
- **Features Grid**: Three cards showing core features (Resume Parser, Matcher, Kanban).
- **Timeline**: Vertical border line tracking iterations (Sprint 0 to 7) using clean bullet points.
- **Company Logos**: Neutral gray logos with no colors, styled with an opacity filter that transitions to normal on hover.
- **Testimonials**: Text quotes presented inside simple, border-only grid cards with the candidate's profile role at the bottom.
- **FAQ**: Clean accordion sections containing line-divided toggle panels.
- **Footer**: 4-column link directory referencing resources, documentation files, and technical schemas.

---

## 17. Authentication Style Guide

- **Register/Login Panel**: Centered box container, bordered, with inputs, a validation message field, and a primary submit button.
- **OTP Screen**: Clean modal showing the six inputs, a resend timer count, and an exit button.
- **Forgot Password**: Form field to submit emails, displaying a clean check box on success.
- **Onboarding Workflow**: 3-step setup wizard tracking user preferences:
  1. Target role names and experience levels.
  2. Target salary constraints.
  3. Ingestion of the user's initial resume.

---

## 18. Job Search Style Guide

- **Filters**: Left panel displaying accordions for location (Remote, Hybrid, On-site), salary ranges, and required skills.
- **Search Bar**: Centered header search input with autofocus features.
- **Job Cards**: Minimalist lists with a large title, company name, location tags, and a bold match percentage badge.
- **Match Score Panel**: Drawer that slides in from the right to display a comparison matrix of critical tools, missing skills, and structural gap metrics.

---

## 19. Resume Studio Style Guide

- **Resume Preview**: Split-pane layout. Left pane shows editable JSON sections; right pane displays a live, rendered PDF preview.
- **ATS Report**: Side panel displaying warnings, formatting corrections, and keyword density stats.
- **Skill Gap Analysis**: List comparing target job requirements against resume items, highlighting missing keywords in red.
- **Download Panel**: Dropdown offering formats (PDF, Markdown, JSON) and naming templates.

---

## 20. Application Tracker Style Guide

- **Kanban Board**: Drag-and-drop columns (`Bookmarked`, `Applied`, `Interviewing`, `Offer Received`, `Rejected`). Cards show company names, roles, interview dates, and match ratings.
- **Timeline View**: Vertical chronological tracker listing notes, phone calls, interviews, and status updates.
- **Status Change Modal**: Form allowing users to move application stages, update salaries, and log notes.

---

## 21. Offerly Design Principles

Every future page, view, or modal built in the Offerly workspace must satisfy these 20 design principles:

1. **Content First**: Prioritize candidate data, job descriptions, and matches over decorative elements.
2. **Monochrome Dominance**: Keep layouts grayscale; use color only for functional callouts.
3. **Monospace for Data**: Display status tags, ratings, and metrics in uppercase monospace fonts.
4. **Sharp Corners Only**: Enforce a strict `0px` radius on all primary buttons, inputs, and cards.
5. **Double-Border Elevation**: Show depth using solid borders instead of soft drop-shadows.
6. **Lucide Icon Consistency**: Standardize all icon strokes at `1.5px` and scale parameters to `18px` by default.
7. **Fast Easing Curves**: Ensure all UI transitions feel snappy, keeping durations under `200ms`.
8. **Responsive Fluidity**: Adapt layouts seamlessly from mobile to desktop sizes.
9. **Contrast Compliance**: Guarantee high contrast ratios for body copy and headers.
10. **Tab Key Routing**: Allow full keyboard navigation for all interactive components.
11. **Whitespace as a Separator**: Use spacing rather than thick border lines to separate layouts.
12. **Minimalist Forms**: Avoid labels inside fields; keep form interfaces clean.
13. **Dot Matrix Grids**: Accent page backgrounds with subtle dot matrices to establish brand style.
14. **Accent Red Sparingly**: Limit the accent red to focus indicators, logo elements, and critical matches.
15. **No Colored Fills for Icons**: Render all icons as outlines; do not use filled shapes.
16. **Explicit Loading States**: Provide skeleton loaders or spinners for all asynchronous actions.
17. **Clear Error Boundaries**: Use warning cards with retry triggers to handle application failures.
18. **Consistent Gutters**: Align all elements with the 4px baseline grid.
19. **Objective Microcopy**: Keep labels and notifications direct, clear, and professional.
20. **Zero Placeholders**: Ensure every element has a defined purpose; do not use empty boxes or filler text.

---

## 22. Things NEVER Allowed

The following UI patterns are strictly prohibited in the Offerly project:

- **Rounded Blobs**: No buttons or cards with high border-radius values (e.g. `rounded-full`, `rounded-xl`).
- **Heavy Gradients**: No radial or multi-color background sweeps. Backgrounds must remain flat.
- **Glass Everywhere**: Avoid overusing transparent panels. Use glassmorphism only for fixed overlays like navigation headers.
- **Decorative Graphics**: Do not add icons or illustrations that lack functional purpose.
- **Multiple Accent Colors**: Do not use blue, purple, and green highlights on the same screen. The accent is Nothing Red.
- **Low Contrast Labels**: Do not display small gray text on dark gray backgrounds. Keep text highly readable.
- **Unstructured Spacing**: Do not mix spacing increments (e.g., using `13px` or `27px`). Stick strictly to the 4px baseline grid.
