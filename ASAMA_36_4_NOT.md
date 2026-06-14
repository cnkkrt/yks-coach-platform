# Aşama 36.4 - YouTube Tüm Ders Görünürlüğü Düzeltmesi

## Sorun
Aşama 36.3'te `YKS LİNK.zip` içindeki video havuzu alınmıştı; ancak öğrenci ekranındaki video modülü varsayılan olarak yalnızca `TYT + Başlangıç + Türkçe` filtresiyle açılıyordu. Bu nedenle kullanıcı arayüzünde videolar yalnızca Türkçe/Paragraf tarafındaymış gibi görünüyordu.

## Düzeltme
- `VideoLessons.jsx` filtresi yeniden düzenlendi.
- Varsayılan seçim `Tümü / Tümü / Tümü` yapıldı.
- TYT ve AYT listeleri birlikte görünür hale getirildi.
- Başlangıç, Orta, İleri seviyeleri birlikte görünür hale getirildi.
- Türkçe dışındaki dersler de ilk açılışta görünür hale getirildi.
- Ders sekmeleri veri havuzundan dinamik türetilir hale getirildi.
- Sabit ders listesinde olmayan dersler de gizlenmeyecek şekilde güvenli hale getirildi.

## Video havuzu özeti
- Toplam playlist: 18
- Toplam video: 1541
- Dersler: Türkçe, Paragraf, Felsefe, Tarih, Coğrafya, Fizik, Kimya, Biyoloji
- Sınavlar: TYT, AYT
- Seviyeler: Başlangıç, Orta, İleri

## Build
`npm install` ve `npm run build` başarılıdır.

## Not
Yüklenen `YKS LİNK.zip` içinde Matematik dosyası bulunmadığı için Matematik video listesi eklenmedi. Matematik link dosyaları ayrıca yüklenirse aynı sistem onları da otomatik gösterecek şekilde hazırlandı.
