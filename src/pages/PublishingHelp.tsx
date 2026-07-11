import { Link } from 'react-router-dom';
import { BookOpen, Edit3, Globe, Award, Cpu, Layout, Image, FileText, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

const sections = [
  {
    icon: Edit3,
    id: 'finish-draft',
    title: 'How to Finish Your First Draft',
    color: 'bg-sky-50 text-sky-600',
    tips: [
      'Write every day, even if it is only 200 words. Momentum matters more than perfection.',
      'Do not go back and edit chapters you have already written. Keep moving forward.',
      'Allow your draft to be messy. First drafts are not meant to be published — they are meant to be finished.',
      'Set a word count goal. Most novels are 70,000 to 100,000 words. Short stories are 1,000 to 10,000.',
      'Celebrate your chapter milestones. Every finished chapter is real progress.',
    ],
  },
  {
    icon: BookOpen,
    id: 'editing',
    title: 'How to Edit Your Manuscript',
    color: 'bg-sage-50 text-sage-600',
    tips: [
      'Wait at least one week after finishing your draft before you begin editing.',
      'Do a structural edit first — is the story working? Are characters consistent?',
      'Then do a line edit — read every sentence for clarity, rhythm, and word choice.',
      'Finally, do a proofreading pass — catch grammar and spelling errors.',
      'Use our free Editing Checklist to guide you through each stage.',
    ],
  },
  {
    icon: Globe,
    id: 'self-pub',
    title: 'Self-Publishing Basics',
    color: 'bg-ember-50 text-ember-600',
    tips: [
      'Self-publishing means you publish your book directly, without a traditional publisher.',
      'You keep full creative control and a larger percentage of royalties.',
      'You are responsible for editing, cover design, formatting, and marketing.',
      'Platforms like Amazon KDP, IngramSpark, and Draft2Digital are popular choices.',
      'Self-publishing is a real, legitimate path that many successful authors choose.',
    ],
  },
  {
    icon: Award,
    id: 'trad-pub',
    title: 'Traditional Publishing Basics',
    color: 'bg-parchment-100 text-parchment-700',
    tips: [
      'Traditional publishing means a publisher buys the rights to your book and publishes it for you.',
      'You first need a literary agent who submits your work to publishers on your behalf.',
      'The query process involves sending a short summary (query letter) to literary agents.',
      'Traditional publishing is competitive and can take one to three years to secure.',
      'Publishers pay you an advance and royalties, and cover editing, design, and distribution costs.',
    ],
  },
  {
    icon: Cpu,
    id: 'kdp',
    title: 'Amazon KDP Basics',
    color: 'bg-rose-50 text-rose-600',
    tips: [
      'Amazon KDP (Kindle Direct Publishing) is the most popular self-publishing platform in the world.',
      'You can publish both ebooks and print-on-demand paperbacks through KDP.',
      'KDP is free to use — you earn royalties from every sale.',
      'You will need a formatted manuscript and a book cover before uploading.',
      'KDP Select allows exclusive listing on Amazon in exchange for enrollment in Kindle Unlimited.',
    ],
  },
  {
    icon: Layout,
    id: 'formatting',
    title: 'Book Formatting Basics',
    color: 'bg-violet-50 text-violet-600',
    tips: [
      'Ebook formatting is simpler than print — most platforms accept clean Word documents or ePub files.',
      'For print, your interior must have correct margins, font sizes, and line spacing for the chosen trim size.',
      'Tools like Atticus, Vellum, and Reedsy Book Editor make formatting accessible for new authors.',
      'Download our free formatting checklist for specific settings needed for Amazon KDP.',
      'Do not use complex formatting in your Word document — headings, scene breaks, and body text are usually enough.',
    ],
  },
  {
    icon: Image,
    id: 'cover',
    title: 'Book Cover Basics',
    color: 'bg-teal-50 text-teal-600',
    tips: [
      'Readers absolutely do judge books by their covers. A professional cover matters enormously.',
      'Your cover must work at thumbnail size — it will be seen at a very small scale in online bookstores.',
      'Use a designer on platforms like Reedsy, 99Designs, or Fiverr if you are not a designer yourself.',
      'Research the visual conventions of your genre — romance, thriller, and fantasy all have distinct cover styles.',
      'Your title and author name must be legible at thumbnail size.',
    ],
  },
  {
    icon: FileText,
    id: 'blurb',
    title: 'Book Description & Blurb Writing',
    color: 'bg-amber-50 text-amber-700',
    tips: [
      'Your book description is your primary sales tool. Spend time getting it right.',
      'Open with a hook that immediately draws the reader in — a question, a statement, or a character scenario.',
      'Describe the core conflict without revealing the ending.',
      'Keep it between 150 and 250 words for most fiction books.',
      'End with a call to action or a tantalising tease that makes the reader want to open page one.',
    ],
  },
  {
    icon: AlertTriangle,
    id: 'scams',
    title: 'How to Avoid Publishing Scams',
    color: 'bg-red-50 text-red-600',
    tips: [
      'Legitimate literary agents and publishers never charge writers upfront fees.',
      'If someone asks you to pay to publish your book, it is almost certainly a vanity press or a scam.',
      'Research every publisher and agent on sites like Predators & Editors and QueryTracker.',
      'Be cautious of companies promising guaranteed bestseller status, large print runs, or instant success.',
      'Traditional royalties flow FROM the publisher TO the author — not the other way around.',
    ],
  },
];

import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function PublishingHelp() {
  useDocumentTitle('Publishing Help | Write Together Hub', 'Resources and guidance on self-publishing, traditional publishing, Amazon KDP, query letters, and book formatting for new writers.');
  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              Publishing Guidance
            </div>
            <h1 className="section-title text-5xl mb-6">
              <em className="text-ember-600">Publishing Help</em><br /> for New Writers
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Plain-language guidance on everything from finishing your draft to placing your book in readers' hands. No jargon. No confusion.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-xs font-medium text-ink-600 hover:text-ember-600 bg-white border border-parchment-200 hover:border-ember-200 px-3 py-1.5 rounded-full transition-colors">
                  {s.title.split(' ').slice(0, 3).join(' ')}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 bg-amber-50 border-y border-amber-100">
        <div className="section-container">
          <div className="max-w-2xl mx-auto flex items-start gap-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Disclaimer:</strong> Write Together Hub offers peer learning and general writing guidance. This page does not provide legal, copyright, or professional publishing advice. Always conduct your own research before making publishing decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="section-padding bg-white">
        <div className="section-container space-y-14">
          {sections.map((section, i) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-0.5">Step {i + 1}</div>
                  <h2 className="font-serif font-bold text-2xl text-ink-900">{section.title}</h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {section.tips.map((tip, j) => (
                  <div key={j} className="flex gap-3 bg-parchment-50 rounded-xl p-4 border border-parchment-100">
                    <CheckCircle className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <p className="text-ink-700 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ink-900 text-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="section-title text-white mb-4">Ready to Start Your Publishing Journey?</h2>
              <p className="text-ink-300 leading-relaxed">
                Download our free Self-Publishing Checklist and Book Launch Checklist to guide you through every step.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/free-resources" className="btn-primary">
                Get Free Checklists
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/join" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-lg transition-all duration-200">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
