import { describe, expect, it } from 'vitest';
import { isDefined } from './index.ts';

describe('isDefined', () => {
  it('drops null and undefined but keeps falsy values', () => {
    const input = [0, null, '', undefined, false, 'bus'];
    expect(input.filter(isDefined)).toEqual([0, '', false, 'bus']);
  });
});
