# Webinar Creator Admin Page - Development Prompt

## Overview

Create a **Webinar Creator** admin page at `/portal/admin/webinar-creator` that provides a wizard-driven interface for creating webinar landing pages and confirmation pages. The wizard should be modeled after the existing `/cmmc-training` and `/cmmc-training-confirmation` pages, allowing admins to create similar marketing pages for any webinar or training event.

---

## Reference Pages

### Landing Page Template (`/cmmc-training`)
**File:** `app/(marketing)/cmmc-training/page.tsx`

Key sections to replicate:
- **Hero Section** - Full-screen with background image, logos, badges, headline, risk highlights, CTAs
- **Urgency Banner** - Gradient banner with alert messaging
- **Program Overview** - Cards highlighting key benefits (Fast Track, Team-Based, Built for SMBs)
- **Timeline Section** - Phased rollout with status badges (ACTIVE, UPCOMING, PLANNED)
- **Process Steps** - 6-step process cards with icons
- **CTA Section** - Dark background with shield icon and registration button
- **FAQ Section** - Accordion-style frequently asked questions
- **Testimonials Section** - 4-column grid of testimonial cards with star ratings
- **Final CTA** - Dark section with logo and contact information

### Confirmation Page Template (`/cmmc-training-confirmation`)
**File:** `app/(marketing)/cmmc-training-confirmation/page.tsx`

Key sections to replicate:
- **Hero Section** - Congratulations message with badge showing limited seats
- **Program Details** - Core deliverables list with icons
- **Key Benefits** - Checklist of benefits with checkmark icons
- **Investment Card** - Pricing card with urgency messaging and payment button
- **CTA Section** - Final call-to-action with secure payment button
- **Footer Note** - Copyright and terms link

---

## Wizard Steps

### Step 1: Basic Information
**Fields:**
- Webinar/Event Title (required)
- Webinar Slug/URL Path (auto-generated from title, editable)
- Short Description (for meta description)
- Event Date/Time (optional - for display)
- Event Duration (e.g., "12-Week Program", "2-Hour Webinar")
- Participant Limit (e.g., "15 seats")
- Price (e.g., "$7,500")
- Payment Link URL (PayPal, Stripe, or internal)

### Step 2: Landing Page Content

#### Hero Section
- Primary Logo Upload (optional)
- Secondary Logo Upload (optional - for collaborations)
- Collaboration Text (e.g., "Collaboration", "Powered By")
- Urgency Badge Text (e.g., "⚠️ PHASE 1 ENFORCEMENT NOW ACTIVE")
- Main Headline
- Sub-headline
- Risk Highlights (dynamic list - add/remove items)
  - Each item: Icon selection, Title, Description
- Primary CTA Button Text
- Secondary CTA Button Text (optional)
- Hero Background Image Upload

#### Urgency Banner
- Enable/Disable toggle
- Banner Headline
- Banner Description
- CTA Button Text

#### Benefits Section (Multiple Benefits)
- Section Title
- Section Description
- Benefits List (dynamic - add/remove/reorder)
  - Each benefit:
    - Icon (select from Lucide icons)
    - Title
    - Description

#### Timeline/Phases Section (Optional)
- Enable/Disable toggle
- Section Title
- Section Description
- Phases List (dynamic - add/remove/reorder)
  - Each phase:
    - Phase Label (e.g., "Phase 1")
    - Period (e.g., "November 2025 - November 2026")
    - Status Badge (ACTIVE NOW, UPCOMING, PLANNED, FULL ENFORCEMENT)
    - Title
    - Description
    - Is Urgent (boolean - highlights the phase)

#### Process Steps Section (Optional)
- Enable/Disable toggle
- Section Title
- Section Description
- Steps List (dynamic - add/remove/reorder)
  - Each step:
    - Step Number
    - Icon (select from Lucide icons)
    - Title
    - Description

#### FAQ Section
- Enable/Disable toggle
- FAQs List (dynamic - add/remove/reorder)
  - Each FAQ:
    - Question
    - Answer (rich text)

#### Testimonials Section
- Enable/Disable toggle
- Testimonials List (dynamic - add/remove/reorder)
  - Each testimonial:
    - Title/Source
    - Quote
    - Star Rating (1-5)

### Step 3: Confirmation Page Content

#### Hero Section
- Badge Text (e.g., "EACH COHORT IS LIMITED TO 15 PARTICIPANTS")
- Logo (uses same as landing page or override)
- Congratulations Headline
- Program Title (e.g., "12-Week CMMC Readiness Program")
- Program Tagline

#### Core Deliverables
- Section Title
- Deliverables List (dynamic - add/remove/reorder)
  - Each deliverable:
    - Icon (select from Lucide icons)
    - Title
    - Description

#### Key Benefits (Multiple Benefits)
- Benefits List (dynamic - add/remove/reorder)
  - Each benefit: Text string with checkmark

#### Investment Card
- Urgency Text (e.g., "ONLY 15 SEATS PER COHORT — ACT NOW")
- Investment Label (e.g., "Your CMMC Accelerator Investment")
- Price Display
- Savings Text (e.g., "Save thousands vs. individual consulting")
- Payment Details Text
- CTA Button Text
- CTA Button Link

#### Final CTA Section
- Headline
- Subheadline
- Description
- CTA Button Text
- Trust Indicators (dynamic list)
  - Each indicator: Icon + Text

### Step 4: GoHighLevel Integration

#### Registration Form Configuration
- Enable/Disable Registration Form
- Form Title
- Form Description
- Form Fields (dynamic - add/remove/reorder)
  - Each field:
    - Field Label
    - Field Type (text, email, phone, select, textarea, checkbox)
    - Placeholder Text
    - Required (boolean)
    - Options (for select type - comma-separated)
    - GoHighLevel Field Mapping (dropdown of GHL contact fields)
      - First Name
      - Last Name
      - Email
      - Phone
      - Company
      - Address
      - City
      - State
      - Zip
      - Country
      - Custom Field (specify field ID)

#### GoHighLevel Tag Configuration
- Primary Tag (required) - Tag to apply when contact is created
- Additional Tags (optional - multi-select/add)
- Tag Description (for admin reference)

#### GoHighLevel API Settings
- API Key (stored securely, masked display)
- Location ID
- Test Connection Button

#### Webhook Configuration (Alternative)
- Enable Webhook Mode (instead of direct API)
- Webhook URL
- Include Fields Selection

### Step 5: Preview & Publish

#### Preview Panel
- Device Toggle (Desktop / Tablet / Mobile)
- Live Preview of Landing Page
- Live Preview of Confirmation Page
- Toggle between pages

#### SEO Settings
- Landing Page Meta Title
- Landing Page Meta Description
- Landing Page Keywords
- Confirmation Page Meta Title
- Confirmation Page Meta Description
- Open Graph Image Upload

#### Publishing Options
- Save as Draft
- Schedule Publish (date/time picker)
- Publish Now
- Generate Shareable Preview Link

#### Post-Publish Actions
- Copy Landing Page URL
- Copy Confirmation Page URL
- Copy Registration Form Embed Code (if applicable)
- View Analytics (placeholder for future)

---

## Technical Requirements

### Data Model (Firestore Collection: `webinars`)

```typescript
interface Webinar {
  id: string;
  slug: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: Timestamp;
  scheduledPublishAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  
  // Basic Info
  title: string;
  shortDescription: string;
  eventDate?: Timestamp;
  duration: string;
  participantLimit?: number;
  price?: string;
  paymentLink?: string;
  
  // Landing Page
  landingPage: {
    hero: {
      primaryLogo?: string;
      secondaryLogo?: string;
      collaborationText?: string;
      urgencyBadge?: string;
      headline: string;
      subheadline?: string;
      riskHighlights: Array<{
        id: string;
        icon: string;
        title: string;
        description: string;
      }>;
      primaryCtaText: string;
      secondaryCtaText?: string;
      backgroundImage?: string;
    };
    urgencyBanner?: {
      enabled: boolean;
      headline: string;
      description: string;
      ctaText: string;
    };
    benefits: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    timeline?: {
      enabled: boolean;
      title: string;
      description: string;
      phases: Array<{
        id: string;
        label: string;
        period: string;
        status: string;
        title: string;
        description: string;
        isUrgent: boolean;
      }>;
    };
    processSteps?: {
      enabled: boolean;
      title: string;
      description: string;
      steps: Array<{
        id: string;
        number: string;
        icon: string;
        title: string;
        description: string;
      }>;
    };
    faqs?: {
      enabled: boolean;
      items: Array<{
        id: string;
        question: string;
        answer: string;
      }>;
    };
    testimonials?: {
      enabled: boolean;
      items: Array<{
        id: string;
        title: string;
        quote: string;
        rating: number;
      }>;
    };
  };
  
  // Confirmation Page
  confirmationPage: {
    hero: {
      badgeText: string;
      logo?: string;
      headline: string;
      programTitle: string;
      tagline?: string;
    };
    deliverables: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    benefits: string[];
    investmentCard: {
      urgencyText: string;
      investmentLabel: string;
      price: string;
      savingsText?: string;
      paymentDetails?: string;
      ctaText: string;
      ctaLink: string;
    };
    finalCta: {
      headline: string;
      subheadline?: string;
      description?: string;
      ctaText: string;
      trustIndicators: Array<{
        id: string;
        icon: string;
        text: string;
      }>;
    };
  };
  
  // GoHighLevel Integration
  ghlIntegration: {
    enabled: boolean;
    registrationForm?: {
      enabled: boolean;
      title: string;
      description?: string;
      fields: Array<{
        id: string;
        label: string;
        type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox';
        placeholder?: string;
        required: boolean;
        options?: string[];
        ghlFieldMapping: string;
      }>;
    };
    tags: {
      primary: string;
      additional: string[];
      description?: string;
    };
    apiKey?: string; // Encrypted
    locationId?: string;
    webhookMode?: boolean;
    webhookUrl?: string;
  };
  
  // SEO
  seo: {
    landingPage: {
      metaTitle: string;
      metaDescription: string;
      keywords?: string;
      ogImage?: string;
    };
    confirmationPage: {
      metaTitle: string;
      metaDescription: string;
    };
  };
}
```

### API Routes

```
POST   /api/admin/webinars              - Create new webinar
GET    /api/admin/webinars              - List all webinars
GET    /api/admin/webinars/[id]         - Get webinar by ID
PUT    /api/admin/webinars/[id]         - Update webinar
DELETE /api/admin/webinars/[id]         - Delete webinar
POST   /api/admin/webinars/[id]/publish - Publish webinar
POST   /api/admin/webinars/[id]/preview - Generate preview link

POST   /api/ghl/contacts                - Create GHL contact
POST   /api/ghl/test-connection         - Test GHL API connection
GET    /api/ghl/tags                    - Get available GHL tags
```

### Dynamic Page Generation

Create dynamic routes for published webinars:
- `app/(marketing)/webinars/[slug]/page.tsx` - Landing page
- `app/(marketing)/webinars/[slug]/confirmation/page.tsx` - Confirmation page

These pages should:
1. Fetch webinar data from Firestore by slug
2. Render the appropriate template with the stored content
3. Handle 404 for unpublished/non-existent webinars
4. Generate proper metadata for SEO

### UI Components

Use existing shadcn/ui components:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`, `Badge`, `Input`, `Label`, `Textarea`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger`
- `Switch` (for toggles)
- `ScrollArea`

### Wizard Navigation

- Step indicator showing current step (1-5)
- Previous/Next buttons
- Save Draft button (available on all steps)
- Step validation before proceeding
- Ability to jump to any completed step

### Icon Selector Component

Create a reusable icon selector component that allows admins to choose from common Lucide icons:
- Shield, CheckCircle, AlertTriangle, Clock, FileCheck, Users, Award
- ArrowRight, Calendar, Target, Zap, Lock, Star, Building2, Briefcase
- Plus, Trash2, Eye, Save, Edit, Settings, etc.

Display icons in a grid with search/filter capability.

---

## GoHighLevel Integration Details

### Contact Creation Flow

1. User fills out registration form on landing page
2. Form submission triggers API call to `/api/ghl/contacts`
3. API creates contact in GoHighLevel with:
   - Mapped form fields
   - Applied tags
   - Source tracking (webinar slug)
4. On success, redirect to confirmation page
5. On failure, show error message and allow retry

### Required GHL API Endpoints

```
POST https://rest.gohighlevel.com/v1/contacts/
Headers:
  Authorization: Bearer {API_KEY}
Body:
  {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "tags": ["tag1", "tag2"],
    "source": "Webinar: {webinar_title}",
    "customField": { ... }
  }
```

### Security Considerations

- Store GHL API keys encrypted in Firestore
- Use server-side API routes for all GHL calls
- Validate form submissions server-side
- Rate limit form submissions
- CSRF protection on forms

---

## File Structure

```
app/
├── (portal)/
│   └── portal/
│       └── admin/
│           └── webinar-creator/
│               ├── page.tsx                    # Main wizard page
│               └── components/
│                   ├── WizardStepper.tsx       # Step indicator
│                   ├── BasicInfoStep.tsx       # Step 1
│                   ├── LandingPageStep.tsx     # Step 2
│                   ├── ConfirmationPageStep.tsx # Step 3
│                   ├── GHLIntegrationStep.tsx  # Step 4
│                   ├── PreviewPublishStep.tsx  # Step 5
│                   ├── IconSelector.tsx        # Reusable icon picker
│                   ├── DynamicListEditor.tsx   # Add/remove/reorder items
│                   └── WebinarPreview.tsx      # Live preview component
├── (marketing)/
│   └── webinars/
│       └── [slug]/
│           ├── page.tsx                        # Dynamic landing page
│           └── confirmation/
│               └── page.tsx                    # Dynamic confirmation page
└── api/
    ├── admin/
    │   └── webinars/
    │       ├── route.ts                        # List/Create
    │       └── [id]/
    │           ├── route.ts                    # Get/Update/Delete
    │           ├── publish/
    │           │   └── route.ts                # Publish
    │           └── preview/
    │               └── route.ts                # Generate preview
    └── ghl/
        ├── contacts/
        │   └── route.ts                        # Create contact
        ├── test-connection/
        │   └── route.ts                        # Test API
        └── tags/
            └── route.ts                        # Get tags

lib/
├── schema.ts                                   # Add COLLECTIONS.WEBINARS
└── ghl.ts                                      # GoHighLevel API utilities

components/
└── webinar/
    ├── WebinarLandingTemplate.tsx              # Reusable landing template
    └── WebinarConfirmationTemplate.tsx         # Reusable confirmation template
```

---

## Implementation Notes

1. **State Management**: Use React `useState` with a single webinar state object, or consider Zustand for complex state
2. **Form Validation**: Use Zod schemas for validation at each step
3. **Image Uploads**: Use existing image upload infrastructure (Firebase Storage)
4. **Auto-save**: Consider auto-saving drafts every 30 seconds
5. **Undo/Redo**: Optional - implement undo/redo for content changes
6. **Templates**: Allow saving webinar configurations as templates for reuse
7. **Duplication**: Allow duplicating existing webinars as starting point

---

## Success Criteria

- [ ] Admin can create a complete webinar landing + confirmation page through the wizard
- [ ] Multiple benefits can be added/removed/reordered on both pages
- [ ] GoHighLevel integration creates contacts with proper field mapping
- [ ] GoHighLevel tags are applied correctly
- [ ] Preview accurately reflects the final published pages
- [ ] Published pages are accessible at `/webinars/[slug]` and `/webinars/[slug]/confirmation`
- [ ] SEO metadata is properly set on published pages
- [ ] Mobile-responsive design on all wizard steps and published pages
- [ ] Draft saving works correctly
- [ ] Scheduled publishing works correctly
