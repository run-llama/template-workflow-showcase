import { useEffect, useState } from "react";
import {
  useWorkflow,
  useHandler,
  useHandlers,
  useWorkflows,
  WorkflowEvent,
  isStopEvent,
} from "@llamaindex/ui";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// ─────────────────────────────────────────────────────────────────────────────
// Documentation content (matches ui-hooks.md)
// ─────────────────────────────────────────────────────────────────────────────

const intro = `
Our React library, \`@llamaindex/ui\`, is the recommended way to integrate your UI with a LlamaAgents workflow server and LlamaCloud.

### Workflows Hooks

There are 4 hooks you can use:
1. **useWorkflow**: Get actions for a specific workflow (create handlers, run to completion).
2. **useHandler**: Get state and actions for a single handler (stream events, send events).
3. **useHandlers**: List and monitor handlers with optional filtering.
4. **useWorkflows**: List all available workflows.
`;

const workflowListDocs = `
### List available workflows

Use \`useWorkflows\` to list all workflows available in the deployment:

\`\`\`tsx
import { useWorkflows } from "@llamaindex/ui";

export function WorkflowList() {
  const { state, sync } = useWorkflows();

  if (state.loading) return <div>Loading…</div>;

  return (
    <div>
      <button onClick={() => sync()}>Refresh</button>
      <ul>
        {Object.values(state.workflows).map((w) => (
          <li key={w.name}>{w.name}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`
`;

const createHandlerDocs = `
### Start a run

Start a workflow by name with \`useWorkflow\`. Call \`createHandler\` with a JSON input payload to get back a handler state immediately.

\`\`\`tsx
import { useState } from "react";
import { useWorkflow } from "@llamaindex/ui";

export function CreateHandler() {
  const workflow = useWorkflow("stream");
  const [handlerId, setHandlerId] = useState<string | null>(null);

  async function handleClick() {
    const handlerState = await workflow.createHandler({});
    setHandlerId(handlerState.handler_id);
  }

  return (
    <div>
      <button onClick={handleClick}>Create Handler</button>
      {handlerId && <div>Created: {handlerId}</div>}
    </div>
  );
}
\`\`\`
`;

const streamEventsDocs = `
### Watch a run and stream events

Subscribe to a handler's live event stream using \`subscribeToEvents\`:

\`\`\`tsx
import { useEffect, useState } from "react";
import { useWorkflow, useHandler, WorkflowEvent, isStopEvent } from "@llamaindex/ui";

export function StreamEvents() {
  const workflow = useWorkflow("stream");
  const [handlerId, setHandlerId] = useState<string | null>(null);
  const handler = useHandler(handlerId);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);

  async function start() {
    setEvents([]);
    const h = await workflow.createHandler({});
    setHandlerId(h.handler_id);
  }

  useEffect(() => {
    if (!handlerId) return;
    const sub = handler.subscribeToEvents({
      onData: (event) => setEvents((prev) => [...prev, event]),
    });
    return () => sub.unsubscribe();
  }, [handlerId]);

  const stop = events.find(isStopEvent);

  return (
    <div>
      <button onClick={start}>Start & Stream</button>
      {handlerId && <div>Status: {handler.state.status}</div>}
      {stop && <pre>{JSON.stringify(stop.data, null, 2)}</pre>}
      {!stop && events.length > 0 && <div>{events.length} events received</div>}
    </div>
  );
}
\`\`\`
`;

const recentRunsDocs = `
### Monitor multiple workflow runs

Use \`useHandlers\` to query and monitor a filtered list of workflow handlers.

\`\`\`tsx
import { useHandlers } from "@llamaindex/ui";

export function RecentRuns() {
  const { state, sync } = useHandlers({
    query: { status: ["running", "completed"] },
  });

  if (state.loading) return <div>Loading…</div>;

  const handlers = Object.values(state.handlers);

  return (
    <div>
      <button onClick={() => sync()}>Refresh</button>
      <ul>
        {handlers.map((h) => (
          <li key={h.handler_id}>
            {h.handler_id.slice(0, 8)}… — {h.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`
`;

// ─────────────────────────────────────────────────────────────────────────────
// Live examples (exact same code as docs)
// ─────────────────────────────────────────────────────────────────────────────

export function WorkflowList() {
  const { state, sync } = useWorkflows();

  if (state.loading) return <div>Loading…</div>;

  return (
    <div>
      <Button onClick={() => sync()}>Refresh</Button>
      <ul className="mt-2 space-y-1">
        {Object.values(state.workflows).map((w) => (
          <li key={w.name}>{w.name}</li>
        ))}
      </ul>
    </div>
  );
}

export function CreateHandler() {
  const workflow = useWorkflow("stream");
  const [handlerId, setHandlerId] = useState<string | null>(null);

  async function handleClick() {
    const handlerState = await workflow.createHandler({});
    setHandlerId(handlerState.handler_id);
  }

  return (
    <div>
      <Button onClick={handleClick}>Create Handler</Button>
      {handlerId && (
        <div className="mt-2 text-sm">
          Created: <code className="text-xs">{handlerId}</code>
        </div>
      )}
    </div>
  );
}

export function StreamEvents() {
  const workflow = useWorkflow("stream");
  const [handlerId, setHandlerId] = useState<string | null>(null);
  const handler = useHandler(handlerId);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);

  async function start() {
    setEvents([]);
    const h = await workflow.createHandler({});
    setHandlerId(h.handler_id);
  }

  useEffect(() => {
    if (!handlerId) return;
    const sub = handler.subscribeToEvents({
      onData: (event) => setEvents((prev) => [...prev, event]),
    });
    return () => sub.unsubscribe();
  }, [handlerId]);

  const stop = events.find(isStopEvent);

  return (
    <div>
      <Button onClick={start}>Start & Stream</Button>
      {handlerId && (
        <div className="mt-2 text-sm">Status: {handler.state.status}</div>
      )}
      {stop && (
        <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(stop.data, null, 2)}
        </pre>
      )}
      {!stop && events.length > 0 && (
        <div className="mt-2 text-sm">{events.length} events received</div>
      )}
    </div>
  );
}

export function RecentRuns() {
  const { state, sync } = useHandlers({
    query: { status: ["running", "completed"] },
  });

  if (state.loading) return <div>Loading…</div>;

  const handlers = Object.values(state.handlers);

  return (
    <div>
      <Button onClick={() => sync()}>Refresh</Button>
      <ul className="mt-2 space-y-1 text-sm">
        {handlers.map((h) => (
          <li key={h.handler_id}>
            <code className="text-xs">{h.handler_id.slice(0, 8)}…</code> —{" "}
            {h.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared components
// ─────────────────────────────────────────────────────────────────────────────

function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium rounded-md bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={{
        margin: 0,
        borderRadius: "0.5rem",
        fontSize: "0.8rem",
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}

function DocSection({
  markdown,
  children,
}: {
  markdown: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Markdown
        components={{
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {children}
            </p>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = match !== null;
            if (isBlock) {
              return (
                <CodeBlock language={match[1]}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              );
            }
            return (
              <code className="px-1.5 py-0.5 text-sm font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {markdown}
      </Markdown>
      <div className="rounded-lg mt-4 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-medium uppercase tracking-wide">
          Live Example
        </div>
        <div className="text-zinc-900 dark:text-zinc-100">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function HooksReferencePage() {
  return (
    <div className="min-h-dvh aurora-container">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hooks Reference
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Documentation with live examples of the @llamaindex/ui workflow
            hooks.
          </p>
        </header>

        <Markdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-6 mb-2 text-zinc-900 dark:text-zinc-100">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1 mb-6">
                {children}
              </ol>
            ),
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 text-sm font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded">
                {children}
              </code>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                {children}
              </strong>
            ),
          }}
        >
          {intro}
        </Markdown>

        <div className="space-y-10">
          <DocSection markdown={workflowListDocs}>
            <WorkflowList />
          </DocSection>

          <DocSection markdown={createHandlerDocs}>
            <CreateHandler />
          </DocSection>

          <DocSection markdown={streamEventsDocs}>
            <StreamEvents />
          </DocSection>

          <DocSection markdown={recentRunsDocs}>
            <RecentRuns />
          </DocSection>
        </div>
      </div>
    </div>
  );
}
