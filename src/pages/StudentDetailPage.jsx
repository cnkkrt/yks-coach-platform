import { useMemo, useState } from "react";
import { DataHealthPanel } from "../components/DataHealthPanel.jsx";
import LearningLibrary from "../components/LearningLibrary.jsx";
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
import {
  EXAM_QUESTION_COUNTS,
  EXAM_SUBJECTS,
  WEEK_DAYS,
  studyRecordTypes,
  studyStatuses,
} from "../data/examConfig.js";

const emptyTaskForm = {
  day: "Pazartesi",
  periodSlot: "1",
  level: "Orta",
  lesson: "TYT Matematik",
  topic: "Temel Kavramlar",
  subtopic: "Sayı kümeleri",
  targetQuestions: "25",
  periodMinutes: "",
  task: "",
  status: "Bekliyor",
};

const emptyHomeworkForm = {
  title: "",
  lesson: "TYT Matematik",
  topic: "Temel Kavramlar",
  subtopic: "Sayı kümeleri",
  dueDate: "",
  description: "",
  status: "Verildi",
  feedback: "",
};

const emptyTopicForm = {
  exam: "TYT",
  lesson: "Matematik",
  topic: "Temel Kavramlar",
  subtopic: "Sayı kümeleri",
  status: "Başlanmadı",
  learningStatus: "Başlamadı",
  questionStatus: "Az",
  netStatus: "Ölçülmedi",
  errorType: "Yok",
  reviewDate: "",
  note: "",
};

const emptyResourceForm = {
  title: "",
  publisher: "",
  lesson: "TYT Matematik",
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






function createEmptyExamForm(examType = "TYT") {
  return {
    name: "",
    date: "",
    examType,
    sections: createExamSections(examType),
    note: "",
  };
}

function createEmptyStudyForm() {
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
    status: "Öğrenci Girdi",
    studentNote: "",
    coachNote: "",
    createdBy: "coach",
  };
}

const emptyErrorForm = {
  lesson: "TYT Matematik",
  topic: "Temel Kavramlar",
  subtopic: "Sayı kümeleri",
  type: "Bilgi Eksiği",
  count: "1",
  action: "",
  status: "Açık",
};

function StudentDetailPage({
  student,
  onBack,
  onLogout,
  onUpdateStudent,
  onAddWeeklyTask,
  onUpdateWeeklyTask,
  onApplyWeeklyTemplate,
  onDeleteWeeklyTask,
  onAddHomework,
  onUpdateHomework,
  onDeleteHomework,
  onAddTopicRecord,
  onUpdateTopicRecord,
  onDeleteTopicRecord,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onAddVideoPlaylist,
  onDeleteVideoPlaylist,
  onUpdateVideoProgress,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onAddErrorRecord,
  onUpdateErrorRecord,
  onDeleteErrorRecord,
  onAddStudyRecord,
  onUpdateStudyRecord,
  onDeleteStudyRecord,
  onAddMessage,
  theme,
  onToggleTheme,
}) {
  const exams = student.exams || [];
  const errors = student.errors || [];
  const studyRecords = student.studyRecords || [];
  const messages = student.messages || [];
  const tasks = student.weeklyTasks || [];
  const homeworks = student.homeworks || [];
  const topicTracking = student.topicTracking || [];
  const resources = student.resources || [];
  const videoPlaylists = student.videoPlaylists || [];
  const videoProgress = student.videoProgress || {};
  const lastExam = getLatestExam(exams) || { name: "Deneme kaydı yok", date: "Henüz girilmedi" };

  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const [homeworkForm, setHomeworkForm] = useState(emptyHomeworkForm);
  const [editingHomeworkId, setEditingHomeworkId] = useState(null);
  const [isHomeworkFormOpen, setIsHomeworkFormOpen] = useState(false);

  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);

  const [resourceForm, setResourceForm] = useState(emptyResourceForm);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);

  const [examForm, setExamForm] = useState(() => createEmptyExamForm());
  const [editingExamId, setEditingExamId] = useState(null);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);

  const [errorForm, setErrorForm] = useState(emptyErrorForm);
  const [editingErrorId, setEditingErrorId] = useState(null);
  const [isErrorFormOpen, setIsErrorFormOpen] = useState(false);
  const [studyForm, setStudyForm] = useState(() => createEmptyStudyForm());
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [isStudyFormOpen, setIsStudyFormOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ category: "Genel", text: "" });
  const [activeMenu, setActiveMenu] = useState("detail-overview");
  const [programForm, setProgramForm] = useState(() => ({
    area: student.area || student.scoreType || "EA",
    programStartDate: student.programStartDate || new Date().toISOString().slice(0, 10),
    programLevel: student.programLevel || "Orta",
    lessonLevels: student.lessonLevels || {},
    periodMode: student.periodMode || "4",
    customPeriodCount: String(student.customPeriodCount || 4),
  }));

  const homeworkStats = useMemo(() => {
    const total = homeworks.length;
    const completed = homeworks.filter(
      (homework) => homework.status === "Tamamlandı" || homework.status === "Kontrol Edildi"
    ).length;
    const missing = homeworks.filter((homework) => homework.status === "Eksik").length;
    const waiting = homeworks.filter((homework) => homework.status === "Verildi").length;

    return { total, completed, missing, waiting };
  }, [homeworks]);

  const topicStats = useMemo(() => {
    const total = topicTracking.length;
    const completed = topicTracking.filter((topicRecord) => topicRecord.status === "Tamamlandı").length;
    const inProgress = topicTracking.filter((topicRecord) =>
      topicRecord.status === "Devam Ediyor" ||
      topicRecord.status === "Konu anlatımı başladı" ||
      topicRecord.status === "Konu anlatımı bitti" ||
      topicRecord.status === "Temel test çözüldü" ||
      topicRecord.status === "Orta test çözüldü" ||
      topicRecord.status === "İleri test çözüldü" ||
      topicRecord.status === "Denemede ölçüldü"
    ).length;
    const needsReview = topicTracking.filter((topicRecord) =>
      topicRecord.status === "Tekrar Gerekli" ||
      topicRecord.status === "Tekrar gerekiyor" ||
      topicRecord.status === "Eksik var"
    ).length;

    return { total, completed, inProgress, needsReview };
  }, [topicTracking]);

  const resourceStats = useMemo(() => {
    const total = resources.length;
    const completed = resources.filter((resource) => resource.status === "Tamamlandı").length;
    const inProgress = resources.filter((resource) => resource.status === "Devam Ediyor").length;
    const planned = resources.filter((resource) => resource.status === "Planlandı").length;
    const totalUnits = resources.reduce((sum, resource) => sum + Number(resource.totalUnits || 0), 0);
    const completedUnits = resources.reduce((sum, resource) => sum + Number(resource.completedUnits || 0), 0);

    return { total, completed, inProgress, planned, totalUnits, completedUnits };
  }, [resources]);

  const examStats = useMemo(() => {
    const total = exams.length;
    const averageNet = total > 0
      ? exams.reduce((sum, exam) => sum + Number(exam.net || exam.tytNet || 0), 0) / total
      : 0;
    const bestExam = exams.reduce((best, exam) => {
      if (!best) return exam;
      return Number(exam.net || 0) > Number(best.net || 0) ? exam : best;
    }, null);

    return {
      total,
      averageNet,
      bestNet: bestExam ? Number(bestExam.net || bestExam.tytNet || 0) : 0,
    };
  }, [exams]);

  const errorStats = useMemo(() => {
    const total = errors.reduce((sum, error) => sum + Number(error.count || 0), 0);
    const open = errors.filter((error) => error.status !== "Çözüldü").length;
    const topError = errors.reduce((highest, error) => {
      if (!highest) return error;
      return Number(error.count || 0) > Number(highest.count || 0) ? error : highest;
    }, null);

    return { total, open, topError };
  }, [errors]);

  const studyStats = useMemo(() => {
    const total = studyRecords.length;
    const totalSolved = studyRecords.reduce((sum, record) => sum + toNumber(record.solvedQuestions), 0);
    const targetQuestions = studyRecords.reduce((sum, record) => sum + toNumber(record.targetQuestions), 0);
    const totalNet = studyRecords.reduce((sum, record) => sum + toNumber(record.net), 0);
    const checked = studyRecords.filter((record) => record.status === "Kontrol Edildi").length;
    const pending = studyRecords.filter((record) => record.status === "Öğrenci Girdi").length;
    const completionRate = targetQuestions > 0
      ? Math.min(100, Math.round((totalSolved / targetQuestions) * 100))
      : 0;

    return {
      total,
      totalSolved,
      totalNet,
      averageNet: total > 0 ? totalNet / total : 0,
      checked,
      pending,
      targetQuestions,
      completionRate,
    };
  }, [studyRecords]);

  const calculatedExamNet = useMemo(() => {
    return calculateExamTotals(examForm.sections).net;
  }, [examForm.sections]);
  const calculatedStudyBlank = calculateAutomaticBlank(
    toNumber(studyForm.solvedQuestions),
    toNumber(studyForm.correct),
    toNumber(studyForm.wrong)
  );
  const calculatedStudyNet = calculateNet(studyForm.correct, studyForm.wrong);
  const progressItems = [
    { label: "Kaynak", value: student.resourceProgress, max: 100, unit: "%" },
    { label: "Ödev", value: student.homeworkCompletion, max: 100, unit: "%" },
    { label: "Soru Hedefi", value: studyStats.completionRate, max: 100, unit: "%" },
    { label: "Hata Çözüm", value: getErrorResolutionPercent(errors), max: 100, unit: "%" },
  ];
  const examTrendItems = exams.map((exam) => ({
    label: exam.name,
    value: Number(exam.net || exam.tytNet || exam.aytNet || 0),
    max: exam.examType === "TYT" ? 120 : 80,
    unit: "net",
  }));
  const latestExam = exams.length > 0 ? exams[exams.length - 1] : null;
  const latestExamSectionItems = useMemo(() => {
    if (!latestExam || !Array.isArray(latestExam.sections)) return [];

    const maxNet = Math.max(5, ...latestExam.sections.map((section) => Number(calculateNet(section.correct, section.wrong) || 0)));

    return latestExam.sections.map((section) => ({
      label: section.lesson,
      value: Number(calculateNet(section.correct, section.wrong) || 0),
      max: maxNet,
      unit: "net",
    }));
  }, [latestExam]);
  const studyTrendItems = studyRecords.slice(0, 8).reverse().map((record) => ({
    label: `${record.date} ${record.lesson}`,
    value: Number(record.solvedQuestions || 0),
    max: Math.max(40, Number(record.targetQuestions || 0), Number(record.solvedQuestions || 0)),
    unit: "soru",
  }));
  const studyLessonItems = useMemo(() => {
    const totals = studyRecords.reduce((accumulator, record) => {
      const lesson = record.lesson || "Ders seçilmedi";
      accumulator[lesson] = (accumulator[lesson] || 0) + Number(record.solvedQuestions || 0);
      return accumulator;
    }, {});

    const maxValue = Math.max(40, ...Object.values(totals).map((value) => Number(value || 0)));

    return Object.entries(totals)
      .sort(([, a], [, b]) => Number(b || 0) - Number(a || 0))
      .map(([lesson, value]) => ({
        label: lesson,
        value: Number(value || 0),
        max: maxValue,
        unit: "soru",
      }));
  }, [studyRecords]);
  const detailedReport = useMemo(() => {
    return createDetailedCoachReportData({
      student,
      exams,
      studyRecords,
      tasks,
      homeworks,
      topicTracking,
      resources,
      errors,
    });
  }, [student, exams, studyRecords, tasks, homeworks, topicTracking, resources, errors]);
  const reportDate = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const reportItems = [
    { label: "Kaynak İlerlemesi", value: `%${student.resourceProgress}`, detail: `${resourceStats.completedUnits}/${resourceStats.totalUnits || 0} birim` },
    { label: "Ödev Tamamlama", value: `%${student.homeworkCompletion}`, detail: `${homeworkStats.completed}/${homeworkStats.total || 0} ödev tamamlandı` },
    { label: "Kaynak Durumu", value: `${resourceStats.completed}/${resourceStats.total || 0}`, detail: "kaynak tamamlandı" },
    { label: "Soru Çözümü", value: studyStats.totalSolved, detail: `${studyStats.total} günlük kayıt` },
    { label: "Deneme Ort.", value: examStats.averageNet.toFixed(1), detail: `${examStats.total} deneme kaydı` },
    { label: "Hata Çözümü", value: `%${getErrorResolutionPercent(errors)}`, detail: `${errorStats.open} açık hata kaydı` },
  ];
  const reportFocusItems = getReportFocusItems(tasks, homeworks, resources, errors);
  const reportStatus = getReportStatus(student, homeworkStats, errorStats);
  const coachReportText = createCoachReport(student, homeworkStats, topicStats, resourceStats, examStats, errorStats);
  const parentReportText = createParentReport(student, homeworkStats, topicStats, resourceStats, examStats, errorStats);
  const phaseInfo = getProgramPhase(student.programStartDate);
  const weeklyCompletion = getWeeklyTaskCompletion(tasks);
  const periodCount = resolvePeriodTarget(programForm.periodMode, programForm.customPeriodCount);
  const weeklyGridRows = createWeeklyGridRows(tasks, periodCount);
  const lessonLevelItems = getProgramLessonLevelItems(programForm.area || student.area || student.scoreType);

  const taskLessonOptions = useMemo(() => {
    return topicGroups.map((group) => formatTaskLesson(group.exam, group.lesson));
  }, []);

  const taskLessonInfo = useMemo(() => {
    return parseTaskLesson(taskForm.lesson);
  }, [taskForm.lesson]);

  const taskTopicOptions = useMemo(() => {
    return getTopicNames(taskLessonInfo.exam, taskLessonInfo.lesson);
  }, [taskLessonInfo.exam, taskLessonInfo.lesson]);

  const taskSubtopicOptions = useMemo(() => {
    return getSubtopicNames(taskLessonInfo.exam, taskLessonInfo.lesson, taskForm.topic);
  }, [taskLessonInfo.exam, taskLessonInfo.lesson, taskForm.topic]);

  const homeworkLessonInfo = useMemo(() => {
    return parseTaskLesson(homeworkForm.lesson);
  }, [homeworkForm.lesson]);

  const homeworkTopicOptions = useMemo(() => {
    return getTopicNames(homeworkLessonInfo.exam, homeworkLessonInfo.lesson);
  }, [homeworkLessonInfo.exam, homeworkLessonInfo.lesson]);

  const homeworkSubtopicOptions = useMemo(() => {
    return getSubtopicNames(homeworkLessonInfo.exam, homeworkLessonInfo.lesson, homeworkForm.topic);
  }, [homeworkLessonInfo.exam, homeworkLessonInfo.lesson, homeworkForm.topic]);

  const topicTopicOptions = useMemo(() => {
    return getTopicNames(topicForm.exam, topicForm.lesson);
  }, [topicForm.exam, topicForm.lesson]);

  const topicSubtopicOptions = useMemo(() => {
    return getSubtopicNames(topicForm.exam, topicForm.lesson, topicForm.topic);
  }, [topicForm.exam, topicForm.lesson, topicForm.topic]);

  const lessonOptions = useMemo(() => {
    return getLessonOptions(topicForm.exam);
  }, [topicForm.exam]);

  const resourceLessonInfo = useMemo(() => {
    return parseTaskLesson(resourceForm.lesson);
  }, [resourceForm.lesson]);

  const resourceTopicOptions = useMemo(() => {
    return getTopicNames(resourceLessonInfo.exam, resourceLessonInfo.lesson);
  }, [resourceLessonInfo.exam, resourceLessonInfo.lesson]);

  const resourceSubtopicOptions = useMemo(() => {
    return getSubtopicNames(resourceLessonInfo.exam, resourceLessonInfo.lesson, resourceForm.topic);
  }, [resourceLessonInfo.exam, resourceLessonInfo.lesson, resourceForm.topic]);

  const errorLessonInfo = useMemo(() => {
    return parseTaskLesson(errorForm.lesson);
  }, [errorForm.lesson]);

  const errorTopicOptions = useMemo(() => {
    return getTopicNames(errorLessonInfo.exam, errorLessonInfo.lesson);
  }, [errorLessonInfo.exam, errorLessonInfo.lesson]);

  const errorSubtopicOptions = useMemo(() => {
    return getSubtopicNames(errorLessonInfo.exam, errorLessonInfo.lesson, errorForm.topic);
  }, [errorLessonInfo.exam, errorLessonInfo.lesson, errorForm.topic]);

  const studyLessonOptions = useMemo(() => {
    return getLessonOptions(studyForm.exam);
  }, [studyForm.exam]);

  const studyTopicOptions = useMemo(() => {
    return getTopicNames(studyForm.exam, studyForm.lesson);
  }, [studyForm.exam, studyForm.lesson]);

  const studySubtopicOptions = useMemo(() => {
    return getSubtopicNames(studyForm.exam, studyForm.lesson, studyForm.topic);
  }, [studyForm.exam, studyForm.lesson, studyForm.topic]);

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "lesson") {
        const nextTopicForm = { ...nextForm, ...getFirstTopicSelectionForTaskLesson(value) };
        const recommendation = calculatePeriodRecommendation(nextTopicForm);
        return {
          ...nextTopicForm,
          targetQuestions: String(nextTopicForm.targetQuestions || recommendation.targetQuestions),
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      if (name === "topic") {
        const lessonInfo = parseTaskLesson(nextForm.lesson);
        const nextTopic = {
          ...nextForm,
          subtopic: getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, value),
        };
        const recommendation = calculatePeriodRecommendation(nextTopic);
        return {
          ...nextTopic,
          targetQuestions: String(nextTopic.targetQuestions || recommendation.targetQuestions),
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      if (name === "targetQuestions" || name === "level" || name === "lesson") {
        const recommendation = calculatePeriodRecommendation(nextForm);
        return {
          ...nextForm,
          periodMinutes: String(recommendation.periodMinutes),
        };
      }

      return nextForm;
    });
  };

  const handleHomeworkChange = (event) => {
    const { name, value } = event.target;
    setHomeworkForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelectionForTaskLesson(value) };
      }

      if (name === "topic") {
        const lessonInfo = parseTaskLesson(nextForm.lesson);
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, value),
        };
      }

      return nextForm;
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

  const handleResourceChange = (event) => {
    const { name, value } = event.target;
    setResourceForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelectionForTaskLesson(value) };
      }

      if (name === "topic") {
        const lessonInfo = parseTaskLesson(nextForm.lesson);
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, value),
        };
      }

      return nextForm;
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

  const handleErrorChange = (event) => {
    const { name, value } = event.target;
    setErrorForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === "lesson") {
        return { ...nextForm, ...getFirstTopicSelectionForTaskLesson(value) };
      }

      if (name === "topic") {
        const lessonInfo = parseTaskLesson(nextForm.lesson);
        return {
          ...nextForm,
          subtopic: getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, value),
        };
      }

      return nextForm;
    });
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

  const startNewTask = (defaults = {}) => {
    setEditingTaskId(null);
    setTaskForm({ ...emptyTaskForm, ...defaults });
    setIsTaskFormOpen(true);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      day: task.day || "Pazartesi",
      periodSlot: String(task.periodSlot || 1),
      level: task.level || "Orta",
      lesson: task.lesson || "TYT Matematik",
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
    setTaskForm(emptyTaskForm);
    setIsTaskFormOpen(false);
  };

  const handleTaskSubmit = (event) => {
    event.preventDefault();

    if (!taskForm.topic.trim() || !taskForm.task.trim()) {
      alert("Haftalık görev için konu ve görev açıklaması zorunludur.");
      return;
    }

    const payload = {
      day: taskForm.day,
      periodSlot: Math.max(1, toNumber(taskForm.periodSlot)),
      level: taskForm.level,
      lesson: taskForm.lesson,
      topic: taskForm.topic.trim(),
      subtopic: taskForm.subtopic.trim(),
      targetQuestions: Math.max(0, toNumber(taskForm.targetQuestions)),
      periodMinutes: Math.max(0, toNumber(taskForm.periodMinutes || calculatePeriodRecommendation(taskForm).periodMinutes)),
      task: taskForm.task.trim(),
      status: taskForm.status,
    };

    if (editingTaskId) {
      onUpdateWeeklyTask(student.id, { id: editingTaskId, ...payload });
    } else {
      onAddWeeklyTask(student.id, payload);
    }

    cancelTaskForm();
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
      createdBy: "coach",
    };

    onUpdateStudent({
      id: student.id,
      area: payload.area,
      programStartDate: payload.programStartDate,
      programLevel: payload.programLevel,
      lessonLevels: payload.lessonLevels,
      periodMode: payload.periodMode,
      customPeriodCount: payload.customPeriodCount,
    });
    onApplyWeeklyTemplate(student.id, payload);
  };

  const handleDeleteTask = (task) => {
    const isConfirmed = window.confirm(`${task.day} - ${task.topic} görevini silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteWeeklyTask(student.id, task.id);
    }
  };

  const handleAddCampToPlan = (camp) => {
    const lessonInfo = parseTaskLesson(camp.lesson);
    const topic = camp.topic || getFirstTopicSelection(lessonInfo.exam, lessonInfo.lesson).topic;
    const subtopic = getFirstSubtopic(lessonInfo.exam, lessonInfo.lesson, topic);
    const slot = findNextOpenPeriod(tasks, periodCount);
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

    onAddWeeklyTask(student.id, {
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
      generatedBy: "coach",
    });
  };

  const handleAddCampToResources = (camp) => {
    const lessonInfo = parseTaskLesson(camp.lesson);
    const topic = camp.topic || getFirstTopicSelection(lessonInfo.exam, lessonInfo.lesson).topic;

    onAddResource(student.id, {
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
      createdBy: "coach",
      updatedBy: "coach",
      updatedAt: new Date().toISOString(),
    });
  };

  const startNewHomework = () => {
    setEditingHomeworkId(null);
    setHomeworkForm(emptyHomeworkForm);
    setIsHomeworkFormOpen(true);
  };

  const startEditHomework = (homework) => {
    setEditingHomeworkId(homework.id);
    setHomeworkForm({
      title: homework.title || "",
      lesson: homework.lesson || "TYT Matematik",
      topic: homework.topic || "",
      subtopic: homework.subtopic || "",
      dueDate: homework.dueDate || "",
      description: homework.description || "",
      status: homework.status || "Verildi",
      feedback: homework.feedback || "",
    });
    setIsHomeworkFormOpen(true);
  };

  const cancelHomeworkForm = () => {
    setEditingHomeworkId(null);
    setHomeworkForm(emptyHomeworkForm);
    setIsHomeworkFormOpen(false);
  };

  const handleHomeworkSubmit = (event) => {
    event.preventDefault();

    if (!homeworkForm.title.trim() || !homeworkForm.topic.trim()) {
      alert("Ödev için başlık ve konu zorunludur.");
      return;
    }

    const payload = {
      title: homeworkForm.title.trim(),
      lesson: homeworkForm.lesson,
      topic: homeworkForm.topic.trim(),
      subtopic: homeworkForm.subtopic.trim(),
      dueDate: homeworkForm.dueDate,
      description: homeworkForm.description.trim(),
      status: homeworkForm.status,
      feedback: homeworkForm.feedback.trim(),
    };

    if (editingHomeworkId) {
      onUpdateHomework(student.id, { id: editingHomeworkId, ...payload });
    } else {
      onAddHomework(student.id, payload);
    }

    cancelHomeworkForm();
  };

  const handleDeleteHomework = (homework) => {
    const isConfirmed = window.confirm(`${homework.title} ödevini silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteHomework(student.id, homework.id);
    }
  };

  const startNewTopicRecord = () => {
    setEditingTopicId(null);
    setTopicForm(emptyTopicForm);
    setIsTopicFormOpen(true);
  };

  const startEditTopicRecord = (topicRecord) => {
    setEditingTopicId(topicRecord.id);
    setTopicForm({
      exam: topicRecord.exam || "TYT",
      lesson: topicRecord.lesson || "Matematik",
      topic: topicRecord.topic || "",
      subtopic: topicRecord.subtopic || "",
      status: topicRecord.status || "Başlanmadı",
      learningStatus: topicRecord.learningStatus || "Başlamadı",
      questionStatus: topicRecord.questionStatus || "Az",
      netStatus: topicRecord.netStatus || "Ölçülmedi",
      errorType: topicRecord.errorType || "Yok",
      reviewDate: topicRecord.reviewDate || "",
      note: topicRecord.note || "",
    });
    setIsTopicFormOpen(true);
  };

  const cancelTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm(emptyTopicForm);
    setIsTopicFormOpen(false);
  };

  const handleTopicSubmit = (event) => {
    event.preventDefault();

    if (!topicForm.topic.trim()) {
      alert("Konu takibi için konu adı zorunludur.");
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
      note: topicForm.note.trim(),
      updatedBy: "coach",
      updatedAt: new Date().toISOString(),
    };

    if (editingTopicId) {
      onUpdateTopicRecord(student.id, { id: editingTopicId, ...payload });
    } else {
      onAddTopicRecord(student.id, payload);
    }

    cancelTopicForm();
  };

  const handleDeleteTopicRecord = (topicRecord) => {
    const isConfirmed = window.confirm(`${topicRecord.exam} ${topicRecord.lesson} - ${topicRecord.topic} kaydını silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteTopicRecord(student.id, topicRecord.id);
    }
  };

  const startNewResource = () => {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
    setIsResourceFormOpen(true);
  };

  const startEditResource = (resource) => {
    setEditingResourceId(resource.id);
    setResourceForm({
      title: resource.title || "",
      publisher: resource.publisher || "",
      lesson: resource.lesson || "TYT Matematik",
      topic: resource.topic || "",
      subtopic: resource.subtopic || "",
      resourceType: resource.resourceType || "Soru Bankası",
      unitLabel: resource.unitLabel || "soru",
      totalUnits: String(resource.totalUnits ?? ""),
      completedUnits: String(resource.completedUnits ?? ""),
      status: resource.status || "Planlandı",
      dueDate: resource.dueDate || "",
      note: resource.note || "",
    });
    setIsResourceFormOpen(true);
  };

  const cancelResourceForm = () => {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
    setIsResourceFormOpen(false);
  };

  const handleResourceSubmit = (event) => {
    event.preventDefault();

    if (!resourceForm.title.trim()) {
      alert("Kaynak adı zorunludur.");
      return;
    }

    const totalUnits = Math.max(0, toNumber(resourceForm.totalUnits));
    const completedUnits = Math.min(Math.max(0, toNumber(resourceForm.completedUnits)), totalUnits || Infinity);
    const payload = {
      title: resourceForm.title.trim(),
      publisher: resourceForm.publisher.trim(),
      lesson: resourceForm.lesson,
      topic: resourceForm.topic.trim(),
      subtopic: resourceForm.subtopic.trim(),
      resourceType: resourceForm.resourceType,
      unitLabel: resourceForm.unitLabel,
      totalUnits,
      completedUnits,
      status: completedUnits >= totalUnits && totalUnits > 0 ? "Tamamlandı" : resourceForm.status,
      dueDate: resourceForm.dueDate,
      note: resourceForm.note.trim(),
    };

    if (editingResourceId) {
      onUpdateResource(student.id, { id: editingResourceId, ...payload });
    } else {
      onAddResource(student.id, payload);
    }

    cancelResourceForm();
  };

  const handleDeleteResource = (resource) => {
    const isConfirmed = window.confirm(`${resource.title} kaynağını silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteResource(student.id, resource.id);
    }
  };

  const startNewExam = () => {
    setEditingExamId(null);
    setExamForm(createEmptyExamForm());
    setIsExamFormOpen(true);
  };

  const startEditExam = (exam) => {
    const examType = exam.examType || "TYT";
    setEditingExamId(exam.id);
    setExamForm({
      name: exam.name || "",
      date: exam.date || "",
      examType,
      sections: createExamSections(examType, exam.sections || []),
      note: exam.note || "",
    });
    setIsExamFormOpen(true);
  };

  const cancelExamForm = () => {
    setEditingExamId(null);
    setExamForm(createEmptyExamForm());
    setIsExamFormOpen(false);
  };

  const handleExamSubmit = (event) => {
    event.preventDefault();

    if (!examForm.name.trim() || !examForm.date) {
      alert("Deneme adı ve tarih zorunludur.");
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
    const payload = {
      name: examForm.name.trim(),
      date: examForm.date,
      examType: examForm.examType,
      sections: normalizedSections,
      correct: totals.correct,
      wrong: totals.wrong,
      blank: totals.blank,
      net: totals.net,
      tytNet: examForm.examType === "TYT" ? totals.net : 0,
      aytNet: examForm.examType !== "TYT" ? totals.net : 0,
      note: examForm.note.trim(),
    };

    if (editingExamId) {
      onUpdateExam(student.id, { id: editingExamId, ...payload });
    } else {
      onAddExam(student.id, payload);
    }

    cancelExamForm();
  };

  const handleDeleteExam = (exam) => {
    const isConfirmed = window.confirm(`${exam.name} denemesini silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteExam(student.id, exam.id);
    }
  };

  const startNewErrorRecord = () => {
    setEditingErrorId(null);
    setErrorForm(emptyErrorForm);
    setIsErrorFormOpen(true);
  };

  const startEditErrorRecord = (error) => {
    setEditingErrorId(error.id);
    setErrorForm({
      lesson: error.lesson || "TYT Matematik",
      topic: error.topic || "",
      subtopic: error.subtopic || "",
      type: error.type || "Bilgi Eksiği",
      count: String(error.count || 1),
      action: error.action || "",
      status: error.status || "Açık",
    });
    setIsErrorFormOpen(true);
  };

  const cancelErrorForm = () => {
    setEditingErrorId(null);
    setErrorForm(emptyErrorForm);
    setIsErrorFormOpen(false);
  };

  const handleErrorSubmit = (event) => {
    event.preventDefault();

    if (!errorForm.lesson.trim() || !errorForm.type.trim()) {
      alert("Hata analizi için ders ve hata türü zorunludur.");
      return;
    }

    const payload = {
      lesson: errorForm.lesson.trim(),
      topic: errorForm.topic.trim(),
      subtopic: errorForm.subtopic.trim(),
      type: errorForm.type.trim(),
      count: Math.max(1, toNumber(errorForm.count)),
      action: errorForm.action.trim(),
      status: errorForm.status,
    };

    if (editingErrorId) {
      onUpdateErrorRecord(student.id, { id: editingErrorId, ...payload });
    } else {
      onAddErrorRecord(student.id, payload);
    }

    cancelErrorForm();
  };

  const handleDeleteErrorRecord = (error) => {
    const isConfirmed = window.confirm(`${error.lesson} - ${error.type} hata kaydını silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteErrorRecord(student.id, error.id);
    }
  };

  const startNewStudyRecord = () => {
    setEditingStudyId(null);
    setStudyForm(createEmptyStudyForm());
    setIsStudyFormOpen(true);
  };

  const startEditStudyRecord = (record) => {
    setEditingStudyId(record.id);
    setStudyForm({
      date: record.date || new Date().toISOString().slice(0, 10),
      recordType: record.recordType || "Günlük Soru Çözümü",
      exam: record.exam || "TYT",
      lesson: record.lesson || "Matematik",
      topic: record.topic || "",
      subtopic: record.subtopic || "",
      source: record.source || "",
      targetQuestions: String(record.targetQuestions ?? ""),
      solvedQuestions: String(record.solvedQuestions ?? ""),
      correct: String(record.correct ?? ""),
      wrong: String(record.wrong ?? ""),
      duration: String(record.duration ?? ""),
      status: record.status || "Öğrenci Girdi",
      studentNote: record.studentNote || "",
      coachNote: record.coachNote || "",
      createdBy: record.createdBy || "coach",
    });
    setIsStudyFormOpen(true);
  };

  const cancelStudyForm = () => {
    setEditingStudyId(null);
    setStudyForm(createEmptyStudyForm());
    setIsStudyFormOpen(false);
  };

  const handleStudySubmit = (event) => {
    event.preventDefault();

    if (!studyForm.date || !studyForm.topic.trim()) {
      alert("Günlük çalışma kaydı için tarih ve konu zorunludur.");
      return;
    }

    const solvedQuestions = Math.max(0, toNumber(studyForm.solvedQuestions));
    const correct = Math.min(Math.max(0, toNumber(studyForm.correct)), solvedQuestions || Infinity);
    const wrong = Math.min(Math.max(0, toNumber(studyForm.wrong)), Math.max(0, solvedQuestions - correct));
    const payload = {
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
      status: studyForm.status,
      studentNote: studyForm.studentNote.trim(),
      coachNote: studyForm.coachNote.trim(),
      createdBy: studyForm.createdBy || "coach",
    };

    if (editingStudyId) {
      onUpdateStudyRecord(student.id, { id: editingStudyId, ...payload });
    } else {
      onAddStudyRecord(student.id, payload);
    }

    cancelStudyForm();
  };

  const handleDeleteStudyRecord = (record) => {
    const isConfirmed = window.confirm(`${record.date} - ${record.lesson} çalışma kaydını silmek istiyor musun?`);

    if (isConfirmed) {
      onDeleteStudyRecord(student.id, record.id);
    }
  };

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    if (!messageForm.text.trim()) {
      alert("Mesaj metni boş olamaz.");
      return;
    }

    onAddMessage(student.id, {
      sender: "coach",
      senderName: "Koç",
      category: messageForm.category,
      text: messageForm.text.trim(),
    });
    setMessageForm({ category: "Genel", text: "" });
  };

  const handleMenuClick = (sectionId) => {
    setActiveMenu(sectionId);
    setTimeout(() => scrollToSection(sectionId), 0);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-mark">YK</div>
          <div>
            <strong>Öğrenci Detayı</strong>
            <small>{student.name}</small>
          </div>
        </div>

        <nav className="side-nav">
          <button className={activeMenu === "detail-overview" ? "active" : ""} onClick={() => handleMenuClick("detail-overview")}>Genel Bakış</button>
          <button className={activeMenu === "detail-weekly" ? "active" : ""} onClick={() => handleMenuClick("detail-weekly")}>Haftalık Planlama</button>
          <button className={activeMenu === "detail-exams" ? "active" : ""} onClick={() => handleMenuClick("detail-exams")}>Sınav / Test Takibi</button>
          <button className={activeMenu === "detail-resources" ? "active" : ""} onClick={() => handleMenuClick("detail-resources")}>Kaynaklar</button>
          <button className={activeMenu === "detail-videos" ? "active" : ""} onClick={() => handleMenuClick("detail-videos")}>Video Dersler</button>
          <button className={activeMenu === "detail-performance" ? "active" : ""} onClick={() => handleMenuClick("detail-performance")}>Performans</button>
          <button className={activeMenu === "detail-messages" ? "active" : ""} onClick={() => handleMenuClick("detail-messages")}>Mesajlar</button>
          <button className={activeMenu === "detail-reports" ? "active" : ""} onClick={() => handleMenuClick("detail-reports")}>Rapor / PDF</button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <button className="back-btn" onClick={onBack}>
              ← Koç Paneline Dön
            </button>
            <h1>{student.name}</h1>
            <p>
              {student.grade}. sınıf · {student.scoreType} · Hedef: {student.targetDepartment} / {student.targetUniversity}
            </p>
          </div>

          <span className={`risk-badge ${getRiskClass(student.riskLevel)}`}>
            {student.riskLevel} Risk
          </span>
          <button className="ghost-btn" onClick={() => downloadJsonBackup(student)}>
            JSON Yedek
          </button>
          <button className="theme-toggle" onClick={onToggleTheme}>
            <span className="theme-toggle-dot" />
            {theme === "dark" ? "Gündüz modu" : "Gece modu"}
          </button>
        </header>

        {activeMenu !== "detail-overview" && (
          <div className="active-section-toolbar">
            <button className="ghost-btn" onClick={() => handleMenuClick("detail-overview")}>
              Ana sayfaya dön
            </button>
          </div>
        )}

        <section className={`stats-grid menu-target ${activeMenu !== "detail-overview" ? "section-hidden" : ""}`} id="detail-overview">
          <div className="stat-card">
            <span>Son TYT Net</span>
            <strong>{student.lastTytNet}</strong>
            <small>{lastExam.name}</small>
          </div>

          <div className="stat-card">
            <span>Son AYT Net</span>
            <strong>{student.lastAytNet}</strong>
            <small>{lastExam.date}</small>
          </div>

          <div className="stat-card success">
            <span>Kaynak Tamamlanma</span>
            <strong>%{student.resourceProgress}</strong>
            <small>{resourceStats.completed}/{resourceStats.total || 0} kaynak tamamlandı</small>
          </div>

          <div className="stat-card">
            <span>Ödev Tamamlama</span>
            <strong>%{student.homeworkCompletion}</strong>
            <small>{homeworkStats.completed}/{homeworkStats.total || 0} tamamlandı</small>
          </div>

          <div className="stat-card">
            <span>9 Aylık Faz</span>
            <strong>{phaseInfo.currentWeek}. hafta</strong>
            <small>{phaseInfo.phase.label}</small>
          </div>
        </section>

        <section className={`analytics-board ${activeMenu !== "detail-overview" ? "section-hidden" : ""}`}>
          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>İlerleme Ölçümü</h2>
                <p>Kaynak, ödev ve hata çözüm durumunun karşılaştırmalı ölçümü.</p>
              </div>
            </div>
            <MetricBars items={progressItems} />
          </div>

          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>Deneme Bar Grafiği</h2>
                <p>Öğrencinin girilen denemelerdeki net gelişimi.</p>
              </div>
            </div>
            <BarChart items={examTrendItems} emptyText="Bu öğrenci için grafik oluşturacak deneme yok." />
          </div>

          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>Günlük Soru Grafiği</h2>
                <p>Öğrencinin günlük çözüm kayıtları ve hedefe yaklaşımı.</p>
              </div>
            </div>
            <BarChart items={studyTrendItems} emptyText="Günlük soru grafiği için kayıt yok." />
          </div>
        </section>

        <div className={activeMenu !== "detail-overview" ? "section-hidden" : ""}>
          <DataHealthPanel student={student} title="Senkron Omurgası ve Veri Sağlığı" />
        </div>

        <section className={`panel-card report-center print-report menu-target ${activeMenu !== "detail-reports" ? "section-hidden" : ""}`} id="detail-reports">
          <div className="section-head section-head-with-action">
            <div>
              <h2>Rapor Merkezi</h2>
              <p>Koç ve veli görüşmesi için hazır öğrenci gelişim özeti.</p>
            </div>
            <button className="yellow-btn compact-btn no-print" onClick={() => window.print()}>
              Yazdır / PDF
            </button>
          </div>

          <div className="report-hero">
            <div>
              <span>Öğrenci Raporu</span>
              <h3>{student.name}</h3>
              <p>{reportDate} · {student.grade}. sınıf · {student.scoreType}</p>
            </div>
            <strong className={`report-status ${getReportStatusClass(reportStatus)}`}>
              {reportStatus}
            </strong>
          </div>

          <div className="report-metrics">
            {reportItems.map((item) => (
              <div className="report-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </div>
            ))}
          </div>

          <div className="report-copy-grid">
            <div>
              <h3>Koç Değerlendirmesi</h3>
              <p>{coachReportText}</p>
            </div>
            <div>
              <h3>Veli Notu</h3>
              <p>{parentReportText}</p>
            </div>
          </div>

          <div className="report-focus">
            <h3>Bu Hafta Odak</h3>
            <ul>
              {reportFocusItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="coach-deep-report">
            <div className="section-head">
              <div>
                <h3>Olağanüstü Detaylı Koç Analizi</h3>
                <p>Deneme, ders, çalışma, hata, ödev, kaynak ve haftalık plan verileri tek raporda birleştirildi.</p>
              </div>
            </div>

            <div className="deep-report-grid">
              <article>
                <span>Deneme trendi</span>
                <strong>{detailedReport.examInsight}</strong>
                <small>{detailedReport.examAdvice}</small>
              </article>
              <article>
                <span>Çalışma temposu</span>
                <strong>{detailedReport.studyInsight}</strong>
                <small>{detailedReport.studyAdvice}</small>
              </article>
              <article>
                <span>Risk düzeyi</span>
                <strong>{detailedReport.riskLevel}</strong>
                <small>{detailedReport.riskReason}</small>
              </article>
              <article>
                <span>Koç aksiyonu</span>
                <strong>{detailedReport.primaryAction}</strong>
                <small>{detailedReport.primaryActionReason}</small>
              </article>
            </div>

            <div className="inline-chart-grid report-chart-grid">
              <div className="inline-chart-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Ders Bazlı Deneme Netleri</h3>
                    <p>Son denemelerin ders kırılımı.</p>
                  </div>
                </div>
                <BarChart items={detailedReport.subjectNetItems} emptyText="Ders bazlı deneme verisi yok." />
              </div>

              <div className="inline-chart-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Haftalık Plan Durumu</h3>
                    <p>Tamamlanan, devam eden, bekleyen ve eksik görevler.</p>
                  </div>
                </div>
                <BarChart items={detailedReport.weeklyStatusItems} emptyText="Haftalık plan verisi yok." />
              </div>

              <div className="inline-chart-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Hata Tipi Dağılımı</h3>
                    <p>Yanlışların ana sebep kümeleri.</p>
                  </div>
                </div>
                <BarChart items={detailedReport.errorTypeItems} emptyText="Hata kaydı yok." />
              </div>

              <div className="inline-chart-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Kaynak İlerlemesi</h3>
                    <p>Kaynak bazlı tamamlanma yüzdesi.</p>
                  </div>
                </div>
                <BarChart items={detailedReport.resourceProgressItems} emptyText="Kaynak ilerleme verisi yok." />
              </div>
            </div>

            <div className="report-table-wrap">
              <h3>Koç Gözlem Tablosu</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Durum</th>
                    <th>Kanıt</th>
                    <th>Önerilen Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedReport.observationRows.map((row) => (
                    <tr key={row.title}>
                      <td>{row.title}</td>
                      <td>{row.status}</td>
                      <td>{row.evidence}</td>
                      <td>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-focus detailed-focus">
              <h3>Önümüzdeki 7 Gün Koçluk Talimatı</h3>
              <ul>
                {detailedReport.nextSevenDayActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-weekly" ? "section-hidden" : ""}`} id="detail-study">
          <div className="section-head section-head-with-action">
            <div>
              <h2>Günlük Çalışma ve Soru Takibi</h2>
              <p>Öğrenci çözdüğünü girer; koç kontrol, eksik ve tekrar durumunu yönetir.</p>
            </div>
            <button className="yellow-btn compact-btn" onClick={startNewStudyRecord}>+ Çalışma Ekle</button>
          </div>

          {isStudyFormOpen && (
            <form className="mini-form study-form" onSubmit={handleStudySubmit}>
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
                Çalışma Türü
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
                  placeholder="Örn: 345 TYT Matematik"
                />
              </label>

              <label>
                Hedef Soru
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

              <label>
                Durum
                <select name="status" value={studyForm.status} onChange={handleStudyChange}>
                  {studyStatuses.map((status) => (
                    <option value={status} key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                Öğrenci Notu
                <textarea
                  name="studentNote"
                  value={studyForm.studentNote}
                  onChange={handleStudyChange}
                  placeholder="Öğrencinin çalışma sonrası kısa notu..."
                />
              </label>

              <label className="full-width">
                Koç Notu
                <textarea
                  name="coachNote"
                  value={studyForm.coachNote}
                  onChange={handleStudyChange}
                  placeholder="Kontrol, tekrar veya eksik notu..."
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="ghost-btn" onClick={cancelStudyForm}>Vazgeç</button>
                <button type="submit" className="yellow-btn">
                  {editingStudyId ? "Çalışmayı Güncelle" : "Çalışmayı Kaydet"}
                </button>
              </div>
            </form>
          )}

          <div className="topic-summary-strip study-summary-strip">
            <SummaryRow title="Toplam Kayıt" value={studyStats.total} />
            <SummaryRow title="Çözülen Soru" value={studyStats.totalSolved} />
            <SummaryRow title="Hedef Gerçekleşme" value={`%${studyStats.completionRate}`} />
            <SummaryRow title="Koç Kontrolü" value={`${studyStats.checked}/${studyStats.total || 0}`} />
          </div>

          <div className="inline-chart-grid">
            <div className="inline-chart-box">
              <div className="section-head compact-chart-head">
                <div>
                  <h3>Günlük Çalışma İlerleme Grafiği</h3>
                  <p>Son kayıtların çözülen soru bazlı bar görünümü.</p>
                </div>
              </div>
              <BarChart items={studyTrendItems} emptyText="Günlük çalışma grafiği için kayıt yok." />
            </div>

            <div className="inline-chart-box">
              <div className="section-head compact-chart-head">
                <div>
                  <h3>Ders Bazlı Soru Dağılımı</h3>
                  <p>Günlük çalışma kayıtlarında hangi derste kaç soru çözüldüğü.</p>
                </div>
              </div>
              <BarChart items={studyLessonItems} emptyText="Ders bazlı grafik için kayıt yok." />
            </div>
          </div>

          <div className="study-record-grid">
            {studyRecords.length > 0 ? studyRecords.map((record) => (
              <article className="study-record-card" key={record.id}>
                <div className="study-record-head">
                  <div>
                    <strong>{record.recordType}</strong>
                    <small>
                      {record.date} · {record.exam} {record.lesson} · {formatTopicPath(record.topic, record.subtopic)}
                    </small>
                    {record.source && <small>Kaynak: {record.source}</small>}
                  </div>
                  <span className={`status-badge ${getStudyStatusClass(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                <div className="study-metric-grid">
                  <span>Hedef <strong>{record.targetQuestions}</strong></span>
                  <span>Çözülen <strong>{record.solvedQuestions}</strong></span>
                  <span>D/Y/B <strong>{record.correct}/{record.wrong}/{record.blank}</strong></span>
                  <span>Net <strong>{Number(record.net || 0).toFixed(2)}</strong></span>
                  <span>Süre <strong>{formatStudyDuration(record.duration)}</strong></span>
                </div>

                {(record.studentNote || record.coachNote) && (
                  <div className="study-note-stack">
                    {record.studentNote && <p><b>Öğrenci:</b> {record.studentNote}</p>}
                    {record.coachNote && <p><b>Koç:</b> {record.coachNote}</p>}
                  </div>
                )}

                <div className="row-actions">
                  <button className="small-btn neutral" onClick={() => startEditStudyRecord(record)}>Düzenle</button>
                  <button className="small-btn danger-action" onClick={() => handleDeleteStudyRecord(record)}>Sil</button>
                </div>
              </article>
            )) : (
              <div className="empty-state">Bu öğrenci için günlük çalışma kaydı henüz girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`weekly-plan-layout menu-target ${activeMenu !== "detail-weekly" ? "section-hidden" : ""}`} id="detail-weekly">
          <div className="panel-card">
            <div className="section-head section-head-with-action">
              <div>
                <h2>Haftalık Plan Yönetimi</h2>
                <p>Alan, ders bazlı seviye ve günlük çalışma saatine göre tablo plan üret; koç ve öğrenci aynı kaydı görür.</p>
              </div>
              <button className="yellow-btn compact-btn" onClick={startNewTask}>+ Görev Ekle</button>
            </div>

            <form className="program-control-card" onSubmit={handleProgramSubmit}>
              <label>
                Öğrenci Alanı
                <select name="area" value={programForm.area} onChange={handleProgramChange}>
                  {programAreaOptions.map((area) => (
                    <option value={area.value} key={area.value}>{area.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Başlangıç Tarihi
                <input
                  type="date"
                  name="programStartDate"
                  value={programForm.programStartDate}
                  onChange={handleProgramChange}
                />
              </label>

              <label>
                Seviye
                <select name="programLevel" value={programForm.programLevel} onChange={handleProgramChange}>
                  {periodLevelOptions.map((level) => (
                    <option value={level} key={level}>{level}</option>
                  ))}
                </select>
              </label>

              <label>
                Günlük Çalışma Saati
                <select name="periodMode" value={programForm.periodMode} onChange={handleProgramChange}>
                  {periodModeOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              {programForm.periodMode === "custom" && (
                <label>
                  Özel Saat
                  <input
                    type="number"
                    min="1"
                    max="10"
                    name="customPeriodCount"
                    value={programForm.customPeriodCount}
                    onChange={handleProgramChange}
                  />
                </label>
              )}

              <button type="submit" className="yellow-btn">Otomatik Saatlik Plan Oluştur</button>
            </form>

            <div className="lesson-level-panel">
              <div>
                <h3>Ders Bazlı Seviye</h3>
                <p>Öğrenci matematikte başlangıç, Türkçede ileri olabilir; plan bu tabloya göre üretilir.</p>
              </div>
              <div className="lesson-level-grid">
                {lessonLevelItems.map((item) => (
                  <label key={item.key}>
                    {item.label}
                    <select
                      value={programForm.lessonLevels?.[item.key] || programForm.programLevel}
                      onChange={(event) => handleLessonLevelChange(item.key, event.target.value)}
                    >
                      {periodLevelOptions.map((level) => (
                        <option value={level} key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
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
              <p>{phaseInfo.phase.examFrequency} · {phaseInfo.phase.taskType}</p>
            </div>

            {isTaskFormOpen && (
              <form className="mini-form task-form" onSubmit={handleTaskSubmit}>
                <label>
                  Gün
                  <select name="day" value={taskForm.day} onChange={handleTaskChange}>
                    <option value="Pazartesi">Pazartesi</option>
                    <option value="Salı">Salı</option>
                    <option value="Çarşamba">Çarşamba</option>
                    <option value="Perşembe">Perşembe</option>
                    <option value="Cuma">Cuma</option>
                    <option value="Cumartesi">Cumartesi</option>
                    <option value="Pazar">Pazar</option>
                  </select>
                </label>

                <label>
                  Saat
                  <input
                    type="number"
                    min="1"
                    max="10"
                    name="periodSlot"
                    value={taskForm.periodSlot}
                    onChange={handleTaskChange}
                  />
                </label>

                <label>
                  Seviye
                  <select name="level" value={taskForm.level} onChange={handleTaskChange}>
                    {periodLevelOptions.map((level) => (
                      <option value={level} key={level}>{level}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Ders
                  <select name="lesson" value={taskForm.lesson} onChange={handleTaskChange}>
                    {mergeCurrentOption(taskLessonOptions, taskForm.lesson).map((lesson) => (
                      <option value={lesson} key={lesson}>{lesson}</option>
                    ))}
                  </select>
                </label>

                <label className="topic-field">
                  Konu
                  <select
                    name="topic"
                    value={taskForm.topic}
                    onChange={handleTaskChange}
                  >
                    <option value="">Konu seç</option>
                    {mergeCurrentOption(taskTopicOptions, taskForm.topic).map((topic) => (
                      <option value={topic} key={topic}>{topic}</option>
                    ))}
                  </select>
                </label>

                <label className="subtopic-field">
                  Alt Konu
                  <select
                    name="subtopic"
                    value={taskForm.subtopic}
                    onChange={handleTaskChange}
                    disabled={!taskForm.topic || taskSubtopicOptions.length === 0}
                  >
                    <option value="">
                      {taskForm.topic ? "Alt konu seç" : "Önce konu seç"}
                    </option>
                    {mergeCurrentOption(taskSubtopicOptions, taskForm.subtopic).map((subtopic) => (
                      <option value={subtopic} key={subtopic}>{subtopic}</option>
                    ))}
                  </select>
                </label>

                <SubtopicPicker
                  topic={taskForm.topic}
                  options={taskSubtopicOptions}
                  value={taskForm.subtopic}
                  onSelect={(subtopic) => setTaskForm((current) => ({ ...current, subtopic }))}
                />

                <label>
                  Durum
                  <select name="status" value={taskForm.status} onChange={handleTaskChange}>
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="Eksik">Eksik</option>
                  </select>
                </label>

                <label>
                  Hedef Soru
                  <input
                    type="number"
                    min="0"
                    name="targetQuestions"
                    value={taskForm.targetQuestions}
                    onChange={handleTaskChange}
                  />
                </label>

                <label>
                  Sistem Süresi
                  <input
                    type="number"
                    min="0"
                    name="periodMinutes"
                    value={taskForm.periodMinutes}
                    onChange={handleTaskChange}
                    placeholder="Otomatik"
                  />
                </label>

                <label className="full-width">
                  Görev Açıklaması
                  <input
                    name="task"
                    value={taskForm.task}
                    onChange={handleTaskChange}
                    placeholder="Örn: 40 soru çöz + yanlış analizi yap"
                  />
                </label>

                <div className="form-actions full-width">
                  <button type="button" className="ghost-btn" onClick={cancelTaskForm}>Vazgeç</button>
                  <button type="submit" className="yellow-btn">
                    {editingTaskId ? "Görevi Güncelle" : "Görevi Kaydet"}
                  </button>
                </div>
              </form>
            )}

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
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyGridRows.map((row) => {
                    const task = row.task;
                    return (
                      <tr className={row.periodSlot === 1 ? "day-start-row" : ""} key={`${row.day}-${row.periodSlot}`}>
                        {row.periodSlot === 1 && (
                          <td className="week-day-cell" rowSpan={periodCount}>
                            {row.day.toLocaleUpperCase("tr-TR")}
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
                          ) : <span className="empty-slot">Bu saat boş</span>}
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
                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                              {task.status}
                            </span>
                          ) : <span className="status-badge status-waiting">Boş</span>}
                        </td>
                        <td>
                          <div className="table-actions">
                            {task ? (
                              <>
                                <button className="small-btn neutral" onClick={() => startEditTask(task)}>Düzenle</button>
                                <button className="small-btn danger-action" onClick={() => handleDeleteTask(task)}>Sil</button>
                              </>
                            ) : (
                              <button className="small-btn neutral" onClick={() => startNewTask({ day: row.day, periodSlot: String(row.periodSlot) })}>Ekle</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-card">
            <div className="section-head">
              <div>
                <h2>Ödev Özeti</h2>
                <p>Ödevlerin tamamlanma ve eksik durum özeti.</p>
              </div>
            </div>

            <div className="summary-list">
              <SummaryRow title="Haftalık Plan" value={`%${weeklyCompletion}`} />
              <SummaryRow title="Toplam Ödev" value={homeworkStats.total} />
              <SummaryRow title="Tamamlanan" value={homeworkStats.completed} />
              <SummaryRow title="Bekleyen" value={homeworkStats.waiting} />
              <SummaryRow title="Eksik" value={homeworkStats.missing} danger />
            </div>

            <div className="note-box">{student.coachNote}</div>

            <div className="progress-group">
              <ProgressLine title="Kaynak Takibi" value={student.resourceProgress} />
              <ProgressLine title="Ödev Tamamlama" value={student.homeworkCompletion} />
              <ProgressLine title="Haftalık Plan" value={weeklyCompletion} />
            </div>
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-performance" ? "section-hidden" : ""}`} id="detail-performance">
          <div className="section-head section-head-with-action">
            <div>
              <h2>Performans ve Konu Analizi</h2>
              <p>Koç, öğrencinin konu durumlarını işaretler; genel yüzde otomatik hesaplanır.</p>
            </div>
            <button className="yellow-btn compact-btn" onClick={startNewTopicRecord}>+ Konu Ekle</button>
          </div>

          {isTopicFormOpen && (
            <form className="mini-form topic-form" onSubmit={handleTopicSubmit}>
              <label>
                Sınav
                <select name="exam" value={topicForm.exam} onChange={handleTopicChange}>
                  <option value="TYT">TYT</option>
                  <option value="AYT">AYT</option>
                </select>
              </label>

              <label>
                Ders
                <select name="lesson" value={topicForm.lesson} onChange={handleTopicChange}>
                  {mergeCurrentOption(lessonOptions, topicForm.lesson).map((lesson) => (
                    <option value={lesson} key={lesson}>{lesson}</option>
                  ))}
                </select>
              </label>

              <label className="topic-field">
                Konu
                <select
                  name="topic"
                  value={topicForm.topic}
                  onChange={handleTopicChange}
                >
                  <option value="">Konu seç</option>
                  {mergeCurrentOption(topicTopicOptions, topicForm.topic).map((topic) => (
                    <option value={topic} key={topic}>{topic}</option>
                  ))}
                </select>
              </label>

              <label className="subtopic-field">
                Alt Konu
                <select
                  name="subtopic"
                  value={topicForm.subtopic}
                  onChange={handleTopicChange}
                  disabled={!topicForm.topic || topicSubtopicOptions.length === 0}
                >
                  <option value="">
                    {topicForm.topic ? "Alt konu seç" : "Önce konu seç"}
                  </option>
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
                Durum
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
                Not
                <textarea
                  name="note"
                  value={topicForm.note}
                  onChange={handleTopicChange}
                  placeholder="Konuya özel takip notu..."
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="ghost-btn" onClick={cancelTopicForm}>Vazgeç</button>
                <button type="submit" className="yellow-btn">
                  {editingTopicId ? "Konuyu Güncelle" : "Konuyu Kaydet"}
                </button>
              </div>
            </form>
          )}

          <div className="topic-summary-strip">
            <SummaryRow title="Toplam Konu" value={topicStats.total} />
            <SummaryRow title="Tamamlanan" value={topicStats.completed} />
            <SummaryRow title="Devam Eden" value={topicStats.inProgress} />
            <SummaryRow title="Tekrar Gerekli" value={topicStats.needsReview} danger />
          </div>

          <div className="topic-grid">
            {topicTracking.length > 0 ? topicTracking.map((topicRecord) => {
              const readiness = calculateTopicReadiness(topicRecord);

              return (
                <article className="topic-card" key={topicRecord.id}>
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

                  <p>{topicRecord.note || "Takip notu girilmedi."}</p>
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

                  <div className="row-actions">
                    <button className="small-btn neutral" onClick={() => startEditTopicRecord(topicRecord)}>Düzenle</button>
                    <button className="small-btn danger-action" onClick={() => handleDeleteTopicRecord(topicRecord)}>Sil</button>
                  </div>
                </article>
              );
            }) : (
              <div className="empty-state">Bu öğrenci için konu takibi henüz girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-resources" ? "section-hidden" : ""}`} id="detail-resources">
          <div className="section-head section-head-with-action">
            <div>
              <h2>Kaynak Takibi</h2>
              <p>Kitap, soru bankası ve deneme kaynaklarının ilerlemesini takip et.</p>
            </div>
            <button className="yellow-btn compact-btn" onClick={startNewResource}>+ Kaynak Ekle</button>
          </div>

          {isResourceFormOpen && (
            <form className="mini-form resource-form" onSubmit={handleResourceSubmit}>
              <label>
                Kaynak Adı
                <input
                  name="title"
                  value={resourceForm.title}
                  onChange={handleResourceChange}
                  placeholder="Örn: 345 TYT Matematik"
                />
              </label>

              <label>
                Yayın
                <input
                  name="publisher"
                  value={resourceForm.publisher}
                  onChange={handleResourceChange}
                  placeholder="Örn: 345 Yayınları"
                />
              </label>

              <label>
                Ders
                <select name="lesson" value={resourceForm.lesson} onChange={handleResourceChange}>
                  {mergeCurrentOption(taskLessonOptions, resourceForm.lesson).map((lesson) => (
                    <option value={lesson} key={lesson}>{lesson}</option>
                  ))}
                </select>
              </label>

              <label className="topic-field">
                Konu
                <select name="topic" value={resourceForm.topic} onChange={handleResourceChange}>
                  <option value="">Konu seç</option>
                  {mergeCurrentOption(resourceTopicOptions, resourceForm.topic).map((topic) => (
                    <option value={topic} key={topic}>{topic}</option>
                  ))}
                </select>
              </label>

              <label className="subtopic-field">
                Alt Konu
                <select
                  name="subtopic"
                  value={resourceForm.subtopic}
                  onChange={handleResourceChange}
                  disabled={!resourceForm.topic || resourceSubtopicOptions.length === 0}
                >
                  <option value="">
                    {resourceForm.topic ? "Alt konu seç" : "Önce konu seç"}
                  </option>
                  {mergeCurrentOption(resourceSubtopicOptions, resourceForm.subtopic).map((subtopic) => (
                    <option value={subtopic} key={subtopic}>{subtopic}</option>
                  ))}
                </select>
              </label>

              <SubtopicPicker
                topic={resourceForm.topic}
                options={resourceSubtopicOptions}
                value={resourceForm.subtopic}
                onSelect={(subtopic) => setResourceForm((current) => ({ ...current, subtopic }))}
              />

              <label>
                Tür
                <select name="resourceType" value={resourceForm.resourceType} onChange={handleResourceChange}>
                  <option value="Soru Bankası">Soru Bankası</option>
                  <option value="Konu Anlatımı">Konu Anlatımı</option>
                  <option value="Deneme Kitabı">Deneme Kitabı</option>
                  <option value="Video Kamp">Video Kamp</option>
                  <option value="Fasikül">Fasikül</option>
                </select>
              </label>

              <label>
                Birim
                <select name="unitLabel" value={resourceForm.unitLabel} onChange={handleResourceChange}>
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
                  value={resourceForm.totalUnits}
                  onChange={handleResourceChange}
                  placeholder="0"
                />
              </label>

              <label>
                Tamamlanan
                <input
                  type="number"
                  min="0"
                  name="completedUnits"
                  value={resourceForm.completedUnits}
                  onChange={handleResourceChange}
                  placeholder="0"
                />
              </label>

              <label>
                Durum
                <select name="status" value={resourceForm.status} onChange={handleResourceChange}>
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
                  value={resourceForm.dueDate}
                  onChange={handleResourceChange}
                />
              </label>

              <label className="full-width">
                Not
                <textarea
                  name="note"
                  value={resourceForm.note}
                  onChange={handleResourceChange}
                  placeholder="Örn: Problemler bölümü bu hafta bitecek."
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="ghost-btn" onClick={cancelResourceForm}>Vazgeç</button>
                <button type="submit" className="yellow-btn">
                  {editingResourceId ? "Kaynağı Güncelle" : "Kaynağı Kaydet"}
                </button>
              </div>
            </form>
          )}

          <div className="topic-summary-strip">
            <SummaryRow title="Toplam Kaynak" value={resourceStats.total} />
            <SummaryRow title="Tamamlanan" value={resourceStats.completed} />
            <SummaryRow title="Devam Eden" value={resourceStats.inProgress} />
            <SummaryRow title="İlerleme" value={`%${student.resourceProgress}`} />
          </div>

          <div className="resource-grid">
            {resources.length > 0 ? resources.map((resource) => {
              const progress = getResourceProgress(resource);

              return (
                <article className="resource-card" key={resource.id}>
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

                  <ProgressLine title="Kaynak İlerlemesi" value={progress} />

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

                  <div className="row-actions">
                    <button className="small-btn neutral" onClick={() => startEditResource(resource)}>Düzenle</button>
                    <button className="small-btn danger-action" onClick={() => handleDeleteResource(resource)}>Sil</button>
                  </div>
                </article>
              );
            }) : (
              <div className="empty-state">Bu öğrenci için kaynak takibi henüz girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-resources" ? "section-hidden" : ""}`} id="detail-library">
          <div className="section-head">
            <div>
              <h2>Kaynak ve Video Kütüphanesi</h2>
              <p>MEBİ, EBA ve ders-seviye bazlı video bağlantıları ile kaynak ilerlemesi.</p>
            </div>
          </div>
          <LearningLibrary resources={resources} audience="coach" area={student.area || student.scoreType || "TYT"} />
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-videos" ? "section-hidden" : ""}`} id="detail-videos">
          <div className="section-head">
            <div>
              <h2>Video Dersler</h2>
              <p>Koç yeni YouTube listesini HTML/TXT olarak yükler; öğrencinin açılma sayısı ve izleme süresi koç tarafında da görünür.</p>
            </div>
          </div>
          <VideoLessons
            playlists={videoPlaylists}
            progress={videoProgress}
            audience="coach"
            onAddPlaylist={(playlistPayload) => onAddVideoPlaylist(student.id, playlistPayload)}
            onDeletePlaylist={(playlistId) => onDeleteVideoPlaylist(student.id, playlistId)}
            onUpdateProgress={(videoId, progressPayload) => onUpdateVideoProgress(student.id, videoId, progressPayload)}
          />
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-weekly" ? "section-hidden" : ""}`} id="detail-homeworks">
          <div className="section-head section-head-with-action">
            <div>
              <h2>Ödev Ver / Ödev Takibi</h2>
              <p>Koç ödev verir; öğrenci tamamlar; koç kontrol durumunu işaretler.</p>
            </div>
            <button className="yellow-btn compact-btn" onClick={startNewHomework}>+ Ödev Ekle</button>
          </div>

          {isHomeworkFormOpen && (
            <form className="mini-form homework-form" onSubmit={handleHomeworkSubmit}>
              <label>
                Ödev Başlığı
                <input
                  name="title"
                  value={homeworkForm.title}
                  onChange={handleHomeworkChange}
                  placeholder="Örn: Problemler karma test"
                />
              </label>

              <label>
                Ders
                <select name="lesson" value={homeworkForm.lesson} onChange={handleHomeworkChange}>
                  {mergeCurrentOption(taskLessonOptions, homeworkForm.lesson).map((lesson) => (
                    <option value={lesson} key={lesson}>{lesson}</option>
                  ))}
                </select>
              </label>

              <label className="topic-field">
                Konu
                <select name="topic" value={homeworkForm.topic} onChange={handleHomeworkChange}>
                  <option value="">Konu seç</option>
                  {mergeCurrentOption(homeworkTopicOptions, homeworkForm.topic).map((topic) => (
                    <option value={topic} key={topic}>{topic}</option>
                  ))}
                </select>
              </label>

              <label className="subtopic-field">
                Alt Konu
                <select
                  name="subtopic"
                  value={homeworkForm.subtopic}
                  onChange={handleHomeworkChange}
                  disabled={!homeworkForm.topic || homeworkSubtopicOptions.length === 0}
                >
                  <option value="">
                    {homeworkForm.topic ? "Alt konu seç" : "Önce konu seç"}
                  </option>
                  {mergeCurrentOption(homeworkSubtopicOptions, homeworkForm.subtopic).map((subtopic) => (
                    <option value={subtopic} key={subtopic}>{subtopic}</option>
                  ))}
                </select>
              </label>

              <SubtopicPicker
                topic={homeworkForm.topic}
                options={homeworkSubtopicOptions}
                value={homeworkForm.subtopic}
                onSelect={(subtopic) => setHomeworkForm((current) => ({ ...current, subtopic }))}
              />

              <label>
                Teslim Tarihi
                <input
                  type="date"
                  name="dueDate"
                  value={homeworkForm.dueDate}
                  onChange={handleHomeworkChange}
                />
              </label>

              <label>
                Durum
                <select name="status" value={homeworkForm.status} onChange={handleHomeworkChange}>
                  <option value="Verildi">Verildi</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Kontrol Edildi">Kontrol Edildi</option>
                  <option value="Eksik">Eksik</option>
                  <option value="Tekrar Verildi">Tekrar Verildi</option>
                </select>
              </label>

              <label className="full-width">
                Ödev Açıklaması
                <textarea
                  name="description"
                  value={homeworkForm.description}
                  onChange={handleHomeworkChange}
                  placeholder="Örn: MEBİ üzerinden 3 test çözülecek, yanlışlar deftere yazılacak."
                />
              </label>

              <label className="full-width">
                Koç Geri Bildirimi
                <textarea
                  name="feedback"
                  value={homeworkForm.feedback}
                  onChange={handleHomeworkChange}
                  placeholder="Kontrol sonrası not..."
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="ghost-btn" onClick={cancelHomeworkForm}>Vazgeç</button>
                <button type="submit" className="yellow-btn">
                  {editingHomeworkId ? "Ödevi Güncelle" : "Ödevi Kaydet"}
                </button>
              </div>
            </form>
          )}

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
                  {homework.studentNote && <span>Öğrenci notu: {homework.studentNote}</span>}
                  {homework.submittedAt && <span>Öğrenci girişi: {formatMessageDate(homework.submittedAt)}</span>}
                  {homework.feedback && <span>Geri bildirim: {homework.feedback}</span>}
                </div>

                <div className="row-actions">
                  <button className="small-btn neutral" onClick={() => startEditHomework(homework)}>Düzenle</button>
                  <button className="small-btn danger-action" onClick={() => handleDeleteHomework(homework)}>Sil</button>
                </div>
              </article>
            )) : (
              <div className="empty-state">Bu öğrenci için ödev kaydı henüz girilmedi.</div>
            )}
          </div>
        </section>

        <section className={`two-column analytics-section menu-target ${activeMenu !== "detail-exams" ? "section-hidden" : ""}`} id="detail-exams">
          <div className="panel-card">
            <div className="section-head section-head-with-action">
              <div>
                <h2>Deneme Net Girişi</h2>
                <p>Doğru ve yanlış gir; boş ve net otomatik hesaplansın.</p>
              </div>
              <button className="yellow-btn compact-btn" onClick={startNewExam}>+ Deneme Ekle</button>
            </div>

            {isExamFormOpen && (
              <form className="mini-form exam-form" onSubmit={handleExamSubmit}>
                <label>
                  Deneme Adı
                  <input
                    name="name"
                    value={examForm.name}
                    onChange={handleExamChange}
                    placeholder="Örn: TYT Genel Deneme 4"
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
                  Tür
                  <select name="examType" value={examForm.examType} onChange={handleExamChange}>
                    <option value="TYT">TYT</option>
                    <option value="AYT-SAY">AYT-SAY</option>
                    <option value="AYT-EA">AYT-EA</option>
                    <option value="AYT-SÖZ">AYT-SÖZ</option>
                    <option value="YDT">YDT</option>
                  </select>
                </label>

                <label>
                  Net
                  <input value={calculatedExamNet} readOnly />
                </label>

                <div className="exam-subject-table full-width">
                  <div className="exam-subject-title">
                    <strong>{examForm.examType} ders kırılımı</strong>
                    <span>Boş sayısı dersin soru adedinden otomatik hesaplanır.</span>
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
                        <small>{getSectionQuestionCount(examForm.examType, section.lesson)} soru</small>
                      </strong>
                      <input
                        type="number"
                        min="0"
                        max={getSectionQuestionCount(examForm.examType, section.lesson)}
                        value={section.correct}
                        onChange={(event) => handleExamSectionChange(section.lesson, "correct", event.target.value)}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        min="0"
                        max={getSectionQuestionCount(examForm.examType, section.lesson)}
                        value={section.wrong}
                        onChange={(event) => handleExamSectionChange(section.lesson, "wrong", event.target.value)}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        min="0"
                        value={calculateAutomaticBlank(
                          getSectionQuestionCount(examForm.examType, section.lesson),
                          section.correct,
                          section.wrong
                        )}
                        readOnly
                        placeholder="0"
                      />
                      <span>{calculateNet(section.correct, section.wrong).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <label className="full-width">
                  Deneme Notu
                  <textarea
                    name="note"
                    value={examForm.note}
                    onChange={handleExamChange}
                    placeholder="Süre, dikkat veya konu eksikleri..."
                  />
                </label>

                <div className="form-actions full-width">
                  <button type="button" className="ghost-btn" onClick={cancelExamForm}>Vazgeç</button>
                  <button type="submit" className="yellow-btn">
                    {editingExamId ? "Denemeyi Güncelle" : "Denemeyi Kaydet"}
                  </button>
                </div>
              </form>
            )}

            <div className="analytics-strip">
              <SummaryRow title="Deneme" value={examStats.total} />
              <SummaryRow title="Ortalama Net" value={examStats.averageNet.toFixed(1)} />
              <SummaryRow title="En İyi Net" value={examStats.bestNet.toFixed(1)} />
            </div>

            <div className="inline-chart-grid exam-chart-grid">
              <div className="inline-chart-box exam-progress-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Deneme İlerleme Grafiği</h3>
                    <p>Her denemenin neti bar grafik olarak gösterilir.</p>
                  </div>
                </div>
                <BarChart items={examTrendItems} emptyText="Bu öğrenci için grafik oluşturacak deneme yok." />
              </div>

              <div className="inline-chart-box exam-progress-box">
                <div className="section-head compact-chart-head">
                  <div>
                    <h3>Test Değerlendirme Bar Grafiği</h3>
                    <p>Son denemenin ders bazlı net dağılımı.</p>
                  </div>
                </div>
                <BarChart items={latestExamSectionItems} emptyText="Ders bazlı test değerlendirme grafiği için deneme yok." />
              </div>
            </div>

            <div className="exam-list">
              {exams.length > 0 ? exams.map((exam) => (
                <div className="exam-row" key={exam.id}>
                  <div>
                    <strong>{exam.name}</strong>
                    <small>{exam.date || "Tarih yok"} · {exam.examType}</small>
                    {exam.note && <small>{exam.note}</small>}
                    <ExamSectionChips sections={exam.sections} />
                  </div>

                  <div className="exam-metrics">
                    <span>D: {exam.correct}</span>
                    <span>Y: {exam.wrong}</span>
                    <span>B: {exam.blank}</span>
                    <strong>Net: {Number(exam.net || 0).toFixed(2)}</strong>
                  </div>

                  <div className="row-actions">
                    <button className="small-btn neutral" onClick={() => startEditExam(exam)}>Düzenle</button>
                    <button className="small-btn danger-action" onClick={() => handleDeleteExam(exam)}>Sil</button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">Bu öğrenci için deneme kaydı henüz girilmedi.</div>
              )}
            </div>
          </div>

          <div className="panel-card">
            <div className="section-head section-head-with-action">
              <div>
                <h2>Hata Analizi</h2>
                <p>Hata türünü, sayısını ve düzeltme aksiyonunu takip et.</p>
              </div>
              <button className="yellow-btn compact-btn" onClick={startNewErrorRecord}>+ Hata Ekle</button>
            </div>

            {isErrorFormOpen && (
              <form className="mini-form error-form" onSubmit={handleErrorSubmit}>
                <label>
                  Ders
                  <select name="lesson" value={errorForm.lesson} onChange={handleErrorChange}>
                    {mergeCurrentOption(taskLessonOptions, errorForm.lesson).map((lesson) => (
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
                    <option value="Bilgi Eksiği">Bilgi Eksiği</option>
                    <option value="İşlem Hatası">İşlem Hatası</option>
                    <option value="Dikkat Hatası">Dikkat Hatası</option>
                    <option value="Süre Yetmedi">Süre Yetmedi</option>
                    <option value="Boş Bırakma">Boş Bırakma</option>
                    <option value="Kavram Yanılgısı">Kavram Yanılgısı</option>
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

                <label className="full-width">
                  Aksiyon
                  <textarea
                    name="action"
                    value={errorForm.action}
                    onChange={handleErrorChange}
                    placeholder="Örn: Aynı konuda 20 soru + yanlış defteri"
                  />
                </label>

                <div className="form-actions full-width">
                  <button type="button" className="ghost-btn" onClick={cancelErrorForm}>Vazgeç</button>
                  <button type="submit" className="yellow-btn">
                    {editingErrorId ? "Hatayı Güncelle" : "Hatayı Kaydet"}
                  </button>
                </div>
              </form>
            )}

            <div className="analytics-strip">
              <SummaryRow title="Toplam Hata" value={errorStats.total} danger />
              <SummaryRow title="Açık Kayıt" value={errorStats.open} />
              <SummaryRow title="En Yoğun" value={errorStats.topError?.type || "-"} />
            </div>

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
                    <span>{error.count} hata</span>
                    <button className="small-btn neutral" onClick={() => startEditErrorRecord(error)}>Düzenle</button>
                    <button className="small-btn danger-action" onClick={() => handleDeleteErrorRecord(error)}>Sil</button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">Bu öğrenci için hata analizi henüz girilmedi.</div>
              )}
            </div>
          </div>
        </section>

        <section className={`panel-card wide-panel menu-target ${activeMenu !== "detail-messages" ? "section-hidden" : ""}`} id="detail-messages">
          <div className="section-head">
            <div>
              <h2>Koç - Öğrenci Mesajlaşma</h2>
              <p>Öğrencinin soruları ve koç yanıtları aynı konuşma akışında tutulur.</p>
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
                placeholder="Öğrenciye kısa, net bir takip mesajı yaz..."
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

function getReportFocusItems(tasks, homeworks, resources, errors) {
  const focusItems = [];
  const activeTask = tasks.find((task) => task.status !== "Tamamlandı");
  const missingHomework = homeworks.find((homework) => homework.status === "Eksik" || homework.status === "Tekrar Verildi");
  const activeResource = resources.find((resource) => resource.status === "Devam Ediyor" || resource.status === "Planlandı");
  const openError = errors.find((error) => error.status !== "Çözüldü");

  if (activeTask) {
    focusItems.push(`${activeTask.day}: ${activeTask.lesson} - ${formatTopicPath(activeTask.topic, activeTask.subtopic)}`);
  }

  if (missingHomework) {
    focusItems.push(`Ödev kontrolü: ${missingHomework.title}`);
  }

  if (activeResource) {
    focusItems.push(`Kaynak takibi: ${activeResource.title} (${getResourceProgress(activeResource)}%)`);
  }

  if (openError) {
    focusItems.push(`Hata analizi: ${openError.lesson} - ${formatTopicPath(openError.topic || "Konu yok", openError.subtopic)}`);
  }

  if (focusItems.length === 0) {
    focusItems.push("Mevcut çalışma ritmi korunacak; yeni haftada kaynak ilerlemesi ve deneme analizi izlenecek.");
  }

  return focusItems.slice(0, 5);
}

function getReportStatus(student, homeworkStats, errorStats) {
  if (student.riskLevel === "Yüksek" || homeworkStats.missing > 0 || errorStats.open >= 3) {
    return "Yakın Takip";
  }

  if (student.resourceProgress >= 70 && student.homeworkCompletion >= 70 && errorStats.open === 0) {
    return "İyi İlerleme";
  }

  return "Dengeli Takip";
}

function getReportStatusClass(status) {
  if (status === "Yakın Takip") return "report-watch";
  if (status === "İyi İlerleme") return "report-good";
  return "report-steady";
}

function createCoachReport(student, homeworkStats, topicStats, resourceStats, examStats, errorStats) {
  const examText = examStats.total > 0
    ? `Deneme ortalaması ${examStats.averageNet.toFixed(1)} net seviyesinde.`
    : "Henüz deneme kaydı olmadığı için net trendi izlenemiyor.";
  const resourceText = resourceStats.total > 0
    ? `Kaynak ilerlemesi %${student.resourceProgress} düzeyinde.`
    : "Kaynak takibi henüz başlatılmamış.";

  return `${student.name} için kaynak ilerlemesi %${student.resourceProgress}, ödev tamamlama %${student.homeworkCompletion}. ${resourceStats.inProgress} kaynak devam ediyor, ${homeworkStats.missing} eksik ödev ve ${errorStats.open} açık hata kaydı var. ${examText} ${resourceText}`;
}

function createParentReport(student, homeworkStats, topicStats, resourceStats, examStats, errorStats) {
  const supportText = homeworkStats.missing > 0 || errorStats.open > 0
    ? "Bu hafta evde kısa ama düzenli tekrar ve yanlış analizi desteği önemli."
    : "Bu hafta mevcut düzen korunursa ilerleme sağlıklı şekilde devam eder.";
  const examText = examStats.total > 0
    ? `Son denemeler öğrencinin net takibini görünür hale getiriyor.`
    : "Deneme kaydı eklendikçe gelişim daha net izlenecek.";

  return `${student.name} genel olarak %${student.resourceProgress} kaynak ilerlemesine sahip. ${resourceStats.completed} kaynak tamamlandı, ${homeworkStats.completed} ödev bitirildi. ${examText} ${supportText}`;
}

function SummaryRow({ title, value, danger }) {
  return (
    <div className={`summary-row ${danger ? "summary-danger" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProgressLine({ title, value }) {
  return (
    <div className="progress-line">
      <div>
        <span>{title}</span>
        <strong>%{value}</strong>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
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


function createDetailedCoachReportData({
  student,
  exams,
  studyRecords,
  tasks,
  homeworks,
  topicTracking,
  resources,
  errors,
}) {
  const latestExam = exams[exams.length - 1] || null;
  const previousExam = exams[exams.length - 2] || null;
  const latestNet = latestExam ? toNumber(latestExam.net || latestExam.tytNet || latestExam.aytNet) : 0;
  const previousNet = previousExam ? toNumber(previousExam.net || previousExam.tytNet || previousExam.aytNet) : 0;
  const netDelta = latestExam && previousExam ? latestNet - previousNet : 0;
  const totalSolved = studyRecords.reduce((sum, record) => sum + toNumber(record.solvedQuestions), 0);
  const weeklyCompleted = tasks.filter((task) => task.status === "Tamamlandı").length;
  const weeklyOpen = tasks.filter((task) => task.status !== "Tamamlandı").length;
  const homeworkMissing = homeworks.filter((homework) => homework.status === "Eksik").length;
  const openErrors = errors.filter((error) => error.status !== "Çözüldü").length;
  const unresolvedErrorCount = errors
    .filter((error) => error.status !== "Çözüldü")
    .reduce((sum, error) => sum + toNumber(error.count || 1), 0);
  const resourceAverage = resources.length
    ? Math.round(resources.reduce((sum, resource) => sum + getResourceProgressPercent(resource), 0) / resources.length)
    : 0;
  const weakTopics = topicTracking.filter((topic) =>
    ["Tekrar Gerekli", "Tekrar gerekiyor", "Eksik var"].includes(topic.status) ||
    ["Zayıf", "Çok zayıf"].includes(topic.netStatus)
  );

  const subjectTotals = {};
  exams.forEach((exam) => {
    (exam.sections || []).forEach((section) => {
      const lesson = section.lesson || "Ders";
      if (!subjectTotals[lesson]) subjectTotals[lesson] = { total: 0, count: 0 };
      subjectTotals[lesson].total += toNumber(section.net ?? calculateNet(section.correct, section.wrong));
      subjectTotals[lesson].count += 1;
    });
  });
  const subjectMax = Math.max(5, ...Object.values(subjectTotals).map((item) => item.total / Math.max(1, item.count)));
  const subjectNetItems = Object.entries(subjectTotals)
    .map(([label, item]) => ({
      label,
      value: Number((item.total / Math.max(1, item.count)).toFixed(1)),
      max: subjectMax,
      unit: "net",
    }))
    .sort((a, b) => b.value - a.value);

  const weeklyStatusCounts = tasks.reduce((accumulator, task) => {
    const status = task.status || "Bekliyor";
    accumulator[status] = (accumulator[status] || 0) + 1;
    return accumulator;
  }, {});
  const weeklyMax = Math.max(1, ...Object.values(weeklyStatusCounts));
  const weeklyStatusItems = Object.entries(weeklyStatusCounts).map(([label, value]) => ({
    label,
    value,
    max: weeklyMax,
    unit: "görev",
  }));

  const errorCounts = errors.reduce((accumulator, error) => {
    const type = error.type || "Belirtilmedi";
    accumulator[type] = (accumulator[type] || 0) + toNumber(error.count || 1);
    return accumulator;
  }, {});
  const errorMax = Math.max(1, ...Object.values(errorCounts));
  const errorTypeItems = Object.entries(errorCounts)
    .map(([label, value]) => ({ label, value, max: errorMax, unit: "hata" }))
    .sort((a, b) => b.value - a.value);

  const resourceProgressItems = resources
    .map((resource) => ({
      label: resource.name || resource.title || resource.lesson || "Kaynak",
      value: getResourceProgressPercent(resource),
      max: 100,
      unit: "%",
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 10);

  const riskScore =
    (weeklyOpen >= 8 ? 2 : weeklyOpen >= 4 ? 1 : 0) +
    (homeworkMissing >= 3 ? 2 : homeworkMissing > 0 ? 1 : 0) +
    (unresolvedErrorCount >= 10 ? 2 : unresolvedErrorCount >= 4 ? 1 : 0) +
    (netDelta < -5 ? 2 : netDelta < 0 ? 1 : 0) +
    (resourceAverage < 35 ? 1 : 0);

  const riskLevel = riskScore >= 5 ? "Yüksek risk" : riskScore >= 3 ? "Orta risk" : "Kontrollü ilerliyor";
  const riskReason = `${weeklyOpen} açık görev · ${homeworkMissing} eksik ödev · ${unresolvedErrorCount} açık hata · son net farkı ${formatSignedNumber(netDelta)}.`;

  const examInsight = latestExam
    ? `${latestExam.name}: ${latestNet.toFixed(1)} net`
    : "Deneme kaydı yok";
  const examAdvice = latestExam && previousExam
    ? `Önceki denemeye göre ${formatSignedNumber(netDelta)} net. ${netDelta >= 0 ? "Ritim korunmalı, zayıf dersler hedeflenmeli." : "Son düşüşün dersi ve hata tipi hemen analiz edilmeli."}`
    : "Karşılaştırmalı yorum için en az iki deneme girilmeli.";
  const studyInsight = `${totalSolved} soru · ${studyRecords.length} çalışma kaydı`;
  const studyAdvice = studyRecords.length
    ? `Ortalama kayıt başına ${Math.round(totalSolved / Math.max(1, studyRecords.length))} soru. Günlük düzen korunmalı.`
    : "Öğrenci günlük çalışma kaydı girmeye başlatılmalı.";
  const primaryAction = riskScore >= 5
    ? "Acil toparlama görüşmesi"
    : weakTopics.length
      ? "Zayıf konu kapatma sprinti"
      : openErrors
        ? "Yanlış analizi seansı"
        : "Deneme ritmini artır";
  const primaryActionReason = riskScore >= 5
    ? "Birden fazla takip göstergesi aynı anda alarm veriyor."
    : weakTopics.length
      ? `${weakTopics.length} konu tekrar veya eksik işaretli.`
      : openErrors
        ? `${openErrors} açık yanlış kaydı var.`
        : "Temel takip göstergeleri stabil.";

  const observationRows = [
    {
      title: "Deneme performansı",
      status: latestExam ? `${latestNet.toFixed(1)} net` : "Eksik veri",
      evidence: latestExam && previousExam ? `${previousExam.name} → ${latestExam.name}: ${formatSignedNumber(netDelta)} net` : "Karşılaştırma için en az iki deneme gerekli",
      action: netDelta < 0 ? "Son denemedeki düşen dersleri 48 saat içinde analiz et" : "Artan derslerde kaynak seviyesini yükselt",
    },
    {
      title: "Haftalık plan disiplini",
      status: `${weeklyCompleted}/${tasks.length || 0} görev tamamlandı`,
      evidence: `${weeklyOpen} görev açık`,
      action: weeklyOpen > 0 ? "Açık görevleri önem sırasına göre yeniden sırala" : "Yeni haftaya seviye artırarak geç",
    },
    {
      title: "Hata kapatma",
      status: `${unresolvedErrorCount} açık hata`,
      evidence: errorTypeItems[0] ? `En yoğun hata: ${errorTypeItems[0].label}` : "Hata kaydı yok",
      action: unresolvedErrorCount ? "Yanlış defteri + benzer soru paketi oluştur" : "Hata kaydı alışkanlığını sürdür",
    },
    {
      title: "Kaynak ilerlemesi",
      status: `%${resourceAverage} ortalama`,
      evidence: `${resources.length} kaynak takipte`,
      action: resourceAverage < 50 ? "Yarım kalan kaynakları azalt, tek ana kaynak seç" : "Tamamlanan kaynaklardan branş denemesine geç",
    },
    {
      title: "Konu hakimiyeti",
      status: `${weakTopics.length} zayıf/tekrar konusu`,
      evidence: `${topicTracking.length} konu takibi`,
      action: weakTopics.length ? "Zayıf konuları 3 günlük mikro plana bağla" : "Konu takibine yeni ölçme denemeleri ekle",
    },
  ];

  const nextSevenDayActions = [
    "1. gün: Son denemede net düşüren ilk iki dersi belirle ve yanlış tiplerini ayır.",
    "2. gün: En yüksek hata tipine göre 40 soruluk hedefli tekrar çalışması ver.",
    "3. gün: Açık haftalık görevleri tamamlandı / eksik / devreden olarak netleştir.",
    "4. gün: Bir TYT genel denemesi veya branş denemesi uygula.",
    "5. gün: Deneme sonrası 24 saat içinde yanlış kapatma oturumu yap.",
    "6. gün: Kaynak ilerlemesi düşük olan tek kaynağı seçip bitirme hedefi koy.",
    "7. gün: Veli/öğrenci mini raporunu PDF olarak paylaş ve yeni hafta hedefini kilitle.",
  ];

  return {
    examInsight,
    examAdvice,
    studyInsight,
    studyAdvice,
    riskLevel,
    riskReason,
    primaryAction,
    primaryActionReason,
    subjectNetItems,
    weeklyStatusItems,
    errorTypeItems,
    resourceProgressItems,
    observationRows,
    nextSevenDayActions,
  };
}

function getResourceProgressPercent(resource) {
  const explicit = toNumber(resource.progress ?? resource.progressPercent);
  if (explicit > 0) return Math.min(100, Math.round(explicit));
  const totalUnits = toNumber(resource.totalUnits);
  const completedUnits = toNumber(resource.completedUnits);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((completedUnits / totalUnits) * 100));
}

function formatSignedNumber(value) {
  const number = Number(value || 0);
  if (number > 0) return `+${number.toFixed(1)}`;
  return number.toFixed(1);
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
            <div className="bar-fill" style={{ width: `${getBarWidth(item)}%` }} />
          </div>
          <strong>{formatChartValue(item)}</strong>
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

function formatChartValue(item) {
  const value = Number(item.value || 0);
  if (item.unit === "%") return `%${value.toFixed(0)}`;
  if (item.unit === "net") return value.toFixed(1);
  if (item.unit === "soru") return `${value.toFixed(0)} soru`;
  return value.toFixed(0);
}

function getErrorResolutionPercent(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return 0;
  const resolvedCount = errors.filter((error) => error.status === "Çözüldü").length;
  return Math.round((resolvedCount / errors.length) * 100);
}

function getFirstTopicSelectionForTaskLesson(lessonValue) {
  const lessonInfo = parseTaskLesson(lessonValue);
  return getFirstTopicSelection(lessonInfo.exam, lessonInfo.lesson);
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

  const [exam, ...lessonParts] = lessonValue.split(" ");
  const lesson = lessonParts.join(" ");

  if (lessonValue === "Dil") {
    return { exam: "YDT", lesson: "Yabancı Dil" };
  }

  const legacyLessonMatch = topicGroups.find((group) => group.lesson === lessonValue);
  if (legacyLessonMatch) {
    return { exam: legacyLessonMatch.exam, lesson: legacyLessonMatch.lesson };
  }

  return {
    exam: exam || "TYT",
    lesson: lesson || "Matematik",
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

function getRiskClass(riskLevel) {
  if (riskLevel === "Yüksek") return "risk-high";
  if (riskLevel === "Orta") return "risk-mid";
  return "risk-low";
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

function calculateNet(correct, wrong) {
  return Math.max(0, Number((toNumber(correct) - toNumber(wrong) / 4).toFixed(2)));
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

function getResourceProgress(resource) {
  const totalUnits = toNumber(resource.totalUnits);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((toNumber(resource.completedUnits) / totalUnits) * 100));
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

export default StudentDetailPage;
