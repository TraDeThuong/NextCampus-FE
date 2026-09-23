"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  Clock,
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  Search,
  Check,
} from "lucide-react";

import {
  verifyInviteService,
  getApplicationAttachmentPutUrl,
  createApplicationService,
} from "@/services/application.service";
import { getActiveRegulationService } from "@/services/regulation.service";
import {
  APPLICATION_PREFERRED_DEPARTMENTS,
  getApplicationPreferredPositions,
} from "@/constants/application-preferences";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";

const BUSINESS_TIME_ZONE = "Asia/Ho_Chi_Minh";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const VIETNAMESE_PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;

const POPULAR_UNIVERSITIES = [
  "Đại học Bách Khoa - ĐHQG TP.HCM",
  "Đại học Bách Khoa Hà Nội",
  "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
  "Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
  "Đại học Quốc tế - ĐHQG TP.HCM",
  "Đại học Kinh tế TP.HCM (UEH)",
  "Đại học Ngoại thương (FTU)",
  "Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)",
  "Đại học FPT",
  "Học viện Bưu chính Viễn thông (PTIT)",
  "Đại học Công nghiệp TP.HCM (IUH)",
  "Đại học Tôn Đức Thắng (TDTU)",
  "Đại học Cần Thơ",
  "Đại học Đà Nẵng",
  "Khác / Ngoài danh sách",
];

function getBusinessToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100, "Tối đa 100 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().trim().regex(VIETNAMESE_PHONE_REGEX, "Số điện thoại không đúng định dạng Việt Nam (10 chữ số)"),
  university: z.string().trim().min(2, "Vui lòng nhập hoặc chọn trường đại học"),
  major: z.string().trim().optional(),
  preferredDepartment: z.string().min(1, "Vui lòng chọn phòng ban mong muốn"),
  preferredPosition: z.string().min(1, "Vui lòng chọn vị trí mong muốn"),
  startDate: z
    .string()
    .min(1, "Vui lòng chọn ngày bắt đầu thực tập")
    .refine((value) => parseDateOnly(value) !== null, {
      message: "Định dạng ngày không hợp lệ (YYYY-MM-DD)",
    })
    .refine(
      (value) => {
        const d = parseDateOnly(value);
        return !d || value >= getBusinessToday();
      },
      { message: "Ngày bắt đầu không được trong quá khứ" }
    )
    .refine((value) => {
      const date = parseDateOnly(value);
      return !date || ![0, 6].includes(date.getUTCDay());
    }, "Ngày bắt đầu không được là Thứ Bảy hoặc Chủ Nhật"),
  duration: z
    .number({ message: "Thời gian phải là số nguyên" })
    .int("Thời gian phải là số nguyên")
    .min(1, "Tối thiểu 1 tháng")
    .max(12, "Tối đa 12 tháng"),
  acceptedRegulations: z.boolean().refine((val) => val === true, {
    message: "Bạn bắt buộc phải đồng ý với nội quy thực tập để nộp đơn",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface UploadedCvInfo {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  publicUrl: string;
}

export default function OnboardingPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token ?? "";

  // Verification state
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  // Upload CV state
  const [cvFile, setCvFile] = useState<UploadedCvInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Regulation modal state
  const [regulationContent, setRegulationContent] = useState<string | null>(null);
  const [regulationVersion, setRegulationVersion] = useState<string | null>(null);
  const [regulationId, setRegulationId] = useState<string | undefined>(undefined);
  const [isLoadingRegulation, setIsLoadingRegulation] = useState(false);
  const [showRegulationModal, setShowRegulationModal] = useState(false);

  // Searchable university state
  const [uniSearch, setUniSearch] = useState("");
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const uniContainerRef = useRef<HTMLDivElement>(null);

  // Submission state
  const [, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      university: "",
      major: "",
      preferredDepartment: "",
      preferredPosition: "",
      startDate: "",
      duration: 3,
      acceptedRegulations: false,
    },
  });

  const selectedDepartment = watch("preferredDepartment");
  const selectedUniversity = watch("university");

  // Step 1: Verify token on mount
  useEffect(() => {
    if (!token) {
      setVerificationError("Mã lời mời không tồn tại hoặc đường dẫn không hợp lệ.");
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    verifyInviteService(token)
      .then((res) => {
        if (res.success && res.data.valid) {
          setInviteEmail(res.data.email);
          setValue("email", res.data.email);
          setVerificationError(null);
        } else {
          setVerificationError("Lời mời không hợp lệ hoặc đã được sử dụng.");
        }
      })
      .catch((err: unknown) => {
        let errorMsg = "Lời mời không hợp lệ hoặc đã hết hạn.";
        if (axios.isAxiosError(err)) {
          const code = err.response?.data?.code || err.response?.data?.errorCode;
          if (code === "TOKEN_USED") {
            errorMsg = "Liên kết lời mời này đã được sử dụng để nộp hồ sơ trước đó.";
          } else if (code === "TOKEN_EXPIRED") {
            errorMsg = "Liên kết lời mời này đã hết hạn (quá 7 ngày).";
          } else if (code === "TOKEN_REVOKED") {
            errorMsg = "Liên kết lời mời này đã bị hủy bỏ bởi Quản trị viên.";
          } else if (err.response?.data?.message) {
            errorMsg = err.response.data.message;
          }
        }
        setVerificationError(errorMsg);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token, setValue]);

  // Close university dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (uniContainerRef.current && !uniContainerRef.current.contains(e.target as Node)) {
        setShowUniDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch regulation for reading
  const openRegulationModal = async () => {
    setShowRegulationModal(true);
    if (regulationContent) return;

    setIsLoadingRegulation(true);
    try {
      const res = await getActiveRegulationService();
      if (res.data) {
        setRegulationContent(res.data.content);
        setRegulationVersion(String(res.data.version));
        setRegulationId(res.data.id);
      }
    } catch {
      toast.error("Không thể tải nội dung quy định thực tập.");
    } finally {
      setIsLoadingRegulation(false);
    }
  };

  // Upload CV handler directly to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Chỉ chấp nhận file định dạng .pdf, .doc, .docx");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Dung lượng file tối đa là 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get presigned upload URL from Backend v2
      const urlRes = await getApplicationAttachmentPutUrl(token, file.name, file.type || "application/pdf");
      const { uploadUrl, key, publicUrl } = urlRes.data;

      // 2. Upload directly to Cloudflare R2 via HTTP PUT with progress tracking
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const percent = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percent);
        },
      });

      setCvFile({
        fileName: file.name,
        filePath: key || urlRes.data.fileKey,
        mimeType: file.type || "application/pdf",
        fileSize: file.size,
        publicUrl: publicUrl || uploadUrl.split("?")[0],
      });

      toast.success("Tải lên CV thành công!");
    } catch (err: unknown) {
      console.error("[Onboarding] Upload CV error:", err);
      toast.error("Tải lên CV thất bại. Vui lòng thử lại!");
      setCvFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Application
  const onSubmit = async (values: FormValues) => {
    if (!cvFile) {
      toast.error("Vui lòng tải lên CV của bạn trước khi nộp hồ sơ");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: inviteEmail || values.email,
        phone: values.phone,
        university: values.university,
        major: values.major || undefined,
        preferredDepartment: values.preferredDepartment,
        preferredPosition: values.preferredPosition,
        startDate: values.startDate,
        duration: values.duration,
        token,
        acceptedRegulations: values.acceptedRegulations,
        regulationId,
        cvUrl: cvFile.publicUrl,
        uploadedFiles: [
          {
            fileName: cvFile.fileName,
            filePath: cvFile.filePath,
            mimeType: cvFile.mimeType,
            fileSize: cvFile.fileSize,
          },
        ],
      };

      const res = await createApplicationService(payload);
      if (res.success) {
        toast.success("Nộp hồ sơ ứng tuyển thành công!");
        startTransition(() => {
          router.push(`/onboarding/${token}/success`);
        });
      }
    } catch (err: unknown) {
      console.error("[Onboarding] Submit error:", err);
      let errorMsg = "Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại!";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render: Loading token verification
  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1020]/80 px-6 py-4 text-slate-300 shadow-2xl backdrop-blur-xl">
          <Spinner size="sm" />
          <span className="text-sm font-medium">Đang xác thực liên kết lời mời...</span>
        </div>
      </div>
    );
  }

  // Render: Token Invalid / Expired / Used
  if (verificationError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <MetalCard className="max-w-md w-full p-6 text-center border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">Liên kết không khả dụng</h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{verificationError}</p>
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs text-slate-400 text-left space-y-1">
            <p className="font-semibold text-slate-300">Gợi ý xử lý:</p>
            <p>• Nếu bạn đã nộp hồ sơ, vui lòng kiểm tra hộp thư email để nhận kết quả phê duyệt.</p>
            <p>• Nếu liên kết bị hết hạn, vui lòng liên hệ bộ phận Tuyển dụng để được cấp liên kết mới.</p>
          </div>
        </MetalCard>
      </div>
    );
  }

  const positions = selectedDepartment
    ? getApplicationPreferredPositions(selectedDepartment)
    : [];

  const filteredUnis = POPULAR_UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(uniSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl px-4 py-12 mx-auto space-y-6">
      {/* Header with standard icon and heading alignment */}
      <MetalCard className="p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 shrink-0 text-cyan-400" />
              <h1 className="text-2xl font-bold metal-text md:text-3xl">
                Hồ Sơ Tiếp Nhận Ứng Viên
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Chào mừng bạn đến với chương trình Thực tập sinh tại NexCampus. Vui lòng hoàn tất biểu mẫu thông tin và đính kèm CV để chúng tôi chuẩn bị lộ trình tốt nhất cho bạn.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 shrink-0 self-start sm:self-center">
            NexCampus Onboarding v2
          </div>
        </div>
      </MetalCard>

      {/* Main Application Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <MetalCard className="p-6 md:p-8 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white uppercase tracking-wider text-xs">
              1. Thông tin cá nhân & Liên hệ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Họ và tên đầy đủ <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register("fullName")}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 ${
                    errors.fullName ? "border-rose-500/50" : "border-white/10"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email (Readonly from invite) */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Email nhận thư mời <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="email"
                  value={inviteEmail}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Email được đồng bộ chính xác từ lời mời tuyển dụng.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Số điện thoại (Việt Nam) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="tel"
                  placeholder="0987654321"
                  {...register("phone")}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 ${
                    errors.phone ? "border-rose-500/50" : "border-white/10"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone.message}
                </p>
              )}
            </div>

            {/* University (Searchable Dropdown) */}
            <div className="relative" ref={uniContainerRef}>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Trường Đại học / Cao đẳng <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm hoặc nhập tên trường..."
                  value={selectedUniversity}
                  onChange={(e) => {
                    setValue("university", e.target.value, { shouldValidate: true });
                    setUniSearch(e.target.value);
                    setShowUniDropdown(true);
                  }}
                  onFocus={() => {
                    setUniSearch(selectedUniversity || "");
                    setShowUniDropdown(true);
                  }}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 ${
                    errors.university ? "border-rose-500/50" : "border-white/10"
                  }`}
                />
              </div>

              {showUniDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0B1020]/95 p-1 shadow-2xl backdrop-blur-xl scrollbar-thin scrollbar-thumb-white/10">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-white/5 flex items-center gap-2">
                    <Search className="h-3 w-3" /> Gợi ý trường phổ biến:
                  </div>
                  {filteredUnis.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400">
                      Sử dụng tên: &quot;<span className="text-white font-medium">{uniSearch}</span>&quot;
                    </div>
                  ) : (
                    filteredUnis.map((uni) => (
                      <button
                        key={uni}
                        type="button"
                        onClick={() => {
                          setValue("university", uni, { shouldValidate: true });
                          setShowUniDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition hover:bg-white/10 ${
                          selectedUniversity === uni ? "bg-cyan-500/10 text-cyan-300 font-medium" : "text-slate-300"
                        }`}
                      >
                        <span className="truncate">{uni}</span>
                        {selectedUniversity === uni && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              )}

              {errors.university && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.university.message}
                </p>
              )}
            </div>

            {/* Major */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Chuyên ngành đào tạo
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Ví dụ: Khoa học máy tính, Kỹ thuật phần mềm, Marketing..."
                  {...register("major")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>
        </MetalCard>

        {/* Section 2: Preferred Department & Position */}
        <MetalCard className="p-6 md:p-8 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white uppercase tracking-wider text-xs">
              2. Định hướng & Kế hoạch Thực tập
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Preferred Department */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Phòng ban mong muốn <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <select
                  {...register("preferredDepartment")}
                  onChange={(e) => {
                    setValue("preferredDepartment", e.target.value, { shouldValidate: true });
                    setValue("preferredPosition", "");
                  }}
                  className={`w-full appearance-none rounded-xl border bg-[#0B1020] py-2.5 pl-10 pr-8 text-sm text-white outline-none transition focus:border-cyan-400/50 ${
                    errors.preferredDepartment ? "border-rose-500/50" : "border-white/10"
                  }`}
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {APPLICATION_PREFERRED_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.preferredDepartment && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.preferredDepartment.message}
                </p>
              )}
            </div>

            {/* Preferred Position */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Vị trí mong muốn <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <select
                  {...register("preferredPosition")}
                  disabled={!selectedDepartment}
                  className={`w-full appearance-none rounded-xl border bg-[#0B1020] py-2.5 pl-10 pr-8 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.preferredPosition ? "border-rose-500/50" : "border-white/10"
                  }`}
                >
                  <option value="">
                    {!selectedDepartment ? "-- Chọn phòng ban trước --" : "-- Chọn vị trí --"}
                  </option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              {errors.preferredPosition && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.preferredPosition.message}
                </p>
              )}
            </div>

            {/* Start Date (Weekend + Past Date blocked) */}
            <div>
              <DatePicker
                label="Ngày bắt đầu dự kiến"
                required
                value={watch("startDate")}
                minDate={getBusinessToday()}
                onChange={(d) => {
                  setValue("startDate", d, { shouldValidate: true });
                }}
                onClear={() => {
                  setValue("startDate", "", { shouldValidate: true });
                }}
                error={errors.startDate?.message}
                helperText="Lưu ý: Không được chọn ngày trong quá khứ và không chọn Thứ Bảy / Chủ Nhật."
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Thời gian thực tập (tháng)
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={12}
                  {...register("duration", { valueAsNumber: true })}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 ${
                    errors.duration ? "border-rose-500/50" : "border-white/10"
                  }`}
                />
              </div>
              {errors.duration && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.duration.message}
                </p>
              )}
            </div>
          </div>
        </MetalCard>

        {/* Section 3: CV Upload directly to Cloudflare R2 */}
        <MetalCard className="p-6 md:p-8 space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white uppercase tracking-wider text-xs">
              3. Tải lên CV Ứng Tuyển
            </h2>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!cvFile && !isUploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-400/50 transition cursor-pointer text-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition duration-300">
                <FileUp className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Nhấp để chọn file hoặc kéo thả CV vào đây
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hỗ trợ định dạng PDF, DOC, DOCX (Dung lượng tối đa 10MB)
              </p>
            </div>
          )}

          {/* Uploading progress bar */}
          {isUploading && (
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  Đang tải CV trực tiếp lên máy chủ bảo mật R2...
                </span>
                <span className="font-bold text-cyan-300">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Uploaded File preview */}
          {cvFile && !isUploading && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-6 w-6 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {cvFile.fileName}
                  </p>
                  <p className="text-xs text-emerald-300/80">
                    {(cvFile.fileSize / (1024 * 1024)).toFixed(2)} MB • Đã tải lên thành công
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg border border-white/10 hover:bg-white/10 transition"
                >
                  Đổi file
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCv}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10"
                  title="Xóa CV"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </MetalCard>

        {/* Section 4: Regulations acceptance */}
        <MetalCard className="p-6 md:p-8 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("acceptedRegulations")}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-500 accent-cyan-500 focus:ring-cyan-400/50"
            />
            <div className="text-xs text-slate-300 leading-relaxed">
              Tôi xác nhận thông tin cung cấp là hoàn toàn chính xác, đồng thời đã đọc và cam kết tuân thủ{" "}
              <button
                type="button"
                onClick={openRegulationModal}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Nội quy Thực tập sinh của NexCampus
              </button>{" "}
              <span className="text-rose-400">*</span>
            </div>
          </label>
          {errors.acceptedRegulations && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.acceptedRegulations.message}
            </p>
          )}
        </MetalCard>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || isUploading || !cvFile}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold shadow-[0_0_30px_rgba(21,174,245,0.3)] hover:shadow-[0_0_40px_rgba(21,174,245,0.5)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý hồ sơ...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Xác nhận nộp hồ sơ ứng tuyển
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Regulation Modal */}
      {showRegulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-2xl w-full max-h-[85vh] flex flex-col rounded-3xl border border-white/10 bg-[#0B1020] text-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Nội Quy & Quy Định Thực Tập</h3>
                  {regulationVersion && (
                    <span className="text-[11px] text-cyan-300">Phiên bản {regulationVersion}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowRegulationModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-300 leading-relaxed space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {isLoadingRegulation ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : regulationContent ? (
                <div
                  className="prose prose-invert max-w-none text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: regulationContent }}
                />
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-white">Các quy định chung dành cho TTS:</p>
                  <p>1. Nghiêm túc chấp hành thời gian làm việc và báo cáo tiến độ hàng ngày (Daily Report) đúng giờ.</p>
                  <p>2. Bảo mật tuyệt đối mã nguồn, cơ sở dữ liệu và thông tin khách hàng của công ty.</p>
                  <p>3. Tích cực tham gia các buổi đánh giá tuần (Weekly Evaluation) cùng người hướng dẫn.</p>
                  <p>4. Tôn trọng đồng nghiệp và văn hóa làm việc minh bạch, cởi mở.</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-6 py-4 flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setValue("acceptedRegulations", true, { shouldValidate: true });
                  setShowRegulationModal(false);
                }}
              >
                Tôi đã đọc & Đồng ý
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}