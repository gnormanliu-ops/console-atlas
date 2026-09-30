"""Reproducible deeper analyses from the published cleaned console catalog."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from scipy.stats import kruskal, spearmanr

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
raw = json.loads((DATA / "console_games.json").read_text(encoding="utf-8"))
rows = [dict(zip(raw["columns"], values)) for values in raw["rows"]]
games = list({row["game_id"]: row for row in rows}.values())

years = Counter(game["year"] for game in games)
platform_genres = defaultdict(Counter)
platform_games = defaultdict(set)
for row in rows:
    platform_genres[row["platform"]][row["genre"]] += 1
    platform_games[row["platform"]].add(row["game_id"])
platforms = sorted(platform_games, key=lambda p: (-len(platform_games[p]), p))[:8]
genre_order = [g for g, _ in Counter(g["genre"] for g in games).most_common(5)]
mix = []
for platform in platforms:
    counts = platform_genres[platform]
    mix.append({"platform": platform, "n": sum(counts.values()), "shares": {
        **{g: round(100 * counts[g] / sum(counts.values()), 1) for g in genre_order},
        "Other": round(100 * (sum(counts.values()) - sum(counts[g] for g in genre_order)) / sum(counts.values()), 1),
    }})

def quartiles(values):
    a = np.asarray(values, dtype=float)
    return [round(float(x), 2) for x in np.percentile(a, [10, 25, 50, 75, 90])]

genre_hours = []
for genre, _ in Counter(g["genre"] for g in games).most_common(8):
    subset = [g for g in games if g["genre"] == genre]
    positive = lambda key: [g[key] for g in subset if g[key] is not None and g[key] > 0]
    main, extra, completionist = (positive(k) for k in ("main_hours", "extra_hours", "completionist_hours"))
    genre_hours.append({"genre": genre, "main_n": len(main), "main_p": quartiles(main),
                        "extra_n": len(extra), "extra_median": round(float(np.median(extra)), 2) if extra else None,
                        "completionist_n": len(completionist), "completionist_median": round(float(np.median(completionist)), 2) if completionist else None})
kw = kruskal(*[[g["main_hours"] for g in games if g["genre"] == item["genre"] and g["main_hours"] is not None and g["main_hours"] > 0] for item in genre_hours])

pairs = [g for g in games if g["main_hours"] is not None and g["main_hours"] > 0 and g["review_score"] is not None]
rho = spearmanr([g["main_hours"] for g in pairs], [g["review_score"] for g in pairs])
max_hours = float(np.percentile([g["main_hours"] for g in pairs], 99))
# A fixed-stride sample keeps the vector chart small and repeatable. Correlation uses ALL pairs.
points = [[round(g["main_hours"], 2), round(g["review_score"], 1)] for g in pairs[::max(1, len(pairs)//650)] if g["main_hours"] <= max_hours][:700]

matrix = []
for a in platforms:
    matrix.append([round(100 * len(platform_games[a] & platform_games[b]) / len(platform_games[a] | platform_games[b]), 1) for b in platforms])
off_diagonal = [(matrix[i][j], platforms[i], platforms[j]) for i in range(len(platforms)) for j in range(i + 1, len(platforms))]
highest = max(off_diagonal)

output = {
    "unique_games": len(games),
    "yearly_unique": [{"year": year, "count": years[year]} for year in range(2010, 2024)],
    "genre_order": genre_order + ["Other"], "platform_mix": mix,
    "genre_hours": genre_hours, "kruskal_main": {"h": round(float(kw.statistic), 2), "p": float(kw.pvalue)},
    "length_score": {"n": len(pairs), "rho": round(float(rho.statistic), 3), "p": float(rho.pvalue), "plot_max_hours": round(max_hours, 1), "points": points},
    "overlap": {"platforms": platforms, "matrix": matrix, "highest_pair": {"a": highest[1], "b": highest[2], "percent": highest[0]}},
}
(DATA / "advanced.json").write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("Wrote advanced.json:", len(games), "unique games;", len(pairs), "scored time pairs;")
print("Spearman rho:", output["length_score"]["rho"], "highest overlap:", output["overlap"]["highest_pair"])
