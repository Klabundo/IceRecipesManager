import { useState, useEffect } from 'react';

function AiSettings() {
  const [hostUrl, setHostUrl] = useState('http://localhost:11434');
  const [model, setModel] = useState('llama3');
  const [systemPrompt, setSystemPrompt] = useState('Du bist ein professioneller Eismacher und Experte für kreative Eisrezepte.');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const storedHostUrl = localStorage.getItem('ai_host_url');
    const storedModel = localStorage.getItem('ai_model');
    const storedSystemPrompt = localStorage.getItem('ai_system_prompt');

    if (storedHostUrl) setHostUrl(storedHostUrl);
    if (storedModel) setModel(storedModel);
    if (storedSystemPrompt) setSystemPrompt(storedSystemPrompt);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('ai_host_url', hostUrl);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_system_prompt', systemPrompt);
    alert('AI-Einstellungen gespeichert!');
  };

  return (
    <div className="card settings-section" style={{ marginTop: '1rem' }}>
      <h2
        className="section-title"
        style={{ cursor: 'pointer', marginBottom: isExpanded ? '1rem' : '0' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        🤖 AI Einstellungen {isExpanded ? '🔽' : '▶️'}
      </h2>

      {isExpanded && (
        <form onSubmit={handleSave} className="recipe-form">
          <div className="form-group">
            <label htmlFor="hostUrl">Ollama Host URL</label>
            <input
              type="url"
              id="hostUrl"
              className="form-control"
              placeholder="http://localhost:11434"
              value={hostUrl}
              onChange={(e) => setHostUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              className="form-control"
              placeholder="z.B. llama3, mistral, gemma"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="systemPrompt">System Prompt</label>
            <textarea
              id="systemPrompt"
              className="form-control"
              rows="3"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Einstellungen speichern 💾
          </button>
        </form>
      )}
    </div>
  );
}

export default AiSettings;
