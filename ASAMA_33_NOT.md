# Aşama 33 - Profesyonel Koç Raporları ve Kaynak Mimarisi

## Yapılanlar

### Koç raporları profesyonelleştirildi
- Koç paneline grafik destekli “Profesyonel Koç Raporları” bölümü eklendi.
- Genel sağlık skoru, risk, ödev, kaynak, TYT ve AYT ortalamaları tek raporda toplandı.
- Öğrenci bazlı TYT netleri, kaynak ilerlemesi, ödev tamamlama ve açık yanlış grafikleri eklendi.
- Risk/kaynak/ödev içgörü kartları oluşturuldu.
- Öğrenci bazlı koç aksiyonu önerileri tabloya eklendi.
- PDF çıktı için “PDF / Yazdır” düğmesi eklendi.

### Kaynak mimarisi ayrıştırıldı
- Öğrenci ekranında yalnızca “Kaynaklarım” kaldı.
- Öğrenciye açık kaynak kütüphanesi bölümü kaldırıldı.
- Koç ekranına “Kaynak Kütüphanesi” eklendi.
- Koç ortak kaynak havuzundan seçili öğrenciye kaynak atayabiliyor.
- Admin ekranına “Genel Kaynak Havuzu Yönetimi” eklendi.
- Ortak kaynak havuzu `src/data/resourceLibraryData.js` dosyasına taşındı.

## Rol ayrımı

- Öğrenci: Kendisine atanmış veya kendi eklediği kaynakları görür, ilerleme girer.
- Koç: Kaynak kütüphanesinden öğrenciye kaynak atar ve raporları takip eder.
- Admin: Genel kaynak havuzunu kurumsal seviyede görür.

## Doğrulama
- npm install
- npm run build
