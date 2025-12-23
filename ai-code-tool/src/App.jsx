import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; 
import './index.css';

const genAI = new GoogleGenerativeAI(import.meta.env.Gemini); // API Key Setup

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("Python");

  // Function to handle Enter key press for "Explain Code"
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey && code && !loading) {
        event.preventDefault(); // Prevent new line in textarea
        handleAIAction('explain');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [code, loading]); // Re-run effect if code or loading state changes

const handleAIAction = async (taskType) => {
  if (!code.trim()) return alert("Please enter some code!");
  setLoading(true);
  try {
    // Model version 
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


    const prompt = taskType === 'explain' 
      ? `Explain this code logic line by line: \n${code}`
      : `Convert this code to ${targetLang}: \n${code}`;

    // Generate content call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      setOutput(text);
    } else {
      setOutput("AI could not generate a response. Try again.");
    }
  } catch (error) {
    console.error("DETAILED ERROR:", error);
    // User-friendly error message
    setOutput("Connection Error: Please check if your API Key is active in Google AI Studio.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>aiCode</h1>
        <p className="tagline">Your AI-powered Code Explainer & Converter</p>
      </header>

      <div className="input-section">
        <textarea
          className="code-input"
          placeholder="Paste your code here and press Enter to Explain..."
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
            {loading ? <span className="spinner"></span> : "Explain Code"}
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
              <option value="Go">Go</option>
            </select>
            <button
              className="action-button convert-button"
              onClick={() => handleAIAction('convert')}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : `Convert to ${targetLang}`}
            </button>
          </div>
        </div>
      </div>

      {output && (
        <div className="output-section fadeIn">
          <h2>AI Response:</h2>
          <pre className="code-output">
            <code>{output}</code>
          </pre>
        </div>
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} aiCodeExplainer. Powered by SS team.</p>
      </footer>
    </div>
  );
}

export default App;