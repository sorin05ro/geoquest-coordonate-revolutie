# GeoQuest – Coordonate și Revoluție 🦉🌍

Aplicație gamificată pentru **clasa a V-a**: **coordonatele geografice** (rețeaua de grade) și **mișcarea de revoluție a Pământului**. Elevii învață prin joc toți itemii din testul *„Coordonatele geografice. Mișcarea de revoluție a Pământului”*, **Varianta 1** și **Varianta 2**, amestecați pe teme.

Un modul al proiectului GeoQuest, construit după modelul *Expediția Asia* (clasa a VII-a) și *Misiunea Carpați* (clasa a VIII-a). Mascota este **Geo, bufnița-cartograf**.

## Ce conține

- **Doar itemii din test: 18 itemi** (9 poziții × 2 variante), cu răspunsurile din barem. Nu există întrebări inventate.
- **Rețeaua de grade din test**, desenată în aplicație: meridianele din 20° în 20°, paralelele din 10° în 10°, cu punctele A–D ale fiecărei variante. Elevul alege valoarea în grade și emisfera (N/S, E/V). Pe telefon, rețeaua se poate mări.
- **Punctaj după barem:** 0,5 p latitudinea + 0,5 p longitudinea; 0,25 p dacă gradele sunt corecte, dar emisfera lipsește sau e greșită.
- **2 tărâmuri, 3 niveluri**, fiecare cu itemi din ambele variante:
  - *Rețeaua de grade*: coordonatele punctelor A, B, C, D;
  - *Mișcarea de revoluție*: durata revoluției și anul bisect · anotimpuri, solstiții și echinocții.
- **Marea Expediție:** un test nou la fiecare încercare. Pentru fiecare item (I.A … III), aplicația alege la întâmplare Varianta 1 sau Varianta 2. Punctaj: 8p + 2p din oficiu = 10; nota = punctajul.
- **9 fișe de recapitulare** (Coordonatele geografice · Mișcarea de revoluție).
- **Recompense:** XP și 6 ranguri (de la Ucenic la Stăpânul Rețelei), 11 insigne, serie zilnică, 1–3 stele pe nivel, 24 de flashcard-uri cu repetiție spațiată (Leitner), greșelile revin la sfârșitul nivelului.
- **Mod Clasă** pentru tabla interactivă: 2–4 echipe și „Roata norocului” pe subiectele I–III.
- **Mod Profesor** (PIN): activarea itemilor, greșeli frecvente, export/import progres, deblocarea expediției, rețelele celor două variante cu răspunsurile.
- **Funcționează offline** și se poate instala pe telefon. Fără conturi, cookie-uri sau reclame; elevul folosește doar o poreclă.

## Cum se modifică itemii

Itemii, fișele, tărâmurile și punctajele se află în `tools/genereaza.py`. După o modificare:

```bash
python3 tools/genereaza.py        # regenerează data/*.json
python3 -m http.server 8765
node tests/ruleaza.mjs            # are nevoie de Playwright
```

Testele automate verifică: coordonatele și asocierile din barem, punctajul parțial la coordonate, răspunsurile acceptate la completare (cu sau fără diacritice), că fiecare nivel are itemi din ambele variante, că testul amestecat dă mereu 10 puncte (8 + 2 din oficiu) și lipsa scroll-ului orizontal la 375, 768 și 1920 px.

## Autor și licență

**Autor:** prof. Negraru Sorin Norocel, Școala Gimnazială Nr. 6, Râmnicu Sărat.

- conținutul educațional: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/);
- codul: MIT (vezi `LICENSE`).
