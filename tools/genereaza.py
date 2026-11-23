# Generează fișierele din data/ pentru GeoQuest – Coordonate și Revoluție (clasa a V-a).
# Sursa: testul „Coordonatele geografice. Mișcarea de revoluție a Pământului” (Varianta 1 și Varianta 2, cu barem)
# al prof. Negraru Sorin Norocel.
# Rulare (din rădăcina proiectului):  python3 tools/genereaza.py
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')

# ================================================================ FIȘELE DE RECAPITULARE
LECTII_INDEX = [
    {"id": "coordonate", "nume": "Coordonatele geografice", "icon": "🌐", "culoare": "#1e4f80"},
    {"id": "revolutie", "nume": "Mișcarea de revoluție", "icon": "☀️", "culoare": "#b7791f"},
]
L = {
 "coordonate": [
  ("Rețeaua de grade", [
   "Paralelele sunt cercuri imaginare, paralele cu Ecuatorul. Pe hartă sunt liniile orizontale.",
   "Ecuatorul este paralela de 0°. El împarte Pământul în emisfera nordică (sus) și emisfera sudică (jos).",
   "Meridianele sunt semicercuri imaginare care unesc cei doi poli. Pe hartă sunt liniile verticale.",
   "Meridianul 0° împarte Pământul în emisfera estică (în dreapta lui) și emisfera vestică (în stânga lui).",
   "Pe rețeaua din test, meridianele sunt trasate din 20° în 20°, iar paralelele din 10° în 10°."]),
  ("Latitudinea", [
   "Latitudinea arată pe ce paralelă se află punctul: câte grade este depărtat de Ecuator.",
   "Are valori de la 0° (la Ecuator) până la 90° (la poli).",
   "Dacă punctul este deasupra Ecuatorului, scriem lat. N (nordică). Dacă este dedesubt, scriem lat. S (sudică).",
   "Valorile latitudinii se citesc pe marginea laterală a rețelei, în dreptul paralelelor."]),
  ("Longitudinea", [
   "Longitudinea arată pe ce meridian se află punctul: câte grade este depărtat de Meridianul 0°.",
   "Are valori de la 0° până la 180°.",
   "Dacă punctul este în dreapta Meridianului 0°, scriem long. E (estică). Dacă este în stânga, scriem long. V (vestică).",
   "Valorile longitudinii se citesc pe marginea de sus a rețelei, în dreptul meridianelor."]),
  ("Cum precizez coordonatele unui punct", [
   "1. Urmăresc paralela pe care stă punctul și citesc valoarea ei: aceasta este latitudinea.",
   "2. Mă uit dacă punctul este deasupra sau dedesubtul Ecuatorului: N sau S.",
   "3. Urmăresc meridianul pe care stă punctul și citesc valoarea lui: aceasta este longitudinea.",
   "4. Mă uit dacă punctul este în dreapta sau în stânga Meridianului 0°: E sau V.",
   "Exemplu: 30° lat. N; 120° long. V. Atenție: fără emisferă (N/S, E/V), răspunsul este incomplet și primește doar jumătate din punctaj."]),
 ],
 "revolutie": [
  ("Ce este mișcarea de revoluție", [
   "Mișcarea de revoluție este rotația Pământului în jurul Soarelui.",
   "O mișcare de revoluție completă durează 365 de zile și 6 ore."]),
  ("Anul bisect", [
   "Cele 6 ore rămase în fiecare an se însumează o dată la 4 ani: 4 × 6 ore = 24 de ore, adică o zi întreagă.",
   "Această zi în plus este 29 februarie.",
   "Anul care are ziua de 29 februarie se numește an bisect."]),
  ("Consecințele mișcării de revoluție", [
   "Formarea anotimpurilor.",
   "Formarea zonelor de căldură."]),
  ("Echinocțiile (ziua egală cu noaptea)", [
   "21 martie – echinocțiul de primăvară: ziua este egală cu noaptea; începe primăvara în emisfera nordică și toamna în emisfera sudică; începe ziua polară la Polul Nord.",
   "23 septembrie – echinocțiul de toamnă: ziua este egală cu noaptea; începe toamna în emisfera nordică și primăvara în emisfera sudică; începe noaptea polară la Polul Nord."]),
  ("Solstițiile", [
   "22 iunie – solstițiul de vară: ziua cea mai lungă în emisfera nordică; vară în emisfera nordică, iarnă în emisfera sudică.",
   "22 decembrie – solstițiul de iarnă: noaptea cea mai lungă în emisfera nordică și ziua cea mai lungă în emisfera sudică; iarnă în emisfera nordică, vară în emisfera sudică.",
   "Atenție: anotimpurile sunt inversate în cele două emisfere."]),
 ],
}

# ================================================================ TĂRÂMURI ȘI NIVELURI (itemi amestecați din ambele variante)
TARAMURI = [
 {"id": "t1", "nume": "Rețeaua de grade", "icon": "🌐", "culoare": "#1e4f80", "niveluri": [
   {"id": "n1", "titlu": "Coordonatele punctelor A, B, C, D"}]},
 {"id": "t2", "nume": "Mișcarea de revoluție", "icon": "☀️", "culoare": "#b7791f", "niveluri": [
   {"id": "n2", "titlu": "Durata revoluției și anul bisect"},
   {"id": "n3", "titlu": "Anotimpuri, solstiții și echinocții"}]},
]
TARAM_NIVEL = {n["id"]: t["id"] for t in TARAMURI for n in t["niveluri"]}

# structura testului (folosită de Marea Expediție)
STRUCTURA = [
 {"subiect": "I", "cerinta": "Precizează coordonatele geografice (latitudinea și longitudinea) ale punctelor A, B, C și D marcate pe rețea.", "sloturi": ["I-A", "I-B", "I-C", "I-D"]},
 {"subiect": "II", "cerinta": "Completează spațiile libere cu termenii potriviți.", "sloturi": ["II-a", "II-b", "II-c", "II-d"]},
 {"subiect": "III", "cerinta": "Asociază fiecare moment al mișcării de revoluție din coloana A cu caracteristica potrivită din coloana B. Un element din coloana B nu are corespondent.", "sloturi": ["III"]},
]
TEST = {"titlu": "Coordonatele geografice. Mișcarea de revoluție a Pământului", "oficiu": 2, "total": 10, "minute": 40}

# ================================================================ ITEMII DIN TEST
Q = []
def item(var, slot, nivel, tip, puncte, enunt, lectie, expl, sursa, **kw):
    sub = slot.split('-')[0]
    d = {"id": f"V{var}-{slot}", "test": var, "subiect": sub, "slot": slot, "puncte": puncte, "tip": tip,
         "taram": TARAM_NIVEL[nivel], "nivel": nivel, "enunt": enunt, "origine": "test",
         "explicatie_geo": expl, "sursa": sursa, "lectie": lectie, "dificultate": 2}
    d.update(kw); Q.append(d)

# ---------- Subiectul I – coordonate (4 puncte × 1p; 0,5p latitudinea + 0,5p longitudinea)
PUNCTE = {1: {"A": (30, -120), "B": (60, 80), "C": (-20, 40), "D": (-50, -140)},
          2: {"A": (50, -40), "B": (10, 120), "C": (-40, 160), "D": (-70, -60)}}
def fmt(lat, lon):
    return f"{abs(lat)}° lat. {'N' if lat > 0 else 'S'}; {abs(lon)}° long. {'E' if lon > 0 else 'V'}"
for v, pts in PUNCTE.items():
    for lit, (lat, lon) in pts.items():
        ns = "deasupra Ecuatorului, în emisfera nordică" if lat > 0 else "sub Ecuator, în emisfera sudică"
        ev = "în dreapta Meridianului 0°, în emisfera estică" if lon > 0 else "în stânga Meridianului 0°, în emisfera vestică"
        item(v, f"I-{lit}", "n1", "coordonate", 1,
             f"Precizează coordonatele geografice ale punctului {lit}.", "coordonate",
             f"Punctul {lit} stă pe paralela de {abs(lat)}°, {ns}, și pe meridianul de {abs(lon)}°, {ev}: {fmt(lat, lon)}.",
             "Latitudinea se citește pe paralele (N deasupra Ecuatorului, S dedesubt). Longitudinea se citește pe meridiane (E în dreapta Meridianului 0°, V în stânga).",
             punct=lit, lat=lat, lon=lon, raspuns=fmt(lat, lon),
             puncte_retea=[{"eticheta": k, "lat": a, "lon": b} for k, (a, b) in pts.items()])

# ---------- Subiectul II – completare (4 × 0,5p)
ZILE = "O mișcare de revoluție completă durează 365 de zile și 6 ore."
BIS = "Cele 6 ore se însumează o dată la 4 ani și formează ziua de 29 februarie; anul acela se numește an bisect."
CONS = "Consecințele mișcării de revoluție: formarea anotimpurilor și formarea zonelor de căldură."
def comp(var, slot, nivel, enunt, acc, expl, sursa, indiciu):
    item(var, slot, nivel, "completare", 0.5, enunt, "revolutie", expl, sursa, raspunsuri_acceptate=acc, indiciu=indiciu)

comp(1, "II-a", "n2", "Mișcarea de revoluție reprezintă rotația Pământului în jurul …… .", ["Soarelui", "Soarele", "Soare"],
     "Pământul se rotește în jurul Soarelui: aceasta este mișcarea de revoluție.", "Mișcarea de revoluție este rotația Pământului în jurul Soarelui.", "Este steaua care ne dă lumină și căldură.")
comp(1, "II-b", "n2", "O mișcare de revoluție completă durează 365 de zile și …… ore.", ["6", "șase"],
     "Revoluția durează 365 de zile și 6 ore.", ZILE, "Scrie un număr: câte ore se adaugă la cele 365 de zile?")
comp(1, "II-c", "n2", "Ziua de 29 februarie apare o dată la 4 ani, în anul …… .", ["bisect"],
     "Anul cu 29 februarie are 366 de zile și se numește an bisect.", BIS, "Începe cu „bi…”.")
comp(1, "II-d", "n3", "Consecințele mișcării de revoluție sunt formarea anotimpurilor și formarea …… .",
     ["zonelor de căldură", "zonele de căldură", "zone de căldură", "zonelor de caldura"],
     "Mișcarea de revoluție are două consecințe: anotimpurile și zonele de căldură.", CONS, "Două cuvinte despre cât de cald este în diferite părți ale Pământului: „zonelor de …”.")
comp(2, "II-a", "n2", "Mișcarea de revoluție a Pământului în jurul Soarelui se realizează în …… de zile și 6 ore.", ["365", "trei sute șaizeci și cinci"],
     "Revoluția durează 365 de zile și 6 ore – aproape cât un an obișnuit.", ZILE, "Câte zile are un an obișnuit? Scrie numărul.")
comp(2, "II-b", "n2", "Cele 6 ore se însumează o dată la …… ani și formează ziua de 29 februarie.", ["4", "patru"],
     "4 × 6 ore = 24 de ore, adică o zi: 29 februarie, o dată la 4 ani.", BIS, "Câte bucăți de 6 ore fac o zi de 24 de ore?")
comp(2, "II-c", "n3", "O consecință a mișcării de revoluție este formarea …… .",
     ["anotimpurilor", "anotimpurile", "anotimpuri", "zonelor de căldură", "zonele de căldură", "zone de căldură"],
     "Consecințele revoluției sunt anotimpurile și zonele de căldură; oricare dintre ele este corectă.", CONS, "Primăvara, vara, toamna și iarna sunt…")
comp(2, "II-d", "n3", "La echinocții (21 martie și 23 septembrie), ziua este …… cu noaptea.", ["egală", "egal", "egale"],
     "La echinocții ziua este egală cu noaptea.", "21 martie și 23 septembrie – echinocțiile: ziua este egală cu noaptea.", "„Echi-” înseamnă „la fel”.")

# ---------- Subiectul III – potrivire (4 × 0,5p = 2p)
item(1, "III", "n3", "potrivire", 2,
     "Asociază fiecare moment al mișcării de revoluție din coloana A cu caracteristica potrivită din coloana B. Un element din coloana B nu are corespondent.",
     "revolutie",
     "21 martie: zi = noapte, începe primăvara în nord. 22 iunie: cea mai lungă zi în nord. 23 septembrie: zi = noapte, începe toamna în nord. 22 decembrie: cea mai lungă noapte în nord.",
     "Fișele „Echinocțiile” și „Solstițiile”.",
     coloanaA=["Echinocțiul de primăvară (21 martie)", "Solstițiul de vară (22 iunie)", "Echinocțiul de toamnă (23 septembrie)", "Solstițiul de iarnă (22 decembrie)"],
     coloanaB=["noaptea cea mai lungă în emisfera nordică; iarnă în nord, vară în sud",
               "ziua este egală cu noaptea; începe primăvara în emisfera nordică",
               "ziua cea mai lungă în emisfera nordică; vară în nord, iarnă în sud",
               "ziua cea mai lungă în emisfera sudică; vară în nord",
               "ziua este egală cu noaptea; începe toamna în emisfera nordică"],
     perechi={"0": 1, "1": 2, "2": 4, "3": 0})
item(2, "III", "n3", "potrivire", 2,
     "Asociază fiecare moment al mișcării de revoluție din coloana A cu caracteristica potrivită din coloana B. Un element din coloana B nu are corespondent.",
     "revolutie",
     "22 decembrie: cea mai lungă zi în sud, vară în sud. 23 septembrie: începe noaptea polară la Polul Nord, primăvara în sud. 22 iunie: cea mai lungă noapte în sud, iarnă în sud. 21 martie: începe ziua polară la Polul Nord, toamna în sud.",
     "Fișele „Echinocțiile” și „Solstițiile”.",
     coloanaA=["Solstițiul de iarnă (22 decembrie)", "Echinocțiul de toamnă (23 septembrie)", "Solstițiul de vară (22 iunie)", "Echinocțiul de primăvară (21 martie)"],
     coloanaB=["începe ziua polară la Polul Nord; începe toamna în emisfera sudică",
               "noaptea cea mai lungă în emisfera sudică; iarnă în sud",
               "începe noaptea polară la Polul Nord; începe primăvara în emisfera sudică",
               "ziua cea mai lungă în emisfera sudică; vară în sud",
               "ziua cea mai lungă în emisfera nordică; iarnă în nord"],
     perechi={"0": 3, "1": 2, "2": 1, "3": 0})

# ================================================================ INSIGNE
INSIGNE = [
 ("primul-pas", "Primul pas", "👣", "Primul nivel terminat."),
 ("trei-stele", "Trei stele", "⭐", "Un nivel terminat cu 3 stele."),
 ("toate-nivelurile", "Toate nivelurile", "🧭", "Cel puțin o stea în fiecare nivel."),
 ("cititor-de-retea", "Cititor de rețea", "🌐", "6 puncte cu coordonatele corecte."),
 ("ochi-de-cartograf", "Ochi de cartograf", "🗺️", "4 puncte corecte, unul după altul."),
 ("calendarul", "Calendarul Pământului", "📅", "5 spații completate corect despre revoluție."),
 ("anotimpurile", "Stăpânul anotimpurilor", "🌗", "O asociere a solstițiilor și echinocțiilor rezolvată perfect."),
 ("seria-de-foc", "Seria de foc", "🔥", "Ai învățat 5 zile la rând."),
 ("expeditia", "Expediția", "🏅", "Marea Expediție terminată cu nota cel puțin 9."),
 ("expeditia-perfecta", "Nota 10", "🏆", "Marea Expediție terminată cu nota 10."),
 ("memorie-de-bufnita", "Memorie de bufniță", "🦉", "10 flashcard-uri ajunse în cutia 5."),
]

# ================================================================ SCRIERE
def scrie(nume, obj):
    with open(os.path.join(OUT, nume), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)

os.makedirs(OUT, exist_ok=True)
scrie("lectii.json", {"taramuri": TARAMURI, "structura_test": STRUCTURA, "test": TEST, "lectii_index": LECTII_INDEX,
                      "lectii": {k: [{"titlu": t, "puncte": p} for t, p in v] for k, v in L.items()}})
scrie("intrebari_teste.json", Q)
scrie("intrebari_extra.json", [])
scrie("insigne.json", [{"id": a, "nume": b, "icon": c, "descriere": d} for a, b, c, d in INSIGNE])

# verificări rapide
tot = {}
for q in Q: tot[q["test"]] = tot.get(q["test"], 0) + q["puncte"]
assert tot == {1: 8, 2: 8}, tot
for n in TARAM_NIVEL: assert {q["test"] for q in Q if q["nivel"] == n} == {1, 2}, n
print(f"{len(Q)} itemi · punctaj pe variantă: {tot} (+2 oficiu) · niveluri: " + ", ".join(f"{n}={sum(q['nivel']==n for q in Q)}" for n in TARAM_NIVEL))
