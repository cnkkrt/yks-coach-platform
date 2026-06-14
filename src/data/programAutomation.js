import { getTopicQuestionStat } from "./curriculumData.js";

export const programAreaOptions = [
  { value: "TYT", label: "Sadece TYT" },
  { value: "SAY", label: "TYT + Sayısal" },
  { value: "EA", label: "TYT + Eşit Ağırlık" },
  { value: "SOZ", label: "TYT + Sözel" },
  { value: "DIL", label: "TYT + Dil" },
];

export const periodModeOptions = [
  { value: "2", label: "2 saat/gün" },
  { value: "3", label: "3 saat/gün" },
  { value: "4", label: "4 saat/gün" },
  { value: "5", label: "5 saat/gün" },
  { value: "6", label: "6 saat/gün" },
  { value: "7", label: "7 saat/gün" },
  { value: "8", label: "8 saat/gün" },
  { value: "custom", label: "Özel saat" },
];

export const periodLevelOptions = ["Başlangıç", "Orta", "İleri"];

export function getProgramLessonLevelItems(area = "EA") {
  const commonTyt = [
    { key: "TYT Türkçe", label: "TYT Türkçe" },
    { key: "TYT Matematik", label: "TYT Matematik" },
    { key: "TYT Geometri", label: "TYT Geometri" },
    { key: "TYT Fizik", label: "TYT Fizik" },
    { key: "TYT Kimya", label: "TYT Kimya" },
    { key: "TYT Biyoloji", label: "TYT Biyoloji" },
    { key: "TYT Sosyal", label: "TYT Sosyal" },
  ];
  const areaLessons = {
    TYT: [],
    SAY: [
      { key: "AYT Matematik", label: "AYT Matematik" },
      { key: "AYT Geometri", label: "AYT Geometri" },
      { key: "AYT Fizik", label: "AYT Fizik" },
      { key: "AYT Kimya", label: "AYT Kimya" },
      { key: "AYT Biyoloji", label: "AYT Biyoloji" },
    ],
    EA: [
      { key: "AYT Matematik", label: "AYT Matematik" },
      { key: "AYT Edebiyat", label: "AYT Edebiyat" },
      { key: "AYT Tarih", label: "AYT Tarih" },
      { key: "AYT Coğrafya", label: "AYT Coğrafya" },
    ],
    SOZ: [
      { key: "AYT Edebiyat", label: "AYT Edebiyat" },
      { key: "AYT Tarih", label: "AYT Tarih" },
      { key: "AYT Coğrafya", label: "AYT Coğrafya" },
      { key: "AYT Felsefe", label: "AYT Felsefe" },
      { key: "AYT Din", label: "AYT Din" },
    ],
    DIL: [
      { key: "YDT Yabancı Dil", label: "YDT Yabancı Dil" },
    ],
  };

  return [...commonTyt, ...(areaLessons[normalizeArea(area)] || areaLessons.EA)];
}

export const phaseDefinitions = [
  {
    id: "phase-1",
    label: "Faz 1: Temel",
    weekStart: 1,
    weekEnd: 8,
    target: "TYT temel, okuma rutini ve eksik konuların görünür hale gelmesi.",
    examFrequency: "2 haftada 1 TYT denemesi",
    taskType: "Konu anlatımı + kolay/orta test + kısa tekrar",
  },
  {
    id: "phase-2",
    label: "Faz 2: İnşa",
    weekStart: 9,
    weekEnd: 20,
    target: "TYT rutini korunurken AYT ana omurgasını bitirmek.",
    examFrequency: "Haftada 1 TYT, 2 haftada 1 AYT/branş denemesi",
    taskType: "Konu tarama, karma test ve kaynak ilerleme",
  },
  {
    id: "phase-3",
    label: "Faz 3: Hız ve Analiz",
    weekStart: 21,
    weekEnd: 32,
    target: "Net artırma, süre yönetimi ve hata defteri döngüsünü güçlendirmek.",
    examFrequency: "Haftada 1 TYT + 1 AYT veya alan denemesi",
    taskType: "Branş denemesi, zor soru ve hata analizi",
  },
  {
    id: "phase-4",
    label: "Faz 4: Final",
    weekStart: 33,
    weekEnd: 40,
    target: "Genel tekrar, deneme ritmi ve sınav stratejisini oturtmak.",
    examFrequency: "Haftada 2 TYT + 1 AYT/YDT denemesi",
    taskType: "Genel deneme, son tekrar ve yanlış kapatma",
  },
];

const DAY_ORDER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const blockLabels = {
  tyt: "1. Blok TYT",
  ayt: "2. Blok AYT",
  review: "3. Blok Tekrar / Paragraf / Hata Defteri",
};

const periodFillers = {
  TYT: [
    tyt("Matematik", "Problemler", "Sayı problemleri", "Karma problem + hata defteri"),
    tyt("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "Paragraf çalışması"),
    tyt("Geometri", "Üçgenler", "Üçgende alan", "Geometri çalışması + 20 soru"),
    tyt("Fen", "Hücre", "Organeller", "Fen konu tekrarı + 20 soru"),
    tyt("Sosyal", "Milli Mücadele", "Kongreler", "Sosyal kısa tekrar + 20 soru"),
  ],
  SAY: [
    review("Matematik", "Problemler", "Grafik ve tablo problemleri", "Karma problem + hata defteri"),
    tyt("Geometri", "Açılar ve Üçgenler", "Üçgende alan", "Geometri çalışması + 20 soru"),
    ayt("Fizik", "Elektrik ve Manyetizma", "Elektrik devreleri", "Konu tarama + 18 soru"),
    ayt("Matematik", "Trigonometri", "Birim çember", "Orta-ileri test"),
    review("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "Paragraf çalışması"),
  ],
  EA: [
    review("Matematik", "Problemler", "Grafik ve tablo problemleri", "Karma problem + hata defteri"),
    ayt("Edebiyat", "Divan Edebiyatı", "Gazel", "Edebiyat tekrar çalışması"),
    ayt("Matematik", "Türev", "Türev problemleri", "Konu tarama + 20 soru"),
    tyt("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "Paragraf çalışması"),
    ayt("Coğrafya", "Türkiye Ekonomisi", "Türkiye’de tarım", "Harita + kavram testi"),
  ],
  SOZ: [
    ayt("Edebiyat", "Divan Edebiyatı", "Gazel", "Edebiyat tekrar çalışması"),
    ayt("Tarih", "Milli Mücadele", "Kurtuluş Savaşı cepheleri", "Kronoloji + 20 soru"),
    ayt("Felsefe", "Felsefe Grubu", "Mantık", "Kavram kartı + test"),
    tyt("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "Paragraf çalışması"),
    ayt("Coğrafya", "Küresel ticaret", "", "Kavram + grafik yorumlama"),
  ],
  DIL: [
    ydt("Grammar", "Conditionals", "Dil bilgisi çalışması"),
    ydt("Reading", "Inference", "Okuma parçası + analiz"),
    ydt("Vocabulary", "Collocations", "Kelime çalışması"),
    tyt("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "Paragraf çalışması"),
    tyt("Matematik", "Problemler", "Sayı problemleri", "TYT destek çalışması"),
  ],
};

const weeklyPlanTemplates = {
  TYT: [
    day("Pazartesi", tyt("Türkçe", "Paragraf", "Ana düşünce", "30 paragraf + yanlış analizi"), tyt("Matematik", "Temel Kavramlar", "Sayı kümeleri", "Konu özeti + 35 soru"), review("Türkçe", "Dil Bilgisi", "Yazım-noktalama", "Kısa tekrar + 20 soru")),
    day("Salı", tyt("Matematik", "Problemler", "Sayı problemleri", "35 problem + süre takibi"), tyt("Geometri", "Üçgenler", "Üçgende alan", "Konu anlatımı + 25 soru"), review("Türkçe", "Paragraf", "Yardımcı düşünce", "30 paragraf")),
    day("Çarşamba", tyt("Fizik", "Hareket", "Grafik yorumlama", "Video + 25 temel soru"), tyt("Kimya", "Atom ve Periyodik Sistem", "Periyodik özellikler", "Konu anlatımı + 25 soru"), review("Matematik", "Problemler", "Yaş problemleri", "20 problem + hata defteri")),
    day("Perşembe", tyt("Biyoloji", "Hücre", "Organeller", "Konu özeti + 25 soru"), tyt("Tarih", "Milli Mücadele", "Kongreler", "Konu özeti + 20 soru"), review("Türkçe", "Paragraf", "Sözel mantık ve muhakeme", "30 paragraf süre takibi")),
    day("Cuma", tyt("Matematik", "Oran-Orantı", "Doğru orantı", "35 soru karma test"), tyt("Coğrafya", "Harita Bilgisi", "Ölçek", "Konu anlatımı + 20 soru"), review("Fen", "Hücre", "Organeller", "Haftanın fen hatalarını kapat")),
    day("Cumartesi", tyt("Türkçe", "Dil Bilgisi", "Fiilimsi", "Konu tekrarı + 25 soru"), tyt("Matematik", "Problemler", "Hız problemleri", "40 soru karma test"), review("Sosyal", "Felsefe", "Bilgi felsefesi", "Kısa tekrar + 20 soru")),
    day("Pazar", tyt("Türkçe", "Paragraf", "Paragraf yapısı", "TYT paragraf taraması"), tyt("Matematik", "Problemler", "Karma problemler", "TYT genel tekrar + 40 soru"), review("TYT", "Genel Deneme", "Analiz", "Mini deneme + hata defteri")),
  ],
  SAY: [
    day("Pazartesi", tyt("Matematik", "Temel Kavramlar", "Sayı kümeleri", "Konu özeti + 35 soru"), ayt("Matematik", "Fonksiyonlar", "Fonksiyon grafikleri", "Konu anlatımı + 25 soru"), review("Türkçe", "Paragraf", "Ana düşünce", "30 paragraf + yanlış analizi")),
    day("Salı", tyt("Fizik", "Hareket", "Grafik yorumlama", "Video + 25 temel soru"), ayt("Fizik", "Vektörler", "Vektör toplama", "Konu tekrarı + 20 soru"), review("Matematik", "Problemler", "Sayı problemleri", "Eksik kalan 15 soru ve hata defteri")),
    day("Çarşamba", tyt("Kimya", "Atom ve Periyodik Sistem", "Periyodik özellikler", "Konu anlatımı + 25 soru"), ayt("Kimya", "Modern Atom Teorisi", "Elektron dizilimi", "Konu tarama testi"), review("Türkçe", "Paragraf", "Yardımcı düşünce", "30 paragraf süre takibi")),
    day("Perşembe", tyt("Biyoloji", "Hücre", "Organeller", "Konu özeti + 25 soru"), ayt("Biyoloji", "Sistemler", "Dolaşım sistemi", "Konu tekrarı + 25 soru"), review("Matematik", "Problemler", "Yaş problemleri", "20 problem + yanlış defteri")),
    day("Cuma", tyt("Matematik", "Problemler", "Hız problemleri", "40 soru karma test"), ayt("Matematik", "Türev", "Türev kuralları", "Konu anlatımı + 20 soru"), review("Fizik", "Kuvvet", "Net kuvvet", "Haftanın fizik hatalarını kapat")),
    day("Cumartesi", tyt("Türkçe", "Dil Bilgisi", "Yazım-noktalama", "Konu tekrarı + 25 soru"), ayt("Biyoloji", "Kalıtım", "Mendel genetiği", "Konu tarama testi"), review("Matematik", "Temel Kavramlar", "Ardışık sayılar", "TYT mini deneme analizi")),
    day("Pazar", tyt("Matematik", "Problemler", "Sayı problemleri", "TYT genel tekrar + 40 soru"), ayt("Kimya", "Organik Kimya", "Fonksiyonel gruplar", "Haftalık AYT tekrar"), review("Türkçe", "Paragraf", "Paragraf yapısı", "Haftalık hata defteri ve yeni hafta hazırlığı")),
  ],
  EA: [
    day("Pazartesi", tyt("Matematik", "Problemler", "Sayı problemleri", "35 problem + süre takibi"), ayt("Matematik", "Fonksiyonlar", "Fonksiyon grafikleri", "Konu anlatımı + 25 soru"), review("Türkçe", "Paragraf", "Ana düşünce", "30 paragraf")),
    day("Salı", tyt("Türkçe", "Cümlede Anlam", "Neden-sonuç", "Konu tekrarı + 25 soru"), ayt("Edebiyat", "Şiir Bilgisi", "Söz sanatları", "Konu özeti + 2 test"), review("Matematik", "Problemler", "Yaş problemleri", "Yanlış analizi")),
    day("Çarşamba", tyt("Tarih", "Milli Mücadele", "Kongreler", "Konu özeti + 20 soru"), ayt("Tarih", "Milli Mücadele", "Cepheler", "Konu tarama testi"), review("Türkçe", "Paragraf", "Yardımcı düşünce", "30 paragraf süre takibi")),
    day("Perşembe", tyt("Coğrafya", "Harita Bilgisi", "Ölçek", "Konu anlatımı + 20 soru"), ayt("Coğrafya", "Türkiye Ekonomisi", "Tarım", "Konu tekrarı + 2 test"), review("Matematik", "Oran-Orantı", "Karışım problemleri", "20 soru + hata defteri")),
    day("Cuma", tyt("Matematik", "Oran-Orantı", "Doğru orantı", "35 soru karma test"), ayt("Edebiyat", "Cumhuriyet Dönemi", "Yazar-eser eşleştirme", "Yazar-eser tablosu + 2 test"), review("Türkçe", "Dil Bilgisi", "Fiilimsi", "Eksik konu tekrar")),
    day("Cumartesi", tyt("Felsefe", "Bilgi Felsefesi", "Bilgi türleri", "Kısa tekrar + 20 soru"), ayt("Matematik", "Limit", "Limit kavramı", "Konu anlatımı + 20 soru"), review("Türkçe", "Paragraf", "Anlatım teknikleri", "TYT mini deneme analizi")),
    day("Pazar", tyt("Türkçe", "Paragraf", "Paragraf yapısı", "Haftalık paragraf taraması"), ayt("Edebiyat", "Milli Edebiyat", "Roman-hikaye", "Haftalık AYT tekrar"), review("Matematik", "Problemler", "İşçi-havuz problemleri", "Hata defteri kapatma")),
  ],
  SOZ: [
    day("Pazartesi", tyt("Türkçe", "Paragraf", "Ana düşünce", "35 paragraf + süre takibi"), ayt("Edebiyat", "Şiir Bilgisi", "Kafiye-redif", "Konu anlatımı + 2 test"), review("Tarih", "Tarih Bilimine Giriş", "Tarih kaynakları", "Kısa tekrar + yanlış analizi")),
    day("Salı", tyt("Tarih", "İlk Türk Devletleri", "Göktürkler", "Konu özeti + 20 soru"), ayt("Tarih", "Beylikten Devlete", "Kuruluş dönemi", "Konu tarama testi"), review("Türkçe", "Dil Bilgisi", "Yazım-noktalama", "20 soru + hata defteri")),
    day("Çarşamba", tyt("Coğrafya", "İklim Bilgisi", "Basınç ve rüzgarlar", "Konu anlatımı + 20 soru"), ayt("Coğrafya", "Ekosistemler", "Biyomlar", "Konu tekrarı + 2 test"), review("Türkçe", "Paragraf", "Yardımcı düşünce", "30 paragraf")),
    day("Perşembe", tyt("Felsefe", "Varlık Felsefesi", "Varlık problemi", "Konu özeti + 20 soru"), ayt("Edebiyat", "Tanzimat", "Dönem sanatçıları", "Konu kartı + 2 test"), review("Din", "Ahlak", "Sorumluluk", "Yanlış kapatma")),
    day("Cuma", tyt("Din", "Hz. Muhammed", "Örnek kişiliği", "Konu tekrarı + 20 soru"), ayt("Tarih", "Dünya Gücü Osmanlı", "Yükselme dönemi", "Konu tarama testi"), review("Türkçe", "Cümlede Anlam", "Karşılaştırma", "25 soru")),
    day("Cumartesi", tyt("Türkçe", "Sözcükte Anlam", "Sözcükte anlam ilişkileri", "Konu tekrarı + 25 soru"), ayt("Coğrafya", "Küresel Ortam", "Çevre sorunları", "Konu tekrarı + 2 test"), review("Edebiyat", "Cumhuriyet Dönemi", "Şiir akımları", "Haftalık edebiyat tekrar")),
    day("Pazar", tyt("Türkçe", "Paragraf", "Paragraf yapısı", "TYT sözel tarama"), ayt("Edebiyat", "Servetifünun", "Dönem sanatçıları", "AYT sözel tekrar"), review("Tarih", "Milli Mücadele", "Antlaşmalar", "Hata defteri kapatma")),
  ],
  DIL: [
    day("Pazartesi", tyt("Türkçe", "Paragraf", "Ana düşünce", "30 paragraf + süre takibi"), ydt("Vocabulary", "Collocations", "60 kelime + örnek cümle"), review("Matematik", "Temel Kavramlar", "Sayı kümeleri", "TYT temel 25 soru")),
    day("Salı", tyt("Matematik", "Problemler", "Sayı problemleri", "25 problem"), ydt("Grammar", "Tenses", "Konu anlatımı + 30 soru"), review("Türkçe", "Dil Bilgisi", "Yazım-noktalama", "Kısa tekrar")),
    day("Çarşamba", tyt("Tarih", "Milli Mücadele", "Kongreler", "Konu özeti + 15 soru"), ydt("Reading", "Ana fikir", "3 okuma parçası"), review("Yabancı Dil", "Vocabulary", "Phrasal verbs", "Kelime defteri güncelle")),
    day("Perşembe", tyt("Coğrafya", "Harita Bilgisi", "Ölçek", "Konu anlatımı + 15 soru"), ydt("Cloze Test", "Bağlaç", "2 test çözümü"), review("Türkçe", "Paragraf", "Yardımcı düşünce", "30 paragraf")),
    day("Cuma", tyt("Felsefe", "Bilgi Felsefesi", "Bilgi kaynakları", "Kısa tekrar + 15 soru"), ydt("Translation", "İngilizceden Türkçeye", "10 çeviri cümlesi"), review("Matematik", "Oran-Orantı", "Oran kavramı", "Eksik kapatma")),
    day("Cumartesi", tyt("Din", "Din ve İslam", "İnanç", "Konu özeti + 15 soru"), ydt("Reading", "Inference", "3 okuma parçası + analiz"), review("Yabancı Dil", "Grammar", "Modals", "Yanlış analizi")),
    day("Pazar", tyt("Türkçe", "Paragraf", "Paragraf yapısı", "TYT paragraf taraması"), ydt("Vocabulary", "Sözcük anlamı", "Haftalık kelime denemesi"), review("Yabancı Dil", "Reading", "Detay soruları", "Hata defteri kapatma")),
  ],
};

const campSuggestions = {
  SAY: [
    camp("TYT Matematik 45 Gün Temel + Problemler", "TYT Matematik", "Temel Kavramlar", "Her gün 1 konu + 35 soru; 6. günde karma test."),
    camp("TYT Fizik 28 Gün Temel Kamp", "TYT Fizik", "Hareket", "Video + kısa not + 25 soru; haftada 1 mini branş denemesi."),
    camp("AYT Matematik 60 Gün Ana Gövde", "AYT Matematik", "Fonksiyonlar", "Fonksiyon, limit, türev ve integral sıralı ilerler."),
    camp("AYT Fen 8 Haftalık Tarama", "AYT Biyoloji", "Sistemler", "Fizik, kimya, biyoloji dönüşümlü konu tarama."),
  ],
  EA: [
    camp("TYT Türkçe 30 Gün Paragraf", "TYT Türkçe", "Paragraf", "Günlük 30 soru; süre ve çeldirici analizi zorunlu."),
    camp("TYT Matematik 40 Gün Problemler", "TYT Matematik", "Problemler", "Problem türleri sırayla; her 5. gün karma test."),
    camp("AYT Edebiyat 45 Gün Yazar-Eser", "AYT Edebiyat", "Cumhuriyet Dönemi", "Dönem kartları, yazar-eser tablosu ve 2 test."),
    camp("AYT Matematik 50 Gün EA Omurga", "AYT Matematik", "Limit", "Fonksiyon, limit, türev temel seviye ilerleme."),
  ],
  SOZ: [
    camp("TYT Türkçe 30 Gün Paragraf + Dil Bilgisi", "TYT Türkçe", "Paragraf", "Paragraf rutini ve haftada 2 dil bilgisi tekrarı."),
    camp("AYT Edebiyat 60 Gün Tam Tekrar", "AYT Edebiyat", "Milli Edebiyat", "Dönem, sanatçı ve eser eşleştirme döngüsü."),
    camp("AYT Tarih 35 Gün Kronoloji", "AYT Tarih", "Milli Mücadele", "Kronoloji, kavram ve harita destekli tekrar."),
    camp("Coğrafya 28 Gün Harita + Kavram", "AYT Coğrafya", "Türkiye Ekonomisi", "Harita okuma, grafik yorumlama ve kavram testi."),
  ],
  DIL: [
    camp("YDT 60 Gün Vocabulary", "YDT Yabancı Dil", "Vocabulary", "Günlük kelime, collocation ve mini tekrar."),
    camp("YDT 45 Gün Reading", "YDT Yabancı Dil", "Reading", "Her gün okuma parçası + soru tipi analizi."),
    camp("YDT Grammar 30 Gün", "YDT Yabancı Dil", "Grammar", "Tenses, modals, passive ve conditionals sıralı."),
    camp("TYT Destek 40 Gün", "TYT Matematik", "Problemler", "TYT netini korumak için temel matematik ve paragraf."),
  ],
};

const bookVideoMatches = [
  match(["345"], "345 video çözüm araması", "345 Yayınları kaynak adıyla video çözüm arar."),
  match(["3d", "3D"], "3D Yayınları video çözüm araması", "3D kaynakları için video çözüm ve kamp araması."),
  match(["limit"], "Limit Yayınları video çözüm araması", "Limit kaynağına bağlı konu anlatımı ve video çözüm araması."),
  match(["benim hocam"], "Benim Hocam kamp ve çözüm araması", "Benim Hocam kamp/playlist içeriklerini arar."),
  match(["bilgi sarmal"], "Bilgi Sarmal video çözüm araması", "Bilgi Sarmal kaynak çözüm araması."),
  match(["hız ve renk", "hiz ve renk"], "Hız ve Renk video çözüm araması", "Hız ve Renk fasikül veya test çözüm araması."),
  match(["apotemi"], "Apotemi video çözüm araması", "Apotemi fasikül ve ileri seviye çözüm araması."),
  match(["endemik"], "Endemik video çözüm araması", "Endemik kaynak çözüm araması."),
  match(["mebi", "mebİ", "mebı"], "MEBİ resmi içerik araması", "MEBİ konu anlatımı, tarama ve soru bankası araması."),
  match(["eba"], "EBA resmi içerik araması", "EBA ders anlatımı ve etkileşimli içerik araması."),
];

export function createWeeklyPlan(area = "EA", options = {}) {
  const normalizedArea = normalizeArea(area);
  const template = weeklyPlanTemplates[normalizedArea] || weeklyPlanTemplates.EA;
  const periodTarget = resolvePeriodTarget(options.periodMode, options.customPeriodCount);
  const carriedTasks = getCarryTasks(options.carryTasks || []).map((task, index) => enrichPeriodTask({
    day: DAY_ORDER[index % DAY_ORDER.length],
    block: "Devreden Çalışma",
    lesson: task.lesson || "TYT Matematik",
    topic: task.topic || "Konu girilmedi",
    subtopic: task.subtopic || "",
    task: `Devam: ${task.task || "Önceki haftadan kalan çalışma"}`,
    status: "Devam Ediyor",
    source: "Önceki haftadan devreden görev",
    level: getLessonLevel(task.lesson, options.lessonLevels, options.programLevel || task.level || "Orta"),
    periodSlot: (index % periodTarget) + 1,
    periodMode: options.periodMode || "4",
    generatedBy: options.createdBy || "system",
    createdAt: new Date().toISOString(),
  }));

  const generatedTasks = template.flatMap((dayPlan) => {
    const periods = expandDayBlocks(normalizedArea, dayPlan.blocks, periodTarget);

    return periods.map((periodBlock, index) => enrichPeriodTask({
      day: dayPlan.day,
      ...periodBlock,
      status: "Bekliyor",
      source: "Alan ve günlük saat bazlı otomatik şablon",
      level: getLessonLevel(periodBlock.lesson, options.lessonLevels, options.programLevel || determinePeriodLevel(index, periodTarget)),
      periodSlot: index + 1,
      periodMode: options.periodMode || "4",
      generatedBy: options.createdBy || "system",
      createdAt: new Date().toISOString(),
    }));
  });

  return [...carriedTasks, ...generatedTasks];
}

export function resolvePeriodTarget(periodMode = "4", customPeriodCount = 4) {
  if (periodMode === "custom") {
    return clampPeriodCount(customPeriodCount);
  }

  return clampPeriodCount(periodMode);
}

export function calculatePeriodRecommendation(task = {}) {
  const targetQuestions = Number(task.targetQuestions || extractQuestionCount(task.task) || 25);
  const level = task.level || "Orta";
  const lessonInfo = parseLesson(task.lesson);
  const stat = getTopicQuestionStat(lessonInfo.exam, lessonInfo.lesson, task.topic);
  const priorityBoost = stat?.priority === "Çok yüksek" ? 12 : stat?.priority === "Yüksek" ? 8 : stat?.priority === "Orta" ? 4 : 0;
  const levelBoost = level === "İleri" ? 15 : level === "Orta" ? 8 : 0;
  const questionBoost = targetQuestions >= 45 ? 15 : targetQuestions >= 30 ? 8 : 0;
  const minutes = Math.min(90, Math.max(35, 35 + priorityBoost + levelBoost + questionBoost));

  return {
    targetQuestions,
    periodMinutes: roundToFive(minutes),
    priority: stat?.priority || "Kapsam",
    total5Years: stat?.total5Years || 0,
  };
}

export function getProgramPhase(startDate, now = new Date()) {
  const start = parseDate(startDate) || parseDate(new Date().toISOString().slice(0, 10));
  const today = stripTime(now);
  const diffDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  const currentWeek = Math.min(40, Math.max(1, Math.floor(diffDays / 7) + 1));
  const phase = phaseDefinitions.find((item) => currentWeek >= item.weekStart && currentWeek <= item.weekEnd) || phaseDefinitions[0];
  const phaseLength = phase.weekEnd - phase.weekStart + 1;
  const weekInPhase = Math.min(phaseLength, Math.max(1, currentWeek - phase.weekStart + 1));

  return {
    currentWeek,
    totalWeeks: 40,
    weekInPhase,
    phase,
    overallProgress: Math.min(100, Math.round((currentWeek / 40) * 100)),
    phaseProgress: Math.min(100, Math.round((weekInPhase / phaseLength) * 100)),
    startDate: toDateInputValue(start),
  };
}

export function getCampSuggestions(area = "EA") {
  return campSuggestions[normalizeArea(area)] || campSuggestions.EA;
}

export function getSourceVideoMatches(resource = {}) {
  const title = resource.title || "";
  const publisher = resource.publisher || "";
  const lesson = resource.lesson || "";
  const topic = resource.topic || "";
  const haystack = `${title} ${publisher}`.toLocaleLowerCase("tr-TR");
  const matchedItems = bookVideoMatches
    .filter((item) => item.keywords.some((keyword) => haystack.includes(keyword.toLocaleLowerCase("tr-TR"))))
    .map((item) => ({
      title: item.title,
      detail: item.detail,
      url: buildYoutubeSearchUrl(`${publisher} ${title} ${lesson} ${topic} video çözüm`),
    }));

  const generic = {
    title: `${title || lesson} video çözüm araması`,
    detail: "Kaynak adı, ders ve konu bilgisiyle genel YouTube araması yapar.",
    url: buildYoutubeSearchUrl(`${publisher} ${title} ${lesson} ${topic} video çözüm soru çözümü`),
  };

  return dedupeByUrl([...matchedItems, generic]).slice(0, 3);
}

export function downloadJsonBackup(student) {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = slugify(student?.name || "ogrenci");
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "asama-16-program-otomasyonu",
    student,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}-yks-kocluk-yedek-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getWeeklyTaskCompletion(tasks = []) {
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => isCompletedStatus(task.status)).length;
  return Math.round((completed / tasks.length) * 100);
}

function day(dayName, ...blocks) {
  return { day: dayName, blocks };
}

function tyt(lesson, topic, subtopic, task) {
  return block(blockLabels.tyt, `TYT ${lesson}`, topic, subtopic, task);
}

function ayt(lesson, topic, subtopic, task) {
  return block(blockLabels.ayt, `AYT ${lesson}`, topic, subtopic, task);
}

function ydt(topic, subtopic, task) {
  return block(blockLabels.ayt, "YDT Yabancı Dil", topic, subtopic, task);
}

function review(lesson, topic, subtopic, task) {
  const examPrefix = lesson === "Yabancı Dil" ? "YDT" : "TYT";
  return block(blockLabels.review, `${examPrefix} ${lesson}`, topic, subtopic, task);
}

function block(blockName, lesson, topic, subtopic, task) {
  return { block: blockName, lesson, topic, subtopic, task };
}

function expandDayBlocks(area, blocks, periodTarget) {
  const fillers = periodFillers[area] || periodFillers.EA;
  const result = [...blocks];
  let fillerIndex = 0;

  while (result.length < periodTarget) {
    result.push(fillers[fillerIndex % fillers.length]);
    fillerIndex += 1;
  }

  return result.slice(0, periodTarget);
}

function enrichPeriodTask(task) {
  const recommendation = calculatePeriodRecommendation(task);

  return {
    ...task,
    level: task.level || "Orta",
    periodSlot: Number(task.periodSlot || 1),
    targetQuestions: Number(task.targetQuestions || recommendation.targetQuestions),
    periodMinutes: Number(task.periodMinutes || recommendation.periodMinutes),
    priority: task.priority || recommendation.priority,
    questionHistoryTotal: Number(task.questionHistoryTotal || recommendation.total5Years),
  };
}

function determinePeriodLevel(index, periodTarget) {
  const ratio = (index + 1) / periodTarget;
  if (ratio <= 0.34) return "Başlangıç";
  if (ratio <= 0.72) return "Orta";
  return "İleri";
}

function getLessonLevel(lesson, lessonLevels = {}, fallbackLevel = "Orta") {
  const normalizedKey = getLessonLevelKey(lesson);
  return lessonLevels?.[normalizedKey] || lessonLevels?.[lesson] || fallbackLevel || "Orta";
}

function getLessonLevelKey(lesson = "") {
  const value = String(lesson);
  if (value.includes("YDT")) return "YDT Yabancı Dil";
  if (value.includes("TYT")) {
    if (value.includes("Türkçe")) return "TYT Türkçe";
    if (value.includes("Matematik")) return "TYT Matematik";
    if (value.includes("Geometri")) return "TYT Geometri";
    if (value.includes("Fizik")) return "TYT Fizik";
    if (value.includes("Kimya")) return "TYT Kimya";
    if (value.includes("Biyoloji")) return "TYT Biyoloji";
    if (
      value.includes("Tarih") ||
      value.includes("Coğrafya") ||
      value.includes("Felsefe") ||
      value.includes("Din") ||
      value.includes("Sosyal")
    ) {
      return "TYT Sosyal";
    }
  }
  if (value.includes("AYT")) {
    if (value.includes("Matematik")) return "AYT Matematik";
    if (value.includes("Geometri")) return "AYT Geometri";
    if (value.includes("Fizik")) return "AYT Fizik";
    if (value.includes("Kimya")) return "AYT Kimya";
    if (value.includes("Biyoloji")) return "AYT Biyoloji";
    if (value.includes("Edebiyat")) return "AYT Edebiyat";
    if (value.includes("Tarih")) return "AYT Tarih";
    if (value.includes("Coğrafya")) return "AYT Coğrafya";
    if (value.includes("Felsefe")) return "AYT Felsefe";
    if (value.includes("Din")) return "AYT Din";
  }

  return value || "TYT Matematik";
}

function extractQuestionCount(text = "") {
  const match = String(text).match(/(\d+)\s*(soru|paragraf|test)/i);
  if (!match) return 25;
  return Number(match[1]);
}

function parseLesson(lesson = "") {
  const [exam, ...lessonParts] = String(lesson).split(" ");
  return {
    exam: exam || "TYT",
    lesson: lessonParts.join(" ") || "Matematik",
  };
}

function clampPeriodCount(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 4;
  return Math.min(10, Math.max(1, Math.round(numberValue)));
}

function roundToFive(value) {
  return Math.round(value / 5) * 5;
}

function camp(title, lesson, topic, detail) {
  return { title, lesson, topic, detail };
}

function match(keywords, title, detail) {
  return { keywords, title, detail };
}

function getCarryTasks(tasks) {
  return tasks
    .filter((task) => !isCompletedStatus(task.status))
    .slice(0, 5);
}

function isCompletedStatus(status) {
  return status === "Tamamlandı" || status === "Kontrol Edildi";
}

function normalizeArea(area) {
  if (area === "SÖZ") return "SOZ";
  if (area === "DİL") return "DIL";
  return area || "EA";
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stripTime(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function toDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayValue = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${dayValue}`;
}

function buildYoutubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
}

function dedupeByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function slugify(value) {
  return String(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
