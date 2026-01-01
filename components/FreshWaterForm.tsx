import React from "react";
import {
  FreshWaterData,
  FreshWaterEntry,
  INITIAL_FRESH_WATER_DATA,
  ReportHeader,
} from "../types";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Calendar,
  Anchor,
  Droplets,
  Banknote,
  Clock,
  Truck,
} from "lucide-react";

interface Props {
  data: FreshWaterData;
  onUpdate: (data: FreshWaterData) => void;
  header: ReportHeader;
}

const EMPTY_ENTRY: FreshWaterEntry = {
  id: "",
  no: 1,
  pelabuhan: "",
  tanggal: "",
  sisa_air_sebelum: "",
  jumlah_pengisian: "",
  penggunaan_air: "",
  pengisian_via: "KADE",
  harga_per_ton: "",
  jumlah_harga: "",
  port_time: "",
};

export const FreshWaterForm: React.FC<Props> = ({ data, onUpdate, header }) => {
  // Helper to update root data fields
  const updateField = (field: keyof FreshWaterData, value: any) => {
    let val = value;
    if (field === 'tempat_laporan' && typeof value === 'string') {
      val = value.toUpperCase();
    }
    onUpdate({ ...data, [field]: val });
  };

  const handleAddEntry = () => {
    const newEntry: FreshWaterEntry = {
      ...EMPTY_ENTRY,
      id: Date.now().toString(),
      no: data.entries.length + 1,
      sisa_air_sebelum: "",
    };
    onUpdate({
      ...data,
      entries: [...data.entries, newEntry],
    });
  };

  const handleUpdateEntry = (
    id: string,
    field: keyof FreshWaterEntry,
    value: any
  ) => {
    const updatedEntries = data.entries.map((entry) => {
      if (entry.id === id) {
        let val = value;
        if (field === 'pelabuhan' && typeof value === 'string') {
          val = value.toUpperCase();
        }
        const updated = { ...entry, [field]: val };

        // Auto-calculate total price
        if (field === "jumlah_pengisian" || field === "harga_per_ton") {
          updated.jumlah_harga =
            Number(updated.jumlah_pengisian) * Number(updated.harga_per_ton);
        }

        return updated;
      }
      return entry;
    });

    // Auto-calculate Consumption (Penggunaan)
    // Formula: Consumption = Sisa Awal + Isi - Sisa Awal (Next Row)
    // Only applies if there IS a next row.
    const reCalcEntries = updatedEntries.map((entry, index) => {
      if (index < updatedEntries.length - 1) {
        const nextEntry = updatedEntries[index + 1];
        const sisa = Number(entry.sisa_air_sebelum) || 0;
        const isi = Number(entry.jumlah_pengisian) || 0;
        const nextSisa = Number(nextEntry.sisa_air_sebelum) || 0;

        // Only update if we have values to work with, or just always update?
        // User requested: =[@D]+[@E]-D20
        const consumption = sisa + isi - nextSisa;
        return { ...entry, penggunaan_air: consumption > 0 ? consumption : 0 }; // Avoid negative inputs? Or allow them? Usually consumption is positive. keeping it simple.
        // Let allows negative just in case logic needs it, but usage is usually positive.
        // Actually, let's keep it exact formula.
        return { ...entry, penggunaan_air: sisa + isi - nextSisa };
      }
      return entry;
    });

    // Also need to re-calc IF the "Next Row" changed (which is this row, affecting the PREVIOUS row)
    // So better to just run a full pass or localized pass.
    // A full pass is safer and cheap for small lists.

    const finalEntries = reCalcEntries.map((entry, idx) => {
      if (idx < reCalcEntries.length - 1) {
        const nextEntry = reCalcEntries[idx + 1];
        const sisa = Number(entry.sisa_air_sebelum) || 0;
        const isi = Number(entry.jumlah_pengisian) || 0;
        const nextSisa = Number(nextEntry.sisa_air_sebelum) || 0;
        return { ...entry, penggunaan_air: sisa + isi - nextSisa };
      }
      return entry;
    });

    onUpdate({ ...data, entries: finalEntries });
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Hapus baris ini?")) {
      const remaining = data.entries
        .filter((e) => e.id !== id)
        .map((e, idx) => ({ ...e, no: idx + 1 }));
      onUpdate({ ...data, entries: remaining });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-slate-200 justify-between items-center p-4 bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Droplets className="text-blue-600" /> Input Laporan Air Tawar
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">
                1. Tabel Penerimaan & Pemakaian
              </h3>
              <button
                onClick={handleAddEntry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Tambah Baris
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8">No</th>
                    <th className="p-2 min-w-[120px]">Pelabuhan & Tanggal</th>
                    <th className="p-2 text-right">Sisa Awal</th>
                    <th className="p-2 text-right text-blue-600">
                      Terima (Ton)
                    </th>
                    <th className="p-2 text-right text-red-600">Pakai (Ton)</th>
                    <th className="p-2">Via</th>
                    <th className="p-2 text-right">Harga/Ton</th>
                    <th className="p-2 text-right min-w-[140px]">
                      Total Harga
                    </th>
                    <th className="p-2">Port Time</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-8 text-center text-slate-400 italic"
                      >
                        Belum ada data. Klik "Tambah Baris" untuk memulai.
                      </td>
                    </tr>
                  ) : (
                    data.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500">
                          {entry.no}
                        </td>
                        <td className="p-2 space-y-1">
                          <div className="flex items-center gap-1 border rounded p-1">
                            <Anchor size={12} className="text-slate-400" />
                            <input
                              type="text"
                              className="w-full outline-none bg-transparent font-medium uppercase"
                              placeholder="NAMA PELABUHAN"
                              value={entry.pelabuhan}
                              onChange={(e) =>
                                handleUpdateEntry(
                                  entry.id,
                                  "pelabuhan",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center gap-1 border rounded p-1">
                            <input
                              type="date"
                              className="w-full outline-none bg-transparent text-xs"
                              value={entry.tanggal}
                              onChange={(e) =>
                                handleUpdateEntry(
                                  entry.id,
                                  "tanggal",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-full p-1 border rounded text-right"
                            value={entry.sisa_air_sebelum}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "sisa_air_sebelum",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-full p-1 border border-blue-200 rounded text-right font-semibold text-blue-700 bg-blue-50"
                            value={entry.jumlah_pengisian}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "jumlah_pengisian",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-full p-1 border border-red-200 rounded text-right font-semibold text-red-700 bg-red-50"
                            value={entry.penggunaan_air}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "penggunaan_air",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          <select
                            className="w-full p-1 border rounded text-xs"
                            value={entry.pengisian_via}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "pengisian_via",
                                e.target.value
                              )
                            }
                          >
                            <option value="KADE">KADE</option>
                            <option value="MOBIL">MOBIL</option>
                            <option value="TONGKANG">TONGKANG</option>
                            <option value="LAINNYA">LAINNYA</option>
                            <option value="">-</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center border rounded p-1 gap-1">
                            <span className="text-slate-400 text-xs">Rp</span>
                            <input
                              type="number"
                              className="w-full outline-none text-right"
                              value={entry.harga_per_ton}
                              onChange={(e) =>
                                handleUpdateEntry(
                                  entry.id,
                                  "harga_per_ton",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono font-medium text-slate-700 bg-slate-50 border-b whitespace-nowrap">
                          Rp{" "}
                          {Number(entry.jumlah_harga).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full p-1 border rounded text-right"
                            placeholder="ex: 3 Jam"
                            value={entry.port_time}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "port_time",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-700">
                  <tr>
                    <td colSpan={2} className="p-3 text-right">
                      TOTAL:
                    </td>
                    <td className="p-3 text-right">

                    </td>
                    <td className="p-3 text-right">
                      {data.entries.reduce(
                        (sum, e) => sum + Number(e.jumlah_pengisian),
                        0
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {data.entries.reduce(
                        (sum, e) => sum + Number(e.penggunaan_air),
                        0
                      )}
                    </td>
                    <td colSpan={2}></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      Rp{" "}
                      {data.entries
                        .reduce((sum, e) => sum + Number(e.jumlah_harga), 0)
                        .toLocaleString("id-ID")}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 2: Footer Inputs (Merged) */}
          {/* Section 2: Footer Inputs - Unified */}
          <div className="border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                <Droplets size={18} className="text-blue-500" /> Informasi Data
                Akhir & Tangki
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Kapasitas Total Tangki (Ton)
                  </label>
                  <input
                    type="number"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={data.kapasitas_total_tangki}
                    onChange={(e) =>
                      updateField("kapasitas_total_tangki", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Sisa Air Tawar DOCK
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={data.sisa_air_dock}
                    onChange={(e) =>
                      updateField("sisa_air_dock", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Voyage Lalu
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Input Manual No. Voy"
                    value={data.voyage_lalu_nomor}
                    onChange={(e) =>
                      updateField("voyage_lalu_nomor", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Sisa Air Tawar Voy Lalu (Ton)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Input Manual Sisa Lalu"
                    value={data.voyage_lalu_sisa_air}
                    onChange={(e) =>
                      updateField("voyage_lalu_sisa_air", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" /> Tempat &
                Tanggal Laporan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Tempat / Kota
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="ex: Surabaya"
                    value={data.tempat_laporan}
                    onChange={(e) =>
                      updateField("tempat_laporan", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    value={data.tanggal_laporan}
                    onChange={(e) =>
                      updateField("tanggal_laporan", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
