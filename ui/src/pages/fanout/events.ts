export type UnknownEvent = { type: string; data?: unknown };

export type BatchPlannedData = { task_ids: number[] };
export type TaskStartedData = { task_id: number; started_at_ms: number };
export type TaskProgressData = {
  task_id: number;
  percent: number;
  stage_index: number;
  timestamp_ms: number;
};
export type TaskCompletedData = {
  task_id: number;
  started_at_ms: number;
  finished_at_ms: number;
  duration_ms: number;
};

export function isBatchPlanned(
  e: UnknownEvent,
): e is { type: string; data: BatchPlannedData } {
  return e.type === "BatchPlannedEvent";
}

export function isTaskStarted(
  e: UnknownEvent,
): e is { type: string; data: TaskStartedData } {
  return e.type === "TaskStartedEvent";
}

export function isTaskProgress(
  e: UnknownEvent,
): e is { type: string; data: TaskProgressData } {
  return e.type === "TaskProgressEvent";
}

export function isTaskCompleted(
  e: UnknownEvent,
): e is { type: string; data: TaskCompletedData } {
  return e.type === "TaskCompletedEvent";
}
