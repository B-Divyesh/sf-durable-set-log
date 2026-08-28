export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  defaultWeight: number;
  defaultReps: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutStartedEvent {
  id: string;
  type: 'workout.started';
  at: string;
  sessionId: string;
  routineId: string;
  routineName: string;
  exercises: Exercise[];
}

export interface WorkoutFinishedEvent {
  id: string;
  type: 'workout.finished';
  at: string;
  sessionId: string;
}

export interface SetEvent {
  id: string;
  type: 'set.completed' | 'set.corrected';
  at: string;
  sessionId: string;
  setId: string;
  routineName: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  replacesEventId?: string;
  sourceEventId?: string;
  importedAt?: string;
}

export type LogEvent = WorkoutStartedEvent | WorkoutFinishedEvent | SetEvent;

export interface ActiveWorkout {
  sessionId: string;
  routineId: string;
  routineName: string;
  exercises: Exercise[];
  startedAt: string;
}

export const isSetEvent = (event: LogEvent): event is SetEvent =>
  event.type === 'set.completed' || event.type === 'set.corrected';
