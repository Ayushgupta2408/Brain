import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import Footer from "../components/Footer.jsx";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <ChatWindow />
      </div>
      <Footer />
    </div>
  );
}
