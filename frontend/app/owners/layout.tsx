import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import '../dashboard.css'; // Import global dashboard styles
import OwnerSidebar from './components/OwnerSidebar';

export const metadata = {
  title: 'Dashboard Chủ nhà hàng — MESHIMAP',
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check role from cookie
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');

  if (!userCookie) {
    // Not logged in -> redirect to home/login
    redirect('/');
  }

  try {
    const rawValue = decodeURIComponent(userCookie.value);
    const user = JSON.parse(rawValue);
    if (user.role !== 'restaurant_owner') {
      // Not an owner -> redirect to home
      redirect('/');
    }
  } catch (e) {
    // Invalid cookie -> redirect to home
    redirect('/');
  }

  return (
    <div className="dashboard-body">
      <div className="db-container">
        <OwnerSidebar />
        <main className="db-main">
          {children}
        </main>
      </div>
    </div>
  );
}
