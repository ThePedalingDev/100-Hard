import { PlateBusy } from "@/components/loader";

export default function Loading() {
  return (
    <main className="auth-shell mx-auto flex max-w-lg items-center">
      <div className="w-full">
        <PlateBusy />
      </div>
    </main>
  );
}
