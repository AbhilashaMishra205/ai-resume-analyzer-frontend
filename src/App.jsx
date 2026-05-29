import { useState } from "react";
import axios from "axios";
import "./App.css";

// PDF + DOCX imports
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const API_BASE = "https://ai-resume-backend-d41d.onrender.com/api";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // FILE UPLOAD HANDLER
  // -------------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      extractPDF(file);
    } else if (ext === "docx") {
      extractDOCX(file);
    } else {
      alert("Unsupported file type. Upload PDF or DOCX.");
    }
  };

  // -------------------------------
  // PDF EXTRACTION
  // -------------------------------
  const extractPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      setResumeText(text);
    };
    reader.readAsArrayBuffer(file);
  };

  // -------------------------------
  // DOCX EXTRACTION
  // -------------------------------
  const extractDOCX = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      setResumeText(result.value);
    };
    reader.readAsArrayBuffer(file);
  };

  // -------------------------------
  // ANALYZE RESUME
  // -------------------------------
  const analyzeResume = async () => {
    if (!resumeText || !jobDescription) {
      return alert("Please fill both fields");
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/analyze`, {
        resumeText,
        jobDescription,
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error analyzing resume");
    }
    setLoading(false);
  };

  // -------------------------------
  // AI FEATURES
  // -------------------------------
  const rewriteSummary = async () => {
    const summary = prompt("Paste your current resume summary:");
    if (!summary) return;

    try {
      const response = await axios.post(`${API_BASE}/rewrite-summary`, {
        summary,
        jobDescription,
      });

      alert("Rewritten Summary:\n\n" + response.data.rewritten);
    } catch (err) {
      alert("Error rewriting summary");
    }
  };

  const rewriteBullet = async () => {
    const bullet = prompt("Paste the bullet point you want to rewrite:");
    if (!bullet) return;

    try {
      const response = await axios.post(`${API_BASE}/rewrite-bullet`, {
        bullet,
        jobDescription,
      });

      alert("Improved Bullet:\n\n" + response.data.rewritten);
    } catch (err) {
      alert("Error rewriting bullet");
    }
  };

  const explainMissingSkills = async () => {
    if (!result?.missingSkills?.length) {
      return alert("Analyze resume first.");
    }

    try {
      const response = await axios.post(`${API_BASE}/explain-skills`, {
        missingSkills: result.missingSkills,
        jobDescription,
      });

      alert("Skill Explanation:\n\n" + response.data.explanation);
    } catch (err) {
      alert("Error explaining skills");
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>

      {/* FILE UPLOAD */}
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="file-input"
      />

      <div className="input-section">
        <textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <textarea
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button onClick={analyzeResume} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* AI FEATURE BUTTONS */}
      <div className="ai-buttons">
        <button onClick={rewriteSummary} className="secondary-btn">
          Rewrite Summary
        </button>

        <button onClick={rewriteBullet} className="secondary-btn">
          Rewrite Bullet Point
        </button>

        <button onClick={explainMissingSkills} className="secondary-btn">
          Explain Missing Skills
        </button>
      </div>

      {result && (
        <div className="result-box">
          <h2>Match Score: {result.score}%</h2>

          <h3>Matched Skills</h3>
          <div className="chips">
            {result.matchedSkills.map((skill, i) => (
              <span key={i} className="chip green">
                {skill}
              </span>
            ))}
          </div>

          <h3>Missing Skills</h3>
          <div className="chips">
            {result.missingSkills.map((skill, i) => (
              <span key={i} className="chip red">
                {skill}
              </span>
            ))}
          </div>

          <h3>Summary</h3>
          <p>{result.summary}</p>

          <h3>Suggestions</h3>
          <ul>
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
