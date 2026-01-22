# Environment Setup Instructions

## Required: Create `.env.local` file

Create a file named `.env.local` in the project root directory (same folder as `package.json`) with the following content:

## Important Steps:

1. **Create the file**: Create `.env.local` in the project root
2. **Restart the server**: After creating the file, you MUST restart the Next.js dev server:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again
3. **Verify**: The email functionality will work after the server restart

## Note:
- The `.env.local` file is gitignored and won't be committed to version control
- Never commit sensitive credentials to git
- The server must be restarted after creating/modifying `.env.local` for changes to take effect
