# Aşama 36 - Profesyonel Koçluk Omurgası

Bu aşamada ürünün “ödev verilen yer” olmaktan çıkıp koçluk takip sistemi gibi davranması hedeflendi.

## Eklenenler

- Öğrenci Karnesi
  - TYT net
  - AYT net
  - Haftalık plan yüzdesi
  - Çözülen soru sayısı
  - Eksik konu sayısı
  - Çalışma başarı oranı
  - Risk durumu

- Risk Skoru
  - Haftalık plan tamamlama
  - Ödev tamamlama
  - Eksik konu yoğunluğu
  - TYT/AYT net trendi
  - Günlük çalışma verisi

- Eksik Konu Önceliklendirme
  - Yanlış analizi ve konu takibi verisi beraber okunur.
  - Öğrenciye öneri metni üretilir.
  - Yüksek/Orta/Düşük öncelik ayrımı yapılır.

- Koç Risk Radarı
  - Koç ana panelinde en riskli öğrenciler öne çıkar.
  - Her kartta netler, plan oranı, eksik konu ve risk gerekçeleri görünür.
  - Koç doğrudan öğrenci detayına geçebilir.

## Teknik Not

Yeni ortak analiz dosyası:
`src/utils/studentAnalytics.js`

Bu dosya ileride PDF rapor, alarm merkezi ve akıllı haftalık plan önerileri için merkezi hesaplama katmanı olarak kullanılacak.
