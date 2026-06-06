# PRD: Notlar Uygulaması

## Problem Statement

Kullanıcı, Sandcastle ve ajan skill akışını (planlama, TDD, implementasyon, doğrulama) uçtan uca denemek için hızlıca tamamlanabilecek, gerçek bir özelliğe sahip basit bir uygulama istiyor. Mevcut repo yalnızca Sandcastle altyapısı ve minimal TypeScript iskeleti içeriyor; kullanıcının not ekleyip silebileceği, tarayıcıda çalışan bir arayüz yok.

## Solution

Bu repoda, `app/` altında tek sayfalık bir web uygulaması kurulacak. Kullanıcı not ekleyebilecek, notları listeleyebilecek ve notları soft-delete ile silebilecek. Silinen not 5 saniye boyunca toast üzerinden geri alınabilecek; süre dolunca kalıcı olarak silinecek. Notlar `localStorage` ile kalıcı tutulacak. İş mantığı saf TypeScript modüllerinde toplanacak ve Node'un yerleşik test çalıştırıcısı ile dış davranış odaklı test edilecek.

## User Stories

1. As a kullanıcı, I want uygulamayı tarayıcıda açabilmek, so that notlarımı hemen kullanmaya başlayabileyim.
2. As a kullanıcı, I want tek satırlık bir metin alanına not yazabilmek, so that hızlıca kısa notlar ekleyebileyim.
3. As a kullanıcı, I want "Ekle" butonuna tıklayarak not ekleyebilmek, so that fare ile kolayca not oluşturabileyim.
4. As a kullanıcı, I want Enter tuşuna basarak not ekleyebilmek, so that klavye ile hızlı giriş yapabileyim.
5. As a kullanıcı, I want eklediğim notun listenin en üstünde görünmesini, so that en son eklediğim notu hemen görebileyim.
6. As a kullanıcı, I want her notun yanında silme kontrolü görmek, so that istemediğim notu kaldırabileyim.
7. As a kullanıcı, I want bir notu sildiğimde hemen listeden kaybolmasını, so that arayüz güncel kalsın.
8. As a kullanıcı, I want not silindiğinde ekranın altında bir toast bildirimi görmek, so that silme işleminin gerçekleştiğini anlayayım.
9. As a kullanıcı, I want toast üzerindeki "Geri Al" eylemiyle son silinen notu geri getirebilmek, so that yanlışlıkla sildiğim notu kurtarabileyim.
10. As a kullanıcı, I want geri alma penceresinin 5 saniye sonra otomatik kapanmasını, so that soft-delete'in geçici olduğunu sezgisel olarak anlayayım.
11. As a kullanıcı, I want 5 saniye dolduktan sonra notun kalıcı olarak silinmesini, so that geri alınamaz hale geldiğini bilerek devam edebileyim.
12. As a kullanıcı, I want sayfayı yenilediğimde notlarımın kaybolmamasını, so that verilerim güvenle saklansın.
13. As a kullanıcı, I want boş metinle not eklenememesini, so that anlamsız kayıtlar oluşmasın.
14. As a kullanıcı, I want işletim sistemimin açık/koyu tema tercihine uygun bir görünüm görmek, so that uygulama göz yormadan kullanılabilsin.
15. As a kullanıcı, I want düzenli tipografi, boşluklar ve kart tabanlı liste düzeni görmek, so that uygulama ham HTML gibi değil, kasıtlı tasarlanmış hissetsin.
16. As a kullanıcı, I want buton ve silme kontrollerinde hover/focus durumlarını görmek, so that etkileşimli öğeleri ayırt edebileyim.
17. As a kullanıcı, I want toast bildiriminin yumuşak bir animasyonla görünmesini, so that geri bildirim daha doğal hissetsin.
18. As a kullanıcı, I want hiç not yokken anlamlı bir boş durum mesajı görmek, so that uygulamanın çalıştığını ama henüz not olmadığını anlayayım.
19. As a geliştirici, I want not iş mantığının UI'dan ayrılmış saf modüllerde olmasını, so that davranışı testlerle güvence altına alabileyim.
20. As a geliştirici, I want `localStorage` erişiminin soyutlanmış bir adaptör üzerinden yapılmasını, so that testlerde bellek içi sahte depolama kullanabileyim.
21. As a geliştirici, I want mevcut `npm test` komutunun yeni testleri de çalıştırmasını, so that CI benzeri doğrulama akışını deneyebileyim.
22. As a geliştirici, I want TypeScript kaynaklarının derlenerek tarayıcıda çalışmasını, so that tip güvenliği ile vanilla web stack'i bir arada kullanabileyim.
23. As a geliştirici, I want Sandcastle dosyalarının UI kodundan ayrı kalmasını, so that ajan döngüsü ile uygulama geliştirmesi birbirini bozmasın.
24. As a kullanıcı, I want aynı anda yalnızca bir soft-deleted notun geri alınabilir olmasını, so that toast tabanlı geri alma akışı basit ve öngörülebilir kalsın.
25. As a kullanıcı, I want yeni bir not silerken önceki soft-delete zamanlayıcısının sonuçlanmasını, so that aynı anda birden fazla bekleyen geri alma durumu oluşmasın.

## Implementation Decisions

### Genel mimari

- Uygulama bu repoda, Sandcastle altyapısından bağımsız bir `app/` alanında konumlanacak.
- Stack: tek sayfa HTML, vanilla TypeScript, derlenmiş JavaScript çıktısı ve ayrı CSS.
- UI katmanı yalnızca sunum ve kullanıcı etkileşiminden sorumlu olacak; kalıcılık ve not yaşam döngüsü saf modüllerde tutulacak.

### Veri modeli

- Not minimal şemada tutulacak: benzersiz `id` ve `text` alanları.
- `id` üretimi uygulama içinde benzersiz olacak şekilde çözülecek (ör. zaman damgası + rastgele bileşen veya eşdeğeri).
- Sıralama: en yeni not listenin başında.

### Kalıcılık

- Aktif notlar `localStorage` üzerinde saklanacak.
- Depolama erişimi doğrudan UI'dan değil, enjekte edilebilir bir depolama adaptörü üzerinden yapılacak; bu sayede testler bellek içi sahte depolama ile çalışabilecek.
- Serileştirme JSON tabanlı olacak.

### Not yaşam döngüsü (state machine)

```
[active] --delete--> [pendingDeletion, timer=5s]
[pendingDeletion] --undo--> [active]
[pendingDeletion] --timeout--> [permanently deleted]
[pendingDeletion] --delete another note--> önceki pending kalıcı silinir, yeni not pending olur
```

- Soft delete: silinen not UI listesinden kaldırılır, ancak 5 saniyelik geri alma penceresi boyunca depoda tutulur.
- Geri al: son soft-deleted not aktif listeye geri eklenir, toast kapanır.
- Timeout: 5 saniye sonra not kalıcı olarak silinir.
- Aynı anda yalnızca bir pending deletion desteklenir; yeni silme işlemi önceki pending kaydı kalıcı siler.

### UI davranışı

- Ekleme: tek satır metin girişi, "Ekle" butonu ve Enter ile tetikleme.
- Boş veya yalnızca boşluk içeren metin kabul edilmeyecek.
- Silme: onay diyaloğu yok; tıklama ile anında soft delete başlar.
- Toast: ekranın altında, "Not silindi" mesajı ve "Geri Al" eylemi; giriş/çıkış animasyonu.
- Boş liste durumunda kullanıcıya yönlendirici mesaj gösterilecek.

### Görsel tasarım

- Tasarımlı UI: kart tabanlı not listesi, tutarlı spacing, tipografi hiyerarşisi.
- Tema: `prefers-color-scheme` ile sistem açık/koyu moduna uyum.
- Etkileşim durumları: hover, focus-visible ve disabled/boş giriş durumları stil alacak.
- Toast: sistem temasına uyumlu renkler ve kısa CSS animasyonu.

### Derleme ve çalıştırma

- TypeScript kaynakları derlenerek tarayıcıda yüklenebilir JavaScript üretecek.
- Test modülleri Node ortamında doğrudan TypeScript veya derlenmiş çıktı üzerinden çalıştırılabilir olacak; tercih, mevcut repo ayarlarına en az sürtünmeyle uyumlu olan yol olacak.
- Geliştirme sırasında statik dosyaların servis edilmesi için basit bir yerel sunucu komutu paket betiklerine eklenebilir.

### Modül sınırları (kavramsal)

| Modül | Sorumluluk |
|-------|------------|
| Not modeli | `id` + `text` tip tanımı |
| Depolama adaptörü | Okuma/yazma/soyutlama (`localStorage` ve test double) |
| Notlar servisi | Ekleme, listeleme, soft delete, geri alma, timeout ile kalıcı silme |
| UI bağlayıcı | DOM olayları, render, toast yönetimi, tema CSS |

## Testing Decisions

### İyi testin tanımı

- Yalnızca dışarıdan gözlemlenebilir davranış test edilecek; iç uygulama detayları (private yardımcılar, DOM yapısı, CSS sınıfları) test kapsamına alınmayacak.
- Testler kullanıcı hikâyelerine ve state machine geçişlerine karşılık gelecek şekilde adlandırılacak.
- `localStorage` gerçek tarayıcı API'si testlerde kullanılmayacak; bellek içi sahte depolama adaptörü tercih edilecek.

### Test dikiş noktası (seam)

En yüksek uygun seam: **Notlar servisi + depolama adaptörü** sınırı.

Bu seam üzerinden doğrulanacak davranışlar:

- Boş metinle not eklenememesi
- Geçerli metinle not eklenmesi ve en yeni üstte listelenmesi
- Kalıcılık: kaydetme sonrası yeni servis örneği ile notların geri yüklenmesi
- Soft delete sonrası notun aktif listeden çıkması
- Geri al ile notun aktif listeye dönmesi
- 5 saniyelik timeout sonrası kalıcı silinme (zamanlayıcı enjekte edilebilir olacak)
- Yeni silme işleminde önceki pending kaydın kalıcı silinmesi
- Aynı anda tek pending deletion kuralı

UI katmanı bu PRD kapsamında otomatik test edilmeyecek; tarayıcıda manuel doğrulama yeterli.

### Öncül test altyapısı

- Repoda halihazırda `node --test` tabanlı bir test dosyası (`readme.test.mjs`) mevcut.
- Yeni testler aynı `npm test` komutu altında toplanacak.
- Zamanlayıcı ve depolama bağımlılıkları testlerde fake/sahte implementasyonlarla değiştirilecek.

## Out of Scope

- Not düzenleme (edit)
- Not başlığı veya ek metadata alanları (`createdAt`, etiketler vb.)
- Çoklu eşzamanlı soft-delete kuyruğu veya ayrı "Silinenler" listesi bölümü
- Silme onay diyaloğu
- Backend, REST API veya veritabanı
- Kullanıcı hesabı, senkronizasyon veya çoklu cihaz desteği
- React, Vite veya başka bir UI framework'ü
- E2E / tarayıcı otomasyon testleri
- Erişilebilirlik denetiminin kapsamlı otomasyonu (temel focus stilleri yapılacak, audit kapsam dışı)
- Sandcastle ajan prompt dosyalarının bu özellik için değiştirilmesi
- CI pipeline kurulumu

## Further Notes

- Bu PRD, grill-me oturumunda alınan kararların sentezidir: minimal web UI, `localStorage`, `id`+`text` modeli, soft delete + toast + 5 sn geri alma, tasarımlı sistem temalı UI, `app/` dizin yapısı, saf fonksiyon testleri, `tsc` derleme.
- Önerilen geliştirme akışı: yazılı plan → TDD ile notlar servisi → UI bağlama → `npm test` + tarayıcıda manuel doğrulama.
- Issue tracker'a taşınmadan önce test seam'lerinin kullanıcı beklentisiyle uyumlu olduğu teyit edilmeli.
