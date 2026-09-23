export type ProfileChallengePillStats = {
  streak: number;
  perfectDays: number;
};

export function ProfileChallengePills({
  stats,
  tone = "light",
  className = "",
}: {
  stats: ProfileChallengePillStats | null | undefined;
  tone?: "light" | "club";
  className?: string;
}) {
  if (!stats) return null;

  const surface = tone === "club" ? "profile-pill-club" : "profile-pill-light";

  return (
    <ul className={`profile-challenge-pills flex flex-wrap gap-2 ${className}`.trim()} aria-label="Active challenge stats">
      <li className={`profile-pill profile-pill-streak ${surface}`}>
        <span className="profile-pill-value tabular">{stats.streak}</span>
        <span className="profile-pill-label">day streak</span>
      </li>
      <li className={`profile-pill profile-pill-perfect ${surface}`}>
        <span className="profile-pill-value tabular">{stats.perfectDays}</span>
        <span className="profile-pill-label">perfect days</span>
      </li>
    </ul>
  );
}
