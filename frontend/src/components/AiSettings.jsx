import { useState, useEffect } from 'react';

function AiSettings() {
  const [hostUrl, setHostUrl] = useState('http://localhost:11434');
  const [model, setModel] = useState('llama3');
  const [systemPrompt, setSystemPrompt] = useState('Du bist ein professioneller Eismacher und Experte für kreative Eisrezepte.');
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);


  useEffect(() => {
    // Fetch settings from server
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.ai_host_url) setHostUrl(data.ai_host_url);
        if (data.ai_model) setModel(data.ai_model);
        if (data.ai_system_prompt) setSystemPrompt(data.ai_system_prompt);
      })
      .catch(err => console.error('Fehler beim Laden der Einstellungen:', err));
  }, []);


  const fetchModels = async (url) => {
    setIsLoadingModels(true);
    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostUrl: url })
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
      } else {
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Modelle:', error);
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchModels(hostUrl);
    }
  }, [isOpen]);

  const handleHostUrlChange = (e) => {
    const newUrl = e.target.value;
    setHostUrl(newUrl);
  };

  const handleHostUrlBlur = () => {
    fetchModels(hostUrl);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_host_url: hostUrl,
          ai_model: model,
          ai_system_prompt: systemPrompt
        })
      });
      if (response.ok) {
        alert('AI-Einstellungen gespeichert!');
        setIsOpen(false);
      } else {
        alert('Fehler beim Speichern der Einstellungen.');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Netzwerkfehler beim Speichern der Einstellungen.');
    }
  };


  return (
    <>
      <button
        className="settings-gear-btn"
        onClick={() => setIsOpen(true)}
        title="AI Einstellungen"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤖 AI Einstellungen</h2>
              <button className="modal-close" onClick={() => setIsOpen(false)}>✖</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSave} className="recipe-form">
                <div className="form-group">
                  <label htmlFor="hostUrl">Ollama Host URL</label>
                  <input
                    type="url"
                    id="hostUrl"
                    className="form-control"
                    placeholder="http://localhost:11434"
                    value={hostUrl}
                    onChange={handleHostUrlChange}
                    onBlur={handleHostUrlBlur}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model {isLoadingModels && '⏳'}</label>
                  <input
                    type="text"
                    id="model"
                    list="model-list"
                    className="form-control"
                    placeholder="z.B. llama3, mistral, gemma"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <datalist id="model-list">
                    {availableModels.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  {availableModels.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                      <strong>Verfügbare Modelle:</strong>
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                        {availableModels.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="systemPrompt">System Prompt</label>
                  <textarea
                    id="systemPrompt"
                    className="form-control"
                    rows="4"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Einstellungen speichern 💾
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AiSettings;
