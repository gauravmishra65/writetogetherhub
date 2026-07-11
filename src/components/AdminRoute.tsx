import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RefreshCw } from 'lucide-react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin(userId: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return false;
      return data !== null;
    }

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) { setIsAdmin(false); setChecking(false); }
          return;
        }
        const admin = await verifyAdmin(session.user.id);
        if (!cancelled) { setIsAdmin(admin); setChecking(false); }
      } catch {
        if (!cancelled) { setIsAdmin(false); setChecking(false); }
      }
    }

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (!cancelled) { setIsAdmin(false); setChecking(false); }
        return;
      }
      verifyAdmin(session.user.id).then((admin) => {
        if (!cancelled) { setIsAdmin(admin); setChecking(false); }
      }).catch(() => {
        if (!cancelled) { setIsAdmin(false); setChecking(false); }
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-ink-400 animate-spin" />
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
