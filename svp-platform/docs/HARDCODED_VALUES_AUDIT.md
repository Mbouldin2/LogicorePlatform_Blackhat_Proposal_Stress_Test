# Hardcoded Values Audit Report

**Project:** Strategic Value Plus Platform  
**Audit Date:** February 2, 2026  
**Objective:** Document all hardcoded values that should be dynamically controlled via backend

---

## Executive Summary

This document catalogs all hardcoded values found throughout the SVP Platform codebase that should be extracted into a dynamic CMS/Settings system for backend control. Values are organized by category and location for easy implementation.

---

## 1. COMPANY & BRANDING INFORMATION

### 1.1 Company Identity

| Value Type | Current Hardcoded Value | Location(s) | Priority |
|------------|------------------------|-------------|----------|
| Company Name | "Strategic Value+" | `navbar.tsx:88`, `footer.tsx:51` | HIGH |
| Company Name Full | "Strategic Value+ Solutions" | `footer.tsx:143`, `json-ld.tsx:8,74` | HIGH |
| Alternate Name | "Strategic Value Plus" | `json-ld.tsx:9` | MEDIUM |
| Tagline | "Transforming U.S. Manufacturing" | `navbar.tsx:89`, `footer.tsx:52` | HIGH |
| Brand Description | "Helping small- and mid-sized U.S. manufacturers win OEM contracts through supplier qualification, ISO certification, and operational readiness." | `footer.tsx:55-57`, `json-ld.tsx:12-13` | HIGH |

### 1.2 Logo & Assets

| Value Type | Current Value | Location(s) | Priority |
|------------|---------------|-------------|----------|
| Logo Path | "/VPlus_logo.webp" | `navbar.tsx:80`, `footer.tsx:44` | HIGH |
| Logo Alt Text | "Strategic Value+ Logo" | `navbar.tsx:81`, `footer.tsx:45` | MEDIUM |
| Logo URL (SEO) | "https://strategicvalueplus.com/logo.png" | `json-ld.tsx:11,75,258` | HIGH |

---

## 2. CONTACT INFORMATION

### 2.1 Email Addresses

| Purpose | Hardcoded Email | Location(s) | Priority |
|---------|-----------------|-------------|----------|
| Primary Contact | info@strategicvalueplus.com | `footer.tsx:125`, `contact/page.tsx:291`, `json-ld.tsx:35,78` | CRITICAL |
| Notification From | noreply@strategicvalueplus.com | `api/contact/submit/route.ts:16` | CRITICAL |
| NDA Email | info@strategicvalueplus.com | `api/nda/send/route.ts`, `api/nda/countersign/route.ts` | CRITICAL |
| Password Reset | info@strategicvalueplus.com | `api/admin/send-password-reset/route.ts` | CRITICAL |

### 2.2 Phone Numbers

| Purpose | Hardcoded Number | Location(s) | Priority |
|---------|------------------|-------------|----------|
| Main Phone | (555) 123-4567 | `footer.tsx:131`, `contact/page.tsx:303` | CRITICAL |
| Phone (SEO/Tel) | +1-555-123-4567 | `json-ld.tsx:29,77` | CRITICAL |

### 2.3 Address & Location

| Value Type | Hardcoded Value | Location(s) | Priority |
|------------|-----------------|-------------|----------|
| Country | "United States" | `footer.tsx:120`, `json-ld.tsx:46` | MEDIUM |
| Address Country | "US" | `json-ld.tsx:24,82` | MEDIUM |
| Geo Latitude | 35.7796 | `json-ld.tsx:86` | LOW |
| Geo Longitude | -78.6382 | `json-ld.tsx:87` | LOW |

### 2.4 Business Hours

| Value Type | Hardcoded Value | Location(s) | Priority |
|------------|-----------------|-------------|----------|
| Hours Display | "Mon-Fri: 8am - 6pm EST" | `contact/page.tsx:318` | MEDIUM |
| Opening Hours | "09:00" to "17:00" | `json-ld.tsx:93-94` | MEDIUM |
| Days Open | Monday - Friday | `json-ld.tsx:92` | MEDIUM |

---

## 3. SOCIAL MEDIA LINKS

| Platform | Hardcoded URL | Location(s) | Priority |
|----------|---------------|-------------|----------|
| LinkedIn | https://linkedin.com | `footer.tsx:60` | HIGH |
| LinkedIn (SEO) | https://www.linkedin.com/company/strategicvalueplus | `json-ld.tsx:40` | HIGH |
| Twitter/X | https://twitter.com | `footer.tsx:63` | HIGH |
| Twitter (SEO) | https://twitter.com/strategicvalueplus | `json-ld.tsx:41` | HIGH |
| YouTube | https://youtube.com | `footer.tsx:66` | HIGH |
| YouTube (SEO) | https://www.youtube.com/@strategicvalueplus | `json-ld.tsx:42` | HIGH |

---

## 4. WEBSITE URLs

| Purpose | Hardcoded URL | Location(s) | Priority |
|---------|---------------|-------------|----------|
| Main Domain | https://strategicvalueplus.com | `json-ld.tsx:10,76,283,288` | CRITICAL |
| Search URL | https://strategicvalueplus.com/search?q={search_term_string} | `json-ld.tsx:288` | LOW |

---

## 5. NAVIGATION & MENU STRUCTURE

### 5.1 Navbar (`components/shared/navbar.tsx`)

**Services Menu (lines 31-54):**
- Service 1: "Supplier Readiness" with description "OEM qualification and supplier readiness assessments"
- Service 2: "V+ EDGE™" with description "Modular platform that accelerates readiness execution"
- Sub-items under each service are hardcoded

**Resources Menu (lines 56-61):**
- About, Leadership, AntiFragile, Accessibility

**Company Links (lines 63-69):**
- About Us, Leadership Team, Core Team, OEM Buyers, Affiliates

**CTA Buttons:**
- "Sign In" → /sign-in
- "Sign Up" → /sign-up  
- "Get Assessment" → /contact

### 5.2 Footer Links (`components/shared/footer.tsx` lines 6-33)

```javascript
const footerLinks = {
  services: [
    { title: "V+ EDGE™", href: "/v-edge" },
    { title: "Supplier Readiness", href: "/" },
    { title: "For OEM Buyers", href: "/oem" },
    { title: "Join Affiliate Network", href: "/affiliates" },
    { title: "AntiFragile", href: "/antifragile" },
    { title: "Contact", href: "/contact" },
  ],
  company: [...],
  resources: [...],
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Accessibility", href: "/accessibility" },
  ],
};
```

---

## 6. MARKETING CONTENT

### 6.1 Hero Carousel (`components/marketing/hero-carousel.tsx` lines 30-79)

**4 Default Slides with hardcoded:**
- Badge text (e.g., "Supplier Readiness & OEM Qualification")
- Headlines and highlighted text
- Subheadlines (long marketing descriptions)
- Benefits lists (3 items per slide)
- CTA button text and links

### 6.2 Services Overview (`components/marketing/services-overview.tsx` lines 9-58)

**3 Service Cards with hardcoded:**
- Titles: "Supplier Readiness", "V+ EDGE™", "Affiliate Network"
- Taglines (short descriptions)
- Full descriptions
- Feature lists (4 items each)
- Colors and styling

### 6.3 Section Headers

| Location | Hardcoded Text |
|----------|----------------|
| `services-overview.tsx:67` | "Supplier Readiness for Manufacturers" |
| `services-overview.tsx:70` | "The readiness path to OEM qualification" |
| `services-overview.tsx:72-73` | "Start with a readiness assessment and roadmap..." |
| `services-overview.tsx:114-115` | "Not sure which solution is right for you?" |
| `services-overview.tsx:119` | "Request Supplier Readiness Assessment" |

---

## 7. SEO/JSON-LD SCHEMA DATA

### 7.1 Organization Schema (`components/seo/json-ld.tsx`)

**Hardcoded Values:**
- Founding Date: "2020" (line 14)
- Founder: "Nel Varenas", jobTitle: "CEO" (lines 16-20)
- KnowsAbout: Array of 8 expertise areas (lines 48-57)
- Area Served: "United States"

### 7.2 Local Business Schema

**Hardcoded Values:**
- Price Range: "$$$$" (line 79)
- Aggregate Rating: 4.9 (line 99)
- Review Count: "47" (line 100)

---

## 8. FORM CONTENT

### 8.1 Contact Page (`app/(marketing)/contact/page.tsx`)

**Form Placeholders:**
| Field | Placeholder Text |
|-------|-----------------|
| firstName | "John" |
| lastName | "Smith" |
| email | "john@company.com" |
| phone | "(555) 123-4567" |
| company | "Your Company Inc." |
| title | "VP Operations" |
| industry | "e.g., Automotive, Aerospace" |
| message | "What challenges are you facing? What outcomes are you hoping to achieve?" |

**Form Labels & CTAs:**
- Section title: "Request a Free Assessment"
- Description: "Fill out the form below and one of our experts will contact you within 24 hours."
- Submit button: "Request Free Assessment"
- Success message: "Thank you for your inquiry! We'll get back to you within 24 hours."

**Book a Call Form:**
- Dialog title: "Book a Discovery Call"
- Description: "Fill out the form below and we'll reach out to schedule a 30-minute call."
- Submit button: "Request Call"

### 8.2 Service Options (lines 37-45)

```javascript
const services = [
  "Supplier Readiness & OEM Qualification",
  "ISO/QMS Certification",
  "Lean Manufacturing",
  "Digital Transformation",
  "Reshoring Advisory",
  "Workforce Development",
  "Other",
];
```

### 8.3 Company Size Options (lines 47-53)

```javascript
const companySizes = [
  "1-25 employees",
  "25-100 employees",
  "100-250 employees",
  "250-500 employees",
  "500+ employees",
];
```

---

## 9. API ROUTES & BACKEND

### 9.1 Email Recipients

| API Route | Hardcoded Value |
|-----------|-----------------|
| `api/contact/submit/route.ts` | NOTIFICATION_EMAIL = "info@strategicvalueplus.com" |
| `api/contact/submit/route.ts` | FROM_EMAIL = "noreply@strategicvalueplus.com" |
| `api/nda/send/route.ts` | info@strategicvalueplus.com |
| `api/nda/countersign/route.ts` | info@strategicvalueplus.com |
| `api/admin/send-password-reset/route.ts` | info@strategicvalueplus.com |

### 9.2 Response Time Commitments

| Location | Hardcoded Promise |
|----------|-------------------|
| `contact/page.tsx` | "within 24 hours" (multiple locations) |
| `antifragile/page.tsx` | "24-hour response" |
| `admin/popup/page.tsx` | "24-hour response commitment" |

---
## 10. TERMS, PRIVACY & LEGAL

### 10.1 Terms of Service (`app/terms/page.tsx`)
- Company name references
- Contact email: info@strategicvalueplus.com
- Last updated dates
- Jurisdiction: "United States"

### 10.2 Privacy Policy (`app/privacy/page.tsx`)
- Company name references
- Contact email: info@strategicvalueplus.com
- Data retention periods
- Third-party service references

### 10.3 Accessibility Statement (`app/accessibility/page.tsx`)
- Contact email: info@strategicvalueplus.com
- Conformance target: WCAG 2.1 Level AA

---

## 11. OTHER MARKETING PAGES

### 11.1 CMMC Training Pages
- Course titles and descriptions
- Pricing information
- Duration: "Self-paced (~4 hours)"
- Certificate details

### 11.2 Leadership Pages
- Team member names and titles
- Biography content
- LinkedIn profile links

### 11.3 Affiliate Pages
- Commission percentages
- Program requirements
- Application deadlines

---

## 12. IMPLEMENTATION RECOMMENDATIONS

### 12.1 High Priority (Extract First)

1. **Create PlatformSettings Collection** in Firebase with:
   - company.name, company.fullName, company.tagline
   - contact.email, contact.phone, contact.address
   - social.linkedin, social.twitter, social.youtube
   - branding.logoUrl, branding.faviconUrl

2. **Create NavigationSettings Collection:**
   - navbar.items (array of menu items)
   - footer.links (object with service/company/resource arrays)
   - footer.legalLinks

3. **Create MarketingContent Collection:**
   - hero.slides (array)
   - services.cards (array)
   - homepage.ctaSections

### 12.2 Medium Priority

1. **FormSettings Collection:**
   - Form placeholders
   - Dropdown options (services, company sizes)
   - Success/error messages

2. **SEOSettings Collection:**
   - Schema.org organization data
   - Local business details
   - Default meta tags

### 12.3 Lower Priority

1. **LegalContent Collection:**
   - Terms of Service content blocks
   - Privacy Policy sections
   - Accessibility statement

---

## 13. FILES REQUIRING DYNAMIC INTEGRATION

### Critical Files to Update:

1. `components/shared/navbar.tsx` - Logo, company name, menu structure
2. `components/shared/footer.tsx` - Contact info, social links, menu structure
3. `components/seo/json-ld.tsx` - All schema data
4. `app/(marketing)/contact/page.tsx` - Form placeholders, service options
5. `app/api/contact/submit/route.ts` - Email addresses
6. `components/marketing/hero-carousel.tsx` - Default slides
7. `components/marketing/services-overview.tsx` - Service cards

### API Routes to Update:

1. `app/api/contact/submit/route.ts` - Notification email
2. `app/api/nda/send/route.ts` - Sender email
3. `app/api/nda/countersign/route.ts` - Sender email
4. `app/api/admin/send-password-reset/route.ts` - Sender email

---

## 14. ESTIMATED IMPLEMENTATION EFFORT

| Task | Estimated Hours |
|------|-----------------|
| Create PlatformSettings schema & types | 2 |
| Create Admin UI for settings management | 8 |
| Update Navbar component | 2 |
| Update Footer component | 2 |
| Update SEO/JSON-LD components | 3 |
| Update Contact page | 3 |
| Update Marketing components (Hero, Services) | 4 |
| Update API routes | 2 |
| Testing & validation | 4 |
| **Total** | **~30 hours** |

---

## APPENDIX A: COMPLETE LIST OF HARDCODED EMAILS

```
info@strategicvalueplus.com
noreply@strategicvalueplus.com
```

## APPENDIX B: COMPLETE LIST OF HARDCODED PHONE NUMBERS

```
(555) 123-4567
+1-555-123-4567
```

## APPENDIX C: COMPLETE LIST OF HARDCODED URLs

```
https://strategicvalueplus.com
https://linkedin.com
https://twitter.com  
https://youtube.com
https://www.linkedin.com/company/strategicvalueplus
https://twitter.com/strategicvalueplus
https://www.youtube.com/@strategicvalueplus
```

---

*End of Report*
