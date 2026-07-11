import { useState } from 'react';
import { FileText, BookOpen, Users, CheckSquare, List, Download, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const resources = [
  {
    icon: BookOpen,
    title: 'Novel Planning Sheet',
    desc: 'Plan your entire novel in one structured document. Includes premise, plot points, character arcs, and chapter summaries.',
    category: 'Planning',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    pages: '4 pages',
    format: 'PDF + Word',
  },
  {
    icon: Users,
    title: 'Character Profile Template',
    desc: 'Build fully realised characters with sections for physical appearance, backstory, motivation, fears, speech patterns, and development arc.',
    category: 'Characters',
    color: 'bg-sage-50 text-sage-600 border-sage-100',
    pages: '2 pages',
    format: 'PDF + Word',
  },
  {
    icon: List,
    title: 'Chapter Outline Template',
    desc: 'Plan each chapter with scene goals, character present, location, conflict, and what changes by the end. Perfect for plotters.',
    category: 'Planning',
    color: 'bg-parchment-100 text-parchment-700 border-parchment-200',
    pages: '1 page',
    format: 'PDF + Word',
  },
  {
    icon: CheckSquare,
    title: 'Editing Checklist',
    desc: 'A comprehensive multi-stage editing guide covering structural editing, line editing, and proofreading. Work through each stage systematically.',
    category: 'Editing',
    color: 'bg-ember-50 text-ember-600 border-ember-100',
    pages: '3 pages',
    format: 'PDF',
  },
  {
    icon: FileText,
    title: 'Beta Reader Feedback Form',
    desc: 'Share this form with your beta readers to get consistent, useful feedback on characters, pacing, plot holes, and overall impressions.',
    category: 'Feedback',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    pages: '2 pages',
    format: 'PDF + Word',
  },
  {
    icon: BookOpen,
    title: 'Self-Publishing Checklist',
    desc: 'Every step from finished manuscript to live book on Amazon KDP. Includes editing, formatting, cover, metadata, pricing, and launch prep.',
    category: 'Publishing',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    pages: '2 pages',
    format: 'PDF',
  },
  {
    icon: List,
    title: 'Book Launch Checklist',
    desc: 'A 30-day pre-launch and launch-day guide for new authors. Covers ARC readers, reviews, social media, mailing lists, and launch day tasks.',
    category: 'Publishing',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    pages: '3 pages',
    format: 'PDF',
  },
  {
    icon: CheckSquare,
    title: 'Daily Writing Tracker',
    desc: 'Track your daily word count, writing time, and habit streak. Printable monthly calendar format with reflection prompts.',
    category: 'Habit',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    pages: '1 page',
    format: 'PDF',
  },
];

const categories = ['All', 'Planning', 'Characters', 'Editing', 'Feedback', 'Publishing', 'Habit'];

export default function FreeResources() {
  useDocumentTitle('Free Resources | Write Together Hub', 'Free writing resources, templates, prompts, and tools for new writers from the Write Together Hub community.');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Download className="w-4 h-4" />
              Free Downloads
            </div>
            <h1 className="section-title text-5xl mb-6">
              <em className="text-ember-600">Free Resources</em><br /> for New Writers
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Professional-quality writing tools, templates, and checklists — completely free to download and use. No signup required for most resources.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-y border-parchment-100">
        <div className="section-container">
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto text-center">
            <div>
              <p className="font-serif font-bold text-3xl text-ember-600">8</p>
              <p className="text-sm text-ink-400 mt-1">Free Templates</p>
            </div>
            <div className="border-x border-parchment-200">
              <p className="font-serif font-bold text-3xl text-ember-600">100%</p>
              <p className="text-sm text-ink-400 mt-1">Free Forever</p>
            </div>
            <div>
              <p className="font-serif font-bold text-3xl text-ember-600">2,400+</p>
              <p className="text-sm text-ink-400 mt-1">Downloads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white">
        <div className="section-container">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-ember-600 text-white shadow-md'
                    : 'bg-white border border-parchment-200 text-ink-600 hover:border-ember-200 hover:text-ember-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((resource) => (
              <div key={resource.title} className={`card p-6 flex flex-col border-t-4 ${resource.color.split(' ').pop()}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${resource.color.split(' ').slice(0, 2).join(' ')}`}>
                  <resource.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${resource.color} text-xs`}>{resource.category}</span>
                  <span className="text-xs text-ink-400">{resource.pages}</span>
                </div>
                <h3 className="font-serif font-semibold text-ink-900 text-lg mb-2 leading-snug">{resource.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed flex-1">{resource.desc}</p>
                <div className="mt-5 space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 bg-ember-600 hover:bg-ember-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download Free
                  </button>
                  <p className="text-center text-xs text-ink-400">Format: {resource.format}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
