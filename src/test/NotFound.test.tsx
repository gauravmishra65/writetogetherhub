import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';

describe('NotFound page', () => {
  it('shows a friendly message with a way back, instead of a blank page', () => {
    render(
      <MemoryRouter initialEntries={['/this-page-does-not-exist']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /start here guide/i })).toHaveAttribute('href', '/start-here');
    expect(document.title).toMatch(/page not found/i);
  });
});
