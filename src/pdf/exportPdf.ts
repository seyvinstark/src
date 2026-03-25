"use client";

import { pdf } from "@react-pdf/renderer";

export async function downloadPdf(doc: React.ReactElement, filename: string) {
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

