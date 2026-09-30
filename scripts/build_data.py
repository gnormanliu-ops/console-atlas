"""Rebuild the console-title dataset from PlayMyData (Zenodo 10797761)."""
from __future__ import annotations

import ast
import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlretrieve

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
DATA = ROOT / "data"
BASE = "https://zenodo.org/api/records/10797761/files/"
FILES = ["all_games_Nintendo.csv", "all_games_PlayStation.csv", "all_games_Xbox.csv", "platforms.csv", "genres.csv"]

# Hardware only: the prototype Nintendo PlayStation and VR headsets are excluded.
FAMILIES = {
    "Nintendo": {18, 19, 4, 21, 5, 41, 130, 33, 22, 24, 20, 159, 37, 137, 87, 416},
    "PlayStation": {7, 8, 9, 48, 167, 38, 46},
    "Xbox": {11, 12, 49, 169},
}
FAMILY_OF = {platform_id: family for family, ids in FAMILIES.items() for platform_id in ids}


def fetch():
    SOURCE.mkdir(exist_ok=True)
    for filename in FILES:
        if not (SOURCE / filename).exists():
            urlretrieve(f"{BASE}{filename}/content", SOURCE / filename)


def number(value):
    try:
        value = float(value)
        return round(value, 2) if pd.notna(value) else None
    except (ValueError, TypeError):
        return None


def main():
    fetch()
    DATA.mkdir(exist_ok=True)
    platforms = dict(pd.read_csv(SOURCE / "platforms.csv", header=None, names=["id", "name"]).itertuples(index=False, name=None))
    genres = dict(pd.read_csv(SOURCE / "genres.csv").itertuples(index=False, name=None))
    originals = [pd.read_csv(SOURCE / f"all_games_{family}.csv", low_memory=False) for family in FAMILIES]
    combined = pd.concat(originals, ignore_index=True)
    combined = combined.drop_duplicates(subset="id", keep="first")
    rows = []
    drops = Counter()
    for rec in combined.itertuples(index=False):
        try:
            when = datetime.fromtimestamp(int(rec.first_release_date), timezone.utc)
            platform_ids = sorted(set(ast.literal_eval(rec.platforms)) & FAMILY_OF.keys())
            genre_ids = ast.literal_eval(rec.genres)
        except (ValueError, TypeError, OverflowError, SyntaxError):
            drops["invalid_date_or_list"] += 1
            continue
        if not platform_ids:
            drops["no_selected_platform"] += 1
            continue
        if not (2010 <= when.year <= 2023):
            drops["outside_2010_2023"] += 1
            continue
        family_count = len({FAMILY_OF[p] for p in platform_ids})
        primary_genre = genres.get(genre_ids[0], "Unknown") if genre_ids else "Unknown"
        review_count = number(rec.review_count)
        review_score = number(rec.review_score) if review_count is not None and review_count > 0 else None
        main_hours = number(rec.main)
        main_hours = main_hours if main_hours is not None and main_hours > 0 else None
        for platform_id in platform_ids:
            rows.append({
                "game_id": int(rec.id), "title": str(rec.name), "year": when.year,
                "family": FAMILY_OF[platform_id], "platform": platforms[platform_id],
                "genre": primary_genre, "age_rating": str(rec.rating) if pd.notna(rec.rating) and str(rec.rating) != "Missing" else "Unknown",
                "family_count": family_count, "platform_count": len(platform_ids),
                "review_score": review_score, "main_hours": main_hours,
                "extra_hours": number(rec.extra), "completionist_hours": number(rec.completionist),
                "review_count": review_count, "people_polled": number(rec.people_polled),
            })
    assert len(rows) >= 50000 and len({r["platform"] for r in rows}) >= 10
    columns = list(rows[0])
    with (DATA / "console_games.csv").open("w", newline="", encoding="utf-8") as out:
        writer = csv.DictWriter(out, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    # Column-oriented names and array-oriented records reduce initial browser transfer.
    with (DATA / "console_games.json").open("w", encoding="utf-8") as out:
        json.dump({"columns": columns, "rows": [[r[c] for c in columns] for r in rows]}, out, ensure_ascii=False, separators=(",", ":"))

    df = pd.DataFrame(rows)
    by_family = df.groupby("family").size().to_dict()
    top_platform = df.platform.value_counts().head(10).to_dict()
    years = df.groupby("year").size().to_dict()
    unique = df.drop_duplicates("game_id")
    bins = [(2010, 2013), (2014, 2017), (2018, 2020), (2021, 2023)]
    era = []
    for start, end in bins:
        subset = unique[unique.year.between(start, end)]
        era.append({"label": f"{start}–{end}", "total": len(subset), "multi": int((subset.family_count > 1).sum()), "percent": round(100 * (subset.family_count > 1).mean(), 1)})
    genre_counts = df.genre.value_counts().head(8).to_dict()
    score = df.groupby("family").agg(mean=("review_score", "mean"), n=("review_score", "count"))
    hours = df[df.main_hours.gt(0)].groupby("family").agg(median=("main_hours", "median"), n=("main_hours", "count"))
    coverage = df.groupby("family").review_score.agg(["count", "size"])
    report = {
        "row_count": len(df), "unique_games": len(unique), "year_count": df.year.nunique(),
        "platform_count": df.platform.nunique(), "raw_rows": len(pd.concat(originals)),
        "deduplicated_games": len(combined), "drops": dict(drops),
        "years": {str(k): v for k, v in years.items()}, "families": by_family,
        "top_platforms": top_platform, "eras": era, "genres": genre_counts,
        "score": {f: {"mean": round(float(score.loc[f, "mean"]), 1), "n": int(score.loc[f, "n"])} for f in FAMILIES},
        "hours": {f: {"median": round(float(hours.loc[f, "median"]), 1), "n": int(hours.loc[f, "n"])} for f in FAMILIES},
        "coverage": {f: {"n": int(coverage.loc[f, "count"]), "total": int(coverage.loc[f, "size"]), "percent": round(100 * coverage.loc[f, "count"] / coverage.loc[f, "size"], 1)} for f in FAMILIES},
    }
    (DATA / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
