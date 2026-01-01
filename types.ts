export interface VoyageLeg {
  id: string;
  no: number;
  dari: string;
  ke: string;

  // Bertolak (Departure)
  bertolak_tanggal: string;
  bertolak_jam: string; // "HH:mm"

  // Tiba (Arrival)
  tiba_tanggal: string;
  tiba_jam: string; // "HH:mm"

  // Lamanya Perjalanan
  durasi_hari: number;
  durasi_jam: string; // HH.mm format for display

  // Navigasi
  jarak: number; // NM (Total Distance - Col 11)
  jarak_full_away: number; // NM (Full Away Distance - Col 10)
  jarak_alur: number; // NM (Alur Distance)
  kecepatan: number; // Knots (Average Speed)
  putaran_mesin: string; // e.g. "420/430"

  // Berlabuh/Alur/Rede
  berlabuh_tgl_mulai: string;
  berlabuh_jam_mulai: string;
  berlabuh_tgl_selesai: string;
  berlabuh_jam_selesai: string;

  // Bongkar Muat (Page 2 & 3)
  pelabuhan_bm: string;
  kegiatan_bm: string;
  mulai_bm: string;
  selesai_bm: string;

  // Muatan (Cargo)
  muatan_dimuat: number | string;
  muatan_dibongkar: number | string;
  muatan_total: number | string; // Jumlah yang dikerjakan
  muatan_semua: number;

  // Bahan Bakar & Air (ROB - Remaining on Board)
  // Saat Tiba
  rob_tiba_fo: number;
  rob_tiba_fw: number;
  // Saat Bertolak
  rob_fo: number; // Fuel Oil
  rob_fw: number; // Fresh Water
  rob_ballast: number;
  perbekalan: number;

  // CALCULATED FIELD
  total_bobot: number; // Sum of Dimuat + ROBs + Terimas + Perbekalan

  // Terima (Bunkering/Refill)
  terima_fo: number | string;
  terima_fw: number | string;

  // Pemakaian (Consumption)
  pakai_fo: number;
  pakai_fw: number;

  // Sarat (Draft)
  draft_depan: number; // MK
  draft_belakang: number; // Blk

  // Penumpang
  pax_1a: number;
  pax_1b: number;
  pax_2a: number;
  pax_2b: number;
  pax_ekonomi: number;
  pax_total: number;
}

export const INITIAL_LEG: VoyageLeg = {
  id: "",
  no: 1,
  dari: "",
  ke: "",
  bertolak_tanggal: "",
  bertolak_jam: "",
  tiba_tanggal: "",
  tiba_jam: "",
  durasi_hari: 0,
  durasi_jam: "00.00",
  jarak: 0,
  jarak_full_away: 0,
  jarak_alur: 0,
  kecepatan: 0,
  putaran_mesin: "",
  berlabuh_tgl_mulai: "",
  berlabuh_jam_mulai: "",
  berlabuh_tgl_selesai: "",
  berlabuh_jam_selesai: "",
  pelabuhan_bm: "",
  kegiatan_bm: "-",
  mulai_bm: "",
  selesai_bm: "",
  muatan_dimuat: "-",
  muatan_dibongkar: "-",
  muatan_total: "-",
  muatan_semua: 0,
  rob_tiba_fo: 0,
  rob_tiba_fw: 0,
  rob_fo: 0,
  rob_fw: 0,
  rob_ballast: 0,
  perbekalan: 20,
  total_bobot: 0,
  terima_fo: "-",
  terima_fw: "-",
  pakai_fo: 0,
  pakai_fw: 0,
  draft_depan: 0,
  draft_belakang: 0,
  pax_1a: 0,
  pax_1b: 0,
  pax_2a: 0,
  pax_2b: 0,
  pax_ekonomi: 0,
  pax_total: 0,
};

export interface ReportHeader {
  // Basic ID
  nomor: string; // Voyage No
  tahun: string;

  // Ship Details (Col 1)
  kapal: string;
  type_kapal: string;
  dwt: string;
  service: string;

  // Voyage Details (Col 2)
  nama_nakhoda: string;
  nrp_nakhoda: string; // NEW: NRP Captain
  nama_mualim_1: string; // Unified Mualim 1
  nrp_mualim_1: string; // Unified NRP Mualim 1
  kode_trayek: string;
  ballast_space: string;
  mulai_perjalanan: string;
  akhir_perjalanan: string;

  // Company & Performance (Col 3)
  perusahaan: string;
  kecepatan_max: string; // Kecepatan (Knots) header info
  fo_consumption: string;
  fw_consumption: string;
  disp_penumpang: string;

  // Certificates & Surveys (Col 4)
  sert_keselamatan: string;
  special_survey: string;
  annual_survey: string;
  number_hatches: string;
  loa: string; // Length Over All

  // Legacy/Other
  keterangan: string;
  label_keterangan: string;
  catatan: string;

  // Images
  logoLeft: string;
  logoRight: string;

  // New Field
  callsign: string;
  isFirstEntry?: boolean;
  previousVoyageNumber?: string;
}

// --- NEW TYPES FOR PAGE 2 (CARGO & CREW) ---

export interface CargoActivity {
  id: string;
  pelabuhan: string;
  tanggal: string;
  mulai_tgl: string;
  mulai_jam: string;
  selesai_tgl: string;
  selesai_jam: string;
  jenis_kegiatan: string; // Muat / Bongkar
}

export interface CrewMember {
  jabatan: string;
  nama: string;
  nrp: string; // NEW: NRP Crew
  tanggal_ditempatkan?: string; // NEW: Date placed on ship
  tanggal_dipindahkan?: string; // NEW: Date transferred/moved
}

export interface SafetyData {
  // Sekoci
  sekoci_menurut_peraturan: string;
  sekoci_ada: string;
  rakit_menurut_peraturan: string;
  rakit_ada: string;

  // Latihan
  latihan_sekoci_tgl: string;
  latihan_kebakaran_tgl: string;

  // Kondisi Alat (Updated)
  pompa_hydran: string; // Renamed from pompa_lensa_darurat
  pemadam_api: string;
  saluran_hydran: string; // Renamed from saluran_lensa
  gasmasker: string;
  alat_oxygen: string;
  mes: string; // NEW: Marine Evacuation System
  pemeriksaan_tikus: string;
  kemudi_darurat: string;
  naik_dok_terakhir: string;

  // Service Terakhir (NEW)
  service_co2_system: string;
  service_apar_foam: string;
  service_apar_co2: string;
  service_apar_powder: string;

  // Signature Page 2
  mualim_1: string;
  nrp_mualim_1: string; // NEW: NRP Chief Officer
  jumlah_abk_total: string; // NEW: Total crew on board
}

export const INITIAL_SAFETY_DATA: SafetyData = {
  sekoci_menurut_peraturan: "",
  sekoci_ada: "",
  rakit_menurut_peraturan: "",
  rakit_ada: "",
  latihan_sekoci_tgl: "",
  latihan_kebakaran_tgl: "",

  pompa_hydran: "",
  pemadam_api: "",
  saluran_hydran: "",
  gasmasker: "",
  alat_oxygen: "",
  mes: "",
  pemeriksaan_tikus: "",
  kemudi_darurat: "",
  naik_dok_terakhir: "",

  service_co2_system: "",
  service_apar_foam: "",
  service_apar_co2: "",
  service_apar_powder: "",

  mualim_1: "",
  nrp_mualim_1: "",
  jumlah_abk_total: "",
};

export const DEFAULT_CREW_LIST: CrewMember[] = [
  { jabatan: "Nakhoda", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Mualim I", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Mualim II", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Mualim III", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Mualim IV", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "P.U.K", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Markonis", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "KKM", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Masinis I", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Masinis II", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Masinis III", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Masinis IV", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Perawat", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Jenang", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Serang", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Cadet Deck", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "Cadet Mesin", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
  { jabatan: "ABK lainnya", nama: "", nrp: "", tanggal_ditempatkan: "", tanggal_dipindahkan: "" },
];

// --- NEW TYPES FOR FRESH WATER REPORT ---

export interface FreshWaterEntry {
  id: string;
  no: number;
  pelabuhan: string;
  tanggal: string; // Format: "dd MMM yyyy"
  sisa_air_sebelum: number | string;
  jumlah_pengisian: number | string;
  penggunaan_air: number | string;
  pengisian_via: "KADE" | "MOBIL" | "TONGKANG" | "LAINNYA" | "";
  harga_per_ton: number | string;
  jumlah_harga: number | string; // Calculated
  port_time: string; // Jam
}

export interface FreshWaterData {
  entries: FreshWaterEntry[];

  // Header/Footer specific data
  kapasitas_total_tangki: number | string; // 825.5 TON
  sisa_air_dock: number | string;
  sisa_air_akhir: number | string; // NEW: Manual Input
  voyage_lalu_nomor: string; // NEW: Manual input for row III
  voyage_lalu_sisa_air: number | string; // NEW: Manual input for row III

  // Signatures
  nakhoda: string;
  nrp_nakhoda: string;
  mualim_1: string;
  nrp_mualim_1: string;

  // Date/Location of report
  tempat_laporan: string;
  tanggal_laporan: string;
}

export const INITIAL_FRESH_WATER_DATA: FreshWaterData = {
  entries: [],
  kapasitas_total_tangki: "",
  sisa_air_dock: "-",
  sisa_air_akhir: "",
  nakhoda: "",
  nrp_nakhoda: "",
  mualim_1: "",
  nrp_mualim_1: "",
  tempat_laporan: "",
  tanggal_laporan: "",
  voyage_lalu_nomor: "",
  voyage_lalu_sisa_air: "",
};

export interface SavedReport {
  id: string;
  name: string;
  lastModified: number;
  data: {
    legs: VoyageLeg[];
    header: ReportHeader;
    cargoLogs: CargoActivity[];
    safetyData: SafetyData;
    crewList: CrewMember[];
    freshWater: FreshWaterData; // Added freshWater field
  };
}
