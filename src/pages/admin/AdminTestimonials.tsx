import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Quote, Plus, Pencil, Trash2, Eye, EyeOff, Star,
  RefreshCw, Save, X, ArrowUp, ArrowDown, CheckCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminHeader from '../../components/AdminHeader';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_location: string | null;
  quote: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormData = {
  author_name: string;
  author_role: string;
  author_location: string;
  quote: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
};

const EMPTY_FORM: FormData = {
  author_name: '',
  author_role: '',
  author_location: '',
  quote: '',
  rating: 5,
  is_published: true,
  sort_order: 0,
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-5 h-5 ${n <= value ? 'fill-ember-500 text-ember-500' : 'text-parchment-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonials() {
  useDocumentTitle(
    'Testimonials | Write Together Hub Admin',
    'Manage member testimonials displayed on the homepage.',
  );
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [totalPending, setTotalPending] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/admin/login'); return; }
      setAdminEmail(data.user.email ?? '');
    });
  }, [navigate]);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setTestimonials((data as Testimonial[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestimonials();
    supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setTotalPending(count ?? 0));
  }, [fetchTestimonials]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  function openCreate() {
    setForm({ ...EMPTY_FORM, sort_order: testimonials.length });
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      author_name: t.author_name,
      author_role: t.author_role ?? '',
      author_location: t.author_location ?? '',
      quote: t.quote,
      rating: t.rating,
      is_published: t.is_published,
      sort_order: t.sort_order,
    });
    setEditingId(t.id);
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.author_name.trim()) { setError('Author name is required.'); return; }
    if (!form.quote.trim()) { setError('Testimonial quote is required.'); return; }

    setSaving(true);
    const payload = {
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim() || null,
      author_location: form.author_location.trim() || null,
      quote: form.quote.trim(),
      rating: form.rating,
      is_published: form.is_published,
      sort_order: form.sort_order,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('testimonials').update(payload).eq('id', editingId);
    } else {
      await supabase.from('testimonials').insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    closeForm();
    fetchTestimonials();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    fetchTestimonials();
  }

  async function togglePublish(t: Testimonial) {
    await supabase
      .from('testimonials')
      .update({ is_published: !t.is_published, updated_at: new Date().toISOString() })
      .eq('id', t.id);
    fetchTestimonials();
  }

  async function moveSort(t: Testimonial, direction: -1 | 1) {
    const idx = testimonials.findIndex((x) => x.id === t.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= testimonials.length) return;
    const swap = testimonials[swapIdx];

    await Promise.all([
      supabase.from('testimonials').update({ sort_order: swap.sort_order }).eq('id', t.id),
      supabase.from('testimonials').update({ sort_order: t.sort_order }).eq('id', swap.id),
    ]);
    fetchTestimonials();
  }

  const publishedCount = testimonials.filter((t) => t.is_published).length;

  return (
    <div className="min-h-screen bg-parchment-50">
      <AdminHeader adminEmail={adminEmail} totalPending={totalPending} onSignOut={handleSignOut} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Quote className="w-5 h-5 text-ember-500" />
              <h1 className="font-serif font-bold text-ink-900 text-xl">Testimonials</h1>
            </div>
            <p className="text-ink-500 text-sm">
              {publishedCount} published · {testimonials.length - publishedCount} draft · {testimonials.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTestimonials}
              className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-ember-600 hover:bg-ember-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Testimonial
            </button>
          </div>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-100">
                <h2 className="font-serif font-bold text-ink-900 text-lg">
                  {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button onClick={closeForm} className="text-ink-400 hover:text-ink-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div>
                  <label className="form-label">Author Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="e.g. Maria S."
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Role / Title</label>
                    <input
                      type="text"
                      value={form.author_role}
                      onChange={(e) => setForm({ ...form, author_role: e.target.value })}
                      placeholder="e.g. Fiction writer"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={form.author_location}
                      onChange={(e) => setForm({ ...form, author_location: e.target.value })}
                      placeholder="e.g. London, UK"
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Quote <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    placeholder='"I posted my first paragraph and got three kind notes in a day..."'
                    rows={4}
                    className="form-input resize-none"
                  />
                  <p className="text-xs text-ink-400 mt-1">{form.quote.length} characters</p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="form-label">Rating</label>
                    <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                  </div>
                  <div>
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                      className="form-input w-20"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 rounded accent-ember-600"
                    />
                    <span className="text-sm font-medium text-ink-700">Published</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-parchment-100 bg-parchment-50 rounded-b-2xl">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-semibold text-ink-600 hover:text-ink-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-ember-600 hover:bg-ember-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : saved ? 'Saved!' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved toast */}
        {saved && (
          <div className="fixed bottom-6 right-6 bg-sage-600 text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle className="w-4 h-4" />
            Saved successfully
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-ink-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading testimonials…
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-ink-400">
            <Quote className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No testimonials yet</p>
            <p className="text-sm mt-1 mb-4">Add your first member testimonial to show social proof on the homepage.</p>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-ember-600 hover:bg-ember-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Testimonial
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={`rounded-xl border bg-white transition-all duration-200 ${
                  t.is_published ? 'border-parchment-200' : 'border-parchment-200 opacity-60'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-ink-900 text-sm">{t.author_name}</span>
                        {t.author_role && (
                          <span className="text-xs text-ink-500">· {t.author_role}</span>
                        )}
                        {t.author_location && (
                          <span className="text-xs text-ink-400">· {t.author_location}</span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            t.is_published
                              ? 'bg-sage-100 text-sage-700 border-sage-200'
                              : 'bg-parchment-100 text-ink-500 border-parchment-200'
                          }`}
                        >
                          {t.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <StarRating value={t.rating} />
                      <p className="text-sm text-ink-700 leading-relaxed mt-2 italic">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveSort(t, -1)}
                        disabled={i === 0}
                        className="p-1.5 text-ink-400 hover:text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSort(t, 1)}
                        disabled={i === testimonials.length - 1}
                        className="p-1.5 text-ink-400 hover:text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => togglePublish(t)}
                        className="p-1.5 text-ink-400 hover:text-ember-600 transition-colors"
                        title={t.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {t.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-ink-400 hover:text-ember-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-ink-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
