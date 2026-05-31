import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');

  // If no user cookie at all, redirect to login
  if (!userCookie) {
    redirect('/login');
  }

  try {
    const rawValue = decodeURIComponent(userCookie.value);
    const user = JSON.parse(rawValue);

    // Allow customer, restaurant_owner, and admin roles
    const allowedRoles = ['customer', 'restaurant_owner', 'admin'];
    if (!allowedRoles.includes(user.role)) {
      redirect('/403');
    }
  } catch (e) {
    // Invalid/corrupt cookie -> redirect to login
    redirect('/login');
  }

  return <>{children}</>;
}
