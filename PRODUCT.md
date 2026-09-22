# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Backend is the existing empty Supabase project `100-Hard` (`lmppiwbccbzrzlelsllo`, region `eu-west-1`): Auth, Postgres, Storage, Realtime, RLS, database functions, and scheduled jobs. No standalone Express API. Client access via Next.js Server Actions, Route Handlers, Supabase RPC, and PostgreSQL functions. Schema changes require explicit owner approval before they are applied.

## Users

Exactly two participants in one private challenge. Each authenticates with email and password, sets a display name, profile picture, and personal diet commitment, then checks in daily against four scored commitments. A third person cannot join. There are no public profiles, public leaderboards, or public feeds.

## Product Purpose

100 Hard is a private two-person fitness accountability challenge that runs from 22 September 2026 to 31 December 2026 in `Africa/Johannesburg`. Each participant must, every day: follow their own diet commitment; complete two workouts of at least 45 minutes with at least one outdoors; drink at least 3.8 L of water; and complete at least 10 pages of Bible reading.

A day is `pending` while it is still the active calendar day, `perfect` when all four scored categories are complete, or `failed` when the day closes with any requirement incomplete. A failed day issues exactly one wooden spoon, regardless of how many items were missed. Success is both people finishing the challenge having tracked honestly, seen each other's progress, and settled outstanding spoons.

## Positioning

This is a closed two-person race and consequence ledger, not a habit tracker. The mechanism that a generic tracker cannot copy is the combination of: honour-system daily commitments with partner-visible notes; a head-to-head race driven only by perfect-day count; a wooden-spoon penalty of one per failed day with a post-challenge repayment flow the partner defines; and realtime likes/comments as acknowledgement, never as score.

## Operating Context

Primary use is mobile-first, typically a quick daily check-in on a phone, plus partner review of the other person's card. Timezone and day close are fixed: `Africa/Johannesburg`, 23:59:59 SAST, no grace period. After midnight, scored fields lock; `failure_reason` may still be edited by the day owner. Historical days are a shared journal (calendar + day detail), not a spreadsheet. After 31 December the product becomes a side-by-side summary and spoon-repayment board. Source of truth for behaviour is `two-person-fitness-accountability-prd-mvp.md`.

## Capabilities and Constraints

Confirmed for MVP:

- Auth: email + password, login, logout, password reset. Magic-link is optional if simple. No custom auth.
- One challenge: name, start `2026-09-22`, end `2026-12-31`, timezone `Africa/Johannesburg`, invite code/link, hard cap of two members.
- Profile: display name, avatar, personal diet commitment.
- Daily tracking: diet, workout (two 45-minute sessions + outdoor), water (3.8 L), Bible (10 pages + free-text reference). Optional notes on every requirement, optional day note (max 500 characters), optional `failure_reason`.
- Scoring: four top-level categories; workout counts only when both sessions and outdoor are complete. Notes never affect score. Race position is perfect days only.
- Wooden spoons: one earned spoon per failed user/day, ledger-derived balance, partner-visible missed items and optional reason. Explanation is not exemption. Repayment exists only after the challenge ends (`requested → accepted → completed → confirmed`).
- Social: one like per user per partner daily card; comments on partner cards; realtime on check-ins, likes, comments, spoons, repayments.
- Progress photos: optional, private, roughly one official photo per participant per calendar month, signed URLs, not scored.
- Navigation: Dashboard, Calendar, Photos, Spoons, Profile (bottom nav on mobile).
- Privacy: RLS mandatory; private storage; no public URLs for photos.

Explicitly out of MVP: public challenges, groups larger than two, wearable/health integrations, calorie or meal logging, workout validation, chat, AI coaching, badges, arbitrary habit systems, payments, Bible APIs or reference parsing.

Open: magic-link login only if it stays simple; whether reminders exist is post-MVP.

## Brand Commitments

Product name: **100 Hard**.

Binding from the owner PRD: the product must feel like a premium gym / performance journal / training locker room. It must not feel like crypto, gaming, AI SaaS, futuristic neon, or a generic habit tracker. Formal UI constraints: no gradients, no neon, no glow, no glassmorphism, no excessive rounded containers, semantic colour only, strong typography and spacing hierarchy, restrained interactions. Suggested materials/palette in the PRD (graphite, iron, warm off-white, steel grey, success green, failure red, spoon brass) are binding direction, not optional mood. Impeccable is a formal implementation requirement; `PRODUCT.md` and `DESIGN.md` must exist in the repo.

## Evidence on Hand

- Product specification: `two-person-fitness-accountability-prd-mvp.md` (v1.0).
- Backend: empty healthy Supabase project `100-Hard` (`lmppiwbccbzrzlelsllo`).
- No real participant photos, logos, or testimonials exist. Do not fabricate social proof, third-party endorsements, or public results. Demonstration check-in data for UI development must be labelled synthetic.

## Product Principles

1. Honour-system tracking with partner visibility beats verification theatre.
2. Score only what the rules score: four daily categories, perfect days, one spoon per failed day.
3. History is a locked journal; explanation never rewrites the ledger.
4. Two people, private, mobile-first — nothing in the product should imply a crowd or a public brand.
5. Consequence is part of the product: spoons are visible, repayable after the finish line, and never decorative.

## Accessibility & Inclusion

Minimum target WCAG AA: keyboard navigation, visible focus, semantic controls, associated labels, sufficient contrast, readable form feedback. Status is never colour-only; use Perfect / Failed / Pending marks (`✓` / `✕` / `○`) with colour as reinforcement.
