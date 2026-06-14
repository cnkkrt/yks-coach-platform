import { useState } from "react";
import { DataHealthPanel } from "../components/DataHealthPanel.jsx";
import VideoLessons from "../components/VideoLessons.jsx";
import {
  calculateTopicReadiness,
  getTopicPriorityLabel,
  learningStatusOptions,
  netStatusOptions,
  questionStatusOptions,
  topicErrorTypeOptions,
  topicGroups,
  topicTrackingStatuses,
} from "../data/curriculumData.js";
import {
  calculatePeriodRecommendation,
  downloadJsonBackup,
  getCampSuggestions,
  getProgramPhase,
  getProgramLessonLevelItems,
  getSourceVideoMatches,
  getWeeklyTaskCompletion,
  periodLevelOptions,
  periodModeOptions,
  programAreaOptions,
  resolvePeriodTarget,
} from "../data/programAutomation.js";
import { scrollToSection } from "../utils/navigation.js";
import { buildStudentReportCard } from "../utils/studentAnalytics.js";
import {
  EXAM_QUESTION_COUNTS,
  EXAM_SUBJECTS,
  WEEK_DAYS,
  errorTypes,
  studyRecordTypes,
} from "../data/examConfig.js";

const studentExamRecordTypes = [
  "TYT Denemesi",
  "AYT Denemesi",
  "YDT Denemesi",
  "Branş Denemesi",
  "Konu Tarama Testi",
  "Mini Test",
  "Yanlış Tekrar Testi",
];

function createEmptyStudentStudyForm() {
  return {
    date: new Date().toISOString().slice(0, 10),
    recordType: "Günlük Soru Çözümü",
    exam: "TYT",
    lesson: "Matematik",
    topic: "Temel Kavramlar",
    subtopic: "Sayı kümeleri",
    source: "",
    targetQuestions: "40",
    solvedQuestions: "0",
    correct: "0",
    wrong: "0",
    duration: "0",
    studentNote: "",
  };
}

function createEmptyStudentExamForm(examType = "TYT") {
  return {
    name: "",
    date: new Date().toISOString().slice(0, 10),
    recordType: examType === "TYT" ? "TYT Denemesi" : examType === "YDT" ? "YDT Denemesi" : "AYT Denemesi",
    examType,
    sections: createExamSections(examType),
    note: "",
  };
}

function createEmptyStudentErrorForm() {
  return {
    exam: "TYT",
    lesson: "Matematik",
    topic: "Temel Kavramlar",
    subtopic: "Sayı kümeleri",
    type: "Dikkat Hatası",
    count: "1",
    source: "",
    action: "",
    status: "Açık",
    studentNote: "",
  };
}

function createEmptyStudentTopicForm() {
  return {
    exam: "TYT",
    lesson: "Matematik",
    topic: "Temel Kavramlar",
    subtopic: "Sayı kümeleri",
    status: "Konu anlatımı başladı",
    learningStatus: "Öğreniliyor",
    questionStatus: "Az",
    netStatus: "Ölçülmedi",
    errorType: "Yok",
    reviewDate: "",
    note: "",
  };
}

function createEmptyStudentResourceForm() {
  return {
    title: "",
    publisher: "",
    exam: "TYT",
    lesson: "Matematik",
    topic: "Temel Kavramlar",
    subtopic: "Sayı kümeleri",
    resourceType: "Soru Bankası",
    unitLabel: "soru",
    totalUnits: "",
    completedUnits: "",
    status: "Planlandı",
    dueDate: "",
    note: "",
  };
}

function createEmptyStudentTaskForm() {
  return {
    day: "Pazartesi",
    periodSlot: "1",
    level: "Orta",
    exam: "TYT",
    lesson: "Matematik",
    topic: "Temel Kavramlar",
    subtopic: "Sayı kümeleri",
    targetQuestions: "25",
    periodMinutes: "",
    task: "",
    status: "Bekliyor",
  };
}

function StudentDashboard({
  student,
  onLogout,
  activeAccount,
  theme,
  onToggleTheme,
  studentActions,
}) {
  const {
    updateProfile,
    updateWeeklyTaskStatus,
    addStudyRecord,
    addMessage,
    addResource,
    updateResource,
    updateVideoProgress,
    addTopicRecord,
    updateTopicRecord,
    addExam,
    updateHomeworkStatus,
    addErrorRecord,
    updateErrorRecord,
    updatePassword,
  } = studentActions;
  const weeklyTasks = student.weeklyTasks || [];
  const homeworks = student.homeworks || [];
  const topicTracking = student.topicTracking || [];
  const resources = student.resources || [];
  const exams = student.exams || [];
  const errors = student.errors || [];
  const studyRecords = student.studyRecords || [];
  const messages = student.messages || [];
  const videoPlaylists = student.videoPlaylists || [];
  const videoProgress = student.videoProgress || {};
  const activeHomeworks = homeworks.filter((homework) => homework.status !== "Kontrol Edildi");
  const activeResources = resources.filter((resource) => resource.status !== "Tamamlandı");
  const studyStats = getStudyStats(studyRecords);
  const phaseInfo = getProgramPhase(student.programStartDate);
  const weeklyCompletion = getWeeklyTaskCompletion(weeklyTasks);
  const activeArea = student.area || student.scoreType || "EA";
  const progressItems = [
    { label: "Kaynak", value: student.resourceProgress, max: 100, unit: "%" },
    { label: "Ödev", value: student.homeworkCompletion, max: 100, unit: "%" },
    { label: "Soru Hedefi", value: studyStats.completionRate, max: 100, unit: "%" },
    { label: "TYT Net", value: student.lastTytNet, max: 120, unit: "net" },
  ];
  const examTrendItems = getExamTrendItems(exams);
  const studyTrendItems = studyRecords.slice(0, 8).reverse().map((record) => ({
    label: `${record.date} ${record.lesson}`,
    value: Number(record.solvedQuestions || 0),
    max: Math.max(40, Number(record.targetQuestions || 0), Number(record.solvedQuestions || 0)),
    unit: "soru",
  }));
  const studyDailyItems = getDailyStudyChartItems(studyRecords);
  const studyLessonItems = getLessonStudyChartItems(studyRecords);
  const examOverview = getExamOverview(exams);
  const examSubjectItems = getExamSubjectTrendItems(exams);
  const [activeMenu, setActiveMenu] = useState("student-home");
  const [studyForm, setStudyForm] = useState(() => createEmptyStudentStudyForm());
  const [examForm, setExamForm] = useState(() => createEmptyStudentExamForm());
  const [compareExamAId, setCompareExamAId] = useState(() => exams[0]?.id || exams[0]?.name || "");
  const [compareExamBId, setCompareExamBId] = useState(() => exams[1]?.id || exams[1]?.name || exams[0]?.id || exams[0]?.name || "");
  const examComparison = getExamComparison(exams, compareExamAId, compareExamBId);
  const weeklyDateInfo = getWeeklyDateInfo(student.programStartDate, phaseInfo.currentWeek);
  const studentReportCard = buildStudentReportCard(student);
  const resourceGroups = groupResourcesByExamAndLesson(resources);
  const resourceOverviewItems = getResourceOverviewItems(resources);
  const homeworkStatusItems = getHomeworkStatusChartItems(homeworks);
  const homeworkOverview = getHomeworkOverview(homeworks);
  const [errorForm, setErrorForm] = useState(() => createEmptyStudentErrorForm());
  const [topicForm, setTopicForm] = useState(() => createEmptyStudentTopicForm());
  const [studentResourceForm, setStudentResourceForm] = useState(() => createEmptyStudentResourceForm());
  const [taskForm, setTaskForm] = useState(() => createEmptyStudentTaskForm());
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [programForm, setProgramForm] = useState(() => ({
    area: student.area || student.scoreType || "EA",
    programStartDate: student.programStartDate || new Date().toISOString().slice(0, 10),
    programLevel: student.programLevel || "Orta",
    lessonLevels: student.lessonLevels || {},
    periodMode: student.periodMode || "4",
    customPeriodCount: String(student.customPeriodCount || 4),
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordRepeat: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const periodCount = resolvePeriodTarget(programForm.periodMode, programForm.customPeriodCount);
  const weeklyGridRows = createWeeklyGridRows(weeklyTasks, periodCount);
  const lessonLevelItems = getProgramLessonLevelItems(programForm.area || activeArea);
  const [resourceProgressForm, setResourceProgressForm] = useState(() => ({
    resourceId: resources[0]?.id || "",
    completedUnits: String(resources[0]?.completedUnits ?? ""),
  }));
  const [messageForm, setMessageForm] = useState({ category: "Genel", text: "" });
  const selectedResource = resources.find((resource) => resource.id === resourceProgressForm.resourceId) || resources[0] || null;
  const studyLessonOptions = getLessonOptions(studyForm.exam);
  const studyTopicOptions = getTopicNames(studyForm.exam, studyForm.lesson);
  const studySubtopicOptions = getSubtopicNames(studyForm.exam, studyForm.lesson, studyForm.topic);
  const errorLessonOptions = getLessonOptions(errorForm.exam);
  const errorTopicOptions = getTopicNames(errorForm.exam, errorForm.lesson);
  const errorSubtopicOptions = getSubtopicNames(errorForm.exam, errorForm.lesson, errorForm.topic);
  const topicLessonOptions = getLessonOptions(topicForm.exam);
  const topicTopicOptions = getTopicNames(topicForm.exam, topicForm.lesson);
  const topicSubtopicOptions = getSubtopicNames(topicForm.exam, topicForm.lesson, topicForm.topic);
  const resourceLessonOptions = getLessonOptions(studentResourceForm.exam);
  const resourceTopicOptions = getTopicNames(studentResourceForm.exam, studentResourceForm.lesson);
  const resourceSubtopicOptions = getSubtopicNames(
    studentResourceForm.exam,
    studentResourceForm.lesson,
    studentResourceForm.topic
  );
  const taskLessonOptions = getLessonOptions(taskForm.exam);
  const taskTopicOptions = getTopicNames(taskForm.exam, taskForm.lesson);
  const taskSubtopicOptions = getSubtopicNames(taskForm.exam, taskForm.lesson, taskForm.topic);
  const calculatedStudyBlank = calculateAutomaticBlank(
    toNumber(studyForm.solvedQuestions),
    toNumber(studyForm.correct),
    toNumber(studyForm.wrong)
  );
  const calculatedStudyNet = calculateNet(studyForm.correct, studyForm.wrong);
  const calculatedExamNet = calculateExamTotals(examForm.sections).net;
  const handleMenuClick = (sectionId) => {
    setActiveMenu(sectionId);
    setTimeout(() => scrollToSection(sectionId), 0);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!activeAccount) {
      setPasswordMessage("Aktif hesap bulunamadı.");
      return;
    }

    if (!passwordForm.currentPassword) {
      setPasswordMessage("Mevcut şifre alanı boş bırakılamaz.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Yeni şifre en az 6 karakter olmalı.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.newPasswordRepeat) {
      setPasswordMessage("Yeni şifreler eşleşmiyor.");
      return;
    }

    try {
      await updatePassword?.(passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", newPasswordRepeat: "" });
      setPasswordMessage("Şifre güncellendi.");
    } catch (error) {
      setPasswordMessage(error?.message || "Şifre güncellenemedi.");
    }
  };

  const handleStudyChange = (event) => {
    const { name, value } = event.target;
    setStudyForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "exam") {
        const firstLesson = getLessonOptions(value)[0] || "Matematik";
        return { ...nextForm, lesson: firstLesson, ...getFirstTopicSelection(value, firstLesson) };
      }

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelection(nextForm.exam, value) };
      }

      if (name === "topic") {
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(nextForm.exam, nextForm.lesson, value),
        };
      }

      if (name === "solvedQuestions" || name === "correct" || name === "wrong") {
        const solvedQuestions = Math.max(0, toNumber(nextForm.solvedQuestions));
        const correct = Math.min(Math.max(0, toNumber(nextForm.correct)), solvedQuestions || Infinity);
        const wrong = Math.min(Math.max(0, toNumber(nextForm.wrong)), Math.max(0, solvedQuestions - correct));

        return {
          ...nextForm,
          solvedQuestions: String(solvedQuestions),
          correct: String(correct),
          wrong: String(wrong),
        };
      }

      return nextForm;
    });
  };

  const handleStudySubmit = (event) => {
    event.preventDefault();

    if (!studyForm.date || !studyForm.topic.trim()) {
      alert("Çalışma kaydı için tarih ve konu seçmelisin.");
      return;
    }

    const solvedQuestions = Math.max(0, toNumber(studyForm.solvedQuestions));
    const correct = Math.min(Math.max(0, toNumber(studyForm.correct)), solvedQuestions || Infinity);
    const wrong = Math.min(Math.max(0, toNumber(studyForm.wrong)), Math.max(0, solvedQuestions - correct));

    addStudyRecord({
      date: studyForm.date,
      recordType: studyForm.recordType,
      exam: studyForm.exam,
      lesson: studyForm.lesson,
      topic: studyForm.topic.trim(),
      subtopic: studyForm.subtopic.trim(),
      source: studyForm.source.trim(),
      targetQuestions: Math.max(0, toNumber(studyForm.targetQuestions)),
      solvedQuestions,
      correct,
      wrong,
      blank: calculateAutomaticBlank(solvedQuestions, correct, wrong),
      net: calculateNet(correct, wrong),
      duration: Math.max(0, toNumber(studyForm.duration)),
      status: "Öğrenci Girdi",
      studentNote: studyForm.studentNote.trim(),
      coachNote: "",
      createdBy: "student",
    });

    setStudyForm(createEmptyStudentStudyForm());
  };

  const handleProgramChange = (event) => {
    const { name, value } = event.target;
    setProgramForm((current) => ({ ...current, [name]: value }));
  };

  const handleLessonLevelChange = (lessonKey, value) => {
    setProgramForm((current) => ({
      ...current,
      lessonLevels: {
        ...(current.lessonLevels || {}),
        [lessonKey]: value,
      },
    }));
  };

  const handleProgramSubmit = (event) => {
    event.preventDefault();
    const payload = {
      area: programForm.area,
      programStartDate: programForm.programStartDate,
      programLevel: programForm.programLevel,
      lessonLevels: programForm.lessonLevels,
      periodMode: programForm.periodMode,
      customPeriodCount: Math.max(1, toNumber(programForm.customPeriodCount)),
      createdBy: "student",
    };

    updateProfile({
      id: student.id,
      area: payload.area,
      programStartDate: payload.programStartDate,
      programLevel: payload.programLevel,
      lessonLevels: payload.lessonLevels,
      periodMode: payload.periodMode,
      customPeriodCount: payload.customPeriodCount,
    });
    alert("Haftalık program oluşturma yetkisi koç paneline taşındı.");
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "exam") {
        const firstLesson = getLessonOptions(value)[0] || "Matematik";
        const nextTopicForm = { ...nextForm, lesson: firstLesson, ...getFirstTopicSelection(value, firstLesson) };
        const recommendation = calculatePeriodRecommendation({
          ...nextTopicForm,
          lesson: formatTaskLesson(nextTopicForm.exam, nextTopicForm.lesson),
        });
        return {
          ...nextTopicForm,
          targetQuestions: String(nextTopicForm.targetQuestions || recommendation.targetQuestions),
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      if (name === "lesson") {
        const nextTopicForm = { ...nextForm, ...getFirstTopicSelection(nextForm.exam, value) };
        const recommendation = calculatePeriodRecommendation({
          ...nextTopicForm,
          lesson: formatTaskLesson(nextTopicForm.exam, nextTopicForm.lesson),
        });
        return {
          ...nextTopicForm,
          targetQuestions: String(nextTopicForm.targetQuestions || recommendation.targetQuestions),
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      if (name === "topic") {
        const nextTopicForm = {
          ...nextForm,
          subtopic: getFirstSubtopic(nextForm.exam, nextForm.lesson, value),
        };
        const recommendation = calculatePeriodRecommendation({
          ...nextTopicForm,
          lesson: formatTaskLesson(nextTopicForm.exam, nextTopicForm.lesson),
        });
        return {
          ...nextTopicForm,
          targetQuestions: String(nextTopicForm.targetQuestions || recommendation.targetQuestions),
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      if (name === "targetQuestions" || name === "level") {
        const recommendation = calculatePeriodRecommendation({
          ...nextForm,
          lesson: formatTaskLesson(nextForm.exam, nextForm.lesson),
        });
        return { ...nextForm, periodMinutes: String(recommendation.periodMinutes) };
      }

      return nextForm;
    });
  };

  const startNewTask = (defaults = {}) => {
    setEditingTaskId(null);
    setTaskForm({ ...createEmptyStudentTaskForm(), ...defaults });
    setIsTaskFormOpen(true);
  };

  const startEditTask = (task) => {
    const lessonInfo = parseTaskLesson(task.lesson);
    setEditingTaskId(task.id);
    setTaskForm({
      day: task.day || "Pazartesi",
      periodSlot: String(task.periodSlot || 1),
      level: task.level || "Orta",
      exam: lessonInfo.exam,
      lesson: lessonInfo.lesson,
      topic: task.topic || "",
      subtopic: task.subtopic || "",
      targetQuestions: String(task.targetQuestions ?? ""),
      periodMinutes: String(task.periodMinutes ?? ""),
      task: task.task || "",
      status: task.status || "Bekliyor",
    });
    setIsTaskFormOpen(true);
  };

  const cancelTaskForm = () => {
    setEditingTaskId(null);
    setTaskForm(createEmptyStudentTaskForm());
    setIsTaskFormOpen(false);
  };

  const handleTaskSubmit = (event) => {
    event.preventDefault();

    if (!taskForm.topic.trim() || !taskForm.task.trim()) {
      alert("Çalışma saati için konu ve görev açıklaması zorunludur.");
      return;
    }

    const combinedLesson = formatTaskLesson(taskForm.exam, taskForm.lesson);
    const recommendation = calculatePeriodRecommendation({ ...taskForm, lesson: combinedLesson });
    const payload = {
      day: taskForm.day,
      periodSlot: Math.max(1, toNumber(taskForm.periodSlot)),
      level: taskForm.level,
      lesson: combinedLesson,
      topic: taskForm.topic.trim(),
      subtopic: taskForm.subtopic.trim(),
      targetQuestions: Math.max(0, toNumber(taskForm.targetQuestions || recommendation.targetQuestions)),
      periodMinutes: Math.max(0, toNumber(taskForm.periodMinutes || recommendation.periodMinutes)),
      task: taskForm.task.trim(),
      status: taskForm.status,
      generatedBy: "student",
    };

    if (editingTaskId) {
      updateWeeklyTaskStatus({ id: editingTaskId, ...payload });
    } else {
      alert("Yeni çalışma saati ekleme yetkisi koç paneline taşındı.");
    }

    cancelTaskForm();
  };

  const handleCompleteWeeklyTask = (task) => {
    updateWeeklyTaskStatus({
      id: task.id,
      status: "Tamamlandı",
      completedAt: new Date().toISOString(),
    });
  };

  const handleDeleteTask = (task) => {
    const isConfirmed = window.confirm(`${task.day} - ${task.topic} çalışmasını silmek istiyor musun?`);
    if (isConfirmed) alert("Çalışma silme yetkisi koç paneline taşındı.");
  };

  const handleAddCampToPlan = (camp) => {
    const lessonInfo = parseTaskLesson(camp.lesson);
    const topic = camp.topic || getFirstTopicSelection(lessonInfo.exam, lessonInfo.lesson).topic;
    const subtopic = getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, topic);
    const slot = findNextOpenPeriod(weeklyTasks, periodCount);
    const level = programForm.programLevel || getCampLevel(camp);
    const targetQuestions = getCampTargetQuestions(camp);
    const recommendation = calculatePeriodRecommendation({
      lesson: camp.lesson,
      topic,
      subtopic,
      level,
      targetQuestions,
      task: camp.detail,
    });

    alert("Kampı haftalık plana ekleme yetkisi koç paneline taşındı.");
    void ({
      day: slot.day,
      periodSlot: slot.periodSlot,
      level,
      lesson: camp.lesson,
      topic,
      subtopic,
      targetQuestions,
      periodMinutes: recommendation.periodMinutes,
      task: `${camp.title}: ${camp.detail}`,
      status: "Bekliyor",
      source: "Kamp önerisinden eklendi",
      generatedBy: "student",
    });
  };

  const handleAddCampToResources = (camp) => {
    const lessonInfo = parseTaskLesson(camp.lesson);
    const topic = camp.topic || getFirstTopicSelection(lessonInfo.exam, lessonInfo.lesson).topic;

    addResource({
      title: camp.title,
      publisher: "Kamp Önerisi",
      lesson: camp.lesson,
      topic,
      subtopic: getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, topic),
      resourceType: "Video Kamp",
      unitLabel: "gün",
      totalUnits: getCampDuration(camp),
      completedUnits: 0,
      status: "Planlandı",
      dueDate: "",
      note: camp.detail,
      createdBy: "student",
      updatedBy: "student",
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTopicChange = (event) => {
    const { name, value } = event.target;
    setTopicForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "exam") {
        const firstLesson = getLessonOptions(value)[0] || "Matematik";
        return { ...nextForm, lesson: firstLesson, ...getFirstTopicSelection(value, firstLesson) };
      }

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelection(nextForm.exam, value) };
      }

      if (name === "topic") {
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(nextForm.exam, nextForm.lesson, value),
        };
      }

      return nextForm;
    });
  };

  const handleTopicSubmit = (event) => {
    event.preventDefault();

    if (!topicForm.topic.trim()) {
      alert("Konu seçmelisin.");
      return;
    }

    const payload = {
      exam: topicForm.exam,
      lesson: topicForm.lesson,
      topic: topicForm.topic.trim(),
      subtopic: topicForm.subtopic.trim(),
      status: topicForm.status,
      learningStatus: topicForm.learningStatus,
      questionStatus: topicForm.questionStatus,
      netStatus: topicForm.netStatus,
      errorType: topicForm.errorType,
      reviewDate: topicForm.reviewDate,
      note: topicForm.note.trim() || "Öğrenci konu durumunu güncelledi.",
      updatedBy: "student",
      updatedAt: new Date().toISOString(),
    };
    const existingTopic = topicTracking.find((topicRecord) =>
      topicRecord.exam === payload.exam &&
      topicRecord.lesson === payload.lesson &&
      topicRecord.topic === payload.topic &&
      (topicRecord.subtopic || "") === payload.subtopic
    );

    if (existingTopic) {
      updateTopicRecord({ id: existingTopic.id, ...payload });
    } else {
      addTopicRecord(payload);
    }

    setTopicForm(createEmptyStudentTopicForm());
  };

  const handleQuickTopicStatus = (topicRecord, status) => {
    updateTopicRecord({
      id: topicRecord.id,
      status,
      learningStatus: status === "Tamamlandı" ? "Bitti" : topicRecord.learningStatus,
      questionStatus: status === "Tamamlandı" ? "Yeterli" : topicRecord.questionStatus,
      updatedBy: "student",
      updatedAt: new Date().toISOString(),
      note: topicRecord.note || "Öğrenci hızlı durum güncellemesi yaptı.",
    });
  };

  const handleStudentResourceChange = (event) => {
    const { name, value } = event.target;
    setStudentResourceForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "exam") {
        const firstLesson = getLessonOptions(value)[0] || "Matematik";
        return { ...nextForm, lesson: firstLesson, ...getFirstTopicSelection(value, firstLesson) };
      }

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelection(nextForm.exam, value) };
      }

      if (name === "topic") {
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(nextForm.exam, nextForm.lesson, value),
        };
      }

      return nextForm;
    });
  };

  const handleStudentResourceSubmit = (event) => {
    event.preventDefault();

    if (!studentResourceForm.title.trim()) {
      alert("Kaynak adı zorunludur.");
      return;
    }

    const totalUnits = Math.max(0, toNumber(studentResourceForm.totalUnits));
    const completedUnits = Math.min(Math.max(0, toNumber(studentResourceForm.completedUnits)), totalUnits || Infinity);

    addResource({
      title: studentResourceForm.title.trim(),
      publisher: studentResourceForm.publisher.trim(),
      lesson: `${studentResourceForm.exam} ${studentResourceForm.lesson}`,
      topic: studentResourceForm.topic.trim(),
      subtopic: studentResourceForm.subtopic.trim(),
      resourceType: studentResourceForm.resourceType,
      unitLabel: studentResourceForm.unitLabel,
      totalUnits,
      completedUnits,
      status: completedUnits >= totalUnits && totalUnits > 0 ? "Tamamlandı" : studentResourceForm.status,
      dueDate: studentResourceForm.dueDate,
      note: studentResourceForm.note.trim(),
      createdBy: "student",
      updatedBy: "student",
      updatedAt: new Date().toISOString(),
    });

    setStudentResourceForm(createEmptyStudentResourceForm());
  };

  const handleResourceProgressChange = (event) => {
    const { name, value } = event.target;

    if (name === "resourceId") {
      const nextResource = resources.find((resource) => resource.id === value);
      setResourceProgressForm({
        resourceId: value,
        completedUnits: String(nextResource?.completedUnits ?? ""),
      });
      return;
    }

    setResourceProgressForm((current) => ({ ...current, [name]: value }));
  };

  const handleResourceProgressSubmit = (event) => {
    event.preventDefault();

    if (!selectedResource) {
      alert("Önce bir kaynak seçmelisin.");
      return;
    }

    const completedUnits = Math.min(
      Math.max(0, toNumber(resourceProgressForm.completedUnits)),
      toNumber(selectedResource.totalUnits)
    );

    updateResource({
      id: selectedResource.id,
      completedUnits,
      status: completedUnits >= toNumber(selectedResource.totalUnits) ? "Tamamlandı" : "Devam Ediyor",
    });
  };

  const handleExamChange = (event) => {
    const { name, value } = event.target;
    setExamForm((current) => {
      if (name === "examType") {
        return {
          ...current,
          examType: value,
          sections: createExamSections(value, current.sections),
        };
      }

      return { ...current, [name]: value };
    });
  };

  const handleExamSectionChange = (lesson, field, value) => {
    setExamForm((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.lesson !== lesson) return section;

        const questionCount = getSectionQuestionCount(current.examType, section.lesson);
        const currentCorrect = toNumber(section.correct);
        const currentWrong = toNumber(section.wrong);
        let correct = currentCorrect;
        let wrong = currentWrong;

        if (field === "correct") {
          correct = clampScore(value, questionCount - currentWrong);
        }

        if (field === "wrong") {
          wrong = clampScore(value, questionCount - correct);
        }

        return {
          ...section,
          questionCount,
          correct: String(correct),
          wrong: String(wrong),
          blank: String(calculateAutomaticBlank(questionCount, correct, wrong)),
        };
      }),
    }));
  };

  const handleExamSubmit = (event) => {
    event.preventDefault();

    if (!examForm.name.trim() || !examForm.date) {
      alert("Sınav/test adı ve tarih zorunludur.");
      return;
    }

    const normalizedSections = examForm.sections.map((section) => {
      const correct = toNumber(section.correct);
      const wrong = toNumber(section.wrong);
      const questionCount = getSectionQuestionCount(examForm.examType, section.lesson);
      const blank = calculateAutomaticBlank(questionCount, correct, wrong);

      return {
        lesson: section.lesson,
        questionCount,
        correct,
        wrong,
        blank,
        net: calculateNet(correct, wrong),
      };
    });
    const totals = calculateExamTotals(normalizedSections);

    addExam({
      name: examForm.name.trim(),
      date: examForm.date,
      recordType: examForm.recordType,
      examType: examForm.examType,
      sections: normalizedSections,
      correct: totals.correct,
      wrong: totals.wrong,
      blank: totals.blank,
      net: totals.net,
      tytNet: examForm.examType === "TYT" ? totals.net : 0,
      aytNet: examForm.examType !== "TYT" ? totals.net : 0,
      note: examForm.note.trim(),
    });

    setExamForm(createEmptyStudentExamForm(examForm.examType));
  };

  const handleHomeworkStatusSubmit = (event, homework) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const status = formData.get("status") || homework.status;
    const studentNote = String(formData.get("studentNote") || "").trim();

    updateHomeworkStatus({
      id: homework.id,
      status,
      studentNote,
      submittedAt: new Date().toISOString(),
    });
  };

  const handleErrorChange = (event) => {
    const { name, value } = event.target;
    setErrorForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "exam") {
        const firstLesson = getLessonOptions(value)[0] || "Matematik";
        return { ...nextForm, lesson: firstLesson, ...getFirstTopicSelection(value, firstLesson) };
      }

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelection(nextForm.exam, value) };
      }

      if (name === "topic") {
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(nextForm.exam, nextForm.lesson, value),
        };
      }

      return nextForm;
    });
  };

  const handleErrorSubmit = (event) => {
    event.preventDefault();

    if (!errorForm.lesson.trim() || !errorForm.topic.trim()) {
      alert("Hata kaydı için ders ve konu seçmelisin.");
      return;
    }

    addErrorRecord({
      lesson: `${errorForm.exam} ${errorForm.lesson}`,
      type: errorForm.type,
      count: Math.max(1, toNumber(errorForm.count)),
      topic: errorForm.topic.trim(),
      subtopic: errorForm.subtopic.trim(),
      action: errorForm.action.trim() || "Öğrenci hata kaydı oluşturdu; koç kontrol edecek.",
      status: errorForm.status,
      source: errorForm.source.trim(),
      studentNote: errorForm.studentNote.trim(),
      createdBy: "student",
    });

    setErrorForm(createEmptyStudentErrorForm());
  };

  const handleResolveError = (error) => {
    updateErrorRecord({
      id: error.id,
      status: "Çözüldü",
      action: error.action || "Öğrenci çözdüğünü işaretledi.",
    });
  };

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    if (!messageForm.text.trim()) {
      alert("Mesaj metni boş olamaz.");
      return;
    }

    addMessage({
      sender: "student",
      senderName: student.name,
      category: messageForm.category,
      text: messageForm.text.trim(),
    });
    setMessageForm({ category: "Genel", text: "" });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-mark">YK</div>
          <div>
            <strong>Öğrenci Paneli</strong>
            <small>{student.name}</small>
          </div>
        </div>

        <nav className="side-nav">
          <button className={activeMenu === "student-home" ? "active" : ""} onClick={() => handleMenuClick("student-home")}>Genel Bakış</button>
          <button className={activeMenu === "student-plan" ? "active" : ""} onClick={() => handleMenuClick("student-plan")}>Haftalık Planım</button>
          <button className={activeMenu === "student-exams" ? "active" : ""} onClick={() => handleMenuClick("student-exams")}>Sınavlarım</button>
          <button className={activeMenu === "student-resources" ? "active" : ""} onClick={() => handleMenuClick("student-resources")}>Kaynaklarım</button>
          <button className={activeMenu === "student-performance" ? "active" : ""} onClick={() => handleMenuClick("student-performance")}>Performansım</button>
          <button className={activeMenu === "student-messages" ? "active" : ""} onClick={() => handleMenuClick("student-messages")}>Mesajlarım</button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Merhaba, {student.name}</h1>
            <p>
              Hedefin: {student.targetDepartment} · {student.targetUniversity}
            </p>
          </div>
          <div className="top-actions">
            <div className="session-pill">
              <span>Oturum</span>
              <strong>{activeAccount?.name || student.name}</strong>
            </div>
            <button className="theme-toggle" onClick={onToggleTheme}>
              <span className="theme-toggle-dot" />
              {theme === "dark" ? "Gündüz modu" : "Gece modu"}
            </button>
          </div>
        </header>

        {activeMenu !== "student-home" && (
          <div className="active-section-toolbar">
            <button className="ghost-btn" onClick={() => handleMenuClick("student-home")}>
              Ana sayfaya dön
            </button>
          </div>
        )}

        <section className={`stats-grid menu-target ${activeMenu !== "student-home" ? "section-hidden" : ""}`} id="student-home">
          <div className="stat-card">
            <span>Son TYT Netim</span>
            <strong>{student.lastTytNet}</strong>
            <small>Son deneme sonucu</small>
          </div>

          <div className="stat-card">
            <span>Son AYT Netim</span>
            <strong>{student.lastAytNet}</strong>
            <small>Son deneme sonucu</small>
          </div>

          <div className="stat-card success">
            <span>Haftalık Planım</span>
            <strong>%{weeklyCompletion}</strong>
            <small>{weeklyTasks.filter((task) => task.status !== "Tamamlandı").length} bekleyen çalışma</small>
          </div>

          <div className="stat-card">
            <span>Kaynak İlerlemem</span>
            <strong>%{student.resourceProgress}</strong>
            <small>{activeResources.length} aktif kaynak</small>
          </div>

          <div className="stat-card">
            <span>9 Aylık Fazım</span>
            <strong>{phaseInfo.currentWeek}. hafta</strong>
            <small>{phaseInfo.phase.label}</small>
          </div>
        </section>

        <section className={`panel-card account-security-panel ${activeMenu !== "student-home" ? "section-hidden" : ""}`}>
          <div className="section-head">
            <div>
              <h2>Hesap Güvenliği</h2>
              <p>Kullanıcı adın e-posta adresindir; ilk girişten sonra şifreni değiştir.</p>
            </div>
            <span className={`risk-badge ${activeAccount?.emailVerified ? "risk-low" : "risk-mid"}`}>
              {activeAccount?.emailVerified ? "E-posta doğrulandı" : "E-posta doğrulama bekliyor"}
            </span>
          </div>

          <div className="account-security-grid">
            <div className="notification-item neutral">
              <span>Kullanıcı adı</span>
              <strong>{activeAccount?.username || student.email || "E-posta tanımlı değil"}</strong>
              <small>{activeAccount?.mustChangePassword ? "Geçici şifreyle giriş yapıldı; yeni şifre belirlenmeli." : "Şifre öğrenci tarafından güncellendi."}</small>
            </div>

            <form className="password-change-form" onSubmit={handlePasswordSubmit}>
              <label>
                Mevcut Şifre
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                />
              </label>
              <label>
                Yeni Şifre
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                />
              </label>
              <label>
                Yeni Şifre Tekrar
                <input
                  type="password"
                  value={passwordForm.newPasswordRepeat}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPasswordRepeat: event.target.value }))}
                />
              </label>
              <button type="submit" className="yellow-btn">Şifreyi Güncelle</button>
              {passwordMessage && <small className="form-message">{passwordMessage}</small>}
            </form>
          </div>
        </section>

        <section className={`panel-card student-report-card menu-target ${activeMenu !== "student-home" ? "section-hidden" : ""}`} id="student-report-card">
          <div className="section-head">
            <div>
              <h2>Öğrenci Karnem</h2>
              <p>Net, çalışma, eksik konu ve risk durumunun tek bakış özeti.</p>
            </div>
            <span className={`risk-badge risk-${studentReportCard.risk.level.toLowerCase()}`}>
              Risk: {studentReportCard.risk.level} · %{studentReportCard.risk.score}
            </span>
          </div>

          <div className="report-card-grid">
            <div className="report-metric">
              <span>TYT Net</span>
              <strong>{studentReportCard.tytNet.toFixed(2)}</strong>
              <small>Son kayıtlı deneme</small>
            </div>
            <div className="report-metric">
              <span>AYT Net</span>
              <strong>{studentReportCard.aytNet.toFixed(2)}</strong>
              <small>Son kayıtlı deneme</small>
            </div>
            <div className="report-metric">
              <span>Haftalık Plan</span>
              <strong>%{studentReportCard.weeklyCompletion}</strong>
              <small>Tamamlanan plan oranı</small>
            </div>
            <div className="report-metric">
              <span>Çözülen Soru</span>
              <strong>{studentReportCard.solvedQuestions}</strong>
              <small>Günlük çalışma kayıtları</small>
            </div>
            <div className="report-metric">
              <span>Eksik Konu</span>
              <strong>{studentReportCard.missingTopicCount}</strong>
              <small>Öncelikli takip başlığı</small>
            </div>
            <div className="report-metric">
              <span>Çalışma Başarısı</span>
              <strong>%{studentReportCard.studySuccessRate}</strong>
              <small>Doğru / soru oranı</small>
            </div>
          </div>

          <div className="risk-reason-list">
            {studentReportCard.risk.reasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
          </div>

          <div className="priority-topic-list">
            <h3>Öncelikli Eksik Konular</h3>
            {studentReportCard.missingTopics.length > 0 ? (
              studentReportCard.missingTopics.map((topic) => (
                <div className="priority-topic-card" key={`${topic.lesson}-${topic.topic}-${topic.subtopic}`}>
                  <strong>{topic.lesson} · {topic.topic}</strong>
                  <span>{topic.subtopic || "Alt konu belirtilmedi"} · {topic.priority} öncelik</span>
                  <small>{topic.recommendation}</small>
                </div>
              ))
            ) : (
              <div className="empty-state">Kritik eksik konu görünmüyor.</div>
            )}
          </div>
        </section>

        <div className={activeMenu !== "student-home" ? "section-hidden" : ""}>
          <DataHealthPanel student={student} title="Sistem Durumum" compact />
        </div>

        <section className={`analytics-board ${activeMenu !== "student-home" ? "section-hidden" : ""}`}>
          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>İlerleme Ölçümüm</h2>
                <p>Kaynak, ödev ve net durumunun karşılaştırmalı özeti.</p>
              </div>
            </div>
            <MetricBars items={progressItems} />
          </div>

          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>Deneme Grafiğim</h2>
                <p>Girilen denemeler üzerinden net gelişim bar grafiği.</p>
              </div>
            </div>
            <BarChart items={examTrendItems} emptyText="Henüz deneme grafiği için kayıt yok." />
          </div>

          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>Soru Çözüm Grafiğim</h2>
                <p>Günlük soru kayıtların hedefinle birlikte görünür.</p>
              </div>
            </div>
            <BarChart items={studyTrendItems} emptyText="Henüz günlük soru kaydı yok." />
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-performance" ? "section-hidden" : ""}`} id="student-performance">
          <div className="section-head">
            <div>
              <h2>Performansım ve Çalışma Kayıtlarım</h2>
              <p>Günlük çalışma, konu ilerlemesi ve hata odağın tek performans ekranında birleşti.</p>
            </div>
          </div>

          <form className="mini-form study-form student-study-form" onSubmit={handleStudySubmit}>
            <label>
              Tarih
              <input
                type="date"
                name="date"
                value={studyForm.date}
                onChange={handleStudyChange}
              />
            </label>

            <label>
              Tür
              <select name="recordType" value={studyForm.recordType} onChange={handleStudyChange}>
                {studyRecordTypes.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Sınav
              <select name="exam" value={studyForm.exam} onChange={handleStudyChange}>
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
                <option value="YDT">YDT</option>
              </select>
            </label>

            <label>
              Ders
              <select name="lesson" value={studyForm.lesson} onChange={handleStudyChange}>
                {mergeCurrentOption(studyLessonOptions, studyForm.lesson).map((lesson) => (
                  <option value={lesson} key={lesson}>{lesson}</option>
                ))}
              </select>
            </label>

            <label className="topic-field">
              Konu
              <select name="topic" value={studyForm.topic} onChange={handleStudyChange}>
                <option value="">Konu seç</option>
                {mergeCurrentOption(studyTopicOptions, studyForm.topic).map((topic) => (
                  <option value={topic} key={topic}>{topic}</option>
                ))}
              </select>
            </label>

            <label className="subtopic-field">
              Alt Konu
              <select
                name="subtopic"
                value={studyForm.subtopic}
                onChange={handleStudyChange}
                disabled={!studyForm.topic || studySubtopicOptions.length === 0}
              >
                <option value="">
                  {studyForm.topic ? "Alt konu seç" : "Önce konu seç"}
                </option>
                {mergeCurrentOption(studySubtopicOptions, studyForm.subtopic).map((subtopic) => (
                  <option value={subtopic} key={subtopic}>{subtopic}</option>
                ))}
              </select>
            </label>

            <SubtopicPicker
              topic={studyForm.topic}
              options={studySubtopicOptions}
              value={studyForm.subtopic}
              onSelect={(subtopic) => setStudyForm((current) => ({ ...current, subtopic }))}
            />

            <label>
              Kaynak / Test
              <input
                name="source"
                value={studyForm.source}
                onChange={handleStudyChange}
                placeholder="Örn: 345 Matematik"
              />
            </label>

            <label>
              Hedef
              <input
                type="number"
                min="0"
                name="targetQuestions"
                value={studyForm.targetQuestions}
                onChange={handleStudyChange}
              />
            </label>

            <label>
              Çözülen
              <input
                type="number"
                min="0"
                name="solvedQuestions"
                value={studyForm.solvedQuestions}
                onChange={handleStudyChange}
              />
            </label>

            <label>
              Doğru
              <input
                type="number"
                min="0"
                name="correct"
                value={studyForm.correct}
                onChange={handleStudyChange}
              />
            </label>

            <label>
              Yanlış
              <input
                type="number"
                min="0"
                name="wrong"
                value={studyForm.wrong}
                onChange={handleStudyChange}
              />
            </label>

            <label>
              Boş
              <input value={calculatedStudyBlank} readOnly />
            </label>

            <label>
              Net
              <input value={calculatedStudyNet.toFixed(2)} readOnly />
            </label>

            <label>
              Süre (dk)
              <input
                type="number"
                min="0"
                name="duration"
                value={studyForm.duration}
                onChange={handleStudyChange}
              />
            </label>

            <label className="full-width">
              Notum
              <textarea
                name="studentNote"
                value={studyForm.studentNote}
                onChange={handleStudyChange}
                placeholder="Zorlandığın yer, süre veya tekrar ihtiyacın..."
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">Çalışmamı Kaydet</button>
            </div>
          </form>

          <div className="student-visual-grid study-visual-grid">
            <VisualPanel title="Gün Gün Çalışma" subtitle="Son günlerde çözülen soru adetleri">
              <BarChart items={studyDailyItems} emptyText="Günlük çalışma grafiği için kayıt yok." />
            </VisualPanel>

            <VisualPanel title="Derslere Göre Çözüm" subtitle="Hangi derste ne kadar soru birikti?">
              <BarChart items={studyLessonItems} emptyText="Ders bazlı çözüm grafiği için kayıt yok." />
            </VisualPanel>
          </div>

          <div className="topic-summary-strip study-summary-strip">
            <SummaryRow title="Kayıt" value={studyStats.total} />
            <SummaryRow title="Çözülen" value={studyStats.totalSolved} />
            <SummaryRow title="Hedef" value={`%${studyStats.completionRate}`} />
            <SummaryRow title="Kontrol Edilen" value={studyStats.checked} />
          </div>

          <div className="study-record-grid">
            {studyRecords.length > 0 ? studyRecords.map((record) => (
              <article className="study-record-card" key={record.id}>
                <div className="study-record-head">
                  <div>
                    <strong>{record.recordType}</strong>
                    <small>{record.date} · {record.exam} {record.lesson} · {formatTopicPath(record.topic, record.subtopic)}</small>
                    {record.source && <small>Kaynak: {record.source}</small>}
                  </div>
                  <span className={`status-badge ${getStudyStatusClass(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                <div className="study-metric-grid">
                  <span>Çözülen <strong>{record.solvedQuestions}</strong></span>
                  <span>D/Y/B <strong>{record.correct}/{record.wrong}/{record.blank}</strong></span>
                  <span>Net <strong>{Number(record.net || 0).toFixed(2)}</strong></span>
                  <span>Süre <strong>{formatStudyDuration(record.duration)}</strong></span>
                </div>

                {(record.studentNote || record.coachNote) && (
                  <div className="study-note-stack">
                    {record.studentNote && <p><b>Ben:</b> {record.studentNote}</p>}
                    {record.coachNote && <p><b>Koç:</b> {record.coachNote}</p>}
                  </div>
                )}
              </article>
            )) : (
              <div className="empty-state">Henüz günlük çalışma kaydı girmedin.</div>
            )}
          </div>
        </section>

        <section className={`weekly-plan-layout menu-target ${activeMenu !== "student-plan" ? "section-hidden" : ""}`} id="student-plan">
          <div className="panel-card">
            <div className="section-head section-head-with-action">
              <div>
                <h2>Haftalık Planım</h2>
                <p>Bu alan öğrenci için takip ekranıdır. Planı koç hazırlar; öğrenci yalnızca durumunu işler.</p>
              </div>
              <span className="status-badge status-active">Koç planı</span>
            </div>

            <div className="student-warning">
              <strong>Yetki ayrımı netleştirildi.</strong>
              <p>Çalışma ekleme, silme, haftalık şablon üretme ve program ayarı koç panelindedir. Öğrenci panelinde plan bozulmasın diye sadece “devam ediyor”, “tamamladım” ve “eksik kaldı” işlemleri bulunur.</p>
            </div>

            <div className="phase-card compact-phase">
              <div>
                <span>{phaseInfo.phase.label}</span>
                <strong>{phaseInfo.currentWeek}. hafta / 40</strong>
                <small>{phaseInfo.phase.target}</small>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${phaseInfo.overallProgress}%` }} />
              </div>
            </div>

            <div className="week-date-banner">
              <div>
                <span>Bu haftanın tarih aralığı</span>
                <strong>{weeklyDateInfo.rangeLabel}</strong>
              </div>
              <small>{weeklyDateInfo.startLabel} başlangıç · {weeklyDateInfo.endLabel} bitiş</small>
            </div>

            <div className="phase-strategy-strip">
              <div>
                <span>Deneme ritmi</span>
                <strong>{phaseInfo.phase.examFrequency}</strong>
              </div>
              <div>
                <span>Haftanın ana odağı</span>
                <strong>{phaseInfo.phase.taskType}</strong>
              </div>
            </div>

            <div className="topic-summary-strip">
              <SummaryRow title="Alan" value={programAreaOptions.find((item) => item.value === activeArea)?.label || activeArea} />
              <SummaryRow title="Seviye" value={student.programLevel || "Orta"} />
              <SummaryRow title="Haftalık Plan" value={`%${weeklyCompletion}`} />
              <SummaryRow title="Bekleyen" value={weeklyTasks.filter((task) => task.status !== "Tamamlandı").length} />
            </div>

            <div className="lesson-level-panel">
              <div>
                <h3>Ders Bazlı Seviyem</h3>
                <p>Bu seviye bilgisi koç panelinden yönetilir; öğrenci kendi seviyesini yalnızca görüntüler.</p>
              </div>
              <div className="lesson-level-grid readonly-level-grid">
                {lessonLevelItems.map((item) => (
                  <div className="summary-row" key={item.key}>
                    <span>{item.label}</span>
                    <strong>{student.lessonLevels?.[item.key] || student.programLevel || "Orta"}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="period-plan-table-wrapper">
              <table className="weekly-program-table">
                <thead>
                  <tr>
                    <th>Gün</th>
                    <th>Saat</th>
                    <th>Seviye</th>
                    <th>Ders</th>
                    <th>Konu / Alt Konu</th>
                    <th>Hedef</th>
                    <th>Durum</th>
                    <th>Öğrenci İşlemi</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyGridRows.map((row) => {
                    const task = row.task;
                    return (
                      <tr className={row.periodSlot === 1 ? "day-start-row" : ""} key={`${row.day}-${row.periodSlot}`}>
                        {row.periodSlot === 1 && (
                          <td className="week-day-cell" rowSpan={periodCount}>
                            <strong>{row.day.toLocaleUpperCase("tr-TR")}</strong>
                            <small>{getWeekDayDateLabel(weeklyDateInfo.startDate, row.day)}</small>
                          </td>
                        )}
                        <td><span className="period-badge">{row.periodSlot}. saat</span></td>
                        <td>{task ? <span className="level-pill">{task.level || "Orta"}</span> : <span className="empty-slot">-</span>}</td>
                        <td>{task?.lesson || <span className="empty-slot">Boş</span>}</td>
                        <td>
                          {task ? (
                            <>
                              <strong>{formatTopicPath(task.topic, task.subtopic)}</strong>
                              <small>{task.task}</small>
                              {task.source && <small>{task.source}</small>}
                            </>
                          ) : <span className="empty-slot">Koç tarafından planlanacak</span>}
                        </td>
                        <td>
                          {task ? (
                            <>
                              <strong>{task.targetQuestions || 0} soru</strong>
                              <small>{task.periodMinutes || 0} dk · {task.priority || "Sistem"}</small>
                            </>
                          ) : <span className="empty-slot">-</span>}
                        </td>
                        <td>
                          {task ? (
                            <span className={`status-badge ${getStatusClass(task.status)}`}>{task.status}</span>
                          ) : <span className="status-badge status-waiting">Boş</span>}
                        </td>
                        <td>
                          <div className="table-actions">
                            {task ? (
                              <>
                                {task.status !== "Tamamlandı" && (
                                  <button className="small-btn neutral" onClick={() => updateWeeklyTaskStatus({ id: task.id, status: "Devam Ediyor" })}>Devam ediyor</button>
                                )}
                                {task.status !== "Tamamlandı" && (
                                  <button className="small-btn neutral" onClick={() => handleCompleteWeeklyTask(task)}>Tamamladım</button>
                                )}
                                {task.status !== "Tamamlandı" && (
                                  <button className="small-btn danger-action" onClick={() => updateWeeklyTaskStatus({ id: task.id, status: "Eksik", completedAt: "" })}>Eksik kaldı</button>
                                )}
                              </>
                            ) : (
                              <span className="empty-slot">İşlem yok</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="embedded-plan-grid">
              <div className="embedded-plan-card">
                <div className="section-head compact-section-head">
                  <div>
                    <h3>Günlük Ekstra Çalışma</h3>
                    <p>Menüden ayrı bir alan yerine haftalık planın içinde hızlı çalışma kaydı gir.</p>
                  </div>
                </div>

                <form className="mini-form student-entry-form compact-entry-form" onSubmit={handleStudySubmit}>
                  <label>
                    Tarih
                    <input type="date" name="date" value={studyForm.date} onChange={handleStudyChange} />
                  </label>
                  <label>
                    Sınav
                    <select name="exam" value={studyForm.exam} onChange={handleStudyChange}>
                      <option value="TYT">TYT</option>
                      <option value="AYT">AYT</option>
                      <option value="YDT">YDT</option>
                    </select>
                  </label>
                  <label>
                    Ders
                    <select name="lesson" value={studyForm.lesson} onChange={handleStudyChange}>
                      {mergeCurrentOption(studyLessonOptions, studyForm.lesson).map((lesson) => (
                        <option value={lesson} key={lesson}>{lesson}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Konu
                    <select name="topic" value={studyForm.topic} onChange={handleStudyChange}>
                      {mergeCurrentOption(studyTopicOptions, studyForm.topic).map((topic) => (
                        <option value={topic} key={topic}>{topic}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Çözülen
                    <input type="number" min="0" name="solvedQuestions" value={studyForm.solvedQuestions} onChange={handleStudyChange} />
                  </label>
                  <label>
                    Doğru
                    <input type="number" min="0" name="correct" value={studyForm.correct} onChange={handleStudyChange} />
                  </label>
                  <label>
                    Yanlış
                    <input type="number" min="0" name="wrong" value={studyForm.wrong} onChange={handleStudyChange} />
                  </label>
                  <label>
                    Süre
                    <input type="number" min="0" name="duration" value={studyForm.duration} onChange={handleStudyChange} />
                  </label>
                  <label className="full-width">
                    Not
                    <textarea name="studentNote" value={studyForm.studentNote} onChange={handleStudyChange} placeholder="Bugünkü ekstra çalışmanda ne yaptın?" />
                  </label>
                  <div className="form-actions full-width">
                    <span className="mini-metric">Boş: {calculatedStudyBlank} · Net: {calculatedStudyNet.toFixed(2)}</span>
                    <button type="submit" className="yellow-btn">Ekstra Çalışmayı Kaydet</button>
                  </div>
                </form>
              </div>

              <div className="embedded-plan-card">
                <div className="section-head compact-section-head">
                  <div>
                    <h3>Haftalık Ödevler</h3>
                    <p>Koçun verdiği ödevler gün gün haftalık planın içinde takip edilir.</p>
                  </div>
                  <span className="status-badge status-active">{activeHomeworks.length} aktif</span>
                </div>

                <div className="daily-homework-list">
                  {WEEK_DAYS.map((day) => {
                    const dateLabel = getWeekDayDateLabel(weeklyDateInfo.startDate, day);
                    const dayHomeworks = activeHomeworks.filter((homework) => {
                      if (!homework.dueDate) return day === "Pazartesi";
                      return formatShortDate(homework.dueDate) === dateLabel;
                    });
                    return (
                      <article className="daily-homework-card" key={day}>
                        <div>
                          <strong>{day}</strong>
                          <small>{dateLabel}</small>
                        </div>
                        {dayHomeworks.length > 0 ? dayHomeworks.map((homework) => (
                          <div className="homework-mini-card" key={homework.id}>
                            <span>{homework.lesson}</span>
                            <strong>{homework.title}</strong>
                            <small>{formatTopicPath(homework.topic, homework.subtopic)}</small>
                            <p>{homework.description || "Açıklama yok."}</p>
                            <div className="table-actions">
                              <span className={`status-badge ${getHomeworkStatusClass(homework.status)}`}>{homework.status}</span>
                              {homework.status !== "Tamamlandı" && (
                                <button className="small-btn neutral" onClick={() => updateHomeworkStatus({ id: homework.id, status: "Tamamlandı" })}>Ödevi Tamamladım</button>
                              )}
                            </div>
                          </div>
                        )) : (
                          <span className="empty-slot">Bugüne atanmış ödev yok.</span>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="section-head">
              <div>
                <h2>Haftalık Sınav / Test Görevleri</h2>
                <p>TYT, AYT/YDT, branş denemesi, konu tarama ve yanlış tekrar görevleri haftalık planın içinde izlenir.</p>
              </div>
            </div>
            <div className="daily-homework-list">
              {WEEK_DAYS.map((day, index) => {
                const recommendedType = index === 1 || index === 5 ? "TYT Denemesi" : index === 3 ? "AYT/YDT Denemesi" : "Konu Tarama / Yanlış Tekrar";
                return (
                  <article className="daily-homework-card" key={`exam-task-${day}`}>
                    <div>
                      <strong>{day}</strong>
                      <small>{getWeekDayDateLabel(weeklyDateInfo.startDate, day)}</small>
                    </div>
                    <div className="homework-mini-card">
                      <span>{recommendedType}</span>
                      <strong>{phaseInfo.phase.examFrequency}</strong>
                      <small>{phaseInfo.phase.taskType}</small>
                      <p>Koçun bu güne özel deneme/test görevi verdiyse sonucunu Sınavlarım ekranından gir.</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="panel-card">
            <div className="section-head">
              <div>
                <h2>Koç Notum</h2>
                <p>Bu hafta dikkat etmem gereken nokta.</p>
              </div>
            </div>

            <div className="note-box">
              {student.coachNote}
            </div>

            <div className="student-warning">
              <strong>Öğrenci paneli sade tutuldu.</strong>
              <p>Çalışma kaydı, ödev durumu, ekstra çalışma ve deneme/test görevleri haftalık plan merkezinde; konu ve hata analizleri Performansım ekranında takip edilir.</p>
            </div>
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-performance" ? "section-hidden" : ""}`} id="student-topics">
          <div className="section-head">
            <div>
              <h2>Konu Takibim</h2>
              <p>Konu durumunu sen de güncelle; koç panelinde anında görünsün.</p>
            </div>
          </div>

          <form className="mini-form topic-form student-entry-form" onSubmit={handleTopicSubmit}>
            <label>
              Sınav
              <select name="exam" value={topicForm.exam} onChange={handleTopicChange}>
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
                <option value="YDT">YDT</option>
              </select>
            </label>

            <label>
              Ders
              <select name="lesson" value={topicForm.lesson} onChange={handleTopicChange}>
                {mergeCurrentOption(topicLessonOptions, topicForm.lesson).map((lesson) => (
                  <option value={lesson} key={lesson}>{lesson}</option>
                ))}
              </select>
            </label>

            <label>
              Konu
              <select name="topic" value={topicForm.topic} onChange={handleTopicChange}>
                <option value="">Konu seç</option>
                {mergeCurrentOption(topicTopicOptions, topicForm.topic).map((topic) => (
                  <option value={topic} key={topic}>{topic}</option>
                ))}
              </select>
            </label>

            <label>
              Alt Konu
              <select
                name="subtopic"
                value={topicForm.subtopic}
                onChange={handleTopicChange}
                disabled={!topicForm.topic || topicSubtopicOptions.length === 0}
              >
                <option value="">{topicForm.topic ? "Alt konu seç" : "Önce konu seç"}</option>
                {mergeCurrentOption(topicSubtopicOptions, topicForm.subtopic).map((subtopic) => (
                  <option value={subtopic} key={subtopic}>{subtopic}</option>
                ))}
              </select>
            </label>

            <SubtopicPicker
              topic={topicForm.topic}
              options={topicSubtopicOptions}
              value={topicForm.subtopic}
              onSelect={(subtopic) => setTopicForm((current) => ({ ...current, subtopic }))}
            />

            <label>
              Durumum
              <select name="status" value={topicForm.status} onChange={handleTopicChange}>
                {topicTrackingStatuses.map((status) => (
                  <option value={status} key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Öğrenme
              <select name="learningStatus" value={topicForm.learningStatus} onChange={handleTopicChange}>
                {learningStatusOptions.map((status) => (
                  <option value={status} key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Soru Durumu
              <select name="questionStatus" value={topicForm.questionStatus} onChange={handleTopicChange}>
                {questionStatusOptions.map((status) => (
                  <option value={status} key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Deneme Neti
              <select name="netStatus" value={topicForm.netStatus} onChange={handleTopicChange}>
                {netStatusOptions.map((status) => (
                  <option value={status} key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Hata Türü
              <select name="errorType" value={topicForm.errorType} onChange={handleTopicChange}>
                {topicErrorTypeOptions.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Tekrar Tarihi
              <input
                type="date"
                name="reviewDate"
                value={topicForm.reviewDate}
                onChange={handleTopicChange}
              />
            </label>

            <label className="full-width">
              Notum
              <textarea
                name="note"
                value={topicForm.note}
                onChange={handleTopicChange}
                placeholder="Konu bitti mi, tekrar mı gerekiyor, hangi alt konu zorladı?"
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">Konu Durumumu Kaydet</button>
            </div>
          </form>

          <div className="topic-grid">
            {topicTracking.length > 0 ? topicTracking.map((topicRecord) => (
              <article className="topic-card" key={topicRecord.id}>
                {(() => {
                  const readiness = calculateTopicReadiness(topicRecord);
                  return (
                    <>
                <div className="topic-card-head">
                  <div>
                    <strong>{topicRecord.exam} {topicRecord.lesson}</strong>
                    <small>{formatTopicPath(topicRecord.topic, topicRecord.subtopic)}</small>
                    <small>{getTopicPriorityLabel(topicRecord.exam, topicRecord.lesson, topicRecord.topic)}</small>
                  </div>
                  <span className={`status-badge ${getTopicStatusClass(topicRecord.status)}`}>
                    {topicRecord.status}
                  </span>
                </div>

                <p>{topicRecord.note || "Bu konu için koç notu girilmedi."}</p>
                <div className="topic-readiness">
                  <span>Hazır oluş</span>
                  <strong>%{readiness}</strong>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${readiness}%` }} />
                  </div>
                </div>
                <div className="topic-mini-metrics">
                  <span>Öğrenme: {topicRecord.learningStatus || "Başlamadı"}</span>
                  <span>Soru: {topicRecord.questionStatus || "Az"}</span>
                  <span>Net: {topicRecord.netStatus || "Ölçülmedi"}</span>
                  <span>Hata: {topicRecord.errorType || "Yok"}</span>
                  {topicRecord.reviewDate && <span>Tekrar: {topicRecord.reviewDate}</span>}
                </div>
                {topicRecord.updatedBy === "student" && topicRecord.updatedAt && (
                  <small>Son öğrenci girişi: {formatMessageDate(topicRecord.updatedAt)}</small>
                )}
                <div className="row-actions">
                  <button className="small-btn neutral" onClick={() => handleQuickTopicStatus(topicRecord, "Konu anlatımı başladı")}>
                    Devam
                  </button>
                  <button className="small-btn neutral" onClick={() => handleQuickTopicStatus(topicRecord, "Tamamlandı")}>
                    Tamamladım
                  </button>
                  <button className="small-btn neutral" onClick={() => handleQuickTopicStatus(topicRecord, "Tekrar gerekiyor")}>
                    Tekrar
                  </button>
                </div>
                    </>
                  );
                })()}
              </article>
            )) : (
              <div className="empty-state">Henüz konu takibi girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-resources" ? "section-hidden" : ""}`} id="student-resources">
          <div className="section-head">
            <div>
              <h2>Kaynaklarım</h2>
              <p>Koçunun sana atadığı ve senin eklediğin kaynakları takip et; ilerleme yüzdesini güncelle.</p>
            </div>
          </div>

          <form className="mini-form resource-form student-entry-form" onSubmit={handleStudentResourceSubmit}>
            <label>
              Kaynak Adı
              <input
                name="title"
                value={studentResourceForm.title}
                onChange={handleStudentResourceChange}
                placeholder="Örn: 345 TYT Matematik"
              />
            </label>

            <label>
              Yayın
              <input
                name="publisher"
                value={studentResourceForm.publisher}
                onChange={handleStudentResourceChange}
                placeholder="Örn: 345 Yayınları"
              />
            </label>

            <label>
              Sınav
              <select name="exam" value={studentResourceForm.exam} onChange={handleStudentResourceChange}>
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
                <option value="YDT">YDT</option>
              </select>
            </label>

            <label>
              Ders
              <select name="lesson" value={studentResourceForm.lesson} onChange={handleStudentResourceChange}>
                {mergeCurrentOption(resourceLessonOptions, studentResourceForm.lesson).map((lesson) => (
                  <option value={lesson} key={lesson}>{lesson}</option>
                ))}
              </select>
            </label>

            <label>
              Konu
              <select name="topic" value={studentResourceForm.topic} onChange={handleStudentResourceChange}>
                <option value="">Konu seç</option>
                {mergeCurrentOption(resourceTopicOptions, studentResourceForm.topic).map((topic) => (
                  <option value={topic} key={topic}>{topic}</option>
                ))}
              </select>
            </label>

            <label>
              Alt Konu
              <select
                name="subtopic"
                value={studentResourceForm.subtopic}
                onChange={handleStudentResourceChange}
                disabled={!studentResourceForm.topic || resourceSubtopicOptions.length === 0}
              >
                <option value="">{studentResourceForm.topic ? "Alt konu seç" : "Önce konu seç"}</option>
                {mergeCurrentOption(resourceSubtopicOptions, studentResourceForm.subtopic).map((subtopic) => (
                  <option value={subtopic} key={subtopic}>{subtopic}</option>
                ))}
              </select>
            </label>

            <SubtopicPicker
              topic={studentResourceForm.topic}
              options={resourceSubtopicOptions}
              value={studentResourceForm.subtopic}
              onSelect={(subtopic) => setStudentResourceForm((current) => ({ ...current, subtopic }))}
            />

            <label>
              Tür
              <select name="resourceType" value={studentResourceForm.resourceType} onChange={handleStudentResourceChange}>
                <option value="Soru Bankası">Soru Bankası</option>
                <option value="Konu Anlatımı">Konu Anlatımı</option>
                <option value="Deneme Kitabı">Deneme Kitabı</option>
                <option value="Video Kamp">Video Kamp</option>
                <option value="Fasikül">Fasikül</option>
              </select>
            </label>

            <label>
              Birim
              <select name="unitLabel" value={studentResourceForm.unitLabel} onChange={handleStudentResourceChange}>
                <option value="soru">soru</option>
                <option value="sayfa">sayfa</option>
                <option value="test">test</option>
                <option value="video">video</option>
              </select>
            </label>

            <label>
              Toplam
              <input
                type="number"
                min="0"
                name="totalUnits"
                value={studentResourceForm.totalUnits}
                onChange={handleStudentResourceChange}
                placeholder="0"
              />
            </label>

            <label>
              Tamamlanan
              <input
                type="number"
                min="0"
                name="completedUnits"
                value={studentResourceForm.completedUnits}
                onChange={handleStudentResourceChange}
                placeholder="0"
              />
            </label>

            <label>
              Durum
              <select name="status" value={studentResourceForm.status} onChange={handleStudentResourceChange}>
                <option value="Planlandı">Planlandı</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Ara Verildi">Ara Verildi</option>
              </select>
            </label>

            <label>
              Hedef Tarih
              <input
                type="date"
                name="dueDate"
                value={studentResourceForm.dueDate}
                onChange={handleStudentResourceChange}
              />
            </label>

            <label className="full-width">
              Notum
              <textarea
                name="note"
                value={studentResourceForm.note}
                onChange={handleStudentResourceChange}
                placeholder="Kaynakta nereden başladın, hangi bölüm hedef?"
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">Kaynağımı Ekle</button>
            </div>
          </form>

          <form className="mini-form resource-progress-form" onSubmit={handleResourceProgressSubmit}>
            <label>
              Kaynak
              <select
                name="resourceId"
                value={resourceProgressForm.resourceId}
                onChange={handleResourceProgressChange}
              >
                {resources.map((resource) => (
                  <option value={resource.id} key={resource.id}>{resource.title}</option>
                ))}
              </select>
            </label>

            <label>
              Tamamlanan Birim
              <input
                type="number"
                min="0"
                max={selectedResource?.totalUnits || 0}
                name="completedUnits"
                value={resourceProgressForm.completedUnits}
                onChange={handleResourceProgressChange}
                placeholder="0"
              />
            </label>

            <label>
              Toplam Birim
              <input value={selectedResource ? `${selectedResource.totalUnits || 0} ${selectedResource.unitLabel}` : "Kaynak yok"} readOnly />
            </label>

            <label>
              Yeni Yüzde
              <input
                value={selectedResource
                  ? `%${getPreviewResourceProgress(selectedResource, resourceProgressForm.completedUnits)}`
                  : "%0"}
                readOnly
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">İlerlememi Kaydet</button>
            </div>
          </form>

          <div className="student-visual-grid resource-visual-grid">
            <VisualPanel title="Sınava Göre Kaynak İlerlemesi" subtitle="TYT / AYT / YDT kaynak ortalaması">
              <MetricBars items={resourceOverviewItems} />
            </VisualPanel>
            <div className="visual-summary-grid">
              <VisualSummaryCard title="Toplam Kaynak" value={resources.length} subtitle="Aktif ve tamamlananlar" />
              <VisualSummaryCard title="Aktif Kaynak" value={activeResources.length} subtitle="Tamamlanmayı bekleyen" />
              <VisualSummaryCard title="Ortalama" value={`%${student.resourceProgress || 0}`} subtitle="Genel kaynak ilerlemesi" />
            </div>
          </div>

          <div className="resource-group-list">
            {resourceGroups.length > 0 ? resourceGroups.map((examGroup) => (
              <section className="resource-exam-group" key={examGroup.exam}>
                <div className="resource-group-head">
                  <div>
                    <span>{examGroup.exam}</span>
                    <strong>{examGroup.totalResources} kaynak · %{examGroup.averageProgress} ortalama</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${examGroup.averageProgress}%` }} />
                  </div>
                </div>

                {examGroup.lessons.map((lessonGroup) => (
                  <div className="resource-lesson-group" key={`${examGroup.exam}-${lessonGroup.lesson}`}>
                    <div className="resource-lesson-head">
                      <div>
                        <strong>{lessonGroup.lesson}</strong>
                        <small>{lessonGroup.resources.length} kaynak · %{lessonGroup.averageProgress} ilerleme</small>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${lessonGroup.averageProgress}%` }} />
                      </div>
                    </div>

                    <div className="resource-grid">
                      {lessonGroup.resources.map((resource) => (
                        <ResourceCard resource={resource} key={resource.id} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )) : (
              <div className="empty-state">Henüz kaynak takibi girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-exams" ? "section-hidden" : ""}`} id="student-exams">
          <div className="section-head">
            <div>
              <h2>Sınavlarım</h2>
              <p>TYT, AYT, YDT, branş denemesi, konu tarama testi, mini test ve yanlış tekrar testini ders ders gir; boş ve net otomatik hesaplansın.</p>
            </div>
          </div>

          <div className="student-visual-grid exam-visual-grid">
            <VisualPanel title="Deneme Net Gelişimi" subtitle="Son denemelerin bar grafiği">
              <BarChart items={examTrendItems.slice(-8)} emptyText="Deneme grafiği için kayıt yok." />
            </VisualPanel>

            <VisualPanel title="Ders Bazlı Ortalama ve Gelişim" subtitle="Ortalama net + son denemeye göre artış/azalış">
              <SubjectTrendChart items={examSubjectItems} emptyText="Ders bazlı grafik için deneme kaydı yok." />
            </VisualPanel>

            <div className="visual-summary-grid exam-summary-grid">
              <VisualSummaryCard title="Son Net" value={examOverview.latestNet} subtitle={examOverview.latestLabel} />
              <VisualSummaryCard title="En İyi Net" value={examOverview.bestNet} subtitle="Kayıtlardaki zirve" />
              <VisualSummaryCard title="Ortalama" value={examOverview.averageNet} subtitle={`${examOverview.total} deneme`} />
            </div>
          </div>

          <div className="exam-type-strip">
            {studentExamRecordTypes.map((type) => {
              const count = exams.filter((exam) => (exam.recordType || inferExamRecordType(exam.examType)) === type).length;
              return (
                <div className="summary-row" key={type}>
                  <span>{type}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>

          <div className="exam-compare-panel">
            <div className="section-head compact-section-head">
              <div>
                <h3>Sınav / Test Karşılaştırma</h3>
                <p>İki sınav ya da testi seç; toplam net ve ders ders değişimi grafiklerle gör.</p>
              </div>
            </div>

            <div className="exam-compare-selectors">
              <label>
                İlk deneme
                <select value={compareExamAId} onChange={(event) => setCompareExamAId(event.target.value)}>
                  {getExamSelectOptions(exams).map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Karşılaştırılacak deneme
                <select value={compareExamBId} onChange={(event) => setCompareExamBId(event.target.value)}>
                  {getExamSelectOptions(exams).map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {examComparison ? (
              <>
                <div className="exam-comparison-summary">
                  <VisualSummaryCard title="İlk Net" value={examComparison.firstNet} subtitle={examComparison.firstLabel} />
                  <VisualSummaryCard title="Son Net" value={examComparison.secondNet} subtitle={examComparison.secondLabel} />
                  <VisualSummaryCard title="Net Farkı" value={examComparison.deltaLabel} subtitle={examComparison.deltaHint} />
                </div>

                <VisualPanel title="Karşılaştırmalı Toplam Net" subtitle="Seçilen iki denemenin toplam net karşılaştırması">
                  <BarChart items={examComparison.totalItems} emptyText="Karşılaştırma için deneme seç." />
                </VisualPanel>

                <VisualPanel title="Ders Ders Net Farkı" subtitle="Pozitif değer gelişim, negatif değer düşüş demektir">
                  <ExamComparisonChart items={examComparison.subjectItems} emptyText="Ders bazlı karşılaştırma için iki denemede de ders kırılımı olmalı." />
                </VisualPanel>
              </>
            ) : (
              <div className="empty-state">Karşılaştırma için en az bir deneme kaydı gerekiyor.</div>
            )}
          </div>

          <form className="mini-form exam-form student-exam-form" onSubmit={handleExamSubmit}>
            <label>
              Sınav / Test Adı
              <input
                name="name"
                value={examForm.name}
                onChange={handleExamChange}
                placeholder="Örn: TYT Genel Deneme, Limit Branş Denemesi, Paragraf Konu Tarama"
              />
            </label>

            <label>
              Tarih
              <input
                type="date"
                name="date"
                value={examForm.date}
                onChange={handleExamChange}
              />
            </label>

            <label>
              Kayıt Türü
              <select name="recordType" value={examForm.recordType} onChange={handleExamChange}>
                {studentExamRecordTypes.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Sınav Alanı
              <select name="examType" value={examForm.examType} onChange={handleExamChange}>
                <option value="TYT">TYT</option>
                <option value="AYT-SAY">AYT-SAY</option>
                <option value="AYT-EA">AYT-EA</option>
                <option value="AYT-SÖZ">AYT-SÖZ</option>
                <option value="YDT">YDT</option>
              </select>
            </label>

            <label>
              Toplam Net
              <input value={calculatedExamNet.toFixed(2)} readOnly />
            </label>

            <div className="exam-subject-table full-width">
              <div className="exam-subject-title">
                <strong>{examForm.examType} ders kırılımı</strong>
                <span>Doğru ve yanlış gir; boş otomatik hesaplanır.</span>
              </div>

              <div className="exam-subject-head">
                <span>Ders</span>
                <span>Doğru</span>
                <span>Yanlış</span>
                <span>Boş</span>
                <span>Net</span>
              </div>

              {examForm.sections.map((section) => (
                <div className="exam-subject-row" key={section.lesson}>
                  <strong>
                    {section.lesson}
                    <small>{section.questionCount} soru</small>
                  </strong>
                  <input
                    type="number"
                    min="0"
                    max={section.questionCount}
                    value={section.correct}
                    onChange={(event) => handleExamSectionChange(section.lesson, "correct", event.target.value)}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    min="0"
                    max={section.questionCount}
                    value={section.wrong}
                    onChange={(event) => handleExamSectionChange(section.lesson, "wrong", event.target.value)}
                    placeholder="0"
                  />
                  <input
                    value={calculateAutomaticBlank(section.questionCount, section.correct, section.wrong)}
                    readOnly
                    placeholder="0"
                  />
                  <span>{calculateNet(section.correct, section.wrong).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <label className="full-width">
              Deneme Notum
              <textarea
                name="note"
                value={examForm.note}
                onChange={handleExamChange}
                placeholder="Süre, dikkat hatası veya zorlandığın konular..."
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">Deneme Sonucumu Kaydet</button>
            </div>
          </form>

          <div className="exam-list">
            {exams.length > 0 ? exams.map((exam) => (
              <div className="exam-row" key={exam.id}>
                <div>
                  <strong>{exam.name}</strong>
                  <small>{exam.date || "Tarih yok"} · {exam.examType}</small>
                  <ExamSectionChips sections={exam.sections} />
                </div>
                <div className="exam-metrics">
                  <span>D: {exam.correct}</span>
                  <span>Y: {exam.wrong}</span>
                  <span>B: {exam.blank}</span>
                  <strong>Net: {Number(exam.net || 0).toFixed(2)}</strong>
                </div>
              </div>
            )) : (
              <div className="empty-state">Henüz deneme sonucu girilmedi.</div>
            )}
          </div>
        </section>


        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-resources" ? "section-hidden" : ""}`} id="student-videos">
          <div className="section-head">
            <div>
              <h2>Kaynaklarım · Video Derslerim</h2>
              <p>Kaynaklarım içinde görünür: Koçun eklediği oynatma listelerini YouTube'da aç; açılma bilgisi burada tutulsun.</p>
            </div>
          </div>
          <VideoLessons
            playlists={videoPlaylists}
            progress={videoProgress}
            audience="student"
            onUpdateProgress={updateVideoProgress}
          />
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-performance" ? "section-hidden" : ""}`} id="student-errors">
          <div className="section-head">
            <div>
              <h2>Hata Odağım</h2>
              <p>Yanlışlarını ders, konu ve hata türüne göre gir; koçun takip ekranında görsün.</p>
            </div>
          </div>

          <form className="mini-form error-form" onSubmit={handleErrorSubmit}>
            <label>
              Sınav
              <select name="exam" value={errorForm.exam} onChange={handleErrorChange}>
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
                <option value="YDT">YDT</option>
              </select>
            </label>

            <label>
              Ders
              <select name="lesson" value={errorForm.lesson} onChange={handleErrorChange}>
                {mergeCurrentOption(errorLessonOptions, errorForm.lesson).map((lesson) => (
                  <option value={lesson} key={lesson}>{lesson}</option>
                ))}
              </select>
            </label>

            <label className="topic-field">
              Konu
              <select name="topic" value={errorForm.topic} onChange={handleErrorChange}>
                <option value="">Konu seç</option>
                {mergeCurrentOption(errorTopicOptions, errorForm.topic).map((topic) => (
                  <option value={topic} key={topic}>{topic}</option>
                ))}
              </select>
            </label>

            <label className="subtopic-field">
              Alt Konu
              <select
                name="subtopic"
                value={errorForm.subtopic}
                onChange={handleErrorChange}
                disabled={!errorForm.topic || errorSubtopicOptions.length === 0}
              >
                <option value="">
                  {errorForm.topic ? "Alt konu seç" : "Önce konu seç"}
                </option>
                {mergeCurrentOption(errorSubtopicOptions, errorForm.subtopic).map((subtopic) => (
                  <option value={subtopic} key={subtopic}>{subtopic}</option>
                ))}
              </select>
            </label>

            <SubtopicPicker
              topic={errorForm.topic}
              options={errorSubtopicOptions}
              value={errorForm.subtopic}
              onSelect={(subtopic) => setErrorForm((current) => ({ ...current, subtopic }))}
            />

            <label>
              Hata Türü
              <select name="type" value={errorForm.type} onChange={handleErrorChange}>
                {errorTypes.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Hata Sayısı
              <input
                type="number"
                min="1"
                name="count"
                value={errorForm.count}
                onChange={handleErrorChange}
              />
            </label>

            <label>
              Durum
              <select name="status" value={errorForm.status} onChange={handleErrorChange}>
                <option value="Açık">Açık</option>
                <option value="Tekrar Planlandı">Tekrar Planlandı</option>
                <option value="Çözüldü">Çözüldü</option>
              </select>
            </label>

            <label>
              Kaynak / Deneme
              <input
                name="source"
                value={errorForm.source}
                onChange={handleErrorChange}
                placeholder="Örn: TYT 3. deneme"
              />
            </label>

            <label className="full-width">
              Not ve Aksiyon
              <textarea
                name="studentNote"
                value={errorForm.studentNote}
                onChange={handleErrorChange}
                placeholder="Yanlışı neden yaptın, nasıl tekrar edeceksin?"
              />
            </label>

            <label className="full-width">
              Yapılacak Aksiyon
              <textarea
                name="action"
                value={errorForm.action}
                onChange={handleErrorChange}
                placeholder="Örn: Konu özeti + 20 benzer soru + yanlış defteri"
              />
            </label>

            <div className="form-actions full-width">
              <button type="submit" className="yellow-btn">Hata Kaydımı Ekle</button>
            </div>
          </form>

          <div className="error-list">
            {errors.length > 0 ? errors.map((error) => (
              <div className="error-item" key={error.id}>
                <div>
                  <strong>{error.lesson}</strong>
                  <small>{formatTopicPath(error.topic || "Konu yok", error.subtopic)} · {error.type}</small>
                  {error.source && <small>Kaynak: {error.source}</small>}
                  {error.studentNote && <small>Öğrenci notu: {error.studentNote}</small>}
                  {error.action && <small>Aksiyon: {error.action}</small>}
                </div>
                <div className="item-actions">
                  <span className={`status-badge ${getErrorStatusClass(error.status)}`}>
                    {error.status}
                  </span>
                  {error.status !== "Çözüldü" && (
                    <button className="small-btn neutral" onClick={() => handleResolveError(error)}>
                      Çözdüm
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="empty-state">Henüz hata analizi girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-homeworks" ? "section-hidden" : ""}`} id="student-homeworks">
          <div className="section-head">
            <div>
              <h2>Ödevlerim</h2>
              <p>Koçunun verdiği ödevleri ve teslim durumlarını buradan takip et.</p>
            </div>
          </div>

          <div className="student-visual-grid homework-visual-grid">
            <VisualPanel title="Ödev Durum Grafiği" subtitle="Verildi, devam ediyor, tamamlandı ve eksikler">
              <BarChart items={homeworkStatusItems} emptyText="Ödev grafiği için kayıt yok." />
            </VisualPanel>
            <div className="visual-summary-grid">
              <VisualSummaryCard title="Toplam Ödev" value={homeworkOverview.total} subtitle="Koç tarafından verilen" />
              <VisualSummaryCard title="Tamamlanan" value={homeworkOverview.completed} subtitle={`%${homeworkOverview.completionRate} tamamlanma`} />
              <VisualSummaryCard title="Bekleyen" value={homeworkOverview.pending} subtitle="Takip gerektiren" tone="warning" />
            </div>
          </div>

          <div className="homework-grid">
            {homeworks.length > 0 ? homeworks.map((homework) => (
              <article className="homework-card" key={homework.id}>
                <div className="homework-card-head">
                  <div>
                    <strong>{homework.title}</strong>
                    <small>{homework.lesson} · {formatTopicPath(homework.topic, homework.subtopic)}</small>
                  </div>
                  <span className={`status-badge ${getHomeworkStatusClass(homework.status)}`}>
                    {homework.status}
                  </span>
                </div>

                <p>{homework.description || "Açıklama girilmedi."}</p>

                <div className="homework-meta">
                  <span>Teslim: {homework.dueDate || "Tarih yok"}</span>
                  {homework.studentNote && <span>Benim notum: {homework.studentNote}</span>}
                  {homework.submittedAt && <span>Son giriş: {formatMessageDate(homework.submittedAt)}</span>}
                  {homework.feedback && <span>Koç notu: {homework.feedback}</span>}
                </div>

                <form
                  className="homework-student-form"
                  key={`${homework.id}-${homework.status}-${homework.studentNote || ""}`}
                  onSubmit={(event) => handleHomeworkStatusSubmit(event, homework)}
                >
                  <label>
                    Durumum
                    <select name="status" defaultValue={homework.status}>
                      <option value="Verildi">Verildi</option>
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="Eksik">Eksik</option>
                    </select>
                  </label>

                  <label>
                    Notum
                    <textarea
                      name="studentNote"
                      defaultValue={homework.studentNote || ""}
                      placeholder="Nerede kaldın, hangi soru/konu zorladı?"
                    />
                  </label>

                  <button type="submit" className="yellow-btn">Ödev Durumumu Kaydet</button>
                </form>
              </article>
            )) : (
              <div className="empty-state">Henüz ödev girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "student-messages" ? "section-hidden" : ""}`} id="student-messages">
          <div className="section-head">
            <div>
              <h2>Koç Mesajlarım</h2>
              <p>Koçuna soru sorabilir, gelen yanıtları burada takip edebilirsin.</p>
            </div>
          </div>

          <form className="message-form" onSubmit={handleMessageSubmit}>
            <label>
              Başlık
              <select
                value={messageForm.category}
                onChange={(event) => setMessageForm((current) => ({ ...current, category: event.target.value }))}
              >
                <option value="Genel">Genel</option>
                <option value="Ödev">Ödev</option>
                <option value="Deneme">Deneme</option>
                <option value="Motivasyon">Motivasyon</option>
                <option value="Acil">Acil</option>
              </select>
            </label>

            <label className="message-textarea">
              Mesaj
              <textarea
                value={messageForm.text}
                onChange={(event) => setMessageForm((current) => ({ ...current, text: event.target.value }))}
                placeholder="Koçuna sormak istediğin şeyi yaz..."
              />
            </label>

            <button type="submit" className="yellow-btn">Mesaj Gönder</button>
          </form>

          <div className="message-thread">
            {messages.length > 0 ? messages.map((message) => (
              <article className={`message-bubble ${message.sender === "coach" ? "coach-message" : "student-message"}`} key={message.id}>
                <div>
                  <strong>{message.senderName}</strong>
                  <span>{message.category} · {formatMessageDate(message.createdAt)}</span>
                </div>
                <p>{message.text}</p>
              </article>
            )) : (
              <div className="empty-state">Henüz mesaj yok.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryRow({ title, value, danger }) {
  return (
    <div className={`summary-row ${danger ? "summary-danger" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function VisualPanel({ title, subtitle, children }) {
  return (
    <div className="student-visual-panel">
      <div className="student-visual-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function VisualSummaryCard({ title, value, subtitle, tone = "" }) {
  return (
    <div className={`visual-summary-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}

function ResourceCard({ resource }) {
  return (
    <article className="resource-card">
      <div className="resource-card-head">
        <div>
          <strong>{resource.title}</strong>
          <small>
            {resource.publisher || "Yayın yok"} · {resource.lesson}
            {resource.topic && ` · ${formatTopicPath(resource.topic, resource.subtopic)}`}
          </small>
        </div>
        <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
          {resource.status}
        </span>
      </div>

      <div className="resource-meta">
        <span>{resource.resourceType}</span>
        <span>{resource.completedUnits}/{resource.totalUnits || 0} {resource.unitLabel}</span>
        <span>Hedef: {resource.dueDate || "Tarih yok"}</span>
      </div>

      <div className="progress-line">
        <div>
          <span>İlerleme</span>
          <strong>%{getResourceProgress(resource)}</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${getResourceProgress(resource)}%` }} />
        </div>
      </div>

      {resource.note && <p>{resource.note}</p>}
      {getSourceVideoMatches(resource).length > 0 && (
        <div className="resource-video-links">
          {getSourceVideoMatches(resource).map((match) => (
            <a href={match.url} target="_blank" rel="noreferrer" key={match.url}>
              {match.title}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

function SubtopicPicker({ topic, options, value, onSelect }) {
  if (!topic) {
    return (
      <div className="subtopic-picker subtopic-picker-empty full-width">
        Konu seçilince alt konular burada listelenecek.
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className="subtopic-picker subtopic-picker-empty full-width">
        Bu konu için tanımlı alt konu yok.
      </div>
    );
  }

  return (
    <div className="subtopic-picker full-width">
      <span>Alt konu seçenekleri</span>
      <div>
        {options.map((subtopic) => (
          <button
            type="button"
            className={`subtopic-chip ${value === subtopic ? "active" : ""}`}
            onClick={() => onSelect(subtopic)}
            key={subtopic}
          >
            {subtopic}
          </button>
        ))}
      </div>
    </div>
  );
}

function getStatusClass(status) {
  if (status === "Tamamlandı") return "status-done";
  if (status === "Eksik") return "status-missing";
  if (status === "Devam Ediyor") return "status-progress";
  return "status-waiting";
}

function getHomeworkStatusClass(status) {
  if (status === "Tamamlandı" || status === "Kontrol Edildi") return "status-done";
  if (status === "Eksik") return "status-missing";
  if (status === "Tekrar Verildi") return "status-progress";
  return "status-waiting";
}

function getTopicStatusClass(status) {
  if (status === "Tamamlandı") return "status-done";
  if (status === "Tekrar Gerekli" || status === "Tekrar gerekiyor" || status === "Eksik var") return "status-missing";
  if (
    status === "Devam Ediyor" ||
    status === "Konu anlatımı başladı" ||
    status === "Konu anlatımı bitti" ||
    status === "Temel test çözüldü" ||
    status === "Orta test çözüldü" ||
    status === "İleri test çözüldü" ||
    status === "Denemede ölçüldü"
  ) return "status-progress";
  return "status-waiting";
}

function getResourceStatusClass(status) {
  if (status === "Tamamlandı") return "status-done";
  if (status === "Ara Verildi") return "status-missing";
  if (status === "Devam Ediyor") return "status-progress";
  return "status-waiting";
}

function getResourceProgress(resource) {
  const totalUnits = Number(resource.totalUnits || 0);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((Number(resource.completedUnits || 0) / totalUnits) * 100));
}

function getPreviewResourceProgress(resource, completedUnits) {
  const totalUnits = toNumber(resource.totalUnits);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((toNumber(completedUnits) / totalUnits) * 100));
}

function getErrorStatusClass(status) {
  if (status === "Çözüldü") return "status-done";
  if (status === "Tekrar Planlandı") return "status-progress";
  return "status-missing";
}

function getStudyStatusClass(status) {
  if (status === "Kontrol Edildi") return "status-done";
  if (status === "Eksik") return "status-missing";
  if (status === "Tekrar Verildi") return "status-progress";
  return "status-waiting";
}

function getStudyStats(studyRecords) {
  const total = studyRecords.length;
  const totalSolved = studyRecords.reduce((sum, record) => sum + toNumber(record.solvedQuestions), 0);
  const targetQuestions = studyRecords.reduce((sum, record) => sum + toNumber(record.targetQuestions), 0);
  const checked = studyRecords.filter((record) => record.status === "Kontrol Edildi").length;
  const completionRate = targetQuestions > 0
    ? Math.min(100, Math.round((totalSolved / targetQuestions) * 100))
    : 0;

  return { total, totalSolved, targetQuestions, checked, completionRate };
}

function getFirstTopicSelection(exam, lesson) {
  const topic = getTopicNames(exam, lesson)[0] || "";
  return {
    topic,
    subtopic: getFirstSubtopic(exam, lesson, topic),
  };
}

function getFirstSubtopic(exam, lesson, topic) {
  return getSubtopicNames(exam, lesson, topic)[0] || "";
}

function formatTaskLesson(exam, lesson) {
  return `${exam} ${lesson}`;
}

function parseTaskLesson(lessonValue) {
  const exactMatch = topicGroups.find((group) => formatTaskLesson(group.exam, group.lesson) === lessonValue);
  if (exactMatch) {
    return { exam: exactMatch.exam, lesson: exactMatch.lesson };
  }

  const [exam, ...lessonParts] = String(lessonValue || "").split(" ");
  const legacyLessonMatch = topicGroups.find((group) => group.lesson === lessonValue);
  if (legacyLessonMatch) {
    return { exam: legacyLessonMatch.exam, lesson: legacyLessonMatch.lesson };
  }

  return {
    exam: exam || "TYT",
    lesson: lessonParts.join(" ") || "Matematik",
  };
}

function getLessonOptions(exam) {
  return [...new Set(topicGroups
    .filter((group) => group.exam === exam)
    .map((group) => group.lesson))];
}

function getTopicGroup(exam, lesson) {
  return topicGroups.find((group) => group.exam === exam && group.lesson === lesson);
}

function getTopicNames(exam, lesson) {
  const group = getTopicGroup(exam, lesson);
  if (!group) return [];

  return group.topics.map((topic) => getTopicName(topic));
}

function getSubtopicNames(exam, lesson, topicName) {
  if (!topicName) return [];

  const group = getTopicGroup(exam, lesson);
  if (!group) return [];

  if (group.subtopics?.[topicName]) {
    return group.subtopics[topicName];
  }

  const selectedTopic = group.topics.find((topic) => getTopicName(topic) === topicName);
  return Array.isArray(selectedTopic?.subtopics) ? selectedTopic.subtopics : [];
}

function getTopicName(topic) {
  return typeof topic === "string" ? topic : topic.name;
}

function mergeCurrentOption(options, currentValue) {
  if (!currentValue || options.includes(currentValue)) return options;
  return [currentValue, ...options];
}

function getDailyStudyChartItems(studyRecords) {
  const grouped = new Map();

  studyRecords.forEach((record) => {
    const date = record.date || "Tarih yok";
    const current = grouped.get(date) || { date, solved: 0, target: 0 };
    current.solved += toNumber(record.solvedQuestions);
    current.target += toNumber(record.targetQuestions);
    grouped.set(date, current);
  });

  return [...grouped.values()]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-10)
    .map((item, index, list) => {
      const previous = index > 0 ? list[index - 1].solved : null;
      const delta = previous === null ? null : item.solved - previous;

      return {
        label: formatShortDate(item.date),
        value: item.solved,
        max: Math.max(40, item.target, item.solved),
        unit: "soru",
        delta,
        showDelta: true,
        tone: getDeltaTone(delta),
      };
    });
}

function getLessonStudyChartItems(studyRecords) {
  const grouped = new Map();

  studyRecords.forEach((record) => {
    const label = `${record.exam || "TYT"} ${record.lesson || "Ders yok"}`;
    const current = grouped.get(label) || { label, solved: 0, target: 0 };
    current.solved += toNumber(record.solvedQuestions);
    current.target += toNumber(record.targetQuestions);
    grouped.set(label, current);
  });

  return [...grouped.values()]
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 8)
    .map((item) => ({
      label: item.label,
      value: item.solved,
      max: Math.max(40, item.target, item.solved),
      unit: "soru",
    }));
}

function getExamOverview(exams) {
  if (!exams.length) {
    return { total: 0, latestNet: "0.0", latestLabel: "Kayıt yok", bestNet: "0.0", averageNet: "0.0" };
  }

  const sortedByDate = [...exams].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const latest = sortedByDate[0];
  const nets = exams.map((exam) => toNumber(exam.net || exam.tytNet || exam.aytNet));
  const best = Math.max(...nets);
  const average = nets.reduce((sum, net) => sum + net, 0) / nets.length;

  return {
    total: exams.length,
    latestNet: toNumber(latest.net || latest.tytNet || latest.aytNet).toFixed(1),
    latestLabel: latest.name || latest.examType || "Son deneme",
    bestNet: best.toFixed(1),
    averageNet: average.toFixed(1),
  };
}

function getExamTrendItems(exams) {
  const sorted = [...exams].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  return sorted.map((exam, index) => {
    const value = toNumber(exam.net || exam.tytNet || exam.aytNet);
    const previous = index > 0 ? toNumber(sorted[index - 1].net || sorted[index - 1].tytNet || sorted[index - 1].aytNet) : null;
    const delta = previous === null ? null : Number((value - previous).toFixed(2));

    return {
      label: exam.name,
      value,
      max: exam.examType === "TYT" ? 120 : 80,
      unit: "net",
      delta,
      showDelta: true,
      tone: getDeltaTone(delta),
    };
  });
}

function getExamSubjectTrendItems(exams) {
  const grouped = new Map();
  const sorted = [...exams].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  sorted.forEach((exam) => {
    (exam.sections || []).forEach((section) => {
      const net = toNumber(section.net ?? calculateNet(section.correct, section.wrong));
      const hasInput = toNumber(section.correct) + toNumber(section.wrong) > 0 || net > 0;
      if (!hasInput && net <= 0) return;

      const key = section.lesson || "Ders yok";
      const current = grouped.get(key) || { label: key, totalNet: 0, count: 0, max: 0, series: [] };
      current.totalNet += net;
      current.count += 1;
      current.max = Math.max(current.max, toNumber(section.questionCount || 40));
      current.series.push({
        examName: exam.name || exam.examType || "Deneme",
        net,
      });
      grouped.set(key, current);
    });
  });

  return [...grouped.values()]
    .map((item) => {
      const latest = item.series[item.series.length - 1] || null;
      const previous = item.series[item.series.length - 2] || null;
      const delta = latest && previous ? Number((latest.net - previous.net).toFixed(2)) : null;

      return {
        label: item.label,
        value: item.count > 0 ? item.totalNet / item.count : 0,
        latestNet: latest?.net ?? 0,
        previousNet: previous?.net ?? null,
        latestExamName: latest?.examName || "Son deneme",
        delta,
        tone: getDeltaTone(delta),
        max: Math.max(1, item.max),
        unit: "net",
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 9);
}

function getDeltaTone(delta) {
  if (delta === null || delta === undefined) return "neutral";
  if (delta > 0) return "positive";
  if (delta < 0) return "negative";
  return "flat";
}

function groupResourcesByExamAndLesson(resources) {
  const examMap = new Map();

  resources.forEach((resource) => {
    const { exam, lesson } = parseTaskLesson(resource.lesson);
    if (!examMap.has(exam)) {
      examMap.set(exam, { exam, lessons: new Map(), resources: [] });
    }

    const examGroup = examMap.get(exam);
    if (!examGroup.lessons.has(lesson)) {
      examGroup.lessons.set(lesson, { lesson, resources: [] });
    }

    examGroup.resources.push(resource);
    examGroup.lessons.get(lesson).resources.push(resource);
  });

  return [...examMap.values()]
    .map((examGroup) => {
      const lessons = [...examGroup.lessons.values()]
        .map((lessonGroup) => ({
          ...lessonGroup,
          averageProgress: getAverageResourceProgress(lessonGroup.resources),
        }))
        .sort((a, b) => a.lesson.localeCompare(b.lesson, "tr-TR"));

      return {
        exam: examGroup.exam,
        totalResources: examGroup.resources.length,
        averageProgress: getAverageResourceProgress(examGroup.resources),
        lessons,
      };
    })
    .sort((a, b) => getExamOrder(a.exam) - getExamOrder(b.exam));
}

function getResourceOverviewItems(resources) {
  const grouped = groupResourcesByExamAndLesson(resources);

  if (!grouped.length) {
    return [{ label: "Kaynak", value: 0, max: 100, unit: "%" }];
  }

  return grouped.map((group) => ({
    label: group.exam,
    value: group.averageProgress,
    max: 100,
    unit: "%",
  }));
}

function getAverageResourceProgress(resources) {
  if (!resources.length) return 0;
  return Math.round(resources.reduce((sum, resource) => sum + getResourceProgress(resource), 0) / resources.length);
}

function getExamOrder(exam) {
  const order = { TYT: 1, AYT: 2, "AYT-SAY": 2, "AYT-EA": 2, "AYT-SÖZ": 2, YDT: 3 };
  return order[exam] || 9;
}

function getHomeworkOverview(homeworks) {
  const total = homeworks.length;
  const completed = homeworks.filter((homework) => homework.status === "Tamamlandı" || homework.status === "Kontrol Edildi").length;
  const pending = Math.max(0, total - completed);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, completionRate };
}

function getHomeworkStatusChartItems(homeworks) {
  const statusOrder = ["Verildi", "Devam Ediyor", "Tamamlandı", "Kontrol Edildi", "Eksik"];
  const total = Math.max(1, homeworks.length);
  const counts = homeworks.reduce((result, homework) => {
    const status = homework.status || "Verildi";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  return statusOrder
    .filter((status) => counts[status])
    .map((status) => ({
      label: status,
      value: counts[status],
      max: total,
    }));
}


function getExamSelectOptions(exams) {
  return exams.map((exam, index) => ({
    value: getExamCompareId(exam, index),
    label: `${exam.date || "Tarih yok"} · ${exam.name || exam.examType || `Deneme ${index + 1}`}`,
  }));
}

function getExamCompareId(exam, index) {
  return String(exam.id || exam.name || `${exam.date || "no-date"}-${exam.examType || "exam"}-${index}`);
}

function getSelectedExam(exams, selectedId) {
  return exams.find((exam, index) => getExamCompareId(exam, index) === selectedId) || exams[0] || null;
}

function getExamComparison(exams, firstId, secondId) {
  if (!exams.length) return null;

  const first = getSelectedExam(exams, firstId);
  const second = getSelectedExam(exams, secondId) || first;
  if (!first || !second) return null;

  const firstNet = getExamNet(first);
  const secondNet = getExamNet(second);
  const delta = Number((secondNet - firstNet).toFixed(2));

  return {
    firstLabel: first.name || first.examType || "İlk deneme",
    secondLabel: second.name || second.examType || "Karşılaştırılan deneme",
    firstNet: firstNet.toFixed(1),
    secondNet: secondNet.toFixed(1),
    deltaLabel: formatDeltaValue(delta, "net"),
    deltaHint: delta > 0 ? "Gelişim var" : delta < 0 ? "Düşüş var" : "Değişim yok",
    totalItems: [
      {
        label: first.name || "İlk deneme",
        value: firstNet,
        max: getExamMaxNet(first),
        unit: "net",
      },
      {
        label: second.name || "Son deneme",
        value: secondNet,
        max: getExamMaxNet(second),
        unit: "net",
        delta,
        showDelta: true,
        tone: getDeltaTone(delta),
      },
    ],
    subjectItems: getExamSubjectComparisonItems(first, second),
  };
}

function getExamNet(exam) {
  return toNumber(exam.net ?? exam.tytNet ?? exam.aytNet);
}

function getExamMaxNet(exam) {
  if (exam.examType === "TYT") return 120;
  if (exam.examType === "YDT") return 80;
  if (String(exam.examType || "").startsWith("AYT")) return 80;
  return Math.max(80, getExamNet(exam), 120);
}

function getExamSubjectComparisonItems(first, second) {
  const firstMap = getExamSectionNetMap(first);
  const secondMap = getExamSectionNetMap(second);
  const lessonNames = [...new Set([...firstMap.keys(), ...secondMap.keys()])];

  return lessonNames.map((lesson) => {
    const firstNet = firstMap.get(lesson) || 0;
    const secondNet = secondMap.get(lesson) || 0;
    const delta = Number((secondNet - firstNet).toFixed(2));

    return {
      label: lesson,
      firstNet,
      secondNet,
      delta,
      tone: getDeltaTone(delta),
    };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function getExamSectionNetMap(exam) {
  const map = new Map();

  (exam.sections || []).forEach((section) => {
    const lesson = section.lesson || "Ders yok";
    const net = toNumber(section.net ?? calculateNet(section.correct, section.wrong));
    map.set(lesson, net);
  });

  return map;
}

function getWeeklyDateInfo(programStartDate, currentWeek) {
  const fallbackStart = new Date();
  const startDate = programStartDate ? new Date(`${programStartDate}T00:00:00`) : fallbackStart;
  if (Number.isNaN(startDate.getTime())) {
    return getWeeklyDateInfo(new Date().toISOString().slice(0, 10), currentWeek);
  }

  const mondayStart = getMondayOfWeek(startDate);
  const weekStart = new Date(mondayStart);
  weekStart.setDate(mondayStart.getDate() + (Math.max(1, Number(currentWeek || 1)) - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    startDate: weekStart,
    endDate: weekEnd,
    startLabel: formatShortDate(weekStart.toISOString().slice(0, 10)),
    endLabel: formatShortDate(weekEnd.toISOString().slice(0, 10)),
    rangeLabel: `${formatShortDate(weekStart.toISOString().slice(0, 10))} - ${formatShortDate(weekEnd.toISOString().slice(0, 10))}`,
  };
}

function getMondayOfWeek(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function getWeekDayDateLabel(weekStartDate, dayName) {
  const dayIndex = WEEK_DAYS.findIndex((day) => day === dayName);
  if (dayIndex < 0 || !(weekStartDate instanceof Date)) return "";
  const date = new Date(weekStartDate);
  date.setDate(weekStartDate.getDate() + dayIndex);
  return formatShortDate(date.toISOString().slice(0, 10));
}

function formatShortDate(value) {
  if (!value || value === "Tarih yok") return "Tarih yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatStudyDuration(duration) {
  const minutes = toNumber(duration);
  return minutes > 0 ? `${minutes} dk` : "Süre yok";
}

function formatMessageDate(value) {
  if (!value) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MetricBars({ items }) {
  return (
    <div className="metric-bars">
      {items.map((item) => (
        <div className="metric-bar" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{formatChartValue(item)}</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${getBarWidth(item)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ items, emptyText }) {
  if (!items.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${item.tone || ""}`} style={{ width: `${getBarWidth(item)}%` }} />
          </div>
          <strong>{formatChartValue(item)}</strong>
        </div>
      ))}
    </div>
  );
}

function SubjectTrendChart({ items, emptyText }) {
  if (!items.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  const maxDelta = Math.max(1, ...items.map((item) => Math.abs(toNumber(item.delta))));

  return (
    <div className="subject-trend-chart">
      {items.map((item) => (
        <div className="subject-trend-row" key={item.label}>
          <div className="subject-trend-name">
            <strong>{item.label}</strong>
            <small>{item.latestExamName}</small>
          </div>

          <div className="subject-average-bar">
            <span>Ortalama</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${getBarWidth(item)}%` }} />
            </div>
            <strong>{Number(item.value || 0).toFixed(1)}</strong>
          </div>

          <div className={`subject-delta-bar ${item.tone || "neutral"}`}>
            <span>Son değişim</span>
            <div className="delta-track">
              <div className="delta-fill" style={{ width: `${getDeltaBarWidth(item.delta, maxDelta)}%` }} />
            </div>
            <strong>{formatDeltaValue(item.delta, "net")}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}


function ExamComparisonChart({ items, emptyText }) {
  if (!items.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  const maxAbs = Math.max(1, ...items.map((item) => Math.abs(toNumber(item.delta))));

  return (
    <div className="exam-comparison-chart">
      {items.map((item) => (
        <div className={`exam-comparison-row ${item.tone}`} key={item.label}>
          <div className="exam-comparison-name">
            <strong>{item.label}</strong>
            <small>{item.firstNet.toFixed(1)} → {item.secondNet.toFixed(1)} net</small>
          </div>
          <div className="comparison-axis">
            <span className="axis-line" />
            <div
              className={`comparison-fill ${item.delta >= 0 ? "positive" : "negative"}`}
              style={{
                width: `${Math.min(100, Math.max(6, (Math.abs(item.delta) / maxAbs) * 100))}%`,
              }}
            />
          </div>
          <strong>{formatDeltaValue(item.delta, "net")}</strong>
        </div>
      ))}
    </div>
  );
}

function getBarWidth(item) {
  const max = Number(item.max || 100);
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (Number(item.value || 0) / max) * 100));
}

function getDeltaBarWidth(delta, maxDelta) {
  if (delta === null || delta === undefined || maxDelta <= 0) return 0;
  return Math.min(100, Math.max(4, (Math.abs(toNumber(delta)) / maxDelta) * 100));
}

function formatChartValue(item) {
  const value = Number(item.value || 0);
  const deltaText = item.showDelta && item.delta !== null && item.delta !== undefined
    ? ` ${formatDeltaValue(item.delta, item.unit)}`
    : "";
  if (item.unit === "%") return `%${value.toFixed(0)}${deltaText}`;
  if (item.unit === "net") return `${value.toFixed(1)}${deltaText}`;
  if (item.unit === "soru") return `${value.toFixed(0)} soru${deltaText}`;
  return value.toFixed(0);
}

function formatDeltaValue(delta, unit) {
  if (delta === null || delta === undefined) return "başlangıç";
  const value = toNumber(delta);
  if (value === 0) return "±0";
  const prefix = value > 0 ? "+" : "";
  if (unit === "soru") return `${prefix}${value.toFixed(0)}`;
  return `${prefix}${value.toFixed(1)}`;
}

function formatTopicPath(topic, subtopic) {
  return subtopic ? `${topic} / ${subtopic}` : topic;
}

function createWeeklyGridRows(tasks, periodCount) {
  const normalizedPeriodCount = Math.max(1, toNumber(periodCount));
  return WEEK_DAYS.flatMap((day) =>
    Array.from({ length: normalizedPeriodCount }, (_, index) => {
      const periodSlot = index + 1;
      const task = (tasks || []).find((item) => item.day === day && toNumber(item.periodSlot || 1) === periodSlot);
      return { day, periodSlot, task };
    })
  );
}

function findNextOpenPeriod(tasks, periodCount) {
  const normalizedPeriodCount = Math.max(1, toNumber(periodCount));
  for (const day of WEEK_DAYS) {
    for (let periodSlot = 1; periodSlot <= normalizedPeriodCount; periodSlot += 1) {
      const isTaken = (tasks || []).some((task) => task.day === day && toNumber(task.periodSlot || 1) === periodSlot);
      if (!isTaken) return { day, periodSlot };
    }
  }

  return { day: WEEK_DAYS[0], periodSlot: 1 };
}

function getCampLevel(camp) {
  const text = `${camp.title} ${camp.detail}`.toLocaleLowerCase("tr-TR");
  if (text.includes("temel") || text.includes("başlangıç")) return "Başlangıç";
  if (text.includes("tarama") || text.includes("ileri") || text.includes("final")) return "İleri";
  return "Orta";
}

function getVisibleCampItems(camps, selectedLevel) {
  const filtered = (camps || []).filter((camp) => getCampLevel(camp) === selectedLevel);
  return filtered.length > 0 ? filtered : camps;
}

function getCampTargetQuestions(camp) {
  const match = String(camp.detail || camp.title || "").match(/(\d+)\s*soru/i);
  return match ? Number(match[1]) : 25;
}

function getCampDuration(camp) {
  const text = String(camp.title || "");
  const weekMatch = text.match(/(\d+)\s*hafta/i);
  if (weekMatch) return Number(weekMatch[1]) * 5;
  const dayMatch = text.match(/(\d+)\s*gün/i);
  if (dayMatch) return Number(dayMatch[1]);
  return 20;
}

function ExamSectionChips({ sections }) {
  const visibleSections = (sections || []).filter((section) => {
    return toNumber(section.correct) + toNumber(section.wrong) > 0;
  });

  if (visibleSections.length === 0) return null;

  return (
    <div className="exam-section-chips">
      {visibleSections.map((section) => (
        <span key={section.lesson}>
          {section.lesson}: {calculateNet(section.correct, section.wrong).toFixed(2)}
        </span>
      ))}
    </div>
  );
}

function inferExamRecordType(examType) {
  if (examType === "TYT") return "TYT Denemesi";
  if (examType === "YDT") return "YDT Denemesi";
  return "AYT Denemesi";
}

function createExamSections(examType, existingSections = []) {
  const subjects = EXAM_SUBJECTS[examType] || EXAM_SUBJECTS.TYT;

  return subjects.map((lesson) => {
    const existingSection = existingSections.find((section) => section.lesson === lesson) || {};
    const questionCount = getSectionQuestionCount(examType, lesson);
    const correct = clampScore(existingSection.correct ?? "", questionCount);
    const wrong = clampScore(existingSection.wrong ?? "", questionCount - correct);
    const blank = calculateAutomaticBlank(questionCount, correct, wrong);

    return {
      lesson,
      questionCount,
      correct: existingSection.correct === undefined ? "" : String(correct),
      wrong: existingSection.wrong === undefined ? "" : String(wrong),
      blank: String(blank),
    };
  });
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

function clampScore(value, maxValue) {
  const max = Math.max(0, toNumber(maxValue));
  return Math.min(Math.max(0, toNumber(value)), max);
}

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export default StudentDashboard;
