# YKS Koçluk Platformu

Kurumlar için YKS koçluk takip ve yönetim platformu. Koç, öğrenci ve yönetici hesaplarıyla öğrenci planları, ödevler, kaynak ilerlemesi, deneme sonuçları ve günlük çalışma verileri tek merkezden yönetilir.

## Bu sürümde ne düzeldi?

- Merkezi öğrenci veri modeli güçlendirildi.
- Ödev, kaynak, çalışma, deneme, konu ve video ilerlemeleri tek hesaplama omurgasına bağlandı.
- Modüller arası senkron işlemleri `syncEvents` geçmişine yazılmaya başladı.
- Kaynak ve hata kayıtlarında TYT/AYT sınav bilgisi korunur hale getirildi.
- Günlük çalışma-kaynak eşleşmesinde çift sayım riski azaltıldı.
- Eksik konu/risk analizinde `topicTracking` alanı doğru okunur hale getirildi.
- CSS token eksikleri tamamlandı.
- Admin paneline JSON yedek indirme ve JSON yedekten geri yükleme eklendi.
- Admin paneline koç, öğrenci ve yönetici hesabı oluşturma/silme eklendi.
- Hesaplar `localStorage` içinde kalıcı hale getirildi ve yedek dosyasına dahil edildi.
- Admin öğrenci tablosuna koç atama eklendi.
- Koç paneli, aktif koça atanmış öğrencilerle sınırlandırıldı.
- Veli hesabı ve salt okunur veli rapor paneli eklendi.
- Admin paneline yayın hazırlığı kontrol listesi eklendi.
- `VITE_APP_MODE=production` ile canlı modda demo hesap girişi kapatıldı.
- `VITE_BACKEND_MODE=remote` ile harici `/students` API'sine okuma/yazma yapabilecek backend hazırlığı eklendi.
- Öğrenci kullanıcı adı e-posta olacak şekilde giriş ekranı güncellendi.
- Koç öğrenci eklerken e-posta girer; sistem öğrenciye otomatik geçici şifreli hesap açar.
- Koç öğrenci listesinde öğrencinin kullanıcı adı ve geçici şifresini görebilir.
- Öğrenci kendi panelindeki Hesap Güvenliği alanından şifresini değiştirebilir.
- Firebase Authentication için `VITE_AUTH_MODE=firebase` modu ve servis dosyası eklendi.
- Firebase modu açıkken koçun eklediği öğrenci için Firebase hesabı oluşturulur ve doğrulama e-postası gönderilir.
- Öğrenci şifre sıfırlama ve panel içi Firebase şifre güncelleme akışı eklendi.
- Admin yayın hazırlığı kontrolüne Firebase Auth, gerçek e-posta, doğrulama ve demo e-posta temizliği maddeleri eklendi.
- Firestore backend modu eklendi; öğrenci ve hesap verileri `platformData/main` dokümanına yazılabilir hale getirildi.
- Eski demo öğrenci/veli hesaplarının silindikten sonra otomatik geri gelmesi engellendi.
- Veli hesabı yayın hazırlığı için zorunlu olmaktan çıkarıldı.
- Giriş ekranı kurumsal kullanım diline taşındı.
- Öğrenci e-posta giriş kartı gerçek kullanım için sabitlendi.
- Netlify yayın yapılandırması eklendi.
- Paket adı ve sürüm bilgisi temizlendi.
- Demo giriş kartlarında erişim kodlarının açık gösterimi kaldırıldı.

## Kullanılan teknoloji

- React
- Vite
- JavaScript
- CSS
- localStorage yerel yedek
- Firebase Auth
- Firebase Firestore

## Kurulum

PowerShell ile proje klasörüne girin:

```powershell
cd "C:\Users\cnkkr\Documents\Codex\2026-05-24\files-mentioned-by-the-user-yks\asama-51-audit-20260603-024338\YKS-KOCLUK-PLATFORMU-ASAMA-51-PLAYLIST-SAYAC-TAM-DUZELTILMIS"
npm install
npm run dev
```

Tarayıcıda açılacak adres:

```text
http://127.0.0.1:5173
```

Belirli portla çalıştırmak için:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5175
```

## Giriş modeli

Girişte kullanıcı adı e-posta adresidir. Şifreler Firebase Authentication içinde tutulur; kaynak kodda gerçek şifre bulunmaz.

- Koç kendi e-postası ve Firebase şifresiyle girer.
- Yönetici kendi e-postası ve Firebase şifresiyle girer.
- Öğrenci doğrulanmış e-postası ve kendi belirlediği şifreyle girer.

## Veri yedekleme

Yönetici panelindeki Ayarlar bölümünden:

- `JSON Yedek İndir` ile tüm öğrenci ve hesap verisi dışa aktarılır.
- `JSON Yedek Yükle` ile daha önce alınan öğrenci/hesap yedeği geri yüklenir.

## Hesap yönetimi

Yönetici panelindeki Ayarlar bölümünden yeni koç, öğrenci ve yönetici hesabı oluşturulabilir.

- Öğrenci hesabı bir öğrenci kaydına bağlanabilir.
- Veli hesabı kullanılmıyorsa yayın hazırlığı kontrolünde eksik sayılmaz.
- Öğrenci kaydı bir koç hesabına atanabilir.
- Kullanıcı adı e-posta adresidir.
- Giriş şifresini kurum yöneticisi veya koç ilk kayıt sırasında belirler.
- Koç panelinden eklenen öğrenciler için geçici şifre otomatik oluşturulur ve öğrenci listesinde gösterilir.
- Öğrenci giriş yaptıktan sonra kendi şifresini Hesap Güvenliği bölümünden değiştirebilir.

## E-posta doğrulama

`VITE_AUTH_MODE=firebase` açıkken öğrenciler gerçek e-posta adresiyle Firebase hesabı olarak oluşturulur. Doğrulama bağlantısı Firebase tarafından e-posta ile gönderilir. Öğrenci giriş yaptıktan sonra Hesap Güvenliği alanından şifresini değiştirebilir.

## Firestore backend

Pilot canlı veri için `.env` dosyasında backend modu Firestore yapılır:

```text
VITE_APP_MODE=pilot
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

Firestore'da kullanılan doküman:

```txt
platformData/main
```

Pilot için Firebase Console > Firestore Database > Rules alanında en azından oturum açmış kullanıcıya izin verilmelidir:

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

Bu kural pilot içindir. Üretimde rol bazlı admin/koç yetkisiyle daraltılmalıdır.

## Netlify yayını

Bu proje Netlify için hazırdır.

- Build komutu: `npm run build`
- Publish klasörü: `dist`
- Node sürümü: `22`
- Ayar dosyası: `netlify.toml`

GitHub'a `.env` dosyası gönderilmez. Firebase değerleri Netlify panelinde Site configuration > Environment variables alanına girilmelidir:

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

React sayfa yenilemelerinde 404 olmaması için `netlify.toml` içinde yönlendirme kuralı bulunur.

## Yayın hazırlığı kontrolü

Yönetici panelindeki Ayarlar bölümünde canlı yayın öncesi kritik başlıklar izlenir:

- öğrenci kayıtları
- koç, öğrenci ve yönetici hesapları
- koç atamaları
- JSON yedekleme
- uzak backend durumu
- Firebase Auth modu
- gerçek e-posta hesapları
- öğrenci e-posta doğrulama durumu
- demo `.local` e-posta temizliği

## Önemli not

Bu sürüm yerel yedeği koruyarak Firestore'a yazar. Firestore açılmamışsa uygulama yerel kayıtla devam eder ve yönetici panelinde uyarı gösterir. Yayın için önerilen yapı GitHub + Netlify + Firebase Auth/Firestore'dur.
