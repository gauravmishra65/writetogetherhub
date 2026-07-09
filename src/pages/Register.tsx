import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus, Mail, Phone, MapPin, BookOpen, Feather,
  CheckCircle, AlertCircle, ArrowRight, Clock, Globe,
  Twitter, Facebook, Instagram, Youtube, Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const experienceLevels = [
  'Complete Beginner — I have never really written before',
  'Curious Beginner — I have tried a few times',
  'Developing Writer — I write occasionally',
  'Intermediate — I am working on a manuscript or project',
];

const writingTypes = [
  'Novel', 'Short Story', 'Poetry', 'Blog / Essay', 'Memoir',
  'Non-fiction', 'Screenplay / Script', 'Fantasy', 'Romance',
  'Thriller / Mystery', 'Literary Fiction', 'Other',
];

const genreOptions = [
  'Literary Fiction', 'Fantasy', 'Science Fiction', 'Romance',
  'Thriller', 'Mystery', 'Historical Fiction', 'Horror',
  'Non-fiction', 'Memoir', 'Poetry', 'Young Adult', 'Children\'s',
];

const howHeardOptions = [
  'Google / Search Engine',
  'Social Media (Facebook, Instagram, X)',
  'A Friend or Fellow Writer',
  'Writing Blog or Newsletter',
  'YouTube',
  'Writing Group or Forum',
  'Other',
];

const contactDetails = [
  {
    icon: Mail,
    label: 'General Inquiries',
    value: 'hello@writetogetherhub.com',
    sub: 'We reply within 2–3 business days',
    color: 'bg-ember-100 text-ember-600',
  },
  {
    icon: Mail,
    label: 'Community & Safety',
    value: 'hello@writetogetherhub.com',
    sub: 'For abuse reports or urgent issues',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Globe,
    label: 'Website',
    value: 'writetogetherhub.com',
    sub: 'Resources, challenges, and more',
    color: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: 'Mon – Fri, 9am – 6pm GMT',
    sub: 'Closed on weekends and public holidays',
    color: 'bg-sage-100 text-sage-600',
  },
];

const socials = [
  { Icon: Twitter, label: 'Twitter / X' },
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
];

const emptyForm = {
  name: '', email: '', phone: '', city: '', country: '',
  experience_level: '', writing_type: '', genres: [] as string[],
  bio: '', how_heard: '',
};

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const toggleGenre = (g: string) =>
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g],
    }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('registrations').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      city: form.city || null,
      country: form.country || null,
      experience_level: form.experience_level || null,
      writing_type: form.writing_type || null,
      genres: form.genres.length > 0 ? form.genres : null,
      bio: form.bio || null,
      how_heard: form.how_heard || null,
    });
    setLoading(false);
    if (err) {
      if (err.code === '23505') {
        setError('This email is already registered. You are already a member!');
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
        source: 'registration',
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        city: form.city || null,
        country: form.country || null,
        experience_level: form.experience_level || null,
        writing_type: form.writing_type || null,
        genres: form.genres.length > 0 ? form.genres : null,
        bio: form.bio || null,
        how_heard: form.how_heard || null,
      }),
    }).catch(() => {});
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <UserPlus className="w-4 h-4" />
              Community Registration
            </div>
            <h1 className="section-title text-5xl mb-6">
              Become a <em className="text-ember-600">Member</em>
            </h1>
            <p className="section-subtitle max-w-xl mx-auto">
              Complete your registration to unlock full access to the Write Together Hub community — forums, challenges, feedback, and more. Always free.
            </p>
            {!submitted && (
              <div className="flex justify-center gap-3 mt-8">
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${step === 1 ? 'bg-ember-600 text-white shadow-md' : 'bg-parchment-100 text-parchment-600'}`}>
                  <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">1</span>
                  Contact Details
                </div>
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${step === 2 ? 'bg-ember-600 text-white shadow-md' : 'bg-parchment-100 text-parchment-600'}`}>
                  <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">2</span>
                  Writing Profile
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12 items-start">

            {/* Main Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-12 text-center">
                  <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-sage-600" />
                  </div>
                  <h2 className="font-serif font-bold text-3xl text-ink-900 mb-3">
                    Welcome to the Community!
                  </h2>
                  <p className="text-ink-600 leading-relaxed max-w-md mx-auto mb-6">
                    Your registration is complete. Check your inbox for a welcome email with everything you need to get started at Write Together Hub.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/start-here" className="btn-primary">
                      Go to Start Here Guide
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/writer-forum" className="btn-secondary">
                      Visit the Forum
                    </Link>
                  </div>
                </div>
              ) : step === 1 ? (
                <form onSubmit={handleNext} className="card p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-parchment-100">
                    <div className="w-10 h-10 bg-ember-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-ember-600" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-xl text-ink-900">Step 1: Contact Details</h2>
                      <p className="text-ink-500 text-sm">Your personal contact information</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="form-label">Full Name <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        <input
                          type="text"
                          className="form-input pl-10"
                          placeholder="Your full name or pen name"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Email Address <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        <input
                          type="email"
                          className="form-input pl-10"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Phone Number <span className="text-ink-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        <input
                          type="tel"
                          className="form-input pl-10"
                          placeholder="+1 555 000 0000"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">City <span className="text-ink-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        <input
                          type="text"
                          className="form-input pl-10"
                          placeholder="Your city"
                          value={form.city}
                          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Country <span className="text-ink-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                        <input
                          type="text"
                          className="form-input pl-10"
                          placeholder="Your country"
                          value={form.country}
                          onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="form-label">How Did You Hear About Us?</label>
                      <select
                        className="form-input"
                        value={form.how_heard}
                        onChange={e => setForm(f => ({ ...f, how_heard: e.target.value }))}
                      >
                        <option value="">Select an option...</option>
                        {howHeardOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="btn-primary px-10">
                      Continue to Writing Profile
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-parchment-100">
                    <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                      <Feather className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-xl text-ink-900">Step 2: Your Writing Profile</h2>
                      <p className="text-ink-500 text-sm">Help us personalise your community experience</p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="form-label">Experience Level <span className="text-red-400">*</span></label>
                    <select
                      className="form-input"
                      value={form.experience_level}
                      onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))}
                      required
                    >
                      <option value="">Select your level...</option>
                      {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Primary Writing Type <span className="text-red-400">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {writingTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, writing_type: type }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                            form.writing_type === type
                              ? 'bg-ember-600 text-white shadow-md'
                              : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {!form.writing_type && (
                      <p className="text-xs text-ink-400 mt-2">Please select one type above</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Genre Interests <span className="text-ink-400 font-normal">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {genreOptions.map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            form.genres.includes(g)
                              ? 'bg-sage-600 text-white'
                              : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      A Short Bio <span className="text-ink-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      className="form-input resize-none"
                      rows={4}
                      placeholder="Tell the community a little about yourself, your writing goals, or what brought you here..."
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      type="button"
                      onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="btn-secondary order-2 sm:order-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !form.writing_type || !form.experience_level}
                      className="btn-primary order-1 sm:order-2 px-10 disabled:opacity-60"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                        : <>Complete Registration <CheckCircle className="w-4 h-4" /></>
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-serif font-bold text-ink-900 text-xl mb-5">Contact Us</h3>
                <div className="space-y-4">
                  {contactDetails.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                        <p className="font-medium text-ink-800 text-sm">{item.value}</p>
                        <p className="text-xs text-ink-400">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-serif font-bold text-ink-900 text-lg mb-4">Follow Our Community</h3>
                <div className="space-y-2">
                  {socials.map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-parchment-50 hover:bg-parchment-100 text-ink-700 hover:text-ink-900 transition-colors text-sm font-medium"
                    >
                      <Icon className="w-4 h-4 text-ember-500" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-parchment-50 border border-parchment-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-ember-500" />
                  <h3 className="font-semibold text-ink-900 text-sm">Already have an account?</h3>
                </div>
                <p className="text-ink-500 text-sm leading-relaxed mb-3">
                  If you have already joined via our Join Free page your account is ready — head to the forum to get started.
                </p>
                <Link to="/writer-forum" className="inline-flex items-center gap-1.5 text-ember-600 hover:text-ember-700 text-sm font-semibold transition-colors">
                  Visit the Forum
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-ink-900 rounded-2xl p-5 text-white">
                <h3 className="font-serif font-bold text-lg mb-2">Why Register?</h3>
                <ul className="space-y-2">
                  {[
                    'Post in the Writer Forum',
                    'Submit work for feedback',
                    'Enter weekly challenges',
                    'Access all free resources',
                    'Connect with fellow writers',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink-300">
                      <CheckCircle className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
