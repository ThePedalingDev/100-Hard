import { PlateBusy } from "@/components/loader";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-10">
      <div className="w-full">
        <PlateBusy />
      </div>
    </main>
  );
}
