import { describe, it, expect } from 'vitest';
import { describeDevice, loginState, relativeTime } from '../lib/loginMonitor';

const NOW = new Date('2026-10-26T12:00:00Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('loginState', () => {
  it('never signed in: confirmed vs not confirmed', () => {
    expect(loginState({ last_sign_in_at: null, email_confirmed: true }, NOW)).toBe('never');
    expect(loginState({ last_sign_in_at: null, email_confirmed: false }, NOW)).toBe('unconfirmed');
  });

  it('buckets by how recent the last sign-in is', () => {
    expect(loginState({ last_sign_in_at: ago(2 * HOUR), email_confirmed: true }, NOW)).toBe('active7');
    expect(loginState({ last_sign_in_at: ago(7 * DAY), email_confirmed: true }, NOW)).toBe('active7');
    expect(loginState({ last_sign_in_at: ago(10 * DAY), email_confirmed: true }, NOW)).toBe('active30');
    expect(loginState({ last_sign_in_at: ago(45 * DAY), email_confirmed: true }, NOW)).toBe('inactive');
  });
});

describe('relativeTime', () => {
  it('describes recent times in plain words', () => {
    expect(relativeTime(null, NOW)).toBe('Never');
    expect(relativeTime(ago(10_000), NOW)).toBe('Just now');
    expect(relativeTime(ago(MIN), NOW)).toBe('1 minute ago');
    expect(relativeTime(ago(5 * MIN), NOW)).toBe('5 minutes ago');
    expect(relativeTime(ago(HOUR), NOW)).toBe('1 hour ago');
    expect(relativeTime(ago(3 * HOUR), NOW)).toBe('3 hours ago');
    expect(relativeTime(ago(2 * DAY), NOW)).toBe('2 days ago');
  });

  it('falls back to a date after a month, and never shows negative times', () => {
    expect(relativeTime(ago(90 * DAY), NOW)).toMatch(/\d{4}$/);
    expect(relativeTime(new Date(NOW + 5 * MIN).toISOString(), NOW)).toBe('Just now');
  });
});

describe('describeDevice', () => {
  it('recognises common browsers and systems', () => {
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36')).toBe('Chrome on Windows');
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0 Safari/537.36 Edg/152.0')).toBe('Edge on Windows');
    expect(describeDevice('Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 Chrome/150.0 Mobile Safari/537.36')).toBe('Chrome on Android');
    expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1')).toBe('Safari on iOS');
    expect(describeDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Gecko/20100101 Firefox/130.0')).toBe('Firefox on macOS');
  });

  it('handles missing or unknown values', () => {
    expect(describeDevice(null)).toBe('Unknown device');
    expect(describeDevice('')).toBe('Unknown device');
    expect(describeDevice('SomethingOdd/1.0')).toBe('Unknown device');
  });
});
