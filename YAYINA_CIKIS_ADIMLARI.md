# YKS Koçluk Platformu - Yayına Çıkış Adımları

Bu dosya GitHub + Netlify + Firebase yayını için kısa kontrol listesidir.

## 1. GitHub Repo Oluştur

1. GitHub'a gir.
2. New repository seç.
3. Repository name: `yks-kocluk-platformu`
4. Public veya Private seçilebilir. İlk canlı deneme için Private önerilir.
5. README ekleme; proje içinde README zaten var.
6. Create repository butonuna bas.

## 2. Dosyaları GitHub'a Yükle

Yüklenecek kaynak paket:

```text
C:\Users\cnkkr\Documents\Codex\YKS-KOCLUK-PLATFORMU-GITHUB-HAZIR\yks-kocluk-platformu-github-source.zip
```

Zip'i açıp içindeki dosyaları GitHub repo ekranına sürükle:

- `src`
- `index.html`
- `package.json`
- `vite.config.js`
- `netlify.toml`
- `README.md`
- `ASAMALAR.md`
- `.env.example`
- `.gitignore`
- `YAYINA_CIKIS_ADIMLARI.md`

GitHub'a yüklenmemesi gerekenler:

- `.env`
- `node_modules`
- `dist`
- log dosyaları
- gerçek şifreler

## 3. Netlify Site Oluştur

1. Netlify'a gir.
2. Add new site seç.
3. Import from Git seç.
4. GitHub hesabını bağla.
5. `yks-kocluk-platformu` reposunu seç.
6. Build command: `npm run build`
7. Publish directory: `dist`
8. Deploy site butonuna bas.

`netlify.toml` dosyası bu ayarları zaten içerir; Netlify çoğu durumda otomatik algılar.

## 4. Netlify Environment Variables

Netlify'da Site configuration > Environment variables alanına şu değişkenleri ekle:

```text
VITE_APP_MODE=production
VITE_BACKEND_MODE=firestore
VITE_AUTH_MODE=firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Firebase değerleri yerel `.env` dosyasında bulunur. `.env` dosyasını GitHub'a yükleme.

## 5. Firebase Ayarları

Firebase Console içinde şunlar açık olmalı:

- Authentication > Sign-in method > Email/Password
- Firestore Database
- Firestore Rules

Pilot kural:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /platformData/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Canlı Test Sırası

1. Netlify canlı linkini aç.
2. Koç hesabıyla giriş yap.
3. Öğrenci ekle.
4. Öğrenci doğrulama e-postasını açsın.
5. Öğrenci kendi e-postası ve şifresiyle giriş yapsın.
6. Yönetici panelinde yayın hazırlığı kontrolünü incele.

Öğrenci girişinde "öğrenci kaydı bulunamadı" hatası alınırsa Firebase Auth kullanıcısı vardır ama Firestore öğrenci kaydı yoktur. Koç panelinden aynı e-postayla öğrenci kaydı oluşturulmalıdır.
