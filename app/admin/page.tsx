import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { listSubmissions } from "@/lib/repository";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="container admin-shell">
        <AdminLogin />
      </div>
    );
  }

  const submissions = await listSubmissions();
  return <AdminDashboard submissions={submissions} />;
}
