export const demoStudents = [
  {
    id: 1,
    name: "Ali Yılmaz",
    grade: "12",
    school: "Bozyaka Şehit Fethi Bey Anadolu Lisesi",
    scoreType: "SAY",
    targetDepartment: "Tıp",
    targetUniversity: "Ege Üniversitesi",
    lastTytNet: 72.5,
    lastAytNet: 48.75,
    topicProgress: 46,
    resourceProgress: 58,
    homeworkCompletion: 67,
    riskLevel: "Orta",
    coachNote: "Matematik problemlerinde süre yönetimi güçlendirilmeli.",
    weeklyTasks: [
      {
        id: "task-1-1",
        day: "Pazartesi",
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        task: "40 soru çöz",
        status: "Tamamlandı"
      },
      {
        id: "task-1-2",
        day: "Salı",
        lesson: "TYT Türkçe",
        topic: "Paragraf",
        subtopic: "Ana düşünce",
        task: "30 soru çöz",
        status: "Devam Ediyor"
      },
      {
        id: "task-1-3",
        day: "Çarşamba",
        lesson: "AYT Biyoloji",
        topic: "Sistemler",
        subtopic: "Dolaşım sistemi",
        task: "Konu tekrarı + 25 soru",
        status: "Bekliyor"
      }
    ],
    homeworks: [
      {
        id: "homework-1-1",
        title: "Problemler karma test",
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        dueDate: "2026-05-27",
        description: "MEBİ Problemler modülünden 3 test + yanlış analizi yapılacak.",
        status: "Verildi",
        feedback: ""
      },
      {
        id: "homework-1-2",
        title: "Paragraf hız çalışması",
        lesson: "TYT Türkçe",
        topic: "Paragraf",
        subtopic: "Ana düşünce",
        dueDate: "2026-05-25",
        description: "30 paragraf sorusu çözülecek, süre notu yazılacak.",
        status: "Tamamlandı",
        feedback: "Süre ortalaması not edilmeli."
      },
      {
        id: "homework-1-3",
        title: "Biyoloji sistemler tekrar",
        lesson: "AYT Biyoloji",
        topic: "Sistemler",
        subtopic: "Dolaşım sistemi",
        dueDate: "2026-05-29",
        description: "Dolaşım ve sindirim sistemi konu tekrarı yapılacak.",
        status: "Kontrol Edildi",
        feedback: "Kavram haritası başarılı."
      }
    ],
    studyRecords: [
      {
        id: "study-1-1",
        date: "2026-05-24",
        recordType: "Konu Tarama Testi",
        exam: "TYT",
        lesson: "Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        source: "345 TYT Matematik",
        targetQuestions: 40,
        solvedQuestions: 38,
        correct: 27,
        wrong: 8,
        duration: 52,
        status: "Kontrol Edildi",
        studentNote: "Yaş problemlerinde süre uzadı.",
        coachNote: "Yanlış defterine 5 soru aktarılacak.",
        createdBy: "student"
      },
      {
        id: "study-1-2",
        date: "2026-05-25",
        recordType: "Paragraf Rutini",
        exam: "TYT",
        lesson: "Türkçe",
        topic: "Paragraf",
        subtopic: "Ana düşünce",
        source: "Paragraf kampı",
        targetQuestions: 30,
        solvedQuestions: 30,
        correct: 24,
        wrong: 4,
        duration: 36,
        status: "Öğrenci Girdi",
        studentNote: "İki soruda çeldiriciye takıldım.",
        coachNote: "",
        createdBy: "student"
      }
    ],
    messages: [
      {
        id: "message-1-1",
        sender: "coach",
        senderName: "Koç",
        category: "Ödev",
        text: "Bugünkü paragraf rutininden sonra yanlışlarını konu başlığıyla işaretle.",
        createdAt: "2026-05-24T18:20:00.000Z"
      },
      {
        id: "message-1-2",
        sender: "student",
        senderName: "Ali Yılmaz",
        category: "Deneme",
        text: "Hocam TYT matematikte problem sorularında süre yetmedi, tekrar planlayabilir miyiz?",
        createdAt: "2026-05-25T08:30:00.000Z"
      }
    ],
    resources: [
      {
        id: "resource-1-1",
        title: "345 TYT Matematik Soru Bankası",
        publisher: "345 Yayınları",
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        resourceType: "Soru Bankası",
        unitLabel: "soru",
        totalUnits: 1200,
        completedUnits: 720,
        status: "Devam Ediyor",
        dueDate: "2026-06-10",
        note: "Problemler ve fonksiyonlar bölümü öncelikli."
      },
      {
        id: "resource-1-2",
        title: "Limit AYT Biyoloji",
        publisher: "Limit Yayınları",
        lesson: "AYT Biyoloji",
        topic: "Sistemler",
        subtopic: "Dolaşım sistemi",
        resourceType: "Konu Anlatımı",
        unitLabel: "sayfa",
        totalUnits: 260,
        completedUnits: 180,
        status: "Devam Ediyor",
        dueDate: "2026-06-18",
        note: "Sistemler ünitesi tekrar edilecek."
      }
    ],
    topicTracking: [
      {
        id: "topic-1-1",
        exam: "TYT",
        lesson: "Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        status: "Tamamlandı",
        note: "Süre yönetimi için haftalık karma test devam edecek."
      },
      {
        id: "topic-1-2",
        exam: "TYT",
        lesson: "Türkçe",
        topic: "Paragraf",
        subtopic: "Ana düşünce",
        status: "Devam Ediyor",
        note: "Günlük 30 soru rutini korunacak."
      },
      {
        id: "topic-1-3",
        exam: "AYT",
        lesson: "Biyoloji",
        topic: "Sistemler",
        subtopic: "Dolaşım sistemi",
        status: "Tekrar Gerekli",
        note: "Dolaşım sistemi tekrar edilmeli."
      }
    ],
    exams: [
      {
        name: "TYT Genel Deneme 1",
        date: "2026-05-01",
        tytNet: 68.25,
        aytNet: 42.5
      },
      {
        name: "TYT Genel Deneme 2",
        date: "2026-05-08",
        tytNet: 70.75,
        aytNet: 45.25
      },
      {
        name: "TYT Genel Deneme 3",
        date: "2026-05-15",
        examType: "TYT",
        tytNet: 72.5,
        aytNet: 48.75,
        sections: [
          { lesson: "Türkçe", correct: 29, wrong: 8, blank: 3 },
          { lesson: "Matematik", correct: 24, wrong: 11, blank: 5 },
          { lesson: "Fizik", correct: 4, wrong: 2, blank: 1 },
          { lesson: "Kimya", correct: 5, wrong: 1, blank: 1 },
          { lesson: "Biyoloji", correct: 4, wrong: 1, blank: 1 },
          { lesson: "Tarih", correct: 4, wrong: 1, blank: 0 },
          { lesson: "Coğrafya", correct: 4, wrong: 1, blank: 0 },
          { lesson: "Felsefe", correct: 4, wrong: 1, blank: 0 },
          { lesson: "Din", correct: 4, wrong: 0, blank: 1 }
        ]
      }
    ],
    errors: [
      {
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Sayı problemleri",
        type: "İşlem Hatası",
        count: 6
      },
      {
        lesson: "TYT Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        type: "Kavram Eksikliği",
        count: 4
      },
      {
        lesson: "TYT Türkçe",
        topic: "Paragraf",
        subtopic: "Ana düşünce",
        type: "Dikkat Hatası",
        count: 3
      }
    ]
  },
  {
    id: 2,
    name: "Zeynep Demir",
    grade: "12",
    school: "Bozyaka Şehit Fethi Bey Anadolu Lisesi",
    scoreType: "EA",
    targetDepartment: "Hukuk",
    targetUniversity: "Dokuz Eylül Üniversitesi",
    lastTytNet: 81.25,
    lastAytNet: 55.5,
    topicProgress: 64,
    resourceProgress: 72,
    homeworkCompletion: 100,
    riskLevel: "Düşük",
    coachNote: "Düzenli ilerliyor. Edebiyat tekrarları aksatılmamalı.",
    weeklyTasks: [
      {
        id: "task-2-1",
        day: "Pazartesi",
        lesson: "AYT Edebiyat",
        topic: "Cumhuriyet Dönemi",
        subtopic: "Yazar-eser eşleştirme",
        task: "Konu tekrarı",
        status: "Tamamlandı"
      },
      {
        id: "task-2-2",
        day: "Salı",
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Yaş problemleri",
        task: "35 soru çöz",
        status: "Tamamlandı"
      }
    ],
    homeworks: [
      {
        id: "homework-2-1",
        title: "Cumhuriyet dönemi yazar eşleştirme",
        lesson: "AYT Edebiyat",
        topic: "Cumhuriyet Dönemi",
        subtopic: "Yazar-eser eşleştirme",
        dueDate: "2026-05-26",
        description: "Yazar-eser tablosu çıkarılacak ve 2 test çözülecek.",
        status: "Kontrol Edildi",
        feedback: "Tamamlandı, tekrar tarihi 30 Mayıs."
      },
      {
        id: "homework-2-2",
        title: "TYT problem rutini",
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Yaş problemleri",
        dueDate: "2026-05-24",
        description: "35 soru, yanlışlar konu başlığına göre ayrılacak.",
        status: "Tamamlandı",
        feedback: ""
      }
    ],
    resources: [
      {
        id: "resource-2-1",
        title: "Paragraf 30 Gün Kampı",
        publisher: "Benim Hocam",
        lesson: "TYT Türkçe",
        topic: "Paragraf",
        subtopic: "Yardımcı düşünce",
        resourceType: "Video Kamp",
        unitLabel: "video",
        totalUnits: 30,
        completedUnits: 24,
        status: "Devam Ediyor",
        dueDate: "2026-06-05",
        note: "Günlük süre takibi yazılacak."
      },
      {
        id: "resource-2-2",
        title: "AYT Edebiyat Fasikülleri",
        publisher: "Hız ve Renk",
        lesson: "AYT Edebiyat",
        topic: "Cumhuriyet Dönemi",
        subtopic: "Yazar-eser eşleştirme",
        resourceType: "Fasikül",
        unitLabel: "test",
        totalUnits: 42,
        completedUnits: 42,
        status: "Tamamlandı",
        dueDate: "2026-05-30",
        note: "Cumhuriyet dönemi tekrar testi kaldı."
      }
    ],
    topicTracking: [
      {
        id: "topic-2-1",
        exam: "AYT",
        lesson: "Edebiyat",
        topic: "Cumhuriyet Dönemi",
        subtopic: "Yazar-eser eşleştirme",
        status: "Tamamlandı",
        note: "Yazar-eser eşleştirmesi iyi durumda."
      },
      {
        id: "topic-2-2",
        exam: "TYT",
        lesson: "Matematik",
        topic: "Problemler",
        subtopic: "Yaş problemleri",
        status: "Tamamlandı",
        note: "Rutin korunacak."
      },
      {
        id: "topic-2-3",
        exam: "TYT",
        lesson: "Türkçe",
        topic: "Paragraf",
        subtopic: "Yardımcı düşünce",
        status: "Devam Ediyor",
        note: "Süre takibi yapılacak."
      }
    ],
    exams: [
      {
        name: "EA Deneme 1",
        date: "2026-05-01",
        tytNet: 78,
        aytNet: 51
      },
      {
        name: "EA Deneme 2",
        date: "2026-05-08",
        tytNet: 80.5,
        aytNet: 54.25
      },
      {
        name: "EA Deneme 3",
        date: "2026-05-15",
        examType: "AYT-EA",
        tytNet: 81.25,
        aytNet: 55.5,
        sections: [
          { lesson: "Matematik", correct: 30, wrong: 7, blank: 3 },
          { lesson: "Edebiyat", correct: 20, wrong: 3, blank: 1 },
          { lesson: "Tarih", correct: 7, wrong: 2, blank: 1 },
          { lesson: "Coğrafya", correct: 2, wrong: 4, blank: 0 }
        ]
      }
    ],
    errors: [
      {
        lesson: "AYT Edebiyat",
        topic: "Cumhuriyet Dönemi",
        subtopic: "Yazar-eser eşleştirme",
        type: "Bilgi Eksiği",
        count: 5
      },
      {
        lesson: "TYT Matematik",
        topic: "Problemler",
        subtopic: "Yaş problemleri",
        type: "Süre Yetmedi",
        count: 4
      }
    ]
  },
  {
    id: 3,
    name: "Mehmet Kaya",
    grade: "11",
    school: "Bozyaka Şehit Fethi Bey Anadolu Lisesi",
    scoreType: "SAY",
    targetDepartment: "Bilgisayar Mühendisliği",
    targetUniversity: "İTÜ",
    lastTytNet: 54.75,
    lastAytNet: 28.25,
    topicProgress: 31,
    resourceProgress: 40,
    homeworkCompletion: 0,
    riskLevel: "Yüksek",
    coachNote: "Ödev takibi zayıf. Haftalık plan daha küçük parçalara bölünmeli.",
    weeklyTasks: [
      {
        id: "task-3-1",
        day: "Pazartesi",
        lesson: "TYT Matematik",
        topic: "Temel Kavramlar",
        subtopic: "Tek-çift sayılar",
        task: "Konu tekrarı + 30 soru",
        status: "Eksik"
      },
      {
        id: "task-3-2",
        day: "Salı",
        lesson: "TYT Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        task: "Video izle + 20 soru",
        status: "Bekliyor"
      }
    ],
    homeworks: [
      {
        id: "homework-3-1",
        title: "Temel kavramlar tekrar",
        lesson: "TYT Matematik",
        topic: "Temel Kavramlar",
        subtopic: "Tek-çift sayılar",
        dueDate: "2026-05-25",
        description: "Konu özeti okunacak, 30 soru çözülecek.",
        status: "Eksik",
        feedback: "Ödev tamamlanmadı."
      },
      {
        id: "homework-3-2",
        title: "Fizik hareket videosu",
        lesson: "TYT Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        dueDate: "2026-05-28",
        description: "Video izlenecek ve 20 soru çözülecek.",
        status: "Verildi",
        feedback: ""
      }
    ],
    resources: [
      {
        id: "resource-3-1",
        title: "TYT Matematik Temel Kamp",
        publisher: "MEBİ",
        lesson: "TYT Matematik",
        topic: "Temel Kavramlar",
        subtopic: "Tek-çift sayılar",
        resourceType: "Video Kamp",
        unitLabel: "video",
        totalUnits: 45,
        completedUnits: 12,
        status: "Devam Ediyor",
        dueDate: "2026-06-20",
        note: "Temel kavramlar bitmeden problemler açılmayacak."
      },
      {
        id: "resource-3-2",
        title: "TYT Fizik Hareket Fasikülü",
        publisher: "Bilgi Sarmal",
        lesson: "TYT Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        resourceType: "Fasikül",
        unitLabel: "test",
        totalUnits: 18,
        completedUnits: 3,
        status: "Planlandı",
        dueDate: "2026-06-08",
        note: "Video sonrası testlere geçilecek."
      }
    ],
    topicTracking: [
      {
        id: "topic-3-1",
        exam: "TYT",
        lesson: "Matematik",
        topic: "Temel Kavramlar",
        subtopic: "Tek-çift sayılar",
        status: "Tekrar Gerekli",
        note: "Eksik ödevle bağlantılı, küçük parçalara bölünecek."
      },
      {
        id: "topic-3-2",
        exam: "TYT",
        lesson: "Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        status: "Başlanmadı",
        note: "Video + temel test planlandı."
      },
      {
        id: "topic-3-3",
        exam: "AYT",
        lesson: "Matematik",
        topic: "Fonksiyonlar",
        subtopic: "Fonksiyon grafikleri",
        status: "Devam Ediyor",
        note: "Önce TYT temel kavramlarla desteklenecek."
      }
    ],
    exams: [
      {
        name: "TYT Deneme 1",
        date: "2026-05-01",
        tytNet: 57,
        aytNet: 30
      },
      {
        name: "TYT Deneme 2",
        date: "2026-05-08",
        tytNet: 55.5,
        aytNet: 29
      },
      {
        name: "TYT Deneme 3",
        date: "2026-05-15",
        examType: "TYT",
        tytNet: 54.75,
        aytNet: 28.25,
        sections: [
          { lesson: "Türkçe", correct: 25, wrong: 10, blank: 5 },
          { lesson: "Matematik", correct: 14, wrong: 12, blank: 14 },
          { lesson: "Fizik", correct: 3, wrong: 3, blank: 1 },
          { lesson: "Kimya", correct: 3, wrong: 2, blank: 2 },
          { lesson: "Biyoloji", correct: 2, wrong: 2, blank: 2 },
          { lesson: "Tarih", correct: 4, wrong: 1, blank: 0 },
          { lesson: "Coğrafya", correct: 3, wrong: 1, blank: 1 },
          { lesson: "Felsefe", correct: 3, wrong: 1, blank: 1 },
          { lesson: "Din", correct: 5, wrong: 0, blank: 0 }
        ]
      }
    ],
    errors: [
      {
        lesson: "TYT Matematik",
        topic: "Temel Kavramlar",
        subtopic: "Tek-çift sayılar",
        type: "Bilgi Eksiği",
        count: 9
      },
      {
        lesson: "TYT Fizik",
        topic: "Hareket",
        subtopic: "Grafik yorumlama",
        type: "Kavram Yanılgısı",
        count: 6
      },
      {
        lesson: "TYT Kimya",
        topic: "Atom ve Periyodik Sistem",
        subtopic: "Periyodik özellikler",
        type: "Boş Bırakma",
        count: 5
      }
    ]
  }
];

export const topicGroups = [
  {
    exam: "TYT",
    lesson: "Matematik",
    topics: ["Temel Kavramlar", "Sayı Basamakları", "Problemler", "Oran-Orantı", "Fonksiyonlar"],
    subtopics: {
      "Temel Kavramlar": ["Sayı kümeleri", "Tek-çift sayılar", "Pozitif-negatif sayılar", "Ardışık sayılar"],
      "Sayı Basamakları": ["Basamak değeri", "Çözümleme", "Rakam problemleri"],
      Problemler: ["Sayı problemleri", "Yaş problemleri", "İşçi-havuz problemleri", "Hız problemleri"],
      "Oran-Orantı": ["Oran kavramı", "Doğru orantı", "Ters orantı", "Karışım problemleri"],
      Fonksiyonlar: ["Fonksiyon kavramı", "Tanım-değer kümesi", "Bileşke fonksiyon"]
    }
  },
  {
    exam: "TYT",
    lesson: "Türkçe",
    topics: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Dil Bilgisi"],
    subtopics: {
      "Sözcükte Anlam": ["Gerçek-mecaz anlam", "Terim anlam", "Sözcükte anlam ilişkileri"],
      "Cümlede Anlam": ["Neden-sonuç", "Amaç-sonuç", "Karşılaştırma", "Öznel-nesnel yargı"],
      Paragraf: ["Ana düşünce", "Yardımcı düşünce", "Paragraf yapısı", "Anlatım teknikleri"],
      "Dil Bilgisi": ["Sözcük türleri", "Cümlenin ögeleri", "Fiilimsi", "Yazım-noktalama"]
    }
  },
  {
    exam: "TYT",
    lesson: "Tarih",
    topics: ["Tarih Bilimine Giriş", "İlk Türk Devletleri", "İslam Tarihi", "Osmanlı Kuruluş", "Milli Mücadele"],
    subtopics: {
      "Tarih Bilimine Giriş": ["Tarihin konusu", "Tarih kaynakları", "Zaman ve takvim"],
      "İlk Türk Devletleri": ["Asya Hun Devleti", "Göktürkler", "Uygurlar"],
      "İslam Tarihi": ["Hz. Muhammed dönemi", "Dört Halife", "Emeviler-Abbasiler"],
      "Osmanlı Kuruluş": ["Beylikten devlete", "İskan politikası", "Tımar sistemi"],
      "Milli Mücadele": ["Kongreler", "Cepheler", "Antlaşmalar"]
    }
  },
  {
    exam: "TYT",
    lesson: "Coğrafya",
    topics: ["Doğa ve İnsan", "Harita Bilgisi", "İklim Bilgisi", "Nüfus ve Yerleşme", "Türkiye'nin Yer Şekilleri"],
    subtopics: {
      "Doğa ve İnsan": ["Doğal ortam", "İnsan-doğa etkileşimi", "Coğrafyanın bölümleri"],
      "Harita Bilgisi": ["Ölçek", "Koordinat sistemi", "Harita okuma"],
      "İklim Bilgisi": ["Sıcaklık", "Basınç ve rüzgarlar", "Yağış türleri"],
      "Nüfus ve Yerleşme": ["Nüfus özellikleri", "Göçler", "Yerleşme tipleri"],
      "Türkiye'nin Yer Şekilleri": ["Dağlar", "Ovalar", "Akarsular"]
    }
  },
  {
    exam: "TYT",
    lesson: "Felsefe",
    topics: ["Felsefeye Giriş", "Bilgi Felsefesi", "Varlık Felsefesi", "Ahlak Felsefesi"],
    subtopics: {
      "Felsefeye Giriş": ["Felsefenin anlamı", "Felsefi düşüncenin özellikleri", "Felsefe-bilim ilişkisi"],
      "Bilgi Felsefesi": ["Bilgi türleri", "Doğruluk-gerçeklik", "Bilgi kaynakları"],
      "Varlık Felsefesi": ["Varlık problemi", "Materyalizm", "İdealizm"],
      "Ahlak Felsefesi": ["İyi-kötü", "Özgürlük", "Evrensel ahlak yasası"]
    }
  },
  {
    exam: "TYT",
    lesson: "Din",
    topics: ["Din ve İslam", "İbadet", "Ahlak", "Hz. Muhammed", "Kur'an ve Yorumu"],
    subtopics: {
      "Din ve İslam": ["İnanç", "İslam'ın şartları", "Tevhid"],
      İbadet: ["Namaz", "Oruç", "Zekat"],
      Ahlak: ["Güzel ahlak", "Sorumluluk", "Kul hakkı"],
      "Hz. Muhammed": ["Hayatı", "Örnek kişiliği", "Sünnet"],
      "Kur'an ve Yorumu": ["Ayet", "Sure", "Meal-tefsir"]
    }
  },
  {
    exam: "TYT",
    lesson: "Fizik",
    topics: ["Fizik Bilimine Giriş", "Hareket", "Kuvvet", "Enerji", "Elektrik"],
    subtopics: {
      "Fizik Bilimine Giriş": ["Fizik alt alanları", "Temel büyüklükler", "Birim dönüşümleri"],
      Hareket: ["Konum", "Hız", "İvme", "Grafik yorumlama"],
      Kuvvet: ["Net kuvvet", "Sürtünme kuvveti", "Denge"],
      Enerji: ["İş", "Kinetik enerji", "Potansiyel enerji", "Enerji korunumu"],
      Elektrik: ["Elektrik yükü", "Akım", "Direnç", "Devreler"]
    }
  },
  {
    exam: "TYT",
    lesson: "Kimya",
    topics: ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler"],
    subtopics: {
      "Kimya Bilimi": ["Kimyanın alanları", "Laboratuvar güvenliği", "Kimyasal semboller"],
      "Atom ve Periyodik Sistem": ["Atom modelleri", "Periyodik özellikler", "Element sınıfları"],
      "Kimyasal Türler Arası Etkileşimler": ["İyonik bağ", "Kovalent bağ", "Zayıf etkileşimler"]
    }
  },
  {
    exam: "TYT",
    lesson: "Biyoloji",
    topics: ["Canlıların Temel Bileşenleri", "Hücre", "Canlıların Sınıflandırılması", "Ekoloji"],
    subtopics: {
      "Canlıların Temel Bileşenleri": ["Karbonhidrat", "Protein", "Yağ", "Enzimler"],
      Hücre: ["Hücre zarı", "Organeller", "Madde geçişleri"],
      "Canlıların Sınıflandırılması": ["Sınıflandırma basamakları", "Canlı alemleri", "Virüsler"],
      Ekoloji: ["Ekosistem", "Besin zinciri", "Madde döngüleri"]
    }
  },
  {
    exam: "AYT",
    lesson: "Matematik",
    topics: ["Fonksiyonlar", "Polinomlar", "Trigonometri", "Limit", "Türev", "İntegral"],
    subtopics: {
      Fonksiyonlar: ["Fonksiyon grafikleri", "Bileşke fonksiyon", "Ters fonksiyon"],
      Polinomlar: ["Polinom derecesi", "Bölme işlemi", "Kalan teoremi"],
      Trigonometri: ["Açı ölçüleri", "Trigonometrik oranlar", "Toplam-fark formülleri"],
      Limit: ["Limit kavramı", "Sağ-sol limit", "Süreklilik"],
      Türev: ["Türev kuralları", "Teğet-normal", "Artan-azalan fonksiyon"],
      İntegral: ["Belirsiz integral", "Belirli integral", "Alan hesabı"]
    }
  },
  {
    exam: "AYT",
    lesson: "Edebiyat",
    topics: ["Şiir Bilgisi", "Tanzimat", "Servetifünun", "Milli Edebiyat", "Cumhuriyet Dönemi"],
    subtopics: {
      "Şiir Bilgisi": ["Nazım birimi", "Kafiye-redif", "Söz sanatları"],
      Tanzimat: ["Tanzimat şiiri", "Tanzimat romanı", "Dönem sanatçıları"],
      Servetifünun: ["Şiir anlayışı", "Roman-hikaye", "Dönem sanatçıları"],
      "Milli Edebiyat": ["Dil anlayışı", "Şiir", "Roman-hikaye"],
      "Cumhuriyet Dönemi": ["Şiir akımları", "Roman", "Yazar-eser eşleştirme"]
    }
  },
  {
    exam: "AYT",
    lesson: "Fizik",
    topics: ["Vektörler", "Bağıl Hareket", "Newton Yasaları", "Elektrik ve Manyetizma", "Modern Fizik"],
    subtopics: {
      Vektörler: ["Vektör toplama", "Bileşenlere ayırma", "Kuvvet dengesi"],
      "Bağıl Hareket": ["Bağıl hız", "Nehir problemleri", "Yağmur problemleri"],
      "Newton Yasaları": ["Eylemsizlik", "Dinamiğin temel yasası", "Etki-tepki"],
      "Elektrik ve Manyetizma": ["Elektrik alan", "Manyetik alan", "İndüksiyon"],
      "Modern Fizik": ["Fotoelektrik", "Atom modelleri", "Radyoaktivite"]
    }
  },
  {
    exam: "AYT",
    lesson: "Kimya",
    topics: ["Modern Atom Teorisi", "Gazlar", "Kimyasal Tepkimelerde Enerji", "Organik Kimya"],
    subtopics: {
      "Modern Atom Teorisi": ["Kuantum sayıları", "Orbital", "Elektron dizilimi"],
      Gazlar: ["Gaz yasaları", "İdeal gaz denklemi", "Kısmi basınç"],
      "Kimyasal Tepkimelerde Enerji": ["Entalpi", "Bağ enerjisi", "Tepkime ısısı"],
      "Organik Kimya": ["Hidrokarbonlar", "Fonksiyonel gruplar", "İzomeri"]
    }
  },
  {
    exam: "AYT",
    lesson: "Biyoloji",
    topics: ["Hücre Bölünmeleri", "Kalıtım", "Sistemler", "Bitki Biyolojisi", "Ekoloji"],
    subtopics: {
      "Hücre Bölünmeleri": ["Mitoz", "Mayoz", "Eşeysiz üreme"],
      Kalıtım: ["Mendel genetiği", "Eş baskınlık", "Soy ağacı"],
      Sistemler: ["Sindirim sistemi", "Dolaşım sistemi", "Solunum sistemi", "Sinir sistemi"],
      "Bitki Biyolojisi": ["Bitki dokuları", "Taşıma", "Fotosentez"],
      Ekoloji: ["Popülasyon", "Komünite", "Ekolojik döngüler"]
    }
  },
  {
    exam: "AYT",
    lesson: "Tarih",
    topics: ["Beylikten Devlete", "Dünya Gücü Osmanlı", "Milli Mücadele", "Atatürkçülük"],
    subtopics: {
      "Beylikten Devlete": ["Kuruluş dönemi", "İskan politikası", "Tımar sistemi"],
      "Dünya Gücü Osmanlı": ["Yükselme dönemi", "Merkezi otorite", "Denizcilik"],
      "Milli Mücadele": ["Kongreler", "Cepheler", "Antlaşmalar"],
      Atatürkçülük: ["İlkeler", "İnkılaplar", "Dış politika"]
    }
  },
  {
    exam: "AYT",
    lesson: "Coğrafya",
    topics: ["Ekosistemler", "Nüfus Politikaları", "Türkiye Ekonomisi", "Küresel Ortam"],
    subtopics: {
      Ekosistemler: ["Biyomlar", "Madde döngüleri", "Enerji akışı"],
      "Nüfus Politikaları": ["Nüfus artışı", "Göçler", "Demografik yapı"],
      "Türkiye Ekonomisi": ["Tarım", "Sanayi", "Ulaşım", "Turizm"],
      "Küresel Ortam": ["Küresel ticaret", "Bölgeler", "Çevre sorunları"]
    }
  },
  {
    exam: "YDT",
    lesson: "Yabancı Dil",
    topics: ["Vocabulary", "Grammar", "Reading", "Cloze Test", "Translation"],
    subtopics: {
      Vocabulary: ["Sözcük anlamı", "Phrasal verbs", "Collocations"],
      Grammar: ["Tenses", "Modals", "Passive voice", "Conditionals"],
      Reading: ["Ana fikir", "Detay soruları", "Inference"],
      "Cloze Test": ["Bağlaç", "Edat", "Zaman uyumu"],
      Translation: ["Türkçeden İngilizceye", "İngilizceden Türkçeye", "Anlam bütünlüğü"]
    }
  }
];
