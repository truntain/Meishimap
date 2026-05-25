import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  const userCookie = cookieStore.get('user');

  if (!token || !userCookie) {
    redirect('/login');
  }

  try {
    const rawValue = decodeURIComponent(userCookie.value);
    const user = JSON.parse(rawValue);
    if (user.role !== 'customer') {
      redirect('/403');
    }
  } catch (e) {
    redirect('/login');
  }

  return <>{children}</>;
}
