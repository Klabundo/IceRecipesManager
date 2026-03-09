import { Routes, Route } from 'react-router-dom';
import PublicView from './components/PublicView';
import ManagerView from './components/ManagerView';
import VotePage from './components/VotePage';
import CommentPage from './components/CommentPage';
import './index.css';

function App() {
  return (
    <div className="app-container">
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
