import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RefreshCw } from 'lucide-react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (!cancelled) { setIsAdmin(false); setChecking(false); }
        return;
      }
      const { data: adminRow } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(!!adminRow);
        setChecking(false);
      }
    }

    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAdmin(false);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
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
