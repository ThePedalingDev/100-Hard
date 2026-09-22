"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { toggleCheckAction, saveNoteAction } from "@/lib/actions/checkin";
import { addCommentAction, toggleLikeAction } from "@/lib/actions/social";
import { CategoryStill, type StampKind } from "@/components/art";
import { DayCompleteBanner } from "@/components/day-complete-banner";
import { AcknowledgeIcon, CommentIcon } from "@/components/icons";
import { StampLoader } from "@/components/loader";
import { Button, StatusMark, TextArea } from "@/components/plate";
import { useToast } from "@/components/toast";
import { completedCategories, isPerfect, isWorkoutComplete, missedCategories } from "@/lib/scoring";
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
  const toast = useToast();
  const [pending, start] = useTransition();
  const [state, setState] = useOptimistic(checkin, (current, patch: Partial<DailyCheckin>) => ({
    ...current,
    ...patch,
  }));

  const locked = Boolean(state.finalized_at) || !canEdit;
  const complete = completedCategories(state);
  const allComplete = isPerfect(state);
  const status = state.finalized_at ? state.status : "pending";
  const showDayComplete = canEdit && !state.finalized_at && allComplete;

  function toggle(key: CheckKey) {
    if (locked || pending) return;
    const next = !state[key];
    start(async () => {
      const nextState = { ...state, [key]: next };
      setState({ [key]: next });
      const result = await toggleCheckAction(key, next);
      if (!result.ok) {
        setState({ [key]: !next });
        toast.error(result.error);
        return;
      }
      if (isPerfect(nextState)) {
        toast.success("Your day is complete");
      } else {
        toast.success("Progress logged");
      }
    });
  }

  function saveNote(key: "diet_note" | "workout_note" | "water_note" | "bible_note" | "bible_reference" | "day_note" | "failure_reason", value: string) {
    if (pending) return;
    start(async () => {
      setState({ [key]: value });
      const result = await saveNoteAction(key, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Note saved");
    });
  }

  return (
    <article
      className="plate-metal relative rounded-plate border border-steel/45 bg-iron px-5 py-5 md:px-6 md:py-6"
      aria-busy={pending || undefined}
    >
      <span className="pointer-events-none absolute left-2 top-2 size-3 rounded-full border border-brass bg-club" aria-hidden="true">
        <span className="absolute inset-[3px] rounded-full bg-brass" />
      </span>
      <span className="pointer-events-none absolute right-2 top-2 size-3 rounded-full border border-brass bg-club" aria-hidden="true">
        <span className="absolute inset-[3px] rounded-full bg-brass" />
      </span>
      <span className="pointer-events-none absolute bottom-2 left-2 size-3 rounded-full border border-brass bg-club" aria-hidden="true">
        <span className="absolute inset-[3px] rounded-full bg-brass" />
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2 size-3 rounded-full border border-brass bg-club" aria-hidden="true">
        <span className="absolute inset-[3px] rounded-full bg-brass" />
      </span>
      <header className="mb-5 flex items-center gap-3">
        <div className="size-12 overflow-hidden rounded-plate border border-brass/70 bg-graphite">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="stamp flex size-full items-center justify-center text-mark">
              {owner.display_name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[18px] leading-none">{owner.display_name}</h3>
          <p className="mt-1 text-sm text-steel">{complete} / 4 complete</p>
        </div>
        <LiveStatus status={showDayComplete ? "complete" : status} />
      </header>

      {showDayComplete ? <DayCompleteBanner active={allComplete} /> : null}

      <div className="flex flex-col gap-3">
      <Requirement
        label="Diet"
        kind="diet"
        done={state.diet_complete}
        locked={locked}
        pending={pending}
        note={state.diet_note}
        onToggle={() => toggle("diet_complete")}
        onNote={(value) => saveNote("diet_note", value)}
      />
      <RequirementPlate kind="workout">
        <div className="requirement-header mb-2">
          <p className="requirement-title">Workout</p>
          <LiveStatus status={isWorkoutComplete(state) ? "complete" : state.finalized_at ? "incomplete" : "pending"} />
        </div>
        <StampCheck label="Workout 1 — 45 min" checked={state.workout_1_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("workout_1_complete")} />
        <StampCheck label="Workout 2 — 45 min" checked={state.workout_2_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("workout_2_complete")} />
        <StampCheck label="At least one outdoors" checked={state.outdoor_complete} locked={locked || pending} busy={pending} onToggle={() => toggle("outdoor_complete")} />
        <NoteField
          className="mt-2"
          value={state.workout_note ?? ""}
          locked={locked}
          onSave={(value) => saveNote("workout_note", value)}
        />
      </RequirementPlate>
      <Requirement
        label="Water — 3.8 L"
        kind="water"
        done={state.water_complete}
        locked={locked}
        pending={pending}
        note={state.water_note}
        onToggle={() => toggle("water_complete")}
        onNote={(value) => saveNote("water_note", value)}
      />
      <Requirement
        label="Bible — 10 pages"
        kind="bible"
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
        className="mt-2"
        label="Day note"
        value={state.day_note ?? ""}
        locked={locked}
        max={500}
        onSave={(value) => saveNote("day_note", value)}
      />

      {state.status === "failed" || missedCategories(state).length ? (
        <div className="mt-4 border-t border-steel/20 pt-3">
          <p className="stamp text-[11px] text-mark">Wooden spoon</p>
          {state.finalized_at && state.status === "failed" ? (
            <p className="mt-1 text-sm text-steel">
              Missed: {missedCategories(state).join(", ") || "requirements"}
            </p>
          ) : null}
          <NoteField
            className="mt-2"
            label="Reason"
            value={state.failure_reason ?? ""}
            locked={!canEdit}
            onSave={(value) => saveNote("failure_reason", value)}
          />
        </div>
      ) : null}

      <SocialBar
        checkinId={checkin.id}
        liked={likes.some((like) => like.user_id === viewerId)}
        likeCount={likes.length}
        comments={comments}
        canInteract={owner.id !== viewerId}
      />
    </article>
  );
}

function RequirementPlate({ kind, children }: { kind: StampKind; children: ReactNode }) {
  return (
    <section className="requirement-plate">
      <CategoryStill kind={kind} />
      <div className="requirement-body">{children}</div>
    </section>
  );
}

function Requirement({
  label,
  kind,
  done,
  locked,
  pending,
  note,
  extra,
  onToggle,
  onNote,
}: {
  label: string;
  kind: StampKind;
  done: boolean;
  locked: boolean;
  pending: boolean;
  note: string | null;
  extra?: React.ReactNode;
  onToggle: () => void;
  onNote: (value: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  useEffect(() => {
    if (note) setNoteOpen(true);
  }, [note]);

  return (
    <RequirementPlate kind={kind}>
      <div className="requirement-toolbar">
        <div className="requirement-header">
          <p className="requirement-title">{label}</p>
          <div className="requirement-controls">
            {!noteOpen && !note && !locked ? (
              <Button
                type="button"
                variant="secondary"
                size="compact"
                className="w-fit shrink-0"
                onClick={() => setNoteOpen(true)}
              >
                Add note
              </Button>
            ) : null}
            <StampPad checked={done} locked={locked || pending} busy={pending} onToggle={onToggle} />
          </div>
        </div>
        {extra ? <div className="requirement-extra">{extra}</div> : null}
      </div>
      {noteOpen || note ? (
        <div className="mt-3">
          <NoteField value={note ?? ""} locked={locked} onSave={onNote} />
        </div>
      ) : null}
    </RequirementPlate>
  );
}

function useStampHit(active: boolean) {
  const [hit, setHit] = useState(false);
  const previous = useRef(active);

  useEffect(() => {
    if (active && !previous.current) setHit(true);
    if (!active) setHit(false);
    previous.current = active;
  }, [active]);

  return {
    hit,
    clearHit() {
      setHit(false);
    },
  };
}

function LiveStatus({
  status,
}: {
  status: "perfect" | "failed" | "pending" | "complete" | "incomplete";
}) {
  const inked = status === "perfect" || status === "complete";
  const { hit, clearHit } = useStampHit(inked);

  return (
    <span className={hit ? "stamp-mark is-stamping" : "stamp-mark"} onAnimationEnd={clearHit}>
      <StatusMark status={status} />
    </span>
  );
}

function StampPad({
  checked,
  locked,
  busy = false,
  onToggle,
  label,
}: {
  checked: boolean;
  locked: boolean;
  busy?: boolean;
  onToggle: () => void;
  label?: string;
}) {
  const { hit, clearHit } = useStampHit(checked);

  return (
    <label
      className={`inline-flex min-h-11 items-center gap-2 ${locked ? "" : "cursor-pointer"}`}
      aria-label={label}
    >
      {busy ? <StampLoader className="size-4 text-mark" /> : null}
      <span className="stamp-pad">
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={onToggle}
          aria-busy={busy || undefined}
          aria-label={label}
          className="stamp-pad-input"
        />
        <span
          className={`stamp-face${checked ? " is-inked" : ""}${hit ? " is-stamping" : ""}`}
          aria-hidden="true"
          onAnimationEnd={clearHit}
        >
          {checked ? "✓" : "○"}
        </span>
      </span>
    </label>
  );
}

function StampCheck({
  label,
  checked,
  locked,
  busy = false,
  onToggle,
}: {
  label: string;
  checked: boolean;
  locked: boolean;
  busy?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={`flex min-h-11 items-center justify-between gap-3 ${locked ? "" : "cursor-pointer"}`}>
      <span className="min-w-0 text-[15px] leading-6">{label}</span>
      <StampPad checked={checked} locked={locked} busy={busy} onToggle={onToggle} label={label} />
    </label>
  );
}

function NoteField({
  label = "Note",
  value,
  locked,
  max,
  className = "",
  onSave,
}: {
  label?: string;
  value: string;
  locked: boolean;
  max?: number;
  className?: string;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(value));
  const [draft, setDraft] = useState(value);

  if (!open && !value) {
    if (locked) return null;
    return (
      <Button
        type="button"
        variant="secondary"
        size="compact"
        className="w-fit"
        onClick={() => setOpen(true)}
      >
        Add {label.toLowerCase()}
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`.trim()}>
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
  canInteract,
}: {
  checkinId: string;
  liked: boolean;
  likeCount: number;
  comments: Array<DailyComment & { author?: Profile }>;
  canInteract: boolean;
}) {
  const toast = useToast();
  const commentField = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [pending, start] = useTransition();
  const [social, setSocial] = useOptimistic({ liked, likeCount }, (current, nextLiked: boolean) => ({
    liked: nextLiked,
    likeCount: current.likeCount + (nextLiked === current.liked ? 0 : nextLiked ? 1 : -1),
  }));
  const { hit, clearHit } = useStampHit(social.liked);
  const likeLabel = `${social.likeCount} acknowledgement${social.likeCount === 1 ? "" : "s"}`;
  const commentLabel = `${comments.length} comment${comments.length === 1 ? "" : "s"}`;

  function openComposer() {
    setComposerOpen(true);
    window.requestAnimationFrame(() => commentField.current?.focus());
  }

  return (
    <div className="mt-4 border-t border-steel/20 pt-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canInteract || pending}
          aria-busy={pending || undefined}
          aria-label={likeLabel}
          className={`stamp stamp-press inline-flex min-h-10 items-center gap-2 text-[11px] disabled:pointer-events-none ${
            social.liked ? "text-mark" : "text-steel"
          } ${canInteract ? "" : "disabled:opacity-100"}`}
          onClick={() => {
            if (!canInteract || pending) return;
            start(async () => {
              const wasLiked = social.liked;
              setSocial(!wasLiked);
              const result = await toggleLikeAction(checkinId);
              if (!result.ok) {
                setSocial(wasLiked);
                toast.error(result.error);
              }
            });
          }}
        >
          <span className={hit ? "stamp-mark is-stamping" : "stamp-mark"} onAnimationEnd={clearHit}>
            <AcknowledgeIcon className="size-4" fill={social.liked ? "currentColor" : "none"} />
          </span>
          {likeLabel}
        </button>
        <button
          type="button"
          aria-label={commentLabel}
          aria-expanded={composerOpen}
          className="stamp stamp-press inline-flex min-h-10 items-center gap-2 text-[11px] text-steel"
          onClick={openComposer}
        >
          <CommentIcon className="size-4" />
          {commentLabel}
        </button>
      </div>
      {comments.length ? (
        <ul className="mt-3 space-y-2">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <span className="stamp text-[11px] text-mark">{comment.author?.display_name ?? "Partner"} </span>
              {comment.body}
            </li>
          ))}
        </ul>
      ) : composerOpen && !canInteract ? (
        <p className="mt-3 text-sm text-steel">Members leave comments on this plate.</p>
      ) : null}
      {canInteract && composerOpen ? (
        <form
          className="mt-3 flex gap-2"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending || !body.trim()) return;
            start(async () => {
              const result = await addCommentAction(checkinId, body);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setBody("");
              toast.success("Comment posted");
            });
          }}
        >
          <TextArea
            ref={commentField}
            value={body}
            rows={2}
            placeholder="Acknowledge the work"
            onChange={(event) => setBody(event.target.value)}
          />
          <Button type="submit" pending={pending} disabled={!body.trim()}>
            Send
          </Button>
        </form>
      ) : null}
    </div>
  );
}
