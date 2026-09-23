"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { SpoonIcon } from "@/components/icons";
import { formatStampDate } from "@/lib/challenge";
import { challengeDayNumber } from "@/lib/challenge-dates";
import type { MemberView } from "@/lib/data";

type StatKind = "perfect" | "completion" | "streak" | "longest" | "spoons";

export function MemberStatsGrid({
  stats,
  challengeStart,
  mine,
}: {
  stats: MemberView["stats"];
  challengeStart: string;
  mine: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<StatKind | null>(null);

  function open(kind: StatKind) {
    setActive(kind);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setActive(null);
  }

  return (
    <>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-steel/20 pt-5">
        <StatButton
          label="Perfect days"
          value={stats.perfectDays}
          accent="success"
          onClick={() => open("perfect")}
        />
        <StatButton
          label="Completion"
          value={`${stats.completion}%`}
          onClick={() => open("completion")}
        />
        <StatButton label="Current streak" value={stats.streak} onClick={() => open("streak")} />
        <StatButton label="Longest streak" value={stats.longest} onClick={() => open("longest")} />
        <StatButton
          label="Spoons"
          value={stats.spoons}
          icon
          onClick={() => open("spoons")}
        />
      </dl>

      <dialog ref={dialogRef} className="perfect-days-dialog" onClose={() => setActive(null)}>
        {active ? (
          <StatBreakdownPanel
            kind={active}
            stats={stats}
            challengeStart={challengeStart}
            mine={mine}
            onClose={close}
          />
        ) : null}
      </dialog>
    </>
  );
}

function StatButton({
  label,
  value,
  accent,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  accent?: "success";
  icon?: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <dt className="stamp text-[11px] text-steel">{label}</dt>
      <dd className="mt-2">
        <button
          type="button"
          onClick={onClick}
          className="stamp-press group flex min-h-11 w-full items-center gap-1 rounded-plate text-left transition-colors hover:bg-graphite/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-proof"
          aria-haspopup="dialog"
        >
          <span
            className={`stamp flex items-center gap-1 text-[32px] leading-none tabular ${
              accent === "success" ? "text-success" : icon ? "text-mark" : ""
            }`}
          >
            {icon ? <SpoonIcon className="size-5" /> : null}
            {value}
          </span>
          <ChevronRight
            className="size-4 translate-y-px text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-offwhite"
            aria-hidden
          />
        </button>
      </dd>
    </div>
  );
}

function StatBreakdownPanel({
  kind,
  stats,
  challengeStart,
  mine,
  onClose,
}: {
  kind: StatKind;
  stats: MemberView["stats"];
  challengeStart: string;
  mine: boolean;
  onClose: () => void;
}) {
  const title = titleFor(kind);
  const summary = summaryFor(kind, stats);

  return (
    <div className="perfect-days-panel">
      <header className="flex items-start justify-between gap-3 border-b border-steel/25 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-[18px] leading-none">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-steel">{summary}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="stamp-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-plate border border-steel/40 px-3 text-[13px] font-bold text-steel hover:border-club hover:text-offwhite"
        >
          Close
        </button>
      </header>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {kind === "perfect" ? (
          <DateList dates={stats.perfectDayDates} challengeStart={challengeStart} tone="success" empty="No perfect days yet." />
        ) : null}
        {kind === "completion" ? (
          <dl className="space-y-3 text-sm leading-6">
            <div className="flex items-center justify-between gap-3 rounded-plate border border-steel/25 bg-well px-3 py-3">
              <dt className="stamp text-[11px] text-steel">Category stamps</dt>
              <dd className="tabular font-semibold">
                {stats.stampsCompleted} / {stats.stampsPossible}
              </dd>
            </div>
            <p className="text-steel">
              Each challenge day has four scored categories: diet, workout, water, and bible. Completion is the share
              of those stamps you have logged so far.
            </p>
          </dl>
        ) : null}
        {kind === "streak" ? (
          <>
            <DateList
              dates={stats.streakDates}
              challengeStart={challengeStart}
              tone="neutral"
              empty="No active streak. Chain perfect days to build one."
            />
            {stats.streakDates.length > 0 ? (
              <p className="mt-4 text-sm leading-6 text-steel">
                Counts consecutive perfect days through yesterday when today is still open.
              </p>
            ) : null}
          </>
        ) : null}
        {kind === "longest" ? (
          <DateList
            dates={stats.longestStreakDates}
            challengeStart={challengeStart}
            tone="neutral"
            empty="No streak recorded yet."
          />
        ) : null}
        {kind === "spoons" ? (
          <div className="space-y-4">
            <p className="stamp inline-flex items-center gap-2 text-[32px] leading-none tabular text-mark">
              <SpoonIcon className="size-5" />
              {stats.spoons}
            </p>
            <p className="text-sm leading-6 text-steel">
              Wooden spoons mark missed days in this challenge. Repay them from the spoon ledger when you make good.
            </p>
            {mine ? (
              <Link
                href="/spoons"
                onClick={onClose}
                className="stamp-press inline-flex min-h-12 items-center rounded-plate bg-brass px-4 text-[15px] font-bold tracking-[-0.01em] text-onproof"
              >
                Open spoon ledger
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DateList({
  dates,
  challengeStart,
  tone,
  empty,
}: {
  dates: string[];
  challengeStart: string;
  tone: "success" | "neutral";
  empty: string;
}) {
  if (dates.length === 0) {
    return <p className="text-sm leading-6 text-steel">{empty}</p>;
  }

  return (
    <ol className="divide-y divide-steel/20">
      {dates.map((date) => {
        const dayNumber = challengeDayNumber(date, challengeStart);
        return (
          <li key={date}>
            <Link
              href={`/profile/history?date=${date}`}
              className="stamp-press flex min-h-11 items-center gap-3 rounded-plate py-3 hover:bg-graphite/50"
            >
              <span
                className={`stamp grid size-10 shrink-0 place-items-center rounded-plate border text-[11px] font-bold tabular ${
                  tone === "success"
                    ? "border-success/35 bg-success/10 text-success"
                    : "border-steel/35 bg-graphite text-steel"
                }`}
              >
                {dayNumber}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-none tracking-[-0.03em]">
                  Day {dayNumber}
                </span>
                <span className="mt-1 block text-sm text-steel">{formatStampDate(date)}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-steel" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function titleFor(kind: StatKind) {
  if (kind === "perfect") return "Perfect days";
  if (kind === "completion") return "Completion";
  if (kind === "streak") return "Current streak";
  if (kind === "longest") return "Longest streak";
  return "Spoons";
}

function summaryFor(kind: StatKind, stats: MemberView["stats"]) {
  if (kind === "perfect") {
    return stats.perfectDays === 0
      ? "Stamp every requirement on a day to land here."
      : `${stats.perfectDays} day${stats.perfectDays === 1 ? "" : "s"} with a full inspection.`;
  }
  if (kind === "completion") return `${stats.completion}% of all category stamps logged in this challenge.`;
  if (kind === "streak") {
    return stats.streak === 0
      ? "No consecutive perfect days right now."
      : `${stats.streak} perfect day${stats.streak === 1 ? "" : "s"} in a row.`;
  }
  if (kind === "longest") {
    return stats.longest === 0
      ? "Your best run of perfect days will show here."
      : `Best run: ${stats.longest} perfect day${stats.longest === 1 ? "" : "s"}.`;
  }
  return stats.spoons === 0
    ? "No spoons outstanding in this challenge."
    : `${stats.spoons} spoon${stats.spoons === 1 ? "" : "s"} still owed.`;
}
