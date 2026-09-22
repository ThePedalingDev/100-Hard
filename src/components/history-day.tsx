import { Plate, StatusMark } from "@/components/plate";
import { completedCategories, isWorkoutComplete, missedCategories } from "@/lib/scoring";
import type { DailyCheckin } from "@/lib/supabase/types";

export function HistoryDay({ checkin }: { checkin: DailyCheckin }) {
  const complete = completedCategories(checkin);
  const status = checkin.finalized_at ? checkin.status : "pending";
  const workoutDone = isWorkoutComplete(checkin);
  const missed = missedCategories(checkin);

  return (
    <Plate as="article">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="stamp text-[11px] text-steel">Inspection</p>
          <p className="mt-1 text-[18px] leading-none">{complete} / 4 complete</p>
        </div>
        <StatusMark status={status} />
      </header>

      <div className="divide-y divide-steel/20">
        <Metric
          label="Diet"
          done={checkin.diet_complete}
          finalized={Boolean(checkin.finalized_at)}
          note={checkin.diet_note}
        />
        <div className="py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="stamp text-[11px] text-steel">Workout</p>
            <StatusMark status={workoutDone ? "complete" : checkin.finalized_at ? "incomplete" : "pending"} />
          </div>
          <ul className="space-y-1 text-sm leading-6">
            <StampLine label="Workout 1 — 45 min" done={checkin.workout_1_complete} finalized={Boolean(checkin.finalized_at)} />
            <StampLine label="Workout 2 — 45 min" done={checkin.workout_2_complete} finalized={Boolean(checkin.finalized_at)} />
            <StampLine label="At least one outdoors" done={checkin.outdoor_complete} finalized={Boolean(checkin.finalized_at)} />
          </ul>
          {checkin.workout_note ? <p className="mt-2 text-sm leading-6">{checkin.workout_note}</p> : null}
        </div>
        <Metric
          label="Water — 3.8 L"
          done={checkin.water_complete}
          finalized={Boolean(checkin.finalized_at)}
          note={checkin.water_note}
        />
        <Metric
          label="Bible — 10 pages"
          done={checkin.bible_complete}
          finalized={Boolean(checkin.finalized_at)}
          note={checkin.bible_note}
          extra={checkin.bible_reference}
        />
      </div>

      {checkin.day_note ? (
        <section className="mt-5 border-t border-steel/20 pt-4">
          <p className="stamp text-[11px] text-steel">Day note</p>
          <p className="mt-2 text-sm leading-6">{checkin.day_note}</p>
        </section>
      ) : null}

      {status === "failed" || checkin.failure_reason ? (
        <section className="mt-5 border-t border-steel/20 pt-4">
          <p className="stamp text-[11px] text-brass">Wooden spoon</p>
          {status === "failed" && missed.length ? (
            <p className="mt-2 text-sm leading-6 text-steel">Missed: {missed.join(", ")}</p>
          ) : null}
          {checkin.failure_reason ? (
            <p className="mt-2 text-sm leading-6">{checkin.failure_reason}</p>
          ) : null}
        </section>
      ) : null}
    </Plate>
  );
}

function Metric({
  label,
  done,
  finalized,
  note,
  extra,
}: {
  label: string;
  done: boolean;
  finalized: boolean;
  note?: string | null;
  extra?: string | null;
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="stamp text-[11px] text-steel">{label}</p>
        <StatusMark status={done ? "complete" : finalized ? "incomplete" : "pending"} />
      </div>
      {extra ? <p className="mt-2 text-sm leading-6 text-steel">{extra}</p> : null}
      {note ? <p className="mt-2 text-sm leading-6">{note}</p> : null}
    </div>
  );
}

function StampLine({
  label,
  done,
  finalized,
}: {
  label: string;
  done: boolean;
  finalized: boolean;
}) {
  const mark = done ? "✓" : finalized ? "✕" : "○";
  const word = done ? "Done" : finalized ? "Missed" : "Pending";
  const tone = done ? "text-success" : finalized ? "text-failure" : "text-steel";
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={tone}>
        <span aria-hidden="true">{mark}</span>
        <span className="sr-only">{word}</span>
      </span>
    </li>
  );
}