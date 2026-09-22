import { dateInChallengeTz } from "@/lib/challenge";
import { ChallengeOnboarding } from "./challenge-onboarding";

export default function OnboardingChallengePage() {
  return <ChallengeOnboarding today={dateInChallengeTz()} />;
}
