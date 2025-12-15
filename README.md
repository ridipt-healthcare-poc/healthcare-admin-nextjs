# Healthcare Facility Portal

A Next.js application for healthcare facility administrators to manage their facilities.

## Features

- 🔐 **Secure Authentication**: Login using super admin or regular admin credentials
- 🏥 **Facility Management**: View and manage hospital/clinic information
- 📊 **Dashboard**: Overview of facility status, verification, and details
- 🎨 **Modern UI**: Built with Tailwind CSS and Lucide icons
- 🔔 **Notifications**: Toast notifications for user feedback

## Tech Stack

- **Framework**: Next.js 15.5.6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.17
- **HTTP Client**: Axios 1.13.2
- **Notifications**: Sonner 1.7.4
- **Icons**: Lucide React 0.468.0

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Healthcare Backend v2 running on port 5000

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The application will run on **http://localhost:3005**

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage

### Login

1. Navigate to http://localhost:3005
2. Select your facility type (Hospital or Clinic)
3. Enter your email (super admin or regular email)
4. Enter your password
5. Click "Sign In"

### Credentials

Use the credentials generated when creating a facility in the Platform Admin Portal:
- **Super Admin Email**: The superAdminEmail set during facility creation
- **Super Admin Password**: The superAdminPassword set during facility creation

## API Integration

The portal connects to the Healthcare Backend v2 API:
- **Base URL**: http://localhost:5000
- **Auth Endpoint**: POST /api/facility-auth/login
- **Token Storage**: localStorage (key: "facility_token")

### Authentication Flow

1. User submits email and password
2. Frontend sends POST request to /api/facility-auth/login
3. Backend validates credentials (supports both superAdminEmail and regular email)
4. Backend returns JWT token and facility data
5. Frontend stores token and redirects to dashboard
6. Token is automatically included in all subsequent API requests

## Project Structure

```
facility-portal-nextjs/
├── app/
│   ├── dashboard/          # Dashboard page (protected)
│   │   └── page.tsx
│   ├── login/              # Login page (public)
│   │   └── page.tsx
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirects)
├── lib/
│   └── api.ts              # Axios client with interceptors
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Features Roadmap

- ✅ Authentication system
- ✅ Basic dashboard with facility info
- ⏳ Profile editing
- ⏳ Doctor management (integration with appointment-backend)
- ⏳ Patient records viewing
- ⏳ Appointment management
- ⏳ Analytics and reports
- ⏳ Staff management
- ⏳ Settings and preferences

## Environment Variables

Currently using hardcoded values. For production, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Update `lib/api.ts` to use:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
```

## Development Notes

- Port 3005 is configured to avoid conflicts with other apps
- Platform Admin Portal runs on port 3000
- Healthcare Backend v2 runs on port 5000
- Appointment Backend runs on port 8080

## Troubleshooting

### "Cannot find module" errors
Run `pnpm install` to ensure all dependencies are installed.

### Login fails with 401
Verify that:
1. Healthcare Backend v2 is running on port 5000
2. The email and password are correct
3. The facility exists in the database
4. The facility is active (isActive: true)

### Token issues
Clear localStorage and try logging in again:
```javascript
localStorage.clear()
```

## Contributing

This is part of the Healthcare Management System project. For issues or feature requests, contact the development team.

## License

Private - Healthcare Management System © 2025
