import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case UserRole.CREATOR:
      redirect('/dashboard/creator');
    case UserRole.CUSTOMER:
      redirect('/dashboard/customer');
    case UserRole.ADMIN:
      redirect('/dashboard/admin');
    default:
      redirect('/');
  }
}