import { topicQuestionStats } from "./topicQuestionStats.js";

export const topicTrackingStatuses = [
  "Başlamadı",
  "Konu anlatımı başladı",
  "Konu anlatımı bitti",
  "Temel test çözüldü",
  "Orta test çözüldü",
  "İleri test çözüldü",
  "Denemede ölçüldü",
  "Eksik var",
  "Tamamlandı",
  "Tekrar gerekiyor",
];

export const learningStatusOptions = ["Başlamadı", "Öğreniliyor", "Bitti"];
export const questionStatusOptions = ["Az", "Orta", "Yeterli"];
export const netStatusOptions = ["Ölçülmedi", "Zayıf", "Orta", "İyi"];
export const topicErrorTypeOptions = [
  "Yok",
  "Bilgi eksiği",
  "İşlem hatası",
  "Dikkat hatası",
  "Zaman problemi",
  "Kavram yanılgısı",
];

export const topicCompletionCriteria = [
  "Konu anlatımı tamamlandı",
  "En az bir temel test çözüldü",
  "En az bir orta seviye test çözüldü",
  "Yanlışlar hata türüne göre analiz edildi",
  "Deneme veya branş denemesinde konu ölçüldü",
];

const defaultSubtopics = [
  "Konu anlatımı",
  "Temel test",
  "Orta test",
  "İleri / yeni nesil test",
  "Deneme ölçümü",
  "Hata analizi",
  "1-7-21 tekrar",
];

const curatedSubtopics = {
  "TYT|Türkçe|Sözcükte Anlam": [
    "Gerçek anlam",
    "Mecaz anlam",
    "Terim anlam",
    "Yan anlam",
    "Eş-zıt-yakın anlam",
    "Somut-soyut anlam",
    "Genel-özel anlam",
    "Nitel-nicel anlam",
    "Deyimler ve atasözleri",
    "Söz öbeklerinde anlam",
  ],
  "TYT|Türkçe|Cümlede Anlam": [
    "Ana düşünce",
    "Neden-sonuç",
    "Amaç-sonuç",
    "Koşul-sonuç",
    "Karşılaştırma",
    "Varsayım-olasılık-tahmin",
    "Öneri-eleştiri",
    "Üslup ve içerik",
    "Doğrudan-dolaylı anlatım",
  ],
  "TYT|Türkçe|Paragraf": [
    "Ana düşünce",
    "Yardımcı düşünce",
    "Konu ve başlık",
    "Anlatım biçimleri",
    "Düşünceyi geliştirme yolları",
    "Paragraf tamamlama",
    "Paragraf oluşturma",
    "Cümle sıralama",
    "Akışı bozan cümle",
    "Sözel mantık ve muhakeme",
  ],
  "TYT|Türkçe|Dil Bilgisi": [
    "Ses bilgisi",
    "Sözcükte yapı",
    "Kök ve ek",
    "Sözcük türleri",
    "Fiiller",
    "Ek fiil",
    "Fiilimsi",
    "Cümlenin ögeleri",
    "Cümle türleri",
  ],
  "TYT|Türkçe|Yazım Kuralları": [
    "Büyük harflerin yazımı",
    "Sayıların yazımı",
    "Birleşik sözcükler",
    "Kısaltmalar",
    "De-ki-mi yazımı",
  ],
  "TYT|Türkçe|Noktalama İşaretleri": [
    "Virgül",
    "Nokta",
    "Noktalı virgül",
    "İki nokta",
    "Üç nokta",
    "Soru işareti",
    "Ünlem",
    "Tırnak",
    "Kesme işareti",
    "Parantez",
  ],
  "TYT|Matematik|Temel Kavramlar": [
    "Sayı kümeleri",
    "Doğal sayılar",
    "Tam sayılar",
    "Rasyonel sayılar",
    "İrrasyonel sayılar",
    "Reel sayılar",
    "Pozitif-negatif sayılar",
    "Tek-çift sayılar",
    "Ardışık sayılar",
    "Asal sayılar",
    "Basamak kavramı",
    "Çözümleme",
  ],
  "TYT|Matematik|Sayılar ve İşlemler": [
    "Bölme-bölünebilme",
    "Bölünebilme kuralları",
    "EBOB",
    "EKOK",
    "Asal çarpanlara ayırma",
    "Faktöriyel",
    "Rasyonel sayılar",
    "Ondalık sayılar",
    "Basit eşitsizlikler",
    "Mutlak değer",
  ],
  "TYT|Matematik|Problemler": [
    "Sayı problemleri",
    "Kesir problemleri",
    "Yaş problemleri",
    "İşçi-havuz problemleri",
    "Hareket problemleri",
    "Yüzde problemleri",
    "Kâr-zarar problemleri",
    "Karışım problemleri",
    "Faiz problemleri",
    "Grafik ve tablo problemleri",
    "Yeni nesil problemler",
  ],
  "TYT|Matematik|Fonksiyonlar": [
    "Fonksiyon kavramı",
    "Tanım kümesi",
    "Değer kümesi",
    "Görüntü kümesi",
    "Fonksiyon grafikleri",
    "Bileşke fonksiyon temel düzey",
    "Ters fonksiyon temel düzey",
  ],
  "TYT|Geometri|Açılar ve Üçgenler": [
    "Açı çeşitleri",
    "Paralel doğrularda açılar",
    "Üçgende açı",
    "Üçgende kenar bağıntıları",
    "Üçgende alan",
    "Dik üçgen",
    "Özel üçgenler",
    "Açıortay",
    "Kenarortay",
    "Yükseklik",
    "Benzerlik",
    "Eşlik",
  ],
  "TYT|Geometri|Dörtgenler ve Çokgenler": [
    "Yamuk",
    "Paralelkenar",
    "Eşkenar dörtgen",
    "Dikdörtgen",
    "Kare",
    "Deltoid",
    "İç açı toplamı",
    "Dış açı toplamı",
  ],
  "TYT|Geometri|Çember ve Daire": [
    "Merkez açı",
    "Çevre açı",
    "Teğet",
    "Kiriş",
    "Çemberde uzunluk",
    "Dairede alan",
    "Daire dilimi",
  ],
  "TYT|Geometri|Analitik Geometri": [
    "Koordinat sistemi",
    "Noktanın koordinatları",
    "İki nokta arası uzaklık",
    "Orta nokta",
    "Doğrunun eğimi",
    "Doğru denklemi",
  ],
  "TYT|Fizik|Hareket": ["Konum", "Hız", "İvme", "Grafik yorumlama"],
  "TYT|Fizik|Kuvvet": ["Net kuvvet", "Sürtünme kuvveti", "Denge"],
  "TYT|Fizik|Elektrik": ["Elektrik yükü", "Akım", "Direnç", "Devreler"],
  "TYT|Kimya|Atom ve Periyodik Sistem": ["Atom modelleri", "Periyodik özellikler", "Element sınıfları"],
  "TYT|Kimya|Kimyasal Türler Arası Etkileşimler": ["İyonik bağ", "Kovalent bağ", "Zayıf etkileşimler"],
  "TYT|Biyoloji|Canlıların Temel Bileşenleri": ["Karbonhidratlar", "Proteinler", "Yağlar", "Enzimler", "Vitaminler", "Mineraller", "Su"],
  "TYT|Biyoloji|Hücre": ["Hücre zarı", "Sitoplazma", "Organeller", "Madde geçişleri"],
  "TYT|Biyoloji|Ekoloji": ["Ekosistem", "Popülasyon", "Komünite", "Madde döngüleri", "Besin zinciri"],
  "AYT|Matematik|Fonksiyonlar": [
    "Fonksiyon kavramı",
    "Fonksiyon çeşitleri",
    "Parçalı fonksiyon",
    "Bileşke fonksiyon",
    "Ters fonksiyon",
    "Fonksiyon grafikleri",
    "Grafik dönüşümleri",
  ],
  "AYT|Matematik|Polinomlar": [
    "Polinomlarda derece",
    "Dört işlem",
    "Bölme işlemi",
    "Kalan teoremi",
    "Çarpan teoremi",
    "Kök bulma",
  ],
  "AYT|Matematik|Trigonometri": [
    "Açı ölçüleri",
    "Birim çember",
    "Trigonometrik oranlar",
    "Özdeşlikler",
    "Toplam-fark formülleri",
    "İki kat açı",
    "Trigonometrik denklemler",
    "Fonksiyon grafikleri",
  ],
  "AYT|Matematik|Limit": [
    "Limit kavramı",
    "Sağdan-soldan limit",
    "Sonsuzda limit",
    "Belirsizlikler",
    "Grafik üzerinden limit",
    "Parçalı fonksiyonlarda limit",
  ],
  "AYT|Matematik|Süreklilik": [
    "Bir noktada süreklilik",
    "Aralıkta süreklilik",
    "Süreksizlik türleri",
    "Grafik yorumlama",
  ],
  "AYT|Matematik|Türev": [
    "Türev tanımı",
    "Türev alma kuralları",
    "Zincir kuralı",
    "Trigonometrik türev",
    "Artan-azalan",
    "Ekstremum",
    "Teğet-normal",
    "Optimizasyon",
  ],
  "AYT|Matematik|İntegral": [
    "Belirsiz integral",
    "Belirli integral",
    "İntegral alma kuralları",
    "Alan hesabı",
    "İki eğri arasında alan",
    "Grafik yorumlama",
  ],
  "AYT|Geometri|Üçgenler": [
    "Üçgende açılar",
    "Kenar bağıntıları",
    "Alan",
    "Açıortay",
    "Kenarortay",
    "Yükseklik",
    "Benzerlik",
    "Eşlik",
    "Sinüs teoremi",
    "Kosinüs teoremi",
  ],
  "AYT|Geometri|Analitik Geometri": [
    "Nokta analitiği",
    "Doğru analitiği",
    "Eğim",
    "Doğru denklemleri",
    "Noktanın doğruya uzaklığı",
    "Çember analitiği",
  ],
  "AYT|Fizik|Elektrik ve Manyetizma": [
    "Elektriksel kuvvet",
    "Elektrik alan",
    "Potansiyel",
    "Sığa",
    "Elektrik devreleri",
    "Manyetik alan",
    "İndüksiyon",
    "Alternatif akım",
  ],
  "AYT|Kimya|Organik Kimya": [
    "Hidrokarbonlar",
    "Alkanlar",
    "Alkenler",
    "Alkinler",
    "Aromatik bileşikler",
    "Alkoller",
    "Eterler",
    "Aldehitler",
    "Ketonlar",
    "Karboksilik asitler",
    "Esterler",
    "Aminler",
    "Polimerler",
  ],
  "AYT|Biyoloji|İnsan Fizyolojisi": [
    "Sinir sistemi",
    "Endokrin sistem",
    "Duyu organları",
    "Destek ve hareket sistemi",
    "Sindirim sistemi",
    "Dolaşım sistemi",
    "Bağışıklık sistemi",
    "Solunum sistemi",
    "Boşaltım sistemi",
    "Üreme sistemi",
  ],
  "AYT|Edebiyat|Cumhuriyet Dönemi Türk Edebiyatı": [
    "Cumhuriyet şiiri",
    "Garip akımı",
    "İkinci Yeni",
    "Toplumcu gerçekçi şiir",
    "Saf şiir",
    "Cumhuriyet romanı",
    "Modernizm",
    "Postmodernizm",
    "Yazar-eser eşleştirme",
  ],
  "AYT|Edebiyat|Divan Edebiyatı": [
    "Aruz ölçüsü",
    "Mazmunlar",
    "Gazel",
    "Kaside",
    "Mesnevi",
    "Rubai",
    "Şarkı",
    "Divan nesri",
  ],
  "AYT|Felsefe|Felsefe Grubu": [
    "Felsefe",
    "Psikoloji",
    "Sosyoloji",
    "Mantık",
    "Bilgi felsefesi",
    "Varlık felsefesi",
    "Ahlak felsefesi",
    "Sembolik mantık temel düzey",
  ],
  "YDT|Yabancı Dil|Vocabulary": ["Sözcük anlamı", "Phrasal verbs", "Collocations"],
  "YDT|Yabancı Dil|Grammar": ["Tenses", "Modals", "Passive voice", "Conditionals"],
  "YDT|Yabancı Dil|Reading": ["Ana fikir", "Detay soruları", "Inference"],
};

export const normalizedTopicQuestionStats = topicQuestionStats.map((item) => ({
  ...item,
  lesson: normalizeLessonName(item.lesson),
}));

export const topicGroups = buildTopicGroups();

export function getTopicQuestionStat(exam, lesson, topic) {
  const normalizedLesson = normalizeLessonName(lesson);
  return normalizedTopicQuestionStats.find((item) =>
    item.exam === exam &&
    item.lesson === normalizedLesson &&
    item.topic === topic
  ) || null;
}

export function getTopicPriorityLabel(exam, lesson, topic) {
  const stat = getTopicQuestionStat(exam, lesson, topic);
  if (!stat) return "Kapsam";
  return `${stat.priority} · Son 5 yıl: ${stat.total5Years}`;
}

export function calculateTopicReadiness(topicRecord = {}) {
  const statusScore = {
    "Başlamadı": 0,
    "Konu anlatımı başladı": 15,
    "Konu anlatımı bitti": 30,
    "Temel test çözüldü": 45,
    "Orta test çözüldü": 60,
    "İleri test çözüldü": 75,
    "Denemede ölçüldü": 85,
    "Eksik var": 45,
    "Tamamlandı": 100,
    "Tekrar gerekiyor": 60,
    "Devam Ediyor": 35,
    "Tekrar Gerekli": 60,
  };
  const learningScore = { Başlamadı: 0, Öğreniliyor: 18, Bitti: 30 };
  const questionScore = { Az: 10, Orta: 22, Yeterli: 35 };
  const netScore = { Ölçülmedi: 0, Zayıf: 8, Orta: 16, İyi: 25 };
  const errorScore = topicRecord.errorType && topicRecord.errorType !== "Yok" ? 6 : 10;
  const reviewScore = topicRecord.reviewDate ? 8 : 0;
  const fieldScore = Math.min(
    100,
    (learningScore[topicRecord.learningStatus] || 0) +
      (questionScore[topicRecord.questionStatus] || 0) +
      (netScore[topicRecord.netStatus] || 0) +
      errorScore +
      reviewScore
  );

  return Math.max(statusScore[topicRecord.status] ?? 0, fieldScore);
}

function buildTopicGroups() {
  const groups = new Map();

  normalizedTopicQuestionStats.forEach((item) => {
    const key = `${item.exam}|${item.lesson}`;
    if (!groups.has(key)) {
      groups.set(key, {
        exam: item.exam,
        lesson: item.lesson,
        topics: [],
        subtopics: {},
      });
    }

    const group = groups.get(key);
    if (!group.topics.includes(item.topic)) {
      group.topics.push(item.topic);
    }
    group.subtopics[item.topic] = getCuratedSubtopics(item.exam, item.lesson, item.topic);
  });

  ensureYdtGroup(groups);

  return [...groups.values()].sort((a, b) => {
    if (a.exam !== b.exam) return a.exam.localeCompare(b.exam, "tr-TR");
    return a.lesson.localeCompare(b.lesson, "tr-TR");
  });
}

function getCuratedSubtopics(exam, lesson, topic) {
  return curatedSubtopics[`${exam}|${lesson}|${topic}`] || defaultSubtopics;
}

function ensureYdtGroup(groups) {
  const key = "YDT|Yabancı Dil";
  if (groups.has(key)) return;
  groups.set(key, {
    exam: "YDT",
    lesson: "Yabancı Dil",
    topics: ["Vocabulary", "Grammar", "Reading", "Cloze Test", "Translation"],
    subtopics: {
      Vocabulary: curatedSubtopics["YDT|Yabancı Dil|Vocabulary"],
      Grammar: curatedSubtopics["YDT|Yabancı Dil|Grammar"],
      Reading: curatedSubtopics["YDT|Yabancı Dil|Reading"],
      "Cloze Test": ["Bağlaç", "Edat", "Zaman uyumu"],
      Translation: ["Türkçeden İngilizceye", "İngilizceden Türkçeye", "Anlam bütünlüğü"],
    },
  });
}

function normalizeLessonName(lesson = "") {
  const normalized = lesson.trim();
  if (normalized === "Türk Dili ve Edebiyatı") return "Edebiyat";
  if (normalized === "Din Kültürü") return "Din";
  if (normalized === "Felsefe Grubu") return "Felsefe";
  return normalized;
}
