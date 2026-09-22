"use client";

import { useState } from "react";
import { CopyIcon } from "@/components/icons";
import { Button } from "@/components/plate";

export function InviteShare({
  code,
  waiting = false,
}: {
  code: string;
  waiting?: boolean;
}) {
  const path = `/join/${code}`;
  const [copied, setCopied] = useState<"code" | "path" | null>(null);

  async function copy(kind: "code" | "path") {
    const value = kind === "code" ? code : `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div>
      <p className="text-[16px] leading-none font-semibold tracking-[-0.03em]">{waiting ? "Waiting for members" : "Invite"}</p>
      <p className="mt-2 text-sm leading-6 text-steel">
        {waiting
          ? "Share the invite so the next pin can land on the rack. Up to 12 members."
          : "Copy the code or the join link. Up to 12 members."}
      </p>
      <p className="stamp mt-5 select-all text-[32px] leading-none tabular text-brass">{code}</p>
      <p className="stamp mt-3 text-[11px] text-steel">{path}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="w-full sm:w-auto" onClick={() => copy("code")}>
          <CopyIcon className="size-4" />
          {copied === "code" ? "Copied" : "Copy code"}
        </Button>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => copy("path")}>
          {copied === "path" ? "Copied" : "Copy join link"}
        </Button>
      </div>
    </div>
  );
}
