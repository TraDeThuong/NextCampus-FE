"use client";

import { AssignmentDetail } from "@/types/stats";
import Table from "../ui/Table";
import { HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";
import useOutsideClick from "@/hooks/useOutsideClick";

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  assignments: AssignmentDetail[];
}

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  title,
  assignments,
}: TaskAssignmentModalProps) {
  const ref = useOutsideClick<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div
        ref={ref}
        className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/10 bg-card p-6 sm:p-8 shadow-glass backdrop-blur-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all cursor-pointer"
        >
          <HiXMark className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground metal-text">
            {title}
          </h2>
          <p className="text-xs text-muted mt-1">
            Hiển thị danh sách chi tiết công việc, thực tập sinh phụ trách và hạn chót ({assignments.length} mục)
          </p>
        </div>

        {/* Empty State vs Table */}
        {assignments.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-sm text-muted">Không có nhiệm vụ nào thuộc danh mục này.</p>
          </div>
        ) : (
          <Table columns="2fr 1.5fr 1.5fr 1fr 1fr">
            <Table.Header>
              <span>Nhiệm vụ / Task</span>
              <span>Thực Tập Sinh</span>
              <span>Leader Giao Việc</span>
              <span>Hạn Chót</span>
              <span>Trạng Thái</span>
            </Table.Header>

            <Table.Body
              data={assignments}
              render={(item) => (
                <Table.Row key={item.id}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {item.taskTitle}
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                        item.taskPriority === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.taskPriority === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      Ưu tiên: {item.taskPriority}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.internName}
                    </p>
                    <p className="text-xs text-muted/80">{item.internEmail}</p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground">{item.leaderName}</p>
                  </div>

                  <div>
                    {item.taskDeadline ? (
                      <span
                        className={`text-xs font-medium ${
                          item.isOverdue ? "text-rose-400 font-bold" : "text-muted"
                        }`}
                      >
                        {new Date(item.taskDeadline).toLocaleDateString("vi-VN")}
                        {item.isOverdue && (
                          <span className="block text-[10px] text-rose-400">
                            ⚠ Đã Quá Hạn
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Không giới hạn</span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        item.status === "PENDING_APPROVAL"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : item.status === "REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.status === "DONE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </Table.Row>
              )}
            />
          </Table>
        )}
      </div>
    </div>,
    document.body
  );
}
