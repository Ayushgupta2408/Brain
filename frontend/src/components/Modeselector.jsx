import {
  Zap,
  MessageSquare,
  Code2,
  FileText,
  Presentation,
  Image as ImageIcon,
  Search,
} from "lucide-react";

export const MODES = [
  {
    id: "auto",
    label: "Auto",
    icon: Zap,
    placeholder: "Ask Brain anything...",
    directive:
      "Auto mode: infer the best response type yourself — code, explanation, or plain answer.",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    placeholder: "Ask a question...",
    directive: "Chat mode: respond conversationally, no code unless explicitly asked.",
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code2,
    placeholder: "Describe the code you need...",
    directive:
      "Coding mode: prioritize a complete, runnable code solution. Prefer JavaScript when the language isn't specified, since the Executor agent can run it.",
  },
  {
    id: "pdf",
    label: "PDF",
    icon: FileText,
    placeholder: "Describe the document to structure...",
    directive:
      "PDF mode: structure the answer as a document — clear headings, sections, and a logical reading order suitable for exporting to PDF.",
  },
  {
    id: "ppt",
    label: "PPT",
    icon: Presentation,
    placeholder: "Describe the presentation to outline...",
    directive:
      "PPT mode: structure the answer as a slide-by-slide outline — one slide title with 2-4 bullet points each, no dense paragraphs.",
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    placeholder: "Describe the image to generate...",
    directive:
      "Image mode: respond with ONLY a single, vivid, well-composed image-generation prompt (subject, style, lighting, composition) — no preamble, no explanation, no markdown. This exact text is sent directly to an image generator.",
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    placeholder: "What do you want to look into?",
    directive:
      "Search mode: lean heavily on the Retriever agent's context, cite which retrieved chunk supports each claim, and flag anything not covered by retrieved context as unverified.",
  },
];

export default function ModeSelector({ activeMode, onChange, disabled }) {
  return (
    <div
      role="tablist"
      aria-label="Response mode"
      className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 w-fit"
    >
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = mode.id === activeMode;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive
                ? "bg-signal text-white shadow-node"
                : "text-muted hover:text-ink hover:bg-surface2"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}