import { isoNow, localId } from './id';
import type { ActiveWorkout, LogEvent, Routine, SetEvent } from './types';

const DB_NAME = 'durable-set-log';
const DB_VERSION = 1;
const ROUTINES = 'routines';
const EVENTS = 'events';
const META = 'meta';

interface MetaRecord { key: string; value: unknown }

let databasePromise: Promise<IDBDatabase> | undefined;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('The device database could not be read.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('The device database change was cancelled.'));
    transaction.onerror = () => reject(transaction.error ?? new Error('The device database could not be changed.'));
  });
}

export function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('This browser does not provide IndexedDB. Your sets cannot be saved safely here.'));
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ROUTINES)) db.createObjectStore(ROUTINES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(EVENTS)) {
        const store = db.createObjectStore(EVENTS, { keyPath: 'id' });
        store.createIndex('at', 'at');
        store.createIndex('sessionId', 'sessionId');
        store.createIndex('setId', 'setId');
      }
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: 'key' });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error ?? new Error('The device database could not be opened.'));
    request.onblocked = () => reject(new Error('Close other open copies of Durable Set Log, then reload.'));
  });
  return databasePromise;
}

export async function listRoutines(): Promise<Routine[]> {
  const db = await openDatabase();
  const routines = await requestResult(db.transaction(ROUTINES).objectStore(ROUTINES).getAll() as IDBRequest<Routine[]>);
  return routines.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(ROUTINES, 'readwrite');
  tx.objectStore(ROUTINES).put(routine);
  await transactionDone(tx);
}

export async function removeRoutine(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(ROUTINES, 'readwrite');
  tx.objectStore(ROUTINES).delete(id);
  await transactionDone(tx);
}

export async function listEvents(): Promise<LogEvent[]> {
  const db = await openDatabase();
  const events = await requestResult(db.transaction(EVENTS).objectStore(EVENTS).getAll() as IDBRequest<LogEvent[]>);
  return events.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
}

export async function appendEvent(event: LogEvent): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(EVENTS, 'readwrite');
  tx.objectStore(EVENTS).add(event);
  await transactionDone(tx);
}

export async function startWorkout(routine: Routine): Promise<ActiveWorkout> {
  const db = await openDatabase();
  const at = isoNow();
  const active: ActiveWorkout = {
    sessionId: localId('session'), routineId: routine.id, routineName: routine.name,
    exercises: structuredClone(routine.exercises), startedAt: at,
  };
  const event: LogEvent = {
    id: localId('event'), type: 'workout.started', at, sessionId: active.sessionId,
    routineId: routine.id, routineName: routine.name, exercises: active.exercises,
  };
  const tx = db.transaction([EVENTS, META], 'readwrite');
  tx.objectStore(EVENTS).add(event);
  tx.objectStore(META).put({ key: 'activeWorkout', value: active } satisfies MetaRecord);
  await transactionDone(tx);
  return active;
}

export async function finishWorkout(active: ActiveWorkout): Promise<void> {
  const db = await openDatabase();
  const event: LogEvent = { id: localId('event'), type: 'workout.finished', at: isoNow(), sessionId: active.sessionId };
  const tx = db.transaction([EVENTS, META], 'readwrite');
  tx.objectStore(EVENTS).add(event);
  tx.objectStore(META).delete('activeWorkout');
  await transactionDone(tx);
}

export async function getActiveWorkout(): Promise<ActiveWorkout | undefined> {
  const db = await openDatabase();
  const item = await requestResult(db.transaction(META).objectStore(META).get('activeWorkout') as IDBRequest<MetaRecord | undefined>);
  return item?.value as ActiveWorkout | undefined;
}

export interface Backup { format: 'durable-set-log-backup'; version: 1; exportedAt: string; routines: Routine[]; events: LogEvent[] }

export async function createBackup(): Promise<Backup> {
  const [routines, events] = await Promise.all([listRoutines(), listEvents()]);
  return { format: 'durable-set-log-backup', version: 1, exportedAt: isoNow(), routines, events };
}

export async function importEvents(incoming: SetEvent[]): Promise<{ added: number; skipped: number; renamed: number }> {
  const db = await openDatabase();
  const known = await listEvents();
  let added = 0; let skipped = 0; let renamed = 0;
  for (const original of incoming) {
    const existing = known.find((event) => event.id === original.id);
    if (existing && JSON.stringify(existing) === JSON.stringify(original)) { skipped += 1; continue; }
    const priorCollisionImport = known.find((event) =>
      event.type === original.type && isImportedSet(event) && event.sourceEventId === original.id &&
      event.at === original.at && event.setId === original.setId && event.weight === original.weight && event.reps === original.reps,
    );
    if (priorCollisionImport) { skipped += 1; continue; }
    const event = existing ? { ...original, id: localId('event'), sourceEventId: original.id, importedAt: isoNow() } : original;
    if (existing) renamed += 1;
    await appendEvent(event);
    known.push(event);
    added += 1;
  }
  return { added, skipped, renamed };
}

function isImportedSet(event: LogEvent): event is SetEvent {
  return event.type === 'set.completed' || event.type === 'set.corrected';
}

export async function restoreBackup(backup: Backup): Promise<{ routines: number; events: number }> {
  if (backup.format !== 'durable-set-log-backup' || backup.version !== 1 || !Array.isArray(backup.routines) || !Array.isArray(backup.events)) {
    throw new Error('This is not a Durable Set Log backup.');
  }
  const db = await openDatabase();
  let routineCount = 0; let eventCount = 0;
  for (const routine of backup.routines) { await saveRoutine(routine); routineCount += 1; }
  for (const original of backup.events) {
    const existing = await requestResult(db.transaction(EVENTS).objectStore(EVENTS).get(original.id) as IDBRequest<LogEvent | undefined>);
    if (existing) continue;
    await appendEvent(original); eventCount += 1;
  }
  return { routines: routineCount, events: eventCount };
}
