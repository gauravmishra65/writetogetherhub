import { useState } from 'react';
import { ArrowRight, CheckCircle, PenLine, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const benefits = [
  'Free access to all community resources',
  'Post in the Writer Forum and Feedback Corner',
  'Participate in Weekly Writing Challenges',
  'Download all free templates and checklists',
  'Get feedback on your writing excerpts',
  'Connect with other new writers worldwide',
  'Access publishing guides and beginner content',
  'Weekly community newsletter with writing tips',
];

const writingTypes = [
  'Novel', 'Short Story', 'Poetry', 'Blog', 'Non-fiction',
  'Memoir', 'Screen/Script', 'Other',
];

const experienceLevels = [
  'Complete Beginner (Never written anything)',
  'Curious Beginner (A few attempts)',
  'Developing Writer (Some consistent writing)',
  'Intermediate (Working on a manuscript)',
];

const interests = [
  'Learning writing basics',
  'Getting feedback on my work',
  'Meeting other writers',
  'Understanding publishing',
  'Weekly writing challenges',
  'Downloading free templates',
];

export default function JoinFree() {
  useDocumentTitle('Join Free | Write Together Hub', 'Join the Write Together Hub community for free. No cost, no barriers — just a welcoming space for new writers.');
  const [form, setForm] = useState({
    name: '', email: '', interest: [] as string[], experience: '',
    type: '' as string, message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleInterest = (interest: string) => {
    setForm(f => ({
      ...f,
      interest: f.interest.includes(interest)
        ? f.interest.filter(i => i !== interest)
        : [...f.interest, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('join_requests').insert({
      name: form.name,
      email: form.email,
      experience_level: form.experience || null,
      writing_type: form.type || null,
      interests: form.interest.length > 0 ? form.interest : null,
      message: form.message || null,
    });
    setLoading(false);
    if (err) {
      if (err.code === '23505') {
        setError('This email is already registered. Welcome back!');
      } else {
        setError('Something went wrong. Please try again.');
      }
      return;
    }
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-joiner`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'join_free',
        name: form.name,
        email: form.email,
        experience_level: form.experience || null,
        writing_type: form.type || null,
        interests: form.interest.length > 0 ? form.interest : null,
        message: form.message || null,
      }),
    }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-ember-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-ember-100 text-ember-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <PenLine className="w-4 h-4" />
              Free Community Membership
            </div>
            <h1 className="section-title text-5xl mb-6">
              Join <em className="text-ember-600">Write Together Hub</em><br /> for Free
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Join a free community built for new writers who want to learn, improve, and grow together. No payment. No catch.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Benefits */}
            <div>
              <h2 className="font-serif font-bold text-2xl text-ink-900 mb-6">What You Get When You Join</h2>
              <div className="space-y-3 mb-10">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-sage-600" />
                    </div>
                    <p className="text-ink-700">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="bg-parchment-50 rounded-2xl p-6 border border-parchment-100">
                <p className="font-serif text-ink-700 italic leading-relaxed text-lg">
                  "The only cost to join Write Together Hub is a willingness to be kind, to write, and to encourage others on their journey."
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="card p-10 text-center">
                  <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-sage-600" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-ink-900 mb-3">Request Received!</h3>
                  <p className="text-ink-600 leading-relaxed">
                    Thank you for applying to join Write Together Hub. We review every request personally. Once you are approved, we will email you a link to confirm your address and create your password.
                  </p>
                  <p className="text-ink-500 text-sm mt-4">
                    While you wait, explore our{' '}
                    <a href="/start-here" className="text-ember-600 hover:underline">Start Here guide</a>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                  <h3 className="font-serif font-bold text-xl text-ink-900">Request Your Free Membership</h3>

                  {error && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="form-label">Your Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="How should we address you?"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Experience Level <span className="text-red-400">*</span></label>
                    <select
                      className="form-input"
                      value={form.experience}
                      onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                      required
                    >
                      <option value="">Select your level...</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Type of Writing <span className="text-red-400">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {writingTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, type }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                            form.type === type
                              ? 'bg-ember-600 text-white shadow-md'
                              : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">What Interests You Most?</label>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleToggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            form.interest.includes(interest)
                              ? 'bg-sage-600 text-white'
                              : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Anything You'd Like Us to Know? <span className="text-ink-400 font-normal">(optional)</span></label>
                    <textarea
                      className="form-input resize-none"
                      rows={3}
                      placeholder="Tell us about your writing goals, questions, or what brought you here..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-60">
                    {loading ? 'Joining...' : 'Join Write Together Hub — It\'s Free'}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-center text-xs text-ink-400">
                    By joining, you agree to our{' '}
                    <a href="/community-rules" className="text-ember-600 hover:underline">Community Rules</a>.
                    Your email will never be shared or sold.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
