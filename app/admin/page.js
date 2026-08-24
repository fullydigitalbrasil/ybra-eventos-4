import { isAuthenticated } from '../../lib/auth';
import { getMedia, getLeads } from '../../lib/data';
import LoginForm from './LoginForm';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const ok = await isAuthenticated();

  if (!ok) {
    return <LoginForm noPasswordConfigured={!process.env.ADMIN_PASSWORD} />;
  }

  const [media, leads] = await Promise.all([getMedia(), getLeads()]);

  return <AdminDashboard initialMedia={media.items || []} initialLeads={leads.items || []} />;
}
