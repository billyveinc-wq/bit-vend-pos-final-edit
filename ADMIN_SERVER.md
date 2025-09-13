# Admin Server Setup

The admin server (`server/admin.js`) provides secure endpoints for administrative operations like account deletion and cleanup.

## Environment Variables Required

For the **admin server** (`server/admin.js`):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_admin_api_key
PORT=8787  # Optional, defaults to 8787
```

For the **frontend app** (Vite environment):
```bash
VITE_ADMIN_SERVER_URL=http://localhost:8787
VITE_ADMIN_API_KEY=your_secure_admin_api_key  # Same as above
```

## Starting the Admin Server

1. Set the required environment variables
2. Install dependencies: `npm install`
3. Start the server: `node server/admin.js`

The server will run on port 8787 (or the PORT environment variable).

## Security Notes

- The admin server should only be run in secure environments
- The `ADMIN_API_KEY` should be a strong, randomly generated key
- In production, restrict access by IP, VPN, or other security measures
- The `SUPABASE_SERVICE_ROLE` key has full database access

## Features

The admin server provides endpoints for:
- Account soft deletion (30-day retention)
- Account restoration (within 30 days)
- Automatic cleanup of expired deletions
- User management and synchronization

## Development Mode

If the admin server is not running, the account cleanup functionality will be automatically disabled with appropriate warnings in the console.
