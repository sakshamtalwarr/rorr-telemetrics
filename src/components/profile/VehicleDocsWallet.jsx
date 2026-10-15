import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Plus,
  X,
  ExternalLink,
  File,
  Image as ImageIcon,
  Printer,
  Sparkles,
  Bike,
  Loader2,
  Check,
} from "lucide-react";
import GlassCard from "../common/GlassCard";
import {
  getAllStoredDocuments,
  saveStoredDocument,
  deleteStoredDocument,
  processAndOptimizeFile,
} from "../../services/documentStorage";

// Official Saksham Talwar Vahan RC Data
export const OFFICIAL_BIKE_RC = {
  rc_regn_no: "DL8EV2219",
  rc_owner_name: "SAKSHAM TALWAR",
  rc_regn_dt: "24-Sep-2024",
  rc_chasi_no: "MD92P73R1RH850023",
  rc_eng_no: "BMRA73JHRA00012",
  rc_maker_desc: "OBEN ELECTRIC VEHICLES PVT LTD",
  rc_maker_model: "RORR",
  rc_vhclass_desc: "M-Cycle/Scooter(2WN)",
  rc_fuel_desc: "ELECTRIC(BOV)",
  rc_color: "ELECTRIC RED",
  rc_registered_at: "CENTRAL NORTH (WAZIRPUR), Delhi",
  rc_status: "ACTIVE",
  rc_insurance_comp: "ICICI Lombard General Insurance Co. Ltd.",
  rc_insurance_policy_no: "3005/360654870/00/000",
  rc_insurance_upto: "19-Sep-2029",
  rc_present_address:
    "B-41, THIRD FLOOR KUMHARO VAALI, ROAD UTTAM NAGAR INDRA PARK,, UTTAM NAGAR EAST NEAR PALI, West-110059",
  rc_mobile_no: "7217739614",
  rc_manu_month_yr: "8/2024",
  rc_tax_mode: "L (Lump Sum)",
  rc_body_type_desc: "SOLO WITH PILLION",
  // Standard Oben Rorr specs
  motor_kw: "8 kW Peak",
  battery_kwh: "4.4 kWh LFP",
  warranty_period: "3 Years / 50,000 km",
  warranty_upto: "23-Sep-2027",
};

export default function VehicleDocsWallet() {
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'official' | 'uploaded'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isRcModalOpen, setIsRcModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);

  // Upload Form states
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("Driving License (DL)");
  const [docExpiry, setDocExpiry] = useState("");
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Load documents from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    async function loadDocs() {
      try {
        const stored = await getAllStoredDocuments();
        if (!cancelled && Array.isArray(stored)) {
          setDocuments(stored);
        }
      } catch (e) {
        console.error("Failed to load vehicle documents:", e);
      }
    }
    loadDocs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock body scroll when any modal is open to keep view locked on modal
  useEffect(() => {
    const isAnyModalOpen =
      isUploadModalOpen ||
      isRcModalOpen ||
      isInsuranceModalOpen ||
      isWarrantyModalOpen ||
      !!previewDoc;

    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [
    isUploadModalOpen,
    isRcModalOpen,
    isInsuranceModalOpen,
    isWarrantyModalOpen,
    previewDoc,
  ]);

  // Process incoming file (from input change or drag & drop)
  const handleFileProcess = async (file) => {
    if (!file) return;

    setUploadError("");
    setIsProcessingFile(true);

    try {
      const processed = await processAndOptimizeFile(file);
      setFileData(processed.dataUrl);
      setFileName(processed.fileName);
      setFileType(processed.fileType);
      setFileSize(processed.fileSize);

      if (!docName.trim()) {
        const cleanName =
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setDocName(cleanName.replace(/[-_]/g, " "));
      }
    } catch (err) {
      console.error("File processing error:", err);
      setUploadError(err.message || "Failed to process selected file.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Submit upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileData || !docName.trim()) {
      setUploadError("Please select a file and enter a document name.");
      return;
    }

    setIsSaving(true);
    setUploadError("");

    const newDoc = {
      id: "doc_" + Date.now(),
      name: docName.trim(),
      category: docCategory,
      expiryDate: docExpiry || null,
      dataUrl: fileData,
      fileName,
      fileType,
      fileSize,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await saveStoredDocument(newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      setUploadSuccess(true);

      setTimeout(() => {
        // Reset form
        setDocName("");
        setDocCategory("Driving License (DL)");
        setDocExpiry("");
        setFileData(null);
        setFileName("");
        setFileType("");
        setFileSize(0);
        setUploadError("");
        setUploadSuccess(false);
        setIsUploadModalOpen(false);
      }, 600);
    } catch (err) {
      setUploadError(err.message || "Failed to save document.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Sample DL Preset
  const handleAddSampleDL = async () => {
    // Generate a clean SVG sample DL graphic
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e2230"/>
          <stop offset="100%" stop-color="#0d0e14"/>
        </linearGradient>
      </defs>
      <rect width="600" height="380" rx="20" fill="url(#bg)" stroke="#dc2626" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="50" rx="10" fill="#dc2626" fill-opacity="0.2"/>
      <text x="40" y="55" fill="#f87171" font-family="sans-serif" font-weight="900" font-size="16">TRANSPORT DEPARTMENT • GOVT OF NCT DELHI</text>
      <text x="40" y="70" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11">DRIVING LICENCE (FORM 7)</text>
      <rect x="40" y="95" width="110" height="140" rx="10" fill="#252a3d" stroke="#f87171" stroke-width="1"/>
      <text x="75" y="170" fill="#94a3b8" font-family="sans-serif" font-size="12">PHOTO</text>
      <text x="175" y="115" fill="#94a3b8" font-family="monospace" font-size="11">DL NO:</text>
      <text x="240" y="115" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="14">DL-0820240092182</text>
      <text x="175" y="145" fill="#94a3b8" font-family="sans-serif" font-size="11">NAME:</text>
      <text x="240" y="145" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">SAKSHAM TALWAR</text>
      <text x="175" y="175" fill="#94a3b8" font-family="sans-serif" font-size="11">CLASS:</text>
      <text x="240" y="175" fill="#4ade80" font-family="sans-serif" font-weight="bold" font-size="12">MCWG / LMV (PRIVATE)</text>
      <text x="175" y="205" fill="#94a3b8" font-family="sans-serif" font-size="11">VALIDITY:</text>
      <text x="240" y="205" fill="#facc15" font-family="sans-serif" font-weight="bold" font-size="12">15-OCT-2044 (ACTIVE)</text>
      <text x="40" y="270" fill="#94a3b8" font-family="sans-serif" font-size="11">ADDRESS: B-41, KUMHARO VAALI RD, UTTAM NAGAR, NEW DELHI - 110059</text>
      <rect x="40" y="295" width="520" height="1" fill="#dc2626" fill-opacity="0.3"/>
      <text x="40" y="325" fill="#4ade80" font-family="sans-serif" font-weight="bold" font-size="12">✓ CHIP EMBEDDED SMART CARD • SARATHI VERIFIED</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
    const sampleDoc = {
      id: "doc_sample_dl_" + Date.now(),
      name: "Saksham Talwar Driving License (DL)",
      category: "Driving License (DL)",
      expiryDate: "2044-10-15",
      dataUrl,
      fileName: "Saksham_Talwar_DL.svg",
      fileType: "image/svg+xml",
      fileSize: 1840,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await saveStoredDocument(sampleDoc);
      setDocuments((prev) => [sampleDoc, ...prev]);
      setActiveTab("uploaded");
    } catch (err) {
      alert("Failed to save sample: " + err.message);
    }
  };

  // Delete document
  const handleDeleteDoc = async (id) => {
    if (window.confirm("Delete this document from your vehicle wallet?")) {
      try {
        await deleteStoredDocument(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (previewDoc?.id === id) {
          setPreviewDoc(null);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // Download document
  const handleDownload = (doc) => {
    const link = document.createElement("a");
    link.href = doc.dataUrl;
    link.download = doc.fileName || `${doc.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format date
  const formatDateStr = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Days remaining for warranty (till 23-Sep-2027)
  const calculateDaysRemaining = () => {
    try {
      const target = new Date("2027-09-23T23:59:59");
      const now = new Date();
      const diffMs = target - now;
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  const warrantyDays = calculateDaysRemaining();
  const warrantyYears = (warrantyDays / 365).toFixed(1);

  return (
    <div className="space-y-6">
      {/* =========================================================
          SECTION HEADER WITH ACTION BUTTONS
      ========================================================= */}
      <GlassCard variant="default" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-950/40">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Vehicle Documents & Identity Wallet</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    Offline Saved
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Government Vahan RC, ICICI Lombard Insurance, 3-Yr Warranty & your uploaded DL, PUC, and service records.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddSampleDL}
              className="
                px-3.5 py-2.5 rounded-2xl
                bg-black/40 hover:bg-black/60 border border-white/10
                text-slate-300 hover:text-white
                font-bold text-xs uppercase tracking-wider transition-all
                flex items-center gap-1.5
              "
              title="Add a sample verified DL card for Saksham Talwar to test preview & download"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample DL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadError("");
                setIsUploadModalOpen(true);
              }}
              className="
                px-4 py-2.5 rounded-2xl
                clay-button-primary
                flex items-center gap-2
                font-bold text-xs uppercase tracking-wider
                text-white transition-all shadow-lg
              "
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-red-500/10">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
              ${
                activeTab === "all"
                  ? "bg-red-500 text-white shadow-md shadow-red-900/50"
                  : "bg-black/30 text-slate-400 hover:text-white border border-white/5"
              }
            `}
          >
            All Items ({3 + documents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("official")}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
              ${
                activeTab === "official"
                  ? "bg-red-500 text-white shadow-md shadow-red-900/50"
                  : "bg-black/30 text-slate-400 hover:text-white border border-white/5"
              }
            `}
          >
            Official Cards (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("uploaded")}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
              ${
                activeTab === "uploaded"
                  ? "bg-red-500 text-white shadow-md shadow-red-900/50"
                  : "bg-black/30 text-slate-400 hover:text-white border border-white/5"
              }
            `}
          >
            My Uploads ({documents.length})
          </button>
        </div>
      </GlassCard>

      {/* =========================================================
          OFFICIAL PRE-LOADED DIGITAL CARDS
      ========================================================= */}
      {(activeTab === "all" || activeTab === "official") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Official RC Digital Smart Card */}
          <GlassCard
            variant="red"
            className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-red-400/50"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    <Bike className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-200/80 block font-bold">
                      Ministry of Road Transport
                    </span>
                    <h4 className="font-black text-white text-sm">Digital RC Certificate</h4>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold">
                  ACTIVE
                </span>
              </div>

              {/* License Plate Graphic */}
              <div className="p-3 rounded-2xl bg-black/50 border border-red-400/20 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Registration No</span>
                  <span className="text-[10px] font-bold text-red-300">NCT of Delhi</span>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white mt-0.5">
                  {OFFICIAL_BIKE_RC.rc_regn_no}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Owner:</span>
                  <span className="font-bold text-white uppercase">{OFFICIAL_BIKE_RC.rc_owner_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Vehicle:</span>
                  <span className="font-bold text-white">Oben Rorr ({OFFICIAL_BIKE_RC.motor_kw})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Registered:</span>
                  <span className="font-mono text-slate-200">{OFFICIAL_BIKE_RC.rc_regn_dt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-red-200/70">RTO:</span>
                  <span className="text-slate-200 truncate max-w-[170px]" title={OFFICIAL_BIKE_RC.rc_registered_at}>
                    Central North (Wazirpur)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsRcModalOpen(true)}
                className="
                  w-full py-2.5 px-3 rounded-xl
                  bg-black/50 hover:bg-black/70 border border-red-400/30
                  text-white font-bold text-xs
                  flex items-center justify-center gap-2 transition-all
                "
              >
                <Eye className="w-3.5 h-3.5 text-red-300" />
                <span>View Full RC Smart Card</span>
              </button>
            </div>
          </GlassCard>

          {/* 2. ICICI Lombard Motor Insurance */}
          <GlassCard
            variant="wine"
            className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-red-400/50"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-200/80 block font-bold">
                      ICICI Lombard General
                    </span>
                    <h4 className="font-black text-white text-sm">EV Motor Insurance</h4>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold">
                  VALID TILL 2029
                </span>
              </div>

              {/* Policy Number Pill */}
              <div className="p-3 rounded-2xl bg-black/50 border border-red-500/20 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Policy Number</span>
                  <span className="text-[10px] font-bold text-emerald-400">5-Yr Long Term</span>
                </div>
                <div className="text-sm font-mono font-bold tracking-tight text-white mt-1 truncate">
                  {OFFICIAL_BIKE_RC.rc_insurance_policy_no}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Insured:</span>
                  <span className="font-bold text-white uppercase">{OFFICIAL_BIKE_RC.rc_owner_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Vehicle Plate:</span>
                  <span className="font-mono font-bold text-white">{OFFICIAL_BIKE_RC.rc_regn_no}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-red-200/70">Valid Upto:</span>
                  <span className="font-mono font-bold text-emerald-300">{OFFICIAL_BIKE_RC.rc_insurance_upto}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-red-200/70">Coverage:</span>
                  <span className="text-slate-200">OD + 5-Yr Third Party Cover</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsInsuranceModalOpen(true)}
                className="
                  w-full py-2.5 px-3 rounded-xl
                  bg-black/50 hover:bg-black/70 border border-red-400/30
                  text-white font-bold text-xs
                  flex items-center justify-center gap-2 transition-all
                "
              >
                <Eye className="w-3.5 h-3.5 text-red-300" />
                <span>View Insurance Details</span>
              </button>
            </div>
          </GlassCard>

          {/* 3. Official Oben Rorr 3-Year Powertrain Warranty */}
          <GlassCard
            variant="default"
            className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-red-400/50"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-red-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                      Oben Care Warranty
                    </span>
                    <h4 className="font-black text-white text-sm">3-Year Factory Warranty</h4>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold">
                  {warrantyYears} Yrs Left
                </span>
              </div>

              {/* Warranty Coverage Pill */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Coverage Term</span>
                  <span className="text-[10px] font-bold text-amber-400">Original Rorr</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  3 Years / 50,000 km
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">8 kW Motor & 4.4 kWh LFP Battery</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="font-mono text-slate-200">{OFFICIAL_BIKE_RC.rc_regn_dt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Expiry Date:</span>
                  <span className="font-mono font-bold text-amber-300">{OFFICIAL_BIKE_RC.warranty_upto}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Chassis (VIN):</span>
                  <span className="font-mono text-slate-200">{OFFICIAL_BIKE_RC.rc_chasi_no.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Roadside RSA:</span>
                  <span className="font-bold text-emerald-400">Included 24x7</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsWarrantyModalOpen(true)}
                className="
                  w-full py-2.5 px-3 rounded-xl
                  bg-black/40 hover:bg-black/60 border border-white/10
                  text-white font-bold text-xs
                  flex items-center justify-center gap-2 transition-all
                "
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>View Warranty Terms</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* =========================================================
          USER UPLOADED DOCUMENTS SECTION
      ========================================================= */}
      {(activeTab === "all" || activeTab === "uploaded") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Uploaded Documents & Scans</span>
              <span className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300">
                {documents.length} Files
              </span>
            </h4>

            {documents.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUploadError("");
                  setIsUploadModalOpen(true);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Document</span>
              </button>
            )}
          </div>

          {documents.length === 0 ? (
            <GlassCard variant="default" className="p-8 text-center border-dashed border-red-500/20">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center text-red-400">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">No documents uploaded yet</h4>
                <p className="text-xs text-slate-400">
                  Upload your Driving License (DL), physical RC scan, PUC certificate, service receipts, or insurance endorsements. They are stored securely offline in your browser.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError("");
                      setIsUploadModalOpen(true);
                    }}
                    className="
                      px-5 py-2.5 rounded-2xl
                      clay-button-primary
                      font-bold text-xs uppercase tracking-wider text-white
                      inline-flex items-center gap-2
                    "
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Driving License or RC</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSampleDL}
                    className="
                      px-4 py-2.5 rounded-2xl
                      bg-black/40 hover:bg-black/60 border border-white/10
                      font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white
                      inline-flex items-center gap-1.5
                    "
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate Sample DL</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const isImage =
                  doc.fileType?.startsWith("image/") ||
                  doc.dataUrl?.startsWith("data:image/");
                return (
                  <GlassCard
                    key={doc.id}
                    variant="default"
                    className="p-4 flex flex-col justify-between group hover:border-red-500/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-red-400 flex-shrink-0">
                            {isImage ? (
                              <ImageIcon className="w-5 h-5 text-red-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-sm truncate" title={doc.name}>
                              {doc.name}
                            </h5>
                            <span className="inline-block px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-300 mt-0.5">
                              {doc.category}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail Preview if image */}
                      {isImage && (
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          className="w-full h-28 rounded-xl overflow-hidden bg-black/40 border border-white/5 cursor-pointer relative group/thumb"
                        >
                          <img
                            src={doc.dataUrl}
                            alt={doc.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                        <div className="flex justify-between">
                          <span>Uploaded:</span>
                          <span className="font-mono text-slate-300">{formatDateStr(doc.uploadedAt)}</span>
                        </div>
                        {doc.fileSize > 0 && (
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="font-mono text-slate-300">{formatBytes(doc.fileSize)}</span>
                          </div>
                        )}
                        {doc.expiryDate && (
                          <div className="flex justify-between">
                            <span>Valid Till:</span>
                            <span className="font-mono font-bold text-amber-300">{formatDateStr(doc.expiryDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="
                          flex-1 py-1.5 px-2.5 rounded-xl
                          bg-black/40 hover:bg-black/60 border border-white/10
                          text-white font-bold text-xs
                          flex items-center justify-center gap-1.5 transition-all
                        "
                      >
                        <Eye className="w-3 h-3 text-red-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="
                          p-2 rounded-xl
                          bg-black/40 hover:bg-black/60 border border-white/10
                          text-slate-300 hover:text-white transition-all
                        "
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          UPLOAD DOCUMENT MODAL (PORTALED DIRECTLY TO BODY)
      ========================================================= */}
      {isUploadModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsUploadModalOpen(false);
            }}
          >
            <div className="w-full max-w-lg clay-card-carbon rounded-3xl p-6 border border-red-500/30 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Upload Vehicle Document</h3>
                    <p className="text-xs text-slate-400">Add DL, RC scan, bills, or warranty endorsements</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Document Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Document Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:border-red-500 outline-none"
                  >
                    <option value="Driving License (DL)">Driving License (DL)</option>
                    <option value="Registration Certificate (RC Scan)">Registration Certificate (RC Scan)</option>
                    <option value="Vehicle Insurance Copy">Vehicle Insurance Copy</option>
                    <option value="Pollution / Green Pass (PUC)">Pollution / Green Pass (PUC)</option>
                    <option value="Service / Maintenance Bill">Service / Maintenance Bill</option>
                    <option value="Roadside Assistance (RSA)">Roadside Assistance (RSA)</option>
                    <option value="Warranty Endorsement">Warranty Endorsement</option>
                    <option value="Other Document">Other Document</option>
                  </select>
                </div>

                {/* Document Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Document Name / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saksham DL Front & Back or Oben 1st Service"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:border-red-500 outline-none"
                    required
                  />
                </div>

                {/* Expiry Date (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Validity / Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:border-red-500 outline-none"
                  />
                </div>

                {/* File Dropzone with Standard Accessible Label */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Choose File (Image or PDF)
                  </span>

                  <input
                    id="wallet-doc-file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                  />

                  <label
                    htmlFor="wallet-doc-file-input"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      block p-6 rounded-2xl border-2 border-dashed
                      cursor-pointer transition-all text-center
                      ${
                        isDragging
                          ? "border-red-400 bg-red-950/40 scale-[1.01]"
                          : fileName
                          ? "border-emerald-500/50 bg-black/40"
                          : "border-red-500/30 hover:border-red-500/70 bg-black/30"
                      }
                    `}
                  >
                    {isProcessingFile ? (
                      <div className="py-2 space-y-2">
                        <Loader2 className="w-8 h-8 text-red-400 mx-auto animate-spin" />
                        <p className="text-xs font-bold text-white">Compressing & preparing file...</p>
                      </div>
                    ) : fileName ? (
                      <div className="py-1 space-y-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-xs mx-auto">{fileName}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">
                          {formatBytes(fileSize)} • Optimized & Ready
                        </p>
                        <p className="text-[10px] text-slate-400 underline pt-1">Click to replace file</p>
                      </div>
                    ) : (
                      <div className="py-1 space-y-1">
                        <Upload className="w-8 h-8 text-red-400 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-white">Click to browse or take photo / drag & drop</p>
                        <p className="text-[10px] text-slate-400">
                          Supports photos (camera/gallery) and PDFs. Auto-compressed for instant speed.
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Document saved successfully to your wallet!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!fileData || isSaving || isProcessingFile}
                    className="
                      px-5 py-2.5 rounded-xl
                      clay-button-primary
                      text-white text-xs font-bold uppercase tracking-wider
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-1.5
                    "
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save to Wallet</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          FULL DIGITAL RC SMART CARD MODAL (PORTALED DIRECTLY TO BODY)
      ========================================================= */}
      {isRcModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsRcModalOpen(false);
            }}
          >
            <div className="w-full max-w-2xl clay-card-hero-red rounded-3xl p-6 sm:p-8 border border-red-400/40 shadow-2xl relative space-y-6 my-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/15">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-400/30 text-[10px] font-mono font-bold text-red-200">
                      GOVERNMENT OF NCT OF DELHI
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-400/30 text-[10px] font-mono font-bold text-emerald-300">
                      TRANSPORT DEPARTMENT
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-1">
                    CERTIFICATE OF REGISTRATION (SMART CARD RC)
                  </h3>
                  <p className="text-xs text-red-100/80">FORM 23A • Motor Vehicles Act, 1988</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRcModalOpen(false)}
                  className="p-2 rounded-xl text-white/70 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Smart Card Visual Representation */}
              <div className="p-6 rounded-3xl bg-black/60 border border-red-400/30 shadow-inner backdrop-blur-md space-y-6">
                {/* Top Row: Chip + Plate + Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Gold SIM / Smart Card Chip Icon */}
                    <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                      <div className="w-full h-full rounded border border-amber-800/40 grid grid-cols-2 grid-rows-3 gap-0.5 p-1 bg-amber-400/60">
                        <div className="border-r border-b border-amber-900/30" />
                        <div className="border-b border-amber-900/30" />
                        <div className="border-r border-b border-amber-900/30" />
                        <div className="border-b border-amber-900/30" />
                        <div className="border-r border-amber-900/30" />
                        <div />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Smart Card ID</span>
                      <p className="text-xs font-mono font-bold text-white">DL-8-2024-EV002219</p>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 border border-red-400/50 shadow-lg text-center">
                    <span className="text-[9px] font-mono font-bold text-white/80 block uppercase">Registration Mark</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-white">
                      {OFFICIAL_BIKE_RC.rc_regn_no}
                    </span>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Registered Owner</span>
                    <p className="text-sm font-black text-white">{OFFICIAL_BIKE_RC.rc_owner_name}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Registration Date</span>
                    <p className="text-sm font-black text-white">{OFFICIAL_BIKE_RC.rc_regn_dt}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Chassis Number (VIN)</span>
                    <p className="text-sm font-mono font-bold text-red-300">{OFFICIAL_BIKE_RC.rc_chasi_no}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Motor Number</span>
                    <p className="text-sm font-mono font-bold text-red-300">{OFFICIAL_BIKE_RC.rc_eng_no}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Maker & Model</span>
                    <p className="text-xs font-bold text-white">{OFFICIAL_BIKE_RC.rc_maker_desc}</p>
                    <p className="text-xs text-red-300 font-bold">MODEL: {OFFICIAL_BIKE_RC.rc_maker_model} (ELECTRIC RED)</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Powertrain Specs</span>
                    <p className="text-xs font-bold text-white">{OFFICIAL_BIKE_RC.motor_kw} Motor • {OFFICIAL_BIKE_RC.battery_kwh} Battery</p>
                    <p className="text-xs text-emerald-400 font-mono">BOV Electric • Class 2WN</p>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Registered Address</span>
                    <p className="text-xs font-medium text-slate-200">{OFFICIAL_BIKE_RC.rc_present_address}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Registering Authority (RTO)</span>
                    <p className="text-xs font-bold text-white">{OFFICIAL_BIKE_RC.rc_registered_at}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Tax & Status</span>
                    <p className="text-xs font-bold text-emerald-400">Status: {OFFICIAL_BIKE_RC.rc_status} • Tax: {OFFICIAL_BIKE_RC.rc_tax_mode}</p>
                  </div>
                </div>

                {/* Bottom Vahan Seal */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Vahan National Register Database Verified</span>
                  </div>
                  <span className="font-mono text-slate-500">Mfg: {OFFICIAL_BIKE_RC.rc_manu_month_yr}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/10 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRcModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          ICICI LOMBARD INSURANCE MODAL (PORTALED DIRECTLY TO BODY)
      ========================================================= */}
      {isInsuranceModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsInsuranceModalOpen(false);
            }}
          >
            <div className="w-full max-w-lg clay-card-wine rounded-3xl p-6 sm:p-7 border border-red-500/30 shadow-2xl relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">ICICI Lombard Policy Details</h3>
                    <p className="text-xs text-red-200/80">Comprehensive 2-Wheeler EV Protection</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInsuranceModalOpen(false)}
                  className="p-2 rounded-xl text-white/70 hover:text-white bg-black/30 hover:bg-black/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Policy Number</span>
                  <p className="text-base font-mono font-black text-emerald-300">{OFFICIAL_BIKE_RC.rc_insurance_policy_no}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Insurer</span>
                    <p className="text-xs font-bold text-white">{OFFICIAL_BIKE_RC.rc_insurance_comp}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Validity Period</span>
                    <p className="text-xs font-mono font-black text-emerald-400">Valid till {OFFICIAL_BIKE_RC.rc_insurance_upto}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Policy Scope</span>
                  <ul className="space-y-1.5 text-slate-200 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Own Damage (OD) Cover for Oben Rorr Electric</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>5-Year Mandatory Third-Party Liability Cover</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Electric Battery & Motor Hazard Protection</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsInsuranceModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          OBEN 3-YEAR WARRANTY DETAILS MODAL (PORTALED DIRECTLY TO BODY)
      ========================================================= */}
      {isWarrantyModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsWarrantyModalOpen(false);
            }}
          >
            <div className="w-full max-w-lg clay-card-hero-red rounded-3xl p-6 sm:p-7 border border-red-500/30 shadow-2xl relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Oben Rorr 3-Year Warranty</h3>
                    <p className="text-xs text-red-200/80">Official Powertrain Coverage Breakdown</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWarrantyModalOpen(false)}
                  className="p-2 rounded-xl text-white/70 hover:text-white bg-black/30 hover:bg-black/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Coverage Duration</span>
                    <span className="text-[10px] font-bold text-amber-400">{warrantyDays} Days Left</span>
                  </div>
                  <p className="text-base font-black text-white">3 Years or 50,000 Kilometers</p>
                  <p className="text-[10px] text-red-200/80">Valid: 24-Sep-2024 to 23-Sep-2027</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Protected Components</span>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-xs">8 kW Peak IPMSM Mid-Drive Motor</p>
                        <p className="text-[10px] text-slate-300">Covers motor windings, rotor, shaft bearings, and controller drive circuitry.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-xs">4.4 kWh LFP High Thermal Safety Pack</p>
                        <p className="text-[10px] text-slate-300">Guarantees state of health (SoH), cell internal resistance, and battery management system (BMS).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-xs">24x7 Roadside Assistance (RSA)</p>
                        <p className="text-[10px] text-slate-300">Towing and emergency on-road technical assistance across Delhi NCR and India.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsWarrantyModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          GENERIC PREVIEW MODAL FOR USER UPLOADED FILES (PORTALED DIRECTLY TO BODY)
      ========================================================= */}
      {previewDoc &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewDoc(null);
            }}
          >
            <div className="w-full max-w-3xl clay-card-carbon rounded-3xl p-6 border border-red-500/30 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-black text-white text-base truncate max-w-md">{previewDoc.name}</h3>
                  <p className="text-xs text-red-300">{previewDoc.category} • Uploaded on {formatDateStr(previewDoc.uploadedAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto rounded-2xl bg-black/60 p-4 border border-white/5 flex items-center justify-center min-h-[300px]">
                {previewDoc.fileType?.startsWith("image/") || previewDoc.dataUrl?.startsWith("data:image/") ? (
                  <img
                    src={previewDoc.dataUrl}
                    alt={previewDoc.name}
                    className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <FileText className="w-16 h-16 text-red-400 mx-auto" />
                    <p className="text-sm font-bold text-white">{previewDoc.fileName}</p>
                    <p className="text-xs text-slate-400">PDF document preview</p>
                    <a
                      href={previewDoc.dataUrl}
                      download={previewDoc.fileName}
                      className="
                        inline-flex items-center gap-2 px-4 py-2 rounded-xl
                        clay-button-primary text-white text-xs font-bold
                      "
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF to View</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
