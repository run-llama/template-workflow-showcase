import { WorkflowEvent } from "@llamaindex/ui";

export type WordStreamData = { word: string };

export function isWordStream(
  e: WorkflowEvent,
): e is { type: string; data: WordStreamData } & WorkflowEvent {
  return e.type === "WordStreamEvent";
}

export function isFullTextStopEvent(
  e: WorkflowEvent,
): e is { type: string; data: { text?: string } } & WorkflowEvent {
  return e.type === "FullTextStopEvent";
}
