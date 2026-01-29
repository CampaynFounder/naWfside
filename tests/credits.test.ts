import { describe, it, expect } from 'vitest';
import { calculatePublishingSplit } from '../lib/publishing';

describe('publishing split', () => {
  it('calculates platform and producer share', () => {
    const split = calculatePublishingSplit(20);
    expect(split.platform).toBe(20);
    expect(split.producer).toBe(80);
  });
});

