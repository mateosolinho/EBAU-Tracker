const STORAGE_KEY = "ebau-tracker-exercises";
const EXAMS_STORAGE_KEY = "ebau-tracker-exams";
const TARGETS_STORAGE_KEY = "ebau-tracker-target-scores";
const MIN_ATTEMPTS_FOR_CONFIDENCE = 3;
const PDF_DB_NAME = "ebau-tracker-pdf-registry";
const PDF_STORE_NAME = "pdf-files";
const EXERCISE_IMAGE_STORE_NAME = "exercise-images";
let pdfRegistryCache = [];

const form = document.getElementById("exercise-form");
const feedback = document.getElementById("form-feedback");
const exerciseSubmitButton = document.getElementById("exercise-submit");
const exerciseCancelEditButton = document.getElementById("exercise-cancel-edit");
const historyList = document.getElementById("history-list");
const examForm = document.getElementById("exam-form");
const examFeedback = document.getElementById("exam-feedback");
const examSubmitButton = document.getElementById("exam-submit");
const examCancelEditButton = document.getElementById("exam-cancel-edit");
const examHistoryList = document.getElementById("exam-history-list");
const exerciseExamLinkInput = document.getElementById("exerciseExamLink");
const exerciseScreenshotInput = document.getElementById("exerciseScreenshot");
const exerciseScreenshotFeedback = document.getElementById("exercise-screenshot-feedback");
const examSubjectInput = document.getElementById("examSubject");
const examWeakBlockInput = document.getElementById("examWeakBlock");
const examPdfLinkInput = document.getElementById("examPdfLink");
const examTargetScoreInput = document.getElementById("exam-target-score");

const modeButtons = {
  practice: document.getElementById("mode-practice"),
  exam: document.getElementById("mode-exam"),
};
const modePanels = document.querySelectorAll(".mode-panel");

const subjectViewButtons = {
  global: {
    Mate: document.getElementById("global-subject-mate"),
    Fisica: document.getElementById("global-subject-fisica"),
  },
  exam: {
    Mate: document.getElementById("exam-view-mate"),
    Fisica: document.getElementById("exam-view-fisica"),
  },
};

const viewState = {
  practiceSubject: "Mate",
  examSubject: "Mate",
};

const filters = {
  block: document.getElementById("filter-block"),
  result: document.getElementById("filter-result"),
  from: document.getElementById("filter-from"),
  to: document.getElementById("filter-to"),
  onlyErrors: document.getElementById("filter-only-errors"),
};

const outputs = {
  totalAccuracy: document.getElementById("total-accuracy"),
  totalExercises: document.getElementById("total-exercises"),
  avgTime: document.getElementById("avg-time"),
  accuracy7d: document.getElementById("accuracy-7d"),
  studyStreak: document.getElementById("study-streak"),
  riskIndex: document.getElementById("risk-index"),
  topicAccuracy: document.getElementById("topic-accuracy"),
  topErrors: document.getElementById("top-errors"),
  weakTopics: document.getElementById("weak-topics"),
  priorityMessage: document.getElementById("priority-message"),
  focusPlan: document.getElementById("focus-plan"),
  rulesReview: document.getElementById("rules-review"),
  priorityConfidence: document.getElementById("priority-confidence"),
};

const exportJsonCurrentButton = document.getElementById("export-json-current");
const exportExamsJsonMateButton = document.getElementById("export-exams-json-mate");
const exportExamsJsonFisicaButton = document.getElementById("export-exams-json-fisica");
const importExamButton = document.getElementById("import-exam-btn");
const examImportFileInput = document.getElementById("exam-import-file");
const pdfRegistryList = document.getElementById("pdf-registry-list");
const pdfRegistryFeedback = document.getElementById("pdf-registry-feedback");
const clearHistoryLinkedButton = document.getElementById("clear-history-linked");
const clearHistoryLinkedWrap = document.getElementById("clear-history-linked-wrap");
const dashboardToggle = document.getElementById("dashboard-toggle");
const dashboardContent = document.getElementById("dashboard-content");
const dashboardSection = document.getElementById("practice-dashboard-card");
const practiceQuickActions = document.getElementById("practice-quick-actions");
const openDashboardModalButton = document.getElementById("open-dashboard-modal");
const openImportModalButton = document.getElementById("open-import-modal");
const closeDashboardModalButton = document.getElementById("close-dashboard-modal");
const closeImportModalButton = document.getElementById("close-import-modal");
const closeFilePreviewModalButton = document.getElementById("close-file-preview-modal");
const dashboardModal = document.getElementById("dashboard-modal");
const importModal = document.getElementById("import-modal");
const filePreviewModal = document.getElementById("file-preview-modal");
const filePreviewContent = document.getElementById("file-preview-content");
const subjectInput = document.getElementById("subject");
const ebauBlockInput = document.getElementById("ebauBlock");
const ebauSubtypeInput = document.getElementById("ebauSubtype");

const examOutputs = {
  avgScore: document.getElementById("exam-avg-score"),
  bestScore: document.getElementById("exam-best-score"),
  lastScore: document.getElementById("exam-last-score"),
  scoreGap: document.getElementById("exam-score-gap"),
};

const resultLabel = {
  ok: "✔ Acierto",
  fail: "❌ Fallo",
  warn: "⚠️ Duda parcial",
  pending: "⏳ Pendiente",
};

let historyLinkedExamFilter = "";
let historyLinkedExamName = "";
let editingExerciseId = "";
let editingExamId = "";
let activePreviewObjectUrl = "";

const SUBJECT_KEYWORDS = {
  Mate: [
    "derivada",
    "tangente",
    "concavidad",
    "maximo",
    "minimo",
    "integral",
    "gauss",
    "determinante",
    "matriz",
    "probabilidad",
    "bayes",
    "recta",
    "plano",
  ],
  Fisica: [
    "newton",
    "fuerza",
    "dinamica",
    "cinematica",
    "mrua",
    "velocidad",
    "aceleracion",
    "trabajo",
    "energia",
    "onda",
    "electrico",
    "ohm",
    "circuito",
    "gravitatorio",
  ],
};

const BLOCK_KEYWORDS = {
  Mate: {
    Analisis: ["derivada", "tangente", "concavidad", "maximo", "minimo", "funcion", "limite"],
    "Algebra lineal": ["gauss", "determinante", "matriz", "sistema", "inversa", "rango"],
    Geometria: ["recta", "plano", "distancia", "angulo", "vector"],
    Probabilidad: ["probabilidad", "bayes", "suceso", "condicionada"],
    Integrales: ["integral", "primitiva", "area"],
  },
  Fisica: {
    Cinematica: ["mru", "mrua", "velocidad", "aceleracion", "trayectoria", "tiempo"],
    Dinamica: ["newton", "fuerza", "rozamiento", "plano inclinado", "masa"],
    "Trabajo y energia": ["trabajo", "energia", "potencial", "cinetica", "conservacion"],
    "Campo gravitatorio / electrico": ["campo", "potencial", "gravitatorio", "electrico", "coulomb"],
    Ondas: ["onda", "frecuencia", "longitud de onda", "amplitud"],
    Electricidad: ["ohm", "resistencia", "intensidad", "voltaje", "circuito"],
  },
};

const SUBJECT_STRUCTURES = {
  Mate: {
    label: "Mate II",
    blocks: {
      Analisis: {
        weight: 0.45,
        subtypes: [
          "Derivadas (calculo directo)",
          "Estudio de funcion",
          "Recta tangente",
        ],
      },
      "Algebra lineal": {
        weight: 0.225,
        subtypes: [
          "Sistemas (Gauss)",
          "Determinantes",
          "Inversa",
          "Discusion de sistemas",
        ],
      },
      Geometria: {
        weight: 0.175,
        subtypes: [
          "Rectas y planos",
          "Posiciones relativas",
          "Distancias",
          "Angulos",
        ],
      },
      Probabilidad: {
        weight: 0.125,
        subtypes: ["Simple", "Condicionada", "Bayes"],
      },
      Integrales: {
        weight: 0.125,
        subtypes: ["Integrales basicas", "Area bajo curva"],
      },
    },
  },
  Fisica: {
    label: "Fisica",
    blocks: {
      Cinematica: {
        weight: 0.16,
        subtypes: ["MRU / MRUA", "Movimiento parabolico"],
      },
      Dinamica: {
        weight: 0.22,
        subtypes: ["Leyes de Newton", "Fuerzas", "Planos inclinados"],
      },
      "Trabajo y energia": {
        weight: 0.22,
        subtypes: [
          "Energia cinetica/potencial",
          "Conservacion de la energia",
        ],
      },
      "Campo gravitatorio / electrico": {
        weight: 0.14,
        subtypes: ["Fuerzas", "Potencial"],
      },
      Ondas: {
        weight: 0.13,
        subtypes: ["Frecuencia", "Longitud de onda"],
      },
      Electricidad: {
        weight: 0.13,
        subtypes: ["Ley de Ohm", "Circuitos"],
      },
    },
  },
};

outputs.ebauScore = document.getElementById("ebau-score");
outputs.ebauPriority = document.getElementById("ebau-priority");
outputs.ebauBreakdown = document.getElementById("ebau-breakdown");

function setSubtypeOptionsForBlock(blockName) {
  const subjectConfig = SUBJECT_STRUCTURES[subjectInput.value];
  ebauSubtypeInput.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";

  if (!subjectConfig || !blockName || !subjectConfig.blocks[blockName]) {
    placeholder.textContent = "Selecciona bloque primero";
    ebauSubtypeInput.appendChild(placeholder);
    ebauSubtypeInput.value = "";
    return;
  }

  placeholder.textContent = "Selecciona";
  ebauSubtypeInput.appendChild(placeholder);

  for (const subtype of subjectConfig.blocks[blockName].subtypes) {
    const option = document.createElement("option");
    option.value = subtype;
    option.textContent = subtype;
    ebauSubtypeInput.appendChild(option);
  }
}

function syncEbauInputsForSubject() {
  const subjectConfig = SUBJECT_STRUCTURES[subjectInput.value];
  const hasStructuredBlocks = Boolean(subjectConfig);

  ebauBlockInput.disabled = !hasStructuredBlocks;
  ebauSubtypeInput.disabled = !hasStructuredBlocks;
  ebauBlockInput.innerHTML = "";

  const noApplyOption = document.createElement("option");
  noApplyOption.value = "";
  noApplyOption.textContent = hasStructuredBlocks
    ? "Selecciona"
    : "No aplica";
  ebauBlockInput.appendChild(noApplyOption);

  if (!hasStructuredBlocks) {
    setSubtypeOptionsForBlock("");
    return;
  }

  for (const [blockName, blockConfig] of Object.entries(subjectConfig.blocks)) {
    const option = document.createElement("option");
    option.value = blockName;
    option.textContent = `${blockName} (${Math.round(blockConfig.weight * 100)}%)`;
    ebauBlockInput.appendChild(option);
  }

  setSubtypeOptionsForBlock(ebauBlockInput.value);
}

function readExercises() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeExercises(exercises) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
}

function readExams() {
  try {
    const data = JSON.parse(localStorage.getItem(EXAMS_STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeExams(exams) {
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
}

function readTargets() {
  try {
    const data = JSON.parse(localStorage.getItem(TARGETS_STORAGE_KEY) || "{}");
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {};
  }
}

function writeTargets(targets) {
  localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets));
}

function formatExamLabel(exam) {
  const score = Number.isFinite(Number(exam.score)) ? Number(exam.score).toFixed(2) : "-";
  return `${exam.date} · ${exam.examType} · ${score}`;
}

function renderExerciseExamOptions(subject, keepValue = "") {
  if (!exerciseExamLinkInput) {
    return;
  }

  const exams = readExams()
    .filter((exam) => exam.subject === subject)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  exerciseExamLinkInput.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = exams.length ? "Sin relacionar" : "Sin examenes en esta asignatura";
  exerciseExamLinkInput.appendChild(defaultOption);

  for (const exam of exams) {
    const option = document.createElement("option");
    option.value = exam.id;
    option.textContent = formatExamLabel(exam);
    exerciseExamLinkInput.appendChild(option);
  }

  exerciseExamLinkInput.value = exams.some((exam) => exam.id === keepValue) ? keepValue : "";
}

function setExamWeakBlockOptions(subject, keepValue = "") {
  examWeakBlockInput.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";

  const subjectConfig = SUBJECT_STRUCTURES[subject];
  if (!subjectConfig) {
    placeholder.textContent = "Selecciona asignatura primero";
    examWeakBlockInput.appendChild(placeholder);
    examWeakBlockInput.value = "";
    return;
  }

  placeholder.textContent = "Selecciona";
  examWeakBlockInput.appendChild(placeholder);
  for (const blockName of Object.keys(subjectConfig.blocks)) {
    const option = document.createElement("option");
    option.value = blockName;
    option.textContent = blockName;
    examWeakBlockInput.appendChild(option);
  }

  examWeakBlockInput.value = keepValue;
}

function parseDate(dateText) {
  if (!dateText) {
    return null;
  }
  const date = new Date(`${dateText}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(firstDate, secondDate) {
  const millisPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((firstDate - secondDate) / millisPerDay);
}

function asPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function asRiskLabel(score) {
  if (score >= 65) {
    return "Alto";
  }
  if (score >= 40) {
    return "Medio";
  }
  return "Bajo";
}

function buildExercise(formData, screenshotRecord = null) {
  const learnedRule = String(formData.get("learnedRule") || "").trim();
  const exactEbauType = String(formData.get("exactEbauType") || "").trim();
  const linkedExamId = String(formData.get("exerciseExamLink") || "");
  const linkedExam = readExams().find((exam) => exam.id === linkedExamId);

  return {
    id: crypto.randomUUID(),
    date: String(formData.get("date") || ""),
    subject: viewState.practiceSubject || String(formData.get("subject") || ""),
    exerciseType: "Ejercicio",
    ebauBlock: String(formData.get("ebauBlock") || ""),
    ebauSubtype: String(formData.get("ebauSubtype") || ""),
    result: String(formData.get("result") || ""),
    minutes: Number(formData.get("minutes") || 0),
    recognitionSpeed: "",
    confidenceLevel: String(formData.get("confidenceLevel") || ""),
    mainError: String(formData.get("mainError") || ""),
    errorPhase: String(formData.get("errorPhase") || ""),
    exerciseExamId: linkedExam?.id || "",
    exerciseExamLabel: linkedExam ? formatExamLabel(linkedExam) : "",
    sourcePdfId: linkedExam?.examPdfId || "",
    sourcePdfName: linkedExam?.examPdfName || "",
    exerciseImageId: screenshotRecord?.id || "",
    exerciseImageName: screenshotRecord?.name || "",
    exactEbauType,
    learnedRule,
    createdAt: Date.now(),
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function openPdfRegistryDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PDF_DB_NAME, 2);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        db.createObjectStore(PDF_STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(EXERCISE_IMAGE_STORE_NAME)) {
        db.createObjectStore(EXERCISE_IMAGE_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveExerciseImageRecord(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    return null;
  }

  const record = {
    id: crypto.randomUUID(),
    name: file.name || "captura-ejercicio",
    type: file.type || "image/png",
    size: file.size,
    uploadedAt: Date.now(),
    fileBlob: file,
  };

  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(EXERCISE_IMAGE_STORE_NAME, "readwrite");
    transaction.objectStore(EXERCISE_IMAGE_STORE_NAME).put(record);
    await completeTransaction(transaction);
    return record;
  } finally {
    db.close();
  }
}

async function getExerciseImageRecord(id) {
  if (!id) {
    return null;
  }

  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(EXERCISE_IMAGE_STORE_NAME, "readonly");
    const request = transaction.objectStore(EXERCISE_IMAGE_STORE_NAME).get(id);
    const record = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    await completeTransaction(transaction);
    return record;
  } finally {
    db.close();
  }
}

async function deleteExerciseImageRecord(id) {
  if (!id) {
    return;
  }

  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(EXERCISE_IMAGE_STORE_NAME, "readwrite");
    transaction.objectStore(EXERCISE_IMAGE_STORE_NAME).delete(id);
    await completeTransaction(transaction);
  } finally {
    db.close();
  }
}

async function openExerciseImageRecord(id, fallbackName = "captura-ejercicio") {
  const record = await getExerciseImageRecord(id);
  if (!record?.fileBlob) {
    feedback.textContent = "No se encontro la captura asociada a este ejercicio.";
    return;
  }

  const blob = new Blob([record.fileBlob], { type: record.type || "image/png" });
  showFilePreview(blob, record.type || "image/png", record.name || fallbackName);
}

function clearFilePreview() {
  if (activePreviewObjectUrl) {
    URL.revokeObjectURL(activePreviewObjectUrl);
    activePreviewObjectUrl = "";
  }
  if (filePreviewContent) {
    filePreviewContent.innerHTML = "";
  }
}

function showFilePreview(blob, mimeType, fileName = "archivo") {
  if (!filePreviewModal || !filePreviewContent || !blob) {
    return;
  }

  clearFilePreview();

  const objectUrl = URL.createObjectURL(blob);
  activePreviewObjectUrl = objectUrl;

  if (String(mimeType || "").startsWith("image/")) {
    const image = document.createElement("img");
    image.className = "file-preview-image";
    image.src = objectUrl;
    image.alt = fileName;
    filePreviewContent.appendChild(image);
  } else {
    const frame = document.createElement("iframe");
    frame.className = "file-preview-frame";
    frame.src = objectUrl;
    frame.title = fileName;
    filePreviewContent.appendChild(frame);
  }

  openModal(filePreviewModal);
}

function closeFilePreview() {
  closeModal(filePreviewModal);
  clearFilePreview();
}

function completeTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("Transaccion abortada"));
  });
}

async function getStoredPdfs() {
  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(PDF_STORE_NAME, "readonly");
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.getAll();
    const records = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    await completeTransaction(transaction);
    return records.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } finally {
    db.close();
  }
}

async function savePdfRecord(file) {
  if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
    return null;
  }

  const record = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type || "application/pdf",
    size: file.size,
    uploadedAt: Date.now(),
    fileBlob: file,
  };

  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(PDF_STORE_NAME, "readwrite");
    const store = transaction.objectStore(PDF_STORE_NAME);
    store.put(record);
    await completeTransaction(transaction);
    return record;
  } finally {
    db.close();
  }
}

async function deletePdfRecord(id) {
  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(PDF_STORE_NAME, "readwrite");
    transaction.objectStore(PDF_STORE_NAME).delete(id);
    await completeTransaction(transaction);
  } finally {
    db.close();
  }
}

async function getPdfRecordById(id) {
  if (!id) {
    return null;
  }

  const db = await openPdfRegistryDb();
  try {
    const transaction = db.transaction(PDF_STORE_NAME, "readonly");
    const request = transaction.objectStore(PDF_STORE_NAME).get(id);
    const record = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    await completeTransaction(transaction);
    return record;
  } finally {
    db.close();
  }
}

function openPdfRecord(record, fallbackName = "examen.pdf") {
  if (!record?.fileBlob) {
    return;
  }

  const blob = new Blob([record.fileBlob], { type: record.type || "application/pdf" });
  showFilePreview(blob, record.type || "application/pdf", record.name || fallbackName);
}

async function openPdfById(id, fallbackName = "examen.pdf") {
  const record = await getPdfRecordById(id);
  if (!record?.fileBlob) {
    feedback.textContent = "No se encontro el PDF asociado.";
    return;
  }
  openPdfRecord(record, fallbackName);
}

function downloadPdfRecord(record) {
  if (!record?.fileBlob) {
    return;
  }
  const blob = new Blob([record.fileBlob], { type: record.type || "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = record.name || "examen.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

function renderExamPdfOptions(records) {
  if (!examPdfLinkInput) {
    return;
  }

  const previousValue = examPdfLinkInput.value;
  examPdfLinkInput.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Sin asociar";
  examPdfLinkInput.appendChild(defaultOption);

  for (const record of records) {
    const option = document.createElement("option");
    option.value = record.id;
    option.textContent = record.name;
    examPdfLinkInput.appendChild(option);
  }

  examPdfLinkInput.value = records.some((record) => record.id === previousValue)
    ? previousValue
    : "";
}

async function renderPdfRegistry() {
  if (!pdfRegistryList) {
    return;
  }
  pdfRegistryList.innerHTML = "";

  try {
    const records = await getStoredPdfs();
    pdfRegistryCache = records;
    renderExamPdfOptions(records);

    const exerciseCounts = readExercises().reduce((acc, exercise) => {
      if (exercise.sourcePdfId) {
        acc[exercise.sourcePdfId] = (acc[exercise.sourcePdfId] || 0) + 1;
      }
      return acc;
    }, {});

    const examCounts = readExams().reduce((acc, exam) => {
      if (exam.examPdfId) {
        acc[exam.examPdfId] = (acc[exam.examPdfId] || 0) + 1;
      }
      return acc;
    }, {});

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "pdf-item-meta";
      empty.textContent = "Todavia no hay PDFs guardados.";
      pdfRegistryList.appendChild(empty);
      return;
    }

    for (const record of records) {
      const item = document.createElement("article");
      item.className = "pdf-item";

      const title = document.createElement("h4");
      title.className = "pdf-item-title";
      title.textContent = record.name;

      const meta = document.createElement("p");
      meta.className = "pdf-item-meta";
      const dateText = new Date(record.uploadedAt).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const linkedExercises = exerciseCounts[record.id] || 0;
      const linkedExams = examCounts[record.id] || 0;
      meta.textContent =
        `${formatBytes(record.size)} • ${dateText} • ` +
        `${linkedExercises} ejercicios • ${linkedExams} examenes vinculados`;

      const actions = document.createElement("div");
      actions.className = "pdf-item-actions";
      actions.append(
        createItemActionButton("Ver", "edit", () => openPdfRecord(record, record.name || "examen.pdf")),
        createItemActionButton("Descargar", "edit", () => downloadPdfRecord(record)),
        createItemActionButton("Borrar", "delete", async () => {
          const linkedExercises = exerciseCounts[record.id] || 0;
          const linkedExams = examCounts[record.id] || 0;
          const shouldDelete = window.confirm(
            `¿Borrar PDF ${record.name}? Vinculos: ${linkedExercises} ejercicios, ${linkedExams} examenes.`
          );
          if (!shouldDelete) {
            return;
          }
          await deletePdfRecord(record.id);
          pdfRegistryFeedback.textContent = "PDF eliminado del registro.";
          renderPdfRegistry();
        })
      );

      item.append(title, meta, actions);
      pdfRegistryList.appendChild(item);
    }
  } catch {
    const error = document.createElement("p");
    error.className = "pdf-item-meta";
    error.textContent = "No se pudo cargar el registro de PDFs.";
    pdfRegistryList.appendChild(error);
  }
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pickSubjectByText(text) {
  const normalized = normalizeText(text);
  let bestSubject = "Mate";
  let bestScore = -1;

  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    const score = keywords.reduce(
      (acc, keyword) => acc + (normalized.includes(normalizeText(keyword)) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  }

  return bestSubject;
}

function pickBlockAndSubtype(questionText, subject) {
  const normalized = normalizeText(questionText);
  const subjectBlocks = BLOCK_KEYWORDS[subject] || {};
  let bestBlock = Object.keys(SUBJECT_STRUCTURES[subject]?.blocks || {})[0] || "";
  let bestScore = -1;

  for (const [block, keywords] of Object.entries(subjectBlocks)) {
    const score = keywords.reduce(
      (acc, keyword) => acc + (normalized.includes(normalizeText(keyword)) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestBlock = block;
    }
  }

  const subtypes = SUBJECT_STRUCTURES[subject]?.blocks?.[bestBlock]?.subtypes || [];
  let bestSubtype = subtypes[0] || "";
  let subtypeScore = -1;
  for (const subtype of subtypes) {
    const cleanSubtype = normalizeText(subtype);
    let score = 0;
    for (const token of cleanSubtype.split(/[^a-z0-9]+/).filter((token) => token.length > 3)) {
      if (normalized.includes(token)) {
        score += 1;
      }
    }
    if (score > subtypeScore) {
      subtypeScore = score;
      bestSubtype = subtype;
    }
  }

  return { block: bestBlock, subtype: bestSubtype };
}

function extractQuestionChunks(examText) {
  const cleanText = String(examText || "").replace(/\r/g, "");
  const markers = [];
  const regex = /(?:^|\n)\s*(?:ejercicio\s*)?(\d{1,2}|[ivxlcdm]+)[\)\.:\-]\s+/gim;
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    markers.push({ index: match.index, label: String(match[1]).trim() });
  }

  if (markers.length < 2) {
    const fallback = cleanText
      .split(/\n\n+/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 50)
      .slice(0, 12)
      .map((chunk, index) => ({ label: String(index + 1), prompt: chunk }));
    return fallback;
  }

  const chunks = [];
  for (let i = 0; i < markers.length; i += 1) {
    const start = markers[i].index;
    const end = markers[i + 1] ? markers[i + 1].index : cleanText.length;
    const prompt = cleanText.slice(start, end).trim();
    if (prompt.length > 15) {
      chunks.push({ label: markers[i].label, prompt });
    }
  }
  return chunks.slice(0, 16);
}

async function extractTextFromPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("pdf.js no esta disponible ahora mismo");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

async function extractTextFromFile(file) {
  const extension = (file.name.split(".").pop() || "").toLowerCase();

  if (extension === "pdf") {
    return extractTextFromPdf(file);
  }

  return file.text();
}

function buildImportedExercisesFromText(examText, sourcePdf = null) {
  const subject = pickSubjectByText(examText);
  const today = new Date().toISOString().slice(0, 10);
  const chunks = extractQuestionChunks(examText);

  return chunks.map((chunk) => {
    const guess = pickBlockAndSubtype(chunk.prompt, subject);
    const shortPrompt = chunk.prompt.replace(/\s+/g, " ").slice(0, 90);

    return {
      id: crypto.randomUUID(),
      date: today,
      subject,
      exerciseType: "Problema largo",
      ebauBlock: guess.block,
      ebauSubtype: guess.subtype,
      result: "pending",
      minutes: 0,
      recognitionSpeed: "",
      confidenceLevel: "",
      mainError: "Pendiente de resolver",
      errorPhase: "",
      exactEbauType: shortPrompt,
      learnedRule: "",
      createdAt: Date.now(),
      importedFromExam: true,
      sourceQuestion: chunk.label,
      sourcePdfId: sourcePdf?.id || "",
      sourcePdfName: sourcePdf?.name || "",
    };
  });
}

function buildExamAttempt(formData) {
  const linkedPdfId = String(formData.get("examPdfLink") || "");
  const linkedPdfRecord = pdfRegistryCache.find((record) => record.id === linkedPdfId);

  return {
    id: crypto.randomUUID(),
    date: String(formData.get("examDate") || ""),
    subject: String(formData.get("examSubject") || ""),
    examType: String(formData.get("examType") || ""),
    score: Number(formData.get("examScore") || 0),
    minutes: Number(formData.get("examMinutes") || 0),
    weakBlock: String(formData.get("examWeakBlock") || "").trim(),
    examPdfId: linkedPdfRecord?.id || "",
    examPdfName: linkedPdfRecord?.name || "",
    mainError: String(formData.get("examMainError") || ""),
    actionPlan: String(formData.get("examActionPlan") || "").trim(),
    createdAt: Date.now(),
  };
}

function makeTextEntry(label, value) {
  const fragment = document.createDocumentFragment();
  fragment.append(document.createTextNode(`${label}: `));
  const strong = document.createElement("strong");
  strong.textContent = value;
  fragment.append(strong);
  return fragment;
}

function calculateStreak(exercises) {
  if (!exercises.length) {
    return 0;
  }

  const uniqueDays = new Set(exercises.map((ex) => ex.date));
  const sortedDays = [...uniqueDays].sort((a, b) => b.localeCompare(a));
  if (!sortedDays.length) {
    return 0;
  }

  let streak = 1;
  let previous = parseDate(sortedDays[0]);

  for (let index = 1; index < sortedDays.length; index += 1) {
    const current = parseDate(sortedDays[index]);
    if (!previous || !current) {
      break;
    }

    if (daysBetween(previous, current) === 1) {
      streak += 1;
      previous = current;
      continue;
    }
    break;
  }

  return streak;
}

function calculateDashboard(exercises, activeSubject) {
  const scoredExercises = exercises.filter((exercise) => ["ok", "fail", "warn"].includes(exercise.result));
  const total = scoredExercises.length;
  const okCount = scoredExercises.filter((e) => e.result === "ok").length;
  const avgTime = total
    ? Math.round(scoredExercises.reduce((sum, e) => sum + e.minutes, 0) / total)
    : 0;

  const byBlock = new Map();
  const byError = new Map();
  const byRule = new Map();
  const byErrorPhase = new Map();
  const bySubjectBlock = new Map(
    Object.entries(SUBJECT_STRUCTURES).map(([subjectKey, subjectConfig]) => [
      subjectKey,
      new Map(
        Object.keys(subjectConfig.blocks).map((blockName) => [
          blockName,
          { ok: 0, total: 0 },
        ])
      ),
    ])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 13);

  const last7 = [];
  const last14 = [];

  for (const ex of scoredExercises) {
    const blockKey = ex.ebauBlock || "Sin bloque oficial";
    if (!byBlock.has(blockKey)) {
      byBlock.set(blockKey, { ok: 0, total: 0, failOrWarn: 0 });
    }
    const blockStats = byBlock.get(blockKey);
    blockStats.total += 1;
    if (ex.result === "ok") {
      blockStats.ok += 1;
    } else {
      blockStats.failOrWarn += 1;
    }

    byError.set(ex.mainError, (byError.get(ex.mainError) || 0) + 1);

    if (ex.learnedRule) {
      byRule.set(ex.learnedRule, (byRule.get(ex.learnedRule) || 0) + 1);
    }

    if (ex.errorPhase) {
      byErrorPhase.set(ex.errorPhase, (byErrorPhase.get(ex.errorPhase) || 0) + 1);
    }

    const subjectMap = bySubjectBlock.get(ex.subject);
    if (subjectMap && ex.ebauBlock && subjectMap.has(ex.ebauBlock)) {
      const blockStats = subjectMap.get(ex.ebauBlock);
      blockStats.total += 1;
      if (ex.result === "ok") {
        blockStats.ok += 1;
      }
    }

    const exDate = parseDate(ex.date);
    if (!exDate) {
      continue;
    }
    if (exDate >= sevenDaysAgo) {
      last7.push(ex);
    }
    if (exDate >= fourteenDaysAgo) {
      last14.push(ex);
    }
  }

  const blockRows = [...byBlock.entries()]
    .map(([block, stats]) => ({
      block,
      accuracy: stats.ok / stats.total,
      total: stats.total,
      failOrWarn: stats.failOrWarn,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const topErrors = [...byError.entries()]
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const weakBlocks = blockRows
    .filter((row) => row.total >= 2 && row.accuracy < 0.65)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const rulesToReview = [...byRule.entries()]
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topErrorPhases = [...byErrorPhase.entries()]
    .map(([phase, count]) => ({ phase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const ok7 = last7.filter((ex) => ex.result === "ok").length;
  const accuracy7d = last7.length ? ok7 / last7.length : 0;

  const riskFails = last14.filter((ex) => ex.result === "fail").length;
  const riskWarn = last14.filter((ex) => ex.result === "warn").length;
  const riskScoreRaw =
    last14.length === 0
      ? 0
      : ((riskFails * 1.2 + riskWarn * 0.7) / last14.length) * 50 +
        (topErrors[0]?.count || 0) * 3;
  const riskScore = Math.min(100, Math.round(riskScoreRaw));

  const candidatePriority = [...blockRows]
    .sort((a, b) => b.failOrWarn - a.failOrWarn || a.accuracy - b.accuracy)
    .find((row) => row.failOrWarn > 0);

  const priorityByPractice =
    candidatePriority && candidatePriority.total >= MIN_ATTEMPTS_FOR_CONFIDENCE
      ? candidatePriority
      : null;

  const priorityConfidence = priorityByPractice
    ? "alta"
    : candidatePriority
      ? "baja (muestra pequena)"
      : "sin datos";

  const subjectSummaries = [];
  const weightedBreakdown = [];
  for (const [subjectKey, subjectConfig] of Object.entries(SUBJECT_STRUCTURES)) {
    const subjectMap = bySubjectBlock.get(subjectKey);
    let subjectScore = 0;
    let subjectAttempts = 0;

    for (const [blockName, blockConfig] of Object.entries(subjectConfig.blocks)) {
      const stats = subjectMap.get(blockName);
      const accuracy = stats.total ? stats.ok / stats.total : 0;
      subjectScore += blockConfig.weight * accuracy;
      subjectAttempts += stats.total;

      weightedBreakdown.push({
        subject: subjectKey,
        blockName,
        weight: blockConfig.weight,
        accuracy,
        total: stats.total,
        roiGap: blockConfig.weight * (1 - accuracy),
      });
    }

    subjectSummaries.push({
      subject: subjectKey,
      label: subjectConfig.label,
      score: subjectScore,
      attempts: subjectAttempts,
    });
  }

  const activeSubjects = new Set(
    exercises
      .map((exercise) => exercise.subject)
      .filter((subjectName) => Boolean(SUBJECT_STRUCTURES[subjectName]))
  );

  let priorityPool = weightedBreakdown.filter((row) => activeSubjects.has(row.subject));
  if (!priorityPool.length) {
    priorityPool = weightedBreakdown.filter((row) => row.subject === activeSubject);
  }
  const ebauPriority = [...priorityPool].sort((a, b) => b.roiGap - a.roiGap)[0];

  return {
    total,
    totalAccuracy: total ? okCount / total : 0,
    avgTime,
    accuracy7d,
    streak: calculateStreak(scoredExercises),
    riskScore,
    blockRows,
    topErrors,
    weakBlocks,
    rulesToReview,
    topErrorPhases,
    candidatePriority,
    priorityByPractice,
    priorityConfidence,
    topError: topErrors[0]?.error || "",
    subjectSummaries,
    ebauPriority,
    ebauBreakdown: weightedBreakdown,
  };
}

function getPracticeSubjectExercises(exercises) {
  return exercises.filter((exercise) => exercise.subject === viewState.practiceSubject);
}

function getExamSubjectAttempts(exams) {
  return exams.filter((exam) => exam.subject === viewState.examSubject);
}

function getExamPressure(subject, exams, targetScore) {
  const recent = exams
    .filter((exam) => exam.subject === subject)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 2);

  if (!recent.length) {
    return null;
  }

  const [latest, previous] = recent;
  const repeatedWeakBlock =
    latest.weakBlock && previous && latest.weakBlock === previous.weakBlock;

  const belowTarget =
    typeof targetScore === "number" && Number.isFinite(targetScore)
      ? latest.score < targetScore
      : latest.score < 7;

  if (repeatedWeakBlock || belowTarget) {
    return {
      block: latest.weakBlock || "",
      error: latest.mainError || "",
      reason: repeatedWeakBlock
        ? "bloque flojo repetido en examenes"
        : "ultimo examen por debajo del objetivo",
    };
  }

  return null;
}

function renderList(container, items, renderItem, emptyMessage) {
  container.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = emptyMessage;
    container.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    renderItem(li, item);
    container.appendChild(li);
  }
}

function getFocusPlan(data, priorityBlock, priorityError) {
  if (!data.total) {
    return [
      "Empieza con 3 ejercicios hoy: 1 facil, 1 medio, 1 examen real.",
      "Registra siempre el error principal aunque aciertes.",
      "Escribe 1 regla concreta al final de cada bloque.",
    ];
  }

  const blockText = priorityBlock
    ? `30 min en ${priorityBlock}`
    : "30 min en el bloque que peor domines";

  const errorToDrill = priorityError || data.topError || "Error de calculo";

  return [
    `${blockText} con 3 ejercicios de examen y correccion completa.`,
    `10 min de micro-practica para atacar: ${errorToDrill}.`,
    "5 min finales para consolidar 1 regla aprendida en una ficha.",
  ];
}

function renderDashboard(exercises, exams) {
  const filteredBySubject = getPracticeSubjectExercises(exercises);
  const data = calculateDashboard(filteredBySubject, viewState.practiceSubject);
  const targetScores = readTargets();
  const targetForSubject = Number(targetScores[viewState.practiceSubject]);
  const examPressure = getExamPressure(viewState.practiceSubject, exams, targetForSubject);

  const resolvedPriorityBlock =
    examPressure?.block || data.priorityByPractice?.block || data.candidatePriority?.block || "";
  const resolvedPriorityError = examPressure?.error || data.topError;

  outputs.totalExercises.textContent = String(data.total);
  outputs.totalAccuracy.textContent = asPercent(data.totalAccuracy);
  outputs.avgTime.textContent = `${data.avgTime} min`;
  outputs.accuracy7d.textContent = asPercent(data.accuracy7d);
  outputs.studyStreak.textContent = `${data.streak} dias`;
  outputs.riskIndex.textContent =
    data.total >= 15
      ? `${asRiskLabel(data.riskScore)} (${data.riskScore})`
      : "Insuficiente (<15)";

  renderList(
    outputs.topicAccuracy,
    data.blockRows,
    (li, row) => {
      li.append(makeTextEntry(row.block, `${asPercent(row.accuracy)} (${row.total})`));
    },
    "Aun sin bloques registrados"
  );

  renderList(
    outputs.topErrors,
    data.topErrors,
    (li, row) => {
      li.append(makeTextEntry(row.error, String(row.count)));
    },
    "Aun sin errores registrados"
  );

  renderList(
    outputs.weakTopics,
    data.weakBlocks,
    (li, row) => {
      li.append(makeTextEntry(row.block, asPercent(row.accuracy)));
    },
    "No hay bloques debiles detectados"
  );

  if (!data.total) {
    outputs.priorityMessage.textContent =
      "Prioridad de hoy: crear base de datos inicial con al menos 5 ejercicios reales.";
  } else if (resolvedPriorityBlock) {
    const examReason = examPressure ? ` por ${examPressure.reason}` : "";
    outputs.priorityMessage.textContent =
      `Prioridad de hoy: reforzar ${resolvedPriorityBlock}${examReason}.`;
  } else {
    outputs.priorityMessage.textContent =
      "Prioridad de hoy: mantener consistencia y subir velocidad sin perder precision.";
  }

  outputs.priorityConfidence.textContent =
    `Confianza de prioridad: ${data.priorityConfidence}` +
    `${examPressure ? " | reforzada por examen reciente" : ""}`;

  renderList(
    outputs.focusPlan,
    getFocusPlan(data, resolvedPriorityBlock, resolvedPriorityError),
    (li, step) => {
      li.textContent = step;
    },
    "Sin plan por ahora"
  );

  renderList(
    outputs.rulesReview,
    data.rulesToReview,
    (li, row) => {
      li.append(makeTextEntry(row.rule, `${row.count} repeticiones`));
    },
    "Aun no hay reglas aprendidas"
  );

  const selectedSummary = data.subjectSummaries.find(
    (summary) => summary.subject === viewState.practiceSubject
  );

  outputs.ebauScore.textContent =
    `Indice ponderado ${selectedSummary?.label || viewState.practiceSubject}: ` +
    `${selectedSummary?.attempts ? asPercent(selectedSummary.score) : "sin datos"}`;

  if (data.ebauPriority) {
    outputs.ebauPriority.textContent =
      `Prioridad ROI: ${data.ebauPriority.subject} - ${data.ebauPriority.blockName} (${Math.round(data.ebauPriority.weight * 100)}% examen)`;
  } else {
    outputs.ebauPriority.textContent = `Prioridad ROI: registra ejercicios de ${viewState.practiceSubject}`;
  }

  renderList(
    outputs.ebauBreakdown,
    data.ebauBreakdown.filter((row) => row.subject === viewState.practiceSubject),
    (li, row) => {
      const weightLabel = `${Math.round(row.weight * 100)}%`;
      li.append(
        makeTextEntry(
          `${row.subject} - ${row.blockName} (${weightLabel})`,
          `${asPercent(row.accuracy)} - ${row.total} ejercicios`
        )
      );
    },
    "Sin datos EBAU todavia"
  );
}

function applyFilters(exercises) {
  const blockText = filters.block.value.trim().toLowerCase();
  const result = filters.result.value;
  const from = filters.from.value;
  const to = filters.to.value;
  const onlyErrors = filters.onlyErrors.checked;

  return exercises
    .filter((ex) => ex.subject === viewState.practiceSubject)
    .filter((ex) => (historyLinkedExamFilter ? ex.exerciseExamId === historyLinkedExamFilter : true))
    .filter((ex) => {
      if (!blockText) {
        return true;
      }
      const block = (ex.ebauBlock || "").toLowerCase();
      const subtype = (ex.ebauSubtype || "").toLowerCase();
      return block.includes(blockText) || subtype.includes(blockText);
    })
    .filter((ex) => (result ? ex.result === result : true))
    .filter((ex) => (from ? ex.date >= from : true))
    .filter((ex) => (to ? ex.date <= to : true))
    .filter((ex) => (onlyErrors ? ex.result !== "ok" : true))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function openLinkedExercisesForExam(exam) {
  if (!exam?.id) {
    return;
  }

  historyLinkedExamFilter = exam.id;
  historyLinkedExamName = formatExamLabel(exam);
  setMode("practice");
  setSubjectView("practice", exam.subject || viewState.practiceSubject);
}

function clearLinkedHistoryFilter() {
  historyLinkedExamFilter = "";
  historyLinkedExamName = "";
  render();
}

function setExerciseEditMode(isEditing) {
  if (exerciseSubmitButton) {
    exerciseSubmitButton.textContent = isEditing ? "Actualizar ejercicio" : "Guardar ejercicio";
  }
  exerciseCancelEditButton?.classList.toggle("hidden", !isEditing);
}

function setExamEditMode(isEditing) {
  if (examSubmitButton) {
    examSubmitButton.textContent = isEditing
      ? "Actualizar intento de examen"
      : "Guardar intento de examen";
  }
  examCancelEditButton?.classList.toggle("hidden", !isEditing);
}

function resetExerciseEditMode() {
  editingExerciseId = "";
  form.reset();
  if (exerciseScreenshotInput) {
    exerciseScreenshotInput.value = "";
  }
  if (exerciseScreenshotFeedback) {
    exerciseScreenshotFeedback.textContent = "";
  }
  document.getElementById("date").valueAsDate = new Date();
  subjectInput.value = viewState.practiceSubject;
  syncEbauInputsForSubject();
  setSubtypeOptionsForBlock(ebauBlockInput.value);
  renderExerciseExamOptions(viewState.practiceSubject, "");
  setExerciseEditMode(false);
}

function resetExamEditMode() {
  editingExamId = "";
  examForm.reset();
  document.getElementById("examDate").valueAsDate = new Date();
  examSubjectInput.value = viewState.examSubject;
  setExamWeakBlockOptions(viewState.examSubject, "");
  if (examPdfLinkInput) {
    examPdfLinkInput.value = "";
  }
  setExamEditMode(false);
}

function appendStrongParagraph(container, label, value) {
  const paragraph = document.createElement("p");
  paragraph.className = "history-detail";
  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;
  paragraph.append(strong, value);
  container.appendChild(paragraph);
}

function createItemActionButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `item-action-btn ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function wireHistoryCardEdit(item, onEdit) {
  if (!item || typeof onEdit !== "function") {
    return;
  }

  item.classList.add("history-item-clickable");
  item.setAttribute("role", "button");
  item.setAttribute("tabindex", "0");

  item.addEventListener("click", (event) => {
    if (event.target.closest("button")) {
      return;
    }
    onEdit();
  });

  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    onEdit();
  });
}

async function deleteExerciseById(id) {
  const shouldDelete = window.confirm("¿Seguro que quieres borrar este ejercicio?");
  if (!shouldDelete) {
    return;
  }

  const exerciseToDelete = readExercises().find((exercise) => exercise.id === id);
  if (exerciseToDelete?.exerciseImageId) {
    await deleteExerciseImageRecord(exerciseToDelete.exerciseImageId);
  }

  const exercises = readExercises().filter((exercise) => exercise.id !== id);
  writeExercises(exercises);
  feedback.textContent = "Ejercicio eliminado.";
  render();
}

function editExerciseById(id) {
  const exercise = readExercises().find((item) => item.id === id);
  if (!exercise) {
    return;
  }

  editingExerciseId = id;
  setMode("practice");
  setSubjectView("practice", exercise.subject || "Mate");

  document.getElementById("date").value = exercise.date || "";
  subjectInput.value = exercise.subject || viewState.practiceSubject;
  syncEbauInputsForSubject();
  ebauBlockInput.value = exercise.ebauBlock || "";
  setSubtypeOptionsForBlock(ebauBlockInput.value);
  ebauSubtypeInput.value = exercise.ebauSubtype || "";
  renderExerciseExamOptions(subjectInput.value, exercise.exerciseExamId || "");
  document.getElementById("result").value = exercise.result || "";
  document.getElementById("minutes").value = String(exercise.minutes ?? "");
  document.getElementById("confidenceLevel").value = exercise.confidenceLevel || "";
  document.getElementById("mainError").value = exercise.mainError || "";
  document.getElementById("errorPhase").value = exercise.errorPhase || "";
  document.getElementById("exactEbauType").value = exercise.exactEbauType || "";
  document.getElementById("learnedRule").value = exercise.learnedRule || "";
  if (exerciseScreenshotInput) {
    exerciseScreenshotInput.value = "";
  }
  if (exerciseScreenshotFeedback) {
    exerciseScreenshotFeedback.textContent = exercise.exerciseImageId
      ? `Captura actual: ${exercise.exerciseImageName || "captura"}. Si subes otra, reemplazas la actual.`
      : "Sin captura asociada.";
  }

  setExerciseEditMode(true);
  feedback.textContent = "Modo edicion: actualiza los campos y guarda el ejercicio.";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteExamById(id) {
  const shouldDelete = window.confirm("¿Seguro que quieres borrar este examen?");
  if (!shouldDelete) {
    return;
  }

  const exams = readExams().filter((exam) => exam.id !== id);
  writeExams(exams);
  examFeedback.textContent = "Examen eliminado.";
  render();
}

function editExamById(id) {
  const exam = readExams().find((item) => item.id === id);
  if (!exam) {
    return;
  }

  editingExamId = id;
  setMode("exam");
  setSubjectView("exam", exam.subject || "Mate");

  document.getElementById("examDate").value = exam.date || "";
  examSubjectInput.value = exam.subject || viewState.examSubject;
  setExamWeakBlockOptions(examSubjectInput.value, exam.weakBlock || "");
  document.getElementById("examType").value = exam.examType || "";
  document.getElementById("examScore").value = String(exam.score ?? "");
  document.getElementById("examMinutes").value = String(exam.minutes ?? "");
  examPdfLinkInput.value = exam.examPdfId || "";
  document.getElementById("examMainError").value = exam.mainError || "";
  document.getElementById("examActionPlan").value = exam.actionPlan || "";

  setExamEditMode(true);
  examFeedback.textContent = "Modo edicion: actualiza los campos y guarda el examen.";
  examForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderHistory(exercises) {
  const filtered = applyFilters(exercises);
  historyList.innerHTML = "";

  if (historyLinkedExamFilter) {
    clearHistoryLinkedButton?.classList.remove("hidden");
    clearHistoryLinkedWrap?.classList.remove("hidden");
  } else {
    clearHistoryLinkedButton?.classList.add("hidden");
    clearHistoryLinkedWrap?.classList.add("hidden");
  }

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hay ejercicios para esos filtros.";
    historyList.appendChild(empty);
    return;
  }

  for (const ex of filtered) {
    const item = document.createElement("article");
    item.className = `history-item ${ex.result || "pending"}`;
    wireHistoryCardEdit(item, () => editExerciseById(ex.id));

    const topRow = document.createElement("div");
    topRow.className = "history-item-top";

    const title = document.createElement("h4");
    title.className = "history-title";
    const blockLabel = ex.ebauBlock || "Sin bloque oficial";
    const subtypeLabel = ex.ebauSubtype ? ` / ${ex.ebauSubtype}` : "";
    title.textContent = `${blockLabel}${subtypeLabel} - ${resultLabel[ex.result] || "⏳ Pendiente"}`;

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(
      createItemActionButton("Editar", "edit", () => editExerciseById(ex.id)),
      createItemActionButton("Borrar", "delete", () => deleteExerciseById(ex.id))
    );

    topRow.append(title, actions);

    const meta = document.createElement("div");
    meta.className = "history-meta";

    const dateBadge = document.createElement("span");
    dateBadge.className = "badge";
    dateBadge.textContent = ex.date;

    const subject = document.createElement("span");
    subject.textContent = ex.subject;

    const type = document.createElement("span");
    type.textContent = ex.exerciseType;

    const ebau = document.createElement("span");
    ebau.textContent = ex.ebauBlock
      ? `${ex.subject}: ${ex.ebauBlock}${ex.ebauSubtype ? ` / ${ex.ebauSubtype}` : ""}`
      : "Sin bloque oficial";

    const time = document.createElement("span");
    time.textContent = `${ex.minutes} min`;

    meta.append(dateBadge, subject, type, ebau, time);

    item.append(topRow, meta);
    appendStrongParagraph(item, "Error", ex.mainError);
    appendStrongParagraph(item, "Fase", ex.errorPhase || "-");
    appendStrongParagraph(item, "Confianza", ex.confidenceLevel || "-");
    appendStrongParagraph(item, "Tipo exacto EBAU", ex.exactEbauType || "-");
    appendStrongParagraph(item, "Examen relacionado", ex.exerciseExamLabel || "-");
    if (ex.sourcePdfId) {
      const pdfRow = document.createElement("p");
      pdfRow.className = "history-detail";
      const strong = document.createElement("strong");
      strong.textContent = "PDF origen: ";
      const button = createItemActionButton("Ver", "edit", async () => {
        await openPdfById(ex.sourcePdfId, ex.sourcePdfName || "examen.pdf");
      });
      pdfRow.append(
        strong,
        document.createTextNode(`${ex.sourcePdfName || "PDF asociado"} `),
        button
      );
      item.appendChild(pdfRow);
    } else {
      appendStrongParagraph(item, "PDF origen", "-");
    }
    if (ex.exerciseImageId) {
      const imageRow = document.createElement("p");
      imageRow.className = "history-detail";
      const strong = document.createElement("strong");
      strong.textContent = "Captura: ";
      const button = createItemActionButton("Ver", "edit", async () => {
        await openExerciseImageRecord(ex.exerciseImageId, ex.exerciseImageName || "captura");
      });
      imageRow.append(
        strong,
        document.createTextNode(`${ex.exerciseImageName || "captura"} `),
        button
      );
      item.appendChild(imageRow);
    } else {
      appendStrongParagraph(item, "Captura", "-");
    }
    appendStrongParagraph(item, "Origen", ex.importedFromExam ? "Importado de examen" : "Manual");
    appendStrongParagraph(item, "Regla", ex.learnedRule || "-");

    historyList.appendChild(item);
  }
}

function calculateExamStats(exams) {
  if (!exams.length) {
    return {
      avg: 0,
      best: 0,
      last: null,
    };
  }

  const sorted = [...exams].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );
  const total = exams.reduce((sum, exam) => sum + exam.score, 0);
  const best = Math.max(...exams.map((exam) => exam.score));

  return {
    avg: total / exams.length,
    best,
    last: sorted[0],
  };
}

function renderExamHistory(exams) {
  const filteredBySubject = getExamSubjectAttempts(exams);
  const sorted = [...filteredBySubject].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );
  const stats = calculateExamStats(sorted);

  examOutputs.avgScore.textContent = stats.avg.toFixed(2);
  examOutputs.bestScore.textContent = stats.best.toFixed(2);
  examOutputs.lastScore.textContent = stats.last
    ? `${stats.last.score.toFixed(2)} (${stats.last.date})`
    : "-";

  const targets = readTargets();
  const target = Number(targets[viewState.examSubject]);
  if (stats.last && Number.isFinite(target)) {
    const gap = Number((target - stats.last.score).toFixed(2));
    examOutputs.scoreGap.textContent = gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`;
  } else {
    examOutputs.scoreGap.textContent = "-";
  }

  examTargetScoreInput.value = Number.isFinite(target) ? String(target) : "";

  examHistoryList.innerHTML = "";
  if (!sorted.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hay intentos de examen registrados todavia.";
    examHistoryList.appendChild(empty);
    return;
  }

  for (const exam of sorted) {
    const item = document.createElement("article");
    item.className = "history-item";
    wireHistoryCardEdit(item, () => editExamById(exam.id));

    const topRow = document.createElement("div");
    topRow.className = "history-item-top";

    const title = document.createElement("h4");
    title.className = "history-title";
    title.textContent = `Nota ${exam.score.toFixed(2)} / 10`;

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(
      createItemActionButton("Ver ejercicios", "edit", () => openLinkedExercisesForExam(exam))
    );
    actions.append(
      createItemActionButton("Editar", "edit", () => editExamById(exam.id)),
      createItemActionButton("Borrar", "delete", () => deleteExamById(exam.id))
    );

    topRow.append(title, actions);

    const meta = document.createElement("div");
    meta.className = "history-meta";

    const dateBadge = document.createElement("span");
    dateBadge.className = "badge";
    dateBadge.textContent = exam.date;

    const subject = document.createElement("span");
    subject.textContent = exam.subject;

    const examType = document.createElement("span");
    examType.textContent = exam.examType;

    const minutes = document.createElement("span");
    minutes.textContent = `${exam.minutes} min`;

    meta.append(dateBadge, subject, examType, minutes);

    item.append(topRow, meta);
    appendStrongParagraph(item, "Bloque flojo", exam.weakBlock || "-");
    if (exam.examPdfId) {
      const pdfRow = document.createElement("p");
      pdfRow.className = "history-detail";
      const strong = document.createElement("strong");
      strong.textContent = "PDF asociado: ";
      const button = createItemActionButton("Ver", "edit", async () => {
        await openPdfById(exam.examPdfId, exam.examPdfName || "examen.pdf");
      });
      pdfRow.append(
        strong,
        document.createTextNode(`${exam.examPdfName || "PDF asociado"} `),
        button
      );
      item.appendChild(pdfRow);
    } else {
      appendStrongParagraph(item, "PDF asociado", "-");
    }
    appendStrongParagraph(item, "Error dominante", exam.mainError);
    appendStrongParagraph(item, "Plan accion", exam.actionPlan || "-");

    examHistoryList.appendChild(item);
  }
}

function setSubjectView(mode, subject) {
  const globalSubject = subject === "Fisica" ? "Fisica" : "Mate";
  viewState.practiceSubject = globalSubject;
  viewState.examSubject = globalSubject;

  const groups = [
    subjectViewButtons.global,
    subjectViewButtons.exam,
  ];

  for (const group of groups) {
    if (!group) {
      continue;
    }
    for (const [name, button] of Object.entries(group)) {
      const isActive = name === globalSubject;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    }
  }

  if (subjectInput.value !== globalSubject) {
    subjectInput.value = globalSubject;
    syncEbauInputsForSubject();
  }

  if (examSubjectInput.value !== globalSubject) {
    examSubjectInput.value = globalSubject;
    setExamWeakBlockOptions(globalSubject, "");
  } else {
    setExamWeakBlockOptions(globalSubject, examWeakBlockInput.value);
  }

  render();
}

function setMode(modeName) {
  const activeMode = modeName === "exam" ? "exam" : "practice";

  for (const panel of modePanels) {
    const shouldShow = panel.dataset.mode === activeMode;
    panel.classList.toggle("hidden", !shouldShow);
  }

  modeButtons.practice.classList.toggle("active", activeMode === "practice");
  modeButtons.exam.classList.toggle("active", activeMode === "exam");
  modeButtons.practice.setAttribute(
    "aria-selected",
    activeMode === "practice" ? "true" : "false"
  );
  modeButtons.exam.setAttribute(
    "aria-selected",
    activeMode === "exam" ? "true" : "false"
  );

  if (activeMode !== "practice") {
    closeModal(dashboardModal);
    closeModal(importModal);
  }
}

function updateBodyModalState() {
  const hasOpenModal =
    (dashboardModal && !dashboardModal.classList.contains("hidden")) ||
    (importModal && !importModal.classList.contains("hidden")) ||
    (filePreviewModal && !filePreviewModal.classList.contains("hidden"));
  document.body.classList.toggle("modal-open", Boolean(hasOpenModal));
}

function openModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  updateBodyModalState();
}

function closeModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  updateBodyModalState();
}

function buildSubjectExerciseSnapshot(subject, exercises) {
  const subjectExercises = exercises.filter((exercise) => exercise.subject === subject);
  const scoredExercises = subjectExercises.filter((exercise) =>
    ["ok", "fail", "warn"].includes(exercise.result)
  );
  const total = scoredExercises.length;
  const okCount = scoredExercises.filter((exercise) => exercise.result === "ok").length;
  const warnCount = scoredExercises.filter((exercise) => exercise.result === "warn").length;
  const failCount = scoredExercises.filter((exercise) => exercise.result === "fail").length;
  const avgMinutes = total
    ? Math.round(scoredExercises.reduce((sum, exercise) => sum + exercise.minutes, 0) / total)
    : 0;

  const blockMap = new Map();
  const errorMap = new Map();
  const confidenceMap = new Map();
  const phaseMap = new Map();
  let recognitionMissCount = 0;
  let falsePositiveCount = 0;

  for (const exercise of scoredExercises) {
    const blockName = exercise.ebauBlock || "Sin bloque oficial";
    if (!blockMap.has(blockName)) {
      blockMap.set(blockName, { total: 0, ok: 0, warn: 0, fail: 0 });
    }
    const blockStats = blockMap.get(blockName);
    blockStats.total += 1;
    blockStats[exercise.result] += 1;

    errorMap.set(exercise.mainError, (errorMap.get(exercise.mainError) || 0) + 1);

    if (exercise.confidenceLevel) {
      confidenceMap.set(
        exercise.confidenceLevel,
        (confidenceMap.get(exercise.confidenceLevel) || 0) + 1
      );
    }

    if (exercise.errorPhase) {
      phaseMap.set(exercise.errorPhase, (phaseMap.get(exercise.errorPhase) || 0) + 1);
    }

    if (exercise.recognitionSpeed === "no") {
      recognitionMissCount += 1;
    }

    if (exercise.result === "ok" && exercise.confidenceLevel !== "seguro") {
      falsePositiveCount += 1;
    }
  }

  const blockPerformance = [...blockMap.entries()]
    .map(([blockName, stats]) => ({
      blockName,
      total: stats.total,
      accuracy: stats.total ? Number((stats.ok / stats.total).toFixed(3)) : 0,
      failRate: stats.total ? Number((stats.fail / stats.total).toFixed(3)) : 0,
      warnRate: stats.total ? Number((stats.warn / stats.total).toFixed(3)) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const topErrors = [...errorMap.entries()]
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const confidenceDistribution = [...confidenceMap.entries()]
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => b.count - a.count);

  const phaseDistribution = [...phaseMap.entries()]
    .map(([phase, count]) => ({ phase, count }))
    .sort((a, b) => b.count - a.count);

  const recent = [...subjectExercises]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 10)
    .map((exercise) => ({
      date: exercise.date,
      block: exercise.ebauBlock || "Sin bloque oficial",
      subtype: exercise.ebauSubtype || "",
      result: exercise.result,
      minutes: exercise.minutes,
      mainError: exercise.mainError,
      errorPhase: exercise.errorPhase || "",
      confidenceLevel: exercise.confidenceLevel || "",
      recognitionSpeed: exercise.recognitionSpeed || "",
      exactEbauType: exercise.exactEbauType || "",
      exerciseExamId: exercise.exerciseExamId || "",
      exerciseExamLabel: exercise.exerciseExamLabel || "",
      importedFromExam: Boolean(exercise.importedFromExam),
      sourceQuestion: exercise.sourceQuestion || "",
      sourcePdfId: exercise.sourcePdfId || "",
      sourcePdfName: exercise.sourcePdfName || "",
      learnedRule: exercise.learnedRule || "",
    }));

  return {
    subject,
    total,
    accuracy: total ? Number((okCount / total).toFixed(3)) : 0,
    okCount,
    warnCount,
    failCount,
    avgMinutes,
    weakBlocks: blockPerformance.filter((block) => block.total >= 2).slice(0, 5),
    topErrors,
    confidenceDistribution,
    phaseDistribution,
    recognitionMissRate: total ? Number((recognitionMissCount / total).toFixed(3)) : 0,
    falsePositiveRate: okCount ? Number((falsePositiveCount / okCount).toFixed(3)) : 0,
    blockPerformance,
    recentAttempts: recent,
  };
}

async function importExamFileAsExercises() {
  const file = examImportFileInput.files?.[0];
  if (!file) {
    feedback.textContent = "Selecciona un archivo PDF o TXT antes de importar.";
    return;
  }

  try {
    importExamButton.disabled = true;
    importExamButton.textContent = "Guardando...";
    feedback.textContent = "Guardando PDF del examen...";

    const savedPdfRecord = await savePdfRecord(file);

    feedback.textContent = savedPdfRecord
      ? "PDF guardado. Ahora puedes relacionar ejercicios y examen completo manualmente."
      : "No se pudo guardar. Solo se aceptan archivos PDF.";
    pdfRegistryFeedback.textContent = savedPdfRecord
      ? "PDF guardado en el registro local."
      : "Solo se registran archivos PDF.";
    examImportFileInput.value = "";
    renderPdfRegistry();
    render();
  } catch (error) {
    feedback.textContent = `No se pudo importar el examen: ${error.message || "error inesperado"}.`;
  } finally {
    importExamButton.disabled = false;
    importExamButton.textContent = "Guardar PDF del examen";
  }
}

function buildSubjectExamSnapshot(subject, exams) {
  const subjectExams = exams
    .filter((exam) => exam.subject === subject)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  if (!subjectExams.length) {
    return {
      subject,
      total: 0,
      avgScore: 0,
      bestScore: 0,
      lastScore: null,
      scoreTrend: [],
    };
  }

  const avgScore =
    subjectExams.reduce((sum, exam) => sum + exam.score, 0) / subjectExams.length;
  const bestScore = Math.max(...subjectExams.map((exam) => exam.score));

  return {
    subject,
    total: subjectExams.length,
    avgScore: Number(avgScore.toFixed(2)),
    bestScore: Number(bestScore.toFixed(2)),
    lastScore: Number(subjectExams[0].score.toFixed(2)),
    scoreTrend: subjectExams.slice(0, 8).map((exam) => ({
      date: exam.date,
      score: Number(exam.score.toFixed(2)),
      weakBlock: exam.weakBlock || "",
      examPdfId: exam.examPdfId || "",
      examPdfName: exam.examPdfName || "",
      dominantError: exam.mainError,
      actionPlan: exam.actionPlan || "",
    })),
  };
}

function buildAiExportPayload(exercises, exams, scope, subjectScope = "all") {
  const includeExercises = scope === "full";
  const includeExams = true;

  const scopedExercises =
    subjectScope === "all"
      ? exercises
      : exercises.filter((exercise) => exercise.subject === subjectScope);
  const scopedExams =
    subjectScope === "all" ? exams : exams.filter((exam) => exam.subject === subjectScope);

  const exercisesPayload = includeExercises ? scopedExercises : [];
  const examsPayload = includeExams ? scopedExams : [];

  const includeMate = subjectScope === "all" || subjectScope === "Mate";
  const includeFisica = subjectScope === "all" || subjectScope === "Fisica";

  const mateExerciseSnapshot = buildSubjectExerciseSnapshot("Mate", scopedExercises);
  const fisicaExerciseSnapshot = buildSubjectExerciseSnapshot("Fisica", scopedExercises);
  const mateExamSnapshot = buildSubjectExamSnapshot("Mate", scopedExams);
  const fisicaExamSnapshot = buildSubjectExamSnapshot("Fisica", scopedExams);

  const payload = {
    exportType: scope,
    subjectScope,
    schemaVersion: "ai-coach-v1",
    exportedAt: new Date().toISOString(),
    locale: "es-ES",
    objective: "Mejorar nota EBAU detectando patrones de error y bloques debiles",
    interpretationGuide: {
      resultMeaning: {
        ok: "resuelto con acierto",
        warn: "resuelto con dudas o parcial",
        fail: "fallado",
        pending: "pendiente de resolver (importado o no intentado)",
      },
      coachingIntent:
        "Generar plan semanal, prioridades de bloque, correcciones tacticas y ejercicios recomendados.",
    },
    snapshot: {
      exercisesBySubject: {
        Mate: includeExercises && includeMate ? mateExerciseSnapshot : null,
        Fisica: includeExercises && includeFisica ? fisicaExerciseSnapshot : null,
      },
      examsBySubject: {
        Mate: includeExams && includeMate ? mateExamSnapshot : null,
        Fisica: includeExams && includeFisica ? fisicaExamSnapshot : null,
      },
      totals: {
        exercises: exercisesPayload.length,
        exams: examsPayload.length,
      },
    },
    suggestedPromptForAI:
      "Actua como entrenador EBAU. Analiza este JSON y devuelve: (1) diagnostico por asignatura, (2) top 3 prioridades ROI, (3) plan de 7 dias con bloques diarios, (4) errores a corregir con acciones concretas, (5) micro-rutina antes de examen.",
    rawData: {
      exercises: exercisesPayload,
      exams: examsPayload,
    },
  };

  return payload;
}

function exportJson() {
  exportSubjectJson("all");
}

function exportSubjectJson(subjectScope) {
  const exercises = readExercises();
  const exams = readExams();
  const payload = buildAiExportPayload(exercises, exams, "full", subjectScope);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const dateStamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const scopeLabel = subjectScope === "all" ? "all" : subjectScope.toLowerCase();
  link.download = `ebau-tracker-ai-full-${scopeLabel}-${dateStamp}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  feedback.textContent =
    subjectScope === "all"
      ? "Export AI-ready generado (ejercicios + examenes)."
      : `Export AI-ready de ${subjectScope} generado (ejercicios + examenes).`;
}

function updatePracticeActionsLabel() {
  if (!exportJsonCurrentButton) {
    return;
  }
  exportJsonCurrentButton.textContent = `Exportar ${viewState.practiceSubject}`;
}

function exportExamsJson() {
  exportSubjectExamsJson("all");
}

function exportSubjectExamsJson(subjectScope) {
  const exams = readExams();
  const payload = buildAiExportPayload([], exams, "exams-only", subjectScope);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const dateStamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const scopeLabel = subjectScope === "all" ? "all" : subjectScope.toLowerCase();
  link.download = `ebau-tracker-ai-examenes-${scopeLabel}-${dateStamp}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  examFeedback.textContent =
    subjectScope === "all"
      ? "Export AI-ready de examenes generado."
      : `Export AI-ready de examenes de ${subjectScope} generado.`;
}

function clearData() {
  const shouldClear = window.confirm(
    "Se borraran todos los ejercicios guardados. Quieres continuar?"
  );
  if (!shouldClear) {
    return;
  }
  writeExercises([]);
  writeExams([]);
  feedback.textContent = "Datos de ejercicios y examenes borrados. Puedes empezar un nuevo ciclo.";
  examFeedback.textContent = "Datos borrados.";
  render();
}

function render() {
  const exercises = readExercises();
  const exams = readExams();
  updatePracticeActionsLabel();
  renderExerciseExamOptions(viewState.practiceSubject, exerciseExamLinkInput?.value || "");
  renderDashboard(exercises, exams);
  renderHistory(exercises);
  renderExamHistory(exams);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(form);
    const screenshotFile = formData.get("exerciseScreenshot");
    const hasScreenshotFile = screenshotFile instanceof File && screenshotFile.size > 0;
    let screenshotRecord = null;

    if (hasScreenshotFile) {
      if (!String(screenshotFile.type || "").startsWith("image/")) {
        feedback.textContent = "La captura debe ser una imagen valida (PNG, JPG, WEBP, etc.).";
        return;
      }
      screenshotRecord = await saveExerciseImageRecord(screenshotFile);
    }

    const exercise = buildExercise(formData, screenshotRecord);

    if (!exercise.mainError) {
      feedback.textContent = "El campo Error principal es obligatorio.";
      return;
    }

    if (
      !exercise.date ||
      !exercise.subject ||
      !exercise.result ||
      !exercise.minutes ||
      !exercise.confidenceLevel ||
      !exercise.errorPhase
    ) {
      feedback.textContent = "Completa todos los campos obligatorios antes de guardar.";
      return;
    }

    if (SUBJECT_STRUCTURES[exercise.subject] && (!exercise.ebauBlock || !exercise.ebauSubtype)) {
      feedback.textContent = "Selecciona bloque oficial y subtipo para medir ROI real de la asignatura.";
      return;
    }

    const exercises = readExercises();
    if (editingExerciseId) {
      const index = exercises.findIndex((item) => item.id === editingExerciseId);
      if (index >= 0) {
        const previousExercise = exercises[index];
        const keepPreviousImage = !hasScreenshotFile && previousExercise.exerciseImageId;
        if (hasScreenshotFile && previousExercise.exerciseImageId) {
          await deleteExerciseImageRecord(previousExercise.exerciseImageId);
        }

        exercises[index] = {
          ...exercise,
          id: exercises[index].id,
          createdAt: exercises[index].createdAt,
          exerciseImageId: keepPreviousImage
            ? previousExercise.exerciseImageId
            : exercise.exerciseImageId,
          exerciseImageName: keepPreviousImage
            ? previousExercise.exerciseImageName
            : exercise.exerciseImageName,
        };
      } else {
        exercises.push(exercise);
      }
    } else {
      exercises.push(exercise);
    }
    writeExercises(exercises);

    feedback.textContent = editingExerciseId
      ? "Ejercicio actualizado. Patrones recalculados."
      : "Ejercicio guardado. Patrones actualizados.";
    if (exerciseScreenshotFeedback) {
      exerciseScreenshotFeedback.textContent = "";
    }
    resetExerciseEditMode();
    render();
  } catch {
    feedback.textContent = "No se pudo guardar. Recarga la pagina e intentalo de nuevo.";
  }
});

examForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const formData = new FormData(examForm);
    const exam = buildExamAttempt(formData);

    if (
      !exam.date ||
      !exam.subject ||
      !exam.examType ||
      !exam.weakBlock ||
      !exam.mainError ||
      !exam.minutes
    ) {
      examFeedback.textContent = "Completa todos los campos obligatorios del examen.";
      return;
    }

    if (exam.score < 0 || exam.score > 10) {
      examFeedback.textContent = "La nota debe estar entre 0 y 10.";
      return;
    }

    const exams = readExams();
    if (editingExamId) {
      const index = exams.findIndex((item) => item.id === editingExamId);
      if (index >= 0) {
        exams[index] = {
          ...exam,
          id: exams[index].id,
          createdAt: exams[index].createdAt,
        };
      } else {
        exams.push(exam);
      }
    } else {
      exams.push(exam);
    }
    writeExams(exams);

    examFeedback.textContent = editingExamId
      ? "Examen actualizado."
      : "Intento de examen guardado.";
    resetExamEditMode();
    render();
  } catch {
    examFeedback.textContent = "No se pudo guardar el examen. Recarga e intentalo de nuevo.";
  }
});

exerciseCancelEditButton?.addEventListener("click", () => {
  resetExerciseEditMode();
  feedback.textContent = "Edicion cancelada.";
});

examCancelEditButton?.addEventListener("click", () => {
  resetExamEditMode();
  examFeedback.textContent = "Edicion cancelada.";
});

for (const input of Object.values(filters)) {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
}

exportJsonCurrentButton.addEventListener("click", () => exportSubjectJson(viewState.practiceSubject));
exportExamsJsonMateButton.addEventListener("click", () => exportSubjectExamsJson("Mate"));
exportExamsJsonFisicaButton.addEventListener("click", () => exportSubjectExamsJson("Fisica"));
importExamButton.addEventListener("click", () => {
  importExamFileAsExercises();
});
clearHistoryLinkedButton.addEventListener("click", clearLinkedHistoryFilter);
subjectInput.addEventListener("change", () => {
  setSubjectView("practice", subjectInput.value);
});
examSubjectInput.addEventListener("change", () => {
  setSubjectView("exam", examSubjectInput.value);
});
ebauBlockInput.addEventListener("change", () => {
  setSubtypeOptionsForBlock(ebauBlockInput.value);
});
modeButtons.practice.addEventListener("click", () => setMode("practice"));
modeButtons.exam.addEventListener("click", () => setMode("exam"));
openDashboardModalButton?.addEventListener("click", () => {
  dashboardToggle?.setAttribute("aria-expanded", "true");
  dashboardContent?.removeAttribute("hidden");
  dashboardSection?.classList.add("is-expanded");
  openModal(dashboardModal);
});
openImportModalButton?.addEventListener("click", () => openModal(importModal));
closeDashboardModalButton?.addEventListener("click", () => closeModal(dashboardModal));
closeImportModalButton?.addEventListener("click", () => closeModal(importModal));
closeFilePreviewModalButton?.addEventListener("click", closeFilePreview);
document.querySelectorAll("[data-modal-close='dashboard']").forEach((element) => {
  element.addEventListener("click", () => closeModal(dashboardModal));
});
document.querySelectorAll("[data-modal-close='import']").forEach((element) => {
  element.addEventListener("click", () => closeModal(importModal));
});
document.querySelectorAll("[data-modal-close='file-preview']").forEach((element) => {
  element.addEventListener("click", closeFilePreview);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  closeModal(dashboardModal);
  closeModal(importModal);
  closeFilePreview();
});
subjectViewButtons.global.Mate.addEventListener("click", () => setSubjectView("practice", "Mate"));
subjectViewButtons.global.Fisica.addEventListener("click", () => setSubjectView("practice", "Fisica"));
subjectViewButtons.exam.Mate.addEventListener("click", () => setSubjectView("exam", "Mate"));
subjectViewButtons.exam.Fisica.addEventListener("click", () => setSubjectView("exam", "Fisica"));
examTargetScoreInput.addEventListener("change", () => {
  const value = Number(examTargetScoreInput.value);
  const targets = readTargets();
  if (Number.isFinite(value) && value >= 0 && value <= 10) {
    targets[viewState.examSubject] = value;
  } else {
    delete targets[viewState.examSubject];
  }
  writeTargets(targets);
  render();
});

document.getElementById("date").valueAsDate = new Date();
document.getElementById("examDate").valueAsDate = new Date();
syncEbauInputsForSubject();
setExamWeakBlockOptions("", "");
setExerciseEditMode(false);
setExamEditMode(false);
setMode("practice");
setSubjectView("practice", "Mate");

dashboardToggle.addEventListener("click", () => {
  const isExpanded = dashboardToggle.getAttribute("aria-expanded") === "true";
  dashboardToggle.setAttribute("aria-expanded", String(!isExpanded));
  dashboardContent.toggleAttribute("hidden");
  dashboardSection.classList.toggle("is-expanded", !isExpanded);
});

renderPdfRegistry();

render();
