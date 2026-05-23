# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Korean shopping list web app (`index.html`) backed by Supabase. Single HTML file with inline CSS and vanilla JS — no build step, no bundler.

A secondary script (`make-ai-trends.js`) generates `AI-Trends-2025.pptx` using pptxgenjs and is unrelated to the app.

## Running the App

Open `index.html` directly in a browser. It loads the Supabase JS client from CDN and connects to the live Supabase project.

## Architecture

**`index.html`** is the entire app:
- Supabase client initialized via CDN (`@supabase/supabase-js@2`)
- In-memory `items` array acts as local state, kept in sync with the DB after each operation
- All CRUD operations hit Supabase directly: `shopping_items` table (`id`, `name`, `checked`, `created_at`)
- `render()` rebuilds the entire list DOM from the `items` array on every state change

**Supabase table schema:**
```sql
shopping_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  checked     boolean not null default false,
  created_at  timestamptz default now()
)
```

The Supabase URL and anon key are hardcoded in `index.html`.
