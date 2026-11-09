<!-- ... existing code ... -->
- Reszponzivitás: Mobilon 1 vagy 2 oszlopos grid, asztali gépen 4 oszlopos elrendezés. Nagy, kényelmes koppintási felületek mobilon.

```

## 4. Master Prompt for AI Agent (English, Design 1A: Retro VHS Cinema Ticket)

Copy and feed this entire prompt to your AI coding agent (Cursor, Claude, Windsurf, etc.):

```markdown
You are an expert full-stack frontend engineer. Build a production-ready, responsive, lightweight Progressive Web App (PWA) using React (Vite) + Tailwind CSS + Lucide Icons + Supabase JS Client for tracking movies and TV series between two partners.

### IMPORTANT NOTE ABOUT SECRETS & KEYS:
Do NOT prompt or block for actual secrets. Use clear placeholder configuration constants (or `import.meta.env` fallbacks) at the top of the codebase (e.g., `VITE_SUPABASE_URL = "YOUR_SUPABASE_URL_HERE"`, `VITE_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"`, `VITE_TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE"`, `VITE_APP_PIN = "1357"`). The user will manually provide and paste these credentials directly into the generated code / `.env.local` file after generation.

---

### LANGUAGE REQUIREMENT:
All user-facing UI labels, notifications, buttons, badges, placeholders, and error messages MUST be in Hungarian (HU).

---

### VISUAL DESIGN IDENTITY: 1A "RETRO VHS PERFORATED CINEMA TICKET (1989)"
The design must strictly follow the "Retro Cinema Ticket Stub" aesthetic:
1. **Typography & Atmosphere:**
   - Include and use the Google Font `'Space Mono', monospace` for all titles, timestamps, IDs, badges, and monospace details. Body can mix Space Mono with Inter for readability.
   - Dark, tactile video-store mood: Deep charcoal/zinc canvas (`#09090b` / `bg-zinc-950`), amber & warm gold glows (`#f59e0b`, `#fbbf24`, `border-amber-500/40`), neon yellow accents, and retro receipt accents.
2. **Ticket Stub Card Anatomy (Two-piece perforated ticket):**
   - Each movie item card must look like a two-piece physical perforated ticket (`border border-amber-500/30 bg-zinc-900 shadow-[4px_4px_0px_0px_#78350f]`):
     - **Left Section (The Tear-Off Counterfoil / Stub):**
       - Contains the poster thumbnail, media badge (`FILM` / `SOROZAT`), simulated seat number (`SEAT: A-XX`), and a stylized CSS/ASCII barcode strip (`||| | |||| || |||`).
       - Separated from the right section by a vertical dashed perforated divider line (`border-r border-dashed border-amber-500/40`).
     - **Right Section (The Ticket Body):**
       - Title, TMDB score tag (e.g. `★ 8.6`), Year, Téka ID (IMDb `tt...`).
       - Genre tag chips styled like stamped coupons (`bg-zinc-800 text-amber-200/90 border border-zinc-700 text-[9px] px-1.5 py-0.5`).
       - Expandable/collapsible synopsis.
       - Action footer with dashed border: Trailer button, "ÉRVÉNYESÍTVE" / "MEGNÉZTÜK" watch state toggle, and thumbs up/down rating buttons.
3. **Interactive Elements:**
   - Chunky, tactile 80s/90s arcade buttons with hard shadows (`shadow-[4px_4px_0px_0px_#000]` that shift down-right `active:translate-x-1 active:translate-y-1`).

---

### REQUIRED FEATURES & ARCHITECTURE:

#### 1. Zero-Backend Client-First Architecture
- Directly query Supabase via `@supabase/supabase-js`.
- Directly query TMDB API via fetch.
- On mount, fetch the entire `movies` table into React state. All filters, search, and local roulette spins run client-side in memory for instant 0ms latency.
- Subscribe to real-time table changes via Supabase channel (`postgres_changes` on `movies`) so updates sync immediately between both partners' phones.

#### 2. Simple PIN Lock Screen
- When first loaded, check `localStorage.getItem('app_authenticated')`.
- If false/missing, display a retro keypad lock screen requesting a 4-digit PIN.
- Compare with `VITE_APP_PIN`. On match, set local storage flag and grant access. No database queries should be triggered prior to unlocking.

#### 3. Adding via IMDb URL (TMDB Integration)
- Input field accepts an IMDb URL or ID (e.g., `https://www.imdb.com/title/tt0816692/` or `tt0816692`).
- Regex extract `tt\d+`.
- **Step 1:** Call TMDB Find endpoint:
  `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
- Determine if it's a `movie` (`movie_results[0]`) or `tv` series (`tv_results[0]`).
- **Step 2:** Call TMDB Details endpoint with videos and Hungarian language:
  `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=hu-HU&append_to_response=videos`
  *(Fallback to English `en-US` overview if the Hungarian translation is empty).*
- **Step 3 (Trailer logic):**
  - Check `videos.results` for a YouTube trailer (`site === 'YouTube' && type === 'Trailer'`).
  - If found: set URL to `https://www.youtube.com/watch?v=${trailer.key}`.
  - If not found: generate a YouTube search fallback: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + (type === 'tv' ? 'sorozat' : 'film') + ' előzetes')}`.
- Insert the record into the Supabase `movies` table (`imdb_id`, `tmdb_id`, `title`, `media_type`, `poster_path`, `overview`, `vote_average`, `genres`, `trailer_url`, `watched`, `liked`).

#### 4. Filter, Search & Status Controls
- Media Type toggle: **Mind (All)** | **Filmek (Movies)** | **Sorozatok (Series)**.
- Watchlist toggle: **Megnézendő (Watchlist)** | **Már láttuk (Watched)**.
- Genre selector: Dynamic filter pills extracted from the unique genres in the current list.
- Real-time text search bar filtering titles.
- Each movie card must allow:
  - Toggling watched status (`watched: boolean`).
  - Rating with 👍 (Tetszett) or 👎 (Nem tetszett) only available when `watched === true`. Tapping an active thumb deselects it (`liked: null`).
  - Direct link to open the trailer in a new tab.
  - Delete with quick confirmation.

#### 5. "Mit nézzünk ma?" (Ticket Roulette Wheel Modal)
- Clicking the prominent "Jegyhúzás / Sorsolás" button opens a ticket-themed modal.
- Provide two modes:
  1. **"Saját gyűjteményből" (From our watchlist):**
     - Filterable by type (Film / Sorozat) and Genre.
     - Randomly pick **3 unwatched items** (`watched === false`) from the filtered local list and present them side-by-side as perforated ticket stubs.
     - Include a re-spin button ("Újrapörgetés").
  2. **"Nyitott felfedezés" (Explore TMDB API):**
     - Queries TMDB discover endpoint: `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_API_KEY}&language=hu-HU&sort_by=popularity.desc&vote_count.gte=300&page=${randomPage}`.
     - Picks 3 random popular movies/series not currently in the user's database.
     - Offers a "➕ Hozzáadás a gyűjteményhez" button on each discovery card to directly save it to Supabase.

#### 6. PWA Readiness
- Provide an inline/standalone `manifest.json` definition with `display: standalone`, `theme_color: #09090b`, `background_color: #09090b`, and Hungarian app title "Kupon Mozi".

Provide the full, clean, runnable code with zero omissions, clear comments, and error boundaries.
```

## 5. Hogyan futtasd le a projektet 3 perc alatt?

Ha megnyitod a terminált a gépeden:

```bash
# 1. Új Vite React projekt létrehozása
npm create vite@latest mozi-app -- --template react

# 2. Belépés és függőségek telepítése
cd mozi-app
npm install @supabase/supabase-js lucide-react canvas-confetti clsx tailwindcss @tailwindcss/vite

# 3. Kód generáltatása
# Másold be a fenti angol nyelvű promptot a kódoló agentedbe (Cursor / ChatGPT / Claude).
# A kód legenerálása után csak töltsd ki a 4 változót a .env.local fájlban.

# 4. Helyi futtatás és tesztelés
npm run dev
```

Ha elégedett vagy az eredménnyel, töltsd fel GitHubra, kapcsold össze a Cloudflare Pages-szel, és mindkét telefonon nyissátok meg a kapott linket!