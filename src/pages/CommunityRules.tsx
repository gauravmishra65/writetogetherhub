import { Shield, CheckCircle, AlertTriangle, Heart } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const rules = [
  {
    number: '01',
    title: 'Be Respectful at All Times',
    desc: 'Treat every community member with kindness and courtesy. Disagreements are allowed — disrespect is not. We are all here to grow, not to compete.',
    icon: Heart,
    color: 'border-sage-400',
  },
  {
    number: '02',
    title: 'Give Kind and Useful Feedback',
    desc: 'When reviewing another writer\'s work, use the Feedback Corner method: say what you liked, what confused you, offer one suggestion, and share one encouragement. Harsh, dismissive, or unkind feedback is not permitted.',
    icon: CheckCircle,
    color: 'border-sky-400',
  },
  {
    number: '03',
    title: 'Do Not Copy Another Writer\'s Work',
    desc: 'Every piece of writing shared in this community belongs exclusively to its original author. Do not copy, reuse, republish, or distribute another member\'s writing without their explicit written permission.',
    icon: Shield,
    color: 'border-amber-400',
  },
  {
    number: '04',
    title: 'Share Only Short Excerpts Publicly',
    desc: 'For the protection of your own work and the safety of the community, please share only short excerpts — 200 to 500 words maximum — in public areas of the forum. Do not share full manuscripts.',
    icon: AlertTriangle,
    color: 'border-parchment-400',
  },
  {
    number: '05',
    title: 'No Harassment or Hate Speech',
    desc: 'Any form of harassment, discrimination, hate speech, bullying, or targeted personal attacks will result in immediate removal from the community. This includes comments about gender, race, religion, nationality, ability, or any other personal characteristic.',
    icon: Shield,
    color: 'border-red-400',
  },
  {
    number: '06',
    title: 'No Spam or Forced Promotion',
    desc: 'Do not post unsolicited promotions, advertisements, affiliate links, or self-promotional content in unrelated threads. There are designated spaces for sharing your published work — please use them.',
    icon: AlertTriangle,
    color: 'border-orange-400',
  },
  {
    number: '07',
    title: 'Writers Retain Full Ownership',
    desc: 'Sharing your writing in Write Together Hub does not transfer any rights to the platform or to other community members. Your words belong to you. We will never claim ownership of your creative work.',
    icon: CheckCircle,
    color: 'border-violet-400',
  },
  {
    number: '08',
    title: 'Plagiarism Leads to Removal',
    desc: 'Submitting another writer\'s work as your own — in any form — is a serious violation of community trust. Confirmed plagiarism results in permanent removal from the community with no appeal.',
    icon: Shield,
    color: 'border-rose-400',
  },
];

export default function CommunityRules() {
  useDocumentTitle('Community Rules | Write Together Hub', 'Read the community rules that make Write Together Hub a safe, welcoming space for new writers to learn and share.');
  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              Community Standards
            </div>
            <h1 className="section-title text-5xl mb-6">
              <em className="text-ember-600">Community Rules</em>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              These rules are what make Write Together Hub a safe, kind, and genuinely useful community for new writers. By joining, you agree to uphold these values.
            </p>
          </div>
        </div>
      </section>

      {/* Core Statement */}
      <section className="py-12 bg-ink-900 text-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-serif text-2xl text-parchment-200 leading-relaxed italic">
              "We build this community together. Every kind word, every helpful comment, every piece of encouragement makes Write Together Hub what it is."
            </p>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto space-y-6">
            {rules.map((rule) => (
              <div key={rule.number} className={`rounded-xl bg-white border border-parchment-100 border-l-4 ${rule.color} p-6 shadow-sm`}>
                <div className="flex items-start gap-5">
                  <div className="text-ink-300 font-serif font-bold text-3xl leading-none flex-shrink-0">{rule.number}</div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-ink-900 text-xl mb-3">{rule.title}</h3>
                    <p className="text-ink-600 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copyright Notice */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
                <h3 className="font-serif font-bold text-amber-900 text-xl">Copyright & Safety Notice</h3>
              </div>
              <p className="text-amber-800 leading-relaxed mb-4">
                <strong>All writing shared by members belongs exclusively to the original writer.</strong> Do not copy, reuse, publish, distribute, translate, adapt, or quote another writer's work without their explicit written permission.
              </p>
              <p className="text-amber-700 leading-relaxed text-sm">
                Write Together Hub does not claim any ownership or license over writing shared by community members. We are a sharing and learning platform, not a publisher. Members retain all intellectual property rights to their own creative work at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enforcement */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title mb-8">Rule Enforcement</h2>
            <div className="space-y-4">
              {[
                { level: 'First Incident', action: 'A private warning from a community moderator explaining the violation and how to correct it.', color: 'bg-sky-50 border-sky-200' },
                { level: 'Second Incident', action: 'A temporary suspension from posting in the community while the moderator reviews the pattern of behaviour.', color: 'bg-amber-50 border-amber-200' },
                { level: 'Severe Violations', action: 'Immediate permanent removal without warning. This includes harassment, plagiarism, and hate speech.', color: 'bg-red-50 border-red-200' },
              ].map((item) => (
                <div key={item.level} className={`rounded-xl p-5 border ${item.color}`}>
                  <p className="font-semibold text-ink-900 mb-1">{item.level}</p>
                  <p className="text-ink-600 text-sm leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-parchment-50 rounded-xl border border-parchment-100">
              <p className="text-ink-600 text-sm leading-relaxed">
                <strong>Report Violations:</strong> If you witness a rule violation, please contact us through the Contact page. All reports are reviewed confidentially by our moderation team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-parchment-100">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-ink-600 text-sm leading-relaxed">
              <strong>Disclaimer:</strong> Write Together Hub offers peer learning and general writing guidance. It does not provide legal, copyright, or professional publishing advice. Members are responsible for protecting their own intellectual property and seeking professional legal advice where required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
