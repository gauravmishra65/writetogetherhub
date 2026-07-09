import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, HelpCircle, Lightbulb, Heart, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type FeedbackSubmission } from '../lib/supabase';

const feedbackMethod = [
  { icon: ThumbsUp, step: 1, title: 'What I Liked', color: 'bg-sage-100 text-sage-700', desc: 'Start with genuine praise. What worked? What drew you in? What was memorable or well-written?' },
  { icon: HelpCircle, step: 2, title: 'What Confused Me', color: 'bg-sky-100 text-sky-700', desc: 'Note any moments where you lost the thread — unclear sentences, confusing transitions, or puzzling character choices.' },
  { icon: Lightbulb, step: 3, title: 'One Suggestion', color: 'bg-parchment-100 text-parchment-700', desc: 'Offer just one actionable idea to improve the piece. One specific, constructive suggestion is more valuable than a list of problems.' },
  { icon: Heart, step: 4, title: 'One Encouragement', color: 'bg-ember-100 text-ember-700', desc: 'End with genuine encouragement. Remind the writer why their work matters and what potential you see in their voice.' },
];

const sampleFeedback = [
  {
    piece: 'The Last Garden',
    user: 'WordsByMaria',
    liked: 'The contrast between memory and reality is beautifully handled. The line about the gate needing two hands is incredibly evocative.',
    confused: 'I wanted a little more grounding — I wasn\'t sure initially if this was a visit or a memory of a visit.',
    suggestion: 'Consider adding one sensory detail in the first paragraph that places us firmly in the present moment.',
    encouragement: 'Your prose is genuinely lovely. This opening has real literary potential. Keep writing.',
  },
];

const submitInitial = { title: '', genre: '', word_count: '', feedback_type: '', excerpt: '', author_name: '' };

export default function FeedbackCorner() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(submitInitial);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('feedback_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    setLoading(false);
    if (!error && data) setSubmissions(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    const { error } = await supabase.from('feedback_submissions').insert({
      title: form.title,
      genre: form.genre,
      word_count: form.word_count || null,
      feedback_type: form.feedback_type,
      excerpt: form.excerpt,
      author_name: form.author_name,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError('Something went wrong. Please try again.');
      return;
    }
    supabase.functions.invoke('notify-new-joiner', {
      body: { source: 'feedback_submission', author_name: form.author_name, title: form.title, genre: form.genre, word_count: form.word_count || null, feedback_type: form.feedback_type, excerpt: form.excerpt },
    });
    setSubmitSuccess(true);
    setForm(submitInitial);
    fetchSubmissions();
  }

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-ember-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-ember-100 text-ember-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <MessageCircle className="w-4 h-4" />
              Kind Feedback Community
            </div>
            <h1 className="section-title text-5xl mb-6">
              The <em className="text-ember-600">Feedback Corner</em>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Share a short excerpt and receive genuine, structured, kind feedback from fellow writers who want to help you improve — never discourage you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={() => { setShowForm(true); setSubmitSuccess(false); }} className="btn-primary">
                Submit Your Excerpt
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Method */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">How Feedback Works Here</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Every piece of feedback follows a simple four-part method designed to be helpful, kind, and specific.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {feedbackMethod.map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Step {item.step}</div>
                <h3 className="font-serif font-semibold text-ink-900 text-lg mb-3">{item.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="py-8 bg-parchment-50">
        <div className="section-container">
          <div className="max-w-2xl mx-auto flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">Important Reminder</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                Please share only short excerpts publicly — 200 to 500 words maximum. Do not share full manuscripts in the forum. Protecting your work is important. Your writing belongs to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      {showForm && (
        <section className="section-padding bg-white">
          <div className="section-container">
            <div className="max-w-2xl mx-auto">
              {submitSuccess ? (
                <div className="card p-10 text-center">
                  <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-sage-600" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-ink-900 mb-3">Excerpt Submitted!</h3>
                  <p className="text-ink-600 mb-5">Your excerpt has been posted. The community will begin sharing feedback shortly.</p>
                  <button onClick={() => { setSubmitSuccess(false); setShowForm(false); }} className="btn-outline text-sm">
                    Close Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-5">
                  <h3 className="font-serif font-bold text-xl text-ink-900">Submit Your Excerpt</h3>
                  {submitError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Title <span className="text-red-400">*</span></label>
                      <input type="text" className="form-input" placeholder='e.g. "Chapter One Draft"' value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Your Name / Pen Name <span className="text-red-400">*</span></label>
                      <input type="text" className="form-input" placeholder="How to credit you" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Genre <span className="text-red-400">*</span></label>
                      <input type="text" className="form-input" placeholder="e.g. Literary Fiction, Poetry" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Word Count</label>
                      <input type="text" className="form-input" placeholder="e.g. 287 words" value={form.word_count} onChange={e => setForm(f => ({ ...f, word_count: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">What Kind of Feedback Do You Need? <span className="text-red-400">*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Pacing, opening hook, emotional impact" value={form.feedback_type} onChange={e => setForm(f => ({ ...f, feedback_type: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label">Your Excerpt (200–500 words) <span className="text-red-400">*</span></label>
                    <textarea className="form-input resize-none" rows={8} placeholder="Paste your short excerpt here..." value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {submitting ? 'Submitting...' : 'Submit for Feedback'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Community Submissions — live */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Current Submissions</h2>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setSubmitSuccess(false); }} className="btn-primary text-sm py-2.5">
                Submit Your Excerpt
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-ink-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No submissions yet. Be the first to share your work!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {submissions.map((s) => (
                <div key={s.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge bg-parchment-100 text-parchment-700">{s.genre}</span>
                    {s.word_count && <span className="text-xs text-ink-400">{s.word_count}</span>}
                  </div>
                  <h3 className="font-serif font-semibold text-ink-900 text-lg mb-1">{s.title}</h3>
                  <p className="text-xs text-ink-400 mb-2">by {s.author_name}</p>
                  <p className="text-xs text-ink-500 mb-3">Seeking: {s.feedback_type}</p>
                  <p className="text-ink-600 text-sm leading-relaxed italic line-clamp-3 font-serif">{s.excerpt}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-ink-400">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {s.response_count} response{s.response_count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sample Feedback */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="section-title">What Kind Feedback Looks Like</h2>
            <p className="section-subtitle max-w-xl mx-auto">Real feedback follows the four-step method — helpful, specific, and encouraging.</p>
          </div>
          {sampleFeedback.map((fb, i) => (
            <div key={i} className="max-w-2xl mx-auto card p-7">
              <p className="text-sm font-semibold text-ink-400 mb-5">Sample feedback on: <span className="text-ink-700">"{fb.piece}"</span> by {fb.user}</p>
              <div className="space-y-4">
                {[
                  { label: 'What I Liked', color: 'border-sage-400 bg-sage-50', textColor: 'text-sage-800', content: fb.liked },
                  { label: 'What Confused Me', color: 'border-sky-400 bg-sky-50', textColor: 'text-sky-800', content: fb.confused },
                  { label: 'One Suggestion', color: 'border-parchment-400 bg-parchment-50', textColor: 'text-parchment-800', content: fb.suggestion },
                  { label: 'One Encouragement', color: 'border-ember-400 bg-ember-50', textColor: 'text-ember-800', content: fb.encouragement },
                ].map((section) => (
                  <div key={section.label} className={`rounded-xl p-4 border-l-4 ${section.color}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${section.textColor}`}>{section.label}</p>
                    <p className={`text-sm leading-relaxed ${section.textColor}`}>{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
