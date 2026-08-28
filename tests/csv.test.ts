import { describe, expect, it } from 'vitest';
import { csvToSetEvents, eventsToCsv, parseCsv } from '../src/csv';
import { correctedEventIds, currentSets } from '../src/ledger';
import type { SetEvent } from '../src/types';

const original: SetEvent = {
  id: 'event-a', type: 'set.completed', at: '2026-08-28T08:00:00.000Z',
  sessionId: 'session-a', setId: 'set-a', routineName: 'A, B day',
  exerciseId: 'exercise-a', exerciseName: 'Press "strict"', setNumber: 1,
  weight: 42.5, reps: 8,
};

describe('CSV ownership format', () => {
  it('round-trips quotes, commas, and decimals', () => {
    const [restored] = csvToSetEvents(eventsToCsv([original]));
    expect(restored).toEqual(original);
  });

  it('parses quoted line breaks without splitting a row', () => {
    expect(parseCsv('a,b\n"line\none",2\n')).toEqual([['a', 'b'], ['line\none', '2']]);
  });

  it('rejects a malformed or dangerous numeric record', () => {
    const csv = eventsToCsv([original]).replace('42.5', '-1');
    expect(() => csvToSetEvents(csv)).toThrow('Weight must be zero or greater');
  });
});

describe('append-only corrections', () => {
  it('folds to the correction and retains the corrected event marker', () => {
    const correction: SetEvent = {
      ...original, id: 'event-b', type: 'set.corrected', at: '2026-08-28T08:01:00.000Z',
      weight: 45, replacesEventId: original.id,
    };
    expect(currentSets([original, correction])).toEqual([correction]);
    expect(correctedEventIds([original, correction])).toEqual(new Set(['event-a']));
  });
});
