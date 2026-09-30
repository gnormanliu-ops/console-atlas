# Console Atlas: Nintendo, PlayStation, and Xbox

A two-page static data website for the Financial Data Analytics Data Website Project.

**Project author:** Zexi Norman Liu. The dataset choice, analytical questions, findings, and design direction are the author's. **Development assistance:** OpenAI Codex. The author is responsible for reviewing the published site, its data, and the repository contents.

## Source and attribution

Data: Andrea D'Angelo, Claudio Di Sipio, Cristiano Politowsky, and Riccardo Rubei, **PlayMyData v2** (2024), [Zenodo DOI 10.5281/zenodo.10797761](https://doi.org/10.5281/zenodo.10797761), **CC BY 4.0**. The underlying metadata was collected from IGDB; playtime and user review fields were added from HowLongToBeat. The derived data here is adapted from that release. Changes: merge and deduplicate three platform-family source files, parse ID lists, select console hardware, remove invalid dates, expand each game to its selected platforms, assign a primary genre, and treat review scores with zero reviews and nonpositive main-story estimates as missing. No original game summaries from the dataset are redistributed.

The source files can be downloaded by the rebuild script. The included derived CSV and JSON are enough to run both pages locally.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Report with eight findings, source notes, and charts. |
| `dashboard.html` | Filterable in-browser dashboard with four charts and an underlying-numbers table. |
| `styles.css` | Shared responsive design for both pages. |
| `site.js` | Report rendering, browser-side filtering, calculations, and charts. |
| `assets/covers/*.jpg`, `extra-*.js` | Local decorative game cover images used in the moving backdrop. |
| `assets/logos/*.svg` | Original Console Atlas compass mark and local console brand marks. |
| `assets/hardware/*` | Local product photographs for the expandable hardware cards. |
| `data/console_games.csv` | Cleaned analysis table, 51,583 rows and 15 columns. |
| `data/console_games.json` | The same rows in compact browser-friendly format. |
| `data/report.json` | Reproducible summary values for report charts and text. |
| `data/advanced.json`, `scripts/build_advanced.py` | Deeper descriptive analyses and their reproducible builder. |
| `scripts/build_extra_covers.py` | Fetches and compresses 18 additional Steam Library covers into three local image bundles (requires Pillow). |
| `scripts/build_data.py` | Downloads public source files and rebuilds all data and summaries. |
| `start-website.bat` | Starts a local web server on Windows with Python 3. |

**Artwork file list:**

| File | Displayed item |
| --- | --- |
| `assets/logos/nintendo-switch.svg` | Nintendo Switch mark in the Nintendo card. |
| `assets/logos/playstation.svg` | PlayStation mark in the PlayStation card. |
| `assets/logos/xbox.svg` | Xbox mark in the Xbox card. |
| `assets/logos/console-atlas.svg` | Original C-shaped compass logo in both navigation bars. |
| `assets/hardware/switch-2.jpg` | Nintendo Switch 2 product photo. |
| `assets/hardware/ps5-pro.jpg` | PlayStation 5 Pro product photo. |
| `assets/hardware/xbox-series-x.png` | Xbox Series X product photo. |
| `assets/covers/1145360.jpg` | Hades cover. |
| `assets/covers/413150.jpg` | Stardew Valley cover. |
| `assets/covers/367520.jpg` | Hollow Knight cover. |
| `assets/covers/504230.jpg` | Celeste cover. |
| `assets/covers/1091500.jpg` | Cyberpunk 2077 cover. |
| `assets/covers/1245620.jpg` | Elden Ring cover. |
| `assets/covers/268910.jpg` | Cuphead cover. |
| `assets/covers/588650.jpg` | Dead Cells cover. |
| `assets/covers/292030.jpg` | The Witcher 3: Wild Hunt cover. |
| `assets/covers/275850.jpg` | No Man's Sky cover. |
| `assets/covers/1057090.jpg` | Ori and the Will of the Wisps cover. |
| `assets/covers/646570.jpg` | Slay the Spire cover. |
| `assets/covers/105600.jpg` | Terraria cover. |
| `assets/covers/620.jpg` | Portal 2 cover. |
| `assets/covers/1426210.jpg` | It Takes Two cover. |
| `assets/covers/1868140.jpg` | Dave the Diver cover. |
| `assets/covers/782330.jpg` | Doom Eternal cover. |
| `assets/covers/1794680.jpg` | Vampire Survivors cover. |
| `assets/covers/extra-1.js` | Compressed Steam Library covers: Baldur's Gate 3, Red Dead Redemption 2, Sekiro: Shadows Die Twice, Control, Subnautica, Outer Wilds. |
| `assets/covers/extra-2.js` | Compressed Steam Library covers: A Short Hike, Undertale, Death Stranding, Monster Hunter: World, Persona 5 Royal, Stray. |
| `assets/covers/extra-3.js` | Compressed Steam Library covers: Ori and the Blind Forest, Resident Evil 4, Hogwarts Legacy, Horizon Zero Dawn, God of War, Spiritfarer. |

The main navigation links **Report** and **Dashboard** at the top of both pages. The dashboard's Platform menu updates when the game-first-release year or console family changes and clears an incompatible platform selection. With a year selected, the menu and filtered results also exclude consoles that launched after that year. The dashboard gives selection-specific readings of catalog duplication, leading platforms and genres, and review and playtime coverage, plus a family-by-family coverage breakdown with its denominators. Chart panels with fewer bars shrink to their content and stack independently in each column. The report includes expandable hardware previews for Nintendo Switch 2, PlayStation 5 Pro, and Xbox Series X, with links to the manufacturers' official product pages. These hardware previews are decorative and are not observations in the 2010–2023 analysis. The moving backdrop uses local copies of Steam Library cover artwork for 36 games in the cleaned dataset, six distinct titles per moving column; the respective game publishers own their artwork. The new C-shaped compass logo is original SVG artwork for this site. The photos come from official [Nintendo](https://www.nintendo.com/us/store/products/nintendo-switch-2-system-123669/), [PlayStation](https://www.playstation.com/en-us/ps5/ps5-pro/), and [Xbox](https://www.xbox.com/en-us/consoles/xbox-series-x) product pages. Nintendo Switch and PlayStation symbols are sourced from [Simple Icons v13](https://github.com/simple-icons/simple-icons); Xbox's symbol is from [Font Awesome Free Brands](https://fontawesome.com/icons/xbox?f=brands&s=solid). All decorative images are packaged locally, so they appear without a separate image-host connection. The browser still needs a local HTTP server to load the analysis JSON.

## Data model and limitations

The Report's **Five deeper questions** section is generated from `data/advanced.json` by `python scripts/build_advanced.py` using the packaged cleaned catalog. It shows yearly counts of distinct game IDs; primary-genre proportions for eight large platforms; main-story box distributions and medians for main, main + extra, and completionist estimates; game-level Spearman correlation between main-story time and HowLongToBeat user review score; and a Jaccard overlap matrix for the same eight platforms. Genre time groups use one game ID once, positive estimates only; the Kruskal–Wallis test compares eight main-story distributions. Scatter dots are a fixed subset and visually clip hours above the 99th percentile, while correlation uses all matched games. These are descriptive associations, not causal claims. The cleaned file keeps only the first listed genre and has no summary or storyline text, so text-based multi-label prediction cannot be evaluated here. The raw `rating` field is an age rating; score analysis uses `review_score` instead.

One row is one IGDB game ID on one selected console. `year` is the **game's first release year anywhere**, not that platform's individual launch year. The group column `platform` has 26 values; 14 years appear from 2010 to 2023. `family`, `platform`, `genre`, and `age_rating` are categorical; `review_score`, `main_hours`, `extra_hours`, `completionist_hours`, `review_count`, `people_polled`, `family_count`, and `platform_count` are numeric. There are 26,280 distinct game IDs.

Across the three source files there are 60,584 rows. After deduplicating on game ID, 41,616 remain. A further 4,971 have unusable date or ID lists; 367 do not map to the 26 selected hardware platforms; 9,998 were first released before 2010. Expanding the 26,280 remaining titles yields 51,583 game–platform entries. The specific excluded hardware is the Nintendo PlayStation prototype and separate VR headsets. The primary genre is the first listed IGDB genre; it does not claim that other genres are absent.

These are catalog records, not hardware shipments, game unit sales, or complete yearly release totals. A multiplatform game is repeated on each of its selected platforms. Score and playtime are game-level data repeated across these rows, **not platform-specific assessments**. This is a retrospective covering games first released in 2010–2023; the source ends in November 2023 and says nothing about 2024–2026 releases. Historical and regional coverage can vary.

**Dashboard year filter:** The source date is a game's first release anywhere, so a game first released in 2010 may appear in the catalog on PS5 after a later port. When a specific year is selected, the dashboard excludes rows for hardware launched after that year. Its platform menu, charts, KPIs, and table all use this same restriction. The unfiltered report summaries continue to describe the full catalog. Because the source has no per-platform game release date, the dashboard cannot establish when a selected game became available on a specific platform. The cutoff uses earliest launch years documented by [Nintendo](https://www.nintendo.co.jp/corporate/en/history/index.html), [PlayStation](https://www.playstation.com/en-us/playstation-history/2020-ps5-ps-vr2/), and [Xbox](https://news.xbox.com/en-us/2020/11/10/power-your-dreams-xbox-series-x-and-xbox-series-s-available-now/).

## Calculations

- **Entries:** number of game–platform rows in the current selection.
- **Distinct games:** number of distinct `game_id` values in the selection.
- **Average review score:** arithmetic mean of nonmissing `review_score`, on a 0–100 scale, only if `review_count > 0`. The denominator `reviewed n` is included alongside the score.
- **Median main hours:** median of positive `main_hours` values. The denominator `hours n` is included alongside it.
- **Cross-family share:** number of distinct game IDs with `family_count > 1` divided by all distinct IDs in the cohort. `family_count` is calculated from the full cleaned catalog, so it remains the original full-catalog classification even when dashboard filters exclude a family.
- **Review coverage:** entries with a positive `review_count` divided by all entries in the relevant family, multiplied by 100.
- **Genre counts:** each game–platform row is assigned to its first listed genre. The chart ranks these mutually exclusive labels.

The report's static numbers come from `data/report.json`, generated from the very same cleaned rows loaded by the dashboard. A family's aggregate score is **entry weighted**: games listed on two consoles within that family contribute twice. Charts and the table in the dashboard recalculate on the filtered rows in the browser.

## Rebuild and run

To view the included data, no build step or pandas is needed. On Windows with Python 3 installed, double-click `start-website.bat`, leave its command window open, and visit `http://localhost:8000/` and `http://localhost:8000/dashboard.html`. Alternatively, from this folder run `py -m http.server 8000` (or `python -m http.server 8000`). Browser `fetch` requires an HTTP server; opening the HTML with a `file://` URL will not load the data.

If Python is not installed, open this folder in VS Code, install the **Live Server** extension (Ritwick Dey), and right-click `index.html` → **Open with Live Server**. Use the top **Dashboard** link to reach the second page.

To regenerate the data from the original public source, install pandas and run `python scripts/build_data.py`; this requires an internet connection.

## Publish with GitHub Pages

When you are ready, create a public repository from this folder and commit its files under your GitHub account. Then in GitHub **Settings → Pages**, select **Deploy from a branch → main → / (root)**. The site URL will be `https://USERNAME.github.io/REPOSITORY/`. Both pages use relative paths and work from a repository subpath.

Course submission is a four-line `.txt` or `.md` file with the student's name, student ID, repository URL, and live Pages URL. Fill in the ID and URLs only after publishing; no student ID is included in this public repository.
