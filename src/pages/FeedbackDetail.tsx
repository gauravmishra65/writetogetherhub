import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MessageCircle, ThumbsUp, HelpCircle, Lightbulb,
  Heart, AlertCircle, Loader2, CheckCircle, BookOpen, Calendar, Clock, Lock,
} from 'lucide-react';
import { supabase, type FeedbackSubmission, type FeedbackReply, type Registration } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const replyInitial = { liked: '', confused: '', suggestion: '', encouragement: '' };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SECTIONS = [
  { key: 'liked' as const,       label: 'What I Liked',        icon: ThumbsUp,    color: 'border-sage-400 bg-sage-50',         textColor: 'text-sage-800',       labelColor: 'text-sage-700' },
  { key: 'confused' as const,    label: 'What Confused Me',    icon: HelpCircle,  color: 'border-sky-400 bg-sky-50',           textColor: 'text-sky-800',        labelColor: 'text-sky-700' },
  { key: 'suggestion' as const,  label: 'One Suggestion',      icon: Lightbulb,   color: 'border-parchment-400 bg-parchment-50', textColor: 'text-parchment-800', labelColor: 'text-parchment-700' },
  { key: 'encouragement' as const, label: 'One Encouragement', icon: Heart,       color: 'border-ember-400 bg-ember-50',       textColor: 'text-ember-800',      labelColor: 'text-ember-700' },
];

import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function FeedbackDetail() {
  useDocumentTitle('Feedback Detail | Write Together Hub', 'Read an excerpt and share your kind, structured feedback using the four-step method.');
  const { id } = useParams<{ id: string }>();

  const [submission, setSubmission] = useState<FeedbackSubmission | null>(null);
  const [replies, setReplies] = useState<FeedbackReply[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(replyInitial);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Registration | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: reg } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (!cancelled) setProfile(reg as Registration ?? null);
      }
      setAuthLoading(false);
    }
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setProfile(null); setAuthLoading(false); }
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!id) return;
    if (authLoading) return;
    if (!user) { setLoadingPage(false); return; }
    (async () => {
      const [{ data: sub, error: subErr }, { data: reps }] = await Promise.all([
        supabase.from('feedback_submissions').select('*').eq('id', id).maybeSingle(),
        supabase.from('feedback_replies').select('*').eq('submission_id', id).neq('status', 'rejected').order('created_at', { ascending: true }),
      ]);
      setLoadingPage(false);
      if (subErr || !sub) { setNotFound(true); return; }
      setSubmission(sub as FeedbackSubmission);
      setReplies((reps as FeedbackReply[]) ?? []);
    })();
  }, [id, user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !user) { setSubmitError('You must be signed in to give feedback.'); return; }
    setSubmitting(true);
    setSubmitError('');
    const authorName = profile?.name || user.email!.split('@')[0];
    const { error } = await supabase.from('feedback_replies').insert({
      submission_id: id,
      author_name: authorName,
      user_id: user.id,
      liked: form.liked,
      confused: form.confused,
      suggestion: form.suggestion,
      encouragement: form.encouragement,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) { setSubmitError(error.message || 'Something went wrong. Please try again.'); return; }
    setSubmitSuccess(true);
    setForm(replyInitial);
    setShowForm(false);
    // Refresh replies
    const { data: reps } = await supabase.from('feedback_replies').select('*').eq('submission_id', id).neq('status', 'rejected').order('created_at', { ascending: true });
    setReplies((reps as FeedbackReply[]) ?? []);
  }

  if (authLoading || loadingPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
      </div>
    );
  }

  // Auth gate: non-members see join prompt, no content
  if (!user || !profile) {
    return (
      <div className="bg-parchment-50 min-h-screen">
        <div className="bg-white border-b border-parchment-100">
          <div className="section-container py-4">
            <Link to="/feedback-corner" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ember-600 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Feedback Corner
            </Link>
          </div>
        </div>
        <div className="section-container py-16">
          <div className="max-w-lg mx-auto text-center card p-10">
            <div className="w-14 h-14 bg-ember-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-ember-600" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-ink-900 mb-3">Members Only</h2>
            <p className="text-ink-500 leading-relaxed mb-6">
              Feedback excerpts and community replies are visible only to signed-in members. Sign in or join the community to view and share feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="btn-primary">Sign In</Link>
              <Link to="/join" className="btn-secondary">Join to View and Share</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !submission) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-ink-500">
        <BookOpen className="w-12 h-12 opacity-30" />
        <p className="text-lg font-medium">Submission not found.</p>
        <Link to="/feedback-corner" className="btn-outline text-sm">Back to Feedback Corner</Link>
      </div>
    );
  }

  return (
    <div className="bg-parchment-50 min-h-screen">
      {/* Back bar */}
      <div className="bg-white border-b border-parchment-100">
        <div className="section-container py-4">
          <Link to="/feedback-corner" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ember-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Feedback Corner
          </Link>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Submission card */}
          <div className="card p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="badge bg-parchment-100 text-parchment-700">{submission.genre}</span>
              {submission.word_count && (
                <span className="badge bg-sky-100 text-sky-700">{submission.word_count}</span>
              )}
              {submission.status === 'pending' && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Pending review
                </span>
              )}
            </div>
            <h1 className="font-serif font-bold text-2xl text-ink-900 mb-1">{submission.title}</h1>
            <p className="text-sm text-ink-400 mb-1">by {submission.author_name}</p>
            <div className="flex items-center gap-1.5 text-xs text-ink-400 mb-5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(submission.created_at)}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-5 text-sm text-amber-800">
              <span className="font-semibold">Feedback requested: </span>{submission.feedback_type}
            </div>

            <div className="bg-parchment-50 border border-parchment-100 rounded-xl p-6">
              <p className="font-serif text-ink-700 leading-relaxed whitespace-pre-wrap italic">{submission.excerpt}</p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-ink-400">
                <MessageCircle className="w-4 h-4" />
                <span>{submission.response_count} response{submission.response_count !== 1 ? 's' : ''}</span>
              </div>
              {!submitSuccess && (
                <button
                  onClick={() => { setShowForm((v) => !v); setSubmitError(''); }}
                  className="btn-primary text-sm py-2 px-5"
                >
                  {showForm ? 'Cancel' : 'Give Feedback'}
                </button>
              )}
            </div>
          </div>

          {/* Success banner */}
          {submitSuccess && (
            <div className="card p-6 flex items-start gap-4 border-sage-200 bg-sage-50">
              <CheckCircle className="w-6 h-6 text-sage-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sage-800 mb-1">Feedback submitted — thank you!</p>
                <p className="text-sage-700 text-sm">Your feedback has been submitted and is awaiting review by the community team. Once approved, it will be visible to the writer and other members.</p>
                <button onClick={() => setSubmitSuccess(false)} className="mt-3 btn-outline text-sm py-1.5">Give another response</button>
              </div>
            </div>
          )}

          {/* Reply form */}
          {showForm && !submitSuccess && (
            <form onSubmit={handleSubmit} className="card p-8 space-y-5">
              <h2 className="font-serif font-bold text-xl text-ink-900">Share Your Feedback</h2>
              <p className="text-sm text-ink-500">Follow the four-step method: be specific, kind, and constructive. Posting as <span className="font-semibold text-ink-700">{profile?.name || user?.email}</span>.</p>

              {submitError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {SECTIONS.map((s) => (
                <div key={s.key} className={`rounded-xl border-l-4 p-5 ${s.color}`}>
                  <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${s.labelColor}`}>
                    <s.icon className="w-4 h-4" />
                    {s.label} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full bg-white/70 border border-white rounded-lg px-3 py-2 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={
                      s.key === 'liked' ? 'What genuinely worked? What stood out or moved you?' :
                      s.key === 'confused' ? 'Where did you lose the thread? What was unclear?' :
                      s.key === 'suggestion' ? 'One specific, actionable suggestion for improvement.' :
                      'Close with genuine encouragement — remind the writer why their work matters.'
                    }
                    value={form[s.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [s.key]: e.target.value }))}
                    required
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          <div>
            <h2 className="font-serif font-bold text-xl text-ink-900 mb-4">
              Community Feedback
              {replies.length > 0 && <span className="ml-2 text-base font-normal text-ink-400">({replies.length})</span>}
            </h2>

            {replies.length === 0 ? (
              <div className="card p-10 text-center text-ink-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="font-medium mb-1">No feedback yet.</p>
                <p className="text-sm">Be the first to share your thoughts on this piece.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-ember-100 flex items-center justify-center text-ember-700 font-bold text-sm">
                          {reply.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-ink-800 text-sm">{reply.author_name}</p>
                          <p className="text-xs text-ink-400">{formatDate(reply.created_at)}</p>
                        </div>
                      </div>
                      {reply.status === 'pending' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending review
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {SECTIONS.map((s) => (
                        <div key={s.key} className={`rounded-xl p-4 border-l-4 ${s.color}`}>
                          <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5 ${s.labelColor}`}>
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                          </p>
                          <p className={`text-sm leading-relaxed ${s.textColor}`}>{reply[s.key]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
