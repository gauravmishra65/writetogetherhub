import { Link } from 'react-router-dom';
import { Feather, Clock, Users, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

const steps = [
  {
    id: 'begin',
    emoji: '🤔',
    title: 'I want to write but do not know where to start',
    cards: [
      { step: '1', title: 'Accept that uncertainty is normal', desc: 'Every writer, including your favourite authors, began without knowing what they were doing. The blank page is the beginning, not the obstacle.' },
      { step: '2', title: 'Choose one writing goal', desc: 'Start tiny. Decide on just one: a short story, a poem, a journal entry, or a single scene from a novel idea you have been carrying.' },
      { step: '3', title: 'Set aside 15 minutes each day', desc: 'You do not need hours. Fifteen quiet minutes every day builds a writing habit faster than any course or workshop.' },
      { step: '4', title: 'Write your first sentence right now', desc: 'Open a notebook or a document. Write one sentence — any sentence. That is all. You have officially begun.' },
    ],
  },
  {
    id: 'habit',
    emoji: '📅',
    title: 'How to build a daily writing habit',
    cards: [
      { step: '1', title: 'Write at the same time every day', desc: 'Morning, lunch, or evening — pick a slot and protect it. Consistency beats intensity every time.' },
      { step: '2', title: 'Start with a warm-up', desc: 'Write 5 sentences about anything — your breakfast, a dream, the weather. This unlocks the mind before the real writing begins.' },
      { step: '3', title: 'Track your streak', desc: 'Download our free Daily Writing Tracker. Seeing a chain of completed days is surprisingly powerful motivation.' },
      { step: '4', title: 'Do not edit while writing', desc: 'The first draft is not meant to be perfect. Turn off your inner critic and let the words come. Editing comes later.' },
    ],
  },
  {
    id: 'first500',
    emoji: '✍️',
    title: 'How to write your first 500 words',
    cards: [
      { step: '1', title: 'Pick a scene, not a story', desc: 'Do not try to write a whole story. Choose one moment: a character waking up, a conversation, a description of a place you know.' },
      { step: '2', title: 'Write without stopping', desc: 'Set a 15-minute timer. Do not stop. Do not delete. Do not re-read. Just keep writing until the timer ends.' },
      { step: '3', title: 'Use short, clear sentences', desc: 'Simple sentences are powerful. "She opened the door. It was dark." is better than an over-complicated paragraph.' },
      { step: '4', title: 'Count, then celebrate', desc: 'Once the timer ends, count your words. Whether it is 200 or 600 — you wrote. That matters enormously.' },
    ],
  },
  {
    id: 'story',
    emoji: '🗺️',
    title: 'How to plan a story',
    cards: [
      { step: '1', title: 'Answer three questions', desc: 'Who is your main character? What do they want? What is stopping them? Every great story starts here.' },
      { step: '2', title: 'Choose your beginning, middle, and end', desc: 'You do not need a full outline. Just know roughly where your story starts, what changes in the middle, and how it ends.' },
      { step: '3', title: 'Download our Novel Planning Sheet', desc: 'Our free template helps you capture your ideas in a structured way before you start writing your draft.' },
      { step: '4', title: 'Start messy and refine later', desc: 'Your plan will change. That is normal. A rough map is better than no map — but the real story reveals itself when you write.' },
    ],
  },
  {
    id: 'character',
    emoji: '👤',
    title: 'How to create simple characters',
    cards: [
      { step: '1', title: 'Give them one clear desire', desc: 'What does your character want more than anything? A job, a person, a second chance? This drives everything they do.' },
      { step: '2', title: 'Give them one clear fear', desc: 'What do they most want to avoid? Fear creates conflict and conflict creates story.' },
      { step: '3', title: 'Give them a distinctive voice', desc: 'How do they speak? Short sentences? Long ones? Do they use humour, silence, or big words? Voice makes characters feel real.' },
      { step: '4', title: 'Use our Character Profile Template', desc: 'Our free template helps you develop full characters with backstory, motivation, and personality in one place.' },
    ],
  },
  {
    id: 'afterdraft',
    emoji: '🎉',
    title: 'What to do after writing your first draft',
    cards: [
      { step: '1', title: 'Celebrate — seriously', desc: 'Finishing a first draft is a significant achievement. Most people never get there. Take a moment to recognise what you have done.' },
      { step: '2', title: 'Rest for at least one week', desc: 'Step away from your draft completely. Distance gives you fresh eyes when you return to edit.' },
      { step: '3', title: 'Read it through once without editing', desc: 'On your return, read it as a reader would. Note what works and what does not. Do not change anything yet.' },
      { step: '4', title: 'Share an excerpt in Feedback Corner', desc: 'Post a short section in our community. Readers will respond with kind, structured feedback to help you improve.' },
    ],
  },
];

import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function StartHere() {
  useDocumentTitle('Start Here | Write Together Hub', 'New to Write Together Hub? Start here to learn how the community works and how to get the most out of your membership.');
  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-sage-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Feather className="w-4 h-4" />
              Beginner Writer Guide
            </div>
            <h1 className="section-title text-5xl mb-6">
              Your Complete<br /><em className="text-sage-600">Start Here Guide</em>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Everything a new writer needs to go from "I want to write" to "I am writing." Step by step. No experience needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {steps.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-sm font-medium text-ink-600 hover:text-ember-600 bg-white border border-parchment-200 hover:border-ember-200 px-3 py-1.5 rounded-full transition-colors">
                  {s.emoji} {s.title.split(' ').slice(0, 4).join(' ')}...
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-10 bg-white border-y border-parchment-100">
        <div className="section-container">
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
            <div>
              <p className="font-serif font-bold text-3xl text-ember-600">6</p>
              <p className="text-sm text-ink-400 mt-1">Learning Sections</p>
            </div>
            <div className="border-x border-parchment-200">
              <p className="font-serif font-bold text-3xl text-ember-600">15 min</p>
              <p className="text-sm text-ink-400 mt-1">Per Day is Enough</p>
            </div>
            <div>
              <p className="font-serif font-bold text-3xl text-ember-600">Free</p>
              <p className="text-sm text-ink-400 mt-1">Always</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="section-padding bg-white">
        <div className="section-container space-y-20">
          {steps.map((section, si) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{section.emoji}</span>
                <div>
                  <div className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">Section {si + 1}</div>
                  <h2 className="font-serif font-bold text-2xl lg:text-3xl text-ink-900">{section.title}</h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.cards.map((card) => (
                  <div key={card.step} className="card p-5">
                    <div className="w-8 h-8 rounded-full bg-ember-100 text-ember-700 text-sm font-bold flex items-center justify-center mb-3">
                      {card.step}
                    </div>
                    <h3 className="font-serif font-semibold text-ink-900 mb-2 leading-snug">{card.title}</h3>
                    <p className="text-ink-500 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources CTA */}
      <section className="section-padding bg-sage-50">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <BookOpen className="w-8 h-8 text-sage-600 mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-ink-900 mb-2">Free Templates</h3>
              <p className="text-ink-500 text-sm mb-4">Novel planners, character sheets, and editing checklists.</p>
              <Link to="/free-resources" className="btn-outline text-sm py-2">Download Free</Link>
            </div>
            <div className="card p-6 text-center">
              <Users className="w-8 h-8 text-ember-600 mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-ink-900 mb-2">Get Feedback</h3>
              <p className="text-ink-500 text-sm mb-4">Share an excerpt and receive kind, structured responses.</p>
              <Link to="/feedback-corner" className="btn-outline text-sm py-2">Share Your Work</Link>
            </div>
            <div className="card p-6 text-center">
              <CheckCircle className="w-8 h-8 text-sky-600 mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-ink-900 mb-2">Join the Community</h3>
              <p className="text-ink-500 text-sm mb-4">Connect with other new writers on the same journey.</p>
              <Link to="/join" className="btn-primary text-sm py-2">Join Free</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
