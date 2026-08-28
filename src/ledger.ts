import type { LogEvent, SetEvent } from './types';
import { isSetEvent } from './types';

export function currentSets(events: LogEvent[]): SetEvent[] {
  const latest = new Map<string, SetEvent>();
  for (const event of events) {
    if (!isSetEvent(event)) continue;
    const old = latest.get(event.setId);
    if (!old || event.at > old.at || (event.at === old.at && event.id > old.id)) {
      latest.set(event.setId, event);
    }
  }
  return [...latest.values()].sort((a, b) => a.at.localeCompare(b.at));
}

export function correctedEventIds(events: LogEvent[]): Set<string> {
  return new Set(
    events
      .filter(isSetEvent)
      .map((event) => event.replacesEventId)
      .filter((id): id is string => Boolean(id)),
  );
}
