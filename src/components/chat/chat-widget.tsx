"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Maximize2, Menu, MessageCircle, Minimize2, Plus, Send, ShoppingCart, Square, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/lib/types";
import type { ChatMessage, ChatSession, RecommendedAction } from "@/lib/chat/types";
import { deleteSession, getSessions, saveSession } from "@/lib/chat/indexeddb";
import { useCartStore } from "@/lib/store/cart-store";
import { getWhatsAppUrl } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils";

const thinkingMessages = [
  "Finding the latest plans...",
  "Checking current offers...",
  "Looking at available stock...",
  "Preparing a recommendation...",
];

const starterPrompts = [
  "Show me Netflix plans",
  "Compare Spotify and YouTube",
  "What is the cheapest OTT plan?",
  "I need Netflix and Prime Video",
  "How do I checkout?",
];

const launcherMessages = [
  "How can I help?",
  "Book a subscription",
  "Add to cart",
];

const confirmationPrompts = new Set(["yes", "yeah", "yep", "ok", "okay", "sure", "add it", "add this", "add that", "please add", "do it"]);
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [session, setSession] = useState<ChatSession>(() => createSession());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [launcherMessageIndex, setLauncherMessageIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef(session);
  const cartCount = useCartStore((state) => state.count());
  const cartItems = useCartStore((state) => state.items);
  const usedAddKeys = useCartStore((state) => state.usedAddKeys ?? []);
  const addCartItem = useCartStore((state) => state.addItem);
  const decreaseCartItem = useCartStore((state) => state.decrease);
  const removeCartItem = useCartStore((state) => state.removeItem);

  const visibleMessages = useMemo(
    () => session.messages.filter((message) => message.role !== "system"),
    [session.messages],
  );
  const starterChips = useMemo(() => shuffle(starterPrompts).slice(0, 3), []);

  const refreshSessions = useCallback(async () => {
    setSessions(await getSessions());
  }, []);

  const loadInitialSession = useCallback(async () => {
    const storedSessions = await getSessions();
    setSessions(storedSessions);

    const latest = storedSessions[0];
    if (!latest) return;

    const updatedAt = new Date(latest.updatedAt).getTime();
    if (Number.isNaN(updatedAt) || Date.now() - updatedAt > SESSION_TTL_MS) return;

    setSession(latest);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadInitialSession();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadInitialSession]);

  useEffect(() => {
    if (open) return;

    const id = window.setTimeout(() => setShowHelpBubble(true), 700);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open || !showHelpBubble) return;
    const id = window.setInterval(() => {
      setLauncherMessageIndex((index) => (index + 1) % launcherMessages.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [open, showHelpBubble]);

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
    abortRef.current?.abort();
    abortRef.current = null;
    const id = window.setTimeout(() => {
      setOpen(false);
      setExpanded(false);
      setSidebarOpen(false);
      setStreaming(false);
      setShowHelpBubble(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

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

    const removal = applyCartRemoval(text, useCartStore.getState().items, {
      decrease: decreaseCartItem,
      remove: removeCartItem,
    });
    if (removal) {
      const removalActions: RecommendedAction[] = [
        { label: "View cart", prompt: "Show me my cart.", type: "cart" },
        { label: "Proceed to Checkout", prompt: "Take me to checkout.", type: "checkout" },
      ];
      const finalSession: ChatSession = {
        ...baseSession,
        updatedAt: new Date().toISOString(),
        messages: baseSession.messages.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: removal.message, recommendedActions: removalActions }
            : message,
        ),
      };
      await persist(finalSession);
      setStreaming(false);
      return;
    }

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
          cart: cartItems.map((item) => ({
            productName: item.productName,
            planName: item.planName,
            quantity: item.quantity,
            finalPrice: item.finalPrice,
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
      if (shouldAutoAddFromConfirmation(text, actions)) {
        await handleCartAction(actions[0], { skipAssistantMessage: true });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        updateAssistant(
          baseSession.id,
          assistantMessage.id,
          "I could not answer right now. Please try asking about plans, prices, stock, or WhatsApp checkout again.",
          [
            { label: "Show Netflix plans", prompt: "Show me Netflix plans.", type: "question" },
            { label: "How to checkout", prompt: "How do I checkout on WhatsApp?", type: "checkout" },
            { label: "Contact support", prompt: "How can I contact support on WhatsApp?", type: "support" },
          ],
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

  async function handleCartAction(action: RecommendedAction, options: { skipAssistantMessage?: boolean } = {}) {
    if (!action.planId || !action.productId) return;
    const qty = action.quantity ?? 1;
    if (action.addKey && usedAddKeys.includes(action.addKey)) {
      toast.info("Already in cart", {
        description: `${action.productName} ${action.planName}`,
        action: { label: "View Cart", onClick: () => router.push("/cart") },
      });
      return;
    }
    const item: CartItem = {
      productId: action.productId,
      productName: action.productName ?? "Product",
      planId: action.planId,
      planName: action.planName ?? "Plan",
      realPrice: action.realPrice ?? 0,
      offerPrice: action.offerPrice ?? null,
      finalPrice: action.finalPrice ?? action.realPrice ?? 0,
      quantity: qty,
      imageUrl: action.imageUrl ?? null,
      addKey: action.addKey,
    };
    addCartItem(item);
    const label = qty > 1 ? `${qty}× ${action.planName}` : action.planName;
    toast.success(`${label} added to cart`, {
      description: `${action.productName} - Rs. ${(action.finalPrice ?? action.realPrice ?? 0) * qty}`,
      action: { label: "View Cart", onClick: () => router.push("/cart") },
    });
    if (!options.skipAssistantMessage) {
      // Suggest remaining items that were mentioned but not in cart
      const userMsgs = sessionRef.current.messages.filter((m) => m.role === "user").slice(-3);
      const mentioned = userMsgs
        .flatMap((m) => {
          const matches = m.content.matchAll(/(Netflix|Spotify|Prime Video|YouTube|SonyLIV|Zee5|Disney|Hotstar)/gi);
          return [...matches].map((match) => match[0]);
        })
        .filter((name, i, arr) => arr.indexOf(name) === i);
      const cartItems = useCartStore.getState().items;
      const cartProductNames = new Set(cartItems.map((i) => i.productName.toLowerCase()));
      const missing = mentioned.filter((n) => !cartProductNames.has(n.toLowerCase()));

      const actions: RecommendedAction[] = [
        ...missing.map((name) => ({
          label: `Add ${name}`,
          prompt: `Add ${name} to cart.`,
          type: "question" as const,
        })),
        { label: "View cart", prompt: "Show me my cart.", type: "cart" as const },
        { label: "Proceed to Checkout", prompt: "Take me to checkout.", type: "checkout" as const },
      ];
      await appendAssistant(`Added ${label} ${action.productName} to cart.`, actions);
    }
  }

  async function handleBulkCartAction(items: CartItem[]) {
    const largeItem = items.find((item) => item.quantity > 5);
    if (largeItem) {
      await appendAssistant(
        `Are you sure you need quantity ${largeItem.quantity} for ${largeItem.productName} ${largeItem.planName}?`,
        [
          {
            label: "Yes",
            prompt: `Add ${largeItem.quantity} ${largeItem.planName} ${largeItem.productName} to cart.`,
            type: "add_to_cart",
            productId: largeItem.productId,
            productName: largeItem.productName,
            planId: largeItem.planId,
            planName: largeItem.planName,
            realPrice: largeItem.realPrice,
            offerPrice: largeItem.offerPrice,
            finalPrice: largeItem.finalPrice,
            imageUrl: largeItem.imageUrl,
            quantity: largeItem.quantity,
            addKey: largeItem.addKey,
          },
          { label: "No", prompt: "Show smaller quantity suggestions.", type: "question" },
          { label: "Qty 1", prompt: `Add 1 ${largeItem.planName} ${largeItem.productName} to cart.`, type: "question" },
          { label: "Qty 3", prompt: `Add 3 ${largeItem.planName} ${largeItem.productName} to cart.`, type: "question" },
          { label: "Qty 5", prompt: `Add 5 ${largeItem.planName} ${largeItem.productName} to cart.`, type: "question" },
        ],
      );
      return;
    }

    const newItems = items.filter((item) => !item.addKey || !usedAddKeys.includes(item.addKey));
    if (!newItems.length) {
      toast.info("Already in cart", {
        description: "Selected plans are already added.",
        action: { label: "View Cart", onClick: () => router.push("/cart") },
      });
      return;
    }

    for (const item of newItems) addCartItem(item);
    const totalQty = newItems.reduce((sum, item) => sum + item.quantity, 0);
    toast.success(`${totalQty} subscription${totalQty > 1 ? "s" : ""} added to cart`, {
      description: `${newItems.length} selected plan${newItems.length > 1 ? "s" : ""}`,
      action: { label: "View Cart", onClick: () => router.push("/cart") },
    });
    const summary = newItems.map((item) => `${item.quantity}x ${item.productName} ${item.planName}`).join(", ");
    await appendAssistant(`Added to cart: ${summary}.`);
  }

  async function appendAssistant(content: string, recommendedActions?: RecommendedAction[]) {
    const now = new Date().toISOString();
    const actions = recommendedActions ?? [
      { label: "View cart", prompt: "Show me my cart.", type: "cart" as const },
      { label: "Proceed to Checkout", prompt: "Take me to checkout.", type: "checkout" as const },
    ];
    const next: ChatSession = {
      ...sessionRef.current,
      updatedAt: now,
      messages: [
        ...sessionRef.current.messages.map((message) => ({
          ...message,
          recommendedActions: message.recommendedActions?.filter(
            (action) => action.type !== "cart" && action.type !== "checkout",
          ),
        })),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          createdAt: now,
          recommendedActions: actions,
        },
      ],
    };
    await persist(next);
  }

  function handleActionClick(action: RecommendedAction) {
    if (action.type === "add_to_cart") {
      handleCartAction(action);
      return;
    }
    if (action.type === "checkout") {
      router.push("/cart");
      return;
    }
    if (action.type === "cart" && action.label.toLowerCase().includes("view")) {
      router.push("/cart");
      return;
    }
    if (action.type === "support") {
      window.open(getWhatsAppUrl("Hello Ott Subscription Nepal,\n\nI need help with plans or checkout."), "_blank", "noopener,noreferrer");
      return;
    }
    sendMessage(action.prompt);
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
    <>
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
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
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
              <h2 className="text-sm font-bold">Ott Assistant</h2>
              <p className="text-xs text-[#737373]">Plans, prices, checkout and support</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {expanded && cartCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setOpen(false);
                  }
                  setExpanded(false);
                  router.push("/cart");
                }}
                className="relative rounded-full border border-white/20 bg-white/40 p-2.5 backdrop-blur-xl"
                aria-label="Open cart"
              >
                <ShoppingCart className="size-4 text-[#111]" />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#159FD3] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              className="hidden lg:block"
              onClick={() => {
                setExpanded((value) => {
                  const next = !value;
                  setSidebarOpen(false);
                  return next;
                });
              }}
              aria-label={expanded ? "Shrink chat" : "Expand chat"}
            >
              {expanded ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
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
                    "max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-6",
                    expanded && message.role === "assistant" && "lg:max-w-[min(78%,900px)]",
                    message.role === "user" ? "bg-[#159FD3] text-white" : "bg-[#f4f4f5] text-[#111]",
                  )}
                >
                  {message.content ? (
                    message.role === "assistant" ? (
                      <AssistantMessage content={message.content} />
                    ) : (
                      message.content
                    )
                  ) : streaming ? (
                    <span className="shimmer-text">{thinkingMessages[thinkingIndex]}</span>
                  ) : null}
                  {message.recommendedActions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.recommendedActions.map((action) => {
                        if (action.type === "plan_selection") {
                          return (
                            <PlanSelectionAction
                              key={`${action.label}-${message.id}`}
                              action={action}
                              onAdd={handleBulkCartAction}
                            />
                          );
                        }
                        const isAddCart = action.type === "add_to_cart";
                        const isCheckout = action.type === "checkout";
                        const isSupport = action.type === "support";
  return (
                          <button
                            key={action.label}
                            type="button"
                            className={cn(
                              "inline-flex min-w-14 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                              isAddCart
                                ? "border border-[#16A34A] bg-[#16A34A] text-white shadow-sm hover:bg-[#15803D]"
                                : isCheckout
                                  ? "border border-[#0B7FAE] bg-[#159FD3] text-white shadow-sm hover:bg-[#0B7FAE]"
                                  : isSupport
                                    ? "border border-[#0B7FAE] bg-[#159FD3] text-white shadow-sm hover:bg-[#0B7FAE]"
                                    : "border border-black/10 bg-white text-[#0B7FAE]",
                            )}
                            onClick={() => handleActionClick(action)}
                          >
                            {isAddCart ? <ShoppingCart className="size-3.5" /> : null}
                            {isCheckout ? <ShoppingCart className="size-3.5" /> : null}
                            {isSupport ? <MessageCircle className="size-3.5" /> : null}
                            {action.label}
                          </button>
                        );
                      })}
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
                <div className="mt-4 flex max-w-sm flex-wrap justify-center gap-2">
                  {starterChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="rounded-full border border-[#159FD3]/20 bg-[#E6F7FD] px-3 py-1.5 text-xs font-bold text-[#0B7FAE]"
                      onClick={() => sendMessage(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-black/10 px-3 py-2">
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white pl-4 pr-1.5">
            <input
              className="min-h-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              placeholder="Ask about plans, prices..."
              maxLength={300}
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
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-[#159FD3] text-white transition hover:bg-[#0B7FAE]"
                onClick={stopStreaming}
              >
                <Square className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-[#159FD3] text-white transition hover:bg-[#0B7FAE] disabled:opacity-40"
                disabled={!input.trim()}
                onClick={() => sendMessage()}
              >
                <Send className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (pathname?.startsWith("/admin") || (pathname !== "/" && pathname !== "/plans")) return null;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            data-chat-panel
            className={cn(
              "fixed z-50 flex overflow-hidden bg-white shadow-2xl [overscroll-behavior:contain]",
              expanded
                ? "inset-0 rounded-none"
                : "inset-0 rounded-none lg:inset-auto lg:bottom-24 lg:right-4 lg:h-[620px] lg:max-h-[calc(100dvh-7rem)] lg:w-[min(420px,calc(100vw-2rem))] lg:rounded-3xl lg:border lg:border-black/10",
            )}
            onWheel={(e) => e.stopPropagation()}
          >
            {chatPanel}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setShowHelpBubble(false);
        }}
        data-chat-button
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#159FD3] py-2.5 pl-3 pr-3 text-white shadow-2xl transition hover:bg-[#0B7FAE]"
        aria-label="Open AI chat"
      >
        {showHelpBubble && !open ? (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 0.25 }}
            className="relative h-5 overflow-hidden whitespace-nowrap pl-2 pr-1 text-sm font-bold"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={launcherMessages[launcherMessageIndex]}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22 }}
                className="block"
              >
                {launcherMessages[launcherMessageIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null}
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
          <Bot className="size-5" />
          <span className="absolute right-0 top-0 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#EF4444] ring-2 ring-white">
            <span className="absolute inset-0 rounded-full bg-[#EF4444] opacity-60 animate-ping" />
          </span>
        </span>
      </button>
    </>
  );
}

function PlanSelectionAction({
  action,
  onAdd,
}: {
  action: RecommendedAction;
  onAdd: (items: CartItem[]) => void | Promise<void>;
}) {
  const groups = useMemo(() => action.groups ?? [], [action.groups]);
  const initialSelection = useMemo(() => {
    const selected: Record<string, string[]> = {};
    for (const group of groups) {
      const selectedAvailable = group.options.filter(
        (option) => group.selectedPlanIds?.includes(option.planId) && isAvailableStock(option.stockStatus),
      );
      const firstAvailable = group.options.find((option) => isAvailableStock(option.stockStatus));
      selected[group.productId] = selectedAvailable.length
        ? selectedAvailable.map((option) => option.planId)
        : firstAvailable ? [firstAvailable.planId] : [];
    }
    return selected;
  }, [groups]);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => initialSelection);

  const selectedItems = useMemo<CartItem[]>(() => {
    return groups.flatMap((group) =>
      (selected[group.productId] ?? []).flatMap((planId) => {
        const option = group.options.find((item) => item.planId === planId);
        if (!option) return [];
        return [{
          productId: group.productId,
          productName: group.productName,
          planId: option.planId,
          planName: option.planName,
          realPrice: option.realPrice,
          offerPrice: option.offerPrice ?? null,
          finalPrice: option.finalPrice,
          quantity: group.quantity,
          imageUrl: group.imageUrl ?? null,
          addKey: option.addKey,
        }];
      }),
    );
  }, [groups, selected]);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!groups.length) return null;

  return (
    <div className="mt-2 w-full rounded-2xl border border-[#159FD3]/20 bg-white p-3 text-[#111] shadow-sm">
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.productId}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-[#0B7FAE]">{group.productName}</p>
              <span className="rounded-full bg-[#E6F7FD] px-2 py-0.5 text-xs font-bold text-[#0B7FAE]">
                Qty {group.quantity}
              </span>
            </div>
            <div className="grid gap-2">
              {group.options.map((option) => {
                const available = isAvailableStock(option.stockStatus);
                const checked = (selected[group.productId] ?? []).includes(option.planId);
                return (
                  <label
                    key={option.planId}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-xs transition",
                      checked ? "border-[#159FD3] bg-[#E6F7FD]" : "border-black/10 bg-white",
                      !available && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[#159FD3]"
                      checked={checked}
                      disabled={!available}
                      onChange={(event) => {
                        setSelected((current) => {
                          const currentGroup = current[group.productId] ?? [];
                          const nextGroup = event.target.checked
                            ? [...currentGroup, option.planId]
                            : currentGroup.filter((id) => id !== option.planId);
                          return { ...current, [group.productId]: nextGroup };
                        });
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{option.planName}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[#555]">
                        <span>Rs. {option.finalPrice}</span>
                        <span className={getTokenClassName(option.stockStatus)}>{option.stockStatus}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-4 py-2 text-xs font-black text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!selectedItems.length}
        onClick={() => onAdd(selectedItems)}
      >
        <ShoppingCart className="size-3.5" />
        Add {totalQuantity || ""} to cart
      </button>
    </div>
  );
}

function isAvailableStock(stock: string) {
  return stock === "In Stock" || stock === "Low Stock";
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
      <aside className={cn("chat-sidebar", open ? "open" : "closed", "lg:!translate-x-0")}>
        <Button className="w-full justify-start bg-[#159FD3] text-white hover:bg-[#0B7FAE]" onClick={onNew}>
          <Plus className="size-4" />
          New Chat
        </Button>
        <div className="mt-4 space-y-2">
          {sessions.map((item) => (
            <div
              key={item.id}
              className={cn("chat-sidebar-item", item.id === activeId ? "active" : "")}
            >
              <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => onChoose(item)}>
                {item.title}
              </button>
              <button type="button" aria-label="Delete chat" onClick={() => onDelete(item.id)}>
                <Trash2 className="delete-icon size-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function AssistantMessage({ content }: { content: string }) {
  const cleaned = content.replace(/\[.*?\]\(.*?\)/g, "").replace(/^\[Add .*?\]\s*$/gm, "").trim();
  const blocks = splitMessageBlocks(cleaned);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "table") {
          return <MarkdownTable key={index} lines={block.lines} />;
        }
        const lines = block.text.split("\n").filter((l) => l.trim());
        const bulletLines = lines.filter((l) => /^[-*]\s/.test(l));

        if (bulletLines.length > 0) {
          const heading = lines.filter((l) => !/^[-*]\s/.test(l));
          return (
            <div key={index}>
              {heading.map((h, i) => (
                <p key={i} className="font-semibold">
                  <InlineFormattedText text={h} />
                </p>
              ))}
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {bulletLines.map((line, i) => (
                  <li key={i}>
                    <InlineFormattedText text={line.replace(/^[-*]\s+/, "")} />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            <InlineFormattedText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const rows = lines
    .filter((line) => line.includes("|"))
    .filter((line) => !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim().replace(/\*\*/g, "")),
    );

  if (rows.length < 2) {
    return (
      <p className="whitespace-pre-wrap">
        <InlineFormattedText text={lines.join("\n")} />
      </p>
    );
  }

  const [head, ...body] = rows;

  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-2xl border border-[#159FD3]/20 bg-white shadow-sm">
      <table className="w-auto min-w-[520px] max-w-full table-auto border-collapse text-left text-xs">
        <thead className="bg-[#0B7FAE] text-white">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="border-b border-[#159FD3]/20 px-3 py-3 font-black">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-[#F6FCFF]">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="border-b border-[#159FD3]/10 px-3 py-3 align-top">
                  <InlineFormattedText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineFormattedText({ text }: { text: string }) {
  const tokens = text.split(/(In Stock|Low Stock|Out of Stock|Coming Soon|Best Seller|Yes|No|Rs\.\s?\d+(?:,\d{3})*)/g);

  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null;
        const className = getTokenClassName(token);
        return className ? (
          <span key={index} className={className}>
            {token}
          </span>
        ) : (
          <BoldText key={index} text={token} />
        );
      })}
    </>
  );
}

function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function splitMessageBlocks(content: string) {
  const lines = content.split("\n");
  const blocks: Array<{ type: "text"; text: string } | { type: "table"; lines: string[] }> = [];
  let textLines: string[] = [];
  let tableLines: string[] = [];

  const flushText = () => {
    const text = textLines.join("\n").trim();
    if (text) blocks.push({ type: "text", text });
    textLines = [];
  };

  const flushTable = () => {
    if (tableLines.length) blocks.push({ type: "table", lines: tableLines });
    tableLines = [];
  };

  for (const line of lines) {
    if (isTableLine(line)) {
      flushText();
      tableLines.push(line);
    } else {
      flushTable();
      textLines.push(line);
    }
  }

  flushText();
  flushTable();
  return blocks;
}

function isTableLine(line: string) {
  return line.includes("|") && line.split("|").length >= 3;
}

function getTokenClassName(token: string) {
  const clean = token.trim();
  if (clean === "In Stock" || clean === "Yes") {
    return "inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700";
  }
  if (clean === "Low Stock") {
    return "inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700";
  }
  if (clean === "Out of Stock" || clean === "No") {
    return "inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700";
  }
  if (clean === "Coming Soon") {
    return "inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700";
  }
  if (clean === "Best Seller") {
    return "inline-flex rounded-full bg-[#E6F7FD] px-2 py-0.5 text-xs font-bold text-[#0B7FAE]";
  }
  if (/^Rs\./.test(clean)) {
    return "font-bold text-[#111]";
  }
  return "";
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

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function parseSseEvent(event: string) {
  const lines = event.split("\n");
  const name = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
  const data = lines.find((line) => line.startsWith("data:"))?.replace("data:", "").trim();
  if (!name || !data) return null;
  return { event: name, data };
}

function applyCartRemoval(
  text: string,
  cartItems: CartItem[],
  actions: { decrease: (planId: string) => void; remove: (planId: string) => void },
) {
  const lower = normalizeText(text);
  if (!/\b(remove|delete|decrease|minus|take out)\b/.test(lower)) return null;
  if (!cartItems.length) return { message: "Your cart is already empty." };

  const matches = cartItems.filter((item) => {
    const product = normalizeText(item.productName);
    const plan = normalizeText(item.planName);
    return lower.includes(product) || lower.includes(plan) || lower.includes(`${product} ${plan}`) || lower.includes(`${plan} ${product}`);
  });

  if (!matches.length) {
    return { message: "I could not find that item in your cart. Use View cart to check the current items." };
  }

  const planMatches = matches.filter((item) => lower.includes(normalizeText(item.planName)));
  const uniqueProducts = new Set(matches.map((item) => item.productName.toLowerCase()));
  if (matches.length > 1 && uniqueProducts.size === 1 && planMatches.length !== 1) {
    return { message: planChoiceMessage(matches) };
  }

  const target = planMatches[0] ?? matches[0];
  const quantity = quantityFromRemovalText(lower, normalizeText(target.planName));
  const removeQty = Math.min(quantity ?? target.quantity, target.quantity);
  if (removeQty >= target.quantity) {
    actions.remove(target.planId);
  } else {
    for (let index = 0; index < removeQty; index += 1) actions.decrease(target.planId);
  }

  const label = `${target.productName} ${target.planName}`;
  return {
    message: removeQty >= target.quantity
      ? `Removed ${label} from your cart.`
      : `Removed ${removeQty}× ${label} from your cart.`,
  };
}

function quantityFromRemovalText(text: string, ignoredText: string) {
  const quantityText = ignoredText ? text.replace(ignoredText, " ") : text;
  if (/\ball\b/.test(quantityText)) return null;
  const digit = quantityText.match(/\b(\d+)\b/);
  if (digit) return Number(digit[1]);
  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  for (const [word, value] of Object.entries(words)) {
    if (new RegExp(`\\b${word}\\b`).test(quantityText)) return value;
  }
  return null;
}

function planChoiceMessage(items: CartItem[]) {
  const productName = items[0]?.productName ?? "that product";
  const plans = items
    .map((item) => item.planName)
    .filter((name, index, names) => names.indexOf(name) === index);
  const planList = plans.length > 1 ? plans.join(" or ") : "the exact plan";
  return `I found multiple ${productName} plans in your cart. Which plan should I remove: ${planList}?`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function shouldAutoAddFromConfirmation(text: string, actions: RecommendedAction[]) {
  return (
    confirmationPrompts.has(text.toLowerCase().replace(/\s+/g, " ").trim()) &&
    actions.length === 1 &&
    actions[0]?.type === "add_to_cart"
  );
}
