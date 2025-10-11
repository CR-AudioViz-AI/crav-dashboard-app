import { redirect } from 'next/navigation';

export default async function HomePage() {
  // For now, always redirect to auth
  // TODO: Check session when auth is configured
  redirect('/auth/signin');
}
