/**
 * NextAuth Route Handler
 * 
 * Handles Discord OAuth2 authentication for the dashboard.
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
