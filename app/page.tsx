'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import type { AgentResponse, AgentToolSettings } from "@/types/agent";

type MessageRole = "user" | "agent";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  payload?: AgentResponse;
  createdAt: string;
}

const defaultTools: AgentToolSettings = {
  search: true,
  knowledge: true,
  community: false,
  system: true
};

const defaultVision =
  "Hybrid Brian is a sovereign Ubuntu-native copilot that combines open intelligence, repeatable automations, and privacy-first world awareness.";

export default function HomePage() {
  const [vision, setVision] = useState(defaultVision);
  const [tools, setTools] = useState<AgentToolSettings>(defaultTools);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedVision = window.localStorage.getItem("brian:vision");
    const savedTools = window.localStorage.getItem("brian:tools");
    if (savedVision) {
      setVision(savedVision);
    }
    if (savedTools) {
      try {
        const parsed = JSON.parse(savedTools) as AgentToolSettings;
        setTools(parsed);
      } catch {
        // ignore corrupted settings
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("brian:vision", vision);
  }, [vision]);

  useEffect(() => {
    window.localStorage.setItem("brian:tools", JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggle = (key: keyof AgentToolSettings) => {
    setTools((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || loading) {
      return;
    }

    const submission = query.trim();
    setQuery("");
    setError(null);
    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: submission,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: submission,
          vision,
          enabledTools: tools
        })
      });

      if (!response.ok) {
        throw new Error("The agent could not complete the request.");
      }

      const payload = (await response.json()) as AgentResponse;

      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: payload.summary,
        payload,
        createdAt: payload.timestamp
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error while contacting the agent."
      );
    } finally {
      setLoading(false);
    }
  };

  const lastAgentPayload = useMemo(
    () => messages.slice().reverse().find((message) => message.role === "agent")?.payload,
    [messages]
  );

  return (
    <main className={styles.wrapper}>
      <div className={styles.grid}>
        <section className={styles.chatPanel}>
          <header className={styles.hero}>
            <div>
              <h1>Brian</h1>
              <p>
                Open Ubuntu-native intelligence. Blend global signals, curated
                knowledge, and your own vision—no paid APIs required.
              </p>
            </div>
            <div className={styles.heroBadge}>
              <span>OSS Stack</span>
              <small>DuckDuckGo · Wikipedia · Hacker News · Ubuntu playbooks</small>
            </div>
          </header>

          <div className={styles.messages} ref={scrollRef}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyGradient} />
                <h2>Craft the plan for your autonomous desk mate.</h2>
                <p>
                  Ask for deployment blueprints, workflow automations, or global readouts.
                  Brian stitches together open knowledge while respecting your intent.
                </p>
                <div className={styles.examples}>
                  <button
                    type="button"
                    onClick={() =>
                      setQuery(
                        "Design an Ubuntu workflow to self-host an open-source voice assistant with local privacy."
                      )
                    }
                  >
                    Ubuntu private voice stack
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuery(
                        "How can Brian monitor global AI policy news without commercial APIs?"
                      )
                    }
                  >
                    Global AI policy feeds
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuery(
                        "Create a plan to blend Wikipedia intelligence with my personal research vault."
                      )
                    }
                  >
                    Blend public + personal intel
                  </button>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? styles.messageUser
                    : styles.messageAgent
                }
              >
                <header>
                  <strong>
                    {message.role === "user" ? "You" : "Brian"}
                  </strong>
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </header>
                <p>{message.content}</p>
                {message.role === "agent" && message.payload && (
                  <AgentPayload payload={message.payload} />
                )}
              </article>
            ))}
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <textarea
              rows={3}
              placeholder="Ask Brian for a plan, integration guide, or intel scan…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={loading}
            />
            <div className={styles.composerFooter}>
              <div className={styles.status}>
                {loading && <span>Assembling open intelligence…</span>}
                {error && <span className={styles.error}>{error}</span>}
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Working…" : "Launch"}
              </button>
            </div>
          </form>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <h2>Your Vision</h2>
            <p>
              The assistant biases results and synthesis toward this north star.
              Craft it like a manifesto.
            </p>
            <textarea
              className={styles.visionInput}
              value={vision}
              onChange={(event) => setVision(event.target.value)}
              rows={6}
              placeholder="Describe the worldview Brian should uphold…"
            />
          </section>

          <section className={styles.card}>
            <h2>Toolchain</h2>
            <p>Select which open intelligence streams Brian should activate.</p>
            <div className={styles.toolGrid}>
              <ToolToggle
                label="Global Search"
                description="DuckDuckGo instant answers & related topics."
                active={tools.search}
                onToggle={() => handleToggle("search")}
              />
              <ToolToggle
                label="Knowledge Graph"
                description="Wikipedia summaries and linked resources."
                active={tools.knowledge}
                onToggle={() => handleToggle("knowledge")}
              />
              <ToolToggle
                label="Community Pulse"
                description="Hacker News discussions & maker signals."
                active={tools.community}
                onToggle={() => handleToggle("community")}
              />
              <ToolToggle
                label="Ubuntu Playbooks"
                description="Curated local-first automation recipes."
                active={tools.system}
                onToggle={() => handleToggle("system")}
              />
            </div>
          </section>

          <section className={styles.card}>
            <h2>Latest synthesis</h2>
            {lastAgentPayload ? (
              <div className={styles.summaryPanel}>
                <h3>Plan</h3>
                <ul>
                  {lastAgentPayload.plan.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <h3>Sources</h3>
                <ul className={styles.sourceList}>
                  {lastAgentPayload.sources.map((source) => (
                    <li key={source.id}>
                      <span className={styles.sourceType}>{source.type}</span>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No synthesis yet. Ask Brian for something bold.</p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function ToolToggle({
  label,
  description,
  active,
  onToggle
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${styles.toolToggle} ${active ? styles.toolToggleActive : ""}`}
    >
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <span className={styles.togglePill}>{active ? "On" : "Off"}</span>
    </button>
  );
}

function AgentPayload({ payload }: { payload: AgentResponse }) {
  return (
    <div className={styles.agentPayload}>
      <div className={styles.payloadRow}>
        <h3>Strategic Plan</h3>
        <ul>
          {payload.plan.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.payloadRow}>
        <h3>Signals</h3>
        <ul>
          {payload.sources.map((source) => (
            <li key={source.id}>
              <span className={styles.sourceType}>{source.type}</span>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              ) : (
                source.title
              )}
              <small>{source.snippet}</small>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.payloadRow}>
        <h3>Diagnostics</h3>
        <ul>
          {payload.diagnostics.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
        {payload.diagnostics.visionBias && (
          <p className={styles.bias}>
            Vision keywords: {payload.diagnostics.visionBias.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
