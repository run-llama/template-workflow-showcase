import { WorkflowEvent } from "@llamaindex/ui";

export type RoomStateEventData = {
  description: string;
  exits: ("north" | "east" | "south" | "west")[];
  prompt: string;
};

export type GameSnapshotData = {
  current_room: string;
  current_description: string;
  valid_exits: ("north" | "east" | "south" | "west")[];
  awaiting_input: boolean;
  input_prompt: string | null;
  moves: number;
};

export function isRoomStateEvent(
  e: WorkflowEvent,
): e is { type: string; data: RoomStateEventData } & WorkflowEvent {
  return e.type === "RoomStateEvent";
}

export function isGameSnapshot(
  e: WorkflowEvent,
): e is { type: string; data: GameSnapshotData } & WorkflowEvent {
  return e.type === "GameSnapshotEvent";
}

export function isStopEvent(
  e: WorkflowEvent,
): e is { type: string; data: { game_over: string } } & WorkflowEvent {
  return e.type === "GameOverEvent";
}

export const PROBE_EVENT = {
  type: "ProbeEvent",
  value: {},
};
