# AŞAMA 30 - Yetki Temizliği ve Dosya Ayrıştırma

## Yapılanlar

### 1. Öğrenci paneli yetki temizliği
- Öğrenci paneline artık ham koç/yönetici mutasyon fonksiyonları doğrudan gönderilmiyor.
- `StudentDashboard` artık `studentActions` isimli sınırlı bir aksiyon nesnesi alıyor.
- Öğrenciye yalnızca kendi hesabı için gerekli aksiyonlar açıldı:
  - Profil/program tercih bilgilerini güncelleme
  - Haftalık görev durumunu güncelleme
  - Çalışma kaydı ekleme
  - Mesaj ekleme
  - Kaynak ilerlemesi ekleme/güncelleme
  - Video ilerlemesi güncelleme
  - Konu takip kaydı ekleme/güncelleme
  - Deneme kaydı ekleme
  - Ödev durumunu güncelleme
  - Yanlış kaydı ekleme/güncelleme

### 2. Koç paneline ait yetkilerin öğrenci panelinden koparılması
- Haftalık program şablonu uygulama yetkisi öğrenci panelinden koparıldı.
- Haftalık çalışma saati ekleme yetkisi öğrenci panelinden koparıldı.
- Haftalık çalışma silme yetkisi öğrenci panelinden koparıldı.
- Kamp önerisini doğrudan haftalık plana ekleme işlemi öğrenci tarafında mutasyon yapmayacak şekilde kapatıldı.

### 3. Dosya ayrıştırma
- `StudentDashboard.jsx` ve `StudentDetailPage.jsx` içinde tekrar eden sınav/soru/hafta/süreç sabitleri ayrıştırıldı.
- Yeni dosya:
  - `src/data/examConfig.js`
- Taşınan ortak sabitler:
  - `EXAM_SUBJECTS`
  - `EXAM_QUESTION_COUNTS`
  - `WEEK_DAYS`
  - `studyRecordTypes`
  - `studyStatuses`
  - `errorTypes`

### 4. Build doğrulaması
- `npm install` çalıştırıldı.
- `npm run build` başarılı tamamlandı.

## Sonraki önerilen aşama
Aşama 31 için öneri:
- `StudentDashboard.jsx` dosyasını gerçek alt componentlere böl:
  - `StudentOverviewSection`
  - `StudentWeeklyPlanSection`
  - `StudentStudyRecordsSection`
  - `StudentResourcesSection`
  - `StudentExamsSection`
  - `StudentErrorsSection`
  - `StudentMessagesSection`
- `StudentDetailPage.jsx` için koç yönetim sekmelerini ayrı componentlere taşı.
- Basit front-end guard yerine backend destekli rol bazlı yetkilendirme ekle.
