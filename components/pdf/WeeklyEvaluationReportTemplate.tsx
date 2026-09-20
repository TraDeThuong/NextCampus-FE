"use client";

import React from "react";
import type { WeeklyEvaluation, EvaluationRatings, RatingLevel } from "@/types/weekly-evaluation";
import { CRITERIA_SECTIONS, RATING_LABELS, RATING_SCORES } from "@/types/weekly-evaluation";

interface Props {
  evaluation: WeeklyEvaluation;
}

function computeScore(ratings: EvaluationRatings | null, defaultScore: number): number {
  if (!ratings) return defaultScore;
  const allKeys = CRITERIA_SECTIONS.flatMap((s) => s.criteria.map((c) => c.key));
  const validScores = allKeys
    .map((k) => (ratings[k] ? RATING_SCORES[ratings[k]] : null))
    .filter((s): s is number => s !== null);
  if (validScores.length === 0) return defaultScore;
  return parseFloat((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1));
}

function getRatingClassification(score: number): { label: string; color: string } {
  if (score >= 9.0) return { label: "Xuất Sắc", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
  if (score >= 8.0) return { label: "Tốt (Giỏi)", color: "text-blue-700 bg-blue-50 border-blue-300" };
  if (score >= 6.5) return { label: "Khá", color: "text-cyan-700 bg-cyan-50 border-cyan-300" };
  if (score >= 5.0) return { label: "Trung Bình", color: "text-amber-700 bg-amber-50 border-amber-300" };
  return { label: "Yếu / Chưa Đạt", color: "text-rose-700 bg-rose-50 border-rose-300" };
}

function formatDateDisplay(d?: string | Date | null): string {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export const WeeklyEvaluationReportTemplate: React.FC<Props> = ({ evaluation }) => {
  const ratings = evaluation.ratings;
  const finalScore = computeScore(ratings, evaluation.totalScore);
  const classification = getRatingClassification(finalScore);
  const reportDate = formatDateDisplay(evaluation.createdAt || new Date());
  const now = new Date();

  return (
    <div
      id={`evaluation-report-${evaluation.id}`}
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
      className="p-10 mx-auto box-border text-[13px] leading-normal"
    >
      {/* ─── HEADER: BRANDING & OFFICIAL METADATA ─────────────────────────── */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              NC
            </div>
            <span className="font-extrabold tracking-wider text-base text-slate-900 uppercase">
              NexCampus Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Hệ Thống Đánh Giá & Quản Lý Thực Tập Chuẩn Doanh Nghiệp
          </p>
        </div>
        <div className="text-right text-xs space-y-0.5 text-slate-600 font-mono">
          <div>Mẫu số: <span className="font-bold text-slate-800">04-ĐGT/NC</span></div>
          <div>Mã đánh giá: <span className="font-bold text-slate-800">{evaluation.id.slice(0, 8).toUpperCase()}</span></div>
          <div>Ngày lập: <span className="text-slate-800">{reportDate}</span></div>
        </div>
      </div>

      {/* ─── DOCUMENT TITLE ────────────────────────────────────────────────── */}
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          PHIẾU ĐÁNH GIÁ KẾT QUẢ THỰC TẬP HÀNG TUẦN
        </h1>
        <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-slate-700 font-semibold text-xs">
          Tuần {evaluation.week} · Năm {evaluation.year || now.getFullYear()}
          {evaluation.startDate && evaluation.endDate && (
            <span className="ml-1.5 font-normal text-slate-500">
              ({formatDateDisplay(evaluation.startDate)} - {formatDateDisplay(evaluation.endDate)})
            </span>
          )}
        </div>
      </div>

      {/* ─── SECTION 1: INTERN & SUPERVISOR INFORMATION ───────────────────── */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
          <span>I. Thông Tin Chung</span>
          <span className="font-normal text-[11px] text-slate-500 lowercase">Thông tin hành chính & đơn vị phụ trách</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          <div>
            <span className="text-slate-500 inline-block w-28">Họ và tên TTS:</span>
            <strong className="text-slate-900 text-sm">{evaluation.intern?.fullName || "—"}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Người hướng dẫn:</span>
            <strong className="text-slate-800">{evaluation.leader?.fullName || evaluation.leader?.email || "—"}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Email tài khoản:</span>
            <span className="text-slate-700 font-mono">{evaluation.intern?.user?.email || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Phòng ban:</span>
            <span className="text-slate-800 font-medium">
              {evaluation.intern?.department?.name || "Bộ phận Phát triển Phần mềm"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Mã thực tập sinh:</span>
            <span className="text-slate-700 font-mono">
              {"internCode" in (evaluation.intern || {})
                ? String((evaluation.intern as Record<string, unknown>).internCode)
                : `INT-${evaluation.intern?.id?.slice(0, 6).toUpperCase()}`}
            </span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Vị trí thực tập:</span>
            <span className="text-slate-800">
              {evaluation.intern?.position?.name || "Thực tập sinh Công nghệ"}
            </span>
          </div>

        </div>
      </div>

      {/* ─── SECTION 2: 12 EVALUATION CRITERIA TABLE ───────────────────────── */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
          <span>II. Kết Quả Đánh Giá Chi Tiết Theo 12 Tiêu Chí</span>
          <span className="font-normal text-[11px] text-slate-500">Thang điểm 10 quy đổi chuẩn</span>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-left font-semibold">
              <th className="border border-slate-300 px-3 py-2 w-10 text-center">STT</th>
              <th className="border border-slate-300 px-3 py-2">Tiêu Chí Đánh Giá</th>
              <th className="border border-slate-300 px-3 py-2 w-36 text-center">Mức Đánh Giá</th>
              <th className="border border-slate-300 px-3 py-2 w-24 text-center">Điểm Quy Đổi</th>
            </tr>
          </thead>
          <tbody>
            {ratings ? (
              CRITERIA_SECTIONS.map((section, sIdx) => {
                let sectionStartIndex = 0;
                if (sIdx === 1) sectionStartIndex = 5;
                if (sIdx === 2) sectionStartIndex = 10;

                const sectionKeys = section.criteria.map((c) => c.key);
                const sectionScores = sectionKeys
                  .map((k) => (ratings[k] ? RATING_SCORES[ratings[k]] : 0));
                const sectionAvg = (sectionScores.reduce((a, b) => a + b, 0) / sectionKeys.length).toFixed(1);

                return (
                  <React.Fragment key={section.id}>
                    {/* Section Group Header */}
                    <tr className="bg-slate-50/80 font-bold text-slate-800">
                      <td colSpan={3} className="border border-slate-300 px-3 py-1.5 uppercase text-[11px] tracking-wide">
                        {section.name}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-blue-700">
                        {sectionAvg} / 10
                      </td>
                    </tr>
                    {/* Criteria items */}
                    {section.criteria.map((criterion, cIdx) => {
                      const level: RatingLevel = ratings[criterion.key] || "TB";
                      const levelLabel = RATING_LABELS[level] || level;
                      const score = RATING_SCORES[level] || 6;
                      const globalIdx = sectionStartIndex + cIdx + 1;

                      return (
                        <tr key={criterion.key} className="hover:bg-slate-50/40">
                          <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">
                            {globalIdx}
                          </td>
                          <td className="border border-slate-300 px-3 py-1.5 text-slate-800">
                            <div>{criterion.label}</div>
                            {criterion.tooltip && (
                              <div className="text-[10px] text-slate-400 mt-0.5 italic">
                                {criterion.tooltip}
                              </div>
                            )}
                          </td>
                          <td className="border border-slate-300 px-3 py-1.5 text-center font-medium text-slate-700">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-200">
                              {levelLabel}
                            </span>
                          </td>
                          <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-slate-800 font-mono">
                            {score}.0
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            ) : (
              /* Fallback for legacy evaluation without 12 criteria */
              <>
                <tr className="hover:bg-slate-50/40">
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">1</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">Kỹ năng giao tiếp và ứng xử</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center">—</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-slate-800 font-mono">{evaluation.communication}.0</td>
                </tr>
                <tr className="hover:bg-slate-50/40">
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">2</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">Thái độ và kỷ luật công việc</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center">—</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-slate-800 font-mono">{evaluation.attitude}.0</td>
                </tr>
                <tr className="hover:bg-slate-50/40">
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">3</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">Khả năng tự học và nghiên cứu</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center">—</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-slate-800 font-mono">{evaluation.learning}.0</td>
                </tr>
                <tr className="hover:bg-slate-50/40">
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">4</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-slate-800">Năng lực lập trình & hoàn thành nhiệm vụ</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center">—</td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-slate-800 font-mono">{evaluation.coding}.0</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── SECTION 3: TOTAL SCORE & SUMMARY ──────────────────────────────── */}
      <div className="mb-6 rounded-lg border border-slate-300 p-4 bg-slate-50/50 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium block">KẾT QUẢ ĐÁNH GIÁ TỔNG THỂ</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {finalScore.toFixed(1)}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ 10.0</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${classification.color}`}>
              Xếp loại: {classification.label}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Trạng thái: <span className="font-semibold text-emerald-700">Đã Hoàn Tất Đánh Giá</span></div>
          {evaluation.viewedAt && (
            <div className="text-[11px] text-slate-400 mt-0.5">
              TTS đã xem: {formatDateDisplay(evaluation.viewedAt)}
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 4: LEADER COMMENTS & AI INSIGHTS ─────────────────────── */}
      <div className="mb-8 space-y-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            III. Nhận Xét Của Người Hướng Dẫn (Leader)
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white min-h-[64px] text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {evaluation.comment || "Thực tập sinh thể hiện tinh thần làm việc tích cực, hoàn thành tốt các nhiệm vụ được phân công trong tuần."}
          </div>
        </div>

        {evaluation.aiComment && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-1.5 flex items-center gap-1.5">
              <span>Đề Xuất Phân Tích & Hỗ Trợ Từ AI NexCampus</span>
              <span className="text-[10px] font-normal text-slate-400 lowercase">(tham chiếu khách quan)</span>
            </div>
            <div className="border border-sky-100 rounded-lg p-3 bg-sky-50/40 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap italic">
              {evaluation.aiComment}
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 5: SIGNATURES ─────────────────────────────────────────── */}
      <div className="pt-2 border-t border-slate-200">
        <div className="grid grid-cols-2 text-center text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wide">THỰC TẬP SINH</p>
            <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-16 flex items-center justify-center">
              {evaluation.viewedAt ? (
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Đã xác nhận trực tuyến lúc {formatDateDisplay(evaluation.viewedAt)}
                </span>
              ) : null}
            </div>
            <p className="font-bold text-slate-900">{evaluation.intern?.fullName || "—"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 italic">
              TP. Hồ Chí Minh, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
            </p>
            <p className="font-bold text-slate-800 uppercase tracking-wide">NGƯỜI HƯỚNG DẪN (LEADER)</p>
            <p className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ✓ Đã phê duyệt qua hệ thống
              </span>
            </div>
            <p className="font-bold text-slate-900">
              {evaluation.leader?.fullName || evaluation.leader?.email || "Trưởng nhóm hướng dẫn"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
