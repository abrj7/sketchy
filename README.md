# Sketchy

Sketchy is a web application that converts hand-drawn wireframes into functional websites using AI. Users draw interface mockups on a canvas, and the application generates production-ready HTML, CSS, and JavaScript code.

## Project Links

- [Devpost](https://devpost.com/software/sketchy-8bnkyi)
- [Live Website](https://www.sketchywebsite.tec)

## Core Functionality

### Authentication
- Standard email/password authentication with bcrypt hashing
- GitHub OAuth integration
- Persistent user sessions with MongoDB storage

### Canvas Drawing
- Interactive drawing canvas powered by [tldraw](https://tldraw.dev)
- Freehand wireframe creation with drawing tools
- Real-time canvas state persistence
- Auto-save functionality to prevent data loss

### AI Website Generation
- Converts canvas drawings to website code using Google Gemini API
- Supports multiple design styles: minimal, modern, playful, professional, glassmorphism, brutalist
- Generates complete HTML, CSS, and JavaScript files
- Live preview of generated websites in split-pane view
- Regeneration capability with style customization

### Project Management
- Create and manage multiple projects per user
- Project dashboard with recent work view
- Project search and filtering
- Automatic project naming and renaming
- Project metadata tracking (creation date, last modified)

### Version Control
- Automatic version snapshots on each generation
- Version history browser with timestamps
- Preview previous versions before restoring
- Restore functionality to revert to earlier states

### Export and Deployment
- Download generated websites as ZIP archives
- One-click deployment to GitHub repository and Vercel
- Automatic repository creation and configuration
- Public URL generation for deployed sites

### User Interface
- Responsive dashboard with project gallery
- Collapsible sidebar navigation
- Dark mode support
- Real-time loading states and progress indicators
- Split-pane layout for canvas and preview

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Canvas**: [tldraw](https://tldraw.dev)
- **AI**: Google Gemini API
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose
- **Authentication**: bcryptjs, [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- **Styling**: CSS Modules
- **Icons**: Lucide React

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```


