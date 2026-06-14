# Aşama 29 - Panel Ayrıştırma ve Yetki Temizliği

Bu aşamada amaç yeni özellik eklemek değil, mevcut sistemi daha doğru görev ayrımıyla kullanılabilir hale getirmektir.

## Yapılan ana düzenlemeler

1. Öğrenci panelindeki haftalık plan üretme, çalışma ekleme, düzenleme ve silme alanları kaldırıldı.
2. Öğrenci panelindeki haftalık plan ekranı takip ekranına dönüştürüldü.
3. Öğrenci artık haftalık planda sadece şu durumları işleyebilir:
   - Devam ediyor
   - Tamamladım
   - Eksik kaldı
4. Haftalık plan, program ayarı ve şablon üretimi koç panelinin sorumluluğuna bırakıldı.
5. Öğrenci panelinden JSON yedek butonu kaldırıldı.
6. Yönetici paneli öğrenci detay takip ekranı gibi değil, kurum özeti ekranı gibi sadeleştirildi.
7. Yönetici öğrenci tablosunda ham deneme/risk detayları azaltıldı; kurum takip özeti öne alındı.
8. Koç paneli açıklamaları, ana takip ve yönetim merkezi olacak şekilde güncellendi.
9. Sürüm bilgileri Aşama 29 olarak güncellendi.
10. Yeni localStorage anahtarı kullanıldı: `yks-kocluk-platformu-students-v29-panel-ayristirma`.

## Mantık

- Öğrenci: kendi çalışma, soru, kaynak, video, deneme, hata ve mesaj girişini yapar.
- Koç: plan, ödev, kaynak atama, öğrenci analizi ve strateji yönetimini yapar.
- Yönetici: kurum toplamlarını, koç/öğrenci sayısını ve sistem durumunu görür.

## Test sonucu

- `npm install` çalıştı.
- `npm run build` başarılı tamamlandı.
- Build çıktısı alındı.
- Kurulum paketinde `node_modules` ve `dist` klasörleri yer almaz.
