import { cookies } from 'next/headers';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  let user = null;

  if (userCookie) {
    try {
      const rawValue = decodeURIComponent(userCookie.value);
      user = JSON.parse(rawValue);
    } catch (e) {
      console.error('Failed to parse user cookie on server:', e);
    }
  }

  return <ProfileClient initialUser={user} />;
}
