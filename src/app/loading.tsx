import { PlateBusy } from "@/components/loader";

export default function Loading() {
  return (
    <main className="auth-shell mx-auto flex w-full max-w-lg flex-col items-stretch justify-start">
      <div className="w-full">
        <PlateBusy />
      </div>
    </main>
  );
}
