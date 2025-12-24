import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; 
import './index.css';

// 1. API Key initialize 
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("Python");

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && event.ctrlKey && code && !loading) {
        event.preventDefault();
        handleAIAction('explain');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [code, loading]);

  const handleAIAction = async (taskType) => {
    if (!code.trim()) return alert("Please enter some code!");
    
    setLoading(true);
    setOutput("AI is thinking..."); 

    try {
      // 2. Model initialization 
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" },{apiVersion: "v1"});

      const promptText = taskType === 'explain' 
        ? `Explain this code logic line by line in simple terms: \n\n${code}`
        : `Strictly convert this code to ${targetLang}. Only provide the code, no extra text: \n\n${code}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      });

      const response = await result.response;
      const text = response.text();

      setOutput(text);

    } catch (error) {
      console.error("AI ERROR:", error);
      // Checking API key "API key not valid" 
      setOutput("Error: " + (error.message.includes("API key") ? "Invalid API Key. Please check your key." : error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AICodeExplainer</h1>
        <p className="tagline">Your AI-powered Code Explainer & Converter</p>
      </header>

      <div className="input-section">
        <textarea
          className="code-input"
          placeholder="Paste your code here... (Ctrl + Enter to Explain)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows="10"
        />
        <div className="controls">
          <button
            className="action-button explain-button"
            onClick={() => handleAIAction('explain')}
            disabled={loading}
          >
            {loading ? "Processing..." : "Explain Code"}
          </button>

          <div className="convert-group">
            <select
              className="lang-select"
              onChange={(e) => setTargetLang(e.target.value)}
              value={targetLang}
            >
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="PHP">PHP</option>
            </select>
            <button
              className="action-button convert-button"
              onClick={() => handleAIAction('convert')}
              disabled={loading}
            >
              {loading ? "..." : `Convert to ${targetLang}`}
            </button>
          </div>
        </div>
      </div>

      {output && (
        <div className="output-section">
          <h2>AI Response:</h2>
          <div className="code-output-container">
            <pre className="code-output">
              <code>{output}</code>
            </pre>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} aiCodeExplainer. Powered by SS team.</p>
      </footer>
    </div>
  );
}

export default App;