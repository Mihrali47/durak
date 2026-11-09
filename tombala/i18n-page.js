/* Tombala çevirileri: [tr, ru, en] */
(()=>{
const BN={Nuri:'Нури','Rıza':'Рыза',Hamdi:'Хамди',Cemil:'Джемиль','Kâzım':'Казым',Sen:'Вы'};const nm=(n,j)=>j?(n==='Sen'?'You':n):(BN[n]||n);
const KN={'1. Çinko':['1-я линия','1st line'],'2. Çinko':['2-я линия','2nd line'],'Tombala':['Лото!','Full house']};
window.I18N_EXTRA=[
['Tombala','Лото','Tombala'],['Menü','Меню','Menu'],['Kurallar','Правила','Rules'],['Sen','Вы','You'],
['1. Çinko','1-я линия','1st line'],['2. Çinko','2-я линия','2nd line'],['Sırada','Следующий','Up next'],['Bekliyor','Ждёт','Waiting'],
['Çekilenler','Выпавшие','Drawn'],['Duraklat','Пауза','Pause'],['Devam et','Продолжить','Resume'],['Durdu','Пауза','Paused'],['Başlıyor…','Начинаем…','Starting…'],['Oyun bitti','Игра окончена','Game over'],
['Torba','Мешок','Bag'],['hazır','готов','ready'],['Kartın','Ваша карточка','Your card'],['Tombala!','Лото!','Full house!'],['Tamam!','Готово!','Done!'],
['Bu sayı daha çıkmadı','Это число ещё не выпало','That number hasn\'t been drawn yet'],['Torba durdu','Мешок остановлен','Draw paused'],
['Torbadan sayılar çekilir, kartını ilk dolduran kazanır. Bilgisayara karşı ya da linkle arkadaşlarınla. Bu oyunda coin yok.','Из мешка тянут числа, кто первым заполнит карточку — побеждает. Против компьютера или с друзьями по ссылке. Без монет.','Numbers come out of the bag; the first to fill a card wins. Play the computer or friends by link. No coins in this game.'],
['Masada kaç kişi?','Сколько игроков?','Players at the table'],['Kişi başı kart','Карточек на игрока','Cards per player'],['1 kart','1 карточка','1 card'],['2 kart','2 карточки','2 cards'],['3 kart','3 карточки','3 cards'],
['Torba hızı','Скорость мешка','Draw speed'],['Yavaş','Медленно','Slow'],['Normal','Обычно','Normal'],['Hızlı','Быстро','Fast'],['İşaretleme','Отметки','Marking'],['Kendim','Сам','Myself'],['Otomatik','Автоматически','Automatic'],
['Sayıları sesli oku','Озвучивать числа','Read numbers aloud'],['Açık','Вкл','On'],['Kapalı','Выкл','Off'],
['Oyuna dön','Вернуться к игре','Back to game'],['Bilgisayara karşı yeni oyun','Новая игра с компьютером','New game vs computer'],['⚡ Hızlı oyun','⚡ Быстрая игра','⚡ Quick game'],['Arkadaşlarla online','Онлайн с друзьями','Online with friends'],
['Ses: Açık','Звук: вкл','Sound: on'],['Ses: Kapalı','Звук: выкл','Sound: off'],['Salona dön','В зал','Back to the hall'],
['Tombala nasıl oynanır?','Как играть в лото?','How to play Tombala'],
['Herkesin kartında 3 sıra var, her sırada 5 sayı. Torbadan 1–90 arası sayılar teker teker çekilir.','На карточке 3 ряда по 5 чисел. Из мешка по одному тянут числа от 1 до 90.','Each card has 3 rows of 5 numbers. Numbers 1–90 are drawn from the bag one by one.'],
['Çekilen sayı kartındaysa üstüne dokunup pulunu koy. Kartında yanıp sönen sayılar çıkmış ama henüz işaretlemediğin sayılardır. İstersen menüden otomatik işaretlemeyi açabilirsin.','Если число есть на карточке, нажмите на него и положите фишку. Мигают выпавшие, но ещё не отмеченные числа. В меню можно включить автоматические отметки.','If the number is on your card, tap it to place a chip. Blinking numbers have been drawn but not marked yet. You can turn on automatic marking in the menu.'],
['1. Çinko:','1-я линия:','1st line:'],['bir kartta bir sırayı ilk tamamlayan.','первый, кто закроет ряд на карточке.','first to complete a row on a card.'],['2. Çinko:','2-я линия:','2nd line:'],['aynı kartta iki sırayı ilk tamamlayan.','первый, кто закроет два ряда на одной карточке.','first to complete two rows on one card.'],['Tombala:','Лото:','Full house:'],['kartın 15 sayısını ilk tamamlayan; oyun biter.','первый, кто закроет все 15 чисел; игра окончена.','first to complete all 15 numbers; the game ends.'],
['Aynı topla birden fazla kişi tamamlarsa ödülü paylaşırlar. Ödüller kendiliğinden verilir; işaretlemeyi unutsan da kaybetmezsin. Bu oyunda coin yok, sadece puan: 1. çinko 1, 2. çinko 2, tombala 4.','Если несколько игроков закрыли одним числом — приз делится. Призы даются автоматически, даже если вы забыли отметить. Без монет, только очки: 1-я линия 1, 2-я линия 2, лото 4.','If several players complete on the same ball, they share the prize. Prizes are awarded automatically, even if you forgot to mark. No coins, only points: 1st line 1, 2nd line 2, full house 4.'],
['Tamam','ОК','OK'],['Kapat','Закрыть','Close'],['Çekilen sayılar','Выпавшие числа','Drawn numbers'],['Torba bitti','Мешок пуст','The bag is empty'],['Tombala senin!','Лото — ваше!','Full house is yours!'],['Menü','Меню','Menu'],['Yeni oyun','Новая игра','New game'],['Yeni el','Новая партия','New round'],
['Ev sahibi yeni oyunu başlatabilir.','Хозяин стола может начать новую игру.','The host can start a new game.'],
['Masa kur, linki gönder. 2–6 kişi oynayabilirsiniz.','Создайте стол и отправьте ссылку. Играть могут 2–6 человек.','Create a table and send the link. 2–6 people can play.'],['Adın','Ваше имя','Your name'],['Adını yaz','Введите имя','Enter your name'],['Geri','Назад','Back'],['Masa kur','Создать стол','Create table'],
['Masa hazır','Стол готов','Table ready'],['Masaya oturdun','Вы за столом','You are seated'],['Bu linki arkadaşlarına gönder. Herkes gelince başlat.','Отправьте ссылку друзьям. Начните, когда все придут.','Send this link to your friends. Start when everyone is here.'],['Kopyala','Копировать','Copy'],
['👥 Arkadaşlarını çağır','👥 Позвать друзей','👥 Call your friends'],['Az kişi olursa','Если игроков мало','If few players'],['Bilgisayar otursun (4 kişiye kadar)','Добавить компьютер (до 4)','Add computer players (up to 4)'],['Sadece biz','Только мы','Just us'],
['Ev sahibi oyunu başlatınca torba açılacak.','Мешок откроется, когда хозяин начнёт игру.','The bag opens when the host starts the game.'],['Oyuncular','Игроки','Players'],['Boş','Свободно','Empty'],['Ev sahibi','Хозяин','Host'],['Hazır','Готов','Ready'],['Çık','Выйти','Leave'],
['Tombala masasına davet','Приглашение за стол лото','Invitation to a Tombala table'],['Adını yaz ve masaya otur.','Введите имя и садитесь за стол.','Enter your name and take a seat.'],['Masaya otur','Сесть за стол','Take a seat'],
['Bağlanılıyor…','Подключение…','Connecting…'],['Masaya bağlanıyorsun, birkaç saniye sürebilir.','Подключаемся к столу, это займёт несколько секунд.','Connecting to the table, this may take a few seconds.'],['Masa bulunamadı','Стол не найден','Table not found'],
['Ev sahibinin sayfası kapalı olabilir. Linki tekrar iste.','Возможно, страница хозяина закрыта. Попросите ссылку ещё раз.','The host\'s page may be closed. Ask for the link again.'],['Menüye dön','В меню','Back to menu'],['Masa dolu','Стол занят','Table full'],['Bu masada yer kalmadı.','За этим столом нет мест.','No seats left at this table.'],
['Masa aranıyor…','Ищем стол…','Finding a table…'],['Açık bir masa varsa oturtuyoruz, yoksa sana yeni masa açıyoruz.','Если есть открытый стол — посадим вас, иначе откроем новый.','If there is an open table we seat you, otherwise we open a new one.'],['Vazgeç','Отмена','Cancel'],['Masa bul','Найти стол','Find a table'],['Adını yaz, sana masa bulalım.','Введите имя, и мы найдём стол.','Enter your name and we\'ll find you a table.'],
['Link kopyalandı','Ссылка скопирована','Link copied'],['Linki seçip kopyala','Выделите и скопируйте ссылку','Select and copy the link'],['Mesaj yaz…','Сообщение…','Write a message…'],['Gönder','Отправить','Send'],['Mesajlar karşı tarafın diline otomatik çevrilir.','Сообщения автоматически переводятся.','Messages are translated automatically.'],
['Bu masa başka bir pencerede açıldı','Этот стол открыт в другом окне','This table was opened in another window'],['Sunucuya bağlanılamadı, tekrar deneniyor…','Нет связи с сервером, пробуем снова…','Can\'t reach the server, retrying…'],
['Oyuncu aranıyor…','Ищем игроков…','Looking for players…'],['Masa dolunca ya da 2. kişi geldikten 20 saniye sonra oyun kendiliğinden başlar.','Игра начнётся сама, когда стол заполнится или через 20 секунд после второго игрока.','The game starts by itself when the table is full or 20 seconds after the second player joins.'],
['Nuri','Нури','Nuri'],['Rıza','Рыза','Rıza'],['Hamdi','Хамди','Hamdi'],['Cemil','Джемиль','Cemil'],['Kâzım','Казым','Kâzım'],
];
const mk=j=>[
[/^(\d+) eksik$/,(m,n)=>j?`${n} to go`:`осталось ${n}`],[/^(\d+) eksik · (\d+) puan$/,(m,a,b)=>j?`${a} to go · ${b} pts`:`осталось ${a} · ${b} очк.`],[/^(\d+) puan$/,(m,n)=>j?`${n} pts`:`${n} очк.`],
[/^(\d+) sayı eksik · (\d+) puan$/,(m,a,b)=>j?`${a} numbers to go · ${b} pts`:`не хватает ${a} · ${b} очк.`],
[/^Torbada (\d+)$/,(m,n)=>j?`${n} in bag`:`в мешке ${n}`],[/^(\d+)\. top$/,(m,n)=>j?`Ball ${n}`:`${n}-й шар`],[/^(\d+)\. kart$/,(m,n)=>j?`Card ${n}`:`Карточка ${n}`],
[/^(\d+) sayı kaldı$/,(m,n)=>j?`${n} left`:`осталось ${n}`],[/^Başlat \((\d) kişi\)$/,(m,n)=>j?`Start (${n} players)`:`Начать (игроков: ${n})`],
[/^(\d+) top çekildi, torbada (\d+) kaldı\.$/,(m,a,b)=>j?`${a} balls drawn, ${b} left in the bag.`:`Вытянуто ${a}, в мешке осталось ${b}.`],
[/^(\d+) top çekildi\. Puanlar: 1\. çinko 1, 2\. çinko 2, tombala 4\.$/,(m,a)=>j?`${a} balls drawn. Points: 1st line 1, 2nd line 2, full house 4.`:`Вытянуто ${a}. Очки: 1-я линия 1, 2-я линия 2, лото 4.`],
[/^Tombala: (.+)$/,(m,a)=>j?`Full house: ${a}`:`Лото: ${a}`],[/^Toplam puanın: (\d+)\.$/,(m,n)=>j?`Your total points: ${n}.`:`Ваши очки: ${n}.`],
[/^(1\. Çinko|2\. Çinko|Tombala)!$/,(m,k)=>(KN[k]?KN[k][j]:k)+'!'],[/^(.+) · paylaştı$/,(m,a)=>j?`${a} · shared`:`${a} · поровну`],
];
window.I18N_RULES={ru:mk(0),en:mk(1)};
})();
