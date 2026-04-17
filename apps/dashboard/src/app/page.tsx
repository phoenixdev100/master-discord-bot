/**
 * Home Page
 * 
 * Landing page that redirects to dashboard or login.
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
    redirect('/dashboard');
}
