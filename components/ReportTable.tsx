import React from 'react';
import { VoyageLeg, ReportHeader, CargoActivity, SafetyData, CrewMember } from '../types';
import danantaraLogo from '../assets/danantara.png';
import pelniLogo from '../assets/PELNI.png';
import ReportExplanation from './ReportExplanation';

interface Props {
    legs: VoyageLeg[];
    header: ReportHeader;

    // Data Page 2
    cargoLogs: CargoActivity[];
    safetyData: SafetyData;
    crewList: CrewMember[];
    showDigitalSignature?: boolean;
}

export const ReportTable: React.FC<Props> = ({
    legs,
    header,
    cargoLogs,
    safetyData,
    crewList,
    showDigitalSignature
}) => {

    // Format helpers
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            // Input is YYYY-MM-DD, output DD-MM-YYYY or similar
            const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
            const mIdx = parseInt(parts[1], 10) - 1;
            return `${parts[2]}-${months[mIdx]}-${parts[0]}`;
        }
        return dateStr;
    };

    const parseToNumber = (val: string | number) => {
        if (typeof val === 'number') return val;
        if (!val || val === '-' || val === '') return 0;
        const cleaned = val.toString().replace(',', '.').replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    // Helper to format numbers with commas for decimals (Indonesian style)
    const formatNumber = (num: number | string, decimals: number = 2) => {
        const val = parseToNumber(num);
        return val.toLocaleString('id-ID', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    // --- CALCULATIONS FOR PAGE 1 ---
    const calculateTimeDiff = (date1: any, time1: any, date2: any, time2: any) => {
        // Robust check for strings and presence
        if (!date1 || !time1 || !date2 || !time2 ||
            typeof date1 !== 'string' || typeof time1 !== 'string' ||
            typeof date2 !== 'string' || typeof time2 !== 'string') {
            return { days: 0, hours: 0, minutes: 0, totalHours: 0 };
        }

        try {
            // Replace dot with colon for cross-browser Date parsing
            const t1 = time1.replace('.', ':');
            const t2 = time2.replace('.', ':');

            const d1 = new Date(`${date1}T${t1}`);
            const d2 = new Date(`${date2}T${t2}`);

            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return { days: 0, hours: 0, minutes: 0, totalHours: 0 };

            const diffMs = d2.getTime() - d1.getTime();
            const totalMinutes = Math.floor(diffMs / (1000 * 60));

            // Allow negative values if they exist, but normally they should be positive
            const totalMinAbs = Math.max(0, totalMinutes);
            const days = Math.floor(totalMinAbs / (24 * 60));
            const hours = Math.floor((totalMinAbs % (24 * 60)) / 60);
            const minutes = totalMinAbs % 60;

            return { days, hours, minutes, totalHours: totalMinAbs / 60 };
        } catch (e) {
            console.error("Time calculation error:", e);
            return { days: 0, hours: 0, minutes: 0, totalHours: 0 };
        }
    };

    // Helper to add time objects
    const sumTimes = (timeList: { days: number, hours: number, minutes: number }[]) => {
        let totalMin = 0;
        (timeList || []).forEach(t => {
            if (t) {
                // Ensure we handle both naming conventions during transition if any, but aiming for consistency
                const d = parseToNumber(t.days || (t as any).d);
                const h = parseToNumber(t.hours || (t as any).h);
                const m = parseToNumber(t.minutes || (t as any).m);
                totalMin += (d * 24 * 60) + (h * 60) + m;
            }
        });
        const days = Math.floor(totalMin / (24 * 60));
        const hours = Math.floor((totalMin % (24 * 60)) / 60);
        const minutes = totalMin % 60;
        return { days, hours, minutes, totalHours: totalMin / 60 };
    };

    const legData = (legs || []).filter(l => l && l.id).map(leg => {

        // --- TIME CALCULATIONS (Column 8, 7, 9) ---

        // Berlayar Full Away (Col 8)
        // We use the duration fields from the form as the primary source of truth
        const voyageHoursVal = parseToNumber(leg.durasi_jam.toString().split('.')[0]);
        const voyageMinsVal = parseToNumber(leg.durasi_jam.toString().split('.')[1] || 0);
        const voyage = {
            days: parseToNumber(leg.durasi_hari),
            hours: voyageHoursVal,
            minutes: voyageMinsVal,
            totalHours: (parseToNumber(leg.durasi_hari) * 24) + voyageHoursVal + (voyageMinsVal / 60)
        };

        // Lama Berlabuh (Col 7) = berlabuh_selesai - berlabuh_mulai
        // If dates are missing, this might be 0, which is fine if user didn't enter it
        const berlabuh = calculateTimeDiff(leg.berlabuh_tgl_mulai, leg.berlabuh_jam_mulai, leg.berlabuh_tgl_selesai, leg.berlabuh_jam_selesai);

        // Total Berlayar (Col 9) = Full Away + Lama Berlabuh? (Based on formula 9 = (4-3)+7)
        // Actually the formula in image is 9=(4-3)+7?
        // Let's assume Col 8 is (4-3) [Voyage] and Col 9 is Col 8 + Col 7.
        const totalVoyage = sumTimes([voyage, berlabuh]);

        // Speed (Col 12) = Col 10 (Jarak Full Away) / Total Jam Berlayar (Knots)
        // Formula per image: 12 = distance / hours
        const speedValue = voyage.totalHours > 0 ? (parseToNumber(leg.jarak_full_away) / voyage.totalHours) : 0;
        const speed = speedValue.toFixed(2);

        // BM Duration
        const bm = calculateTimeDiff(leg.bertolak_tanggal, leg.mulai_bm, leg.bertolak_tanggal, leg.selesai_bm); // Simplified date

        return {
            ...leg,
            jarak: parseToNumber(leg.jarak),
            jarak_full_away: parseToNumber(leg.jarak_full_away),
            muatan_semua: parseToNumber(leg.muatan_semua),
            berlabuh,
            voyage,
            totalVoyage,
            speed,
            bmDuration: `${(bm.hours || 0).toString().padStart(2, '0')}.${(bm.minutes || 0).toString().padStart(2, '0')}`
        };
    });

    // Totals
    const totalJarakFullAway = (legs || []).reduce((sum, leg) => sum + parseToNumber(leg.jarak_full_away), 0);
    const totalJarakTotal = (legs || []).reduce((sum, leg) => sum + parseToNumber(leg.jarak), 0);
    const totalJarakAlur = (legs || []).reduce((sum, leg) => sum + parseToNumber(leg.jarak_alur), 0);
    const sumBerlabuh = sumTimes(legData.map(l => l.berlabuh));
    const sumFullAway = sumTimes(legData.map(l => l.voyage));
    const sumTotalBerlayar = sumTimes(legData.map(l => l.totalVoyage));

    // Total Average Speed (Kec. Rata-rata) = Total Jarak Full Away / Total Jam Full Away
    const totalSpeed = sumFullAway.totalHours > 0 ? (totalJarakFullAway / sumFullAway.totalHours) : 0;

    const ReportHeaderSection = ({ customTitle, hideShipDetails }: { customTitle?: string, hideShipDetails?: boolean }) => (
        <div className="mb-1">
            <div className="flex justify-between items-center px-1 min-h-[40px] mb-2 gap-4 border-b-2 border-black pb-3">
                <div className="w-[100px] h-[100px] flex items-center justify-start flex-shrink-0 -mt-8">
                    <img src={danantaraLogo} alt="Logo Kiri" className="h-[100px] w-[100px] object-contain" />
                </div>
                <div className="flex-grow text-center flex flex-col items-center justify-center gap-1 mt-2">
                    <h1 className="text-lg print:text-[12pt] font-bold uppercase tracking-widest leading-none whitespace-nowrap">
                        {customTitle || "LAPORAN PERJALANAN KAPAL"}
                    </h1>
                    <p className="text-base print:text-[9pt] font-bold font-sans leading-none whitespace-nowrap">VOYAGE : {header.nomor} / {header.tahun} / {header.callsign}</p>
                </div>
                <div className="w-[100px] h-[100px] flex items-center justify-end flex-shrink-0 -mt-8">
                    <img src={pelniLogo} alt="Logo Kanan" className="h-[100px] w-[100px] object-contain" />
                </div>
            </div>
            {!hideShipDetails && (
                <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 text-[9px] print:text-[7pt] font-sans leading-tight mt-0 px-1">
                    <div className="grid grid-cols-[max-content_4px_auto] gap-x-1">
                        <span>Nama kapal</span> <span>:</span> <span className="font-bold uppercase">{header.kapal}</span>
                        <span>Type kapal</span> <span>:</span> <span className="font-bold uppercase">{header.type_kapal}</span>
                        <span>D.W.T</span> <span>:</span> <span className="font-bold">{header.dwt}</span>
                        <span>Service</span> <span>:</span> <span className="font-bold">{header.service}</span>
                        <span>Perjalanan No.</span> <span>:</span> <span className="font-bold">{header.nomor} / {header.tahun} / {header.callsign}</span>
                    </div>
                    <div className="grid grid-cols-[max-content_4px_auto] gap-x-1">
                        <span>Nakhoda</span> <span>:</span> <span className="font-bold uppercase">{header.nama_nakhoda}</span>
                        <span>Kode trayek no.</span> <span>:</span> <span className="font-bold">{header.kode_trayek}</span>
                        <span>Ballast space</span> <span>:</span> <span className="font-bold">{header.ballast_space}</span>
                        <span>Mulai perjalanan</span> <span>:</span> <span className="font-bold">{formatDate(header.mulai_perjalanan)}</span>
                        <span>Akhir perjalanan</span> <span>:</span> <span className="font-bold">{formatDate(header.akhir_perjalanan)}</span>
                    </div>
                    <div className="grid grid-cols-[max-content_4px_auto] gap-x-1">
                        <span>Perusahaan</span> <span>:</span> <span className="font-bold">{header.perusahaan}</span>
                        <span>Kecepatan (knots)</span> <span>:</span> <span className="font-bold">{header.kecepatan_max}</span>
                        <span>F.O. Consumption (Ton)</span> <span>:</span> <span className="font-bold">{header.fo_consumption}</span>
                        <span>Fresh water cons. (Ton)</span> <span>:</span> <span className="font-bold">{header.fw_consumption}</span>
                        <span>Disp. Penumpang max</span> <span>:</span> <span className="font-bold">{header.disp_penumpang}</span>
                    </div>
                    <div className="grid grid-cols-[max-content_4px_auto] gap-x-1">
                        <span>Sert. Keselamatan s/d</span> <span>:</span> <span className="font-bold">{header.sert_keselamatan}</span>
                        <span>Special Survey terakhir</span> <span>:</span> <span className="font-bold">{header.special_survey}</span>
                        <span>Annual Survey terakhir</span> <span>:</span> <span className="font-bold">{header.annual_survey}</span>
                        <span>Number of Hatches</span> <span>:</span> <span className="font-bold">{header.number_hatches}</span>
                        <span>Length Over all</span> <span>:</span> <span className="font-bold">{header.loa}</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center print:block page-landscape">

            {/* ================= PAGE 1 ================= */}
            <div className="bg-white p-4 w-full mb-8 shadow-sm print:shadow-none print:mb-0 relative">
                <ReportHeaderSection />
                <div className="border-2 border-black mt-2">
                    <table className="w-full text-[7px] print:text-[8px] border-collapse font-sans text-center">
                        <thead className="bg-gray-100 print:bg-transparent">
                            <tr className="border-b border-black">
                                <th rowSpan={2} className="border-r border-black w-6">No.</th>
                                <th colSpan={2} className="border-r border-black">PERJALANAN</th>
                                <th colSpan={2} className="border-r border-black">BERTOLAK</th>
                                <th colSpan={2} className="border-r border-black">TIBA</th>
                                <th colSpan={4} className="border-r border-black">BERLABUH / ALUR / REDE</th>
                                <th rowSpan={2} className="border-r border-black">Lama Berlabuh</th>
                                <th colSpan={2} className="border-r border-black w-4">BERLAYAR FULL AWAY</th>
                                <th colSpan={2} className="border-r border-black w-4">TOTAL BERLAYAR</th>
                                <th rowSpan={2} className="border-r border-black w-18 px-0.5">Jarak Full<br />Away (NM)</th>
                                <th rowSpan={2} className="border-r border-black w-18 px-0.5">Total Jarak<br />ditempuh (NM)</th>
                                <th rowSpan={2} className="border-r border-black w-18 px-0.5">Kec. Kapal<br />(Knot)</th>
                            </tr>
                            <tr className="border-b border-black">
                                <th className="border-r border-black border-t border-black/20 w-24">Dari</th>
                                <th className="border-r border-black border-t border-black/20 w-24">Ke</th>
                                <th className="border-r border-black border-t border-black/20">Tanggal</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                                <th className="border-r border-black border-t border-black/20">Tanggal</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                                <th className="border-r border-black border-t border-black/20 w-16">Tanggal Mulai</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                                <th className="border-r border-black border-t border-black/20 w-16">Tanggal Selesai</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                                {/* 8, 9 Headers */}
                                <th className="border-r border-black border-t border-black/20">Hari</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                                <th className="border-r border-black border-t border-black/20">Hari</th>
                                <th className="border-r border-black border-t border-black/20">Jam</th>
                            </tr>
                            <tr className="bg-blue-100 print:bg-blue-100/50 text-[6px]">
                                <th className="border-r border-black"></th>
                                <th className="border-r border-black">1</th>
                                <th className="border-r border-black">2</th>
                                <th colSpan={2} className="border-r border-black">3</th>
                                <th colSpan={2} className="border-r border-black">4</th>
                                <th colSpan={2} className="border-r border-black">5</th>
                                <th colSpan={2} className="border-r border-black">6</th>
                                <th className="border-r border-black">7=6-5</th>
                                <th colSpan={2} className="border-r border-black">8=4-3</th>
                                <th colSpan={2} className="border-r border-black">9=8+7</th>
                                <th className="border-r border-black">10</th>
                                <th className="border-r border-black">11</th>
                                <th className="border-r border-black">12=(10/8)/24</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legData.map((leg, idx) => (
                                <tr key={leg.id} className="border-b border-black">
                                    <td className="border-r border-black">{leg.no}</td>
                                    <td className="border-r border-black text-left px-1 uppercase">{leg.dari}</td>
                                    <td className="border-r border-black text-left px-1 uppercase">{leg.ke}</td>
                                    <td className="border-r border-black">{formatDate(leg.bertolak_tanggal)}</td>
                                    <td className="border-r border-black">{leg.bertolak_jam}</td>
                                    <td className="border-r border-black">{formatDate(leg.tiba_tanggal)}</td>
                                    <td className="border-r border-black">{leg.tiba_jam}</td>
                                    <td className="border-r border-black">{formatDate(leg.berlabuh_tgl_mulai)}</td>
                                    <td className="border-r border-black">{leg.berlabuh_jam_mulai}</td>
                                    <td className="border-r border-black">{formatDate(leg.berlabuh_tgl_selesai)}</td>
                                    <td className="border-r border-black">{leg.berlabuh_jam_selesai}</td>
                                    <td className="border-r border-black">{leg.berlabuh.totalHours > 0 ? `${(leg.berlabuh.hours || 0).toString().padStart(2, '0')}.${(leg.berlabuh.minutes || 0).toString().padStart(2, '0')}` : ''}</td>
                                    <td className="border-r border-black text-center">{leg.voyage.days || 0}</td>
                                    <td className="border-r border-black text-center">{(leg.voyage.hours || 0).toString().padStart(2, '0')}.{(leg.voyage.minutes || 0).toString().padStart(2, '0')}</td>
                                    <td className="border-r border-black text-center">{leg.totalVoyage.days || 0}</td>
                                    <td className="border-r border-black text-center">{(leg.totalVoyage.hours || 0).toString().padStart(2, '0')}.{(leg.totalVoyage.minutes || 0).toString().padStart(2, '0')}</td>
                                    <td className="border-r border-black">{formatNumber(leg.jarak_full_away, 1)}</td>
                                    <td className="border-r border-black">{formatNumber(leg.jarak, 1)}</td>
                                    <td className="border-r border-black">{formatNumber(leg.speed, 2)}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-gray-100 print:bg-transparent border-t-2 border-black">
                                <td colSpan={11} className="border-r border-black text-right px-2">Jumlah :</td>
                                <td className="border-r border-black">{(sumBerlabuh.hours || 0).toString().padStart(2, '0')}.{(sumBerlabuh.minutes || 0).toString().padStart(2, '0')}</td>
                                <td className="border-r border-black">{sumFullAway.days || 0}</td>
                                <td className="border-r border-black">{(sumFullAway.hours || 0).toString().padStart(2, '0')}.{(sumFullAway.minutes || 0).toString().padStart(2, '0')}</td>
                                <td className="border-r border-black">{sumTotalBerlayar.days || 0}</td>
                                <td className="border-r border-black">{(sumTotalBerlayar.hours || 0).toString().padStart(2, '0')}.{(sumTotalBerlayar.minutes || 0).toString().padStart(2, '0')}</td>
                                <td className="border-r border-black">{formatNumber(totalJarakFullAway, 1)}</td>
                                <td className="border-r border-black">{formatNumber(totalJarakTotal, 1)}</td>
                                <td className="border-r border-black">{formatNumber(totalSpeed, 2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ReportExplanation notes={header.catatan} />
            </div>

            {/* ================= PAGE 2 ================= */}
            <div className="bg-white p-4 w-full shadow-sm print:shadow-none relative" style={{ pageBreakBefore: 'always' }}>
                <ReportHeaderSection />
                <div className="border-2 border-black mt-2">
                    <table className="w-full text-[6px] print:text-[7px] border-collapse font-sans text-center">
                        <thead className="bg-gray-100 print:bg-transparent">
                            <tr className="border-b border-black">
                                <th rowSpan={2} className="border-r border-black">No.</th>
                                <th colSpan={2} className="border-r border-black">PERJALANAN</th>
                                <th colSpan={2} className="border-r border-black">BERTOLAK</th>
                                <th colSpan={2} className="border-r border-black">TIBA</th>
                                <th colSpan={4} className="border-r border-black">BONGKAR / MUAT</th>
                                <th rowSpan={2} className="border-r border-black">PUTARAN MESIN</th>
                                <th colSpan={4} className="border-r border-black">MUATAN</th>
                                <th colSpan={2} className="border-r border-black">JUMLAH DI KAPAL SAAT TIBA</th>
                                <th colSpan={5} className="border-r border-black">JUMLAH DI KAPAL SAAT BERTOLAK</th>
                                <th colSpan={2} className="border-r border-black">TERIMA</th>
                                <th colSpan={2} className="border-r border-black">DRAFT</th>
                                <th rowSpan={2} className="border-r border-black">TOTAL PNP.</th>
                            </tr>
                            <tr className="border-b border-black">
                                <th className="border-r border-black w-24">Dari</th>
                                <th className="border-r border-black w-24">Ke</th>
                                <th className="border-r border-black">Tgl</th>
                                <th className="border-r border-black">Jam</th>
                                <th className="border-r border-black">Tgl</th>
                                <th className="border-r border-black">Jam</th>
                                <th className="border-r border-black">Kegiatan</th>
                                <th className="border-r border-black">Mulai</th>
                                <th className="border-r border-black">Selesai</th>
                                <th className="border-r border-black">Waktu B/M</th>
                                <th className="border-r border-black">Muat</th>
                                <th className="border-r border-black">Bongkar</th>
                                <th className="border-r border-black">Jumlah yg dikerjakan</th>
                                <th className="border-r border-black">Muatan Semua</th>

                                <th className="border-r border-black">Air Tawar</th>
                                <th className="border-r border-black">BBM</th>

                                <th className="border-r border-black">Air Tawar</th>
                                <th className="border-r border-black">Air Ballast</th>
                                <th className="border-r border-black">BBM</th>
                                <th className="border-r border-black">Perbekalan</th>
                                <th className="border-r border-black">Total</th>

                                <th className="border-r border-black">BBM</th>
                                <th className="border-r border-black">Air Tawar</th>
                                <th className="border-r border-black">Muka</th>
                                <th className="border-r border-black">Belakang</th>
                            </tr>
                            <tr className="bg-blue-100 print:bg-blue-100/50 text-[5px]">
                                {[...Array(25)].map((_, i) => <th key={i} className="border-r border-black">{i + 1}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {legData.map((leg, idx) => (
                                <tr key={leg.id} className="border-b border-black">
                                    <td className="border-r border-black">{leg.no}</td>
                                    <td className="border-r border-black text-left px-0.5 uppercase">{leg.dari}</td>
                                    <td className="border-r border-black text-left px-0.5 uppercase">{leg.ke}</td>
                                    <td className="border-r border-black">{formatDate(leg.bertolak_tanggal)}</td>
                                    <td className="border-r border-black">{leg.bertolak_jam}</td>
                                    <td className="border-r border-black">{formatDate(leg.tiba_tanggal)}</td>
                                    <td className="border-r border-black">{leg.tiba_jam}</td>
                                    <td className="border-r border-black">{leg.kegiatan_bm}</td>
                                    <td className="border-r border-black">{leg.mulai_bm}</td>
                                    <td className="border-r border-black">{leg.selesai_bm}</td>
                                    <td className="border-r border-black">{leg.bmDuration}</td>
                                    <td className="border-r border-black">{leg.putaran_mesin}</td>
                                    <td className="border-r border-black">{leg.muatan_dimuat}</td>
                                    <td className="border-r border-black">{leg.muatan_dibongkar}</td>
                                    <td className="border-r border-black">{leg.muatan_total}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.muatan_semua).toFixed(2)}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.rob_tiba_fw).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.rob_tiba_fo).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.rob_fw).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.rob_ballast).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.rob_fo).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{parseToNumber(leg.perbekalan).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black font-bold">{parseToNumber(leg.total_bobot).toLocaleString('id-ID')}</td>
                                    <td className="border-r border-black">{leg.terima_fo}</td>
                                    <td className="border-r border-black">{leg.terima_fw}</td>
                                    <td className="border-r border-black">{leg.draft_depan}</td>
                                    <td className="border-r border-black">{leg.draft_belakang}</td>
                                    <td className="border-r border-black font-bold">{parseToNumber(leg.pax_total).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-gray-100 print:bg-transparent border-t-2 border-black">
                            <tr>
                                <td colSpan={12} className="border-r border-black text-right px-1">Jumlah :</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.muatan_dimuat), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.muatan_dibongkar), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.muatan_total), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.muatan_semua), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.rob_tiba_fw), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.rob_tiba_fo), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.rob_fw), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.rob_ballast), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.rob_fo), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.perbekalan), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black text-right pr-0.5">{legData.reduce((s, l) => s + parseToNumber(l.total_bobot), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.terima_fo), 0).toLocaleString('id-ID')}</td>
                                <td className="border-r border-black">{legData.reduce((s, l) => s + parseToNumber(l.terima_fw), 0).toLocaleString('id-ID')}</td>
                                <td colSpan={2} className="border-r border-black"></td>
                                <td className="border-r border-black font-bold">{legData.reduce((s, l) => s + parseToNumber(l.pax_total), 0).toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <ReportExplanation notes={header.catatan} />
            </div>

            {/* ================= PAGE 3: BONGKAR MUAT & CREW ================= */}
            <div className="bg-white px-4 py-2 w-full shadow-sm print:shadow-none relative" style={{ pageBreakBefore: 'always' }}>
                <ReportHeaderSection customTitle="LAPORAN PERJALANAN KAPAL" hideShipDetails={true} />

                <div className="text-[8px] print:text-[7pt] mb-2 px-1 leading-tight italic text-justify">
                    Permulaan dan berakhirnya bongkar muat, banyaknya gang yang bekerja, ditunda/berhenti dan apa sebabnya, kecelakaan-kecelakaan, hal-hal lain, mutu pekerjaan bongkar muat.
                </div>

                {/* Top Grid: Dates & Summary */}
                <div className="grid grid-cols-2 gap-4 text-[10px] font-sans mb-2 mt-2">
                    <div>
                        <div className="flex">
                            <span className="mr-1">Perjalanan dimulai tanggal:</span> <span className="font-bold">{formatDate(header.mulai_perjalanan)}</span>
                        </div>
                        <div className="flex">
                            <span className="mr-1">Dan berakhir tanggal:</span> <span className="font-bold">{formatDate(header.akhir_perjalanan)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[max-content_auto] gap-x-2">
                        <span>Jumlah masa berlayar</span> <span className="font-bold">= {sumFullAway.days || 0} Hari {(sumFullAway.hours || 0).toString().padStart(2, '0')}.{(sumFullAway.minutes || 0).toString().padStart(2, '0')} Jam</span>
                        <span>Jumlah Jarak yang ditempuh</span> <span className="font-bold">= {formatNumber(totalJarakTotal, 1)} Mil laut</span>
                        <span>Kecepatan Rata-2</span> <span className="font-bold">= {formatNumber(totalSpeed, 2)} Mil laut sejam</span>
                    </div>
                </div>

                {/* TABLE BONGKAR MUAT */}
                <div className="flex gap-2 text-[9px] font-sans h-[540px]">

                    {/* Left Column: Cargo & Safety */}
                    <div className="w-[45%] flex flex-col gap-2 h-full">
                        {/* Top Left: Cargo Table */}
                        <div className="border-2 border-black overflow-hidden relative h-[60%]">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="border-b border-black bg-gray-100 print:bg-transparent text-[8px] print:text-[7pt] h-8">
                                        <th className="border-r border-black w-5">No</th>
                                        <th className="border-r border-black">PELABUHAN</th>
                                        <th className="border-r border-black w-30">TANGGAL</th>
                                        <th colSpan={2} className="border-r border-black w-24">WAKTU<br /><span className="font-normal">Mulai / Selesai</span></th>
                                        <th className="border-r border-black w-24">JENIS KEGIATAN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {legs.filter(leg => leg.kegiatan_bm && leg.kegiatan_bm !== '-').map((leg, idx) => (
                                        <tr key={leg.id || idx} className="border-b border-black h-4 text-[8px] print:text-[7pt]">
                                            <td className="border-r border-black">{idx + 1}</td>
                                            <td className="border-r border-black text-left px-1 uppercase">{leg.pelabuhan_bm || leg.ke}</td>
                                            <td className="border-r border-black whitespace-nowrap">{leg.tiba_tanggal ? formatDate(leg.tiba_tanggal) : '-'}</td>
                                            <td className="border-r border-black px-0">{leg.mulai_bm || '-'}</td>
                                            <td className="border-r border-black px-0">{leg.selesai_bm || '-'}</td>
                                            <td className="border-r border-black uppercase">{leg.kegiatan_bm}</td>
                                        </tr>
                                    ))}
                                    {/* Fill empty rows to maintain layout height */}
                                    {[...Array(Math.max(0, 14 - legs.filter(leg => leg.kegiatan_bm && leg.kegiatan_bm !== '-').length))].map((_, i) => (
                                        <tr key={`empty-${i}`} className="border-b border-black h-4 text-[8px] print:text-[7pt]">
                                            <td className="border-r border-black">{legs.filter(leg => leg.kegiatan_bm && leg.kegiatan_bm !== '-').length + i + 1}</td>
                                            <td className="border-r border-black"></td>
                                            <td className="border-r border-black"></td>
                                            <td className="border-r border-black"></td>
                                            <td className="border-r border-black"></td>
                                            <td className="border-r border-black"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Left: Safety Section */}
                        <div className="border-2 border-black p-1 overflow-hidden flex-1">
                            <div className="border-b border-black mb-1 pb-1">
                                <span className="font-bold underline">Sekoci yang ada di Kapal</span>
                                <div className="grid grid-cols-3 text-center mt-1">
                                    <span></span> <span className="border-b border-black">Menurut Peraturan</span> <span className="border-b border-black">Ada di Kapal</span>
                                    <span className="text-left">MES (Marine Evacuation System)</span> <span>0</span> <span>2</span>
                                    <span className="text-left">Sekoci Motor</span> <span>{safetyData.sekoci_menurut_peraturan}</span> <span>{safetyData.sekoci_ada}</span>
                                    <span className="text-left">Rakit Penolong</span> <span>{safetyData.rakit_menurut_peraturan}</span> <span>{safetyData.rakit_ada}</span>
                                </div>
                            </div>

                            <div className="flex flex-row gap-1">
                                <div className="flex-1 grid grid-cols-[max-content_3px_auto] gap-x-1 gap-y-[2px] leading-none text-[8px] print:text-[6pt]">
                                    <span>Latihan sekoci diadakan tgl</span> <span>:</span> <span className="font-bold">{safetyData.latihan_sekoci_tgl}</span>
                                    <span>Latihan kebakaran diadakan tgl</span> <span>:</span> <span className="font-bold">{safetyData.latihan_kebakaran_tgl}</span>
                                    <span>Exhibitum</span> <span>:</span> <span className="font-bold">-</span>

                                    <span>Keadaan pompa hydran</span> <span>:</span> <span className="font-bold">{safetyData.pompa_hydran}</span>
                                    <span>Keadaan alat-alat pemadam api</span> <span>:</span> <span className="font-bold">{safetyData.pemadam_api}</span>
                                    <span>Keadaan saluran hydran</span> <span>:</span> <span className="font-bold">{safetyData.saluran_hydran}</span>
                                    <span>Keadaan gasmasker</span> <span>:</span> <span className="font-bold">{safetyData.gasmasker}</span>
                                    <span>Keadaan alat-alat oxygen</span> <span>:</span> <span className="font-bold">{safetyData.alat_oxygen}</span>
                                    <span>MES (Marine Evacuation)</span> <span>:</span> <span className="font-bold">{safetyData.mes}</span>
                                    <span>Pemeriksaan tikus terakhir</span> <span>:</span> <span className="font-bold">{formatDate(safetyData.pemeriksaan_tikus)}</span>
                                    <span>Menggunakan kemudi darurat</span> <span>:</span> <span className="font-bold">{safetyData.kemudi_darurat}</span>
                                    <span>Kapal naik dok terakhir di</span> <span>:</span> <span className="font-bold">{safetyData.naik_dok_terakhir}</span>
                                </div>

                                <div className="w-px bg-black mx-1 self-stretch"></div>

                                <div className="w-[35%] grid grid-cols-[max-content_4px_auto] gap-x-1 gap-y-0.5 leading-tight text-[8px] print:text-[6pt] content-start">
                                    <div className="col-span-3 font-bold underline italic mb-1 mt-1">Terakhir di service :</div>
                                    <span>CO2 System</span> <span>:</span> <span className="font-bold">{formatDate(safetyData.service_co2_system)}</span>
                                    <span>APAR Foam</span> <span>:</span> <span className="font-bold">{formatDate(safetyData.service_apar_foam)}</span>
                                    <span>APAR CO2</span> <span>:</span> <span className="font-bold">{formatDate(safetyData.service_apar_co2)}</span>
                                    <span>APAR Powder</span> <span>:</span> <span className="font-bold">{formatDate(safetyData.service_apar_powder)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Crew & Signatures */}
                    <div className="w-[55%] flex flex-col gap-2 h-full">
                        {/* Top Right: Crew List Table */}
                        <div className="border-2 border-black overflow-hidden relative h-[60%]">
                            <table className="w-full text-[8px] print:text-[7pt] border-collapse">
                                <thead>
                                    <tr className="border-b border-black bg-gray-100 print:bg-transparent h-8">
                                        <th className="border-r border-black w-28">Jabatan</th>
                                        <th className="border-r border-black w-60">N a m a</th>
                                        <th className="border-r border-black w-16">NRP</th>
                                        <th className="border-r border-black w-28 text-[7px] leading-tight whitespace-nowrap">Ditempatkan di kapal tgl</th>
                                        <th className="w-28 text-[7px] leading-tight whitespace-nowrap">Dipindahkan tgl</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(crewList || []).filter(c => c.jabatan !== 'ABK lainnya').map((crew, idx) => (
                                        <tr key={idx} className="border-b border-black h-4">
                                            <td className="border-r border-black px-1 font-semibold text-left">{crew.jabatan}</td>
                                            <td className="border-r border-black px-1 uppercase text-left">{crew.nama}</td>
                                            <td className="border-r border-black px-1 text-center">{crew.nrp}</td>
                                            <td className="border-r border-black px-1 text-center">{crew.tanggal_ditempatkan ? formatDate(crew.tanggal_ditempatkan) : ''}</td>
                                            <td className="px-1 text-center">{crew.tanggal_dipindahkan ? formatDate(crew.tanggal_dipindahkan) : ''}</td>
                                        </tr>
                                    ))}
                                    {/* Total Crew Row */}
                                    <tr className="border-b border-black h-4 bg-gray-50 font-bold">
                                        <td colSpan={2} className="border-r border-black px-1 text-left italic">JUMLAH ABK SELURUHNYA DI ATAS KAPAL</td>
                                        <td className="border-r border-black px-1 text-center">
                                            {safetyData.jumlah_abk_total || (crewList || []).filter(c => c.nama && c.nama.trim() !== '' && c.nama !== '-').length}
                                        </td>
                                        <td colSpan={2} className="px-1 text-center">ORANG</td>
                                    </tr>
                                    {[...Array(Math.max(0, 13 - (crewList || []).filter(c => c.jabatan !== 'ABK lainnya').length))].map((_, i) => (
                                        <tr key={`empty-crew-${i}`} className="border-b border-black h-4">
                                            <td className="border-r border-black px-1"></td>
                                            <td className="border-r border-black px-1"></td>
                                            <td className="border-r border-black px-1"></td>
                                            <td className="border-r border-black px-1"></td>
                                            <td className="px-1"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Right: Signatures */}
                        <div className="p-1 overflow-hidden flex-1">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-center pt-2 pb-2 px-1 items-start">
                                <div className="flex flex-col items-center relative">
                                    <p className="mb-20">Mengetahui :<br />Nakhoda</p>

                                    {showDigitalSignature && (
                                        <div className="absolute inset-x-0 bottom-8 flex items-end justify-center pointer-events-none print:hidden">
                                            <div className="font-script text-3xl text-blue-900 opacity-80 rotate-[-5deg]">Signed</div>
                                        </div>
                                    )}

                                    <p className="font-bold underline mb-0 break-all max-w-full relative z-10">{header.nama_nakhoda}</p>
                                    <p className="text-[10px] mt-0 break-all max-w-full">Nrp. {header.nrp_nakhoda}</p>
                                </div>
                                <div className="flex flex-col items-center relative">
                                    <p className="mb-20">{header.kapal}, {header.akhir_perjalanan}<br />Mualim I</p>

                                    {showDigitalSignature && (
                                        <div className="absolute inset-x-0 bottom-8 flex items-end justify-center pointer-events-none print:hidden">
                                            <div className="font-script text-3xl text-blue-900 opacity-80 rotate-[-5deg]">Signed</div>
                                        </div>
                                    )}

                                    <p className="font-bold underline mb-0 break-all max-w-full relative z-10">{header.nama_mualim_1}</p>
                                    <p className="text-[10px] mt-0 break-all max-w-full">Nrp. {header.nrp_mualim_1}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};