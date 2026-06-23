"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Maximize2, Menu, Minimize2, Plus, Send, Sparkles, Square, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, ChatSession, RecommendedAction } from "@/lib/chat/types";
import { deleteSession, getSessions, saveSession } from "@/lib/chat/indexeddb";
import { cn } from "@/lib/utils";

const thinkingMessages = [
  "Finding the latest plans...",
  "Checking current offers...",
  "Looking at available stock...",
  "Preparing a recommendation...",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [session, setSession] = useState<ChatSession>(() => createSession());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef(session);

  const visibleMessages = useMemo(
    () => session.messages.filter((message) => message.role !== "system"),
    [session.messages],
  );

  const refreshSessions = useCallback(async () => {
    setSessions(await getSessions());
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshSessions();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshSessions]);

  useEffect(() => {
    if (!streaming) return;
    const id = window.setInterval(() => {
      setThinkingIndex((index) => (index + 1) % thinkingMessages.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, [streaming]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, streaming]);

  async function persist(next: ChatSession) {
    setSession(next);
    await saveSession(next);
    await refreshSessions();
  }

  async function newChat() {
    const next = createSession();
    setSession(next);
    setInput("");
    setSidebarOpen(false);
  }

  async function chooseSession(next: ChatSession) {
    setSession(next);
    setSidebarOpen(false);
  }

  async function removeSession(id: string) {
    await deleteSession(id);
    if (session.id === id) setSession(createSession());
    await refreshSessions();
  }

  async function sendMessage(prompt = input.trim()) {
    const text = prompt.trim();
    if (!text || streaming) return;

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: now,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: now,
      recommendedActions: [],
    };

    const title = session.messages.length ? session.title : makeTitle(text);
    const baseSession = {
      ...session,
      title,
      updatedAt: now,
      messages: [...session.messages, userMessage, assistantMessage],
    };

    setInput("");
    setStreaming(true);
    await persist(baseSession);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          messages: session.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok || !response.body) throw new Error("Chat failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";
      let actions: RecommendedAction[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const parsed = parseSseEvent(event);
          if (!parsed) continue;

          if (parsed.event === "token") {
            const token = JSON.parse(parsed.data) as string;
            for (const word of token.split(/(\s+)/)) {
              content += word;
              updateAssistant(baseSession.id, assistantMessage.id, content, actions);
              await wait(word.trim() ? 26 : 6);
            }
          }

          if (parsed.event === "metadata") {
            actions = (JSON.parse(parsed.data).recommendedActions ?? []) as RecommendedAction[];
            updateAssistant(baseSession.id, assistantMessage.id, content, actions);
          }
        }
      }

      const finalSession = buildUpdatedSession(baseSession.id, assistantMessage.id, content, actions);
      if (finalSession) await persist(finalSession);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        updateAssistant(
          baseSession.id,
          assistantMessage.id,
          "I could not answer right now. Please try asking about plans, prices, stock, or WhatsApp checkout again.",
          [],
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setStreaming(false);
    void saveSession(session);
  }

  function updateAssistant(sessionId: string, messageId: string, content: string, actions: RecommendedAction[]) {
    setSession((current) => {
      if (current.id !== sessionId) return current;
      return {
        ...current,
        updatedAt: new Date().toISOString(),
        messages: current.messages.map((message) =>
          message.id === messageId ? { ...message, content, recommendedActions: actions } : message,
        ),
      };
    });
  }

  function buildUpdatedSession(sessionId: string, messageId: string, content: string, actions: RecommendedAction[]) {
    const current = sessionRef.current;
    if (current.id !== sessionId) return null;
    return {
      ...current,
      updatedAt: new Date().toISOString(),
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, content, recommendedActions: actions } : message,
      ),
    };
  }

  const chatPanel = (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "fixed z-50 flex overflow-hidden bg-white shadow-2xl",
        expanded
          ? "inset-0 rounded-none"
          : "bottom-24 right-4 h-[620px] max-h-[calc(100vh-7rem)] w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-black/10",
      )}
    >
      {expanded ? (
        <Sidebar
          sessions={sessions}
          activeId={session.id}
          open={sidebarOpen}
          onNew={newChat}
          onChoose={chooseSession}
          onDelete={removeSession}
          onClose={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? (
              <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="size-5" />
              </button>
            ) : null}
            <div className="grid size-9 place-items-center rounded-full bg-[#E6F7FD] text-[#0B7FAE]">
              <Bot className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">OTT Nepal Assistant</h2>
              <p className="text-xs text-[#737373]">Plans, prices, checkout and support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Shrink chat" : "Expand chat"}
            >
              {expanded ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {visibleMessages.length ? (
            visibleMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6",
                    message.role === "user" ? "bg-[#159FD3] text-white" : "bg-[#f4f4f5] text-[#111]",
                  )}
                >
                  {message.content || (streaming ? <span className="shimmer-text">{thinkingMessages[thinkingIndex]}</span> : null)}
                  {message.recommendedActions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.recommendedActions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[#0B7FAE]"
                          onClick={() => sendMessage(action.prompt)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Badge className="bg-[#E6F7FD] text-[#0B7FAE]">Website assistant</Badge>
                <h3 className="mt-3 text-2xl font-bold">How can I help?</h3>
                <p className="mt-2 max-w-sm text-sm text-[#555]">
                  Ask about OTT plans, prices, stock, cart, WhatsApp checkout, payment, reviews, or support.
                </p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-black/10 p-3">
          <div className="flex items-end gap-2 rounded-3xl border border-black/10 bg-white p-2">
            <textarea
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
              placeholder="Ask about Netflix, Spotify, prices, checkout..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            {streaming ? (
              <Button variant="secondary" className="px-3" onClick={stopStreaming}>
                <Square className="size-4" />
              </Button>
            ) : (
              <Button className="px-3" disabled={!input.trim()} onClick={() => sendMessage()}>
                <Send className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {open ? chatPanel : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#159FD3] px-4 py-3 text-white shadow-2xl transition hover:bg-[#0B7FAE]"
        aria-label="Open AI chat"
      >
        <span className="relative grid size-8 place-items-center rounded-full bg-white/15">
          <Bot className="size-5" />
          <Sparkles className="absolute -right-1 -top-1 size-3 fill-white text-white" />
        </span>
        <span className="text-sm font-bold">AI Help</span>
      </button>
    </>
  );
}

function Sidebar({
  sessions,
  activeId,
  open,
  onNew,
  onChoose,
  onDelete,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string;
  open: boolean;
  onNew: () => void;
  onChoose: (session: ChatSession) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn("fixed inset-0 z-10 bg-black/30 lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "z-20 w-72 shrink-0 border-r border-black/10 bg-[#f7f7f8] p-3 transition-transform lg:relative lg:translate-x-0",
          "fixed inset-y-0 left-0 lg:block",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button className="w-full justify-start" onClick={onNew}>
          <Plus className="size-4" />
          New Chat
        </Button>
        <div className="mt-4 space-y-2">
          {sessions.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                item.id === activeId ? "bg-white font-semibold" : "hover:bg-white/70",
              )}
            >
              <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => onChoose(item)}>
                {item.title}
              </button>
              <button type="button" aria-label="Delete chat" onClick={() => onDelete(item.id)}>
                <Trash2 className="size-4 text-[#737373]" />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function createSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function makeTitle(text: string) {
  return text.length > 36 ? `${text.slice(0, 36)}...` : text;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function parseSseEvent(event: string) {
  const lines = event.split("\n");
  const name = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
  const data = lines.find((line) => line.startsWith("data:"))?.replace("data:", "").trim();
  if (!name || !data) return null;
  return { event: name, data };
}
