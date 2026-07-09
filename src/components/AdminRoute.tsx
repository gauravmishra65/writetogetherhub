import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RefreshCw } from 'lucide-react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-ink-400 animate-spin" />
      </div>
    );
  }

  return authed ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
