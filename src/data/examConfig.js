export const EXAM_SUBJECTS = {
  TYT: ["Türkçe", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
  "AYT-SAY": ["Matematik", "Fizik", "Kimya", "Biyoloji"],
  "AYT-EA": ["Matematik", "Edebiyat", "Tarih", "Coğrafya"],
  "AYT-SÖZ": ["Edebiyat", "Tarih", "Coğrafya", "Felsefe", "Din"],
  YDT: ["Yabancı Dil"],
};

export const EXAM_QUESTION_COUNTS = {
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

export const WEEK_DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const studyRecordTypes = [
  "Günlük Soru Çözümü",
  "Ödev Soru Çözümü",
  "Branş Denemesi",
  "Konu Tarama Testi",
  "Paragraf Rutini",
  "Problem Rutini",
  "Yanlış Analizi",
  "Video Sonrası Test",
  "Genel Tekrar",
];

export const studyStatuses = [
  "Öğrenci Girdi",
  "Kontrol Edildi",
  "Eksik",
  "Tekrar Verildi",
];

export const errorTypes = [
  "Bilgi Eksiği",
  "İşlem Hatası",
  "Dikkat Hatası",
  "Süre Yetmedi",
  "Boş Bırakma",
  "Kavram Yanılgısı",
];
