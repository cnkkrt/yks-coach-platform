# AŞAMA 28 - Temiz Stabil Paket

## Amaç

Bu aşamada yeni özellik eklemek yerine proje paketi temizlendi. Eski sürüm yazıları, taşınmış `node_modules`, eski `dist` çıktısı ve `latest` bağımlılıkları düzenlendi.

## Yapılanlar

- Paket adı `yks-kocluk-platformu-asama-28-temiz-stabil` olarak güncellendi.
- Sürüm `0.28.0` yapıldı.
- Ana sayfa başlığı Aşama 28 olarak düzeltildi.
- Giriş ekranındaki sürüm rozeti Aşama 28 olarak düzeltildi.
- `node_modules` klasörü paketten çıkarıldı.
- `dist` klasörü paketten çıkarıldı.
- `package-lock.json` çıkarıldı; kurulumda yeniden oluşturulacak.
- React ve Vite bağımlılıkları sabit sürümlere alındı.
- localStorage anahtarı yenilendi.
- `.gitignore` eklendi.
- Kurulum yönergeleri ayrı `KURULUM.md` dosyasına alındı.

## Çalıştırma

```powershell
npm install
npm run dev
```

## Not

Bu sürüm hâlâ demo/localStorage tabanlıdır. Gerçek kullanıcı hesabı ve veritabanı için sonraki aşamada altyapı kararı verilmelidir.
