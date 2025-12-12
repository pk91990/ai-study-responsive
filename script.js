
const API_KEY =  localStorage.getItem("GEMINI_API_KEY");

    if (!API_KEY) {
      window.location.href = "index.html";
    }

    function logout() {
      localStorage.removeItem("GEMINI_API_KEY");
      window.location.href = "index.html";
    }
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const taskList = document.getElementById("taskList");
const recalcBtn = document.getElementById("recalcBtn");

let studyPlan = [];

/* ================= CHAT SYSTEM ================= */


// ELEMENTS
const container = document.querySelector('.container');
const planner = document.querySelector('.smart-planner');
const study = document.querySelector('.study-sidebar');
const quiz = document.querySelector('.quiz-sidebar');
const taskGenerator = document.querySelector('.task-main');
const chatbotContainer = document.querySelector('.chatbot-main');
const quizContainer = document.querySelector('.quiz-container');
const nav = document.getElementById('nav');
const sidebar = document.querySelector('.sidebar');

// MOBILE NAV BUTTONS
const mobNav = document.querySelector('.mobile-bottom-nav');
const mobplanner = document.querySelector('#mob-planner');
const mobstudy = document.querySelector('#mob-study');
const mobquize = document.querySelector('#mob-quize');

// ------------------------
// AUTO LAYOUT SWITCH
// ------------------------
function handleLayout() {
  if (window.innerWidth <= 680) {
    sidebar.style.display = 'none';
    nav.style.display = 'none';
    mobNav.style.display = 'flex';
  } else {
    sidebar.style.display = 'block';
    nav.style.display = 'block';
    mobNav.style.display = 'none';
  }
}

// Run on load
handleLayout();

// Run on window resize
window.addEventListener('resize', handleLayout);

// ------------------------
// SIDEBAR TOGGLE (Desktop)
// ------------------------
nav.addEventListener('click', () => {
  if (window.innerWidth <= 380) {
    sidebar.style.display = 'none';
    nav.style.display = 'none';
  } else {
    sidebar.style.display =
      sidebar.style.display === 'none' ? 'block' : 'none';
  }
});

// ------------------------
// MOBILE NAV BUTTONS
// ------------------------
mobplanner.addEventListener('click', () => {
  taskGenerator.style.display = 'block';
  chatbotContainer.style.display = 'none';
  quizContainer.style.display = 'none';
});

mobstudy.addEventListener('click', () => {
  taskGenerator.style.display = 'none';
  chatbotContainer.style.display = 'block';
  quizContainer.style.display = 'none';
});

mobquize.addEventListener('click', () => {
  taskGenerator.style.display = 'none';
  chatbotContainer.style.display = 'none';
  quizContainer.style.display = 'block';
});

// ------------------------
// SIDEBAR BUTTONS
// ------------------------
planner.addEventListener('click', () => {
  taskGenerator.style.display = 'block';
  chatbotContainer.style.display = 'none';
  quizContainer.style.display = 'none';
});

study.addEventListener('click', () => {
  taskGenerator.style.display = 'none';
  chatbotContainer.style.display = 'flex';
  quizContainer.style.display = 'none';
});

quiz.addEventListener('click', () => {
  taskGenerator.style.display = 'none';
  chatbotContainer.style.display = 'none';
  quizContainer.style.display = 'block';
});





// Send message on Enter key
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && userInput.value.trim()) {
    sendMessage();
  }
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";
  showLoading();

  const response = await geminiRequest(`
You are an expert AI Study Assistant specializing in DSA (Data Structures & Algorithms), C Programming, Operating Systems, and competitive programming.

User Query: "${message}"
`);
  
  removeLoading();
  addMessage(response, "bot");
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = marked.parse(text);

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // render LaTeX after message loads
  renderMathInElement(div, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ]
  });

  
}


function saveChatHistory(text) {
  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];

  // Limit title preview
  const title = text.slice(0, 40) + (text.length > 40 ? "..." : "");

  history.push({ title, fullChat: chatMessages.innerHTML });
  localStorage.setItem("chatHistory", JSON.stringify(history));

  loadChatHistory();
}




function showLoading() {
  const div = document.createElement("div");
  div.id = "loading";
  div.className = "message bot";
  div.innerHTML = "Typing...";




  chatMessages.appendChild(div);
}

function removeLoading() {
  const elem = document.getElementById("loading");
  if (elem) elem.remove();
}

/* ================= GEMINI API HANDLER ================= */

async function geminiRequest(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    }
  );

  const data = await response.json();
  
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          || data?.candidates?.[0]?.content?.parts?.[0]?.markdown
          || "⚠ No response.";

  // Clean code blocks if present
  return text.replace(/```json|```/g, "").trim();
}


/* ================= STUDY PLAN GENERATION ================= */

////================= Generate Initial Study Plan =========

async function geminiRequestP(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const data = await response.json();

  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Cleanup if Gemini wraps in code blocks
  text = text.replace(/```json|```/g, "").trim();

  return text;
}












document.getElementById("generateBtn").onclick = generatePlan;
recalcBtn.onclick = recalcPlan;
async function generatePlan() {
  const subjects = document.getElementById("subjects").value.trim();
  const hours = document.getElementById("hours").value.trim();
  const examDate = document.getElementById("examDate").value.trim();

  if (!subjects || !hours || !examDate) {
    alert("Please fill all inputs.");
    return;
  }

  showLoader(true);

  const prompt = `
You are an AI Study Planner.

🛑 IMPORTANT RULES:
- The plan MUST end on the exam date.
- Do NOT create more days than the total number of days available.
- If exam is in 30 days, plan must be exactly 30 days.
- Never extend beyond the exam date.

User Inputs:
Subjects: ${subjects}
Daily Hours: ${hours}
Exam Date: ${examDate}
Today's Date: ${new Date().toISOString().split("T")[0]}

Calculate number of days between today and exam.
Then distribute subjects evenly across those days.
Include revision in last 20% of days.

Return STRICT JSON ONLY (no text outside JSON):

[
 { "day": "Day 1", "date": "YYYY-MM-DD", "task": "Subject - Chapter/Topic", "status": "pending" }
]
`

  const result = await geminiRequestP(prompt);
  console.log(result);
  

  try {
    studyPlan = JSON.parse(result);
    savePlan();
    displayPlan();
    recalcBtn.style.display = "block";
  } catch (err) {
    taskList.innerHTML = "⚠ Invalid JSON from Gemini:<br><br>" + result;
  }

  showLoader(false);
}
/* ================= DISPLAY PLAN ================= */

function displayPlan() {
  if (!studyPlan.length) return taskList.innerHTML = "No plan yet.";

  taskList.innerHTML = "";

  studyPlan.forEach((task, i) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <b>${task.day}</b> - ${task.task}
      <select onchange="updateStatus(${i}, this.value)">
        <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
        <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
        <option value="missed" ${task.status === "missed" ? "selected" : ""}>Missed</option>
      </select>
    `;

    taskList.appendChild(div);
  });
}

/* ================= UPDATE STATUS ================= */

function updateStatus(index, status) {
  studyPlan[index].status = status;
  savePlan();
  displayPlan();
}

/* ================= STORAGE ================= */

function savePlan() {
  localStorage.setItem("studyPlan", JSON.stringify(studyPlan));
}

function loadPlan() {
  const data = localStorage.getItem("studyPlan");
  if (data) {
    studyPlan = JSON.parse(data);
    displayPlan();
  }
}
loadPlan();

/* ================= SMART RECALC (MISSED TASKS) ================= */

async function recalcPlan() {
  showLoader(true);

  const missed = studyPlan.filter(t => t.status === "missed").map(t => t.task);

  if (missed.length === 0) {
    alert("No missed tasks!");
    showLoader(false);
    return;
  }

  const prompt = `
You are a Study Schedule Repair AI.

Missed Tasks: ${missed.join(", ")}

Rules:
- Reassign them later, closer to exam.
- Mark repeated tasks with "risk": true.
- Status must become pending.
- Output JSON only.
`;

  const result = await geminiRequestP(prompt);

  try {
    studyPlan = JSON.parse(result);
    savePlan();
    displayPlan();
  } catch {
    taskList.innerHTML = "⚠ Error parsing JSON: <br><br>" + result;
  }

  showLoader(false);
}

/* ================= LOADER UI ================= */

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
}

/* ================= QUIZ GENERATOR ================= */

const WEAK_TOPICS_KEY = "ai_quiz_weak_topics";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

let currentQuiz = [];

// Quiz DOM Elements
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const difficultySelect = document.getElementById("difficulty");
const numQuestionsInput = document.getElementById("numQuestions");
const formatSelect = document.getElementById("format");
const generateBtnQuiz = document.getElementById("generateBtn-quiz");
const loadWeakBtn = document.getElementById("loadWeakBtn");
const statusEl = document.getElementById("status");
const quizContainerEl = document.getElementById("quizContainer");
const submitBtn = document.getElementById("submitBtn");
const resultsEl = document.getElementById("results");
const weakTopicsDisplay = document.getElementById("weakTopicsDisplay");

generateBtnQuiz.addEventListener("click", generateQuizFromGemini);
submitBtn.addEventListener("click", evaluateQuiz);
loadWeakBtn.addEventListener("click", loadWeakTopics);

function loadWeakTopics() {
  try {
    const raw = localStorage.getItem(WEAK_TOPICS_KEY);
    const weakMap = raw ? JSON.parse(raw) : {};
    const topics = Object.keys(weakMap);
    
    if (topics.length === 0) {
      statusEl.textContent = "No weak topics saved yet. Take a quiz first.";
      statusEl.classList.add("error");
      return;
    }
    
    topicInput.value = topics.slice(0, 5).join(", ");
    statusEl.textContent = "Weak topics loaded into topic field. Click 'Generate Quiz with Gemini'.";
    statusEl.classList.remove("error");
  } catch (e) {
    console.error("Error loading weak topics", e);
  }
}

function renderWeakTopics() {
  try {
    const raw = localStorage.getItem(WEAK_TOPICS_KEY);
    const weakMap = raw ? JSON.parse(raw) : {};
    const topics = Object.entries(weakMap).sort((a, b) => b[1] - a[1]);
    
    if (topics.length === 0) {
      weakTopicsDisplay.innerHTML = '<span style="color:#9ca3af;">No weak topics saved yet. Take a quiz and your mistakes will appear here.</span>';
      return;
    }
    
    let html = '<div>These topics need more practice:</div>';
    html += '<div class="weak-topics-list">';
    topics.forEach(([tag, count]) => {
      html += `<span class="badge">${tag}<span>×${count}</span></span>`;
    });
    html += '</div>';
    weakTopicsDisplay.innerHTML = html;
  } catch (e) {
    console.error("Error rendering weak topics", e);
  }
}

renderWeakTopics();

function extractJson(text) {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

async function generateQuizFromGemini() {
  const subject = subjectInput.value.trim() || "General";
  const topic = topicInput.value.trim() || "Basics";
  const difficulty = difficultySelect.value;
  const numQuestions = Number(numQuestionsInput.value) || 5;
  const format = formatSelect.value;

  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    statusEl.textContent = "❌ Please set your Gemini API key in the code.";
    statusEl.classList.add("error");
    return;
  }

  statusEl.textContent = "Calling Gemini to generate questions...";
  statusEl.classList.remove("error");
  generateBtnQuiz.disabled = true;
  submitBtn.style.display = "none";
  quizContainerEl.innerHTML = "";

  const prompt = `
You are a strict quiz generator.

Generate exactly ${numQuestions} questions for:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question format: ${format}

Return output ONLY as valid JSON. NO extra text outside JSON.

JSON schema:
{
  "subject": "string",
  "topic": "string",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "id": 1,
      "type": "mcq" | "short",
      "question": "string",
      "options": ["A", "B", "C", "D"] | [],
      "answer": "string",
      "explanation": "string",
      "topicTag": "string"
    }
  ]
}
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const url = `${GEMINI_URL}?key=${encodeURIComponent(API_KEY)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error (${res.status})`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const jsonString = extractJson(text);
    const quizJson = JSON.parse(jsonString);
    
    statusEl.textContent = "✅ Quiz generated successfully.";
    renderQuiz(quizJson);
  } catch (e) {
    console.error(e);
    statusEl.textContent = "❌ " + e.message;
    statusEl.classList.add("error");
  } finally {
    generateBtnQuiz.disabled = false;
  }
}

function renderQuiz(quizJson) {
  const questions = quizJson.questions || [];
  currentQuiz = questions;
  quizContainerEl.innerHTML = "";
  resultsEl.style.display = "none";
  submitBtn.style.display = questions.length > 0 ? "inline-flex" : "none";

  if (questions.length === 0) {
    quizContainerEl.innerHTML = '<div style="font-size:13px;color:#9ca3af;">No questions generated.</div>';
    return;
  }

  questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const header = document.createElement("div");
    header.className = "question-header";

    const qText = document.createElement("div");
    qText.className = "question-text";
    qText.textContent = `${idx + 1}. ${q.question}`;

    const meta = document.createElement("div");
    meta.className = "question-meta";
    meta.textContent = `${q.type.toUpperCase()} • ${q.topicTag || "General"}`;

    header.appendChild(qText);
    header.appendChild(meta);
    card.appendChild(header);

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "options";

    if (q.type === "mcq" && Array.isArray(q.options) && q.options.length) {
      q.options.forEach((opt, i) => {
        const label = document.createElement("label");
        label.className = "option-label";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q_${idx}`;
        input.value = opt;
        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        optionsDiv.appendChild(label);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.name = `q_${idx}`;
      textarea.placeholder = "Type your answer here...";
      optionsDiv.appendChild(textarea);
    }

    card.appendChild(optionsDiv);

    const feedback = document.createElement("div");
    feedback.className = "answer-feedback";
    feedback.id = `feedback_${idx}`;
    card.appendChild(feedback);

    quizContainerEl.appendChild(card);
  });
}

function evaluateQuiz() {
  if (!currentQuiz.length) return;

  let correctCount = 0;
  const total = currentQuiz.length;
  const weakMap = {};
  const incorrectTopicTags = [];

  currentQuiz.forEach((q, idx) => {
    const feedbackEl = document.getElementById(`feedback_${idx}`);
    feedbackEl.innerHTML = "";

    let userAnswer = "";
    if (q.type === "mcq") {
      const selected = document.querySelector(`input[name="q_${idx}"]:checked`);
      userAnswer = selected ? selected.value.trim() : "";
    } else {
      const textarea = document.querySelector(`textarea[name="q_${idx}"]`);
      userAnswer = textarea ? textarea.value.trim() : "";
    }

    const ideal = (q.answer || "").trim();

    if (!userAnswer) {
      feedbackEl.innerHTML = `<span class="incorrect">No answer given.</span><div class="explanation">Correct: <strong>${ideal}</strong><br>${q.explanation || ""}</div>`;
      incorrectTopicTags.push(q.topicTag || q.question.slice(0, 40));
      return;
    }

    let isCorrect = false;
    if (q.type === "mcq") {
      isCorrect = userAnswer.toLowerCase() === ideal.toLowerCase();
    } else {
      isCorrect = userAnswer.toLowerCase() === ideal.toLowerCase() || 
                  userAnswer.toLowerCase().includes(ideal.toLowerCase()) ||
                  ideal.toLowerCase().includes(userAnswer.toLowerCase());
    }

    if (isCorrect) {
      correctCount++;
      feedbackEl.innerHTML = `<span class="correct">✔ Correct!</span>` + 
        (q.explanation ? `<div class="explanation">${q.explanation}</div>` : "");
    } else {
      feedbackEl.innerHTML = `<span class="incorrect">✖ Incorrect.</span><div class="explanation">Your: <strong>${userAnswer}</strong><br>Correct: <strong>${ideal}</strong><br>${q.explanation || ""}</div>`;
      incorrectTopicTags.push(q.topicTag || q.question.slice(0, 40));
    }
  });

  // Update weak topics
  try {
    const raw = localStorage.getItem(WEAK_TOPICS_KEY);
    const savedMap = raw ? JSON.parse(raw) : {};
    incorrectTopicTags.forEach((tag) => {
      if (tag) savedMap[tag] = (savedMap[tag] || 0) + 1;
    });
    localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(savedMap));
    renderWeakTopics();
  } catch (e) {
    console.error("Error saving weak topics", e);
  }

  const percentage = total ? Math.round((correctCount / total) * 100) : 0;
  resultsEl.style.display = "block";
  resultsEl.innerHTML = `
    <div><strong>Score:</strong> ${correctCount} / ${total} (${percentage}%)</div>
    <div style="margin-top:8px;">
      <strong>Summary:</strong> ${
        percentage >= 80
          ? "Great job! Keep challenging yourself with harder quizzes."
          : percentage >= 50
          ? "Not bad. Focus on the weak topics highlighted below."
          : "Needs improvement. Use the weak topics section for targeted practice."
      }
    </div>
  `;
}

