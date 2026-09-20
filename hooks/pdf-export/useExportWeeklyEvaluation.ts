import { useClientExportWeeklyEvaluation } from "./useClientExportWeeklyEvaluation";

export function triggerDownload(fileUrl: string, defaultName = "bao-cao-danh-gia-tuan.pdf") {
  try {
    const fileName = decodeURIComponent(
      fileUrl.split("/").pop()?.split("?")[0] ?? defaultName
    );

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(fileUrl, "_blank");
  }
}

export function useExportWeeklyEvaluation() {
  return useClientExportWeeklyEvaluation();
}

