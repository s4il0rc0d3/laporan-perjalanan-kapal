import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { VoyageEntryForm } from './components/VoyageEntryForm';
import { ReportTable } from './components/ReportTable';
import { CargoPageForm } from './components/CargoPageForm';
import { FreshWaterForm } from './components/FreshWaterForm';
import { FreshWaterReport } from './components/FreshWaterReport';
import { VoyageLeg, ReportHeader, CargoActivity, SafetyData, CrewMember, INITIAL_SAFETY_DATA, DEFAULT_CREW_LIST, SavedReport, FreshWaterData, INITIAL_FRESH_WATER_DATA } from './types';
import { Printer, Ship, FileText, Trash2, Settings, Save, Upload, Copy, X, Check, Users, Plus, Eye, ZoomIn, ZoomOut, RotateCcw, Archive, FolderOpen, FileDown, Droplets, Loader2, FileSpreadsheet } from 'lucide-react';
import pelniLogo from './assets/Logo2.png';

// FIX: Component moved OUTSIDE of App to prevent re-rendering/focus loss on every keystroke
interface SettingsInputProps {
    label: string;
    value: string;
    field: keyof ReportHeader;
    onUpdate: (field: keyof ReportHeader, val: string) => void;
    placeholder?: string;
    type?: string;
}
const SettingsInput: React.FC<SettingsInputProps> = ({ label, value, field, onUpdate, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-slate-400 mb-1 text-xs">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onUpdate(field, e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-white text-xs focus:border-blue-500 outline-none uppercase"
            placeholder={placeholder}
        />
    </div>
);

const SettingsTextArea: React.FC<SettingsInputProps> = ({ label, value, field, onUpdate, placeholder }) => (
    <div className="md:col-span-2">
        <label className="block text-slate-400 mb-1 text-xs">{label}</label>
        <textarea
            value={value}
            onChange={e => onUpdate(field, e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs focus:border-blue-500 outline-none h-20 resize-none font-sans uppercase"
            placeholder={placeholder}
        />
    </div>
);

const INITIAL_HEADER: ReportHeader = {
    nomor: '',
    tahun: '',

    // Default Ship Data
    kapal: '',
    type_kapal: '',
    dwt: '',
    service: '',

    nama_nakhoda: '',
    nrp_nakhoda: '',
    nama_mualim_1: '',
    nrp_mualim_1: '',
    kode_trayek: '',
    ballast_space: '',
    mulai_perjalanan: '',
    akhir_perjalanan: '',

    perusahaan: '',
    kecepatan_max: '',
    fo_consumption: '',
    fw_consumption: '',
    disp_penumpang: '',

    sert_keselamatan: '',
    special_survey: '',
    annual_survey: '',
    number_hatches: '',
    loa: '',

    keterangan: '',
    label_keterangan: 'Jelaskan dengan singkat ttg: Kerusakan, berhenti karena Kamar Mesin, pembuatan Kisah Kapal, lain2 hal, keadaan angin, cuaca, laut, pada waktu berlabuh, keadaan dalamnya air di berting-beting.',
    catatan: '',

    logoLeft: '',
    logoRight: '',
    callsign: '',
    isFirstEntry: true,
    previousVoyageNumber: ''
};

const EMPTY_HEADER: ReportHeader = {
    nomor: '',
    tahun: '',
    kapal: '',
    type_kapal: '',
    dwt: '',
    service: '',
    nama_nakhoda: '',
    nrp_nakhoda: '',
    nama_mualim_1: '',
    nrp_mualim_1: '',
    kode_trayek: '',
    ballast_space: '',
    mulai_perjalanan: '',
    akhir_perjalanan: '',
    perusahaan: '',
    kecepatan_max: '',
    fo_consumption: '',
    fw_consumption: '',
    disp_penumpang: '',
    sert_keselamatan: '',
    special_survey: '',
    annual_survey: '',
    number_hatches: '',
    loa: '',
    keterangan: '',
    label_keterangan: 'Jelaskan dengan singkat ttg: Kerusakan, berhenti karena Kamar Mesin, pembuatan Kisah Kapal, lain2 hal, keadaan angin, cuaca, laut, pada waktu berlabuh, keadaan dalamnya air di berting-beting.',
    catatan: '',
    logoLeft: '',
    logoRight: '',
    callsign: '',
    isFirstEntry: true,
    previousVoyageNumber: ''
};

const App: React.FC = () => {
    const [view, setView] = useState<'form' | 'report' | 'cargo_form' | 'freshwater_form'>('form'); // Views state updated
    const [legs, setLegs] = useState<VoyageLeg[]>([]);
    const [editingLeg, setEditingLeg] = useState<VoyageLeg | null>(null);

    // State for Page 2 Data
    const [cargoLogs, setCargoLogs] = useState<CargoActivity[]>([]);
    const [safetyData, setSafetyData] = useState<SafetyData>(INITIAL_SAFETY_DATA);
    const [crewList, setCrewList] = useState<CrewMember[]>(DEFAULT_CREW_LIST);

    // State for Freshwater Report
    const [freshWaterData, setFreshWaterData] = useState<FreshWaterData>(INITIAL_FRESH_WATER_DATA);

    const [header, setHeader] = useState<ReportHeader>(INITIAL_HEADER);

    const [showSettings, setShowSettings] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(0.8); // Default zoom slightly smaller to fit

    // Saved Reports Management
    const [showReportManager, setShowReportManager] = useState(false);
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [showExportManager, setShowExportManager] = useState(false);
    const [activeReportId, setActiveReportId] = useState<string | null>(null);

    // Ref for measuring report height for zoom container
    const reportRef = useRef<HTMLDivElement>(null);
    const [reportHeight, setReportHeight] = useState(0);

    // Print Management
    const [printMode, setPrintMode] = useState<'voyage' | 'freshwater'>('voyage');
    const [showPrintMenu, setShowPrintMenu] = useState(false);

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveName, setSaveName] = useState('');

    const handlePrint = (mode: 'voyage' | 'freshwater') => {
        setPrintMode(mode);
        // Wait for state update to reflect in DOM before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // Load saved reports from local storage
    useEffect(() => {
        const storedReports = localStorage.getItem('pelaut_saved_reports');
        if (storedReports) {
            setSavedReports(JSON.parse(storedReports));
        }
    }, []);

    // Save saved reports to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('pelaut_saved_reports', JSON.stringify(savedReports));
    }, [savedReports]);

    const handleSaveReport = () => {
        const defaultName = `Voyage ${header.nomor || 'Unknown'} - ${header.kapal}`;
        setSaveName(defaultName);
        setShowSaveModal(true);
    };

    const confirmSaveReport = () => {
        if (saveName) {
            const newReport: SavedReport = {
                id: Date.now().toString(),
                name: saveName,
                lastModified: Date.now(),
                data: {
                    legs,
                    header,
                    cargoLogs,
                    safetyData,
                    crewList,
                    freshWater: freshWaterData
                }
            };
            setSavedReports([newReport, ...savedReports]);
            setActiveReportId(newReport.id);
            setShowSaveModal(false);
            alert("Laporan berhasil disimpan!");
        }
    };

    const handleLoadReport = (report: SavedReport) => {
        if (window.confirm(`Apakah Anda yakin ingin membuka laporan "${report.name}"? Data yang sedang dikerjakan saat ini akan ditimpa.`)) {
            setActiveReportId(report.id);
            setLegs(report.data.legs);
            setHeader(report.data.header);
            setCargoLogs(report.data.cargoLogs);
            setSafetyData(report.data.safetyData);
            setCrewList(report.data.crewList);
            if (report.data.freshWater) {
                setFreshWaterData(report.data.freshWater);
            } else {
                setFreshWaterData(INITIAL_FRESH_WATER_DATA);
            }
            setShowReportManager(false);
        }
    };

    const handleDeleteSavedReport = (id: string) => {
        if (window.confirm("Hapus laporan tersimpan ini?")) {
            setSavedReports(savedReports.filter(r => r.id !== id));
        }
    };

    // Load from local storage
    useEffect(() => {
        const savedLegs = localStorage.getItem('pelaut_legs');
        const savedHeader = localStorage.getItem('pelaut_header');
        const savedCargo = localStorage.getItem('pelaut_cargo');
        const savedSafety = localStorage.getItem('pelaut_safety');
        const savedCrew = localStorage.getItem('pelaut_crew');
        const savedFreshWater = localStorage.getItem('pelaut_freshwater');

        if (savedLegs) setLegs(JSON.parse(savedLegs));
        if (savedCargo) setCargoLogs(JSON.parse(savedCargo));
        if (savedSafety) setSafetyData(JSON.parse(savedSafety));
        if (savedFreshWater) setFreshWaterData(JSON.parse(savedFreshWater));

        if (savedCrew) {
            let parsed = JSON.parse(savedCrew);
            // FIX: Remove duplicate 'Cadet Deck' if present in saved data
            let foundCadet = false;
            parsed = parsed.filter((c: any) => {
                if (c.jabatan === 'Cadet Deck') {
                    if (foundCadet) return false; // Skip subsequent Cadet Deck
                    foundCadet = true;
                }
                return true;
            });
            setCrewList(parsed);
        }

        if (savedHeader) {
            const parsedHeader = JSON.parse(savedHeader);
            setHeader(prev => ({
                ...prev,
                ...parsedHeader,
                // Defaults for new fields if not in local storage
                type_kapal: parsedHeader.type_kapal || prev.type_kapal,
                dwt: parsedHeader.dwt || prev.dwt,
                service: parsedHeader.service || prev.service,
                kode_trayek: parsedHeader.kode_trayek || prev.kode_trayek,
                ballast_space: parsedHeader.ballast_space || prev.ballast_space,
                mulai_perjalanan: parsedHeader.mulai_perjalanan || prev.mulai_perjalanan,
                akhir_perjalanan: parsedHeader.akhir_perjalanan || prev.akhir_perjalanan,
                perusahaan: parsedHeader.perusahaan || prev.perusahaan,
                kecepatan_max: parsedHeader.kecepatan_max || prev.kecepatan_max,
                fo_consumption: parsedHeader.fo_consumption || prev.fo_consumption,
                fw_consumption: parsedHeader.fw_consumption || prev.fw_consumption,
                disp_penumpang: parsedHeader.disp_penumpang || prev.disp_penumpang,
                sert_keselamatan: parsedHeader.sert_keselamatan || prev.sert_keselamatan,
                special_survey: parsedHeader.special_survey || prev.special_survey,
                annual_survey: parsedHeader.annual_survey || prev.annual_survey,
                number_hatches: parsedHeader.number_hatches || prev.number_hatches,
                loa: parsedHeader.loa || prev.loa,
                nrp_nakhoda: parsedHeader.nrp_nakhoda || prev.nrp_nakhoda,
                nama_mualim_1: parsedHeader.nama_mualim_1 || prev.nama_mualim_1,
                nrp_mualim_1: parsedHeader.nrp_mualim_1 || prev.nrp_mualim_1,

                logoLeft: parsedHeader.logoLeft || '',
                logoRight: parsedHeader.logoRight || ''
            }));
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('pelaut_legs', JSON.stringify(legs));
        localStorage.setItem('pelaut_header', JSON.stringify(header));
        localStorage.setItem('pelaut_cargo', JSON.stringify(cargoLogs));
        localStorage.setItem('pelaut_safety', JSON.stringify(safetyData));
        localStorage.setItem('pelaut_crew', JSON.stringify(crewList));
        localStorage.setItem('pelaut_freshwater', JSON.stringify(freshWaterData));
    }, [legs, header, cargoLogs, safetyData, crewList, freshWaterData]);

    // Measure report height whenever data or zoom changes
    useLayoutEffect(() => {
        if (reportRef.current) {
            setReportHeight(reportRef.current.offsetHeight);
        }
    }, [legs, header, cargoLogs, safetyData, crewList, freshWaterData, showPreview]);

    // Sync Nakhoda & Mualim 1 from Header to Crew List & Safety Data
    useEffect(() => {
        setCrewList(prev => {
            const newList = [...prev];
            // Assuming index 0 is Nakhoda and index 1 is Mualim I (based on DEFAULT_CREW_LIST)
            let changed = false;

            if (newList.length > 0 && newList[0].jabatan === 'Nakhoda') {
                if (newList[0].nama !== header.nama_nakhoda || newList[0].nrp !== header.nrp_nakhoda) {
                    newList[0] = { ...newList[0], nama: header.nama_nakhoda, nrp: header.nrp_nakhoda };
                    changed = true;
                }
            }

            if (newList.length > 1 && newList[1].jabatan === 'Mualim I') {
                if (newList[1].nama !== header.nama_mualim_1 || newList[1].nrp !== header.nrp_mualim_1) {
                    newList[1] = { ...newList[1], nama: header.nama_mualim_1, nrp: header.nrp_mualim_1 };
                    changed = true;
                }
            }

            return changed ? newList : prev;
        });

        // Also sync to SafetyData which currently holds Mualim 1 signature (legacy field, keeping in sync)
        setSafetyData(prev => {
            if (prev.mualim_1 !== header.nama_mualim_1 || prev.nrp_mualim_1 !== header.nrp_mualim_1) {
                return {
                    ...prev,
                    mualim_1: header.nama_mualim_1,
                    nrp_mualim_1: header.nrp_mualim_1
                };
            }
            return prev;
        });
    }, [header.nama_nakhoda, header.nrp_nakhoda, header.nama_mualim_1, header.nrp_mualim_1]);

    const handleAddLeg = (leg: VoyageLeg) => {
        setLegs([...legs, leg]);
    };

    const handleUpdateLeg = (updatedLeg: VoyageLeg) => {
        setLegs(legs.map(l => l.id === updatedLeg.id ? updatedLeg : l));
        setEditingLeg(null);
    };

    const handleDeleteLeg = (id: string) => {
        if (window.confirm('Hapus baris data ini?')) {
            setLegs(legs.filter(l => l.id !== id));
        }
    };

    const handleEditRequest = (leg: VoyageLeg) => {
        setEditingLeg(leg);
        setView('form');
    };

    const clearAllData = () => {
        if (!window.confirm("PERINGATAN: Anda akan menghapus SEMUA data laporan (Voyage, Bongkar Muat, Awak Kapal, Air Tawar).\n\nLanjutkan?")) return;

        let newFreshWaterData = INITIAL_FRESH_WATER_DATA;
        let newHeader = { ...INITIAL_HEADER, isFirstEntry: true };
        let continueFromPrev = false;

        // Smart "Next Voyage" Logic
        if (savedReports.length > 0) {
            if (window.confirm("Ditemukan laporan tersimpan.\nApakah Anda ingin melanjutkan dari laporan terakhir (Voyage Baru)?\n\n[OK] = Gunakan Data Akhir Voyage Sebelumnya (Sisa Air Tawar & Info Kapal)\n[Cancel] = Reset Total (Kosong)")) {
                continueFromPrev = true;
                const lastReport = savedReports[0];

                // 1. Calculate previous remaining fresh water
                const lastFW = lastReport.data.freshWater;
                let sisaAkhirLast = 0;
                if (lastFW) {
                    const sisaAwalLast = lastFW.entries.length > 0 ? Number(lastFW.entries[0].sisa_air_sebelum) : 0;
                    const totalTerima = lastFW.entries.reduce((sum, e) => sum + Number(e.jumlah_pengisian), 0);
                    const totalPakai = lastFW.entries.reduce((sum, e) => sum + Number(e.penggunaan_air), 0);
                    sisaAkhirLast = sisaAwalLast + totalTerima - totalPakai;
                }

                // 2. Pre-fill FreshWaterData
                newFreshWaterData = {
                    ...INITIAL_FRESH_WATER_DATA,
                    kapasitas_total_tangki: lastFW?.kapasitas_total_tangki || '',
                    sisa_air_dock: lastFW?.sisa_air_dock || '-',
                    entries: [{
                        id: Date.now().toString(),
                        no: 1,
                        pelabuhan: '',
                        tanggal: '', // User must fill date
                        sisa_air_sebelum: Number(sisaAkhirLast.toFixed(2)), // Carry over value
                        jumlah_pengisian: '',
                        penggunaan_air: '',
                        pengisian_via: 'KADE',
                        harga_per_ton: '',
                        jumlah_harga: '',
                        port_time: ''
                    }]
                };

                // 3. Keep static header info
                newHeader = {
                    ...INITIAL_HEADER,
                    isFirstEntry: false,
                    previousVoyageNumber: lastReport.data.header.nomor,
                    kapal: lastReport.data.header.kapal,
                    callsign: lastReport.data.header.callsign,
                    type_kapal: lastReport.data.header.type_kapal,
                    dwt: lastReport.data.header.dwt,
                    service: lastReport.data.header.service,
                    perusahaan: lastReport.data.header.perusahaan,
                    nama_nakhoda: lastReport.data.header.nama_nakhoda,
                    nrp_nakhoda: lastReport.data.header.nrp_nakhoda,
                    nama_mualim_1: lastReport.data.header.nama_mualim_1,
                    nrp_mualim_1: lastReport.data.header.nrp_mualim_1,
                    logoLeft: lastReport.data.header.logoLeft,
                    logoRight: lastReport.data.header.logoRight
                };
            }
        }

        setLegs([]);
        localStorage.removeItem('pelaut_legs');

        setCargoLogs([]);
        localStorage.removeItem('pelaut_cargo');

        setSafetyData(INITIAL_SAFETY_DATA);
        localStorage.removeItem('pelaut_safety');

        setCrewList(DEFAULT_CREW_LIST);
        localStorage.removeItem('pelaut_crew');

        setFreshWaterData(newFreshWaterData);
        setHeader(newHeader);
        setActiveReportId(null);
        setShowSettings(false);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeader(prev => ({
                    ...prev,
                    [side === 'left' ? 'logoLeft' : 'logoRight']: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const updateHeaderField = (field: keyof ReportHeader, val: string) => {
        // Automatically capitalize all text fields
        const value = typeof val === 'string' ? val.toUpperCase() : val;
        setHeader(prev => ({ ...prev, [field]: value }));
    };

    // Dynamic width class based on view
    const mainContainerClass = "flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full";

    return (
        <>
            {/* Main App UI (Hidden on Print) */}
            <div className="min-h-screen bg-slate-100 flex flex-col print:hidden">
                {/* Navbar / Controls */}
                <div className="bg-slate-900 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                            <img src={pelniLogo} alt="Pelni Logo" className="h-[32px] w-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">Laporan Perjalanan Kapal</h1>
                            <p className="text-[10px] text-slate-400">Voyage Report</p>
                        </div>
                    </div>

                    {/* Middle Group: Input Navigation */}
                    <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
                        <button
                            onClick={() => setView('form')}
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'form' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            <Plus size={16} /> Input LPK
                        </button>
                        <button
                            onClick={() => setView('cargo_form')}
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'cargo_form' ? 'bg-yellow-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            <Users size={16} /> Input Crew
                        </button>
                        <button
                            onClick={() => setView('freshwater_form')}
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'freshwater_form' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            <Droplets size={16} /> Input Air Tawar
                        </button>
                    </div>

                    {/* Right Group: Settings & Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (activeReportId) {
                                    // Overwrite functionality
                                    if (window.confirm("Simpan perubahan pada laporan yang sedang aktif?")) {
                                        const updatedReports = savedReports.map(r => {
                                            if (r.id === activeReportId) {
                                                return {
                                                    ...r,
                                                    lastModified: Date.now(),
                                                    data: {
                                                        legs,
                                                        header,
                                                        cargoLogs,
                                                        safetyData,
                                                        crewList,
                                                        freshWater: freshWaterData
                                                    }
                                                };
                                            }
                                            return r;
                                        });
                                        setSavedReports(updatedReports);
                                        alert("Laporan berhasil diperbarui!");
                                    }
                                } else {
                                    // Save As New
                                    handleSaveReport();
                                }
                            }}
                            className="p-2 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
                            title={activeReportId ? "Simpan Perubahan (Overwrite)" : "Simpan Laporan Baru"}
                        >
                            <Save size={20} className={activeReportId ? "text-green-400" : ""} />
                        </button>

                        {/* Saved Reports Button */}
                        <button
                            onClick={() => setShowReportManager(true)}
                            className="p-2 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
                            title="Buka Arsip Laporan"
                        >
                            <FolderOpen size={20} />
                        </button>

                        {/* Preview Button */}
                        <button
                            onClick={() => setShowPreview(true)}
                            className="p-2 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
                            title="Lihat Preview Laporan"
                        >
                            <Eye size={20} />
                        </button>

                        <div className="h-6 w-px bg-slate-700 mx-1"></div>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors"
                            title="Pengaturan Header"
                        >
                            <Settings size={20} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowPrintMenu(!showPrintMenu)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-transform hover:scale-105 ml-2"
                            >
                                <Printer size={18} /> Cetak / PDF
                            </button>

                            {/* Print Dropdown Menu */}
                            {showPrintMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200 overflow-hidden">
                                    <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Laporan</h3>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                handlePrint('voyage');
                                                setShowPrintMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3 group"
                                        >
                                            <div className="bg-blue-600/20 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                                                <Ship size={18} className="text-blue-400 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">Laporan Perjalanan</p>
                                                <p className="text-[10px] text-slate-400">Hal 1-3 (Landscape)</p>
                                            </div>
                                        </button>

                                        <div className="h-px bg-slate-700 mx-2 my-1"></div>

                                        <button
                                            onClick={() => {
                                                handlePrint('freshwater');
                                                setShowPrintMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3 group"
                                        >
                                            <div className="bg-teal-600/20 p-2 rounded-lg group-hover:bg-teal-600 transition-colors">
                                                <Droplets size={18} className="text-teal-400 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">Laporan Air Tawar</p>
                                                <p className="text-[10px] text-slate-400">Hal 4 (Portrait)</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Click outside listener could be added here or simplified by just button toggle */}
                            {showPrintMenu && (
                                <div className="fixed inset-0 z-[90]" onClick={() => setShowPrintMenu(false)}></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Export Manager Modal - REMOVED */}

                {/* Settings Modal (Centered Popup) */}
                {showSettings && (
                    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-3xl bg-slate-800 rounded-xl shadow-2xl border border-slate-600 flex flex-col max-h-[90vh]">

                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 rounded-t-xl">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings size={22} className="text-blue-500" /> Pengaturan Header Laporan
                                </h2>
                            </div>

                            {/* Modal Content (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                                    {/* Col 1: Info Dasar */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-3">Info Dokumen & Kapal</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="No. Voyage" value={header.nomor} field="nomor" onUpdate={updateHeaderField} />
                                            <SettingsInput label="Tahun" value={header.tahun} field="tahun" onUpdate={updateHeaderField} />
                                        </div>
                                        <SettingsInput label="Nama Kapal" value={header.kapal} field="kapal" onUpdate={updateHeaderField} />
                                        <SettingsInput label="Callsign" value={header.callsign} field="callsign" onUpdate={updateHeaderField} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Tipe Kapal" value={header.type_kapal} field="type_kapal" onUpdate={updateHeaderField} />
                                            <SettingsInput label="DWT" value={header.dwt} field="dwt" onUpdate={updateHeaderField} />
                                        </div>
                                        <SettingsInput label="Service" value={header.service} field="service" onUpdate={updateHeaderField} />
                                    </div>

                                    {/* Col 2: Info Perusahaan */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-3">Perusahaan & Teknis</h3>
                                        <SettingsInput label="Perusahaan" value={header.perusahaan} field="perusahaan" onUpdate={updateHeaderField} />
                                        <SettingsInput label="Kecepatan Max" value={header.kecepatan_max} field="kecepatan_max" onUpdate={updateHeaderField} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="FO Cons." value={header.fo_consumption} field="fo_consumption" onUpdate={updateHeaderField} />
                                            <SettingsInput label="FW Cons." value={header.fw_consumption} field="fw_consumption" onUpdate={updateHeaderField} />
                                        </div>
                                        <SettingsInput label="Disp. Penumpang" value={header.disp_penumpang} field="disp_penumpang" onUpdate={updateHeaderField} />
                                    </div>

                                    {/* Col 1: Voyage Details */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-3">Detail Perjalanan</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Nama Nakhoda" value={header.nama_nakhoda} field="nama_nakhoda" onUpdate={updateHeaderField} />
                                            <SettingsInput label="NRP Nakhoda" value={header.nrp_nakhoda} field="nrp_nakhoda" onUpdate={updateHeaderField} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Nama Mualim I" value={header.nama_mualim_1} field="nama_mualim_1" onUpdate={updateHeaderField} />
                                            <SettingsInput label="NRP Mualim I" value={header.nrp_mualim_1} field="nrp_mualim_1" onUpdate={updateHeaderField} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Kode Trayek" value={header.kode_trayek} field="kode_trayek" onUpdate={updateHeaderField} />
                                            <SettingsInput label="Ballast Space" value={header.ballast_space} field="ballast_space" onUpdate={updateHeaderField} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Mulai (Tgl)" value={header.mulai_perjalanan} field="mulai_perjalanan" onUpdate={updateHeaderField} type="date" />
                                            <SettingsInput label="Akhir (Tgl)" value={header.akhir_perjalanan} field="akhir_perjalanan" onUpdate={updateHeaderField} type="date" />
                                        </div>
                                    </div>

                                    {/* Col 2: Sertifikat & Logo */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-3">Sertifikat & Logo</h3>
                                        <SettingsInput label="Sert. Keselamatan" value={header.sert_keselamatan} field="sert_keselamatan" onUpdate={updateHeaderField} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="Special Survey" value={header.special_survey} field="special_survey" onUpdate={updateHeaderField} />
                                            <SettingsInput label="Annual Survey" value={header.annual_survey} field="annual_survey" onUpdate={updateHeaderField} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <SettingsInput label="No. Hatches" value={header.number_hatches} field="number_hatches" onUpdate={updateHeaderField} />
                                            <SettingsInput label="LOA" value={header.loa} field="loa" onUpdate={updateHeaderField} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            {/* Logo settings removed as per request - now using static assets */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-between items-center">
                                {/* Danger Zone: Delete All */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Delay untuk Chrome compatibility
                                        setTimeout(() => clearAllData(), 100);
                                    }}
                                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-2 hover:bg-red-900/20 px-3 py-2 rounded transition-colors"
                                    title="Reset SEMUA data (Voyage, Cargo, Crew, Air Tawar)"
                                >
                                    <Trash2 size={16} /> Reset All Data / Voyage Baru
                                </button>

                                <button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <Check size={18} /> Selesai & Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Manager Modal */}
                {showReportManager && (
                    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-600 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 rounded-t-xl">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Archive size={22} className="text-blue-500" /> Arsip Laporan
                                </h2>
                                <button onClick={() => setShowReportManager(false)} className="text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>



                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/30">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Daftar Laporan Tersimpan</h3>

                                {savedReports.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                                        <FolderOpen size={48} className="mb-4 opacity-20" />
                                        <p>Belum ada laporan yang disimpan.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {savedReports.map(report => (
                                            <div key={report.id} className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex items-center justify-between hover:border-blue-500/50 transition-colors group">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{report.name}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Disimpan: {new Date(report.lastModified).toLocaleString('id-ID')}
                                                    </p>
                                                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                                        <span>{report.data.legs.length} Baris Data</span>
                                                        <span>•</span>
                                                        <span>Voyage {report.data.header.nomor}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleLoadReport(report)}
                                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                                                        title="Buka Laporan Ini"
                                                    >
                                                        <FileDown size={16} /> Buka
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSavedReport(report.id)}
                                                        className="bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 p-2 rounded-lg border border-red-900/50"
                                                        title="Hapus Laporan"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Confirmation Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-600">
                            <div className="p-5 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white">Simpan Laporan Baru</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nama Laporan</label>
                                    <input
                                        type="text"
                                        value={saveName}
                                        onChange={e => setSaveName(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Contoh: Voyage 12 - KM Sinabung"
                                        autoFocus
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Data tersimpan akan mencakup semua input saat ini (Voyage, Cargo, Crew, Air Tawar).
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-xl flex justify-end gap-2">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmSaveReport}
                                    disabled={!saveName.trim()}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <Save size={16} /> Simpan Laporan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className={mainContainerClass}>
                    {view === 'form' && (
                        <div className="max-w-4xl mx-auto">
                            <VoyageEntryForm
                                onAddLeg={handleAddLeg}
                                onUpdateLeg={handleUpdateLeg}
                                editingLeg={editingLeg}
                                onCancelEdit={() => { setEditingLeg(null); }}
                                nextNo={legs.length + 1}
                                previousLeg={legs.length > 0 ? legs[legs.length - 1] : undefined}
                            />

                            {/* Quick List for Editing in Form View */}
                            {legs.length > 0 && (
                                <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
                                    <h3 className="text-lg font-bold text-slate-700 mb-4">Data yang sudah diinput ({legs.length})</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3 rounded-tl-lg">No</th>
                                                    <th className="p-3">Dari - Ke</th>
                                                    <th className="p-3">Tgl Bertolak</th>
                                                    <th className="p-3 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {legs.map(leg => (
                                                    <tr key={leg.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-bold text-slate-500">{leg.no}</td>
                                                        <td className="p-3 font-medium text-slate-800">{leg.dari} <span className="text-slate-400">→</span> {leg.ke}</td>
                                                        <td className="p-3 text-slate-600">{leg.bertolak_tanggal}</td>
                                                        <td className="p-3 text-center space-x-2">
                                                            <button onClick={() => handleEditRequest(leg)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteLeg(leg.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                                                Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Keterangan & Catatan Section (Moved back to Main Form View) */}
                            <div className="mt-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                    <FileText className="text-blue-600" size={20} />
                                    <h3 className="text-lg font-bold text-slate-700">Keterangan & Catatan (Halaman 1)</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic leading-relaxed">
                                            {header.label_keterangan}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Isi Keterangan / Catatan</label>
                                        <textarea
                                            rows={5}
                                            value={header.catatan}
                                            onChange={e => updateHeaderField('catatan', e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                                            placeholder="Tulis keterangan mengenai kerusakan, cuaca, atau catatan perjalanan lainnya di sini..."
                                        />
                                        <p className="text-xs text-slate-400 mt-1 text-right">Akan muncul di bagian bawah Halaman 1</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'cargo_form' && (
                        <CargoPageForm
                            cargoLogs={cargoLogs}
                            setCargoLogs={setCargoLogs}
                            safetyData={safetyData}
                            setSafetyData={setSafetyData}
                            crewList={crewList}
                            setCrewList={setCrewList}
                        />
                    )}

                    {view === 'freshwater_form' && (
                        <FreshWaterForm
                            data={freshWaterData}
                            onUpdate={setFreshWaterData}
                            header={header}
                        />
                    )}
                </div>

                {/* Footer */}
                <footer className="fixed bottom-0 left-0 w-full bg-slate-200 text-slate-500 text-[10px] py-1 text-center border-t border-slate-300 z-40">
                    created by sailorcode
                </footer>

                {/* PREVIEW MODAL */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black/90 z-[80] flex flex-col backdrop-blur-sm animate-in fade-in duration-200">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/80 text-white z-50 shadow-lg backdrop-blur-md">
                            <h2 className="font-bold text-lg flex items-center gap-2"><Eye size={20} className="text-blue-400" /> Preview Laporan</h2>

                            {/* Zoom Controls */}
                            <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700 shadow-inner">
                                <button onClick={() => setPreviewZoom(z => Math.max(0.3, z - 0.1))} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white" title="Zoom Out">
                                    <ZoomOut size={18} />
                                </button>
                                <span className="w-16 text-center font-mono text-sm font-bold text-blue-300">{Math.round(previewZoom * 100)}%</span>
                                <button onClick={() => setPreviewZoom(z => Math.min(3, z + 0.1))} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white" title="Zoom In">
                                    <ZoomIn size={18} />
                                </button>
                                <div className="w-px h-4 bg-slate-600 mx-2"></div>
                                <button onClick={() => setPreviewZoom(0.8)} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white" title="Reset Zoom">
                                    <RotateCcw size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowPreview(false)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                <X size={18} /> Tutup
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-auto bg-slate-800/50 relative">
                            <div
                                className="bg-white shadow-2xl transition-all duration-200 ease-out mx-auto my-8"
                                style={{
                                    width: `${1450 * previewZoom}px`,
                                    height: reportHeight ? `${reportHeight * previewZoom}px` : 'auto'
                                }}
                            >
                                <div
                                    ref={reportRef}
                                    className="origin-top-left bg-white"
                                    style={{
                                        width: '1450px',
                                        transform: `scale(${previewZoom})`
                                    }}
                                >
                                    <ReportTable
                                        legs={legs}
                                        header={header}
                                        cargoLogs={cargoLogs}
                                        safetyData={safetyData}
                                        crewList={crewList}
                                    />

                                    {/* SEPARATOR FOR PREVIEW IF NEEDED */}
                                    <div className="h-8 bg-slate-300 my-4 flex items-center justify-center text-slate-500 text-xs font-mono uppercase tracking-widest">
                                        End of Report 1 • Start of Freshwater Report
                                    </div>

                                    <FreshWaterReport
                                        data={freshWaterData}
                                        header={header}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT ONLY VIEW (Always rendered but hidden unless printing) */}
            <div className="hidden print:block">
                {/* Voyage Report (Pages 1-3) - Only if mode is 'voyage' */}
                {printMode === 'voyage' && (
                    <ReportTable
                        legs={legs}
                        header={header}
                        cargoLogs={cargoLogs}
                        safetyData={safetyData}
                        crewList={crewList}
                    />
                )}

                {/* Fresh Water Report (Page 4) - Only if mode is 'freshwater' */}
                {printMode === 'freshwater' && (
                    <FreshWaterReport
                        data={freshWaterData}
                        header={header}
                    />
                )}
            </div>
        </>
    );
};

export default App;