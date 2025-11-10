import {
  useHandler,
  useHandlers,
  useWorkflow,
  WorkflowEvent,
} from "@llamaindex/ui";
import { useEffect, useRef, useState } from "react";

export type GetOrCreateHandlerIdResult = {
  handlerId: string | null;
  handler: ReturnType<typeof useHandler>;
  events: WorkflowEvent[];
  recreateHandler: () => void;
  failedToCreate: Error | null;
};

/**
 * retrieves any existing handler for the specified workflow name and re-uses it
 */
export function useExistingWorkflow({
  workflowName,
  stopEvent,
}: {
  workflowName: string;
  stopEvent?: WorkflowEvent;
}): GetOrCreateHandlerIdResult {
  const available = useHandlers({
    query: { workflow_name: [workflowName], status: ["running"] },
  });
  const run = useWorkflow(workflowName);
  const [isInitialized, setIsInitialized] = useState(false);
  const [handlerId, setHandlerId] = useState<string | null>(null);
  const handler = useHandler(handlerId ?? "");
  const lastHandlerId = useRef<string | null>(null);
  const [failedToCreate, setFailedToCreate] = useState<Error | null>(null);
  useEffect(() => {
    if (handlerId) {
      lastHandlerId.current = handlerId;
    }
  }, [handlerId]);

  // first, fetch a handler from the existing on load.
  useEffect(() => {
    if (!isInitialized && !available.state.loading) {
      const availableHandlerId = Object.values(available.state.handlers).find(
        (h) => h.status === "running" && h.workflow_name === workflowName,
      )?.handler_id;
      setHandlerId(availableHandlerId ?? null);
      setIsInitialized(true);
    }
  }, [isInitialized, available.state.loading]);

  // create a new handler if one doesn't exist.
  useEffect(() => {
    if (!handlerId && isInitialized && !failedToCreate) {
      run
        .createHandler({})
        .then((handler) => {
          setHandlerId(handler.handler_id);
        })
        .catch((error) => {
          console.error(error);
          setFailedToCreate(error);
        });
    }
  }, [handlerId, isInitialized]);

  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  useEffect(() => {
    if (handlerId) {
      const subscription = handler.subscribeToEvents({
        onData: (event) => {
          setEvents((events) => [...events, event]);
        },
      });
    }
  }, [handlerId]);

  // cancel old handlers when a new one is created.
  useEffect(() => {
    if (
      !handlerId &&
      lastHandlerId.current &&
      handlerId !== lastHandlerId.current &&
      stopEvent
    ) {
      handler.sendEvent(stopEvent);
    }
  }, [handlerId, lastHandlerId.current]);

  return {
    handlerId: handlerId,
    handler: handler,
    events: events,
    recreateHandler: () => {
      setHandlerId(null);
      setFailedToCreate(null);
    },
    failedToCreate: failedToCreate ?? null,
  };
}

/**
 * Creates a workflow handler for the lifetime of the component.
 * Sends the specified stop event to the handler when the page is unloaded.
 * */
export function useComponentWorkflow({
  workflowName,
  stopEvent,
}: {
  workflowName: string;
  stopEvent?: WorkflowEvent;
}): GetOrCreateHandlerIdResult {
  const run = useWorkflow(workflowName);
  const isCreating = useRef(false);
  const [handlerId, setHandlerId] = useState<string | null>(null);
  const handler = useHandler(handlerId ?? "");
  const [failedToCreate, setFailedToCreate] = useState<Error | null>(null);
  useEffect(() => {
    if (!handlerId && !isCreating.current && !failedToCreate) {
      isCreating.current = true;

      run
        .createHandler({})
        .then((handler) => {
          setHandlerId(handler.handler_id);
        })
        .catch((error) => {
          console.error(error);
          setFailedToCreate(error);
        })
        .finally(() => {
          isCreating.current = false;
        });
    }
  }, [handlerId]);
  useEffect(() => {
    return () => {
      if (handlerId && stopEvent) {
        handler.sendEvent(stopEvent);
      }
    };
  }, [handlerId]);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  useEffect(() => {
    if (handlerId) {
      const subscription = handler.subscribeToEvents({
        onData: (event) => {
          setEvents((events) => [...events, event]);
        },
      });
      return () => {
        setEvents([]);
        subscription.unsubscribe();
      };
    }
  }, [handlerId]);
  return {
    handlerId: handlerId,
    handler: handler,
    events: events,
    recreateHandler: () => {
      if (stopEvent) {
        handler.sendEvent(stopEvent);
      }
      setFailedToCreate(null);
      setHandlerId(null);
    },
    failedToCreate: failedToCreate ?? null,
  };
}
