export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function calculateCompletionPercent(items = [], completeStatuses = ["Tamamlandı", "Kontrol Edildi"]) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const completed = items.filter((item) => completeStatuses.includes(item.status)).length;
  return Math.round((completed / items.length) * 100);
}

export function getLatestExamNet(student = {}, type = "TYT") {
  const exams = Array.isArray(student.exams) ? student.exams : [];
  const key = type === "AYT" ? "aytNet" : "tytNet";
  const typed = exams
    .filter((exam) => exam.examType === type || exam[key] !== undefined)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  const latest = typed[typed.length - 1];
  return toNumber(latest?.[key], toNumber(type === "AYT" ? student.lastAytNet : student.lastTytNet));
}

export function getExamTrend(student = {}, type = "TYT", sampleSize = 3) {
  const exams = Array.isArray(student.exams) ? student.exams : [];
  const key = type === "AYT" ? "aytNet" : "tytNet";
  return exams
    .filter((exam) => exam[key] !== undefined)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .slice(-sampleSize)
    .map((exam) => ({
      name: exam.name || "Deneme",
      date: exam.date || "",
      net: toNumber(exam[key]),
    }));
}

export function getTrendDelta(trend = []) {
  if (trend.length < 2) return 0;
  return Number((trend[trend.length - 1].net - trend[0].net).toFixed(2));
}

export function summarizeStudyRecords(student = {}) {
  const records = Array.isArray(student.studyRecords) ? student.studyRecords : [];
  const solvedQuestions = records.reduce((sum, record) => sum + toNumber(record.solvedQuestions), 0);
  const correct = records.reduce((sum, record) => sum + toNumber(record.correct), 0);
  const wrong = records.reduce((sum, record) => sum + toNumber(record.wrong), 0);
  const duration = records.reduce((sum, record) => sum + toNumber(record.duration), 0);
  const successRate = solvedQuestions > 0 ? Math.round((correct / solvedQuestions) * 100) : 0;

  return {
    recordCount: records.length,
    solvedQuestions,
    correct,
    wrong,
    duration,
    successRate,
  };
}

export function getMissingTopicInsights(student = {}, limit = 5) {
  const errors = Array.isArray(student.errors) ? student.errors : [];
  const trackedTopics = Array.isArray(student.topicTracking)
    ? student.topicTracking
    : Array.isArray(student.topicTrackings)
      ? student.topicTrackings
      : [];
  const map = new Map();

  errors.forEach((error) => {
    const key = `${error.lesson || "Ders"}|${error.topic || "Konu"}|${error.subtopic || ""}`;
    const current = map.get(key) || {
      lesson: error.lesson || "Ders belirtilmedi",
      topic: error.topic || "Konu belirtilmedi",
      subtopic: error.subtopic || "",
      errorCount: 0,
      errorTypes: new Map(),
      source: "Yanlış analizi",
    };
    const count = toNumber(error.count, 1);
    current.errorCount += count;
    current.errorTypes.set(error.type || "Belirsiz", (current.errorTypes.get(error.type || "Belirsiz") || 0) + count);
    map.set(key, current);
  });

  trackedTopics.forEach((tracking) => {
    const isWeak =
      tracking.status === "Tekrar Gerekli" ||
      tracking.learningStatus === "Tekrar Gerekli" ||
      tracking.questionStatus === "Zayıf" ||
      tracking.netStatus === "Düşüşte";
    if (!isWeak) return;

    const key = `${tracking.lesson || "Ders"}|${tracking.topic || "Konu"}|${tracking.subtopic || ""}`;
    const current = map.get(key) || {
      lesson: tracking.lesson || "Ders belirtilmedi",
      topic: tracking.topic || "Konu belirtilmedi",
      subtopic: tracking.subtopic || "",
      errorCount: 0,
      errorTypes: new Map(),
      source: "Konu takibi",
    };
    current.errorCount += 2;
    current.source = current.source === "Yanlış analizi" ? "Yanlış + konu takibi" : "Konu takibi";
    map.set(key, current);
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      errorTypes: Array.from(item.errorTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `${type}: ${count}`),
      priority: item.errorCount >= 6 ? "Yüksek" : item.errorCount >= 3 ? "Orta" : "Düşük",
      recommendation: buildTopicRecommendation(item),
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, limit);
}

function buildTopicRecommendation(item) {
  if (item.errorCount >= 6) {
    return "2 konu videosu + 100 soru + konu tarama testi + yanlış defteri";
  }
  if (item.errorCount >= 3) {
    return "1 konu videosu + 60 soru + mini test + yanlış analizi";
  }
  return "Kısa tekrar + 30 soru + sonraki denemede kontrol";
}

export function calculateStudentRisk(student = {}) {
  const weeklyCompletion = calculateCompletionPercent(student.weeklyTasks || [], ["Tamamlandı"]);
  const homeworkCompletion = toNumber(student.homeworkCompletion);
  const missingTopics = getMissingTopicInsights(student, 10);
  const tytTrend = getExamTrend(student, "TYT", 3);
  const aytTrend = getExamTrend(student, "AYT", 3);
  const tytDelta = getTrendDelta(tytTrend);
  const aytDelta = getTrendDelta(aytTrend);
  const study = summarizeStudyRecords(student);

  let score = 0;
  const reasons = [];

  if (weeklyCompletion < 50) {
    score += 28;
    reasons.push("Haftalık plan tamamlama düşük");
  } else if (weeklyCompletion < 75) {
    score += 14;
    reasons.push("Haftalık plan orta seviyede");
  }

  if (homeworkCompletion < 50) {
    score += 24;
    reasons.push("Ödev tamamlama oranı düşük");
  } else if (homeworkCompletion < 75) {
    score += 12;
    reasons.push("Ödevlerde takip gerekiyor");
  }

  if (missingTopics.length >= 6) {
    score += 22;
    reasons.push("Eksik konu sayısı yüksek");
  } else if (missingTopics.length >= 3) {
    score += 12;
    reasons.push("Öncelikli eksik konular var");
  }

  if (tytDelta < -2) {
    score += 14;
    reasons.push("TYT net trendi düşüşte");
  }

  if (aytDelta < -2) {
    score += 14;
    reasons.push("AYT net trendi düşüşte");
  }

  if (study.recordCount === 0) {
    score += 12;
    reasons.push("Günlük çalışma verisi girilmemiş");
  } else if (study.successRate < 55) {
    score += 10;
    reasons.push("Günlük çalışma başarı oranı düşük");
  }

  const boundedScore = Math.min(100, Math.max(0, score));
  const level = boundedScore >= 65 ? "Yüksek" : boundedScore >= 35 ? "Orta" : "Düşük";

  return {
    score: boundedScore,
    level,
    reasons: reasons.length > 0 ? reasons : ["İzleme verileri dengeli görünüyor"],
    weeklyCompletion,
    homeworkCompletion,
    missingTopicCount: missingTopics.length,
    tytDelta,
    aytDelta,
    study,
  };
}

export function buildStudentReportCard(student = {}) {
  const risk = calculateStudentRisk(student);
  const missingTopics = getMissingTopicInsights(student, 5);
  const study = summarizeStudyRecords(student);
  const tytTrend = getExamTrend(student, "TYT", 3);
  const aytTrend = getExamTrend(student, "AYT", 3);

  return {
    studentId: student.id,
    name: student.name,
    target: `${student.targetDepartment || "Hedef"} · ${student.targetUniversity || "Üniversite"}`,
    tytNet: getLatestExamNet(student, "TYT"),
    aytNet: getLatestExamNet(student, "AYT"),
    weeklyCompletion: risk.weeklyCompletion,
    homeworkCompletion: risk.homeworkCompletion,
    solvedQuestions: study.solvedQuestions,
    studyDuration: study.duration,
    studySuccessRate: study.successRate,
    missingTopicCount: missingTopics.length,
    missingTopics,
    risk,
    tytTrend,
    aytTrend,
  };
}

export function buildCoachRiskQueue(students = []) {
  return students
    .map((student) => ({
      student,
      card: buildStudentReportCard(student),
    }))
    .sort((a, b) => b.card.risk.score - a.card.risk.score);
}
