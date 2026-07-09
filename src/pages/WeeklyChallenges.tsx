import { Link } from 'react-router-dom';
import { Zap, Clock, Target, Share2, ArrowRight, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const challenges = [
  {
    emoji: '🎭',
    title: 'Write a 300-Word Scene',
    objective: 'Write a complete, compelling scene with a beginning, middle, and end in exactly 300 words.',
    time: '20–30 minutes',
    difficulty: 'Beginner',
    instructions: [
      'Pick one character and one location.',
      'Something must change between the first and last sentence.',
      'Count your words as you go using any word processor.',
      'Share your scene in the forum with the hashtag #SceneChallenge.',
    ],
    sharePrompt: 'Share your scene with: "Here is my 300-word scene challenge entry." Then paste your piece.',
  },
  {
    emoji: '👤',
    title: 'Create a Memorable Character',
    objective: 'Introduce a character so vividly that readers remember them after just one short passage.',
    time: '15–25 minutes',
    difficulty: 'Beginner',
    instructions: [
      'Write 200 words introducing a character.',
      'Include one physical detail, one habit, and one thing they want.',
      'Do not tell us who they are — show us through action and voice.',
      'Share in the forum with the hashtag #CharacterChallenge.',
    ],
    sharePrompt: 'Share with: "Here is my character challenge — meet [name]." Then paste your 200 words.',
  },
  {
    emoji: '💬',
    title: 'Write Emotional Dialogue',
    objective: 'Write a conversation between two characters that conveys emotion without stating it directly.',
    time: '20–30 minutes',
    difficulty: 'Intermediate',
    instructions: [
      'Write a 200-word dialogue between two characters.',
      'The characters must want different things from the conversation.',
      'Do not write "she said sadly" — convey emotion through the words themselves.',
      'Share with the hashtag #DialogueChallenge.',
    ],
    sharePrompt: 'Share with: "Here is my emotional dialogue challenge." Include a brief note about the emotion you aimed for.',
  },
  {
    emoji: '🌍',
    title: 'Describe a Place Using Five Senses',
    objective: 'Paint a location so vividly that the reader feels present using all five senses.',
    time: '15–20 minutes',
    difficulty: 'Beginner',
    instructions: [
      'Choose any location — real or imagined.',
      'Write 150 to 200 words describing it.',
      'Include at least one detail for sight, sound, smell, touch, and taste.',
      'Share with the hashtag #SensoryChallenge.',
    ],
    sharePrompt: 'Share with: "Here is my five senses challenge — I chose [location]." Then paste your description.',
  },
  {
    emoji: '✨',
    title: 'Rewrite a Boring Sentence Beautifully',
    objective: 'Take a flat, lifeless sentence and transform it into something vivid and unforgettable.',
    time: '10–15 minutes',
    difficulty: 'Beginner',
    instructions: [
      'Start with this sentence: "The man walked into the room and sat down."',
      'Rewrite it three ways — each time revealing something different about the character.',
      'Share all three versions with the hashtag #RewriteChallenge.',
      'Comment on at least one other writer\'s version.',
    ],
    sharePrompt: 'Share with: "My three rewrites:" followed by your three versions.',
  },
  {
    emoji: '🚀',
    title: 'Write a Powerful Opening Paragraph',
    objective: 'Create an opening paragraph that makes a reader immediately want to keep reading.',
    time: '20–30 minutes',
    difficulty: 'Intermediate',
    instructions: [
      'Write three to five sentences that open a story.',
      'Introduce conflict, intrigue, or a compelling voice in the very first sentence.',
      'Do not begin with weather, a dream, or a character waking up.',
      'Share with the hashtag #OpeningChallenge.',
    ],
    sharePrompt: 'Share with: "Here is my opening paragraph challenge entry." Then paste your paragraph.',
  },
];

const difficultyColors: Record<string, string> = {
  'Beginner': 'bg-sage-100 text-sage-700',
  'Intermediate': 'bg-parchment-100 text-parchment-700',
};

export default function WeeklyChallenges() {
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [form, setForm] = useState({ author_name: '', entry_text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const openModal = (title: string) => {
    setActiveChallenge(title);
    setForm({ author_name: '', entry_text: '' });
    setError('');
    setSuccess(false);
  };

  const closeModal = () => {
    setActiveChallenge(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('challenge_entries').insert({
      challenge_title: activeChallenge,
      entry_text: form.entry_text,
      author_name: form.author_name,
    });
    setSubmitting(false);
    if (err) {
      setError('Something went wrong. Please try again.');
      return;
    }
    supabase.functions.invoke('notify-new-joiner', {
      body: { source: 'challenge_entry', author_name: form.author_name, challenge_title: activeChallenge, entry_text: form.entry_text },
    });
    setSuccess(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-violet-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              Weekly Writing Exercises
            </div>
            <h1 className="section-title text-5xl mb-6">
              <em className="text-ember-600">Weekly Writing</em><br /> Challenges
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Short, fun, practical writing exercises to sharpen your craft, keep your creative habit alive, and give you something to share with the community.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-y border-parchment-100">
        <div className="section-container">
          <div className="grid sm:grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="w-12 h-12 bg-ember-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-ember-600" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-1">Pick a Challenge</h3>
              <p className="text-ink-500 text-sm">Choose any challenge that interests you.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-1">Write in Short Bursts</h3>
              <p className="text-ink-500 text-sm">Most challenges take 15 to 30 minutes.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-1">Submit Your Entry</h3>
              <p className="text-ink-500 text-sm">Post your entry and get kind community responses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {challenges.map((challenge, i) => (
              <div key={i} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{challenge.emoji}</span>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge text-xs ${difficultyColors[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <Clock className="w-3 h-3" />
                      {challenge.time}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-ink-900 text-xl mb-2">{challenge.title}</h3>
                <p className="text-ember-700 font-medium text-sm mb-4 leading-snug bg-ember-50 rounded-lg p-3 border border-ember-100">
                  <strong>Objective:</strong> {challenge.objective}
                </p>

                <div className="mb-4">
                  <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">Instructions</p>
                  <ol className="space-y-2">
                    {challenge.instructions.map((step, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-ink-600">
                        <span className="text-ember-500 font-bold text-xs mt-0.5">{j + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-auto pt-4 border-t border-parchment-100">
                  <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">How to Share</p>
                  <p className="text-ink-500 text-xs leading-relaxed italic mb-4">{challenge.sharePrompt}</p>
                </div>

                <button onClick={() => openModal(challenge.title)} className="btn-primary text-sm py-2.5">
                  Submit My Entry
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ember-600 text-white">
        <div className="section-container text-center">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to Accept a Challenge?</h2>
          <p className="text-ember-100 text-xl mb-8 max-w-lg mx-auto">
            Join the community to share your challenge entries and get encouraging feedback.
          </p>
          <Link to="/join" className="inline-flex items-center gap-2 bg-white text-ember-700 hover:bg-parchment-50 font-bold px-10 py-4 rounded-lg text-lg shadow-lg transition-all duration-200">
            Join & Start Writing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Entry Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-parchment-100">
              <div>
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-0.5">Challenge Entry</p>
                <h3 className="font-serif font-bold text-ink-900 text-lg">{activeChallenge}</h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-parchment-100 hover:bg-parchment-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-ink-600" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-sage-600" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-ink-900 mb-2">Entry Submitted!</h4>
                  <p className="text-ink-500 text-sm mb-5">Your challenge entry has been saved. Keep writing!</p>
                  <button onClick={closeModal} className="btn-primary text-sm py-2.5 px-6">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="form-label">Your Name / Pen Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="How to credit you"
                      value={form.author_name}
                      onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Your Entry <span className="text-red-400">*</span></label>
                    <textarea
                      className="form-input resize-none"
                      rows={10}
                      placeholder="Paste or write your challenge entry here..."
                      value={form.entry_text}
                      onChange={e => setForm(f => ({ ...f, entry_text: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {submitting ? 'Submitting...' : 'Submit Entry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
