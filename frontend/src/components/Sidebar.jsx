import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice.js";
import { startNewChat } from "../store/chatSlice.js";

export default function Sidebar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-surface flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-signal/20 border border-signal flex items-center justify-center">
          <span className="text-signal font-display font-bold text-sm">B</span>
        </div>
        <span className="font-display font-semibold tracking-wide text-lg">Brain</span>
      </div>

      <button
        onClick={() => dispatch(startNewChat())}
        className="mx-4 mt-4 rounded-lg border border-signal/40 text-signal hover:bg-signal/10 transition-colors py-2 text-sm font-medium"
      >
        + New chat
      </button>

      <div className="flex-1 px-4 mt-6 text-xs text-muted uppercase tracking-wide">
        Recent sessions
      </div>
      <div className="flex-1 px-4 py-2 text-sm text-muted">No saved sessions yet</div>

      <div className="border-t border-line px-4 py-4 flex items-center justify-between">
        <div className="text-sm truncate">
          <div className="font-medium text-ink truncate">{user?.name}</div>
          <div className="text-muted text-xs truncate">{user?.email}</div>
        </div>
        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className="text-xs text-muted hover:text-pulse transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
