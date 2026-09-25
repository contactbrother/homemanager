"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Share2 } from "lucide-react";
import { BarIconButton } from "@/components/shell/screen-bar";
import { Button } from "@/components/ui/button";

/**
 * Download and Share. On phones they sit in the top bar (rendered into its slot); from
 * tablet up they are ordinary buttons above the document.
 */
export function ScreenBarActions({
  blob,
  fileName,
  title,
}: {
  blob: Blob | null;
  fileName: string;
  title: string;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setSlot(document.getElementById("screen-bar-actions"));
  }, []);

  useEffect(() => {
    if (!blob || typeof navigator === "undefined" || !navigator.canShare) return;
    const file = new File([blob], fileName, { type: blob.type });
    setCanShare(navigator.canShare({ files: [file] }));
  }, [blob, fileName]);

  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], fileName, { type: blob.type });
    try {
      await navigator.share({ files: [file], title });
    } catch {
      // Closing the share sheet is not an error worth showing.
    }
  }

  const phone = (
    <>
      {canShare ? (
        <BarIconButton label="Share" onClick={share} disabled={!blob}>
          <Share2 aria-hidden size={20} />
        </BarIconButton>
      ) : null}
      <BarIconButton label="Download" onClick={download} disabled={!blob}>
        <Download aria-hidden size={20} />
      </BarIconButton>
    </>
  );

  return (
    <>
      {slot ? createPortal(phone, slot) : null}
      <div className="mb-5 hidden flex-wrap gap-2 md:flex">
        <Button variant="outline" onClick={download} disabled={!blob}>
          <Download aria-hidden size={18} />
          Download
        </Button>
        {canShare ? (
          <Button variant="outline" onClick={share} disabled={!blob}>
            <Share2 aria-hidden size={18} />
            Share
          </Button>
        ) : null}
      </div>
    </>
  );
}
