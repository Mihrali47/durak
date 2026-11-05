/* Pişti çevirileri: [tr, ru, en] */
(()=>{
const SU={maça:['пики','spades'],kupa:['червы','hearts'],karo:['бубны','diamonds'],sinek:['трефы','clubs']},RK={vale:['валет','jack'],'kız':['дама','queen'],papaz:['король','king'],as:['туз','ace']};
const cn=(s,j)=>s.replace(/(maça|kupa|karo|sinek)\s+(vale|kız|papaz|as|\d+)/gi,(m,a,b)=>{a=a.toLocaleLowerCase('tr');b=b.toLocaleLowerCase('tr');return (RK[b]?RK[b][j]:b)+(j?' of ':' ')+SU[a][j]});
const W=j=>({Sen:['Вы','You'],Bilgisayar:['Компьютер','Computer']});
const nm=(n,j)=>(W(j)[n]||[n,n])[j];
window.I18N_EXTRA=[
['Pişti','Пишти','Pishti'],['Menü','Меню','Menu'],['Oyuna dön','Вернуться в игру','Back to game'],['Kaç puana oynayalım?','До скольких очков играем?','Play to how many points?'],['Yeni oyuna başla','Начать новую игру','Start a new game'],
["Bilgisayara karşı oynuyorsun. Kartlar 4'er dağıtılır, deste bitince el sayılır. Yerde kalanlar son toplayana gider.",'Вы играете против компьютера. Сдаётся по 4 карты; когда колода кончится, раздача подсчитывается. Оставшиеся на столе карты получает последний взявший.','You play against the computer. Cards are dealt 4 at a time; when the deck runs out the hand is scored. Cards left on the table go to the last player who took.'],
['Elindeki kartı yerdeki en üst kartla eşleştir ya da vale atıp yeri topla. Yerde tek kart varken eşleştirirsen','Положите карту того же ранга, что верхняя на столе, или валета, чтобы забрать стол. Если на столе одна карта и вы её взяли —','Match the top card on the pile, or play a jack to sweep it. If you match when only one card is on the pile, it\'s a'],
['pişti','пишти','pishti'],[': 10 puan. Vale üstüne vale ise 20.',': 10 очков. Валет на валета — 20.',': 10 points. Jack on jack is 20.'],
['Puanlar','Очки','Points'],['En çok kart toplayan','Больше всех карт','Most cards'],['Her as, her vale','Каждый туз и валет','Each ace and jack'],['Sinek 2','Двойка треф','2 of clubs'],['Karo 10','Десятка бубен','10 of diamonds'],['Vale ile vale piştisi','Пишти валетом на валета','Jack-on-jack pishti'],
['Masada olanlar','На столе','On the table'],['Skor','Счёт','Score'],['Sen','Вы','You'],['Bilgisayar','Компьютер','Computer'],['Bilgisayar düşünüyor…','Компьютер думает…','Computer is thinking…'],['Sırada','Ходит','To play'],
['Sıra sende. Yer boş, bir kart at.','Ваш ход. Стол пуст, сыграйте карту.','Your turn. The pile is empty, play a card.'],['Sıra sende. Yerdeki','Ваш ход. Сверху:','Your turn. Top card:'],['Yer boş','Стол пуст','Pile empty'],
['Ses: Açık','Звук: вкл','Sound: on'],['Ses: Kapalı','Звук: выкл','Sound: off'],['Son alan: yok','Последний взявший: нет','Last taker: none'],['Son alan: Sen','Последний взявший: вы','Last taker: you'],['Son alan: Bilgisayar','Последний взявший: компьютер','Last taker: computer'],
['Bu el','Эта раздача','This hand'],['Toplam','Итого','Total'],['Piş','Пиш','Pish'],['PİŞTİ!','ПИШТИ!','PISHTI!'],['ti','ти','ti'],
];
const mk=j=>[
[/^(\d+)\. el başladı\. Yerdeki açık kart: (.+)\.$/,(m,n,c)=>j?`Hand ${n} started. Face-up card: ${cn(c,1)}.`:`Раздача ${n}. Открытая карта: ${cn(c,0)}.`],
[/^(Sen|Bilgisayar) (.+) attı\.$/,(m,w,c)=>j?`${nm(w,1)} played ${cn(c,1)}.`:`${nm(w,0)}: ${cn(c,0)}.`],
[/^(Sen|Bilgisayar) (.+) ile (\d+) kartı topladı\.$/,(m,w,c,n)=>j?`${nm(w,1)} took ${n} cards with ${cn(c,1)}.`:`${nm(w,0)} забирает ${n} карт: ${cn(c,0)}.`],
[/^(Sen|Bilgisayar) (.+) ile PİŞTİ yaptı! \+(\d+)$/,(m,w,c,v)=>j?`${nm(w,1)} made PISHTI with ${cn(c,1)}! +${v}`:`${nm(w,0)}: ПИШТИ (${cn(c,0)})! +${v}`],
[/^Yeni kartlar dağıtıldı\. Destede (\d+) kart kaldı\.$/,(m,n)=>j?`New cards dealt. ${n} left in the deck.`:`Новая сдача. В колоде осталось ${n}.`],
[/^Yerde kalan (\d+) kart son alan (sana|Bilgisayara) gitti\.$/,(m,n,w)=>j?`The ${n} remaining cards went to ${w==='sana'?'you':'the computer'}.`:`Оставшиеся ${n} карт ушли ${w==='sana'?'вам':'компьютеру'}.`],
[/^(\d+) kart · (\d+) pişti$/,(m,a,b)=>j?`${a} cards · ${b} pishti`:`${a} карт · ${b} пишти`],[/^Deste (\d+)$/,(m,n)=>j?`Deck ${n}`:`Колода ${n}`],[/^Yerde (\d+) kart$/,(m,n)=>j?`${n} on the pile`:`На столе ${n}`],
[/^Hedef (\d+) · (\d+)\. el · Rekor (\d+)–(\d+)$/,(m,a,b,c,d)=>j?`Target ${a} · hand ${b} · record ${c}–${d}`:`Цель ${a} · раздача ${b} · рекорд ${c}–${d}`],
[/^Rekorun: (\d+) galibiyet, (\d+) mağlubiyet\.$/,(m,a,b)=>j?`Your record: ${a} wins, ${b} losses.`:`Ваш рекорд: ${a} побед, ${b} поражений.`],
[/^(\d+) puan$/,(m,n)=>j?`${n} points`:`${n} очков`],
[/^(maça|kupa|karo|sinek) (vale|kız|papaz|as|\d+)$/i,(m)=>cn(m,j)],
];
window.I18N_RULES={ru:mk(0),en:mk(1)};
})();
