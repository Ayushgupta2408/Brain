import { FileDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MessageBubble({ role, content, file }) {
  const isUser = role === "user";
  const isImage = file?.filename?.match(/\.(png|jpg|jpeg|webp)$/i);

  const fileUrl = file?.url
    ? file.url.startsWith("http")
      ? file.url
      : `${API_URL}${file.url}`
    : null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-signal text-white rounded-br-sm"
            : "bg-surface2 border border-line text-ink rounded-bl-sm"
        }`}
      >
        {content}

        {fileUrl && isImage && (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="block mt-3">
            <img
              src={fileUrl}
              alt={file.prompt || "Generated image"}
              className="rounded-lg border border-line max-w-full"
            />
          </a>
        )}

        {fileUrl && !isImage && (
          <a
            href={fileUrl}
            download
            className="mt-3 flex items-center gap-2 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2 text-xs text-signal hover:bg-signal/20 transition-colors w-fit"
          >
            <FileDown size={14} />
            Download {file.filename}
          </a>
        )}
      </div>
    </div>
  );
}