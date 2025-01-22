import { truncateString } from '../utils/truncate';

describe('truncateString', () => {
  it('should return the original string if its length is 10 or less', () => {
    expect(truncateString('short')).toBe('short');
    expect(truncateString('1234567890')).toBe('1234567890');
  });

  it('should truncate the string and add ellipsis if its length exceeds 10', () => {
    expect(truncateString('12345678901')).toBe('12345...78901');
    expect(truncateString('abcdefghijk')).toBe('abcde...ghijk');
    expect(truncateString('This is a long string')).toBe('This ...tring');
  });

  it('should handle empty strings', () => {
    expect(truncateString('')).toBe('');
  });

  it('should handle strings with exactly 11 characters', () => {
    expect(truncateString('12345678901')).toBe('12345...78901');
  });

  it('should handle strings with more than 11 characters', () => {
    expect(truncateString('123456789012')).toBe('12345...89012');
  });
});
