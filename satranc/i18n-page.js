/* Kavgacı Satranç çevirileri: [tr, ru, en] */
(()=>{
const PC={piyon:['пешка','pawn'],at:['конь','knight'],fil:['слон','bishop'],kale:['ладья','rook'],vezir:['ферзь','queen'],'şah':['король','king']};
const PD={piyona:'piyon',ata:'at',file:'fil',kaleye:'kale',vezire:'vezir','şaha':'şah'};
const CL={Mavi:['Синие','Blue'],Siyah:['Чёрные','Black'],mavi:['синий','blue'],siyah:['чёрный','black']};
const VB={'kafa attı':['боднула','headbutted'],'çifte attı':['лягнул','kicked'],'yumruk attı':['ударил','punched'],'tosladı':['протаранила','rammed'],'yıldırım çaktı':['метнул молнию в','zapped'],'tepeden çöktü':['обрушился на','slammed']};
window.I18N_EXTRA=[
['Berabere','Ничья','Draw'],['Pat','Пат','Stalemate'],['Şah mat!','Мат!','Checkmate!'],
['Mat edecek taş kalmadı, kavga bitti.','Матовать нечем, бой окончен.','Not enough pieces left to mate, the fight is over.'],
['Aynı pozisyon üç kez tekrarlandı.','Позиция повторилась трижды.','The same position occurred three times.'],
['50 hamledir piyon oynanmadı ve taş alınmadı.','50 ходов без хода пешкой и без взятий.','50 moves without a pawn move or capture.'],
['İki taraf da yoruldu, maç uzadı.','Обе стороны устали, партия затянулась.','Both sides got tired, the game ran too long.'],
['Hamle kalmadı, oyun berabere.','Ходов нет, ничья.','No moves left, the game is a draw.'],
['Kavgacı','Драчливые','Brawling'],['Satranç','шахматы','Chess'],['Kavgacı Satranç','Драчливые шахматы','Brawling Chess'],['Menü','Меню','Menu'],
['Taşlar yürür, çifte atar, yumruk sallar. Nasıl oynamak istersin?','Фигуры ходят, лягаются и дерутся. Как будете играть?','Pieces walk, kick and punch. How do you want to play?'],
['Bilgisayara karşı','Против компьютера','Vs computer'],['Mavilerle sen oynarsın','Вы играете синими','You play blue'],['Arkadaşla','С другом','With a friend'],['Aynı ekranda sırayla','По очереди на одном экране','Take turns on one screen'],
['İzle','Смотреть','Watch'],['İki tarafı da bilgisayar oynar','Компьютер играет за обе стороны','Computer plays both sides'],['Online oyna','Играть онлайн','Play online'],['Link gönder, telefondan birlikte oynayın','Отправьте ссылку и играйте с телефона','Send a link, play together from phones'],
['Ses efektleri ve seslendirme','Звуковые эффекты и озвучка','Sound effects and voice'],['Oyuna dön','Вернуться в игру','Back to game'],['Geri','Назад','Back'],
['Bir oyun kur ve linki arkadaşına gönder ya da sana gelen kodla katıl.','Создайте игру и отправьте ссылку другу или войдите по коду.','Create a game and send the link, or join with a code.'],
['Yeni online oyun kur','Создать онлайн-игру','Create online game'],['Katıl','Войти','Join'],['Kopyala','Копировать','Copy'],['Oyuna gir','Войти в игру','Enter game'],['Linki kopyala','Копировать ссылку','Copy link'],
['Oyun hazır. Bu linki arkadaşına gönder, sonra oyuna gir. Sen mavisin, o katılınca başlarsınız.','Игра готова. Отправьте ссылку другу и войдите. Вы — синие, начнёте, когда он присоединится.','Game ready. Send this link to your friend, then enter. You are blue; you start when they join.'],
['Bağlanılıyor…','Подключение…','Connecting…'],['Rakip bekleniyor','Ждём соперника','Waiting for opponent'],['Linki arkadaşına gönder. Katıldığı an oyun başlar.','Отправьте ссылку другу. Игра начнётся, когда он войдёт.','Send the link to your friend. The game starts when they join.'],
['Online oyun ·','Онлайн-игра ·','Online game ·'],['Mod','Режим','Mode'],['Yeni oyun','Новая игра','New game'],['Geri al','Отменить ход','Undo'],['Hız: Normal','Скорость: обычная','Speed: normal'],['Hız: Hızlı','Скорость: быстрая','Speed: fast'],
['Kim kime ne yaptı','Кто кого','Who hit whom'],['Dövüş stilleri','Боевые стили','Fighting styles'],['Piyon','Пешка','Pawn'],['At','Конь','Knight'],['Fil','Слон','Bishop'],['Kale','Ладья','Rook'],['Vezir','Ферзь','Queen'],['Şah','Король','King'],
['Tıpış tıpış yürür, kafa atar','Семенит и бьёт головой','Toddles along, headbutts'],['Arkasını döner, çifte atar','Разворачивается и лягается','Turns around and kicks'],['Kolunu kaldırır, yumruk atar','Замахивается и бьёт кулаком','Raises an arm and punches'],
['Geri çekilir, koşup toslar','Отходит, разбегается и таранит','Backs up, charges and rams'],['Elini kaldırır, yıldırım çakar','Поднимает руку и мечет молнию','Raises a hand and strikes lightning'],['Zıplar, tepeden çöker','Подпрыгивает и обрушивается сверху','Jumps and slams down'],
['Sırada','Ходит','To move'],['Mavi','Синие','Blue'],['Siyah','Чёрные','Black'],['Mavi oynar','Ходят синие','Blue to move'],['Siyah oynar','Ходят чёрные','Black to move'],['Bir taşa dokun, sonra gideceği kareye.','Нажмите на фигуру, затем на клетку.','Tap a piece, then its target square.'],
['Kavga sürüyor…','Бой продолжается…','The brawl goes on…'],['ŞAH!','ШАХ!','CHECK!'],['Şahını kurtarman lazım.','Нужно спасать короля.','You must save your king.'],['Oyun başladı. İlk hamle mavinin.','Игра началась. Первый ход синих.','Game started. Blue moves first.'],
['İki tarafı da bilgisayar oynuyor. Arkana yaslan, izle.','Компьютер играет за обе стороны. Расслабьтесь и смотрите.','The computer plays both sides. Sit back and watch.'],['Rakip düşünüyor…','Соперник думает…','Opponent is thinking…'],['Rakibin sırası','Ход соперника','Opponent\'s turn'],['Sıra sende','Ваш ход','Your turn'],
['Bilgisayar düşünüyor…','Компьютер думает…','Computer is thinking…'],['Yeni oyun','Новая игра','New game'],['TIPIŞ TIPIŞ','ТОП-ТОП','TIPTOE'],['ÇİFTE!','ЛЯГ!','KICK!'],['KAFA!','БОДЬ!','HEADBUTT!'],['YUMRUK!','БАЦ!','PUNCH!'],['BAM!','БАМ!','BAM!'],['ZZAP!','ВЖУХ!','ZZAP!'],['ÇÖK!','БУХ!','SLAM!'],['Mat!','Мат!','Checkmate!'],['Pat!','Пат!','Stalemate!'],['Bilgisayar','Компьютер','Computer'],['Rakip','Соперник','Opponent'],
['@Davet linki','Ссылка-приглашение','Invite link'],['@Emoji gönder','Отправить эмодзи','Send emoji'],['@Mod','Режим','Mode'],['@Oyun kodu','Код игры','Game code'],['@Sesi aç','Включить звук','Sound on'],['@Sesi kapat','Выключить звук','Sound off'],
];
window.I18N_RULES={
ru:[
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah) (\w\d)→(\w\d) yürüdü(, iki adım birden)?\.(.*)$/,(m,c,p,a,b,d,e)=>`${CL[c][0]} ${PC[p][0]} ${a}→${b}${d?', на две клетки':''}.${e?' Пешка стала ферзём!':''}`],
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah) (\w\d) karesine geçti\.(.*)$/,(m,c,p,a,e)=>`${CL[c][0]} ${PC[p][0]} → ${a}.${e?' Пешка стала ферзём!':''}`],
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah), (mavi|siyah) (\S+) (kafa attı|çifte attı|yumruk attı|tosladı|yıldırım çaktı|tepeden çöktü)\.(.*)$/,(m,c,p,c2,d,v)=>`${CL[c][0]} ${PC[p][0]} ${VB[v][0]} ${PC[PD[d]]?PC[PD[d]][0]:d} (${CL[c2][0]}).`],
[/^(Mavi|Siyah) rok attı, şah kaleye sığındı\.$/,(m,c)=>`${CL[c][0]}: рокировка.`],
[/^(.+) — ŞAH!$/,'$1 — ШАХ!'],[/^Bilgisayar \((mavi|siyah)\) oynar$/,(m,c)=>`Компьютер (${CL[c][0].toLowerCase()}) ходит`],[/^Bilgisayar · (Mavi|Siyah)$/,(m,c)=>'Компьютер · '+CL[c][0]],[/^Sen · (Mavi|Siyah)$/,(m,c)=>'Вы · '+CL[c][0]],[/^Rakip · (Mavi|Siyah)$/,(m,c)=>'Соперник · '+CL[c][0]],[/^Rakip bekleniyor · (Mavi|Siyah)$/,(m,c)=>'Ждём соперника · '+CL[c][0]],
[/^(\w\d) (mavi|siyah) (piyon|at|fil|kale|vezir|şah)$/,(m,s,c,p)=>`${s} ${CL[c][0]} ${PC[p][0]}`],[/^(\w\d) boş$/,'$1 пусто'],[/^(.+) gönder$/,'Отправить $1'],
[/^(.+) kazandı\. Rövanş\?$/,'$1 побеждает. Реванш?'],[/^(Mavi|Siyah) kazandı(!| Yeni maç birazdan başlıyor\.|\.)(.*)$/,(m,c,x,r)=>CL[c][0]+' побеждает'+(r?'! Новая партия скоро начнётся.':'.')],[/^Sen kazandın, bilgisayar yere serildi!$/,'Вы победили, компьютер повержен!'],[/^Bilgisayar kazandı\. Rövanş\?$/,'Компьютер победил. Реванш?'],
],
en:[
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah) (\w\d)→(\w\d) yürüdü(, iki adım birden)?\.(.*)$/,(m,c,p,a,b,d,e)=>`${CL[c][1]} ${PC[p][1]} ${a}→${b}${d?', two squares':''}.${e?' Pawn promoted to queen!':''}`],
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah) (\w\d) karesine geçti\.(.*)$/,(m,c,p,a,e)=>`${CL[c][1]} ${PC[p][1]} to ${a}.${e?' Pawn promoted to queen!':''}`],
[/^(Mavi|Siyah) (piyon|at|fil|kale|vezir|şah), (mavi|siyah) (\S+) (kafa attı|çifte attı|yumruk attı|tosladı|yıldırım çaktı|tepeden çöktü)\.(.*)$/,(m,c,p,c2,d,v)=>`${CL[c][1]} ${PC[p][1]} ${VB[v][1]} the ${CL[c2][1].toLowerCase()} ${PC[PD[d]]?PC[PD[d]][1]:d}.`],
[/^(Mavi|Siyah) rok attı, şah kaleye sığındı\.$/,(m,c)=>`${CL[c][1]} castled.`],
[/^(.+) — ŞAH!$/,'$1 — CHECK!'],[/^Bilgisayar \((mavi|siyah)\) oynar$/,(m,c)=>`Computer (${CL[c][1].toLowerCase()}) to move`],[/^Bilgisayar · (Mavi|Siyah)$/,(m,c)=>'Computer · '+CL[c][1]],[/^Sen · (Mavi|Siyah)$/,(m,c)=>'You · '+CL[c][1]],[/^Rakip · (Mavi|Siyah)$/,(m,c)=>'Opponent · '+CL[c][1]],[/^Rakip bekleniyor · (Mavi|Siyah)$/,(m,c)=>'Waiting for opponent · '+CL[c][1]],
[/^(\w\d) (mavi|siyah) (piyon|at|fil|kale|vezir|şah)$/,(m,s,c,p)=>`${s} ${CL[c][1].toLowerCase()} ${PC[p][1]}`],[/^(\w\d) boş$/,'$1 empty'],[/^(.+) gönder$/,'Send $1'],
[/^(.+) kazandı\. Rövanş\?$/,'$1 wins. Rematch?'],[/^(Mavi|Siyah) kazandı(!| Yeni maç birazdan başlıyor\.|\.)(.*)$/,(m,c,x,r)=>CL[c][1]+' wins'+(r?'! A new game starts shortly.':'.')],[/^Sen kazandın, bilgisayar yere serildi!$/,'You won, the computer is down!'],[/^Bilgisayar kazandı\. Rövanş\?$/,'The computer won. Rematch?'],
]};
})();
