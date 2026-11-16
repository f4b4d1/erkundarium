import { describe, expect, it } from 'vitest';
import { addiere } from './platzhalter';

describe('addiere', () => {
  it('addiert zwei Zahlen', () => {
    expect(addiere(2, 3)).toBe(5);
  });
});
