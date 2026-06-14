export const guidePackages = [
  {
    id: "tyt",
    label: "TYT Dijital Paket",
    area: "TYT",
    sourceFile: "23-24 Dijital Paket TYT.pdf",
    usage:
      "TYT öğrencileri için konu sırası, seviye bazlı çalışma süresi, kaynak-deneme incelemesi ve kanal önerisi mantığı.",
  },
  {
    id: "say",
    label: "Sayısal Dijital Paket",
    area: "SAY",
    sourceFile: "23-24 Dijital Paket Sayısal.pdf",
    usage:
      "Sayısal öğrencilerde TYT temel + AYT matematik/fen konu sırası ve kaynak zorluk/ÖSYM uyumu için kullanılır.",
  },
  {
    id: "ea",
    label: "Eşit Ağırlık Dijital Paket",
    area: "EA",
    sourceFile: "23-24 Dijital Paket Eşit Ağırlık (1).pdf",
    usage:
      "EA öğrencilerde TYT temel + AYT matematik/edebiyat-sosyal sırası ve kaynak/kanal seçimi için kullanılır.",
  },
];

export const guideStudyDurations = [
  duration("TYT", "Türkçe", "Sözcükte Anlam", "5s", "2s 45dk", "1s"),
  duration("TYT", "Türkçe", "Cümlede Anlam", "6s", "4s", "2s 15dk"),
  duration("TYT", "Türkçe", "Paragraf", "10s 30dk", "6s", "2s 30dk"),
  duration("TYT", "Türkçe", "Ses Bilgisi", "4s 30dk", "2s 15dk", "1s"),
  duration("TYT", "Türkçe", "Yazım Kuralları", "5s 15dk", "3s", "1s 45dk"),
  duration("TYT", "Türkçe", "Noktalama İşaretleri", "4s", "2s 30dk", "1s 15dk"),
  duration("TYT", "Geometri", "Doğruda Açılar", "3s", "2s", "1s 15dk"),
  duration("TYT", "Geometri", "Üçgende Açılar", "4s 30dk", "3s 15dk", "2s 15dk"),
  duration("TYT", "Geometri", "Dik Üçgen ve Özel Üçgenler", "7s 30dk", "5s 15dk", "4s"),
  duration("TYT", "Geometri", "Çemberde Açılar", "9s", "6s 30dk", "5s"),
  duration("TYT", "Geometri", "Doğrunun Analitik İncelenmesi", "15s", "10s", "7s"),
];

export const guideResourceReviews = [
  review("TYT", "Türkçe", "Apotemi", "Deneme", "15", 9, 7, 8, 8, "İleri"),
  review("TYT", "Türkçe", "Limit", "Deneme", "15", 9, 7, 9, 8, "İleri"),
  review("TYT", "Türkçe", "345", "Deneme", "12", 8, 9, 10, 9, "Orta"),
  review("TYT", "Türkçe", "3D", "Deneme", "10", 9, 8, 9, 9, "Orta"),
  review("TYT", "Matematik", "3D", "Deneme", "10", 10, 9, 10, 9, "İleri"),
  review("TYT", "Matematik", "345", "Deneme", "10", 7, 10, 10, 10, "Orta"),
  review("TYT", "Matematik", "Bilgi Sarmal", "Deneme", "15", 7, 9, 9, 8, "Orta"),
  review("TYT", "Matematik", "Acil", "Deneme", "12", 7, 8, 8, 9, "Orta"),
  review("TYT", "Geometri", "Bilgi Sarmal", "Deneme", "14", 8, 8, 8, 8, "Orta"),
  review("TYT", "Geometri", "Orijinal", "Deneme", "20", 9, 8, 8, 8, "İleri"),
  review("TYT", "Geometri", "Acil", "Deneme", "15", 9, 9, 9, 9, "İleri"),
  review("TYT", "Fizik", "Bilgi Sarmal", "Deneme", "40", 7.5, 8, 8.5, 7, "Orta"),
  review("TYT", "Fizik", "Aydın", "Deneme", "30", 9, 7.5, 9, 7, "İleri"),
  review("TYT", "Fizik", "3D", "Deneme", "48", 8, 7.5, 9, 9, "Orta"),
  review("TYT", "Kimya", "Miray", "Deneme", "30", 7.5, 9, 8, 7, "Orta"),
  review("TYT", "Kimya", "Orbital", "Deneme", "45", 9, 7.5, 8.5, 8.5, "İleri"),
  review("TYT", "Biyoloji", "Aydın", "Deneme", "40", 9, 7.5, 9.5, 6, "İleri"),
  review("TYT", "Biyoloji", "Bilgi Sarmal", "Deneme", "40", 6, 8, 8, 8, "Orta"),
  review("TYT", "Fen", "3D", "Genel Deneme", "15", 9, 8, 9, 8, "İleri"),
  review("TYT", "Fen", "345", "Genel Deneme", "25", 6, 9, 9, 9, "Orta"),
];

export const guideChannelSuggestions = [
  channel("TYT", "Kimya", "Kimya Köyü", "3D TYT-AYT kimya soru bankası/deneme çözümleri, konu anlatımı ve MEB tekrar testleri.", "Orta"),
  channel("TYT", "Kimya", "Tonguç Kampüs Sayısal", "TYT-AYT ayrılmış konu anlatımı ve soru çözümü listeleri.", "Başlangıç"),
  channel("TYT", "Tarih", "Onur Gece", "Tarih konularında kısa ve öz konu anlatımı.", "Başlangıç"),
  channel("TYT", "Tarih", "Hocalara Geldik", "Çok dersli konu anlatımı ve soru çözümü arşivi.", "Orta"),
  channel("TYT", "Fen", "Ertan Sinan Şahin", "Fizik deneme ve konu pratiği için güçlü açıklamalı içerikler.", "İleri"),
];

export function getGuidePackageSuggestions({ area = "TYT", exam = "TYT", lesson = "Türkçe", level = "Başlangıç", resource = "" } = {}) {
  const packageCards = guidePackages.filter((pack) => pack.area === "TYT" || pack.area === area);
  const durations = guideStudyDurations.filter((item) =>
    item.exam === exam && sameLesson(item.lesson, lesson)
  );
  const reviews = guideResourceReviews.filter((item) => {
    const lessonMatches = sameLesson(item.lesson, lesson) || item.lesson === "Fen" && ["Fizik", "Kimya", "Biyoloji"].includes(lesson);
    const levelMatches = item.level === level || level === "Başlangıç" && item.level === "Orta";
    const resourceMatches = !resource || item.resource.toLocaleLowerCase("tr-TR").includes(resource.toLocaleLowerCase("tr-TR"));
    return item.exam === exam && lessonMatches && levelMatches && resourceMatches;
  });
  const channels = guideChannelSuggestions.filter((item) =>
    item.exam === exam && (sameLesson(item.lesson, lesson) || item.lesson === "Fen" && ["Fizik", "Kimya", "Biyoloji"].includes(lesson))
  );

  return { packageCards, durations, reviews, channels };
}

function duration(exam, lesson, topic, beginner, medium, advanced) {
  return { exam, lesson, topic, beginner, medium, advanced };
}

function review(exam, lesson, resource, type, count, difficulty, osymFit, videoClarity, layout, level) {
  return { exam, lesson, resource, type, count, difficulty, osymFit, videoClarity, layout, level };
}

function channel(exam, lesson, title, focus, level) {
  return { exam, lesson, title, focus, level };
}

function sameLesson(left = "", right = "") {
  return left.toLocaleLowerCase("tr-TR") === right.toLocaleLowerCase("tr-TR");
}
