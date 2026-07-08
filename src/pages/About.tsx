import { Link } from 'react-router-dom';
import { Heart, Target, Users, BookOpen, Shield, Star, ArrowRight, Quote } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Community First', desc: 'Everything we do centers on the people — real writers helping real writers grow.' },
  { icon: Target, title: 'Clear Purpose', desc: 'No confusion about what we offer. Free tools, free guidance, free community — always.' },
  { icon: Users, title: 'Beginner Focus', desc: 'We are designed for writers who are just starting out, not experienced authors chasing trends.' },
  { icon: Shield, title: 'Safe Space', desc: 'Your work is protected. Your voice is respected. Your journey is honored.' },
  { icon: BookOpen, title: 'Practical Learning', desc: 'Real, actionable writing and publishing guidance in plain language with zero jargon.' },
  { icon: Star, title: 'Genuine Encouragement', desc: 'We celebrate progress, not perfection. Every word written is a step worth celebrating.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              About Write Together Hub
            </div>
            <h1 className="section-title text-5xl mb-6">
              A Free Home for<br /><em className="text-ember-600">Every New Writer</em>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Write Together Hub was built because every writer deserves a supportive place to begin — regardless of experience, background, or budget.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="section-title mb-6">Our Mission</h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-5">
                To provide every aspiring writer — regardless of experience or resources — with a free, kind, and practical community where they can learn the craft, share their work safely, receive genuine feedback, and understand how to publish.
              </p>
              <p className="text-ink-600 text-lg leading-relaxed mb-5">
                We believe that writing is not a privilege reserved for the few. Every person who has a story to tell deserves the tools and support to tell it well.
              </p>
              <p className="text-ink-600 text-lg leading-relaxed">
                Write Together Hub removes the barriers — no subscription fees, no gatekeeping, no judgment. Just a community of writers helping writers.
              </p>
            </div>
            <div>
              <h2 className="section-title mb-6">Our Vision</h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-5">
                A world where no new writer feels alone. Where the fear of the blank page is replaced by the excitement of a supportive community waiting to hear your story.
              </p>
              <p className="text-ink-600 text-lg leading-relaxed mb-8">
                We envision Write Together Hub becoming the first place every aspiring author, poet, blogger, and storyteller turns to when they decide to begin their writing journey.
              </p>
              <div className="bg-parchment-50 rounded-2xl p-6 border border-parchment-100">
                <Quote className="w-6 h-6 text-ember-400 mb-3" />
                <p className="font-serif text-ink-700 text-lg italic leading-relaxed">
                  "Every great author was once a beginner who kept writing. The only difference is that they found a community that believed in them."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Who Write Together Hub Is For</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              If you have ever had a story inside you and did not know how to get it out, this place is for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '✍️', title: 'New Writers', desc: 'People who want to write but have never published anything.' },
              { emoji: '📖', title: 'Aspiring Authors', desc: 'Those dreaming of writing their first novel or short story.' },
              { emoji: '🎵', title: 'Poets & Bloggers', desc: 'Writers of all genres and formats looking for community.' },
              { emoji: '🎓', title: 'Students', desc: 'Young writers exploring their voice and creative potential.' },
              { emoji: '📚', title: 'First-Time Novelists', desc: 'People mid-way through a manuscript who need encouragement.' },
              { emoji: '💼', title: 'Non-Fiction Writers', desc: 'Those writing memoirs, guides, or personal essays.' },
              { emoji: '🌟', title: 'Story Explorers', desc: 'Anyone who has an idea but has never acted on it — until now.' },
              { emoji: '🚀', title: 'Future Publishers', desc: 'Writers who want to understand and navigate publishing themselves.' },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-serif font-semibold text-ink-900 mb-1.5">{item.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 rounded-xl bg-parchment-50 border border-parchment-100">
                <div className="w-11 h-11 rounded-xl bg-ember-100 flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-5 h-5 text-ember-600" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-ink-900 mb-1.5">{v.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Helps */}
      <section className="section-padding bg-ink-900 text-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title text-white text-center mb-12">How Write Together Hub Helps You</h2>
            <div className="space-y-6">
              {[
                { title: 'Structured Learning', desc: 'From writing your first sentence to understanding publishing, our Start Here guide walks you through every stage in simple, plain language.' },
                { title: 'Safe Sharing', desc: 'Share short excerpts of your work in a community that understands the vulnerability of sharing writing publicly for the first time.' },
                { title: 'Constructive Feedback', desc: 'Receive feedback using our kind method: what worked, what confused, one suggestion, one encouragement. Growth without discouragement.' },
                { title: 'Publishing Clarity', desc: 'No more confusion about self-publishing vs traditional publishing, Amazon KDP, book formatting, or how to avoid publishing scams.' },
                { title: 'Free Tools & Templates', desc: 'Download novel planners, character sheets, editing checklists, and launch guides with no sign-up walls and no payment required.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 p-6 bg-ink-800 rounded-xl border border-ink-700">
                  <div className="w-8 h-8 rounded-full bg-ember-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-white mb-1.5">{item.title}</h3>
                    <p className="text-ink-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <Quote className="w-8 h-8 text-ember-400 mx-auto mb-6" />
            <p className="font-serif text-xl text-ink-700 leading-relaxed italic mb-8">
              "Write Together Hub exists because I know what it feels like to have a story inside you and no idea where to begin. This community is the starting point I wish I had. It is for every writer who has ever stared at a blank page and thought — maybe someday. Someday is today."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-ember-100 flex items-center justify-center">
                <span className="text-xl">✍️</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-ink-900">Founder</p>
                <p className="text-ink-500 text-sm">Write Together Hub</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ember-600 text-white">
        <div className="section-container text-center">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to Begin?</h2>
          <p className="text-ember-100 text-xl mb-8">Join the community and start your writing journey today.</p>
          <Link to="/join" className="inline-flex items-center gap-2 bg-white text-ember-700 hover:bg-parchment-50 font-bold px-10 py-4 rounded-lg text-lg shadow-lg transition-all duration-200">
            Join Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
