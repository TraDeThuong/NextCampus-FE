// | Cột                | Ý nghĩa                                |
// | ------------------ | -------------------------------------- |
// | Candidate          | Họ tên hoặc email                      |
// | Department         | Phòng ban ứng tuyển                    |
// | Position           | Vị trí ứng tuyển                       |
// | Invite Status      | `ACTIVE`, `USED`, `EXPIRED`, `REVOKED` |
// | Application Status | `PENDING`, `APPROVED`, `REJECTED`      |
// | Start Date         | Ngày bắt đầu thực tập                  |
// | Submitted At       | Ngày nộp đơn                           |
// | Actions            | Menu ba chấm                           |


// | Trạng thái        | Action                  | Mô tả                                                       |
// | ----------------- | ----------------------- | ----------------------------------------------------------- |
// | `ACTIVE`          | **View details**        | Xem thông tin lời mời: email, ngày tạo, ngày hết hạn.       |
// |                   | **Revoke invite**       | Thu hồi lời mời, chuyển trạng thái sang `REVOKED`.          |
// | `USED + PENDING`  | **View application**    | Xem chi tiết đơn ứng tuyển của intern.                      |
// |                   | **Approve application** | Duyệt đơn, tạo tài khoản `INTERN` và hồ sơ intern.          |
// |                   | **Reject application**  | Từ chối đơn ứng tuyển.                                      |
// | `USED + APPROVED` | **View application**    | Xem thông tin đơn đã được duyệt và tài khoản intern đã tạo. |
// | `USED + REJECTED` | **View application**    | Xem lại đơn đã bị từ chối.                                  |
// |                   | **Delete application**  | Xóa mềm đơn ứng tuyển đã bị từ chối.                        |
// | `EXPIRED`         | **View details**        | Xem thông tin lời mời đã hết hạn.                           |
// | `REVOKED`         | **View details**        | Xem thông tin lời mời đã bị admin thu hồi.                  |


"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useApplicationInvites } from "@/hooks/application/useApplicationInvites";
import type { GetApplicationInvitesParams } from "@/types/application";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import OnboardingRow from "./OnboardingRow";

const COLUMNS =
  "minmax(180px,2fr) minmax(110px,1fr) minmax(110px,1fr) 110px 100px 100px 40px";

export default function OnboardingTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params: GetApplicationInvitesParams = useMemo(() => {
    const p: GetApplicationInvitesParams = {};
    const email = searchParams.get("email");
    const inviteStatus = searchParams.get("inviteStatus");
    const applicationStatus = searchParams.get("applicationStatus");
    const department = searchParams.get("department");
    const position = searchParams.get("position");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (email) p.email = email;
    if (inviteStatus)
      p.inviteStatus =
        inviteStatus as GetApplicationInvitesParams["inviteStatus"];
    if (applicationStatus)
      p.applicationStatus =
        applicationStatus as GetApplicationInvitesParams["applicationStatus"];
    if (department) p.department = department;
    if (position) p.position = position;
    if (page) p.page = Number(page);
    if (limit) p.limit = Number(limit);

    return p;
  }, [searchParams]);

  const { data, isPending } = useApplicationInvites(params);

  const invites = data?.data ?? [];
  const meta = data?.meta;

  function goToPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  }

  if (isPending) {
    return (
      <MetalCard className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  return (
    <Modal>
      <Table
        columns={COLUMNS}
        className="
          bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
          shadow-[0_12px_40px_rgba(0,0,0,.45)]
          hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
          transition-shadow duration-500
        "
      >
        <Table.Header>
          <div>Candidate</div>
          <div>Department</div>
          <div>Position</div>
          <div>Invite</div>
          <div>App</div>
          <div>Sent</div>
          <div />
        </Table.Header>

        <Table.Body
          data={invites}
          render={(invite) => (
            <OnboardingRow key={invite.id} invite={invite} />
          )}
        />

        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <div className="flex w-full items-center justify-between gap-4 text-sm">
              <p className="text-muted">
                Page {meta.page} of {meta.totalPages} &middot; {meta.total}{" "}
                total
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => goToPage(meta.page - 1)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Table.Footer>
        )}
      </Table>
    </Modal>
  );
}
