import './styles.css';
import {
  appendEvent, createBackup, finishWorkout, getActiveWorkout, importEvents,
  listEvents, listRoutines, removeRoutine, restoreBackup, saveRoutine, startWorkout,
  type Backup,
} from './db';
import { csvToSetEvents, eventsToCsv } from './csv';
import { isoNow, localId } from './id';
import { correctedEventIds, currentSets } from './ledger';
import { cachedLicenseState, captureReturnedLicense, CHECKOUT_URL, storeLicense, verifyLicense, type LicenseState } from './license';
import type { ActiveWorkout, Exercise, LogEvent, Routine, SetEvent } from './types';
import { isSetEvent } from './types';

type View = 'workout' | 'routines' | 'ledger' | 'more';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) throw new Error('App mount point is missing.');
const app: HTMLDivElement = mount;

const state: {
  view: View; routines: Routine[]; events: LogEvent[]; active?: ActiveWorkout;
  license: LicenseState; busy: boolean; flash?: { tone: 'success' | 'error' | 'info'; message: string };
  dbError?: string; updateWorker?: ServiceWorker; installPrompt?: BeforeInstallPromptEvent;
} = {
  view: 'workout', routines: [], events: [], license: { unlocked: false, checking: false }, busy: false,
};
let updateRequested = false;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char] ?? char));

const formatDate = (iso: string): string => new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
}).format(new Date(iso));

const formatNumber = (value: number): string => Number.isInteger(value) ? String(value) : value.toFixed(1);

function icon(name: 'workout' | 'routines' | 'ledger' | 'more' | 'check' | 'lock'): string {
  const paths = {
    workout: '<path d="M3 9v6m4-8v10m10-10v10m4-8v6M7 12h10"/>',
    routines: '<path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h4"/>',
    ledger: '<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h4"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    check: '<path d="m4 13 5 5L20 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function navButton(view: View, label: string, glyph: 'workout' | 'routines' | 'ledger' | 'more'): string {
  return `<button class="nav-button${state.view === view ? ' is-active' : ''}" data-action="view" data-view="${view}" ${state.view === view ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></button>`;
}

function render(): void {
  const online = navigator.onLine;
  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#workout" data-action="view" data-view="workout" aria-label="Durable Set Log, workout">
        <span class="brand-mark" aria-hidden="true">✓</span>
        <h1>Durable Set Log</h1>
      </a>
      <div class="status-stamp ${online ? '' : 'is-offline'}" role="status">
        <span aria-hidden="true">${online ? '●' : '○'}</span> ${online ? 'On device' : 'Offline · still saving'}
      </div>
    </header>
    <nav class="bottom-nav" aria-label="Primary navigation">
      ${navButton('workout', 'Workout', 'workout')}
      ${navButton('routines', 'Routines', 'routines')}
      ${navButton('ledger', 'Ledger', 'ledger')}
      ${navButton('more', 'More', 'more')}
    </nav>
    <main id="main" tabindex="-1">
      ${state.flash ? `<div class="flash flash-${state.flash.tone}" role="status">${escapeHtml(state.flash.message)}<button data-action="dismiss-flash" aria-label="Dismiss message">×</button></div>` : ''}
      ${state.dbError ? errorView() : currentView()}
    </main>
    <dialog id="routine-dialog" class="ink-dialog" aria-labelledby="routine-dialog-title"></dialog>
    <dialog id="correction-dialog" class="ink-dialog" aria-labelledby="correction-dialog-title"></dialog>
    ${state.updateWorker ? `<aside class="update-toast" role="status"><div><strong>Fresh ink is ready.</strong><span>Update without losing your device ledger.</span></div><button class="button button-small" data-action="apply-update">Update</button></aside>` : ''}
  `;
}

function errorView(): string {
  return `<section class="error-sheet" aria-labelledby="storage-error"><p class="eyebrow">Storage check</p><h2 id="storage-error">This device ledger could not open</h2><p>${escapeHtml(state.dbError)}</p><p>Do not record a set until storage is available. Try leaving private browsing, freeing device storage, or closing other copies of the app.</p><button class="button" data-action="reload">Reload and retry</button></section>`;
}

function currentView(): string {
  if (state.view === 'workout') return workoutView();
  if (state.view === 'routines') return routinesView();
  if (state.view === 'ledger') return ledgerView();
  return moreView();
}

function workoutView(): string {
  if (!state.active) {
    return `<section class="workout-empty">
      <div class="hero-copy">
        <p class="eyebrow">Append-only · offline-first</p>
        <h2>Your sets should outlast a reload.</h2>
        <p>Tap complete and the set is written straight to this device. Signal optional. Corrections keep the original visible.</p>
        ${state.routines.length ? `<div class="start-list" aria-label="Start a routine">${state.routines.map((routine) => `<button class="start-routine" data-action="start" data-id="${escapeHtml(routine.id)}"><span><strong>${escapeHtml(routine.name)}</strong><small>${routine.exercises.length} exercise${routine.exercises.length === 1 ? '' : 's'}</small></span><span aria-hidden="true">Start →</span></button>`).join('')}</div>` : `<button class="button button-primary" data-action="new-routine">Make your first routine</button>`}
      </div>
      <figure class="hero-art"><picture><source type="image/avif" srcset="/art/ledger-stamp-640.avif 640w, /art/ledger-stamp-960.avif 960w" sizes="(max-width: 760px) 100vw, 48vw"><img src="/art/ledger-stamp-640.webp" srcset="/art/ledger-stamp-640.webp 640w, /art/ledger-stamp-960.webp 960w" sizes="(max-width: 760px) 100vw, 48vw" width="960" height="640" alt="Risograph collage of a hand stamping a workout ledger beside a weight plate" decoding="async" fetchpriority="high"></picture><figcaption>Stamped in, not synced away.</figcaption></figure>
      <div class="proof-strip"><span>${icon('check')} Written before confirmation</span><span>${icon('check')} Reload-safe IndexedDB</span><span>${icon('check')} CSV stays yours</span></div>
    </section>`;
  }
  const sessionSets = currentSets(state.events).filter((event) => event.sessionId === state.active?.sessionId);
  const totalTarget = state.active.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);
  return `<section class="live-workout" aria-labelledby="live-heading">
    <div class="workout-heading"><div><p class="eyebrow">In progress · since ${formatDate(state.active.startedAt)}</p><h2 id="live-heading">${escapeHtml(state.active.routineName)}</h2></div><div class="set-count"><strong>${sessionSets.length}</strong><span>of ${totalTarget} planned</span></div></div>
    <div class="durability-note" role="note">${icon('check')} Every “Complete set” waits for a successful device write before it confirms.</div>
    <div class="exercise-stack">${state.active.exercises.map((exercise) => exerciseLogger(exercise, sessionSets)).join('')}</div>
    <button class="button button-finish" data-action="finish" ${state.busy ? 'disabled' : ''}>Finish workout</button>
  </section>`;
}

function exerciseLogger(exercise: Exercise, sessionSets: SetEvent[]): string {
  const sets = sessionSets.filter((event) => event.exerciseId === exercise.id);
  const last = sets.at(-1);
  const weight = last?.weight ?? exercise.defaultWeight;
  const reps = last?.reps ?? exercise.defaultReps;
  const next = sets.length + 1;
  const done = sets.length >= exercise.targetSets;
  return `<article class="exercise-sheet" data-exercise="${escapeHtml(exercise.id)}">
    <div class="exercise-title"><div><p class="set-kicker">${done ? 'Plan complete · add another if needed' : `Set ${next} of ${exercise.targetSets}`}</p><h3>${escapeHtml(exercise.name)}</h3></div><ol class="set-dots" aria-label="${sets.length} completed of ${exercise.targetSets} planned">${Array.from({ length: Math.max(exercise.targetSets, sets.length) }, (_, index) => `<li class="${index < sets.length ? 'done' : ''}">${index < sets.length ? '✓' : index + 1}</li>`).join('')}</ol></div>
    <div class="load-fields">
      <label><span>Weight <small>kg</small></span><input data-field="weight" type="number" inputmode="decimal" min="0" max="2000" step="0.5" value="${weight}" aria-label="${escapeHtml(exercise.name)} weight in kilograms"></label>
      <span class="multiply" aria-hidden="true">×</span>
      <label><span>Reps</span><input data-field="reps" type="number" inputmode="numeric" min="0" max="1000" step="1" value="${reps}" aria-label="${escapeHtml(exercise.name)} repetitions"></label>
    </div>
    <button class="complete-set" data-action="complete" data-id="${escapeHtml(exercise.id)}" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Writing…' : `Complete set ${next}`}<span aria-hidden="true">↓ ledger</span></button>
    ${last ? `<p class="last-set">Last saved: ${formatNumber(last.weight)} kg × ${last.reps} · ${formatDate(last.at)}</p>` : '<p class="last-set">No set written yet.</p>'}
  </article>`;
}

function routinesView(): string {
  const canAdd = state.license.unlocked || state.routines.length < 2;
  return `<section class="page-section" aria-labelledby="routines-heading">
    <div class="section-heading"><div><p class="eyebrow">Reusable cards</p><h2 id="routines-heading">Routines</h2><p>Defaults are a starting point. Adjust weight or reps during the workout.</p></div><button class="button button-primary" data-action="new-routine" ${canAdd ? '' : 'disabled aria-describedby="routine-limit"'}>New routine</button></div>
    ${!canAdd ? `<p id="routine-limit" class="limit-note">Free keeps two routines. The one-time unlock removes this limit; your ledger and exports always stay free.</p>` : ''}
    ${state.routines.length ? `<div class="routine-grid">${state.routines.map((routine) => `<article class="routine-card"><div><h3>${escapeHtml(routine.name)}</h3><ol>${routine.exercises.map((exercise) => `<li><span>${escapeHtml(exercise.name)}</span><small>${exercise.targetSets} sets · ${formatNumber(exercise.defaultWeight)} kg × ${exercise.defaultReps}</small></li>`).join('')}</ol></div><div class="card-actions"><button class="text-button" data-action="edit-routine" data-id="${escapeHtml(routine.id)}">Edit</button><button class="text-button danger" data-action="delete-routine" data-id="${escapeHtml(routine.id)}">Delete</button><button class="button button-small" data-action="start" data-id="${escapeHtml(routine.id)}">Start</button></div></article>`).join('')}</div>` : emptyPanel('No routines on this card yet', 'Add the exercises you repeat. Your first workout will be ready in about a minute.', 'Make a routine', 'new-routine')}
  </section>`;
}

function ledgerView(): string {
  const setEvents = state.events.filter(isSetEvent).slice().reverse();
  const corrected = correctedEventIds(state.events);
  return `<section class="page-section" aria-labelledby="ledger-heading">
    <div class="section-heading"><div><p class="eyebrow">Immutable history</p><h2 id="ledger-heading">Set ledger</h2><p>${setEvents.length} recorded event${setEvents.length === 1 ? '' : 's'}. Corrections are new rows; earlier values remain inspectable.</p></div><button class="button button-small" data-action="export-csv" ${setEvents.length ? '' : 'disabled'}>Export CSV</button></div>
    ${setEvents.length ? `<ol class="ledger-list">${setEvents.map((event) => `<li class="ledger-row ${corrected.has(event.id) ? 'is-corrected' : ''}"><div class="ledger-date"><time datetime="${escapeHtml(event.at)}">${formatDate(event.at)}</time><span>${event.type === 'set.corrected' ? 'Correction' : corrected.has(event.id) ? 'Corrected' : 'Original'}</span></div><div class="ledger-main"><strong>${escapeHtml(event.exerciseName)}</strong><span>Set ${event.setNumber} · ${formatNumber(event.weight)} kg × ${event.reps}</span><small>${escapeHtml(event.routineName)}</small></div><button class="text-button" data-action="correct" data-id="${escapeHtml(event.id)}">${corrected.has(event.id) ? 'Correct again' : 'Correct'}</button></li>`).join('')}</ol>` : emptyPanel('The ledger is blank', 'Complete a set during a workout. It will appear here only after the device write succeeds.', state.routines.length ? 'Start a workout' : 'Make a routine', state.routines.length ? 'go-workout' : 'new-routine')}
  </section>`;
}

function moreView(): string {
  const current = currentSets(state.events);
  const volume = current.reduce((sum, event) => sum + event.weight * event.reps, 0);
  const sessions = new Set(current.map((event) => event.sessionId)).size;
  const licenseNotice = state.license.token && !state.license.unlocked && state.license.reason && state.license.reason !== 'offline'
    ? `<p class="license-warning">License no longer active (${escapeHtml(state.license.reason)}). <a href="${CHECKOUT_URL}">Get a new license</a>.</p>` : '';
  return `<section class="page-section" aria-labelledby="more-heading">
    <div class="section-heading"><div><p class="eyebrow">Ownership &amp; recovery</p><h2 id="more-heading">More</h2><p>Back up, restore, install, and inspect what the app keeps.</p></div></div>
    <div class="more-grid">
      <section class="utility-sheet" aria-labelledby="data-title"><h3 id="data-title">Your data, portable</h3><p>CSV moves set history between tools. A JSON backup also includes reusable routines.</p><div class="button-row"><button class="button" data-action="export-csv">Export CSV</button><button class="button" data-action="export-json">Back up JSON</button></div><div class="import-row"><label class="file-button">Import CSV<input id="csv-import" type="file" accept=".csv,text/csv" data-import="csv"></label><label class="file-button">Restore JSON<input id="json-import" type="file" accept=".json,application/json" data-import="json"></label></div><p class="fine-print">Imports merge by conflict-free event ID. Existing records are never overwritten.</p></section>
      <section class="utility-sheet paid-sheet" aria-labelledby="paid-title"><div class="paid-head"><span class="ink-seal">ONE TIME</span><h3 id="paid-title">Keep the whole rack</h3></div>${licenseNotice}${state.license.unlocked ? `<p class="unlocked">${icon('check')} Unlimited routines and training summary unlocked on this device.</p><dl class="summary"><div><dt>Workouts logged</dt><dd>${sessions}</dd></div><div><dt>Current sets</dt><dd>${current.length}</dd></div><div><dt>Training volume</dt><dd>${formatNumber(volume)} kg</dd></div></dl>` : `<p>Durable logging, correction history, CSV export, and two routines are free. Pay <strong>US$14 once</strong> for unlimited routines and an on-device training summary.</p><a class="button button-primary" href="${CHECKOUT_URL}">Buy once · $14</a>`}<details><summary>Restore a purchase</summary><form id="license-form"><label for="license-token">License token</label><input id="license-token" name="license" autocomplete="off" spellcheck="false" required><button class="button button-small" type="submit">Verify license</button></form><p class="fine-print">Sociobot/Dodo is the merchant of record. Refunds are handled there and revoke the license.</p></details></section>
      <section class="utility-sheet" aria-labelledby="install-title"><h3 id="install-title">Pocket-ready</h3><p>${navigator.onLine ? 'Install the app for a home-screen launch and cached shell.' : 'You are offline. Set logging still writes to this device.'}</p>${state.installPrompt ? '<button class="button" data-action="install">Install app</button>' : '<p class="fine-print">Use your browser’s “Add to Home Screen” command to install.</p>'}<p class="durable-status">${icon('check')} Local database opened successfully</p></section>
      <section class="utility-sheet" aria-labelledby="limits-title"><h3 id="limits-title">Plain limits</h3><p>Data lives in this browser profile. Clearing site data can erase it, so make a backup. There is no account or cloud sync.</p><p><strong>Not medical guidance.</strong> Choose loads and exercises appropriate for you; consult a qualified professional when needed.</p><p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p></section>
    </div>
  </section>`;
}

function emptyPanel(title: string, body: string, actionLabel: string, action: string): string {
  return `<div class="empty-panel"><span class="empty-stamp" aria-hidden="true">0</span><h3>${title}</h3><p>${body}</p><button class="button" data-action="${action}">${actionLabel}</button></div>`;
}

function showRoutineDialog(routine?: Routine): void {
  const dialog = document.querySelector<HTMLDialogElement>('#routine-dialog');
  if (!dialog) return;
  const exercises = routine?.exercises ?? [{ id: localId('exercise'), name: '', targetSets: 3, defaultWeight: 20, defaultReps: 8 }];
  dialog.innerHTML = `<form id="routine-form" method="dialog" data-id="${escapeHtml(routine?.id ?? '')}">
    <div class="dialog-heading"><div><p class="eyebrow">Reusable card</p><h2 id="routine-dialog-title">${routine ? 'Edit routine' : 'New routine'}</h2></div><button class="icon-button" type="button" data-action="close-dialog" aria-label="Close routine form">×</button></div>
    <label for="routine-name">Routine name</label><input id="routine-name" name="name" maxlength="60" value="${escapeHtml(routine?.name ?? '')}" required autocomplete="off">
    <fieldset><legend>Exercises</legend><div id="exercise-fields">${exercises.map(exerciseFields).join('')}</div><button class="text-button add-exercise" type="button" data-action="add-exercise">+ Add exercise</button></fieldset>
    <p id="routine-form-error" class="form-error" role="alert"></p><div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Cancel</button><button class="button button-primary" type="submit" value="default">Save routine</button></div>
  </form>`;
  dialog.showModal();
  dialog.querySelector<HTMLInputElement>('#routine-name')?.focus();
}

function exerciseFields(exercise: Exercise): string {
  return `<div class="exercise-fields" data-exercise-id="${escapeHtml(exercise.id)}"><label>Exercise name<input data-exercise-field="name" maxlength="60" value="${escapeHtml(exercise.name)}" required autocomplete="off"></label><label>Sets<input data-exercise-field="sets" type="number" min="1" max="20" value="${exercise.targetSets}" required></label><label>kg<input data-exercise-field="weight" type="number" inputmode="decimal" min="0" max="2000" step="0.5" value="${exercise.defaultWeight}" required></label><label>Reps<input data-exercise-field="reps" type="number" inputmode="numeric" min="0" max="1000" value="${exercise.defaultReps}" required></label><button class="icon-button remove-exercise" type="button" data-action="remove-exercise" aria-label="Remove ${escapeHtml(exercise.name || 'exercise')}">×</button></div>`;
}

function showCorrectionDialog(event: SetEvent): void {
  const dialog = document.querySelector<HTMLDialogElement>('#correction-dialog');
  if (!dialog) return;
  dialog.innerHTML = `<form id="correction-form" method="dialog" data-id="${escapeHtml(event.id)}">
    <div class="dialog-heading"><div><p class="eyebrow">Append a correction</p><h2 id="correction-dialog-title">${escapeHtml(event.exerciseName)} · set ${event.setNumber}</h2></div><button class="icon-button" type="button" data-action="close-dialog" aria-label="Close correction form">×</button></div>
    <p>The ${formatNumber(event.weight)} kg × ${event.reps} entry remains in history and will be marked corrected.</p><div class="load-fields"><label><span>Weight <small>kg</small></span><input name="weight" type="number" inputmode="decimal" min="0" max="2000" step="0.5" value="${event.weight}" required></label><span class="multiply" aria-hidden="true">×</span><label><span>Reps</span><input name="reps" type="number" inputmode="numeric" min="0" max="1000" value="${event.reps}" required></label></div>
    <p id="correction-form-error" class="form-error" role="alert"></p><div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Cancel</button><button class="button button-primary" type="submit" value="default">Save correction</button></div>
  </form>`;
  dialog.showModal();
  dialog.querySelector<HTMLInputElement>('[name="weight"]')?.focus();
}

function setFlash(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
  state.flash = { message, tone };
  render();
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function refreshData(): Promise<void> {
  [state.routines, state.events, state.active] = await Promise.all([listRoutines(), listEvents(), getActiveWorkout()]);
}

async function handleAction(button: HTMLElement): Promise<void> {
  const action = button.dataset.action;
  if (action === 'view' || action === 'go-workout') {
    state.view = action === 'go-workout' ? 'workout' : (button.dataset.view as View);
    state.flash = undefined; render(); document.querySelector('#main')?.scrollIntoView(); return;
  }
  if (action === 'dismiss-flash') { state.flash = undefined; render(); return; }
  if (action === 'close-dialog') { button.closest('dialog')?.close(); return; }
  if (action === 'reload') { location.reload(); return; }
  if (action === 'new-routine') { showRoutineDialog(); return; }
  if (action === 'edit-routine') { showRoutineDialog(state.routines.find((routine) => routine.id === button.dataset.id)); return; }
  if (action === 'add-exercise') {
    document.querySelector('#exercise-fields')?.insertAdjacentHTML('beforeend', exerciseFields({ id: localId('exercise'), name: '', targetSets: 3, defaultWeight: 20, defaultReps: 8 })); return;
  }
  if (action === 'remove-exercise') {
    const rows = document.querySelectorAll('.exercise-fields');
    if (rows.length <= 1) { document.querySelector('#routine-form-error')!.textContent = 'A routine needs at least one exercise.'; return; }
    button.closest('.exercise-fields')?.remove(); return;
  }
  if (action === 'delete-routine') {
    const routine = state.routines.find((item) => item.id === button.dataset.id); if (!routine) return;
    if (!confirm(`Delete “${routine.name}”? Past set history will stay in the ledger.`)) return;
    await removeRoutine(routine.id); await refreshData(); setFlash(`${routine.name} deleted. Past sets were kept.`, 'info'); return;
  }
  if (action === 'start') {
    if (state.active) { setFlash('Finish the current workout before starting another.', 'error'); return; }
    const routine = state.routines.find((item) => item.id === button.dataset.id); if (!routine) return;
    state.busy = true; render();
    try { state.active = await startWorkout(routine); state.events = await listEvents(); state.view = 'workout'; state.flash = { tone: 'success', message: `${routine.name} started and saved on this device.` }; }
    catch (error) { state.flash = { tone: 'error', message: error instanceof Error ? error.message : 'The workout could not start.' }; }
    finally { state.busy = false; render(); } return;
  }
  if (action === 'complete') { await completeSet(button.dataset.id ?? ''); return; }
  if (action === 'finish') {
    if (!state.active || !confirm(`Finish “${state.active.routineName}”? You can still correct every saved set from the ledger.`)) return;
    state.busy = true; render();
    try { await finishWorkout(state.active); state.active = undefined; state.events = await listEvents(); state.flash = { tone: 'success', message: 'Workout finished. Every confirmed set remains in the ledger.' }; }
    catch (error) { state.flash = { tone: 'error', message: error instanceof Error ? error.message : 'The workout could not finish.' }; }
    finally { state.busy = false; render(); } return;
  }
  if (action === 'correct') {
    const event = state.events.find((item): item is SetEvent => item.id === button.dataset.id && isSetEvent(item)); if (event) showCorrectionDialog(event); return;
  }
  if (action === 'export-csv') { download(`durable-set-log-${isoNow().slice(0, 10)}.csv`, eventsToCsv(state.events), 'text/csv;charset=utf-8'); setFlash('CSV export prepared.', 'success'); return; }
  if (action === 'export-json') { download(`durable-set-log-backup-${isoNow().slice(0, 10)}.json`, JSON.stringify(await createBackup(), null, 2), 'application/json'); setFlash('Full JSON backup prepared.', 'success'); return; }
  if (action === 'install' && state.installPrompt) { await state.installPrompt.prompt(); const choice = await state.installPrompt.userChoice; state.installPrompt = undefined; setFlash(choice.outcome === 'accepted' ? 'App installed.' : 'Install dismissed.', 'info'); return; }
  if (action === 'apply-update' && state.updateWorker) { updateRequested = true; state.updateWorker.postMessage({ type: 'SKIP_WAITING' }); return; }
}

async function completeSet(exerciseId: string): Promise<void> {
  const active = state.active; const exercise = active?.exercises.find((item) => item.id === exerciseId);
  const sheet = document.querySelector<HTMLElement>(`[data-exercise="${CSS.escape(exerciseId)}"]`);
  if (!active || !exercise || !sheet || state.busy) return;
  const weight = Number(sheet.querySelector<HTMLInputElement>('[data-field="weight"]')?.value);
  const reps = Number(sheet.querySelector<HTMLInputElement>('[data-field="reps"]')?.value);
  if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 0) { setFlash('Enter a weight of zero or more and a whole number of reps.', 'error'); return; }
  const done = currentSets(state.events).filter((event) => event.sessionId === active.sessionId && event.exerciseId === exerciseId);
  const event: SetEvent = { id: localId('event'), type: 'set.completed', at: isoNow(), sessionId: active.sessionId, setId: localId('set'), routineName: active.routineName, exerciseId, exerciseName: exercise.name, setNumber: done.length + 1, weight, reps };
  state.busy = true; render();
  try { await appendEvent(event); state.events.push(event); state.flash = { tone: 'success', message: `${exercise.name} set ${event.setNumber} saved on this device.` }; }
  catch (error) { state.flash = { tone: 'error', message: `Set not confirmed: ${error instanceof Error ? error.message : 'device write failed'}. Try again.` }; }
  finally { state.busy = false; render(); }
}

async function handleSubmit(form: HTMLFormElement, submitter?: HTMLElement | null): Promise<void> {
  if (submitter?.getAttribute('value') === 'cancel') { (form.closest('dialog') as HTMLDialogElement | null)?.close(); return; }
  if (form.id === 'routine-form') {
    const existing = state.routines.find((routine) => routine.id === form.dataset.id);
    const name = (new FormData(form).get('name') as string).trim();
    const rows = [...form.querySelectorAll<HTMLElement>('.exercise-fields')];
    const exercises = rows.map((row) => ({
      id: row.dataset.exerciseId ?? localId('exercise'),
      name: row.querySelector<HTMLInputElement>('[data-exercise-field="name"]')?.value.trim() ?? '',
      targetSets: Number(row.querySelector<HTMLInputElement>('[data-exercise-field="sets"]')?.value),
      defaultWeight: Number(row.querySelector<HTMLInputElement>('[data-exercise-field="weight"]')?.value),
      defaultReps: Number(row.querySelector<HTMLInputElement>('[data-exercise-field="reps"]')?.value),
    }));
    if (!name || exercises.some((exercise) => !exercise.name || !Number.isInteger(exercise.targetSets) || exercise.targetSets < 1 || exercise.defaultWeight < 0 || !Number.isInteger(exercise.defaultReps) || exercise.defaultReps < 0)) {
      form.querySelector<HTMLElement>('.form-error')!.textContent = 'Name every exercise and use valid non-negative numbers.'; return;
    }
    const now = isoNow(); const routine: Routine = { id: existing?.id ?? localId('routine'), name, exercises, createdAt: existing?.createdAt ?? now, updatedAt: now };
    try { await saveRoutine(routine); (form.closest('dialog') as HTMLDialogElement).close(); await refreshData(); setFlash(`${name} saved on this device.`); }
    catch (error) { form.querySelector<HTMLElement>('.form-error')!.textContent = error instanceof Error ? error.message : 'Routine could not be saved.'; }
  }
  if (form.id === 'correction-form') {
    const original = state.events.find((event): event is SetEvent => event.id === form.dataset.id && isSetEvent(event)); if (!original) return;
    const data = new FormData(form); const weight = Number(data.get('weight')); const reps = Number(data.get('reps'));
    if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 0) { form.querySelector<HTMLElement>('.form-error')!.textContent = 'Use a non-negative weight and a whole number of reps.'; return; }
    const correction: SetEvent = { ...original, id: localId('event'), type: 'set.corrected', at: isoNow(), weight, reps, replacesEventId: original.id };
    try { await appendEvent(correction); state.events.push(correction); (form.closest('dialog') as HTMLDialogElement).close(); setFlash('Correction appended. The original remains visible.'); }
    catch (error) { form.querySelector<HTMLElement>('.form-error')!.textContent = error instanceof Error ? error.message : 'Correction could not be saved.'; }
  }
  if (form.id === 'license-form') {
    const token = String(new FormData(form).get('license') ?? '').trim(); if (!token) return;
    storeLicense(token); state.license = { unlocked: false, checking: true, token }; render(); state.license = await verifyLicense(true); setFlash(state.license.unlocked ? 'Purchase restored on this device.' : 'That license could not be verified.', state.license.unlocked ? 'success' : 'error');
  }
}

async function handleImport(input: HTMLInputElement): Promise<void> {
  const file = input.files?.[0]; if (!file) return;
  try {
    if (input.dataset.import === 'csv') {
      const result = await importEvents(csvToSetEvents(await file.text())); await refreshData();
      setFlash(`Import complete: ${result.added} added, ${result.skipped} already present${result.renamed ? `, ${result.renamed} ID collision${result.renamed === 1 ? '' : 's'} safely renamed` : ''}.`);
    } else {
      const backup = JSON.parse(await file.text()) as Backup; const result = await restoreBackup(backup); await refreshData();
      setFlash(`Restore complete: ${result.routines} routine${result.routines === 1 ? '' : 's'} and ${result.events} new event${result.events === 1 ? '' : 's'} merged.`);
    }
  } catch (error) { setFlash(error instanceof Error ? error.message : 'The file could not be imported.', 'error'); }
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  if (target.tagName === 'A' && target.dataset.action === 'view') event.preventDefault();
  void handleAction(target).catch((error) => setFlash(error instanceof Error ? error.message : 'That action failed.', 'error'));
});
app.addEventListener('submit', (event) => {
  event.preventDefault(); void handleSubmit(event.target as HTMLFormElement, (event as SubmitEvent).submitter);
});
app.addEventListener('change', (event) => { const input = event.target as HTMLInputElement; if (input.dataset.import) void handleImport(input); });
window.addEventListener('online', render); window.addEventListener('offline', render);
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); state.installPrompt = event as BeforeInstallPromptEvent; render(); });

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  if (registration.waiting) { state.updateWorker = registration.waiting; render(); }
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { state.updateWorker = worker; render(); } });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) location.reload(); });
}

async function init(): Promise<void> {
  captureReturnedLicense(); state.license = cachedLicenseState(); render();
  try { await refreshData(); render(); }
  catch (error) { state.dbError = error instanceof Error ? error.message : 'Storage is unavailable.'; render(); return; }
  void verifyLicense().then((license) => { state.license = license; render(); });
  void registerServiceWorker().catch(() => { /* Set logging remains available without installation support. */ });
}

void init();
