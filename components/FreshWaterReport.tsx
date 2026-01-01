import React from 'react';
import { FreshWaterData, ReportHeader } from '../types';

import pelniLogo from '../assets/PELNI.png';

interface Props {
    data: FreshWaterData;
    header: ReportHeader; // We need global header for ship name/voyage no
    showDigitalSignature?: boolean;
}

export const FreshWaterReport: React.FC<Props> = ({ data, header, showDigitalSignature }) => {
    const parseNum = (val: string | number) => {
        if (typeof val === 'number') return val;
        if (!val || val === '-' || val === '') return 0;
        const cleaned = val.toString().replace(',', '.').replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    // Calculations
    const totalPengisian = (data.entries || []).reduce((sum, e) => sum + parseNum(e.jumlah_pengisian), 0);
    const totalPenggunaan = (data.entries || []).reduce((sum, e) => sum + parseNum(e.penggunaan_air), 0);
    const totalHarga = (data.entries || []).reduce((sum, e) => sum + parseNum(e.jumlah_harga), 0);


    // Logic from image:
    // III Sisa air tawar voyage sebelumnya
    const sisaAwal = (data.entries || []).length > 0 ? parseNum(data.entries[0].sisa_air_sebelum) : 0;

    // IV Sisa air tawar akhir voyage
    const sisaAkhir = parseNum(data.sisa_air_akhir);

    // Helper to format date YYYY-MM-DD to Indonesian format
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        // Check if it's YYYY-MM-DD
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = dateStr.split('-');
            return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
        }
        return dateStr;
    };

    return (
        <div
            className="w-full h-[210mm] bg-white relative overflow-hidden print:overflow-hidden mx-auto p-8 print:p-8"
            style={{
                pageBreakAfter: 'avoid',
                pageBreakBefore: 'avoid',
            }}
        >
            {/* HEADER SECTION */}
            <div className="w-full mb-3 print:mt-0">
                <div className="border-2 border-blue-900 mb-1">
                    <div className="flex h-[60px] print:h-[55px]">
                        <div className="w-[25%] p-2 flex items-center justify-center border-r-2 border-blue-900 overflow-hidden">
                            {/* DYNAMIC LOGO LOGIC */}
                            <img
                                src={pelniLogo}
                                alt="Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="w-[75%] flex flex-col">
                            <div className="flex-1 flex items-center justify-center border-b-2 border-blue-900 bg-slate-50">
                                <h2 className="text-[12px] print:text-[9pt] font-bold text-slate-800 uppercase tracking-wide">Laporan Penerimaan dan Pemakaian Air Tawar</h2>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <h3 className="text-[11px] print:text-[8pt] font-bold text-slate-700">PT PELNI (Persero)</h3>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-blue-600 text-white text-[9px] print:text-[7pt] font-bold border-t-2 border-blue-900">
                        <div className="w-1/4 py-0.5 text-center border-r border-blue-400">NAMA KAPAL</div>
                        <div className="w-1/4 py-0.5 text-center border-r border-blue-400">VOYAGE</div>
                        <div className="w-1/2 py-0.5 text-center uppercase">Tanggal ( M / S )</div>
                    </div>

                    <div className="flex text-xs print:text-[8pt] font-bold text-slate-800 h-[24px] print:h-[20px]">
                        <div className="w-1/4 text-center border-r-2 border-blue-900 flex items-center justify-center uppercase">
                            {header.kapal || " "}
                        </div>
                        <div className="w-1/4 text-center border-r-2 border-blue-900 flex items-center justify-center uppercase">
                            {header.nomor || " "} / {header.tahun}
                        </div>
                        <div className="w-1/2 flex flex-col">
                            <div className="flex flex-1">
                                <div className="w-1/2 text-center border-r-2 border-blue-900 flex items-center justify-center uppercase bg-white text-[9px] print:text-[7pt]">
                                    {header.mulai_perjalanan}
                                </div>
                                <div className="w-1/2 text-center flex items-center justify-center uppercase bg-white text-[9px] print:text-[7pt]">
                                    {header.akhir_perjalanan}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TABLE CONTENT */}
            <div className="w-full mb-2">
                <table className="w-full border-collapse border-2 border-blue-900 text-[10px] print:text-[7.5pt]">
                    <thead className="bg-blue-500 text-white font-bold text-center">
                        <tr>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '3%' }}>NO</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '15%' }}>PELABUHAN</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '13%' }}>TANGGAL</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '10%' }}>SISA AIR SEBELUM PENGISIAN (TON)</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '10%' }}>JUMALAH PENGISIAN(TON)</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '10%' }}>PENGUNAAN AIR</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '10%' }}>VIA</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '12%' }}>HARGA (Rp)</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '12%' }}>TOTAL (Rp)</th>
                            <th className="border border-blue-300 px-1 py-0.5" style={{ width: '8%' }}>PORT TIME</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-800">
                        {(data.entries || []).map((entry) => (
                            <tr key={entry.id} className="text-center h-[18px] print:h-[16px]">
                                <td className="border border-slate-400 px-1">{entry.no}</td>
                                <td className="border border-slate-400 px-1 uppercase text-left pl-2 truncate max-w-[120px]">{entry.pelabuhan}</td>
                                <td className="border border-slate-400 px-1">{formatDate(entry.tanggal)}</td>
                                <td className="border border-slate-400 px-1">{parseNum(entry.sisa_air_sebelum)}</td>
                                <td className="border border-slate-400 px-1 font-bold">{parseNum(entry.jumlah_pengisian)}</td>
                                <td className="border border-slate-400 px-1">{parseNum(entry.penggunaan_air).toFixed(2)}</td>
                                <td className="border border-slate-400 px-1 uppercase">{entry.pengisian_via}</td>
                                <td className="border border-slate-400 px-1 text-right pr-2">{entry.harga_per_ton ? parseNum(entry.harga_per_ton).toLocaleString('id-ID') : '-'}</td>
                                <td className="border border-slate-400 px-1 text-right pr-2 font-medium">{entry.jumlah_harga ? parseNum(entry.jumlah_harga).toLocaleString('id-ID') : '-'}</td>
                                <td className="border border-slate-400 px-1">{entry.port_time}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold bg-blue-100 text-blue-900 border-t-2 border-slate-500">
                        <tr className="h-[20px] print:h-[18px]">
                            <td colSpan={3} className="border border-slate-400 py-0.5 px-1 text-center bg-blue-500 text-white uppercase text-[8px] print:text-[7pt] tracking-wider">TOTAL</td>
                            <td className="border border-slate-400 py-0.5 px-1 text-center"></td>
                            <td className="border border-slate-400 py-0.5 px-1 text-center">{totalPengisian > 0 ? totalPengisian.toLocaleString('id-ID') : ''}</td>
                            <td className="border border-slate-400 py-0.5 px-1 text-center">{totalPenggunaan > 0 ? totalPenggunaan.toLocaleString('id-ID') : ''}</td>
                            <td className="border border-slate-400 py-0.5 px-1"></td>
                            <td className="border border-slate-400 py-0.5 px-1"></td>
                            <td className="border border-slate-400 py-0.5 px-1 text-right pr-2">{totalHarga > 0 ? totalHarga.toLocaleString('id-ID') : ''}</td>
                            <td className="border border-slate-400 py-0.5 px-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 3. FOOTER SECTION */}
            <div className="w-full flex gap-4 mt-3">
                {/* Summary Table */}
                <div className="w-[45%]">
                    <table className="w-full text-[10px] print:text-[7.5pt] font-bold border border-slate-400">
                        <tbody>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">I</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Kapasitas total tangki</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center w-24" colSpan={2}>{data.kapasitas_total_tangki} TON</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">II</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Total penerimaan voy</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center italic text-slate-500 w-24 whitespace-nowrap text-[7pt]">{header.nomor || ' '} / {header.tahun}</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-right w-20 pr-2">{totalPengisian}</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">III</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Sisa air tawar voy lalu</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center italic text-slate-500 w-24 whitespace-nowrap text-[7pt]">{data.voyage_lalu_nomor || (header.isFirstEntry ? '-' : `${header.previousVoyageNumber || '?'} / ${header.tahun}`)}</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-right w-20 pr-2">{data.voyage_lalu_sisa_air || sisaAwal}</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">IV</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Sisa air tawar akhir voy</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center italic text-slate-500 w-24 whitespace-nowrap text-[7pt]">{header.nomor || ' '} / {header.tahun}</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-right w-20 pr-2">{sisaAkhir}</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">V</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Sisa air tawar voy DOCK</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center text-[7pt]" colSpan={2}>{data.sisa_air_dock}</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-400 py-0.5 px-1 w-8 text-center bg-slate-100">VI</td>
                                <td className="border border-slate-400 py-0.5 px-2 bg-slate-50">Pemakaian air tawar voy</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-center italic text-slate-500 w-24 whitespace-nowrap text-[7pt]">{header.nomor || ' '} / {header.tahun}</td>
                                <td className="border border-slate-400 py-0.5 px-1 text-right w-20 pr-2">{totalPenggunaan.toLocaleString('id-ID')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Signature Block */}
                <div className="w-[55%] flex text-[10px] print:text-[7.5pt] font-sans font-bold text-slate-800 gap-2">
                    <div className="text-center flex-1 flex flex-col justify-between h-full min-h-[85px] relative">
                        <p className="uppercase leading-tight text-[10px] print:text-[7.5pt]">
                            MENGETAHUI<br />NAKHODA
                        </p>

                        {/* Digital Signature Placeholder */}
                        {showDigitalSignature && (
                            <div className="absolute inset-x-0 bottom-5 flex items-end justify-center pointer-events-none print:hidden">
                                <div className="font-script text-2xl text-blue-900 opacity-80 rotate-[-5deg]">Signed</div>
                            </div>
                        )}

                        <div className="mt-auto relative z-10">
                            <p className="underline underline-offset-2 decoration-black uppercase text-[10px] print:text-[7.5pt]">{header.nama_nakhoda || " "}</p>
                            <p className="mt-0.5 font-sans text-[10px] print:text-[7.5pt]">NRP. {header.nrp_nakhoda || " "}</p>
                        </div>
                    </div>

                    <div className="text-center flex-1 flex flex-col justify-between h-full min-h-[85px] relative">
                        <p className="uppercase leading-tight text-[10px] print:text-[7.5pt]">
                            <span className="uppercase">{data.tempat_laporan || header.kapal || "TEMPAT"}</span>, {formatDate(data.tanggal_laporan) || " "}<br />
                            MUALIM I
                        </p>

                        {/* Digital Signature Placeholder */}
                        {showDigitalSignature && (
                            <div className="absolute inset-x-0 bottom-5 flex items-end justify-center pointer-events-none print:hidden">
                                <div className="font-script text-2xl text-blue-900 opacity-80 rotate-[-5deg]">Signed</div>
                            </div>
                        )}

                        <div className="mt-auto relative z-10">
                            <p className="underline underline-offset-2 decoration-black uppercase text-[10px] print:text-[7.5pt]">{header.nama_mualim_1 || " "}</p>
                            <p className="mt-0.5 font-sans text-[10px] print:text-[7.5pt]">NRP. {header.nrp_mualim_1 || " "}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
