"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";

const NOTE_SAVE_MS = 500;
import { toggleCheckAction, saveNoteAction } from "@/lib/actions/checkin";
import { addCommentAction, toggleLikeAction } from "@/lib/actions/social";
import { CategoryStill, type StampKind } from "@/components/art";
import { DayCompleteBanner } from "@/components/day-complete-banner";
import { AcknowledgeIcon, CommentIcon } from "@/components/icons";
import { StampLoader } from "@/components/loader";
import { Button, StatusMark, TextArea } from "@/components/plate";
import { useToast } from "@/components/toast";
import { scrollFieldIntoView } from "@/lib/mobile-focus";
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
  const [state, setState] = useState(checkin);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(() => new Set());
  const busyRef = useRef(busyKeys);
  const noteFlight = useRef<Record<string, number>>({});
  const stateRef = useRef(state);
  busyRef.current = busyKeys;
  stateRef.current = state;

  useEffect(() => {
    const current = stateRef.current;
    if (busyRef.current.size === 0) {
      stateRef.current = checkin;
      setState(checkin);
      return;
    }
    const next: DailyCheckin = { ...checkin };
    const saved = next as Record<string, unknown>;
    const local = current as Record<string, unknown>;
    for (const key of busyRef.current) saved[key] = local[key];
    stateRef.current = next;
    setState(next);
  }, [checkin]);

  const locked = Boolean(state.finalized_at) || !canEdit;
  const complete = completedCategories(state);
  const allComplete = isPerfect(state);
  const status = state.finalized_at ? state.status : "pending";
  const showDayComplete = canEdit && !state.finalized_at && allComplete;

  function markBusy(key: string, on: boolean) {
    setBusyKeys((current) => {
      const next = new Set(current);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggle(key: CheckKey) {
    if (locked || busyRef.current.has(key)) return;
    const next = !stateRef.current[key];
    const nextState = { ...stateRef.current, [key]: next };
    stateRef.current = nextState;
    setState(nextState);
    markBusy(key, true);
    void toggleCheckAction(key, next).then((result) => {
      markBusy(key, false);
      if (!result.ok) {
        const reverted = { ...stateRef.current, [key]: !next };
        stateRef.current = reverted;
        setState(reverted);
        toast.error(result.error);
        return;
      }
      if (isPerfect(nextState)) toast.success("Your day is complete");
      else toast.success("Progress logged");
    });
  }

  async function saveNote(
    key: "diet_note" | "workout_note" | "water_note" | "bible_note" | "bible_reference" | "day_note" | "failure_reason",
    value: string,
  ) {
    const flight = (noteFlight.current[key] ?? 0) + 1;
    noteFlight.current[key] = flight;
    markBusy(key, true);
    const result = await saveNoteAction(key, value);
    if (noteFlight.current[key] !== flight) return result.ok;
    markBusy(key, false);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    const nextState = { ...stateRef.current, [key]: value || null };
    stateRef.current = nextState;
    setState(nextState);
    return true;
  }

  return (
    <article
      className="plate-metal relative rounded-plate border border-steel/45 bg-iron px-5 py-5 md:px-6 md:py-6"
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
        busy={busyKeys.has("diet_complete")}
        saving={busyKeys.has("diet_complete") || busyKeys.has("diet_note")}
        note={state.diet_note}
        onToggle={() => toggle("diet_complete")}
        onNote={(value) => saveNote("diet_note", value)}
      />
      <RequirementPlate kind="workout" saving={["workout_1_complete", "workout_2_complete", "outdoor_complete", "workout_note"].some((key) => busyKeys.has(key))}>
        <div className="requirement-header mb-2">
          <p className="requirement-title">Workout</p>
          <LiveStatus status={isWorkoutComplete(state) ? "complete" : state.finalized_at ? "incomplete" : "pending"} />
        </div>
        <div className="space-y-3">
          <StampCheck label="Workout 1 — 45 min" checked={state.workout_1_complete} locked={locked} busy={busyKeys.has("workout_1_complete")} onToggle={() => toggle("workout_1_complete")} />
          <StampCheck label="Workout 2 — 45 min" checked={state.workout_2_complete} locked={locked} busy={busyKeys.has("workout_2_complete")} onToggle={() => toggle("workout_2_complete")} />
          <StampCheck label="At least one outdoors" checked={state.outdoor_complete} locked={locked} busy={busyKeys.has("outdoor_complete")} onToggle={() => toggle("outdoor_complete")} />
        </div>
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
        busy={busyKeys.has("water_complete")}
        saving={busyKeys.has("water_complete") || busyKeys.has("water_note")}
        note={state.water_note}
        onToggle={() => toggle("water_complete")}
        onNote={(value) => saveNote("water_note", value)}
      />
      <Requirement
        label="Bible — 10 pages"
        kind="bible"
        done={state.bible_complete}
        locked={locked}
        busy={busyKeys.has("bible_complete")}
        saving={busyKeys.has("bible_complete") || busyKeys.has("bible_note") || busyKeys.has("bible_reference")}
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

function RequirementPlate({
  kind,
  saving = false,
  children,
}: {
  kind: StampKind;
  saving?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`requirement-plate${saving ? " is-saving" : ""}`} aria-busy={saving || undefined}>
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
  busy,
  saving,
  note,
  extra,
  onToggle,
  onNote,
}: {
  label: string;
  kind: StampKind;
  done: boolean;
  locked: boolean;
  busy: boolean;
  saving: boolean;
  note: string | null;
  extra?: React.ReactNode;
  onToggle: () => void;
  onNote: (value: string) => Promise<boolean>;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  useEffect(() => {
    if (note) setNoteOpen(true);
  }, [note]);

  return (
    <RequirementPlate kind={kind} saving={saving}>
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
            <StampPad
              checked={done}
              locked={locked}
              busy={busy}
              onToggle={onToggle}
              label={label}
              inline
            />
          </div>
        </div>
        {extra ? <div className="requirement-extra">{extra}</div> : null}
      </div>
      {noteOpen || note ? (
        <div className="mt-3">
          <NoteField startOpen value={note ?? ""} locked={locked} onSave={onNote} />
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
  inline = false,
}: {
  checked: boolean;
  locked: boolean;
  busy?: boolean;
  onToggle: () => void;
  label?: string;
  inline?: boolean;
}) {
  const { hit, clearHit } = useStampHit(checked);

  return (
    <label
      className={`inline-flex items-center gap-2 ${inline ? "" : "min-h-11"} ${locked ? "" : "cursor-pointer"}`}
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
      <span className="requirement-check-label">{label}</span>
      <StampPad checked={checked} locked={locked} busy={busy} onToggle={onToggle} label={label} inline />
    </label>
  );
}

function NoteField({
  label = "Note",
  value,
  locked,
  max,
  className = "",
  startOpen = false,
  onSave,
}: {
  label?: string;
  value: string;
  locked: boolean;
  max?: number;
  className?: string;
  startOpen?: boolean;
  onSave: (value: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(Boolean(value) || startOpen);
  const [draft, setDraft] = useState(value);
  const [phase, setPhase] = useState<"idle" | "saving" | "saved">("idle");
  const fieldRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(value);
  const savedRef = useRef(value);
  const timerRef = useRef<number | null>(null);
  const focusedRef = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (focusedRef.current || draftRef.current !== savedRef.current) return;
    draftRef.current = value;
    savedRef.current = value;
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open || !fieldRef.current) return;
    scrollFieldIntoView(fieldRef.current);
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (draftRef.current !== savedRef.current) void onSaveRef.current(draftRef.current);
    };
  }, []);

  async function commit(next: string) {
    if (locked || next === savedRef.current) return;
    setPhase("saving");
    const ok = await onSaveRef.current(next);
    if (next !== draftRef.current && ok) {
      savedRef.current = next;
      void commit(draftRef.current);
      return;
    }
    if (!ok) {
      setPhase("idle");
      return;
    }
    savedRef.current = next;
    setPhase("saved");
  }

  function queue(next: string) {
    draftRef.current = next;
    setDraft(next);
    if (locked) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void commit(draftRef.current);
    }, NOTE_SAVE_MS);
  }

  function flush() {
    focusedRef.current = false;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    void commit(draftRef.current);
  }

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

  const status = phase === "saving" ? "Saving" : phase === "saved" ? "Saved" : null;

  return (
    <div ref={fieldRef} className={`w-full ${className}`.trim()}>
      <p className="stamp mb-1 flex items-center justify-between text-[11px] text-steel">
        <span>{label}</span>
        {status ? <span>{status}</span> : null}
      </p>
      <TextArea
        value={draft}
        maxLength={max}
        readOnly={locked}
        rows={2}
        onChange={(event) => queue(event.target.value)}
        onFocus={(event) => {
          focusedRef.current = true;
          scrollFieldIntoView(event.currentTarget);
        }}
        onBlur={flush}
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
          className={`stamp stamp-press inline-flex min-h-11 items-center gap-2 px-3 text-[11px] disabled:pointer-events-none ${
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
          className="stamp stamp-press inline-flex min-h-11 items-center gap-2 px-3 text-[11px] text-steel"
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
          className="mt-3 flex flex-col gap-2 sm:flex-row"
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
          <Button type="submit" className="w-full sm:w-auto" pending={pending} disabled={!body.trim()}>
            Send
          </Button>
        </form>
      ) : null}
    </div>
  );
}
