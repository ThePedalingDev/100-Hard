# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Backend is the existing empty Supabase project `100-Hard` (`lmppiwbccbzrzlelsllo`, region `eu-west-1`): Auth, Postgres, Storage, Realtime, RLS, database functions, and scheduled jobs. No standalone Express API. Client access via Next.js Server Actions, Route Handlers, Supabase RPC, and PostgreSQL functions. Schema changes require explicit owner approval before they are applied.

## Users

A person may join many private invite-only challenges. Each challenge has at most 12 members. Each authenticates with email and password, sets a display name, profile picture, and personal diet commitment, then checks in daily against four scored commitments. There are no public profiles, public leaderboards, or public feeds. Home, Calendar, Photos, Social, and Spoons always read the user's active challenge.

## Product Purpose

100 Hard is a private group fitness accountability challenge. Start and end dates are chosen when the challenge is created (start today or later in `Africa/Johannesburg`, end after start). Each participant must, every day: follow their own diet commitment; complete two workouts of at least 45 minutes with at least one outdoors; drink at least 3.8 L of water; and complete at least 10 pages of Bible reading.

A day is `pending` while it is still the active calendar day, `perfect` when all four scored categories are complete, or `failed` when the day closes with any requirement incomplete. A failed day issues exactly one wooden spoon, regardless of how many items were missed. Success is the group finishing the challenge having tracked honestly, seen each other's progress, and settled outstanding spoons.

## Positioning

This is a closed invite-only race and consequence ledger, not a habit tracker. The mechanism that a generic tracker cannot copy is the combination of: honour-system daily commitments with member-visible notes; a perfect-day leaderboard; a wooden-spoon penalty of one per failed day with a post-challenge repayment flow any member can request of a debtor; a per-challenge chat room; and realtime likes/comments as acknowledgement, never as score.

## Operating Context

Primary use is mobile-first, typically a quick daily check-in on a phone, plus review of other members' cards. Timezone and day close are fixed: `Africa/Johannesburg`, 23:59:59 SAST, no grace period. After midnight, scored fields lock; `failure_reason` may still be edited by the day owner. Historical days are a shared journal (calendar + day detail), not a spreadsheet. After the challenge end date the product becomes a group summary and spoon-repayment board. Source of truth for behaviour is `two-person-fitness-accountability-prd-mvp.md` plus the 2026-09-22 group-challenges spec.

## Capabilities and Constraints

Confirmed for MVP:

- Auth: email + password, login, logout, password reset. Magic-link is optional if simple. No custom auth.
- Many private challenges per user: name, choosable start/end (`Africa/Johannesburg`), invite code/link, hard cap of 12 members. Active challenge is selected from Profile.
- Profile: display name, avatar, personal diet commitment, roster of challenges and members, Create challenge and Join with a code.
- Daily tracking: diet, workout (two 45-minute sessions + outdoor), water (3.8 L), Bible (10 pages + free-text reference). Optional notes on every requirement, optional day note (max 500 characters), optional `failure_reason`.
- Scoring: four top-level categories; workout counts only when both sessions and outdoor are complete. Notes never affect score. Race position is perfect days only on a group leaderboard.
- Wooden spoons: one earned spoon per failed user/day, ledger-derived balance, member-visible missed items and optional reason. Explanation is not exemption. Repayment exists only after the challenge ends (`requested → accepted → completed → confirmed`). Any member may request repayment from another member who owes spoons.
- Social: one like per user per other member's daily card; comments on other members' cards; one chat room per active challenge (1–500 characters, no edit/delete/DMs/attachments); realtime on check-ins, likes, comments, spoons, repayments, chat.
- Progress photos: optional, private, roughly one official photo per participant per calendar month, signed URLs, not scored.
- Navigation: Home, Calendar, Photos, Social, Spoons, Profile (bottom nav on mobile).
- Privacy: RLS mandatory; private storage; no public URLs for photos.

Explicitly out of MVP: public challenges, groups larger than 12, wearable/health integrations, calorie or meal logging, workout validation, AI coaching, badges, arbitrary habit systems, payments, Bible APIs or reference parsing.

Open: magic-link login only if it stays simple; whether reminders exist is post-MVP.

## Brand Commitments

Product name: **100 Hard**.

Binding from the owner PRD: the product must feel like a premium gym / performance journal / training locker room. It must not feel like crypto, gaming, AI SaaS, futuristic neon, or a generic habit tracker. Formal UI constraints: no gradients, no neon, no glow, no glassmorphism, no excessive rounded containers, semantic colour only, strong typography and spacing hierarchy, restrained interactions. One light theme only, designed for daylight locker-room and kitchen check-ins; there is no dark mode. Plate materials stay industrial (paper/iron/steel). Colour overlay is South African Planet Fitness club brand: navy `#002040` as ink and structure, orange `#FF6B00` as proof/CTA, yellow `#FFB600` as hover/signal. Club purple is not in the system. Impeccable is a formal implementation requirement; `PRODUCT.md` and `DESIGN.md` must exist in the repo.

## Evidence on Hand

- Product specification: `two-person-fitness-accountability-prd-mvp.md` (v1.0).
- Backend: empty healthy Supabase project `100-Hard` (`lmppiwbccbzrzlelsllo`).
- No real participant photos, logos, or testimonials exist. Do not fabricate social proof, third-party endorsements, or public results. Demonstration check-in data for UI development must be labelled synthetic.

## Product Principles

1. Honour-system tracking with member visibility beats verification theatre.
2. Score only what the rules score: four daily categories, perfect days, one spoon per failed day.
3. History is a locked journal; explanation never rewrites the ledger.
4. Invite-only, private, mobile-first — nothing in the product should imply a public brand.
5. Consequence is part of the product: spoons are visible, repayable after the finish line, and never decorative.

## Accessibility & Inclusion

Minimum target WCAG AA: keyboard navigation, visible focus, semantic controls, associated labels, sufficient contrast, readable form feedback. Status is never colour-only; use Perfect / Failed / Pending marks (`✓` / `✕` / `○`) with colour as reinforcement.
