import { useState } from 'react';
import { Mail, Twitter, Facebook, Instagram, Youtube, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const subjects = [
  'General Inquiry',
  'Technical Issue',
  'Community Rules Question',
  'Feedback About the Platform',
  'Spam / Abuse Report',
  'Partnership Inquiry',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newsletter, setNewsletter] = useState({ email: '', done: false, loading: false, error: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
    setLoading(false);
    if (error) {
      setFormError('Something went wrong. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletter(n => ({ ...n, loading: true, error: '' }));
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: newsletter.email });
    if (error) {
      const msg = error.code === '23505' ? 'You are already subscribed!' : 'Something went wrong.';
      setNewsletter(n => ({ ...n, loading: false, error: msg }));
      return;
    }
    setNewsletter(n => ({ ...n, done: true, loading: false }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Mail className="w-4 h-4" />
              Get in Touch
            </div>
            <h1 className="section-title text-5xl mb-6">
              <em className="text-ember-600">Contact</em> Us
            </h1>
            <p className="section-subtitle max-w-xl mx-auto">
              Have a question, a suggestion, or a concern? We would love to hear from you. All messages are read and responded to by a real person.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif font-bold text-ink-900 text-xl mb-4">How to Reach Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-ember-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-ember-600" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-800 text-sm">General Inquiries</p>
                      <p className="text-ink-500 text-sm">hello@writetogetherhub.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-800 text-sm">Community Reports</p>
                      <p className="text-ink-500 text-sm">hello@writetogetherhub.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-ink-900 text-xl mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { Icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-600' },
                    { Icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-700' },
                    { Icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
                    { Icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600' },
                  ].map(({ Icon, label, color }) => (
                    <a
                      key={label}
                      href="#"
                      className={`flex items-center gap-2 bg-parchment-100 ${color} text-ink-700 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-parchment-50 rounded-2xl p-6 border border-parchment-100">
                <h3 className="font-serif font-bold text-ink-900 text-lg mb-2">Newsletter</h3>
                <p className="text-ink-500 text-sm mb-4">Get weekly writing tips and community news delivered to your inbox.</p>
                {newsletter.done ? (
                  <div className="flex items-center gap-2 text-sage-700 bg-sage-50 rounded-lg p-3 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Subscribed! Welcome aboard.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletter} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        className="form-input text-sm py-2"
                        placeholder="Your email"
                        value={newsletter.email}
                        onChange={e => setNewsletter(n => ({ ...n, email: e.target.value }))}
                        required
                      />
                      <button
                        type="submit"
                        disabled={newsletter.loading}
                        className="flex-shrink-0 w-10 h-10 bg-ember-600 hover:bg-ember-700 disabled:opacity-60 text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {newsletter.error && (
                      <p className="text-red-500 text-xs">{newsletter.error}</p>
                    )}
                  </form>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-800">
                <strong>Response Time:</strong> We aim to respond to all messages within 2–3 business days.
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8 text-sage-600" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-ink-900 mb-3">Message Sent!</h3>
                  <p className="text-ink-600 leading-relaxed max-w-md">
                    Thank you for reaching out. We have received your message and will get back to you within 2–3 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                  <h3 className="font-serif font-bold text-xl text-ink-900">Send a Message</h3>

                  {formError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Your Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Full name"
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
                  </div>

                  <div>
                    <label className="form-label">Subject <span className="text-red-400">*</span></label>
                    <select
                      className="form-input"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Message <span className="text-red-400">*</span></label>
                    <textarea
                      className="form-input resize-none"
                      rows={7}
                      placeholder="Tell us what's on your mind..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-60">
                    {loading ? 'Sending...' : 'Send Message'}
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
