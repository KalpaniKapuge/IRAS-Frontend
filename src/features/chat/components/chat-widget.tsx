import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useChatStore } from "../store";

function ChatBubble({ sender, content }: { sender: "User" | "Bot"; content: string }) {
  const isBot = sender === "Bot";
  return (
    <div className={cn("flex gap-2", isBot ? "justify-start" : "justify-end")}>
      {isBot && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isBot
            ? "rounded-tl-sm bg-muted text-foreground"
            : "rounded-tr-sm bg-primary text-primary-foreground",
        )}
      >
        {content}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const chatOpen = useUiStore((s) => s.chatOpen);
  const setChatOpen = useUiStore((s) => s.setChatOpen);
  const { messages, isSending, loadHistory, sendMessage } = useChatStore();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) loadHistory();
  }, [chatOpen, loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  const handleSend = () => {
    if (!draft.trim() || isSending) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[32rem] w-[23rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">IRAS Assistant</p>
                <p className="text-[11px] text-muted-foreground">Ask about jobs, skills & applications</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  Hi! Ask me about your resume, skill gaps, applications, or how IRAS works.
                </div>
              )}
              {messages.map((m) => (
                <ChatBubble key={m.messageId} sender={m.sender} content={m.content} />
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Assistant is typing…
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question…"
              className="h-10"
            />
            <Button size="icon" onClick={handleSend} disabled={isSending || !draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={() => setChatOpen(!chatOpen)}
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-elevated"
        aria-label="Toggle chat assistant"
      >
        {chatOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </Button>
    </>
  );
}
