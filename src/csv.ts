import type { LogEvent, SetEvent } from './types';
import { isSetEvent } from './types';

export const CSV_HEADERS = [
  'event_id', 'event_type', 'event_at', 'session_id', 'set_id', 'routine_name',
  'exercise_id', 'exercise_name', 'set_number', 'weight_kg', 'reps',
  'replaces_event_id', 'source_event_id', 'imported_at',
] as const;

const quote = (value: unknown): string => {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function eventsToCsv(events: LogEvent[]): string {
  const rows = events.filter(isSetEvent).map((event) => [
    event.id, event.type, event.at, event.sessionId, event.setId, event.routineName,
    event.exerciseId, event.exerciseName, event.setNumber, event.weight, event.reps,
    event.replacesEventId, event.sourceEventId, event.importedAt,
  ].map(quote).join(','));
  return `${CSV_HEADERS.join(',')}\n${rows.join('\n')}${rows.length ? '\n' : ''}`;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (quoted) throw new Error('The CSV has an unclosed quote.');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

function finiteNumber(value: string | undefined, label: string, options: { max?: number; integer?: boolean; step?: number } = {}): number {
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0) throw new Error(`${label} must be zero or greater.`);
  if (options.max !== undefined && result > options.max) throw new Error(`${label} must be ${options.max} or less.`);
  if (options.integer && !Number.isInteger(result)) throw new Error(`${label} must be a whole number.`);
  if (options.step !== undefined && !Number.isInteger(result / options.step)) throw new Error(`${label} must use ${options.step} increments.`);
  return result;
}

export function csvToSetEvents(text: string): SetEvent[] {
  const [headers, ...rows] = parseCsv(text.trim());
  if (!headers) throw new Error('The CSV is empty.');
  const indexes = new Map(headers.map((header, index) => [header.trim(), index]));
  for (const required of ['event_id', 'event_type', 'event_at', 'session_id', 'set_id', 'exercise_name', 'weight_kg', 'reps']) {
    if (!indexes.has(required)) throw new Error(`Missing required column: ${required}.`);
  }
  const value = (row: string[], key: string) => row[indexes.get(key) ?? -1]?.trim() ?? '';
  return rows.filter((row) => row.some(Boolean)).map((row, index) => {
    const type = value(row, 'event_type');
    if (type !== 'set.completed' && type !== 'set.corrected') throw new Error(`Row ${index + 2} has an unsupported event type.`);
    const at = value(row, 'event_at');
    if (!at || Number.isNaN(Date.parse(at))) throw new Error(`Row ${index + 2} has an invalid date.`);
    const id = value(row, 'event_id');
    const sessionId = value(row, 'session_id');
    const setId = value(row, 'set_id');
    const exerciseName = value(row, 'exercise_name');
    if (!id || !sessionId || !setId || !exerciseName) throw new Error(`Row ${index + 2} is missing an identifier or exercise.`);
    return {
      id, type, at, sessionId, setId,
      routineName: value(row, 'routine_name') || 'Imported workout',
      exerciseId: value(row, 'exercise_id') || `imported_${setId}`,
      exerciseName,
      setNumber: finiteNumber(value(row, 'set_number') || '1', 'Set number', { integer: true }),
      weight: finiteNumber(value(row, 'weight_kg'), 'Weight', { max: 2000, step: 0.5 }),
      reps: finiteNumber(value(row, 'reps'), 'Reps', { max: 1000, integer: true }),
      replacesEventId: value(row, 'replaces_event_id') || undefined,
      sourceEventId: value(row, 'source_event_id') || undefined,
      importedAt: value(row, 'imported_at') || undefined,
    };
  });
}
