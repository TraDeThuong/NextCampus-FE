"use client";

import React from "react";
import type { InternshipSummaryData } from "@/types/pdf-export";

interface Props {
  summary: InternshipSummaryData;
}

function getRatingBadge(gradeCode: string) {
  switch (gradeCode) {
    case "TOT":
      return "text-emerald-800 bg-emerald-50 border-emerald-300";
    case "KHA":
      return "text-blue-800 bg-blue-50 border-blue-300";
    case "TB":
      return "text-amber-800 bg-amber-50 border-amber-300";
    default:
      return "text-rose-800 bg-rose-50 border-rose-300";
  }
}

export const InternshipSummaryReportTemplate: React.FC<Props> = ({ summary }) => {
  const now = new Date();
  const reportDate = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      id={`internship-summary-report-${summary.internId}`}
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
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              NC
            </div>
            <span className="font-extrabold tracking-wider text-base text-slate-900 uppercase">
              NexCampus Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Hệ Thống Đào Tạo & Quản Lý Thực Tập Chuẩn Doanh Nghiệp
          </p>
        </div>
        <div className="text-right text-xs space-y-0.5 text-slate-600 font-mono">
          <div>
            Mẫu số: <span className="font-bold text-slate-800">08-TTTT/NC</span>
          </div>
          <div>
            Mã chứng nhận:{" "}
            <span className="font-bold text-slate-800">
              CERT-{summary.internCode}
            </span>
          </div>
          <div>
            Ngày cấp: <span className="text-slate-800">{reportDate}</span>
          </div>
        </div>
      </div>

      {/* ─── DOCUMENT TITLE ────────────────────────────────────────────────── */}
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          BẢNG TỔNG HỢP KẾT QUẢ & CHỨNG NHẬN THỰC TẬP
        </h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Official Internship Performance Transcript & Certificate of Completion
        </p>
        <div className="inline-block mt-1 px-4 py-1 bg-slate-100 rounded-full text-slate-700 font-semibold text-xs border border-slate-200">
          Kỳ Thực Tập: {summary.startDateFormatted} — {summary.endDateFormatted}
        </div>
      </div>

      {/* ─── SECTION 1: INTERN & SUPERVISOR INFORMATION ───────────────────── */}
      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
          <span>I. Thông Tin Thực Tập Sinh & Đơn Vị Công Tác</span>
          <span className="font-normal text-[11px] text-slate-500">
            Hồ sơ nhân sự thực tập
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          <div>
            <span className="text-slate-500 inline-block w-28">Họ và tên TTS:</span>
            <strong className="text-slate-900 text-sm">{summary.internName}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Người hướng dẫn:</span>
            <strong className="text-slate-800">{summary.leaderName}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Mã số TTS:</span>
            <span className="text-slate-700 font-mono font-bold">
              {summary.internCode}
            </span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Phòng ban:</span>
            <span className="text-slate-800 font-medium">
              {summary.departmentName}
            </span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Trường ĐH:</span>
            <span className="text-slate-800">{summary.university}</span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Vị trí thực tập:</span>
            <span className="text-slate-800 font-medium">
              {summary.positionName}
            </span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Chuyên ngành:</span>
            <span className="text-slate-800">{summary.major}</span>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-28">Trạng thái kỳ:</span>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {summary.finalStatusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: KEY PERFORMANCE INDICATORS (KPIs) ─────────────────── */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
          <span>II. Chỉ Số Hoàn Thành & Năng Lực Cốt Lõi</span>
          <span className="font-normal text-[11px] text-slate-500">
            Dữ liệu tổng hợp tự động từ hệ thống
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <div className="text-[11px] text-slate-500 uppercase font-medium">
              Điểm Đánh Giá TB
            </div>
            <div className="text-2xl font-black text-indigo-700 my-0.5">
              {summary.avgScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700">
              Xếp loại: <span className="text-indigo-600">{summary.finalGrade}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <div className="text-[11px] text-slate-500 uppercase font-medium">
              Công Việc Đã Xong
            </div>
            <div className="text-2xl font-black text-emerald-700 my-0.5">
              {summary.tasksCompleted}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {summary.tasksTotal}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              Tỷ lệ hoàn thành: <span className="font-bold">{summary.completionRate}%</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <div className="text-[11px] text-slate-500 uppercase font-medium">
              Báo Cáo Hàng Ngày
            </div>
            <div className="text-2xl font-black text-cyan-700 my-0.5">
              {summary.reportsTotal}
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              Chuyên cần & Kỷ luật
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
            <div className="text-[11px] text-slate-500 uppercase font-medium">
              Số Tuần Đánh Giá
            </div>
            <div className="text-2xl font-black text-amber-700 my-0.5">
              {summary.weeklyEvaluations?.length || 0}
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              Phiếu định kỳ
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: WEEKLY PERFORMANCE TRANSCRIPT ─────────────────────── */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
          <span>III. Bảng Điểm Đánh Giá Định Kỳ Các Tuần</span>
          <span className="font-normal text-[11px] text-slate-500">
            Chi tiết tiến độ và nhận xét của Leader
          </span>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-left font-semibold">
              <th className="border border-slate-300 px-3 py-2 w-14 text-center">Tuần</th>
              <th className="border border-slate-300 px-3 py-2 w-44">Thời Gian</th>
              <th className="border border-slate-300 px-3 py-2 w-20 text-center">Điểm</th>
              <th className="border border-slate-300 px-3 py-2 w-24 text-center">Xếp Loại</th>
              <th className="border border-slate-300 px-3 py-2">Nhận Xét Của Người Hướng Dẫn</th>
            </tr>
          </thead>
          <tbody>
            {summary.weeklyEvaluations && summary.weeklyEvaluations.length > 0 ? (
              summary.weeklyEvaluations.map((item) => (
                <tr key={item.week} className="hover:bg-slate-50/50">
                  <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-800">
                    W{item.week}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-600 text-[11px]">
                    {item.dateRange}
                  </td>
                  <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold text-indigo-700">
                    {item.score}
                  </td>
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getRatingBadge(
                        item.gradeCode
                      )}`}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-700 text-[12px]">
                    {item.comment}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border border-slate-300 px-3 py-4 text-center text-slate-400 italic"
                >
                  Chưa có dữ liệu đánh giá tuần nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── SECTION 4: SUPERVISOR CONCLUSION & RECOMMENDATIONS ───────────── */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3">
          IV. Đánh Giá Tổng Kết & Khuyến Nghị Từ Người Hướng Dẫn
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <div className="font-semibold text-slate-800 mb-1">
              1. Nhận xét chung về năng lực chuyên môn & thái độ làm việc:
            </div>
            <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 text-[12px] leading-relaxed">
              {summary.finalAssessmentLeader ||
                "Thực tập sinh thể hiện tinh thần học hỏi tích cực, hoàn thành tốt các nhiệm vụ được giao đúng tiến độ cam kết. Có kỹ năng tư duy giải quyết vấn đề tốt và phối hợp nhóm hiệu quả."}
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-800 mb-1">
              2. Định hướng phát triển & Khuyến nghị tuyển dụng:
            </div>
            <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 text-[12px] leading-relaxed">
              {summary.finalRecommendation ||
                "Đề xuất tiếp nhận thực tập sinh vào vị trí Junior Software Engineer chính thức sau khi tốt nghiệp. Tiếp tục trau dồi sâu hơn về kiến trúc phân tán và tối ưu hiệu năng."}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 5: SIGNATURES & VERIFICATION SEAL ────────────────────── */}
      <div className="pt-2 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          <div className="flex flex-col justify-between h-32">
            <div>
              <div className="font-bold uppercase text-slate-800 tracking-wide">
                Thực Tập Sinh
              </div>
              <div className="text-[11px] text-slate-500 italic mt-0.5">
                (Ký & ghi rõ họ tên)
              </div>
            </div>
            <div className="font-semibold text-slate-900 border-t border-dashed border-slate-300 pt-1 mx-4">
              {summary.internName}
            </div>
          </div>

          <div className="flex flex-col justify-between h-32">
            <div>
              <div className="font-bold uppercase text-slate-800 tracking-wide">
                Người Hướng Dẫn
              </div>
              <div className="text-[11px] text-slate-500 italic mt-0.5">
                (Xác nhận & ký tên)
              </div>
            </div>
            <div className="font-semibold text-slate-900 border-t border-dashed border-slate-300 pt-1 mx-4">
              {summary.leaderName}
            </div>
          </div>

          <div className="flex flex-col justify-between h-32">
            <div>
              <div className="font-bold uppercase text-slate-800 tracking-wide">
                Ban Quản Trị NexCampus
              </div>
              <div className="text-[11px] text-slate-500 italic mt-0.5">
                (Xác thực & đóng dấu điện tử)
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="inline-block px-2.5 py-0.5 rounded border border-indigo-400 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                ✓ VERIFIED BY NEXCAMPUS
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ID: {summary.internId.slice(0, 12)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
