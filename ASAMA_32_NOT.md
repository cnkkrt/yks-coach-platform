# Aşama 32 - Koç Raporları, PDF Çıktı ve Öğrenci Sayfası Fix

## Düzeltilen kritik hata
- Öğrenci sayfasının açılmama sebebi giderildi.
- `StudentDashboard.jsx` içinde `compareExamAId` ve `compareExamBId` state değerleri oluşturulmadan önce `getExamComparison(...)` çağrılıyordu.
- Bu durum render sırasında hata oluşturuyordu.
- State tanımları yukarı alındı; karşılaştırma verisi state oluşturulduktan sonra hesaplanıyor.

## Haftalık plan görünürlüğü
- Haftalık planda tarih aralığı korunuyor.
- Her günün altında tarih etiketi görünmeye devam ediyor.
- Faz bilgisindeki şu alanlar haftalık plan içine görünür kart olarak eklendi:
  - Deneme ritmi
  - Haftanın ana odağı
- Örnek:
  - Haftada 2 TYT + 1 AYT/YDT denemesi
  - Genel deneme, son tekrar ve yanlış kapatma

## Koç raporları
- Öğrenci detayındaki Raporlar bölümü genişletildi.
- Rapor artık grafik destekli detaylı koç analizine sahip:
  - Ders bazlı deneme netleri
  - Haftalık plan durum dağılımı
  - Hata tipi dağılımı
  - Kaynak ilerleme grafikleri
- Koç gözlem tablosu eklendi:
  - Deneme performansı
  - Haftalık plan disiplini
  - Hata kapatma
  - Kaynak ilerlemesi
  - Konu hakimiyeti
- Önümüzdeki 7 gün için koçluk talimatları eklendi.

## PDF çıktı
- Rapor merkezindeki `Yazdır / PDF` düğmesi korunup güçlendirildi.
- Print CSS eklendi.
- Yazdırma/PDF sırasında menüler ve butonlar gizlenir.
- Rapor içeriği sayfada temiz çıktı verecek şekilde düzenlendi.

## Test
- `npm run build` başarılı.
