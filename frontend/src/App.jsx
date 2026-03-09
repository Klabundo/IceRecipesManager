import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicView from './components/PublicView';
import ManagerView from './components/ManagerView';
import VotePage from './components/VotePage';
import CommentPage from './components/CommentPage';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <Toaster position="bottom-center" toastOptions={{ style: { background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-light)' } }} />
      <header className="app-header">
        <h1>✨ Eis-Rezepte</h1>
        <p>Die süßeste Sammlung der Welt</p>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/manager" element={<ManagerView />} />
          <Route path="/vote/:id" element={<VotePage />} />
          <Route path="/comment/:id" element={<CommentPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
