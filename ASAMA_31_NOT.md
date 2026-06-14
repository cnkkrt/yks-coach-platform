# Aşama 31 - Öğrenci Deneme Karşılaştırma ve Haftalık Tarih Görünürlüğü

## Yapılanlar

- Öğrenci panelindeki Denemelerim ekranına iki deneme seçerek karşılaştırma özelliği eklendi.
- Karşılaştırmada ilk net, ikinci net ve net farkı özet kartları gösteriliyor.
- Seçilen iki deneme için toplam net bar grafiği eklendi.
- Ders bazlı net değişimi için pozitif/negatif yönlü karşılaştırma grafiği eklendi.
- Haftalık plan ekranına haftanın tarih aralığı eklendi.
- Haftalık plan tablosunda her günün altında ilgili tarih gösterildi.
- Program başlangıç tarihi hangi güne denk gelirse gelsin hafta Pazartesi-Pazar aralığına hizalandı.
- Mobil görünüm için karşılaştırma ve hafta tarih bileşenleri responsive hale getirildi.

## Teknik Not

Öğrenci panelinde deneme karşılaştırması yalnızca öğrencinin kendi deneme kayıtları üzerinden çalışır. Ders bazlı grafikler için denemelerde `sections` kırılımı varsa ders ders fark gösterilir; eski formatta yalnızca toplam net varsa toplam net karşılaştırması yine çalışır.

## Build Kontrolü

`npm run build` başarılı.
