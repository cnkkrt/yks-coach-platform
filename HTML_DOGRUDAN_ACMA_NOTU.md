# HTML Açma Notu

## En doğru yöntem
1. Klasörü Visual Studio Code ile aç.
2. Terminalde şu komutları çalıştır:

```powershell
npm install
npm run dev
```

3. Tarayıcıda görünen adresi aç:

```text
http://localhost:5173
```

## Sadece HTML olarak açmak istersen
`dist/index.html` dosyasına çift tıkla. Bu paket `base: "./"` ayarıyla üretildiği için dist klasörü içinde doğrudan açılabilir.

## Yapılan düzenleme
- Playlist kartları görseldeki yapıya yaklaştırıldı.
- Kart kapağı, TYT/AYT etiketi, seviye etiketi ve ders etiketi eklendi.
- Her playlist kendi adıyla tıklanabilir.
- YouTube açılma sayacı, izledim sayacı ve ilerleme yüzdesi korunur.
- Başlangıç / Orta / İleri seviye dağılımı kart içinde gösterilir.
