import { useEffect, useMemo, useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import CoachDashboard from "./pages/CoachDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StudentDetailPage from "./pages/StudentDetailPage.jsx";
import { demoStudents } from "./data/demoData.js";
import { calculateTopicReadiness } from "./data/curriculumData.js";
import { createWeeklyPlan } from "./data/programAutomation.js";
import { defaultVideoPlaylists } from "./data/videoLessonData.js";
import { defaultResourceLibrary } from "./data/resourceLibraryData.js";
import { createFirebaseUser, sendFirebasePasswordReset, signInFirebaseUser, signOutFirebaseUser, updateFirebasePassword } from "./services/firebaseAuth.js";
import { APP_VERSION, appConfig, backendConfig, getBackendLabel, isFirebaseAuthEnabled, isProductionMode, isRemoteBackendEnabled } from "./utils/appConfig.js";
import { createBackupPayload, downloadJsonBackup, loadRemoteAppData, readBackupFile, saveRemoteAppData } from "./utils/dataStore.js";

const STORAGE_KEY = "yks-kocluk-platformu-students-v29-panel-ayristirma";
const ACCOUNTS_STORAGE_KEY = "yks-kocluk-platformu-accounts-v53";
const THEME_STORAGE_KEY = "yks-kocluk-platformu-theme-v2";
const DATA_MODEL_VERSION = "asama-52-sync-omurga";
const MAX_SYNC_EVENTS = 90;
const STUDENT_EMAIL_LOGIN_ID = "student-email-login";

const defaultAccounts = [
  {
    id: "coach-demo",
    role: "coach",
    name: "Koç Girişi",
    email: "",
    username: "",
    title: "Öğrenci takip ve raporlama hesabı",
    accessCode: "",
    isDemo: false,
  },
  {
    id: "student-demo",
    role: "student",
    name: "Ali Yılmaz",
    email: "ali.yilmaz@yks.local",
    username: "ali.yilmaz@yks.local",
    title: "Öğrenci paneli hesabı",
    accessCode: "1111",
    studentId: 1,
    isDemo: true,
  },
  {
    id: "admin-demo",
    role: "admin",
    name: "Yönetici Girişi",
    email: "",
    username: "",
    title: "Kurum özeti ve risk takip hesabı",
    accessCode: "",
    isDemo: false,
  },
  {
    id: "parent-demo",
    role: "parent",
    name: "Ali Yılmaz Velisi",
    email: "veli.ali@yks.local",
    username: "veli.ali@yks.local",
    title: "Veli rapor hesabı",
    accessCode: "2222",
    studentId: 1,
    isDemo: true,
  },
];
const defaultAccountIds = new Set(defaultAccounts.map((account) => account.id));
const deprecatedDemoAccountIds = new Set(["student-demo", "parent-demo"]);
const deprecatedDemoStudentIds = new Set(["1", "2", "3"]);

const EXAM_SUBJECTS = {
  TYT: ["Türkçe", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
  "AYT-SAY": ["Matematik", "Fizik", "Kimya", "Biyoloji"],
  "AYT-EA": ["Matematik", "Edebiyat", "Tarih", "Coğrafya"],
  "AYT-SÖZ": ["Edebiyat", "Tarih", "Coğrafya", "Felsefe", "Din"],
  YDT: ["Yabancı Dil"],
};

const EXAM_QUESTION_COUNTS = {
  TYT: {
    Türkçe: 40,
    Matematik: 40,
    Fizik: 7,
    Kimya: 7,
    Biyoloji: 6,
    Tarih: 5,
    Coğrafya: 5,
    Felsefe: 5,
    Din: 5,
  },
  "AYT-SAY": {
    Matematik: 40,
    Fizik: 14,
    Kimya: 13,
    Biyoloji: 13,
  },
  "AYT-EA": {
    Matematik: 40,
    Edebiyat: 24,
    Tarih: 10,
    Coğrafya: 6,
  },
  "AYT-SÖZ": {
    Edebiyat: 24,
    Tarih: 21,
    Coğrafya: 17,
    Felsefe: 12,
    Din: 6,
  },
  YDT: {
    "Yabancı Dil": 80,
  },
};

function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createAccessCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function createTemporaryPassword() {
  return `Yks-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createUsername(name, role = "student", id = "") {
  const rolePrefix = role === "coach" ? "koc" : role === "admin" ? "yonetici" : role === "parent" ? "veli" : "ogrenci";
  const slug = String(name || rolePrefix)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 28);

  return `${rolePrefix}.${slug || "hesap"}${id ? `.${String(id).slice(-4)}` : ""}`;
}

function mergeDefaultVideoPlaylists(studentPlaylists = []) {
  const merged = [...defaultVideoPlaylists];
  const existingIds = new Set(defaultVideoPlaylists.map((playlist) => playlist.id));

  studentPlaylists.forEach((playlist) => {
    if (!playlist?.id || !existingIds.has(playlist.id)) {
      merged.push(playlist);
      return;
    }

    const index = merged.findIndex((defaultPlaylist) => defaultPlaylist.id === playlist.id);
    merged[index] = {
      ...merged[index],
      ...playlist,
      videos: playlist.videos?.length ? playlist.videos : merged[index].videos,
    };
  });

  return merged;
}

function normalizeStudent(student) {
  const weeklyTasks = Array.isArray(student.weeklyTasks) ? student.weeklyTasks : [];
  const homeworks = Array.isArray(student.homeworks) ? student.homeworks : [];
  const topicTracking = Array.isArray(student.topicTracking) ? student.topicTracking : [];
  const resources = Array.isArray(student.resources) ? student.resources : [];
  const exams = Array.isArray(student.exams) ? student.exams : [];
  const errors = Array.isArray(student.errors) ? student.errors : [];
  const studyRecords = Array.isArray(student.studyRecords) ? student.studyRecords : [];
  const messages = Array.isArray(student.messages) ? student.messages : [];
  const videoPlaylists = mergeDefaultVideoPlaylists(Array.isArray(student.videoPlaylists) ? student.videoPlaylists : []);
  const videoProgress = student.videoProgress && typeof student.videoProgress === "object" ? student.videoProgress : {};
  const normalizedTopicTracking = topicTracking.map((topicRecord, index) => {
    const normalizedRecord = {
      id: topicRecord.id || `topic-${student.id}-${index}`,
      exam: topicRecord.exam || "TYT",
      lesson: topicRecord.lesson || "Ders girilmedi",
      topic: topicRecord.topic || "Konu girilmedi",
      subtopic: topicRecord.subtopic || "",
      status: normalizeTopicStatus(topicRecord.status),
      learningStatus: topicRecord.learningStatus || inferLearningStatus(topicRecord.status),
      questionStatus: topicRecord.questionStatus || "Az",
      netStatus: topicRecord.netStatus || "Ölçülmedi",
      errorType: topicRecord.errorType || "Yok",
      level: normalizeLevel(topicRecord.level || topicRecord.subjectLevel || student.programLevel || "Orta"),
      reviewDate: topicRecord.reviewDate || "",
      note: topicRecord.note || "",
      updatedBy: topicRecord.updatedBy || "",
      updatedAt: topicRecord.updatedAt || "",
    };

    return {
      ...normalizedRecord,
      readiness: calculateTopicReadiness(normalizedRecord),
    };
  });

  const normalizedStudent = {
    ...student,
    dataVersion: student.dataVersion || DATA_MODEL_VERSION,
    createdAt: student.createdAt || "",
    updatedAt: student.updatedAt || "",
    lastSyncedAt: student.lastSyncedAt || "",
    area: student.area || student.scoreType || "EA",
    programStartDate: student.programStartDate || "2025-09-01",
    programLevel: student.programLevel || "Orta",
    email: student.email || "",
    coachId: student.coachId || "coach-demo",
    lessonLevels: normalizeLessonLevels(student.lessonLevels, student.programLevel || "Orta"),
    periodMode: student.periodMode || "4",
    customPeriodCount: Math.max(1, toNumber(student.customPeriodCount || 4)),
    weeklyTasks: weeklyTasks.map((task, index) => ({
      id: task.id || `task-${student.id}-${index}`,
      day: task.day || "Pazartesi",
      block: task.block || "",
      periodSlot: Number(task.periodSlot || 1),
      level: task.level || "Orta",
      targetQuestions: Math.max(0, toNumber(task.targetQuestions || 0)),
      periodMinutes: Math.max(0, toNumber(task.periodMinutes || 0)),
      periodMode: task.periodMode || "4",
      priority: task.priority || "",
      questionHistoryTotal: Math.max(0, toNumber(task.questionHistoryTotal || 0)),
      lesson: task.lesson || "Ders girilmedi",
      topic: task.topic || "Konu girilmedi",
      subtopic: task.subtopic || "",
      task: task.task || "Görev açıklaması girilmedi",
      status: task.status || "Bekliyor",
      source: task.source || "",
      generatedBy: task.generatedBy || "",
      createdAt: task.createdAt || "",
      completedAt: task.completedAt || "",
    })),
    homeworks: homeworks.map((homework, index) => ({
      id: homework.id || `homework-${student.id}-${index}`,
      title: homework.title || "Ödev başlığı girilmedi",
      lesson: homework.lesson || "Ders girilmedi",
      topic: homework.topic || "Konu girilmedi",
      subtopic: homework.subtopic || "",
      dueDate: homework.dueDate || "",
      description: homework.description || "",
      status: homework.status || "Verildi",
      feedback: homework.feedback || "",
      studentNote: homework.studentNote || "",
      submittedAt: homework.submittedAt || "",
    })),
    resources: resources.map((resource, index) => normalizeResource(resource, student.id, index)),
    topicTracking: normalizedTopicTracking,
    topicProgress: calculateTopicProgress(normalizedTopicTracking, student.topicProgress),
    resourceProgress: calculateResourceProgress(resources, student.resourceProgress),
    exams: exams.map((exam, index) => normalizeExam(exam, student.id, index)),
    errors: errors.map((error, index) => normalizeErrorRecord(error, student.id, index)),
    studyRecords: studyRecords.map((record, index) => normalizeStudyRecord(record, student.id, index)),
    messages: messages.map((message, index) => normalizeMessage(message, student.id, index)),
    videoPlaylists: videoPlaylists.map((playlist, index) => normalizeVideoPlaylist(playlist, student.id, index)),
    videoProgress: normalizeVideoProgress(videoProgress),
    syncEvents: normalizeSyncEvents(student.syncEvents),
    coachNote: student.coachNote || "Koç notu henüz girilmedi.",
  };

  return {
    ...normalizedStudent,
    ...recalculateStudentDerivedState(normalizedStudent),
  };
}

function normalizeStudyRecord(record, studentId, index) {
  const solvedQuestions = Math.max(0, toNumber(record.solvedQuestions));
  const correct = Math.min(Math.max(0, toNumber(record.correct)), solvedQuestions || Infinity);
  const wrong = Math.min(Math.max(0, toNumber(record.wrong)), Math.max(0, solvedQuestions - correct));
  const blank = calculateAutomaticBlank(solvedQuestions, correct, wrong);

  return {
    id: record.id || `study-${studentId}-${index}`,
    date: record.date || new Date().toISOString().slice(0, 10),
    recordType: record.recordType || "Günlük Soru Çözümü",
    exam: record.exam || "TYT",
    lesson: record.lesson || "Matematik",
    topic: record.topic || "Konu girilmedi",
    subtopic: record.subtopic || "",
    source: record.source || "",
    targetQuestions: Math.max(0, toNumber(record.targetQuestions)),
    solvedQuestions,
    correct,
    wrong,
    blank,
    net: calculateNet(correct, wrong),
    duration: Math.max(0, toNumber(record.duration)),
    status: record.status || "Öğrenci Girdi",
    studentNote: record.studentNote || "",
    coachNote: record.coachNote || "",
    createdBy: record.createdBy || "coach",
  };
}

function normalizeMessage(message, studentId, index) {
  return {
    id: message.id || `message-${studentId}-${index}`,
    sender: message.sender || "coach",
    senderName: message.senderName || (message.sender === "student" ? "Öğrenci" : "Koç"),
    text: message.text || "",
    category: message.category || "Genel",
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function normalizeVideoPlaylist(playlist, studentId, index) {
  const videos = Array.isArray(playlist.videos) ? playlist.videos : [];

  return {
    id: playlist.id || `video-playlist-${studentId}-${index}`,
    exam: playlist.exam || "TYT",
    level: playlist.level || "Başlangıç",
    lesson: playlist.lesson || "Türkçe",
    topic: playlist.topic || "",
    channel: playlist.channel || "",
    title: playlist.title || "Video ders listesi",
    displayTitle: playlist.displayTitle || playlist.title || "Video ders listesi",
    playlistUrl: playlist.playlistUrl || "",
    playlistId: playlist.playlistId || "",
    originalPath: playlist.originalPath || "",
    originalFile: playlist.originalFile || "",
    importedVideoCount: Math.max(0, toNumber(playlist.importedVideoCount || videos.length)),
    isLinkSlot: Boolean(playlist.isLinkSlot),
    sourceType: playlist.sourceType || "Koç ekledi",
    createdAt: playlist.createdAt || "",
    videos: videos.map((video, videoIndex) => normalizeVideoLesson(video, playlist.id || `video-playlist-${studentId}-${index}`, videoIndex)),
  };
}

function normalizeVideoLesson(video, playlistId, index) {
  const youtubeId = video.youtubeId || extractYoutubeId(video.url);

  return {
    id: video.id || `${playlistId}-video-${index + 1}`,
    title: video.title || `Video ${index + 1}`,
    youtubeId,
    url: video.url || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""),
    playlistId: video.playlistId || "",
    thumbnailUrl: video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ""),
    videoType: video.videoType || "Video",
    order: Math.max(1, toNumber(video.order || index + 1)),
    estimatedMinutes: Math.max(1, toNumber(video.estimatedMinutes || 25)),
  };
}

function normalizeVideoProgress(progress = {}) {
  return Object.entries(progress).reduce((result, [videoId, record]) => {
    result[videoId] = {
      videoId,
      openCount: Math.max(0, toNumber(record?.openCount)),
      watchSeconds: Math.max(0, toNumber(record?.watchSeconds)),
      lastSessionSeconds: Math.max(0, toNumber(record?.lastSessionSeconds)),
      status: record?.status || "",
      lastOpenedAt: record?.lastOpenedAt || "",
      lastClosedAt: record?.lastClosedAt || "",
      isWatching: Boolean(record?.isWatching),
    };
    return result;
  }, {});
}

function normalizeSyncEvents(events = []) {
  if (!Array.isArray(events)) return [];

  return events
    .filter(Boolean)
    .map((event, index) => ({
      id: event.id || `sync-event-${index}`,
      type: event.type || "sync",
      actor: event.actor || "system",
      detail: event.detail || "",
      refId: event.refId || "",
      sourceType: event.sourceType || "",
      createdAt: event.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, MAX_SYNC_EVENTS);
}

function extractYoutubeId(url = "") {
  const decoded = String(url).replace(/&amp;/g, "&");
  const direct = decoded.match(/[?&]v=([^&]+)/);
  if (direct) return direct[1];
  const short = decoded.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const embed = decoded.match(/embed\/([^?&/]+)/);
  return embed ? embed[1] : "";
}

function normalizeResource(resource, studentId, index) {
  const totalUnits = Math.max(0, toNumber(resource.totalUnits));
  const completedUnits = Math.min(Math.max(0, toNumber(resource.completedUnits)), totalUnits || Infinity);
  const lessonInfo = parseCombinedLesson(resource.lesson || "TYT Matematik");
  const inferredExam = resource.exam || (EXAM_SUBJECTS[lessonInfo.exam] ? lessonInfo.exam : "TYT");

  return {
    id: resource.id || `resource-${studentId}-${index}`,
    title: resource.title || "Kaynak adı girilmedi",
    publisher: resource.publisher || "",
    exam: inferredExam,
    lesson: resource.lesson || "TYT Matematik",
    topic: resource.topic || "",
    subtopic: resource.subtopic || "",
    resourceType: resource.resourceType || "Soru Bankası",
    unitLabel: resource.unitLabel || "soru",
    totalUnits,
    completedUnits,
    status: resource.status || "Planlandı",
    dueDate: resource.dueDate || "",
    note: resource.note || "",
    createdBy: resource.createdBy || "coach",
    updatedBy: resource.updatedBy || "",
    updatedAt: resource.updatedAt || "",
  };
}

function inferExamRecordType(examType) {
  if (examType === "TYT") return "TYT Denemesi";
  if (examType === "YDT") return "YDT Denemesi";
  return "AYT Denemesi";
}

function normalizeExam(exam, studentId, index) {
  const examType = exam.examType || exam.type || "TYT";
  const sections = normalizeExamSections(examType, exam.sections || []);
  const sectionTotals = calculateExamTotals(sections);
  const hasSectionBreakdown = Array.isArray(exam.sections) && exam.sections.length > 0;
  const legacyCorrect = toNumber(exam.correct);
  const legacyWrong = toNumber(exam.wrong);
  const legacyBlank = toNumber(exam.blank);
  const hasLegacyBreakdown = exam.correct !== undefined || exam.wrong !== undefined;
  const legacyNet = hasLegacyBreakdown
    ? calculateNet(legacyCorrect, legacyWrong)
    : toNumber(exam.net ?? exam.tytNet ?? exam.aytNet);
  const totals = hasSectionBreakdown
    ? sectionTotals
    : {
        correct: legacyCorrect,
        wrong: legacyWrong,
        blank: legacyBlank,
        net: legacyNet,
      };

  return {
    id: exam.id || `exam-${studentId}-${index}`,
    name: exam.name || "Sınav/test adı girilmedi",
    date: exam.date || "",
    recordType: exam.recordType || inferExamRecordType(examType),
    examType,
    sections,
    correct: totals.correct,
    wrong: totals.wrong,
    blank: totals.blank,
    net: totals.net,
    tytNet: exam.tytNet !== undefined ? toNumber(exam.tytNet) : examType === "TYT" ? totals.net : 0,
    aytNet: exam.aytNet !== undefined ? toNumber(exam.aytNet) : examType !== "TYT" ? totals.net : 0,
    note: exam.note || "",
  };
}

function normalizeExamSections(examType, sections) {
  const subjects = EXAM_SUBJECTS[examType] || EXAM_SUBJECTS.TYT;

  return subjects.map((lesson) => {
    const section = sections.find((item) => item.lesson === lesson) || {};
    const correct = toNumber(section.correct);
    const wrong = toNumber(section.wrong);
    const questionCount = getSectionQuestionCount(examType, lesson);
    const blank = calculateAutomaticBlank(questionCount, correct, wrong);

    return {
      lesson,
      questionCount,
      correct,
      wrong,
      blank,
      net: calculateNet(correct, wrong),
    };
  });
}

function normalizeErrorRecord(error, studentId, index) {
  const lessonInfo = parseCombinedLesson(error.lesson || "TYT Ders girilmedi");
  const inferredExam = error.exam || (EXAM_SUBJECTS[lessonInfo.exam] ? lessonInfo.exam : "TYT");

  return {
    id: error.id || `error-${studentId}-${index}`,
    exam: inferredExam,
    lesson: error.lesson || "Ders girilmedi",
    type: error.type || "Hata türü girilmedi",
    count: toNumber(error.count),
    topic: error.topic || "",
    subtopic: error.subtopic || "",
    action: error.action || "",
    status: error.status || "Açık",
    source: error.source || "",
    studentNote: error.studentNote || "",
    createdBy: error.createdBy || "coach",
  };
}

function loadInitialStudents() {
  const fallbackStudents = isRemoteBackendEnabled() ? [] : demoStudents;

  try {
    const savedStudents = localStorage.getItem(STORAGE_KEY);
    if (!savedStudents) return fallbackStudents.map(normalizeStudent);

    const parsedStudents = JSON.parse(savedStudents);
    if (!Array.isArray(parsedStudents) || parsedStudents.length === 0) {
      return fallbackStudents.map(normalizeStudent);
    }

    return filterDeprecatedDemoStudents(parsedStudents.map(normalizeStudent));
  } catch (error) {
    console.error("Öğrenci verileri okunamadı:", error);
    return fallbackStudents.map(normalizeStudent);
  }
}

function filterDeprecatedDemoStudents(students) {
  return students.filter((student) => !deprecatedDemoStudentIds.has(String(student.id)));
}

function normalizeAccount(account, index = 0) {
  const role = ["coach", "student", "parent", "admin"].includes(account.role) ? account.role : "student";
  const defaultAccount = defaultAccounts.find((item) => item.id === account.id);
  const shouldSyncDefaultIdentity = ["coach-demo", "admin-demo"].includes(account.id);
  const email = shouldSyncDefaultIdentity
    ? defaultAccount?.email
    : account.email || defaultAccount?.email || (String(account.username || "").includes("@") ? account.username : "");

  return {
    id: account.id || createId("account"),
    role,
    name: shouldSyncDefaultIdentity
      ? defaultAccount?.name
      : account.name || (role === "coach" ? "Yeni Koç" : role === "admin" ? "Yeni Yönetici" : role === "parent" ? "Yeni Veli" : "Yeni Öğrenci"),
    email,
    username: email || account.username || createUsername(account.name, role, account.studentId || account.id || index),
    title: account.title || getDefaultAccountTitle(role),
    accessCode: String(["coach-demo", "admin-demo"].includes(account.id) && (!account.accessCode || ["1234", "0000"].includes(String(account.accessCode)))
      ? defaultAccount?.accessCode
      : account.accessCode || `${1000 + index}`),
    emailVerified: Boolean(account.emailVerified || account.isDemo),
    mustChangePassword: Boolean(account.mustChangePassword),
    firebaseUid: account.firebaseUid || "",
    isDemo: shouldSyncDefaultIdentity
      ? false
      : Boolean(account.isDemo || (defaultAccountIds.has(account.id) && !["coach-demo", "admin-demo"].includes(account.id))),
    studentId: (role === "student" || role === "parent") && account.studentId !== undefined && account.studentId !== ""
      ? account.studentId
      : undefined,
    createdAt: account.createdAt || new Date().toISOString(),
  };
}

function loadInitialAccounts() {
  try {
    const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!savedAccounts) return defaultAccounts.map(normalizeAccount);

    const parsedAccounts = JSON.parse(savedAccounts);
    if (!Array.isArray(parsedAccounts) || parsedAccounts.length === 0) {
      return defaultAccounts.map(normalizeAccount);
    }

    return mergeDefaultAccounts(parsedAccounts.map(normalizeAccount));
  } catch (error) {
    console.error("Hesaplar okunamadı:", error);
    return defaultAccounts.map(normalizeAccount);
  }
}

function mergeDefaultAccounts(savedAccounts) {
  const activeSavedAccounts = savedAccounts.filter((account) => !isDeprecatedDemoAccount(account));
  const savedIds = new Set(activeSavedAccounts.map((account) => account.id));
  const missingDefaults = defaultAccounts
    .filter((account) => !isDeprecatedDemoAccount(account) && !savedIds.has(account.id))
    .map(normalizeAccount);

  return [...activeSavedAccounts, ...missingDefaults];
}

function ensureStudentAccounts(accounts, students) {
  const activeAccounts = mergeDefaultAccounts(accounts.map(normalizeAccount));
  const accountKeys = new Set(
    activeAccounts.map((account) => `${account.role}:${String(account.studentId || "")}:${String(account.email || account.username || "").toLocaleLowerCase("tr-TR")}`)
  );
  const missingStudentAccounts = students
    .filter((student) => isRealEmailValue(student.email))
    .filter((student) => {
      const studentEmail = String(student.email).toLocaleLowerCase("tr-TR");
      const hasStudentIdAccount = activeAccounts.some((account) =>
        account.role === "student" && String(account.studentId) === String(student.id)
      );
      const hasEmailAccount = activeAccounts.some((account) =>
        account.role === "student" && String(account.email || account.username || "").toLocaleLowerCase("tr-TR") === studentEmail
      );

      return !hasStudentIdAccount && !hasEmailAccount;
    })
    .map((student, index) => normalizeAccount({
      id: `student-account-${student.id || index}`,
      role: "student",
      name: student.name,
      email: student.email,
      username: student.email,
      title: "Öğrenci paneli hesabı",
      accessCode: "",
      emailVerified: Boolean(student.emailVerified),
      mustChangePassword: false,
      studentId: student.id,
      isDemo: false,
      createdAt: new Date().toISOString(),
    }));

  return [...missingStudentAccounts.filter((account) => {
    const key = `${account.role}:${String(account.studentId || "")}:${String(account.email || account.username || "").toLocaleLowerCase("tr-TR")}`;
    if (accountKeys.has(key)) return false;
    accountKeys.add(key);
    return true;
  }), ...activeAccounts];
}

function getLoginAccounts(accounts) {
  const activeAccounts = mergeDefaultAccounts(accounts.map(normalizeAccount));
  const hasStudentAccount = activeAccounts.some((account) => account.role === "student");

  if (hasStudentAccount) {
    return activeAccounts;
  }

  return [
    ...activeAccounts,
    {
      id: STUDENT_EMAIL_LOGIN_ID,
      role: "student",
      name: "Öğrenci Girişi",
      email: "",
      username: "",
      title: "E-posta ile öğrenci paneli",
      accessCode: "",
      emailVerified: false,
      mustChangePassword: false,
      isDemo: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function isDeprecatedDemoAccount(account) {
  const accountEmail = String(account.email || account.username || "");
  return deprecatedDemoAccountIds.has(account.id) ||
    account.role === "parent" ||
    accountEmail.endsWith("@yks.local");
}

function isRealEmailValue(value) {
  const email = String(value || "").trim();
  return email.includes("@") && !email.endsWith("@yks.local");
}

function getDefaultAccountTitle(role) {
  if (role === "coach") return "Öğrenci takip hesabı";
  if (role === "admin") return "Kurum yönetimi hesabı";
  if (role === "parent") return "Veli rapor hesabı";
  return "Öğrenci paneli hesabı";
}

function loadInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Tema bilgisi okunamadı:", error);
    return "light";
  }
}

function calculateHomeworkCompletion(homeworks, fallbackValue = 0) {
  if (!Array.isArray(homeworks) || homeworks.length === 0) return fallbackValue;

  const completedCount = homeworks.filter((homework) => {
    return homework.status === "Tamamlandı" || homework.status === "Kontrol Edildi";
  }).length;

  return Math.round((completedCount / homeworks.length) * 100);
}

function calculateTopicProgress(topicTracking, fallbackValue = 0) {
  if (!Array.isArray(topicTracking) || topicTracking.length === 0) return fallbackValue;

  const readinessTotal = topicTracking.reduce((sum, topicRecord) => {
    return sum + calculateTopicReadiness(topicRecord);
  }, 0);

  return Math.round(readinessTotal / topicTracking.length);
}

function normalizeTopicStatus(status) {
  if (status === "Devam Ediyor") return "Konu anlatımı başladı";
  if (status === "Tekrar Gerekli") return "Tekrar gerekiyor";
  return status || "Başlamadı";
}

function normalizeLevel(level) {
  return ["Başlangıç", "Orta", "İleri"].includes(level) ? level : "Orta";
}

function normalizeLessonLevels(lessonLevels = {}, fallbackLevel = "Orta") {
  if (!lessonLevels || typeof lessonLevels !== "object") return {};

  return Object.fromEntries(
    Object.entries(lessonLevels)
      .filter(([key]) => key)
      .map(([key, value]) => [key, normalizeLevel(value || fallbackLevel)])
  );
}

function inferLearningStatus(status) {
  if (status === "Tamamlandı" || status === "Konu anlatımı bitti") return "Bitti";
  if (status === "Devam Ediyor" || status === "Konu anlatımı başladı") return "Öğreniliyor";
  return "Başlamadı";
}

function calculateResourceProgress(resources, fallbackValue = 0) {
  if (!Array.isArray(resources) || resources.length === 0) return fallbackValue;

  const totals = resources.reduce(
    (result, resource) => {
      const totalUnits = Math.max(0, toNumber(resource.totalUnits));
      const completedUnits = Math.min(Math.max(0, toNumber(resource.completedUnits)), totalUnits || Infinity);

      return {
        totalUnits: result.totalUnits + totalUnits,
        completedUnits: result.completedUnits + completedUnits,
      };
    },
    { totalUnits: 0, completedUnits: 0 }
  );

  if (totals.totalUnits === 0) return fallbackValue;
  return Math.round((totals.completedUnits / totals.totalUnits) * 100);
}

function calculateWeeklyPlanProgress(weeklyTasks = []) {
  if (!Array.isArray(weeklyTasks) || weeklyTasks.length === 0) return 0;

  const completed = weeklyTasks.filter((task) => task.status === "Tamamlandı").length;
  return Math.round((completed / weeklyTasks.length) * 100);
}

function calculateStudyTargetProgress(studyRecords = []) {
  if (!Array.isArray(studyRecords) || studyRecords.length === 0) return 0;

  const totals = studyRecords.reduce(
    (result, record) => ({
      target: result.target + Math.max(0, toNumber(record.targetQuestions)),
      solved: result.solved + Math.max(0, toNumber(record.solvedQuestions)),
    }),
    { target: 0, solved: 0 }
  );

  if (totals.target <= 0) return 0;
  return Math.min(100, Math.round((totals.solved / totals.target) * 100));
}

function calculateVideoLibraryProgress(videoPlaylists = [], videoProgress = {}) {
  const videos = (Array.isArray(videoPlaylists) ? videoPlaylists : []).flatMap((playlist) => playlist.videos || []);
  if (videos.length === 0) return 0;

  const completedVideos = videos.filter((video) => {
    const record = videoProgress?.[video.id] || {};
    const estimatedSeconds = Math.max(60, toNumber(video.estimatedMinutes || 25) * 60);
    return record.status === "Tamamlandı" || toNumber(record.watchSeconds) >= estimatedSeconds * 0.9;
  }).length;

  return Math.round((completedVideos / videos.length) * 100);
}

function recalculateStudentDerivedState(student) {
  const weeklyTasks = Array.isArray(student.weeklyTasks) ? student.weeklyTasks : [];
  const homeworks = Array.isArray(student.homeworks) ? student.homeworks : [];
  const resources = Array.isArray(student.resources) ? student.resources : [];
  const topicTracking = Array.isArray(student.topicTracking) ? student.topicTracking : [];
  const exams = Array.isArray(student.exams) ? student.exams : [];
  const studyRecords = Array.isArray(student.studyRecords) ? student.studyRecords : [];
  const videoPlaylists = Array.isArray(student.videoPlaylists) ? student.videoPlaylists : [];
  const videoProgress = student.videoProgress && typeof student.videoProgress === "object" ? student.videoProgress : {};
  const examSummary = getExamSummary(exams, student.lastTytNet, student.lastAytNet);
  const homeworkCompletion = calculateHomeworkCompletion(homeworks, student.homeworkCompletion);
  const resourceProgress = calculateResourceProgress(resources, student.resourceProgress);
  const topicProgress = calculateTopicProgress(topicTracking, student.topicProgress);
  const weeklyPlanProgress = calculateWeeklyPlanProgress(weeklyTasks);
  const studyTargetProgress = calculateStudyTargetProgress(studyRecords);
  const videoCompletion = calculateVideoLibraryProgress(videoPlaylists, videoProgress);

  return {
    ...examSummary,
    homeworkCompletion,
    resourceProgress,
    topicProgress,
    moduleProgress: {
      weeklyPlan: weeklyPlanProgress,
      homework: homeworkCompletion,
      resource: resourceProgress,
      topic: topicProgress,
      studyTarget: studyTargetProgress,
      video: videoCompletion,
    },
  };
}

function calculateNet(correct, wrong) {
  return Math.max(0, Number((toNumber(correct) - toNumber(wrong) / 4).toFixed(2)));
}

function calculateAutomaticBlank(questionCount, correct, wrong) {
  if (questionCount <= 0) return 0;
  return Math.max(0, questionCount - toNumber(correct) - toNumber(wrong));
}

function getSectionQuestionCount(examType, lesson) {
  return EXAM_QUESTION_COUNTS[examType]?.[lesson] || 0;
}

function calculateExamTotals(sections) {
  return sections.reduce(
    (totals, section) => {
      const correct = toNumber(section.correct);
      const wrong = toNumber(section.wrong);
      const blank = toNumber(section.blank);

      return {
        correct: totals.correct + correct,
        wrong: totals.wrong + wrong,
        blank: totals.blank + blank,
        net: Number((totals.net + calculateNet(correct, wrong)).toFixed(2)),
      };
    },
    { correct: 0, wrong: 0, blank: 0, net: 0 }
  );
}

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getExamSummary(exams, fallbackTyt = 0, fallbackAyt = 0) {
  if (!Array.isArray(exams) || exams.length === 0) {
    return { lastTytNet: fallbackTyt, lastAytNet: fallbackAyt };
  }

  const lastTytExam = getLatestExam(exams.filter((exam) => exam.examType === "TYT" || exam.tytNet > 0));
  const lastAytExam = getLatestExam(
    exams.filter((exam) => exam.examType?.startsWith("AYT") || exam.examType === "YDT" || exam.aytNet > 0)
  );

  return {
    lastTytNet: lastTytExam
      ? lastTytExam.examType === "TYT"
        ? lastTytExam.net
        : lastTytExam.tytNet
      : fallbackTyt,
    lastAytNet: lastAytExam
      ? lastAytExam.examType?.startsWith("AYT") || lastAytExam.examType === "YDT"
        ? lastAytExam.net
        : lastAytExam.aytNet
      : fallbackAyt,
  };
}

function getLatestExam(exams) {
  if (!Array.isArray(exams) || exams.length === 0) return null;

  return exams.reduce((latest, exam) => {
    if (!latest) return exam;
    if (!latest.date) return exam;
    if (!exam.date) return latest;
    return exam.date > latest.date ? exam : latest;
  }, null);
}

function getPayloadActor(payload = {}) {
  return payload.updatedBy || payload.createdBy || payload.generatedBy || payload.sender || "system";
}

function getPayloadRefId(payload = {}) {
  return payload.id || payload.videoId || payload.resourceId || payload.examId || "";
}

function createSyncEvent(sourceType, payload = {}, notices = []) {
  const firstNotice = notices[0] || {};

  return {
    id: createId("sync-event"),
    type: `${sourceType}.sync`,
    sourceType,
    actor: getPayloadActor(payload),
    detail: firstNotice.detail || "Öğrenci veri modeli yeniden senkronize edildi.",
    refId: getPayloadRefId(payload),
    createdAt: new Date().toISOString(),
  };
}

function createManualEvent(type, actor, detail, payload = {}) {
  return {
    id: createId("sync-event"),
    type,
    sourceType: type.split(".")[0] || "manual",
    actor: actor || getPayloadActor(payload),
    detail,
    refId: getPayloadRefId(payload),
    createdAt: new Date().toISOString(),
  };
}

function appendSyncEvent(student, event) {
  const now = event?.createdAt || new Date().toISOString();

  return {
    ...student,
    dataVersion: DATA_MODEL_VERSION,
    updatedAt: now,
    lastSyncedAt: now,
    syncEvents: normalizeSyncEvents([event, ...(student.syncEvents || [])]),
  };
}

function syncStudentModules(student, sourceType, payload) {
  const notices = [];
  let nextStudent = { ...student };

  if (sourceType === "study") {
    nextStudent = syncFromStudyRecord(nextStudent, payload, notices);
  }

  if (sourceType === "weeklyTask") {
    nextStudent = syncFromWeeklyTask(nextStudent, payload, notices);
  }

  if (sourceType === "homework") {
    nextStudent = syncFromHomework(nextStudent, payload, notices);
  }

  if (sourceType === "resource") {
    nextStudent = syncFromResource(nextStudent, payload, notices);
  }

  const dedupedNotices = dedupeNotices(notices);

  return {
    student: appendSyncEvent(nextStudent, createSyncEvent(sourceType, payload, dedupedNotices)),
    notices: dedupedNotices,
  };
}

function syncFromStudyRecord(student, record, notices) {
  const lessonValue = `${record.exam || "TYT"} ${record.lesson || "Matematik"}`;
  const solvedQuestions = toNumber(record.solvedQuestions);
  const targetQuestions = Math.max(1, toNumber(record.targetQuestions) || solvedQuestions || 25);
  const isCompleted = solvedQuestions >= targetQuestions;
  const now = new Date().toISOString();
  let nextStudent = upsertTopicFromSync(student, {
    exam: record.exam || "TYT",
    lesson: record.lesson || "Matematik",
    topic: record.topic || "Konu girilmedi",
    subtopic: record.subtopic || "",
    status: getTopicStatusFromStudy(record, isCompleted),
    learningStatus: isCompleted ? "Bitti" : "Öğreniliyor",
    questionStatus: getQuestionStatusFromSolved(solvedQuestions),
    netStatus: getNetStatusFromRecord(record),
    errorType: toNumber(record.wrong) > 0 ? "Dikkat Hatası" : "Yok",
    reviewDate: getReviewDate(record.date, isCompleted ? 21 : 7),
    note: `${record.recordType || "Çalışma"} kaydından otomatik güncellendi.`,
    updatedBy: record.createdBy || "student",
    updatedAt: now,
  });

  const weeklyTasks = (nextStudent.weeklyTasks || []).map((task) => {
    if (!matchesLearningItem(task, lessonValue, record.topic, record.subtopic)) return task;
    const taskTarget = Math.max(1, toNumber(task.targetQuestions) || targetQuestions);
    const completedTask = solvedQuestions >= taskTarget;

    return {
      ...task,
      status: completedTask ? "Tamamlandı" : "Devam Ediyor",
      completedAt: completedTask ? now : task.completedAt,
    };
  });

  const homeworks = (nextStudent.homeworks || []).map((homework) => {
    if (!matchesLearningItem(homework, lessonValue, record.topic, record.subtopic)) return homework;
    if (!String(record.recordType || "").includes("Ödev")) return homework;

    return {
      ...homework,
      status: isCompleted ? "Tamamlandı" : "Devam Ediyor",
      submittedAt: now,
      studentNote: homework.studentNote || "Günlük çalışma kaydıyla otomatik eşleşti.",
    };
  });

  const resources = (nextStudent.resources || []).map((resource, index) => {
    if (!matchesResourceStudy(resource, record)) return resource;
    const totalUnits = Math.max(0, toNumber(resource.totalUnits));
    const completedUnits = Math.min(
      totalUnits || Infinity,
      Math.max(toNumber(resource.completedUnits), solvedQuestions)
    );

    return normalizeResource({
      ...resource,
      completedUnits,
      status: totalUnits > 0 && completedUnits >= totalUnits ? "Tamamlandı" : "Devam Ediyor",
      updatedBy: record.createdBy || "student",
      updatedAt: now,
    }, nextStudent.id, index);
  });

  notices.push({
    title: "Günlük çalışma senkronize edildi",
    detail: "Haftalık plan, ödev ve kaynak kayıtları uygun olan yerlerde güncellendi.",
  });

  return {
    ...nextStudent,
    weeklyTasks,
    homeworks,
    resources,
    homeworkCompletion: calculateHomeworkCompletion(homeworks, nextStudent.homeworkCompletion),
    resourceProgress: calculateResourceProgress(resources, nextStudent.resourceProgress),
  };
}

function syncFromWeeklyTask(student, task, notices) {
  const lessonInfo = parseCombinedLesson(task.lesson);
  const isCompleted = task.status === "Tamamlandı";
  const isStarted = task.status === "Devam Ediyor" || isCompleted;
  const now = new Date().toISOString();
  let nextStudent = upsertTopicFromSync(student, {
    exam: lessonInfo.exam,
    lesson: lessonInfo.lesson,
    topic: task.topic || "Konu girilmedi",
    subtopic: task.subtopic || "",
    status: isCompleted ? "Temel test çözüldü" : isStarted ? "Konu anlatımı başladı" : "Başlamadı",
    learningStatus: isCompleted ? "Bitti" : isStarted ? "Öğreniliyor" : "Başlamadı",
    questionStatus: isCompleted ? getQuestionStatusFromSolved(task.targetQuestions) : "Az",
    netStatus: "Ölçülmedi",
    errorType: "Yok",
    reviewDate: isCompleted ? getReviewDate(new Date().toISOString().slice(0, 10), 7) : "",
    note: "Haftalık plan periyodundan otomatik güncellendi.",
    updatedBy: task.generatedBy || "coach",
    updatedAt: now,
  });

  const homeworks = (nextStudent.homeworks || []).map((homework) => {
    if (!matchesLearningItem(homework, task.lesson, task.topic, task.subtopic)) return homework;
    if (!isCompleted) return homework;

    return {
      ...homework,
      status: homework.status === "Kontrol Edildi" ? homework.status : "Tamamlandı",
      submittedAt: homework.submittedAt || now,
    };
  });

  const resources = (nextStudent.resources || []).map((resource, index) => {
    if (!matchesLearningItem(resource, task.lesson, task.topic, task.subtopic) || !isCompleted) return resource;
    const totalUnits = Math.max(0, toNumber(resource.totalUnits));
    const completedUnits = Math.min(totalUnits || Infinity, Math.max(toNumber(resource.completedUnits), toNumber(task.targetQuestions)));

    return normalizeResource({
      ...resource,
      completedUnits,
      status: totalUnits > 0 && completedUnits >= totalUnits ? "Tamamlandı" : resource.status,
      updatedBy: task.generatedBy || "coach",
      updatedAt: now,
    }, nextStudent.id, index);
  });

  notices.push({
    title: "Haftalık plan senkronize edildi",
    detail: "Saatlik plan değişikliği ödev ve kaynak kayıtlarıyla eşleştirildi.",
  });

  return {
    ...nextStudent,
    homeworks,
    resources,
    homeworkCompletion: calculateHomeworkCompletion(homeworks, nextStudent.homeworkCompletion),
    resourceProgress: calculateResourceProgress(resources, nextStudent.resourceProgress),
  };
}

function syncFromHomework(student, homework, notices) {
  const isCompleted = homework.status === "Tamamlandı" || homework.status === "Kontrol Edildi";
  const isStarted = homework.status === "Devam Ediyor" || isCompleted;
  const lessonInfo = parseCombinedLesson(homework.lesson);
  const now = new Date().toISOString();
  let nextStudent = upsertTopicFromSync(student, {
    exam: lessonInfo.exam,
    lesson: lessonInfo.lesson,
    topic: homework.topic || "Konu girilmedi",
    subtopic: homework.subtopic || "",
    status: isCompleted ? "Temel test çözüldü" : isStarted ? "Konu anlatımı başladı" : "Başlamadı",
    learningStatus: isCompleted ? "Bitti" : isStarted ? "Öğreniliyor" : "Başlamadı",
    questionStatus: isCompleted ? "Orta" : "Az",
    netStatus: "Ölçülmedi",
    errorType: homework.status === "Eksik" ? "Bilgi Eksiği" : "Yok",
    reviewDate: isCompleted ? getReviewDate(new Date().toISOString().slice(0, 10), 7) : "",
    note: "Ödev yönetiminden otomatik güncellendi.",
    updatedBy: "student",
    updatedAt: now,
  });

  const weeklyTasks = (nextStudent.weeklyTasks || []).map((task) => {
    if (!matchesLearningItem(task, homework.lesson, homework.topic, homework.subtopic)) return task;
    return {
      ...task,
      status: isCompleted ? "Tamamlandı" : isStarted ? "Devam Ediyor" : task.status,
      completedAt: isCompleted ? now : task.completedAt,
    };
  });

  notices.push({
    title: "Ödev durumu senkronize edildi",
    detail: "Ödev değişikliği haftalık plan ve konu takibine işlendi.",
  });

  return { ...nextStudent, weeklyTasks };
}

function syncFromResource(student, resource, notices) {
  const progress = getResourceProgress(resource);
  if (progress <= 0 && resource.status === "Planlandı") return student;

  const lessonInfo = parseCombinedLesson(resource.lesson);
  const now = new Date().toISOString();
  const completed = progress >= 100 || resource.status === "Tamamlandı";
  const nextStudent = upsertTopicFromSync(student, {
    exam: lessonInfo.exam,
    lesson: lessonInfo.lesson,
    topic: resource.topic || "Konu girilmedi",
    subtopic: resource.subtopic || "",
    status: completed ? "Orta test çözüldü" : "Temel test çözüldü",
    learningStatus: completed ? "Bitti" : "Öğreniliyor",
    questionStatus: completed ? "Yeterli" : "Orta",
    netStatus: "Ölçülmedi",
    errorType: "Yok",
    reviewDate: completed ? getReviewDate(new Date().toISOString().slice(0, 10), 21) : getReviewDate(new Date().toISOString().slice(0, 10), 7),
    note: "Kaynak takibinden otomatik güncellendi.",
    updatedBy: resource.updatedBy || resource.createdBy || "student",
    updatedAt: now,
  });

  notices.push({
    title: "Kaynak takibi senkronize edildi",
    detail: "Kaynak ilerlemesi konu takibine ve genel ilerleme hesabına yansıtıldı.",
  });

  return nextStudent;
}

function upsertTopicFromSync(student, topicPatch) {
  const topicTracking = [...(student.topicTracking || [])];
  const normalizedTopicPatch = {
    ...topicPatch,
    level: normalizeLevel(topicPatch.level || student.programLevel || "Orta"),
  };
  const existingIndex = topicTracking.findIndex((topicRecord) =>
    topicRecord.exam === normalizedTopicPatch.exam &&
    normalizeComparable(topicRecord.lesson) === normalizeComparable(normalizedTopicPatch.lesson) &&
    normalizeComparable(topicRecord.topic) === normalizeComparable(normalizedTopicPatch.topic) &&
    normalizeComparable(topicRecord.subtopic || "") === normalizeComparable(normalizedTopicPatch.subtopic || "")
  );

  if (existingIndex >= 0) {
    topicTracking[existingIndex] = {
      ...topicTracking[existingIndex],
      ...normalizedTopicPatch,
      id: topicTracking[existingIndex].id,
    };
  } else {
    topicTracking.unshift({
      ...normalizedTopicPatch,
      id: createId("topic"),
    });
  }

  return {
    ...student,
    topicTracking,
    topicProgress: calculateTopicProgress(topicTracking, student.topicProgress),
  };
}

function matchesLearningItem(item, lessonValue, topic, subtopic = "") {
  const itemLesson = parseCombinedLesson(item.lesson);
  const targetLesson = parseCombinedLesson(lessonValue);
  const sameLesson = itemLesson.exam === targetLesson.exam &&
    normalizeComparable(itemLesson.lesson) === normalizeComparable(targetLesson.lesson);
  const sameTopic = !topic || !item.topic || normalizeComparable(item.topic) === normalizeComparable(topic);
  const sameSubtopic = !subtopic || !item.subtopic || normalizeComparable(item.subtopic) === normalizeComparable(subtopic);

  return sameLesson && sameTopic && sameSubtopic;
}

function matchesResourceStudy(resource, record) {
  const sourceText = normalizeComparable(record.source || "");
  const resourceText = normalizeComparable(`${resource.publisher || ""} ${resource.title || ""}`);
  const sourceMatches = sourceText && resourceText && resourceText.includes(sourceText);
  const resourceInSource = sourceText && resourceText && sourceText.includes(resourceText);

  return sourceMatches || resourceInSource || matchesLearningItem(resource, `${record.exam} ${record.lesson}`, record.topic, record.subtopic);
}

function parseCombinedLesson(lessonValue = "TYT Matematik") {
  const parts = String(lessonValue || "").trim().split(/\s+/);
  const exam = parts[0] || "TYT";

  return {
    exam,
    lesson: parts.slice(1).join(" ") || "Matematik",
  };
}

function getTopicStatusFromStudy(record, isCompleted) {
  const recordType = String(record.recordType || "");
  if (recordType.includes("Deneme") || recordType.includes("Tarama")) return "Denemede ölçüldü";
  if (isCompleted && toNumber(record.solvedQuestions) >= 45) return "Orta test çözüldü";
  if (toNumber(record.solvedQuestions) > 0) return "Temel test çözüldü";
  return "Konu anlatımı başladı";
}

function getQuestionStatusFromSolved(value) {
  const solved = toNumber(value);
  if (solved >= 60) return "Yeterli";
  if (solved >= 25) return "Orta";
  return "Az";
}

function getNetStatusFromRecord(record) {
  const solved = Math.max(1, toNumber(record.solvedQuestions));
  const ratio = toNumber(record.net) / solved;
  if (ratio >= 0.72) return "İyi";
  if (ratio >= 0.45) return "Orta";
  return "Zayıf";
}

function getReviewDate(dateValue, dayOffset) {
  const baseDate = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  if (Number.isNaN(baseDate.getTime())) return "";
  baseDate.setDate(baseDate.getDate() + dayOffset);
  return baseDate.toISOString().slice(0, 10);
}

function normalizeComparable(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeNotices(notices) {
  const seen = new Set();
  return notices.filter((notice) => {
    const key = `${notice.title}-${notice.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getResourceProgress(resource) {
  const totalUnits = toNumber(resource.totalUnits);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((toNumber(resource.completedUnits) / totalUnits) * 100));
}

function App() {
  const [activeRole, setActiveRole] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [students, setStudents] = useState(loadInitialStudents);
  const [accounts, setAccounts] = useState(loadInitialAccounts);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [syncNotices, setSyncNotices] = useState([]);
  const [remoteReady, setRemoteReady] = useState(!isRemoteBackendEnabled());
  const [systemStatus, setSystemStatus] = useState({
    mode: getBackendLabel(),
    detail: "Veriler yerel olarak hazır.",
    tone: isRemoteBackendEnabled() ? "warning" : "neutral",
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrateRemoteData() {
      if (!isRemoteBackendEnabled()) {
        setRemoteReady(true);
        return;
      }

      try {
        const remoteData = await loadRemoteAppData();
        if (cancelled) return;

        const remoteStudents = Array.isArray(remoteData?.students) ? remoteData.students : [];
        const remoteAccounts = Array.isArray(remoteData?.accounts) ? remoteData.accounts : [];

        if (remoteStudents.length > 0) {
          setStudents(filterDeprecatedDemoStudents(remoteStudents.map(normalizeStudent)));
        }

        if (remoteAccounts.length > 0) {
          setAccounts(mergeDefaultAccounts(remoteAccounts.map(normalizeAccount)));
        }

        setSystemStatus({
          mode: getBackendLabel(),
          detail: remoteStudents.length > 0 || remoteAccounts.length > 0
            ? `${remoteStudents.length} öğrenci ve ${remoteAccounts.length} hesap Firestore'dan yüklendi.`
            : "Firestore hazır; ilk kayıt yerel veriden gönderilecek.",
          tone: "success",
        });
      } catch (error) {
        console.error("Uzak veri yüklenemedi:", error);
        if (!cancelled) {
          setSystemStatus({
            mode: getBackendLabel(),
            detail: "Uzak sistem okunamadı; yerel yedekle devam ediliyor.",
            tone: "warning",
          });
        }
      } finally {
        if (!cancelled) {
          setRemoteReady(true);
        }
      }
    }

    hydrateRemoteData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error("Öğrenci verileri kaydedilemedi:", error);
    }

    const hasRemoteWritableData = students.length > 0 || accounts.some((account) => account.role === "student");

    if (isRemoteBackendEnabled() && remoteReady && hasRemoteWritableData) {
      saveRemoteAppData({ students, accounts })
        .then(() => {
          setSystemStatus({
            mode: getBackendLabel(),
            detail: "Son değişiklik Firestore'a gönderildi.",
            tone: "success",
          });
        })
        .catch((error) => {
          console.error("Firestore verisi kaydedilemedi:", error);
          setSystemStatus({
            mode: getBackendLabel(),
            detail: "Uzak kayıt başarısız; yerel kayıt korundu.",
            tone: "warning",
          });
        });
    }
  }, [students, accounts, remoteReady]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error("Hesaplar kaydedilemedi:", error);
    }
  }, [accounts]);

  useEffect(() => {
    setAccounts((currentAccounts) => {
      const nextAccounts = ensureStudentAccounts(currentAccounts, students);
      const currentSignature = currentAccounts.map((account) => `${account.id}:${account.role}:${account.studentId || ""}:${account.email || account.username || ""}`).join("|");
      const nextSignature = nextAccounts.map((account) => `${account.id}:${account.role}:${account.studentId || ""}:${account.email || account.username || ""}`).join("|");

      return currentSignature === nextSignature ? currentAccounts : nextAccounts;
    });
  }, [students]);

  useEffect(() => {
    document.body.dataset.theme = theme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Tema bilgisi kaydedilemedi:", error);
    }
  }, [theme]);

  const selectedStudent = useMemo(() => {
    return students.find((student) => student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const activeStudent = useMemo(() => {
    if (activeAccount?.studentId !== undefined) {
      return students.find((student) => String(student.id) === String(activeAccount.studentId)) || students[0] || demoStudents[0];
    }

    return students[0] || demoStudents[0];
  }, [activeAccount, students]);

  const coachStudents = useMemo(() => {
    if (activeAccount?.role !== "coach") return students;
    if (activeAccount.id === "coach-demo") {
      return students.filter((student) => !student.coachId || student.coachId === activeAccount.id);
    }

    return students.filter((student) => student.coachId === activeAccount.id);
  }, [activeAccount, students]);

  const loginAccounts = useMemo(() => getLoginAccounts(accounts), [accounts]);

  const handleLogin = async (accountId, accessCode, username = "") => {
    if (accountId === STUDENT_EMAIL_LOGIN_ID) {
      const studentEmail = username.trim().toLocaleLowerCase("tr-TR");

      if (!studentEmail || !accessCode) {
        setLoginError("Öğrenci e-postası ve şifre girilmeli.");
        return;
      }

      try {
        const firebaseUser = await signInFirebaseUser({
          email: studentEmail,
          password: accessCode,
          requireEmailVerified: true,
        });
        const remoteData = isRemoteBackendEnabled() ? await loadRemoteAppData() : null;
        const remoteStudents = filterDeprecatedDemoStudents((remoteData?.students || students).map(normalizeStudent));
        const remoteAccounts = mergeDefaultAccounts((remoteData?.accounts || accounts).map(normalizeAccount));
        const matchedStudent = remoteStudents.find((student) =>
          String(student.email || "").toLocaleLowerCase("tr-TR") === studentEmail
        );

        if (!matchedStudent) {
          setLoginError("Bu e-posta için öğrenci kaydı bulunamadı.");
          return;
        }

        const studentAccount = normalizeAccount({
          id: `student-account-${matchedStudent.id}`,
          role: "student",
          name: matchedStudent.name,
          email: studentEmail,
          username: studentEmail,
          title: "Öğrenci paneli hesabı",
          accessCode: "",
          emailVerified: firebaseUser.emailVerified,
          mustChangePassword: false,
          firebaseUid: firebaseUser.uid,
          studentId: matchedStudent.id,
          isDemo: false,
          createdAt: new Date().toISOString(),
        });

        setStudents(remoteStudents);
        setAccounts(ensureStudentAccounts([studentAccount, ...remoteAccounts], remoteStudents));
        setActiveAccount(studentAccount);
        setActiveRole("student");
        setLoginError("");
        setSelectedStudentId(null);
        return;
      } catch (error) {
        setLoginError(error?.message || "Firebase giriş doğrulaması başarısız.");
        return;
      }
    }

    const account = accounts.find((item) => item.id === accountId);

    const normalizedUsername = username.trim().toLocaleLowerCase("tr-TR");
    const accountUsername = String(account?.username || account?.email || "").toLocaleLowerCase("tr-TR");
    const loginEmail = accountUsername || normalizedUsername;

    if (!account || !accessCode || !loginEmail || (accountUsername && normalizedUsername && normalizedUsername !== accountUsername)) {
      setLoginError("Hesap veya giriş kodu hatalı.");
      return;
    }

    if (isProductionMode() && account.isDemo) {
      setLoginError("Canlı modda demo hesaplarla giriş kapalı. Yönetici panelinden gerçek hesap oluşturulmalı.");
      return;
    }

    let authenticatedAccount = account;
    const shouldUseFirebaseLogin = isFirebaseAuthEnabled() &&
      Boolean(loginEmail) &&
      !String(loginEmail).endsWith("@yks.local");

    if (shouldUseFirebaseLogin) {
      try {
        const firebaseUser = await signInFirebaseUser({
          email: loginEmail,
          password: accessCode,
          requireEmailVerified: account.role === "student",
        });
        const remoteData = isRemoteBackendEnabled() ? await loadRemoteAppData() : null;
        const remoteStudents = filterDeprecatedDemoStudents((remoteData?.students || students).map(normalizeStudent));
        const remoteAccounts = mergeDefaultAccounts((remoteData?.accounts || accounts).map(normalizeAccount));
        const matchedRemoteAccount = remoteAccounts.find((remoteAccount) =>
          remoteAccount.role === account.role &&
          String(remoteAccount.email || remoteAccount.username || "").toLocaleLowerCase("tr-TR") === loginEmail
        );

        authenticatedAccount = normalizeAccount({
          ...(matchedRemoteAccount || account),
          email: loginEmail,
          username: loginEmail,
          emailVerified: firebaseUser.emailVerified,
          firebaseUid: firebaseUser.uid,
        });
        setStudents(remoteStudents);
        setAccounts((currentAccounts) =>
          ensureStudentAccounts(
            [authenticatedAccount, ...remoteAccounts, ...currentAccounts.filter((item) => item.id !== account.id)],
            remoteStudents
          )
        );
      } catch (error) {
        setLoginError(error?.message || "Firebase giriş doğrulaması başarısız.");
        return;
      }
    } else if (account.accessCode !== accessCode) {
      setLoginError("Hesap veya giriş kodu hatalı.");
      return;
    }

    setActiveAccount(authenticatedAccount);
    setActiveRole(authenticatedAccount.role);
    setLoginError("");
    setSelectedStudentId(null);
  };

  const handlePasswordReset = async (username = "") => {
    const email = username.trim();

    if (!email) {
      setLoginError("Şifre sıfırlama için e-posta adresi yazılmalı.");
      return;
    }

    try {
      await sendFirebasePasswordReset(email);
      setLoginError("Şifre sıfırlama bağlantısı e-posta adresine gönderildi.");
    } catch (error) {
      setLoginError(error?.message || "Şifre sıfırlama e-postası gönderilemedi.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOutFirebaseUser();
    } catch (error) {
      console.warn("Firebase çıkışı tamamlanamadı:", error);
    }

    setActiveRole(null);
    setActiveAccount(null);
    setLoginError("");
    setSelectedStudentId(null);
  };

  const handleOpenStudent = (student) => {
    setSelectedStudentId(student.id);
  };

  const handleBackToCoach = () => {
    setSelectedStudentId(null);
  };

  const handleAddStudent = async (studentPayload) => {
    const assignedCoachId = activeAccount?.role === "coach"
      ? activeAccount.id
      : studentPayload.coachId || "coach-demo";
    const temporaryPassword = createTemporaryPassword();
    let firebaseUser = null;

    if (isFirebaseAuthEnabled()) {
      try {
        firebaseUser = await createFirebaseUser({
          email: studentPayload.email,
          password: temporaryPassword,
        });
      } catch (error) {
        const message = String(error?.message || "");

        if (!message.includes("zaten bir öğrenci hesabı var")) {
          throw error;
        }

        firebaseUser = null;
      } finally {
        try {
          await signOutFirebaseUser();
        } catch (error) {
          console.warn("Firebase oturumu kapatılamadı:", error);
        }
      }
    }

    const newStudent = normalizeStudent({
      ...studentPayload,
      id: Date.now(),
      coachId: assignedCoachId,
      area: studentPayload.area || studentPayload.scoreType || "EA",
      programStartDate: studentPayload.programStartDate || new Date().toISOString().slice(0, 10),
      weeklyTasks: [],
      homeworks: [],
      exams: [],
      errors: [],
      studyRecords: [],
      messages: [],
      coachNote: studentPayload.coachNote || "Yeni öğrenci için koç notu henüz girilmedi.",
    });

    setStudents((currentStudents) => [newStudent, ...currentStudents]);
    setAccounts((currentAccounts) => {
      const hasAccount = currentAccounts.some((account) =>
        account.role === "student" && String(account.studentId) === String(newStudent.id)
      );

      if (hasAccount) return currentAccounts;

      return [
        normalizeAccount({
          id: createId("student-account"),
          role: "student",
          name: newStudent.name,
          email: newStudent.email,
          username: newStudent.email || createUsername(newStudent.name, "student", newStudent.id),
          title: "Öğrenci paneli hesabı",
          accessCode: temporaryPassword,
          emailVerified: Boolean(firebaseUser?.emailVerified),
          mustChangePassword: true,
          firebaseUid: firebaseUser?.uid || "",
          studentId: newStudent.id,
          isDemo: false,
          createdAt: new Date().toISOString(),
        }),
        ...currentAccounts,
      ];
    });
  };

  const handleUpdateStudent = (updatedStudent) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === updatedStudent.id
          ? normalizeStudent({
              ...student,
              ...updatedStudent,
              weeklyTasks: student.weeklyTasks || [],
              homeworks: student.homeworks || [],
              exams: student.exams || [],
              errors: student.errors || [],
              studyRecords: student.studyRecords || [],
              messages: student.messages || [],
            })
          : student
      )
    );

    if (updatedStudent.email !== undefined) {
      setAccounts((currentAccounts) =>
        currentAccounts.map((account) =>
          account.role === "student" && String(account.studentId) === String(updatedStudent.id)
            ? normalizeAccount({
                ...account,
                email: updatedStudent.email,
                username: updatedStudent.email,
              })
            : account
        )
      );
    }
  };

  const handleDeleteStudent = (studentId) => {
    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentId)
    );

    if (selectedStudentId === studentId) {
      setSelectedStudentId(null);
    }
  };

  const handleAssignCoach = (studentId, coachId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === studentId
          ? normalizeStudent({
              ...student,
              coachId: coachId || "coach-demo",
              updatedAt: new Date().toISOString(),
            })
          : student
      )
    );
  };

  const handleResetDemoData = () => {
    if (isRemoteBackendEnabled()) {
      setStudents([]);
      setSelectedStudentId(null);
      return;
    }

    setStudents(filterDeprecatedDemoStudents(demoStudents.map(normalizeStudent)));
    setSelectedStudentId(null);
  };

  const handleAddAccount = (accountPayload) => {
    setAccounts((currentAccounts) => [
      normalizeAccount({
        ...accountPayload,
        id: createId("account"),
        createdAt: new Date().toISOString(),
      }, currentAccounts.length + 1),
      ...currentAccounts,
    ]);
  };

  const handleDeleteAccount = (accountId) => {
    setAccounts((currentAccounts) => {
      if (currentAccounts.length <= 1) return currentAccounts;
      return currentAccounts.filter((account) => account.id !== accountId);
    });

    if (activeAccount?.id === accountId) {
      handleLogout();
    }
  };

  const handleResetAccounts = () => {
    setAccounts(defaultAccounts.map(normalizeAccount));
  };

  const handleUpdateActiveAccountPassword = async (newAccessCode) => {
    if (!activeAccount?.id || !newAccessCode) return;

    if (isFirebaseAuthEnabled() && activeAccount.email && !String(activeAccount.email).endsWith("@yks.local")) {
      await updateFirebasePassword(newAccessCode);
    }

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === activeAccount.id
          ? normalizeAccount({
              ...account,
              accessCode: newAccessCode,
              mustChangePassword: false,
              updatedAt: new Date().toISOString(),
            })
          : account
      )
    );
    setActiveAccount((currentAccount) =>
      currentAccount
        ? {
            ...currentAccount,
            accessCode: newAccessCode,
            mustChangePassword: false,
          }
        : currentAccount
    );
  };

  const handleExportBackup = () => {
    downloadJsonBackup(createBackupPayload({
      students,
      accounts,
      version: APP_VERSION,
    }));
  };

  const handleImportBackup = async (file) => {
    if (!file) return;

    try {
      const backup = await readBackupFile(file);
      const importedStudents = backup.students;
      setStudents(importedStudents.map(normalizeStudent));
      if (Array.isArray(backup.accounts) && backup.accounts.length > 0) {
        setAccounts(backup.accounts.map(normalizeAccount));
      }
      setSelectedStudentId(null);
      setSystemStatus({
        mode: getBackendLabel(),
        detail: `${importedStudents.length} öğrenci${backup.accounts?.length ? ` ve ${backup.accounts.length} hesap` : ""} yedekten yüklendi.`,
        tone: "success",
      });
    } catch (error) {
      console.error("Yedek içe aktarılamadı:", error);
      setSystemStatus({
        mode: getBackendLabel(),
        detail: error.message || "Yedek içe aktarılamadı.",
        tone: "warning",
      });
    }
  };

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const pushSyncNotice = (title, detail) => {
    const id = createId("sync");

    setSyncNotices((currentNotices) => [
      { id, title, detail },
      ...currentNotices,
    ].slice(0, 4));

    window.setTimeout(() => {
      setSyncNotices((currentNotices) => currentNotices.filter((notice) => notice.id !== id));
    }, 5600);
  };

  const showSyncNotices = (notices = []) => {
    notices.forEach((notice, index) => {
      window.setTimeout(() => pushSyncNotice(notice.title, notice.detail), index * 120);
    });
  };

  const dismissSyncNotice = (noticeId) => {
    setSyncNotices((currentNotices) => currentNotices.filter((notice) => notice.id !== noticeId));
  };

  const handleAddWeeklyTask = (studentId, taskPayload) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newTask = {
          ...taskPayload,
          id: createId("task"),
        };
        const syncResult = syncStudentModules({
          ...student,
          weeklyTasks: [newTask, ...(student.weeklyTasks || [])],
        }, "weeklyTask", newTask);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleUpdateWeeklyTask = (studentId, updatedTask) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const updatedTasks = (student.weeklyTasks || []).map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        );
        const syncedTask = updatedTasks.find((task) => task.id === updatedTask.id) || updatedTask;
        const syncResult = syncStudentModules({
          ...student,
          weeklyTasks: updatedTasks,
        }, "weeklyTask", syncedTask);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleApplyWeeklyTemplate = (studentId, templatePayload = {}) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const area = templatePayload.area || student.area || student.scoreType || "EA";
        const lessonLevels = normalizeLessonLevels(
          templatePayload.lessonLevels || student.lessonLevels,
          templatePayload.programLevel || student.programLevel || "Orta"
        );
        const generatedTasks = createWeeklyPlan(area, {
          carryTasks: student.weeklyTasks || [],
          periodMode: templatePayload.periodMode || student.periodMode || "4",
          customPeriodCount: templatePayload.customPeriodCount || student.customPeriodCount || 4,
          programLevel: templatePayload.programLevel || student.programLevel || "Orta",
          lessonLevels,
          createdBy: templatePayload.createdBy || "coach",
        }).map((task) => ({
          ...task,
          id: createId("task"),
        }));

        return normalizeStudent(appendSyncEvent({
          ...student,
          area,
          programStartDate: templatePayload.programStartDate || student.programStartDate,
          programLevel: templatePayload.programLevel || student.programLevel || "Orta",
          lessonLevels,
          periodMode: templatePayload.periodMode || student.periodMode || "4",
          customPeriodCount: templatePayload.customPeriodCount || student.customPeriodCount || 4,
          weeklyPlanUpdatedAt: new Date().toISOString(),
          weeklyTasks: generatedTasks,
        }, createManualEvent(
          "weeklyTemplate.apply",
          templatePayload.createdBy || "coach",
          "Otomatik haftalık çalışma planı yeniden üretildi.",
          templatePayload
        )));
      })
    );

    window.setTimeout(() => {
      pushSyncNotice(
        "Otomatik saatlik plan oluşturuldu",
        "Alan, başlangıç tarihi, ders seviyeleri ve günlük çalışma saatine göre haftalık plan yeniden üretildi."
      );
    }, 0);
  };

  const handleDeleteWeeklyTask = (studentId, taskId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        return normalizeStudent(appendSyncEvent({
          ...student,
          weeklyTasks: (student.weeklyTasks || []).filter((task) => task.id !== taskId),
        }, createManualEvent(
          "weeklyTask.delete",
          "coach",
          "Haftalık çalışma silindi; bağlı ilerleme değerleri yeniden hesaplandı.",
          { id: taskId }
        )));
      })
    );
  };

  const handleAddHomework = (studentId, homeworkPayload) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newHomework = {
          ...homeworkPayload,
          id: createId("homework"),
        };
        const newHomeworks = [newHomework, ...(student.homeworks || [])];
        const syncResult = syncStudentModules({
          ...student,
          homeworks: newHomeworks,
          homeworkCompletion: calculateHomeworkCompletion(newHomeworks, student.homeworkCompletion),
        }, "homework", newHomework);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleUpdateHomework = (studentId, updatedHomework) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newHomeworks = (student.homeworks || []).map((homework) =>
          homework.id === updatedHomework.id ? { ...homework, ...updatedHomework } : homework
        );
        const syncedHomework = newHomeworks.find((homework) => homework.id === updatedHomework.id) || updatedHomework;
        const syncResult = syncStudentModules({
          ...student,
          homeworks: newHomeworks,
          homeworkCompletion: calculateHomeworkCompletion(newHomeworks, student.homeworkCompletion),
        }, "homework", syncedHomework);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleDeleteHomework = (studentId, homeworkId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newHomeworks = (student.homeworks || []).filter(
          (homework) => homework.id !== homeworkId
        );

        return normalizeStudent(appendSyncEvent({
          ...student,
          homeworks: newHomeworks,
          homeworkCompletion: calculateHomeworkCompletion(newHomeworks, student.homeworkCompletion),
        }, createManualEvent(
          "homework.delete",
          "coach",
          "Ödev silindi; ödev tamamlama ve genel ilerleme yeniden hesaplandı.",
          { id: homeworkId }
        )));
      })
    );
  };

  const handleAddTopicRecord = (studentId, topicPayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newTopicRecord = {
          ...topicPayload,
          id: createId("topic"),
        };
        const newTopicTracking = [newTopicRecord, ...(student.topicTracking || [])];

        return normalizeStudent(appendSyncEvent({
          ...student,
          topicTracking: newTopicTracking,
          topicProgress: calculateTopicProgress(newTopicTracking, student.topicProgress),
        }, createManualEvent(
          "topic.add",
          topicPayload.updatedBy || topicPayload.createdBy || "coach",
          "Konu kaydı eklendi; konu hazırbulunuşluğu yeniden hesaplandı.",
          newTopicRecord
        )));
      })
    );
  };

  const handleUpdateTopicRecord = (studentId, updatedTopicRecord) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newTopicTracking = (student.topicTracking || []).map((topicRecord) =>
          topicRecord.id === updatedTopicRecord.id ? { ...topicRecord, ...updatedTopicRecord } : topicRecord
        );

        return normalizeStudent(appendSyncEvent({
          ...student,
          topicTracking: newTopicTracking,
          topicProgress: calculateTopicProgress(newTopicTracking, student.topicProgress),
        }, createManualEvent(
          "topic.update",
          updatedTopicRecord.updatedBy || "coach",
          "Konu kaydı güncellendi; konu hazırbulunuşluğu yeniden hesaplandı.",
          updatedTopicRecord
        )));
      })
    );
  };

  const handleDeleteTopicRecord = (studentId, topicRecordId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newTopicTracking = (student.topicTracking || []).filter(
          (topicRecord) => topicRecord.id !== topicRecordId
        );

        return normalizeStudent(appendSyncEvent({
          ...student,
          topicTracking: newTopicTracking,
          topicProgress: calculateTopicProgress(newTopicTracking, student.topicProgress),
        }, createManualEvent(
          "topic.delete",
          "coach",
          "Konu kaydı silindi; konu ilerleme yüzdesi yeniden hesaplandı.",
          { id: topicRecordId }
        )));
      })
    );
  };

  const handleAddResource = (studentId, resourcePayload) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newResource = normalizeResource({ ...resourcePayload, id: createId("resource") }, student.id, 0);
        const newResources = [newResource, ...(student.resources || [])];
        const syncResult = syncStudentModules({
          ...student,
          resources: newResources,
          resourceProgress: calculateResourceProgress(newResources, student.resourceProgress),
        }, "resource", newResource);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleUpdateResource = (studentId, updatedResource) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newResources = (student.resources || []).map((resource, index) =>
          resource.id === updatedResource.id
            ? normalizeResource({ ...resource, ...updatedResource }, student.id, index)
            : resource
        );
        const syncedResource = newResources.find((resource) => resource.id === updatedResource.id) || updatedResource;
        const syncResult = syncStudentModules({
          ...student,
          resources: newResources,
          resourceProgress: calculateResourceProgress(newResources, student.resourceProgress),
        }, "resource", syncedResource);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleDeleteResource = (studentId, resourceId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newResources = (student.resources || []).filter((resource) => resource.id !== resourceId);

        return normalizeStudent(appendSyncEvent({
          ...student,
          resources: newResources,
          resourceProgress: calculateResourceProgress(newResources, student.resourceProgress),
        }, createManualEvent(
          "resource.delete",
          "coach",
          "Kaynak silindi; kaynak ilerleme yüzdesi yeniden hesaplandı.",
          { id: resourceId }
        )));
      })
    );
  };

  const handleAddVideoPlaylist = (studentId, playlistPayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newPlaylist = normalizeVideoPlaylist({
          ...playlistPayload,
          id: createId("video-playlist"),
          createdAt: new Date().toISOString(),
        }, student.id, 0);

        return normalizeStudent(appendSyncEvent({
          ...student,
          videoPlaylists: [newPlaylist, ...(student.videoPlaylists || [])],
        }, createManualEvent(
          "videoPlaylist.add",
          playlistPayload.createdBy || "coach",
          "Video ders listesi eklendi; video kütüphanesi ilerlemesi yeniden hesaplandı.",
          newPlaylist
        )));
      })
    );
  };

  const handleDeleteVideoPlaylist = (studentId, playlistId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const deletedPlaylist = (student.videoPlaylists || []).find((playlist) => playlist.id === playlistId);
        const deletedVideoIds = new Set((deletedPlaylist?.videos || []).map((video) => video.id));
        const nextProgress = Object.entries(student.videoProgress || {}).reduce((result, [videoId, record]) => {
          if (!deletedVideoIds.has(videoId)) result[videoId] = record;
          return result;
        }, {});

        return normalizeStudent(appendSyncEvent({
          ...student,
          videoPlaylists: (student.videoPlaylists || []).filter((playlist) => playlist.id !== playlistId),
          videoProgress: nextProgress,
        }, createManualEvent(
          "videoPlaylist.delete",
          "coach",
          "Video ders listesi silindi; ilgili izleme kayıtları temizlendi.",
          { id: playlistId }
        )));
      })
    );
  };

  const handleUpdateVideoProgress = (studentId, videoId, progressPayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        return normalizeStudent({
          ...student,
          videoProgress: {
            ...(student.videoProgress || {}),
            [videoId]: {
              ...(student.videoProgress?.[videoId] || {}),
              ...progressPayload,
              videoId,
            },
          },
        });
      })
    );
  };

  const handleAddExam = (studentId, examPayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newExam = normalizeExam({ ...examPayload, id: createId("exam") }, student.id, 0);
        const newExams = [newExam, ...(student.exams || [])];
        const examSummary = getExamSummary(newExams, student.lastTytNet, student.lastAytNet);

        return normalizeStudent(appendSyncEvent({
          ...student,
          ...examSummary,
          exams: newExams,
        }, createManualEvent(
          "exam.add",
          examPayload.createdBy || "student",
          "Deneme sonucu eklendi; son TYT/AYT netleri ve rapor değerleri yeniden hesaplandı.",
          newExam
        )));
      })
    );
  };

  const handleUpdateExam = (studentId, updatedExam) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newExams = (student.exams || []).map((exam, index) =>
          exam.id === updatedExam.id ? normalizeExam({ ...exam, ...updatedExam }, student.id, index) : exam
        );
        const examSummary = getExamSummary(newExams, student.lastTytNet, student.lastAytNet);

        return normalizeStudent(appendSyncEvent({
          ...student,
          ...examSummary,
          exams: newExams,
        }, createManualEvent(
          "exam.update",
          updatedExam.updatedBy || "student",
          "Deneme sonucu güncellendi; net özetleri yeniden hesaplandı.",
          updatedExam
        )));
      })
    );
  };

  const handleDeleteExam = (studentId, examId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newExams = (student.exams || []).filter((exam) => exam.id !== examId);
        const examSummary = getExamSummary(newExams, student.lastTytNet, student.lastAytNet);

        return normalizeStudent(appendSyncEvent({
          ...student,
          ...examSummary,
          exams: newExams,
        }, createManualEvent(
          "exam.delete",
          "coach",
          "Deneme sonucu silindi; son netler kalan denemelere göre yeniden hesaplandı.",
          { id: examId }
        )));
      })
    );
  };

  const handleAddErrorRecord = (studentId, errorPayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newError = normalizeErrorRecord({ ...errorPayload, id: createId("error") }, student.id, 0);

        return normalizeStudent(appendSyncEvent({
          ...student,
          errors: [newError, ...(student.errors || [])],
        }, createManualEvent(
          "error.add",
          errorPayload.createdBy || "student",
          "Hata kaydı eklendi; risk ve eksik konu analizleri güncellendi.",
          newError
        )));
      })
    );
  };

  const handleUpdateErrorRecord = (studentId, updatedError) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        return normalizeStudent(appendSyncEvent({
          ...student,
          errors: (student.errors || []).map((error, index) =>
            error.id === updatedError.id
              ? normalizeErrorRecord({ ...error, ...updatedError }, student.id, index)
              : error
          ),
        }, createManualEvent(
          "error.update",
          updatedError.updatedBy || "student",
          "Hata kaydı güncellendi; risk ve eksik konu analizleri yenilendi.",
          updatedError
        )));
      })
    );
  };

  const handleDeleteErrorRecord = (studentId, errorId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        return normalizeStudent(appendSyncEvent({
          ...student,
          errors: (student.errors || []).filter((error) => error.id !== errorId),
        }, createManualEvent(
          "error.delete",
          "coach",
          "Hata kaydı silindi; risk analizi kalan kayıtlarla yeniden hesaplandı.",
          { id: errorId }
        )));
      })
    );
  };

  const handleAddStudyRecord = (studentId, studyPayload) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newRecord = normalizeStudyRecord(
          { ...studyPayload, id: createId("study") },
          student.id,
          0
        );
        const syncResult = syncStudentModules({
          ...student,
          studyRecords: [newRecord, ...(student.studyRecords || [])],
        }, "study", newRecord);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleUpdateStudyRecord = (studentId, updatedRecord) => {
    const pendingNotices = [];

    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newStudyRecords = (student.studyRecords || []).map((record, index) =>
          record.id === updatedRecord.id
            ? normalizeStudyRecord({ ...record, ...updatedRecord }, student.id, index)
            : record
        );
        const syncedRecord = newStudyRecords.find((record) => record.id === updatedRecord.id) || updatedRecord;
        const syncResult = syncStudentModules({
          ...student,
          studyRecords: newStudyRecords,
        }, "study", syncedRecord);
        pendingNotices.push(...syncResult.notices);

        return normalizeStudent(syncResult.student);
      })
    );

    window.setTimeout(() => showSyncNotices(pendingNotices), 0);
  };

  const handleDeleteStudyRecord = (studentId, studyRecordId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        return normalizeStudent(appendSyncEvent({
          ...student,
          studyRecords: (student.studyRecords || []).filter((record) => record.id !== studyRecordId),
        }, createManualEvent(
          "study.delete",
          "student",
          "Günlük çalışma kaydı silindi; çalışma hedefi ve rapor değerleri yeniden hesaplandı.",
          { id: studyRecordId }
        )));
      })
    );
  };

  const handleAddMessage = (studentId, messagePayload) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) => {
        if (student.id !== studentId) return student;

        const newMessage = normalizeMessage(
          {
            ...messagePayload,
            id: createId("message"),
            createdAt: new Date().toISOString(),
          },
          student.id,
          0
        );

        return normalizeStudent(appendSyncEvent({
          ...student,
          messages: [...(student.messages || []), newMessage],
        }, createManualEvent(
          "message.add",
          messagePayload.sender || "coach",
          "Koç-öğrenci mesajlaşmasına yeni mesaj eklendi.",
          newMessage
        )));
      })
    );
  };

  const renderWithSyncToasts = (content) => (
    <>
      {content}
      <SyncToastCenter notices={syncNotices} onDismiss={dismissSyncNotice} />
    </>
  );

  if (!activeRole) {
    return renderWithSyncToasts(
      <LoginPage
        accounts={loginAccounts}
        loginError={loginError}
        onLogin={handleLogin}
        onPasswordReset={handlePasswordReset}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        appMode={appConfig.mode}
      />
    );
  }

  if (activeRole === "coach" && selectedStudent) {
    return renderWithSyncToasts(
      <StudentDetailPage
        student={selectedStudent}
        resourceLibrary={defaultResourceLibrary}
        onBack={handleBackToCoach}
        onLogout={handleLogout}
        onUpdateStudent={handleUpdateStudent}
        onAddWeeklyTask={handleAddWeeklyTask}
        onUpdateWeeklyTask={handleUpdateWeeklyTask}
        onApplyWeeklyTemplate={handleApplyWeeklyTemplate}
        onDeleteWeeklyTask={handleDeleteWeeklyTask}
        onAddHomework={handleAddHomework}
        onUpdateHomework={handleUpdateHomework}
        onDeleteHomework={handleDeleteHomework}
        onAddTopicRecord={handleAddTopicRecord}
        onUpdateTopicRecord={handleUpdateTopicRecord}
        onDeleteTopicRecord={handleDeleteTopicRecord}
        onAddResource={handleAddResource}
        onUpdateResource={handleUpdateResource}
        onDeleteResource={handleDeleteResource}
        onAddVideoPlaylist={handleAddVideoPlaylist}
        onDeleteVideoPlaylist={handleDeleteVideoPlaylist}
        onUpdateVideoProgress={handleUpdateVideoProgress}
        onAddExam={handleAddExam}
        onUpdateExam={handleUpdateExam}
        onDeleteExam={handleDeleteExam}
        onAddErrorRecord={handleAddErrorRecord}
        onUpdateErrorRecord={handleUpdateErrorRecord}
        onDeleteErrorRecord={handleDeleteErrorRecord}
        onAddStudyRecord={handleAddStudyRecord}
        onUpdateStudyRecord={handleUpdateStudyRecord}
        onDeleteStudyRecord={handleDeleteStudyRecord}
        onAddMessage={handleAddMessage}
        activeAccount={activeAccount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  if (activeRole === "coach") {
    return renderWithSyncToasts(
      <CoachDashboard
        students={coachStudents}
        resourceLibrary={defaultResourceLibrary}
        onAssignResourceToStudent={handleAddResource}
        onOpenStudent={handleOpenStudent}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        onResetDemoData={handleResetDemoData}
        onLogout={handleLogout}
        activeAccount={activeAccount}
        accounts={accounts}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  if (activeRole === "student") {
    return renderWithSyncToasts(
      <StudentDashboard
        student={activeStudent}
        onLogout={handleLogout}
        activeAccount={activeAccount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        studentActions={{
          updateProfile: (profilePayload) => handleUpdateStudent({ ...profilePayload, id: activeStudent.id }),
          updateWeeklyTaskStatus: (taskPayload) => handleUpdateWeeklyTask(activeStudent.id, taskPayload),
          addStudyRecord: (studyPayload) => handleAddStudyRecord(activeStudent.id, studyPayload),
          addMessage: (messagePayload) => handleAddMessage(activeStudent.id, messagePayload),
          addResource: (resourcePayload) => handleAddResource(activeStudent.id, resourcePayload),
          updateResource: (resourcePayload) => handleUpdateResource(activeStudent.id, resourcePayload),
          updateVideoProgress: (videoId, progressPayload) => handleUpdateVideoProgress(activeStudent.id, videoId, progressPayload),
          addTopicRecord: (topicPayload) => handleAddTopicRecord(activeStudent.id, topicPayload),
          updateTopicRecord: (topicPayload) => handleUpdateTopicRecord(activeStudent.id, topicPayload),
          addExam: (examPayload) => handleAddExam(activeStudent.id, examPayload),
          updateHomeworkStatus: (homeworkPayload) => handleUpdateHomework(activeStudent.id, homeworkPayload),
          addErrorRecord: (errorPayload) => handleAddErrorRecord(activeStudent.id, errorPayload),
          updateErrorRecord: (errorPayload) => handleUpdateErrorRecord(activeStudent.id, errorPayload),
          updatePassword: handleUpdateActiveAccountPassword,
        }}
      />
    );
  }

  if (activeRole === "parent") {
    return renderWithSyncToasts(
      <ParentDashboard
        student={activeStudent}
        onLogout={handleLogout}
        activeAccount={activeAccount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  if (activeRole === "admin") {
    return renderWithSyncToasts(
      <AdminDashboard
        students={students}
        accounts={accounts}
        resourceLibrary={defaultResourceLibrary}
        videoPlaylists={defaultVideoPlaylists}
        onLogout={handleLogout}
        activeAccount={activeAccount}
        accounts={accounts}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        systemStatus={systemStatus}
        appConfig={appConfig}
        backendConfig={backendConfig}
        appVersion={APP_VERSION}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onAddAccount={handleAddAccount}
        onDeleteAccount={handleDeleteAccount}
        onResetAccounts={handleResetAccounts}
        onAssignCoach={handleAssignCoach}
      />
    );
  }

  return renderWithSyncToasts(
    <LoginPage
      accounts={loginAccounts}
      loginError={loginError}
      onLogin={handleLogin}
      onPasswordReset={handlePasswordReset}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      appMode={appConfig.mode}
    />
  );
}

function SyncToastCenter({ notices, onDismiss }) {
  if (!notices.length) return null;

  return (
    <div className="sync-toast-center" aria-live="polite">
      {notices.map((notice) => (
        <button
          type="button"
          className="sync-toast"
          key={notice.id}
          onClick={() => onDismiss(notice.id)}
        >
          <span>Senkron</span>
          <strong>{notice.title}</strong>
          <small>{notice.detail}</small>
        </button>
      ))}
    </div>
  );
}

export default App;
