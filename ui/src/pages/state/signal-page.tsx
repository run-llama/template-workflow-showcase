import HandlerId from "@/components/handler-id";
import { Sparkline } from "@/components/sparkline";
import { useHandler } from "@llamaindex/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentWorkflow, useExistingWorkflow } from "../../hooks";
import { CANCEL_EVENT, isTick } from "./events";

export type GetOrCreateHandlerIdResult = {
  handler: ReturnType<typeof useHandler>;
  recreateHandler: () => void;
};

export default function SignalPage() {
  // Keep one handler around for the lifetime of the page
  const { handler, events, recreateHandler, failedToCreate } =
    useComponentWorkflow({
      workflowName: "snapshot_query",
      stopEvent: CANCEL_EVENT as any,
    });

  const maxTicks = 10;

  useEffect(() => {
    if (handler.state.handler_id) {
      handler.sendEvent({
        type: "ProbeEvent",
        value: {
          n_ticks: maxTicks,
        },
      } as any);
    }
  }, [handler.state.handler_id]);

  const tickValues = useMemo(
    () => events.filter(isTick).map((e) => e.data.value),
    [events],
  );

  const [scale, setScale] = useState(1);

  const sendScaleEvent = useCallback(
    (size: number) => {
      handler.sendEvent({
        type: "SignalScaleEvent",
        value: {
          scale: size,
        },
      } as any);
    },
    [handler],
  );

  return (
    <div className="min-h-dvh aurora-container">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Send a Signal to a Workflow's State
          </h1>
          <p className="mt-2">
            Send events as commands to modify the workflow&apos;s state as its
            running. Try moving the scale slider to change the scale of the
            incoming values.
          </p>

          <HandlerId handler={handler} failedToCreate={failedToCreate} />
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <label htmlFor="scale-slider" className="text-xs">
              Scale:
            </label>
            <input
              id="scale-slider"
              type="range"
              min="0"
              max="5"
              step="1"
              value={scale}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setScale(newValue);
                sendScaleEvent(newValue);
              }}
              className="w-32 h-1.5 accent-cyan-600 dark:accent-cyan-500"
            />
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 min-w-[1ch]">
              {scale}
            </span>
          </div>
        </header>
        <section>
          <Sparkline
            key={handler.state.handler_id}
            values={tickValues}
            height={320}
            maxVisible={maxTicks}
            color="#0891b2"
            fixedRange={[0, 5]}
          />
        </section>
        <div className="mt-6">
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm bg-white/70 dark:bg-zinc-900/50 hover:bg-white/90 dark:hover:bg-zinc-900/70 border-zinc-200/70 dark:border-zinc-800/70 cursor-pointer"
            onClick={() => {
              recreateHandler();
              setScale(1);
            }}
          >
            New handler
          </button>
        </div>
      </div>
    </div>
  );
}
