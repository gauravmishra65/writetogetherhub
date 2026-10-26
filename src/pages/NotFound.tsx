import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found | Write Together Hub', 'That page does not exist. Head back to Write Together Hub.');

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ember-100 mb-5">
          <Compass className="w-7 h-7 text-ember-600" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-ink-900 mb-2">Page not found</h1>
        <p className="text-ink-600 mb-8">
          We couldn&apos;t find the page you were looking for. It may have moved, or the address may have a typo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/start-here" className="btn-secondary">
            Start Here guide
          </Link>
        </div>
      </div>
    </div>
  );
}
