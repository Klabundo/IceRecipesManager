import { useState, useEffect } from 'react';

function AiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState('Du bist ein professioneller Eismacher und Experte für kreative Eisrezepte.');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('ai_api_key');
    const storedModel = localStorage.getItem('ai_model');
    const storedSystemPrompt = localStorage.getItem('ai_system_prompt');

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedModel) setModel(storedModel);
    if (storedSystemPrompt) setSystemPrompt(storedSystemPrompt);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('ai_api_key', apiKey);
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
            <label htmlFor="apiKey">OpenAI API Key</label>
            <input
              type="password"
              id="apiKey"
              className="form-control"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              className="form-control"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-4o">gpt-4o</option>
            </select>
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
