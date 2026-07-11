import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  BookOpen, MessageCircle, Star, Zap, FileText, Users, ArrowRight,
  PenLine, CheckCircle, Heart, Shield, Award, Lightbulb, BookMarked,
  Edit3, Feather, Target, MousePointerClick, Share2, ThumbsUp, Clock, Lock,
  Quote, HelpCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const features = [
  { icon: BookOpen, title: 'Learn Writing Basics', desc: 'Step-by-step guides on grammar, story structure, character development, and the craft of writing.', link: '/start-here', color: 'bg-sky-50 text-sky-600' },
  { icon: Edit3, title: 'Share Short Writing Pieces', desc: 'Post excerpts, first drafts, and work-in-progress pieces in a safe, welcoming space.', link: '/writer-forum', color: 'bg-sage-50 text-sage-600' },
  { icon: MessageCircle, title: 'Get Kind Feedback', desc: 'Receive thoughtful, constructive feedback from fellow writers who genuinely want to help you improve.', link: '/feedback-corner', color: 'bg-ember-50 text-ember-600' },
  { icon: Zap, title: 'Join Weekly Writing Challenges', desc: 'Fun, short prompts to keep your creative muscles active and your writing habit strong.', link: '/weekly-challenges', color: 'bg-parchment-100 text-parchment-700' },
  { icon: BookMarked, title: 'Understand Publishing', desc: 'Learn self-publishing, traditional publishing, and how to avoid common scams in plain language.', link: '/publishing-help', color: 'bg-rose-50 text-rose-600' },
  { icon: FileText, title: 'Download Free Templates', desc: 'Novel planners, character sheets, editing checklists, and launch guides — all free to download.', link: '/free-resources', color: 'bg-violet-50 text-violet-600' },
  { icon: Users, title: 'Meet Other New Writers', desc: 'Connect with people who are on the same journey — beginners encouraging beginners.', link: '/writer-forum', color: 'bg-teal-50 text-teal-600' },
];

const journey = [
  { step: 1, icon: Feather, title: 'Start Writing', desc: 'Begin with just 200 words a day. No experience required. The first sentence is the hardest — we help you write it.' },
  { step: 2, icon: Edit3, title: 'Share an Excerpt', desc: 'Post a short piece in the forum. Your work stays yours. We share only excerpts, never full manuscripts.' },
  { step: 3, icon: MessageCircle, title: 'Receive Kind Feedback', desc: 'Community members respond with what they liked, what confused them, and one gentle suggestion to improve.' },
  { step: 4, icon: Target, title: 'Improve & Publish', desc: 'Refine your work with confidence, then explore self-publishing and traditional publishing paths with our free guides.' },
];


import { useDocumentTitle } from '../lib/useDocumentTitle';

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_location: string | null;
  quote: string;
  rating: number;
};

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    id: 'placeholder-1',
    author_name: 'Priya R.',
    author_role: 'Writer',
    author_location: 'Singapore',
    quote: 'I posted the first chapter of my book and got kind, specific feedback within a day. It\'s the first time sharing my writing didn\'t feel scary.',
    rating: 5,
  },
  {
    id: 'placeholder-2',
    author_name: 'Daniel M.',
    author_role: 'Aspiring Novelist',
    author_location: 'Manchester',
    quote: 'I went from \'I want to write\' to actually writing 200 words a day. The weekly challenges keep me showing up.',
    rating: 5,
  },
  {
    id: 'placeholder-3',
    author_name: 'Aisha K.',
    author_role: 'Short Story Writer',
    author_location: 'Toronto',
    quote: 'The feedback here is honest but never harsh. I finally understand what\'s working in my story and what isn\'t.',
    rating: 5,
  },
];

export default function Home() {
  useDocumentTitle('Write Together Hub | Free Community for New Writers', 'Join Write Together Hub, a free community where new writers learn, share work, receive kind feedback, and explore publishing together.');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, author_name, author_role, author_location, quote, rating')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setTestimonials((data as Testimonial[]) ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-parchment-50 via-white to-parchment-100">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-parchment-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-ember-100/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-sage-100/20 blur-2xl" />
        </div>

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-ember-50 text-ember-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-ember-100">
                <PenLine className="w-4 h-4" />
                Free Community for New Writers
              </div>

              <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold text-ink-900 leading-tight mb-6">
                Write.{' '}
                <span className="text-ember-600">Share.</span>{' '}
                Learn.{' '}
                <span className="text-sage-600">Publish.</span>{' '}
                <em>Together.</em>
              </h1>

              <p className="text-ink-500 text-xl leading-relaxed mb-10 max-w-lg">
                A free community where new writers learn, share their work, receive kind feedback, and understand publishing — without paying a single penny.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/join" className="btn-primary text-base px-8 py-4">
                  Join Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/start-here" className="btn-secondary text-base px-8 py-4">
                  <BookOpen className="w-5 h-5" />
                  Start Writing
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div className="text-center">
                  <p className="font-serif font-bold text-2xl text-ink-900">100%</p>
                  <p className="text-xs text-ink-500 font-medium">Free Forever</p>
                </div>
                <div className="w-px h-10 bg-parchment-200" />
                <div className="text-center">
                  <p className="font-serif font-bold text-2xl text-ink-900">Kind</p>
                  <p className="text-xs text-ink-500 font-medium">Feedback Only</p>
                </div>
                <div className="w-px h-10 bg-parchment-200" />
                <div className="text-center">
                  <p className="font-serif font-bold text-2xl text-ink-900">Yours</p>
                  <p className="text-xs text-ink-500 font-medium">You Own Your Work</p>
                </div>
              </div>
            </div>

            {/* Product visual — feedback flow mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-[440px]">
                <div className="bg-white rounded-2xl shadow-warm border border-parchment-200 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-3.5 bg-parchment-50 border-b border-parchment-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">M</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-800 text-sm leading-tight">The Last Garden</p>
                      <p className="text-xs text-ink-500 leading-tight">by WordsByMaria · Literary Fiction</p>
                    </div>
                    <span className="text-xs bg-ember-50 text-ember-700 px-2 py-0.5 rounded-full font-medium">Excerpt</span>
                  </div>
                  {/* Excerpt preview */}
                  <div className="px-5 py-4 border-b border-parchment-100">
                    <p className="font-serif text-sm text-ink-700 italic leading-relaxed line-clamp-3">
                      The gate needed two hands — one to lift the rusted latch, one to hold back the brambles that had claimed the path since Gran stopped walking it...
                    </p>
                  </div>
                  {/* Feedback items */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 flex-shrink-0">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-sage-700 uppercase tracking-wide mb-0.5">What I Liked</p>
                        <p className="text-sm text-ink-700 leading-snug">The line about the gate needing two hands is incredibly evocative.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 flex-shrink-0">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-0.5">What Confused Me</p>
                        <p className="text-sm text-ink-700 leading-snug">Wasn't sure initially if this was a visit or a memory of a visit.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-ember-100 flex items-center justify-center text-ember-700 flex-shrink-0">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-ember-700 uppercase tracking-wide mb-0.5">Encouragement</p>
                        <p className="text-sm text-ink-700 leading-snug">Your prose is genuinely lovely. This opening has real potential.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-ember-600 text-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-semibold">
                  Kind Feedback
                </div>
                <div className="absolute -bottom-3 -left-3 bg-sage-600 text-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-semibold">
                  Always Free
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Write Together Hub */}
      <section className="section-padding bg-ink-900">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge bg-ember-900/50 text-ember-300 mb-4">Our Purpose</div>
              <h2 className="section-title text-white mb-6">Why Write Together Hub Exists</h2>
              <p className="text-ink-300 text-lg leading-relaxed mb-6">
                Many new writers feel lost. They want to write but do not know where to begin. They want to improve but cannot afford expensive courses. They want feedback but fear harsh criticism. They want to publish but find the process confusing and full of scams.
              </p>
              <p className="text-ink-300 text-lg leading-relaxed mb-8">
                Write Together Hub was built to solve all of this — completely free. A safe, warm space where beginners encourage beginners, where growth is celebrated, and where every writer has a real chance to improve and publish.
              </p>
              <Link to="/about" className="btn-outline border-ember-500 text-ember-400 hover:bg-ember-600 hover:text-white hover:border-ember-600">
                Read Our Full Story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { q: 'Where do I start?', a: 'Our Start Here guide walks you through every first step.' },
                { q: 'How do I improve?', a: 'Weekly challenges, feedback, and practical lessons.' },
                { q: 'Will people judge me?', a: 'Never. Our community values kindness above all.' },
                { q: 'How do I publish?', a: 'Free, plain-language publishing guides with no jargon.' },
              ].map((item, i) => (
                <div key={i} className="bg-ink-800 rounded-xl p-5 border border-ink-700">
                  <p className="text-parchment-300 font-serif font-semibold text-sm mb-2">"{item.q}"</p>
                  <p className="text-ink-500 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beginner Journey */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="badge bg-sage-100 text-sage-700 mb-4">Your Path Forward</div>
            <h2 className="section-title">The Beginner Writer Journey</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Four simple steps from your very first word to a finished, publishable piece.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {journey.map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {i < journey.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-parchment-200" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-ember-600 flex items-center justify-center shadow-warm mb-5">
                  <item.icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink-900 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-ink-900 text-xl mb-3">{item.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/start-here" className="btn-primary px-8 py-4 text-base">
              Join Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — social proof right after the journey */}
      <section className="section-padding bg-parchment-100">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="badge bg-ember-50 text-ember-700 mb-4">From Our Members</div>
            <h2 className="section-title">What Writers Are Saying</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Real words from members of our growing community.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(testimonials.length > 0 ? testimonials : PLACEHOLDER_TESTIMONIALS).map((t) => (
              <div key={t.id} className="card p-6 flex flex-col">
                <Quote className="w-8 h-8 text-ember-300 mb-3 flex-shrink-0" />
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'fill-ember-500 text-ember-500' : 'text-parchment-300'}`}
                    />
                  ))}
                </div>
                <p className="text-ink-700 leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-parchment-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">{t.author_name}</p>
                    {(t.author_role || t.author_location) && (
                      <p className="text-xs text-ink-500 mt-0.5">
                        {[t.author_role, t.author_location].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="badge bg-parchment-100 text-parchment-700 mb-4">Everything You Need</div>
            <h2 className="section-title">What You Can Do Here</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Every tool, guide, and community feature you need to grow as a writer — free, forever.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6 flex flex-col">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-ink-900 mb-2 text-lg leading-snug">{feature.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed flex-1">{feature.desc}</p>
                <Link
                  to={feature.link}
                  className="mt-4 inline-flex items-center gap-1.5 text-ember-600 hover:text-ember-700 text-sm font-semibold group"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Values — merged from Promise + Safe Here */}
      <section className="section-padding bg-ink-900">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="badge bg-ink-800 text-parchment-300 mb-4">Our Commitment</div>
            <h2 className="section-title text-white">Why Writers Feel Safe Here</h2>
            <p className="section-subtitle max-w-2xl mx-auto text-ink-300">
              These are not just words. They are the values every member agrees to uphold — the foundation of a community where beginners can grow without fear.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Heart, title: 'Always Free', desc: 'Free forever for every writer — no paywalls, no premium tiers, no hidden costs.', color: 'bg-ember-900/50 text-ember-400' },
              { icon: ThumbsUp, title: 'Kind Feedback Only', desc: 'Constructive, respectful notes every time. Our community values kindness above all.', color: 'bg-sage-900/50 text-sage-400' },
              { icon: Lock, title: 'You Own Your Work', desc: 'Writers keep full ownership. We share excerpts, never full manuscripts.', color: 'bg-sky-900/50 text-sky-400' },
              { icon: Shield, title: 'No Plagiarism', desc: 'Copying or claiming others\' work is strictly prohibited and enforced.', color: 'bg-parchment-900/50 text-parchment-300' },
              { icon: Award, title: 'Beginner-Friendly', desc: 'Learning at every level — no experience required, no judgment given.', color: 'bg-violet-900/50 text-violet-400' },
              { icon: Lightbulb, title: 'Publishing Guidance', desc: 'Practical, plain-language guides for self-publishing and traditional paths.', color: 'bg-rose-900/50 text-rose-400' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-ink-800 rounded-xl p-5 border border-ink-700">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-parchment-200 font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-ink-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Writing Prompt */}
      <section className="section-padding bg-gradient-to-br from-parchment-50 via-white to-parchment-100">
        <div className="section-container">
          <div className="text-center mb-10">
            <div className="badge bg-parchment-200 text-parchment-800 mb-4">Daily Inspiration</div>
            <h2 className="section-title">Today's Writing Prompt</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white rounded-3xl shadow-warm border border-parchment-200 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ember-500 via-ember-400 to-parchment-400" />
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-2 mb-5">
                  <Feather className="w-5 h-5 text-ember-500" />
                  <span className="text-ember-600 font-semibold text-sm uppercase tracking-wide">Featured Prompt</span>
                </div>
                <h3 className="font-serif font-bold text-ink-900 text-2xl sm:text-3xl mb-4 leading-snug">
                  The Door That Was Never Opened
                </h3>
                <p className="text-ink-600 text-base leading-relaxed mb-6">
                  Write 150–300 words about a character who finds a door in their home that they have never noticed before. What is behind it?
                </p>
                <div className="flex items-center gap-2 mb-8 text-ink-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>10–15 minutes</span>
                </div>
                <Link to="/weekly-challenges" className="btn-primary px-8 py-3.5 text-base inline-flex">
                  Start Writing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-ember-600 to-ember-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="section-container relative z-10 text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your writing journey does not<br className="hidden sm:block" /> have to begin alone.
          </h2>
          <p className="text-ember-100 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Join a free community built for new writers who want to learn, improve, and grow together. Your words deserve to be shared.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join" className="inline-flex items-center justify-center gap-2 bg-white text-ember-700 hover:bg-parchment-50 font-bold px-10 py-4 rounded-lg text-lg shadow-lg transition-all duration-200 active:scale-95">
              Join Write Together Hub for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/start-here" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200">
              <BookOpen className="w-5 h-5" />
              Browse Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
