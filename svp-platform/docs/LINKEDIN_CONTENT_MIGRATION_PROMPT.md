# LinkedIn Content Feature Migration Prompt

**Purpose:** This document provides a comprehensive prompt for migrating the LinkedIn Content feature to another website or platform.

**Source Project:** Strategic Value+ Platform (SVP Platform)  
**Feature Location:** `/app/(portal)/portal/linkedin-content/`  
**Created:** February 2, 2026

---

## Overview

The LinkedIn Content feature is an AI-powered article generation and management system designed for creating professional LinkedIn articles. It includes:

- AI article generation with customizable prompts
- Content editing with title, body, hashtags, glossary, and references
- Image upload and management
- Reference link verification
- Draft saving and management
- Article preview with LinkedIn-style formatting
- Word count statistics
- Scheduled and published article tracking

---

## Migration Prompt

Use the following prompt to recreate this feature on another platform:

---

### PROMPT START

```
Create a LinkedIn Content Management feature with the following capabilities:

## 1. CORE FUNCTIONALITY

### 1.1 AI Article Generator
- Text input for article topic/theme
- Customizable generation prompt with [TOPIC] placeholder
- Default prompt template for manufacturing industry content (can be customized)
- Tone selector: Professional, Casual & Friendly, Thought Leader, Storytelling
- Length selector: Short (~300 words), Medium (~600 words), Long (~1000 words), Extended (~1500 words)
- "Generate Article" button that calls an AI API (OpenAI GPT-4 or similar)
- "Regenerate" button to create variations

### 1.2 Content Editor
The editor should have separate editable sections:

**Title Section:**
- Single-line input for article title

**Main Content Section:**
- Large textarea for article body (markdown-supported)
- Support for headings, bold, lists, etc.

**Hashtags Section:**
- Textarea for hashtags (e.g., #USManufacturing #Reshoring)
- Auto-generated from AI but editable

**Glossary Section:**
- Dynamic list of term/definition pairs
- Add/remove glossary items
- Fields: Term (string), Definition (string)

**References Section:**
- Dynamic list of reference links
- Add/remove references
- Fields: Title (string), URL (string)
- External link button to open URLs

### 1.3 Image Management
- Drag-and-drop or click-to-upload interface
- Support for PNG, JPG, GIF up to 10MB
- Multiple image upload
- Image preview grid (3 columns)
- Delete button on hover for each image
- Images stored as base64 or uploaded to cloud storage

### 1.4 Reference Link Verification
- Add reference links by URL
- AI-powered link verification (checks if URL is valid/accessible)
- Status indicators: Pending, Checking, Valid, Invalid
- Auto-extract title from URL when possible
- Bulk "Verify All" button

## 2. ARTICLE MANAGEMENT

### 2.1 Drafts
- Save current article as draft
- List view of all drafts with:
  - Title
  - Content preview (2 lines)
  - Created date
  - Image count
  - Link count
- Edit and Delete buttons for each draft

### 2.2 Scheduled Posts
- Schedule articles for future publication
- Date/time picker for scheduling
- List of scheduled posts

### 2.3 Published Articles
- Track published articles
- Show publication date and engagement metrics (if connected to LinkedIn API)

## 3. PREVIEW & EXPORT

### 3.1 Article Preview
- Modal/dialog showing full article as it will appear
- LinkedIn-style formatting with:
  - Profile avatar and name
  - "Just now" timestamp
  - Featured image (first uploaded image)
  - Title in bold
  - Content with preserved formatting
  - Glossary section with term definitions
  - References section with clickable links
  - Hashtags at the bottom

### 3.2 Copy to Clipboard
- "Copy" button that copies the full formatted article including:
  - Title
  - Content
  - Glossary (formatted as "**Term**: Definition")
  - References (formatted as "• Title: URL")
  - Hashtags

### 3.3 Word Count Statistics
- Modal showing:
  - Word count
  - Characters (no spaces)
  - Characters (with spaces)
  - Paragraphs
  - Lines
  - Sentences

## 4. UI/UX REQUIREMENTS

### 4.1 Layout
- Full-height page (calc(100vh - header height))
- Tab navigation: Create Article, Drafts, Scheduled, Published
- Scrollable content area within each tab
- Maximum content width of ~4xl (896px) centered

### 4.2 Header
- Feature icon (LinkedIn logo with gradient background)
- Title: "LinkedIn Content"
- "AI Powered" badge
- LinkedIn connection status badge
- "Connect LinkedIn" button (for OAuth integration)

### 4.3 Cards
Each section should be in a Card component with:
- CardHeader with title and description
- CardContent with form fields
- Action buttons where appropriate

### 4.4 Styling
- Use a component library (shadcn/ui, Radix, or similar)
- Tailwind CSS for styling
- Blue color theme for LinkedIn-related elements (#0077B5)
- Responsive design

## 5. DATA STRUCTURES

### 5.1 ReferenceLink Interface
```typescript
interface ReferenceLink {
  id: string;
  url: string;
  title: string;
  status: "pending" | "valid" | "invalid" | "checking";
  description?: string;
}
```

### 5.2 ArticleDraft Interface
```typescript
interface ArticleDraft {
  id: string;
  title: string;
  content: string;
  images: string[]; // base64 or URLs
  referenceLinks: ReferenceLink[];
  status: "draft" | "scheduled" | "published";
  createdAt: Date;
  scheduledFor?: Date;
}
```

### 5.3 GlossaryItem Interface
```typescript
interface GlossaryItem {
  term: string;
  definition: string;
}
```

### 5.4 GeneratedContent Interface
```typescript
interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  glossary: GlossaryItem[];
  references: ReferenceLink[];
}
```

## 6. DEFAULT PROMPT TEMPLATE

Use this as the default article generation prompt (customizable by user):

```
Please write a friendly, detailed, comprehensive, thoughtful, balanced, engaging, compelling, fact-checked, conversational, long-form SEO-optimized article for U.S. manufacturing executives about [TOPIC]. 

Do not use favicons or emoticons. Include verifiable examples, data, and statistics. 

At end of the article, cite true references with clean links that support the points made and include only clean links (no tracking). Expand paragraphs.

Appropriately promote [YOUR COMPANY NAME] and its services. The call to action is to [YOUR CTA].

At the end, provide:
1. A glossary of unfamiliar words and acronyms
2. A list of resources with clean links for further research
3. Hash-tagged keywords in a row
```

## 7. AI INTEGRATION

### 7.1 Article Generation
- Call OpenAI API (or similar) with:
  - System prompt containing the article template
  - User message with the topic
  - Temperature: 0.7
  - Max tokens: 4000 (for extended articles)

### 7.2 Link Verification
- Validate URL format using regex
- Optionally make HEAD request to check accessibility
- Extract page title from meta tags if accessible

## 8. PERSISTENCE

### 8.1 Local State (Minimum)
- Use React useState for all form state
- Drafts stored in component state (lost on refresh)

### 8.2 Database Storage (Recommended)
- Store drafts in database (Firebase, PostgreSQL, etc.)
- Collection/table: `linkedinArticles` or `contentDrafts`
- Fields: id, userId, title, content, hashtags, glossary (JSON), references (JSON), images (JSON array), status, createdAt, updatedAt, scheduledFor, publishedAt

## 9. OPTIONAL ENHANCEMENTS

- LinkedIn OAuth integration for direct publishing
- Analytics dashboard for published articles
- A/B testing for different article versions
- Content calendar view
- Team collaboration features
- Template library for different article types
- SEO score analysis
- Readability score (Flesch-Kincaid)
- Plagiarism checking
- Image generation with AI (DALL-E)
```

### PROMPT END

---

## File Structure for Migration

```
/linkedin-content/
├── page.tsx                 # Main page component (1324 lines)
├── components/
│   ├── ArticleGenerator.tsx # AI generation form
│   ├── ContentEditor.tsx    # Title, content, hashtags editors
│   ├── GlossaryEditor.tsx   # Glossary term management
│   ├── ReferencesEditor.tsx # Reference links management
│   ├── ImageUploader.tsx    # Image upload and preview
│   ├── ArticlePreview.tsx   # Preview dialog
│   ├── DraftsList.tsx       # Drafts tab content
│   └── WordCountDialog.tsx  # Statistics dialog
├── hooks/
│   ├── useArticleGeneration.ts
│   ├── useDrafts.ts
│   └── useLinkVerification.ts
├── types/
│   └── index.ts             # TypeScript interfaces
└── utils/
    ├── buildFullArticle.ts  # Combine all sections
    └── wordCount.ts         # Statistics calculation
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-tabs": "^1.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x"
  }
}
```

---

## Icons Used (Lucide React)

- Linkedin, Sparkles, Image, Link2, FileText, Send, Loader2
- Plus, Trash2, CheckCircle, XCircle, AlertCircle, Copy
- Eye, RefreshCw, Upload, ExternalLink, Calendar, Clock
- Save, Wand2, BarChart3

---

## Customization Points

When migrating, customize these elements:

1. **Company Branding**
   - Replace "Strategic Value+" with your company name
   - Update the avatar/logo in preview
   - Change the gradient colors

2. **Default Prompt**
   - Modify the DEFAULT_ARTICLE_PROMPT constant
   - Update industry focus (currently manufacturing)
   - Change CTA and promotional content

3. **Hashtags**
   - Update default hashtag suggestions
   - Add industry-specific tags

4. **Glossary Terms**
   - Pre-populate with industry-relevant terms
   - Customize default definitions

5. **Reference Links**
   - Update default reference sources
   - Add company website links

---

## Database Schema (If Using Firebase)

```typescript
// Collection: linkedinArticles
interface LinkedInArticleDoc {
  id: string;
  userId: string;
  title: string;
  content: string;
  hashtags: string;
  glossary: GlossaryItem[];
  references: ReferenceLink[];
  images: string[]; // URLs or base64
  status: "draft" | "scheduled" | "published";
  tone: string;
  length: string;
  prompt: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scheduledFor?: Timestamp;
  publishedAt?: Timestamp;
  linkedinPostId?: string; // If published via API
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}
```

---

## API Routes (If Needed)

```
POST /api/linkedin/generate     # Generate article with AI
POST /api/linkedin/verify-link  # Verify a single link
POST /api/linkedin/drafts       # Save draft
GET  /api/linkedin/drafts       # List drafts
PUT  /api/linkedin/drafts/:id   # Update draft
DELETE /api/linkedin/drafts/:id # Delete draft
POST /api/linkedin/publish      # Publish to LinkedIn (requires OAuth)
```

---

## Notes for Migration

1. **Current State:** The feature currently uses local React state only - drafts are lost on page refresh. For production, implement database persistence.

2. **AI Integration:** The current implementation simulates AI generation. Replace with actual OpenAI API calls for production.

3. **LinkedIn API:** The "Publish to LinkedIn" button is not connected. Implement LinkedIn OAuth and Share API for direct publishing.

4. **Image Storage:** Images are stored as base64 in state. For production, upload to cloud storage (S3, Firebase Storage, Cloudinary).

5. **Link Verification:** Current implementation only validates URL format. For production, make actual HTTP requests to verify accessibility.

---

*End of Migration Prompt Document*
