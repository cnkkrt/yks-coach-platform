# Geliştirme Aşamaları

## Aşama 1 - Temel Panel İskeleti
Tamamlandı.

- Login ekranı
- Koç paneli
- Öğrenci paneli
- Yönetici paneli
- Öğrenci detay ekranı
- Demo veri

## Aşama 2 - Öğrenci Yönetimi
Tamamlandı.

- Öğrenci ekleme
- Öğrenci düzenleme
- Öğrenci silme
- Arama ve risk filtresi
- Demo veriye dönüş
- localStorage kalıcı kayıt

## Aşama 3 - Haftalık Plan ve Ödev Yönetimi
Tamamlandı.

- Öğrenci detayında haftalık görev ekleme
- Haftalık görev düzenleme
- Haftalık görev silme
- Ödev ekleme
- Ödev düzenleme
- Ödev silme
- Ödev durumları: Verildi, Tamamlandı, Kontrol Edildi, Eksik, Tekrar Verildi
- Ödev tamamlanma yüzdesi otomatik hesaplama
- Öğrenci panelinde ödev görüntüleme

## Aşama 4 - Deneme Net Girişi ve Hata Analizi
Tamamlandı.

- TYT deneme girişi
- AYT deneme girişi
- Doğru / yanlış / boş / net hesaplama
- Deneme geçmişi düzenleme / silme
- Hata türü kaydı
- Hata analizi düzenleme / silme
- Hata aksiyon ve durum takibi
- Öğrenci panelinde deneme ve hata analizi görüntüleme

## Aşama 5 - Konu ve Kaynak Takibi
Tamamlandı.

- TYT / AYT konu listeleri
- Konu durumları
- Konu ekleme
- Konu düzenleme
- Konu silme
- Konu ilerleme yüzdesinin otomatik hesaplanması
- Öğrenci panelinde konu görüntüleme
- Gece / gündüz tema geçişi
- Tema seçiminin localStorage ile korunması
- Kaynak ekleme
- Kaynak düzenleme
- Kaynak silme
- Kaynak ilerleme yüzdesinin otomatik hesaplanması
- Öğrenci panelinde kaynak görüntüleme

## Aşama 5.1 - Ders Bazlı Deneme Girişi
Tamamlandı.

- TYT denemelerinde Türkçe, Matematik, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe ve Din alanları
- AYT-SAY, AYT-EA, AYT-SÖZ ve YDT için türe göre ders listesi
- Her ders için doğru / yanlış / boş girişi
- Ders neti ve toplam deneme netinin otomatik hesaplanması
- Koç ve öğrenci panellerinde ders bazlı deneme kırılımının görüntülenmesi

## Aşama 5.2 - Konu ve Alt Konu Seçimi
Tamamlandı.

- Haftalık plan formunda seçilen derse göre konu açılır menüsü
- Haftalık plan formunda konu seçilince alt konu açılır menüsü
- TYT / AYT konu takip formunda seçilen derse göre konu açılır menüsü
- TYT / AYT konu takip formunda konuya bağlı alt konu seçimi
- Konu ve alt konu bilgisinin koç ve öğrenci panellerinde birlikte görüntülenmesi
- Konu / alt konu verisinin localStorage ile korunması

## Aşama 5.3 - Tüm Menülerde Alt Konu
Tamamlandı.

- Ödev Yönetimi menüsünde konu ve alt konu seçimi
- Kaynak Takibi menüsünde konu ve alt konu seçimi
- Hata Analizi menüsünde konu ve alt konu seçimi
- Alt konu bilgisinin ödev, kaynak ve hata kayıtlarında saklanması
- Öğrenci panelinde ödev, kaynak ve hata kayıtlarının alt konuyla görüntülenmesi

## Aşama 5.4 - Otomatik Boş ve Net Hesabı
Tamamlandı.

- Deneme girişinde ders bazlı soru adetleri
- Doğru ve yanlış girilince boş sayısının otomatik hesaplanması
- Netin otomatik güncellenmesi
- Doğru + yanlış toplamının ders soru sayısını aşmasını engelleme
- Deneme formunda ders soru sayısının gösterilmesi

## Aşama 5.5 - Grafik ve Ölçüm Panosu
Tamamlandı.

- Sarı-siyah geometrik dashboard görünümü
- Koç panelinde genel ilerleme ölçüm barları
- Koç panelinde öğrenci bazlı deneme net bar grafiği
- Öğrenci panelinde kişisel ilerleme ölçümü
- Öğrenci panelinde deneme gelişim grafiği
- Öğrenci detayında ilerleme ölçümü ve deneme bar grafiği
- Konu, kaynak, ödev, hata çözüm ve net verilerinin ölçülebilir görünümü
- Yeni grafik görünüm için localStorage anahtarının yenilenmesi

## Aşama 5.6 - Alt Konu Görünürlüğü
Tamamlandı.

- Formlar açılır açılmaz konu ve alt konu varsayılanı
- Konu değişince ilk alt konunun otomatik seçilmesi
- Alt konuların dropdown dışında chip/list olarak gösterilmesi
- Haftalık plan, konu takibi, ödev, kaynak ve hata analizi formlarında görünür alt konu seçimi
- TYT sosyal derslerinin Tarih, Coğrafya, Felsefe ve Din olarak ayrılması
- Yeni alt konu görünümü için localStorage anahtarının yenilenmesi

## Aşama 6 - Raporlama
Tamamlandı.

- Haftalık öğrenci raporu
- Veli raporu
- Deneme analiz raporu
- PDF / yazdırma çıktısı
- Öğrenci detayında Rapor Merkezi
- Otomatik koç değerlendirmesi
- Otomatik veli notu
- Bu Hafta Odak listesi
- Yazdırmada temiz rapor çıktısı

## Aşama 7 - Gerçek Veritabanı
Planlandı.

- Supabase bağlantısı
- Gerçek kullanıcı girişi
- Rol bazlı yetkilendirme
- Koç / öğrenci / yönetici hesapları

## Aşama 7.1 - Rol Bazlı Demo Giriş ve Bildirim
Tamamlandı.

- Koç, öğrenci ve yönetici için ayrı demo hesaplar
- Giriş kodu kontrolü
- Hatalı giriş uyarısı
- Aktif oturum rozetleri
- Koç panelinde Takip Bildirimleri
- Yönetici panelinde Kurum Bildirimleri
- Risk, ödev, konu ve hata kayıtlarından otomatik uyarı üretimi
- Yeni rol/bildirim altyapısı için localStorage anahtarının yenilenmesi

## Aşama 7.2 - Çalışan Menü Navigasyonu
Tamamlandı.

- Yan menü butonlarının ilgili bölümlere kaydırılması
- Seçili menünün aktif görünmesi
- Öğrenci detay menülerinin haftalık plan, ödev, konu, kaynak, deneme ve rapora bağlanması
- Öğrenci paneli menülerinin plan, konu, kaynak, deneme ve ödev bölümlerine bağlanması
- Koç paneli menülerinin özet, bildirim, analiz, rapor kısayolu ve öğrenci listesine bağlanması
- Yönetici paneli menülerinin özet, koçlar, öğrenciler, raporlar ve ayarlara bağlanması
- Yeni menü navigasyonu için localStorage anahtarının yenilenmesi

## Aşama 7.3 - Günlük Çalışma, Kütüphane ve Mesajlaşma
Tamamlandı.

- Günlük soru çözüm kayıtları
- Öğrenci tarafında çalışma / branş denemesi / konu tarama testi girişi
- Koç tarafında günlük çalışma düzenleme, silme ve durum kontrolü
- Doğru / yanlış girilince boş ve netin otomatik hesaplanması
- Kaynak ilerlemesinin tamamlanan birim / toplam birim üzerinden ölçülmesi
- MEBİ ve EBA resmi bağlantıları
- TYT / AYT / YDT için ders ve seviye bazlı YouTube arama bağlantıları
- Menü tıklanınca sadece seçili modülün görünmesi
- Ana sayfaya dön düğmesi
- Koç - öğrenci mesajlaşma modülü
- Yeni çalışma/kütüphane/mesajlaşma altyapısı için localStorage anahtarının yenilenmesi

## Aşama 8 - Senkron Saatlik Plan Sistemi
Tamamlandı.

- Günlük çalışma, haftalık plan, ödev yönetimi ve kaynak takibi arasında senkron katman
- Haftalık planın tablo ve saatlik çalışma düzenine alınması
- 2 / 3 / 4 / 5 / 6 / 7 / 8 veya özel günlük saat seçimi
- Başlangıç / Orta / İleri seviye etiketleri
- Ders bazlı seviye seçimi
- Hedef soru ve konu ağırlığına göre otomatik çalışma süresi önerisi
- Öğrenci ve koç tarafında çalışma ekleme, düzenleme, silme ve tamamlama
- Günlük çalışma girilince uygun haftalık görev, ödev ve kaynak kayıtlarının güncellenmesi
- İlerleme ölçümünde konu takibi yerine kaynak ilerlemesinin ana metrik yapılması
- Senkron değişikliklerde popup bildirim gösterimi

## Aşama 9 - Video Dersler ve YouTube Sayaçları
Tamamlandı.

- Video Dersler menüsünde TYT / AYT, seviye ve ders kırılımı
- Koç tarafında HTML veya YouTube linkli liste yükleme
- Öğrenci tarafında aynı listeleri görme
- Dahili oynatıcı yerine YouTube'da açma akışı
- Video açılma sayacı
- %25 / %50 / %75 / İzledim ilerleme işaretleme
- İzledim sayacı ve tamamlanma yüzdesi

## Aşama 10 - Öğrenci Paneli Görsel İyileştirme
Tamamlandı.

- Ödev kartlarında form ve buton taşmasının düzeltilmesi
- Ödev durumlarının bar grafik ve özet kartlarla gösterilmesi
- Deneme net gelişimi ve ders bazlı net ortalamalarının grafikle gösterilmesi
- Kaynakların TYT / AYT / YDT ve ders gruplarına ayrılması
- Kaynak ilerlemelerinin sınav ve ders bazlı barlarla gösterilmesi
- Günlük çalışmaların gün gün ve ders bazlı bar grafiklerle zenginleştirilmesi

## Aşama 11 - Gelişim / Gerileme Barları ve HTML Video Yükleme
Tamamlandı.

- Deneme netlerinde önceki denemeye göre artışın yeşil, düşüşün kırmızı gösterilmesi
- Ders bazlı net ortalamasının yanında son deneme değişim barı
- Çalışmam menüsünde gün gün soru artışı/düşüşünün renkli barla gösterilmesi
- Koç tarafında bir veya birden fazla HTML / HTM / TXT video listesi yükleme
- HTML dosyalarındaki YouTube linklerinin otomatik yakalanması
- Yakalanan video sayısı ve ilk video başlıklarının önizlenmesi
- Eklenen video listesinin öğrenci panelinde görünmesi


## Aşama 28 - Temiz Stabil Paket
Tamamlandı.

- Eski sürüm başlıkları temizlendi.
- Proje adı ve sürüm bilgileri Aşama 28 olarak güncellendi.
- `node_modules` paketten çıkarıldı.
- Eski `dist` çıktısı paketten çıkarıldı.
- `latest` bağımlılıkları sabit sürümlere çevrildi.
- `package-lock.json` kaldırıldı; kurulumda yeniden üretilecek.
- Giriş ekranı sürüm rozeti güncellendi.
- localStorage anahtarı yenilendi.
- Temiz kurulum yönergesi eklendi.
- HTML video başlığı temizleme sistemi korunarak proje kararlı pakete dönüştürüldü.


## Aşama 29 - Panel Ayrıştırma

- Öğrenci panelindeki haftalık plan oluşturma/düzenleme/silme işlemleri kaldırıldı.
- Öğrenci haftalık planı sadece takip ve durum işleme ekranına dönüştürüldü.
- Koç paneli plan/ödev/kaynak/analiz yönetim merkezi olarak netleştirildi.
- Yönetici paneli kurum özeti mantığına sadeleştirildi.
- Sürüm ve kurulum belgeleri güncellendi.

## Aşama 53 - Gerçek Sistem Hazırlığı

Tamamlandı.

- Uygulama sürümü `asama-53-gercek-sistem-hazirligi` olarak tanımlandı.
- Paket adı `yks-kocluk-platformu`, sürüm `0.53.0` olarak temizlendi.
- Admin paneline sistem durumu, sürüm ve veri modu göstergeleri eklendi.
- Admin paneline JSON yedek indirme eklendi.
- Admin paneline JSON yedekten geri yükleme eklendi.
- Admin paneline hesap yönetimi eklendi.
- Koç, öğrenci ve yönetici hesapları kalıcı kayıt haline getirildi.
- Öğrenci hesabını belirli öğrenci kaydına bağlama eklendi.
- Öğrenci kaydını belirli koç hesabına atama eklendi.
- Koç panelinde yalnızca aktif koça atanmış öğrencilerin görünmesi sağlandı.
- Veli rolü ve varsayılan veli demo hesabı eklendi.
- Veli için salt okunur rapor paneli eklendi.
- Admin hesap formuna veli hesabı oluşturma eklendi.
- Koçun eklediği öğrencinin otomatik aktif koça atanması sağlandı.
- Admin paneline yayın hazırlığı kontrol listesi eklendi.
- `VITE_APP_MODE=production` ile canlı modda demo hesap girişinin kapanması sağlandı.
- Login ekranında pilot/canlı mod göstergesi eklendi.
- Yedek dosyasına hesap verileri de dahil edildi.
- `.env.example` ile backend yapılandırması belgelendi.
- `VITE_BACKEND_MODE=remote` için `/students` okuma/yazma altyapısı eklendi.
- Uzak backend başarısız olursa yerel kayıtla devam eden güvenli geçiş davranışı eklendi.
- Demo giriş kartlarında erişim kodlarının açık gösterimi kaldırıldı.

## Aşama 54 - Öğrenci E-posta ve Şifre Akışı

Tamamlandı.

- Uygulama sürümü `asama-54-ogrenci-email-sifre-akisi` olarak güncellendi.
- Paket sürümü `0.54.0` olarak güncellendi.
- Login ekranında kullanıcı adı/e-posta ve şifre birlikte kontrol edilmeye başladı.
- Varsayılan demo hesapları e-posta biçimli kullanıcı adlarına taşındı.
- Koç öğrenci eklerken e-posta alanı zorunlu hale getirildi.
- Koçun eklediği öğrenci için otomatik öğrenci hesabı ve geçici şifre oluşturuldu.
- Koç öğrenci listesinde öğrencinin kullanıcı adını ve geçici şifresini görebilir hale geldi.
- Öğrenci paneline Hesap Güvenliği bölümü eklendi.
- Öğrenci mevcut şifresini girerek yeni şifre belirleyebilir hale getirildi.
- Öğrenci e-postası düzenlenirse bağlı öğrenci hesabının kullanıcı adı da güncellenir hale getirildi.
- E-posta doğrulama ve ilk şifre değişimi için frontend veri alanları hazırlandı.

## Aşama 55 - Firebase Öğrenci Hesabı

Tamamlandı.

- Uygulama sürümü `asama-55-firebase-ogrenci-hesabi` olarak güncellendi.
- Paket sürümü `0.55.0` olarak güncellendi.
- Firebase npm paketi projeye eklendi.
- `.env.example` içine Firebase Auth yapılandırma alanları eklendi.
- `VITE_AUTH_MODE=local/firebase` ayrımı hazırlandı.
- Firebase Auth servis dosyası eklendi.
- Koç yeni öğrenci eklediğinde Firebase modu açıksa öğrenci hesabı Firebase'de oluşturulur hale getirildi.
- Firebase hesabı oluşturulunca doğrulama e-postası gönderilir hale getirildi.
- Geçici öğrenci şifresi Firebase minimum şifre kuralına uyacak biçimde güncellendi.
- Firebase hata mesajları koç formunda Türkçe gösterilir hale getirildi.
- Oluşan Firebase kullanıcı UID'si öğrenci hesabı kaydında saklanır hale getirildi.

## Aşama 56 - Firebase Yayın Kontrolü

Tamamlandı.

- Uygulama sürümü `asama-56-firebase-yayin-kontrolu` olarak güncellendi.
- Paket sürümü `0.56.0` olarak güncellendi.
- Öğrenci giriş ekranına Firebase şifre sıfırlama bağlantısı eklendi.
- Öğrenci panelindeki şifre güncelleme Firebase `updatePassword` akışına bağlandı.
- Admin yayın hazırlığı kontrolüne Firebase Auth modu eklendi.
- Admin yayın hazırlığı kontrolüne gerçek e-postalı koç/yönetici hesabı kontrolü eklendi.
- Admin yayın hazırlığı kontrolüne öğrenci e-posta doğrulama durumu eklendi.
- Admin yayın hazırlığı kontrolüne demo `@yks.local` e-posta temizliği eklendi.
- Yayın hazırlığı puanı toplam ağırlığa göre yüzde hesaplar hale getirildi.

## Aşama 57 - Firestore Backend

Tamamlandı.

- Uygulama sürümü `asama-57-firestore-backend` olarak güncellendi.
- Paket sürümü `0.57.0` olarak güncellendi.
- `VITE_BACKEND_MODE=firestore` modu eklendi.
- Firebase Firestore istemci bağlantısı eklendi.
- Öğrenci ve hesap verileri Firestore'da `platformData/main` dokümanına kaydedilir hale getirildi.
- Uygulama açılışında Firestore verisi varsa yerel verinin üstüne yüklenir hale getirildi.
- Firestore erişimi başarısız olursa yerel kayıtla devam eden uyarılı davranış korundu.
- Silinen eski demo öğrenci ve veli hesaplarının varsayılan hesap olarak geri eklenmesi engellendi.
- Veli hesabı kullanılmadığı için yayın hazırlığı kontrolünde zorunlu olmaktan çıkarıldı.
- Admin yayın hazırlığı kontrolünde Firestore modu uzak backend olarak kabul edilir hale getirildi.

## Aşama 58 - Kurumsal Yayın Hazırlığı

Tamamlandı.

- Uygulama sürümü `kurumsal-netlify-yayin-hazirligi` olarak güncellendi.
- Paket sürümü `0.58.0` olarak güncellendi.
- Giriş ekranındaki teknik aşama/pilot metinleri kaldırıldı.
- Giriş ekranı kurumsal yönetim paneli diliyle güncellendi.
- Koç ve yönetici hesapları kurum hesabı olarak gösterilir hale getirildi.
- Öğrenci e-posta giriş kartı gerçek kullanım için sabitlendi.
- Firestore'da öğrenci yokken boş yerel listenin uzak veriyi ezmesi engellendi.
- Firebase Auth'ta kullanıcı zaten varsa öğrenci kaydı oluşturma akışı durmadan devam eder hale getirildi.
- `netlify.toml` ile Netlify build, publish ve SPA yönlendirme ayarları eklendi.
- HTML başlığı canlı kullanım için `YKS Koçluk Platformu` olarak sadeleştirildi.
- README GitHub + Netlify + Firebase yayın akışına göre güncellendi.
