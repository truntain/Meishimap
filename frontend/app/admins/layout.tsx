import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import '../dashboard.css'; // Import global dashboard styles
import AdminSidebar from './components/AdminSidebar';

export const metadata = {
  title: 'Dashboard Quản trị viên — MESHIMAP',
};

export default async function AdminLayout({
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
    if (user.role !== 'admin') {
      // Not an admin -> redirect to home
      redirect('/');
    }
  } catch (e) {
    // Invalid cookie -> redirect to home
    redirect('/');
  }

  return (
    <div className="dashboard-body">
      <div className="db-container">
        <AdminSidebar />
        <main className="db-main">
          {children}
        </main>
      </div>
    </div>
  );
}
