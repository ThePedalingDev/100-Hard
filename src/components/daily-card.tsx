"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { toggleCheckAction, saveNoteAction } from "@/lib/actions/checkin";
import { addCommentAction, toggleLikeAction } from "@/lib/actions/social";
import { CategoryStamp, type StampKind } from "@/components/art";
import { CommentIcon, HeartIcon } from "@/components/icons";
import { StampLoader } from "@/components/loader";
import { Button, ErrorBanner, StatusMark, TextArea } from "@/components/plate";
import { completedCategories, isWorkoutComplete, missedCategories } from "@/lib/scoring";
import type { DailyCheckin, DailyComment, Profile } from "@/lib/supabase/types";

type CheckKey =
  | "diet_complete"
  | "workout_1_complete"
  | "workout_2_complete"
  | "outdoor_complete"
  | "water_complete"
  | "bible_complete";

export function DailyCard({
  checkin,
  owner,
  viewerId,
  likes,
  comments,
  canEdit,
  avatarUrl,
}: {
  checkin: DailyCheckin;
  owner: Profile;
  viewerId: string;
  likes: { id: string; user_id: string }[];
  comments: Array<DailyComment & { author?: Profile }>;
  canEdit: boolean;
  avatarUrl: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [state, setState] = useOptimistic(checkin, (current, patch: Partial<DailyCheckin>) => ({
    ...current,
    ...patch,
  }));

  const locked = Boolean(state.finalized_at) || !canEdit;
  const complete = completedCategories(state);
  const status = state.finalized_at ? state.status : "pending";

  function toggle(key: CheckKey) {
    if (locked || pending) return;
    const next = !state[key];
    start(async () => {
      setError(null);
      setState({ [key]: next });
      const result = await toggleCheckAction(key, next);
      if (!result.ok) {
        setState({ [key]: !next });
        setError(result.error);
      }
    });
  }

  function saveNote(key: "diet_note" | "workout_note" | "water_note" | "bible_note" | "bible_reference" | "day_note" | "failure_reason", value: string) {
    if (pending) return;
    start(async () => {
      setError(null);
      setState({ [key]: value });
      const result = await saveNoteAction(key, value);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <article
      className="relative rounded-plate border border-steel/35 bg-iron px-4 py-4 md:px-5 md:py-5"
      aria-busy={pending || undefined}
    >
      <span className="pointer-events-none absolute left-2 top-2 size-1.5 rounded-full bg-brass" />
      <span className="pointer-events-none absolute right-2 top-2 size-1.5 rounded-full bg-brass" />
      <header className="mb-4 flex items-center gap-3">
        <div className="size-11 overflow-hidden rounded-plate border border-brass/70 bg-graphite">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center text-brass">
              {owner.display_name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="stamp truncate text-[16px] leading-none">{owner.display_name}</h3>
          <p className="mt-1 text-sm text-steel">{complete} / 4 complete</p>
        </div>
        <StatusMark status={status} />
      </header>

      {error ? <div className="mb-3"><ErrorBanner message={error} /></div> : null}

      <div className="divide-y divide-steel/20">
      <Requirement
        label="Diet"
        stamp="diet"
        done={state.diet_complete}
        locked={locked}
        pending={pending}
        note={state.diet_note}
        onToggle={() => toggle("diet_complete")}
        onNote={(value) => saveNote("diet_note", value)}
      />
      <div className="py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="stamp flex items-center gap-2 text-[11px] text-steel">
            <CategoryStamp kind="workout" />
            Workout
          </p>
          <StatusMark status={isWorkoutComplete(state) ? "complete" : state.finalized_at ? "incomplete" : "pending"} />
        </div>
        <StampCheck label="Workout 1 — 45 min" checked={state.workout_1_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("workout_1_complete")} />
        <StampCheck label="Workout 2 — 45 min" checked={state.workout_2_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("workout_2_complete")} />
        <StampCheck label="At least one outdoors" checked={state.outdoor_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("outdoor_complete")} />
        <NoteField value={state.workout_note ?? ""} locked={locked} onSave={(value) => saveNote("workout_note", value)} />
      </div>
      <Requirement
        label="Water — 3.8 L"
        stamp="water"
        done={state.water_complete}
        locked={locked}
        pending={pending}
        note={state.water_note}
        onToggle={() => toggle("water_complete")}
        onNote={(value) => saveNote("water_note", value)}
      />
      <Requirement
        label="Bible — 10 pages"
        stamp="bible"
        done={state.bible_complete}
        locked={locked}
        pending={pending}
        note={state.bible_note}
        extra={
          <NoteField
            label="Reference"
            value={state.bible_reference ?? ""}
            locked={locked}
            onSave={(value) => saveNote("bible_reference", value)}
          />
        }
        onToggle={() => toggle("bible_complete")}
        onNote={(value) => saveNote("bible_note", value)}
      />
      </div>

      <NoteField
        label="Day note"
        value={state.day_note ?? ""}
        locked={locked}
        max={500}
        onSave={(value) => saveNote("day_note", value)}
      />

      {state.status === "failed" || missedCategories(state).length ? (
        <div className="mt-4 border-t border-steel/20 pt-3">
          <p className="stamp text-[11px] text-brass">Wooden spoon</p>
          {state.finalized_at && state.status === "failed" ? (
            <p className="mt-1 text-sm text-steel">
              Missed: {missedCategories(state).join(", ") || "requirements"}
            </p>
          ) : null}
          <NoteField
            label="Reason"
            value={state.failure_reason ?? ""}
            locked={!canEdit}
            onSave={(value) => saveNote("failure_reason", value)}
          />
        </div>
      ) : null}

      {owner.id !== viewerId ? (
        <SocialBar
          checkinId={checkin.id}
          liked={likes.some((like) => like.user_id === viewerId)}
          likeCount={likes.length}
          comments={comments}
        />
      ) : (
        <p className="mt-4 stamp text-[11px] text-steel">
          {likes.length} acknowledgement{likes.length === 1 ? "" : "s"} · {comments.length} comment{comments.length === 1 ? "" : "s"}
        </p>
      )}
    </article>
  );
}

function Requirement({
  label,
  stamp,
  done,
  locked,
  pending,
  note,
  extra,
  onToggle,
  onNote,
}: {
  label: string;
  stamp?: StampKind;
  done: boolean;
  locked: boolean;
  pending: boolean;
  note: string | null;
  extra?: React.ReactNode;
  onToggle: () => void;
  onNote: (value: string) => void;
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <StampCheck label={label} stamp={stamp} checked={done} locked={locked || pending} busy={pending} onToggle={onToggle} />
      {extra}
      <NoteField value={note ?? ""} locked={locked} onSave={onNote} />
    </div>
  );
}

function StampCheck({
  label,
  stamp,
  checked,
  locked,
  busy = false,
  onToggle,
}: {
  label: string;
  stamp?: StampKind;
  checked: boolean;
  locked: boolean;
  busy?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={`flex min-h-11 items-center justify-between gap-3 ${locked ? "" : "cursor-pointer"}`}>
      <span className="flex min-w-0 items-center gap-2 text-[15px] leading-6">
        {stamp ? <CategoryStamp kind={stamp} /> : null}
        {label}
      </span>
      <span className="inline-flex items-center gap-2">
        {busy ? <StampLoader className="size-4 text-brass" /> : null}
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={onToggle}
          aria-busy={busy || undefined}
          className="size-5 border-steel"
        />
      </span>
    </label>
  );
}

function NoteField({
  label = "Note",
  value,
  locked,
  max,
  onSave,
}: {
  label?: string;
  value: string;
  locked: boolean;
  max?: number;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(value));
  const [draft, setDraft] = useState(value);

  if (!open && !value) {
    if (locked) return null;
    return (
      <button type="button" className="stamp mt-1 text-[11px] text-steel hover:text-offwhite" onClick={() => setOpen(true)}>
        Add {label.toLowerCase()}
      </button>
    );
  }

  return (
    <div className="mt-2">
      <p className="stamp mb-1 text-[11px] text-steel">{label}</p>
      <TextArea
        value={draft}
        maxLength={max}
        readOnly={locked}
        rows={2}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== value) onSave(draft);
        }}
      />
    </div>
  );
}

function SocialBar({
  checkinId,
  liked,
  likeCount,
  comments,
}: {
  checkinId: string;
  liked: boolean;
  likeCount: number;
  comments: Array<DailyComment & { author?: Profile }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 border-t border-steel/20 pt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          aria-busy={pending || undefined}
          className={`stamp stamp-press inline-flex min-h-10 items-center gap-2 text-[11px] disabled:pointer-events-none disabled:opacity-50 ${liked ? "text-brass" : "text-steel"}`}
          onClick={() => {
            if (pending) return;
            start(async () => {
              setError(null);
              const result = await toggleLikeAction(checkinId);
              if (!result.ok) setError(result.error);
            });
          }}
        >
          {pending ? <StampLoader className="size-4" /> : <HeartIcon className="size-4" />}
          {likeCount}
        </button>
        <span className="stamp inline-flex items-center gap-2 text-[11px] text-steel">
          <CommentIcon className="size-4" />
          {comments.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="text-sm">
            <span className="stamp text-[11px] text-brass">{comment.author?.display_name ?? "Partner"} </span>
            {comment.body}
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        aria-busy={pending}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || !body.trim()) return;
          start(async () => {
            setError(null);
            const result = await addCommentAction(checkinId, body);
            if (!result.ok) setError(result.error);
            else setBody("");
          });
        }}
      >
        <TextArea
          value={body}
          rows={2}
          placeholder="Acknowledge the work"
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="submit" pending={pending} disabled={!body.trim()}>
          Send
        </Button>
      </form>
      {error ? <div className="mt-2"><ErrorBanner message={error} /></div> : null}
    </div>
  );
}
