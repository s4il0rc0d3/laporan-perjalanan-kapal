import React, { useState, useEffect } from 'react';
import { VoyageLeg, INITIAL_LEG } from '../types';
import { Save, Calculator } from 'lucide-react';

interface Props {
  onAddLeg: (leg: VoyageLeg) => void;
  onUpdateLeg: (leg: VoyageLeg) => void;
  editingLeg: VoyageLeg | null;
  onCancelEdit: () => void;
  nextNo: number;
  previousLeg?: VoyageLeg;
}

export const VoyageEntryForm: React.FC<Props> = ({
  onAddLeg,
  onUpdateLeg,
  editingLeg,
  onCancelEdit,
  nextNo,
  previousLeg
}) => {
  const [formData, setFormData] = useState<VoyageLeg>(INITIAL_LEG);

  useEffect(() => {
    if (editingLeg) {
      setFormData(editingLeg);
    } else {
      setFormData({
        ...INITIAL_LEG,
        no: nextNo,
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        muatan_semua: previousLeg ? Number(previousLeg.muatan_semua) : 0,
        dari: previousLeg ? previousLeg.ke : ''
      });
    }
  }, [editingLeg, nextNo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | number = value;

    if (type === 'number') {
      // If empty string, treat as 0 in state, but UI handles the display
      val = value === '' ? 0 : parseFloat(value);
    }

    if (['dari', 'ke', 'pelabuhan_bm', 'kegiatan_bm'].includes(name)) {
      val = value.toUpperCase();
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: val };

      // Auto-calc total passengers
      if (name.startsWith('pax_')) {
        newData.pax_total =
          (name === 'pax_1a' ? (val as number) : newData.pax_1a) +
          (name === 'pax_1b' ? (val as number) : newData.pax_1b) +
          (name === 'pax_2a' ? (val as number) : newData.pax_2a) +
          (name === 'pax_2b' ? (val as number) : newData.pax_2b) +
          (name === 'pax_ekonomi' ? (val as number) : newData.pax_ekonomi);
      }

      // Helper to parse numbers from string/number fields
      const parseNum = (v: string | number) => {
        if (typeof v === 'number') return v;
        if (!v || v === '-') return 0;
        const cleaned = v.toString().replace(',', '.').replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
      };

      // Auto-calc Cargo Total (Jumlah yang dikerjakan = Dimuat + Dibongkar)
      if (name === 'muatan_dimuat' || name === 'muatan_dibongkar') {
        const dimuat = name === 'muatan_dimuat' ? val : newData.muatan_dimuat;
        const dibongkar = name === 'muatan_dibongkar' ? val : newData.muatan_dibongkar;

        const valDimuat = parseNum(dimuat);
        const valDibongkar = parseNum(dibongkar);

        if (valDimuat > 0 || valDibongkar > 0) {
          newData.muatan_total = valDimuat + valDibongkar;
        }
      }

      // Auto-calc Cargo Muatan Semua (Total Cargo on Board)
      // Formula: Muatan Sebelumnya + Dimuat - Dibongkar
      if (['muatan_dimuat', 'muatan_dibongkar'].includes(name)) {
        const prevMuatan = previousLeg ? parseNum(previousLeg.muatan_semua) : 0;
        const dimuat = parseNum(newData.muatan_dimuat);
        const dibongkar = parseNum(newData.muatan_dibongkar);
        newData.muatan_semua = prevMuatan + dimuat - dibongkar;
      }

      // Auto-calc TOTAL BOBOT (Jumlah)
      // New Formula: Muatan Semua + ROB FO + ROB FW + ROB Ballast + Terima FO + Terima FW + Perbekalan
      // (Using Muatan Semua as it represents the total cargo on board at departure)
      if (['muatan_dimuat', 'muatan_dibongkar', 'muatan_semua', 'rob_fo', 'rob_fw', 'rob_ballast', 'terima_fo', 'terima_fw', 'perbekalan'].includes(name)) {
        const m_semua = parseNum(newData.muatan_semua);
        const r_fo = parseNum(newData.rob_fo);
        const r_fw = parseNum(newData.rob_fw);
        const r_ballast = parseNum(newData.rob_ballast);
        const t_fo = parseNum(newData.terima_fo);
        const t_fw = parseNum(newData.terima_fw);
        const perbekalan = parseNum(newData.perbekalan);

        newData.total_bobot = m_semua + r_fo + r_fw + r_ballast + t_fo + t_fw + perbekalan;
      }

      // Auto-calc Jarak (Distance) logic
      // Formula: Total Jarak (Col 11) = Full Away (Col 10) + Alur
      // Formula: Full Away (Col 10) = Total Jarak (Col 11) - Alur
      if (name === 'jarak') {
        newData.jarak_full_away = (val as number) - parseNum(newData.jarak_alur);
      } else if (name === 'jarak_alur') {
        newData.jarak_full_away = parseNum(newData.jarak) - (val as number);
      } else if (name === 'jarak_full_away') {
        newData.jarak = (val as number) + parseNum(newData.jarak_alur);
      }

      return newData;
    });
  };

  const calculateDuration = () => {
    if (!formData.bertolak_tanggal || !formData.bertolak_jam || !formData.tiba_tanggal || !formData.tiba_jam) return;

    // Helper to normalize time input (replace . with : for Date parsing)
    const normalizeTime = (t: string) => {
      if (!t) return "00:00";
      // Replace dot with colon (e.g., 12.30 -> 12:30)
      let timeStr = t.replace('.', ':');
      if (timeStr.split(':').length === 2) {
        return timeStr;
      }
      return timeStr;
    };

    const startTimeStr = normalizeTime(formData.bertolak_jam);
    const endTimeStr = normalizeTime(formData.tiba_jam);

    const start = new Date(`${formData.bertolak_tanggal}T${startTimeStr}`);
    const end = new Date(`${formData.tiba_tanggal}T${endTimeStr}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Format tanggal atau jam salah. Gunakan format jam HH:MM atau HH.MM");
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      alert("Waktu Tiba tidak boleh sebelum Waktu Bertolak");
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const jamString = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;

    // Auto calc speed if distance exists
    let newSpeed = formData.kecepatan;
    if (formData.jarak > 0) {
      const totalHours = (diffMs / (1000 * 60 * 60));
      if (totalHours > 0) {
        newSpeed = parseFloat((formData.jarak / totalHours).toFixed(2));
      }
    }

    setFormData(prev => ({
      ...prev,
      durasi_hari: days,
      durasi_jam: jamString,
      kecepatan: newSpeed
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeg) {
      onUpdateLeg(formData);
    } else {
      onAddLeg(formData);
      setFormData({
        ...INITIAL_LEG,
        no: nextNo + 1,
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        dari: formData.ke
      });
    }
  };

  const valOrEmpty = (val: number | string) => {
    if (val === 0 || val === '0') return '';
    return val;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">
          {editingLeg ? `Edit Data Baris #${formData.no}` : 'Input Data Baru'}
        </h2>
        <div className="space-x-2">
          {editingLeg && (
            <button type="button" onClick={onCancelEdit} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Batal
            </button>
          )}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium">
            <Save size={18} />
            {editingLeg ? 'Simpan Perubahan' : 'Tambahkan ke Laporan'}
          </button>
        </div>
      </div>

      {/* Rute & Waktu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500">Dari</label>
          <input required type="text" name="dari" value={formData.dari} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Pelabuhan Asal" />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500">Ke</label>
          <input required type="text" name="ke" value={formData.ke} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Pelabuhan Tujuan" />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>WAKTU BERTOLAK</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal</label>
              <input type="date" name="bertolak_tanggal" value={formData.bertolak_tanggal} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm cursor-pointer relative z-20 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Jam</label>
              <input type="text" name="bertolak_jam" value={formData.bertolak_jam} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-green-800 mb-3 flex items-center gap-2">
            <span>WAKTU TIBA</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal</label>
              <input type="date" name="tiba_tanggal" value={formData.tiba_tanggal} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm cursor-pointer relative z-20 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Jam</label>
              <input type="text" name="tiba_jam" value={formData.tiba_jam} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <button type="button" onClick={calculateDuration} className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold border border-orange-300 transition-colors shadow-sm">
            <Calculator size={18} /> Hitung Durasi Perjalanan
          </button>
        </div>
      </div>

      {/* Kalkulasi Perjalanan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-500">Hari</label>
          <input type="number" name="durasi_hari" value={valOrEmpty(formData.durasi_hari)} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Jam (HH.MM)</label>
          <input type="text" name="durasi_jam" value={formData.durasi_jam === '00.00' ? '' : formData.durasi_jam} onChange={handleChange} placeholder="00.00" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Jarak (Total Col 11)</label>
          <input type="number" step="0.1" name="jarak" value={valOrEmpty(formData.jarak)} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Jarak Alur (NM)</label>
          <input type="number" step="0.1" name="jarak_alur" value={valOrEmpty(formData.jarak_alur)} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Jarak Full Away (Col 10)</label>
          <input type="number" step="0.1" name="jarak_full_away" value={valOrEmpty(formData.jarak_full_away)} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Kecepatan (Knots)</label>
          <input type="number" step="0.01" name="kecepatan" value={valOrEmpty(formData.kecepatan)} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Putaran Mesin</label>
          <input type="text" name="putaran_mesin" value={formData.putaran_mesin} onChange={handleChange} placeholder="420/430" className="w-full p-2 border rounded" />
        </div>
        <div className="md:col-span-3 flex flex-col justify-center text-[12px] text-slate-500 italic leading-tight pl-2 border-l border-slate-300 ml-2">
          <p>• Jarak Total - Jarak alur = Jarak Fullaway</p>
          <p>• Misalkan Alur Surabaya 23.45 NM + Jarak Alur Kumai 18.34 = Hasil Jarak Alur</p>
        </div>
      </div>

      {/* BERLABUH / ALUR / REDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-4 rounded-lg border border-blue-100">
        <div className="space-y-3">
          <div className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
            <span>Berlabuh / Alur / Rede (Mulai)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal</label>
              <input type="date" name="berlabuh_tgl_mulai" value={formData.berlabuh_tgl_mulai} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Jam</label>
              <input type="text" name="berlabuh_jam_mulai" value={formData.berlabuh_jam_mulai} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
            <span>Berlabuh / Alur / Rede (Selesai)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal</label>
              <input type="date" name="berlabuh_tgl_selesai" value={formData.berlabuh_tgl_selesai} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Jam</label>
              <input type="text" name="berlabuh_jam_selesai" value={formData.berlabuh_jam_selesai} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LOGISTIK WRAPPER (Col 1) */}
        <div className="space-y-4">

          {/* BAHAN BAKAR (FO) */}
          <div className="border p-3 rounded-lg relative bg-slate-50/50">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">Bahan Bakar (FO)</span>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">ROB Tiba</label>
                <input type="number" name="rob_tiba_fo" value={valOrEmpty(formData.rob_tiba_fo)} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">ROB Tolak</label>
                <input type="number" name="rob_fo" value={valOrEmpty(formData.rob_fo)} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm" />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[10px] text-green-600 font-bold mb-1">Terima / Bunkering</label>
              <input type="text" name="terima_fo" value={formData.terima_fo === '-' ? '' : formData.terima_fo} onChange={handleChange} className="w-full p-2 border border-green-200 rounded text-sm bg-green-50/30 font-medium" placeholder="Jumlah Pengisian" />
            </div>
          </div>

          {/* AIR TAWAR (FW) */}
          <div className="border p-3 rounded-lg relative bg-slate-50/50">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">Air Tawar (FW)</span>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 shallow">ROB Tiba</label>
                <input type="number" name="rob_tiba_fw" value={valOrEmpty(formData.rob_tiba_fw)} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">ROB Tolak</label>
                <input type="number" name="rob_fw" value={valOrEmpty(formData.rob_fw)} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm" />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[10px] text-green-600 font-bold mb-1">Terima / Isi</label>
              <input type="text" name="terima_fw" value={formData.terima_fw === '-' ? '' : formData.terima_fw} onChange={handleChange} className="w-full p-2 border border-green-200 rounded text-sm bg-green-50/30 font-medium" placeholder="Jumlah Pengisian" />
            </div>
          </div>

        </div>

        {/* SARAT & PERBEKALAN WRAPPER (Col 2) */}
        <div className="space-y-4">
          {/* SARAT / DRAFT */}
          <div className="border p-3 rounded-lg relative bg-slate-50/50">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">Sarat (Draft)</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Depan (MK)</label>
                <input type="number" step="0.1" name="draft_depan" value={valOrEmpty(formData.draft_depan)} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Belakang (Blk)</label>
                <input type="number" step="0.1" name="draft_belakang" value={valOrEmpty(formData.draft_belakang)} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
              </div>
            </div>
          </div>

          {/* PERBEKALAN & JUMLAH (Moved Here) */}
          {/* PERBEKALAN & BALLAST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border p-2 rounded-lg relative bg-slate-50/50">
              <label className="block text-[9px] font-bold text-slate-500 mb-1">Perbekalan</label>
              <input type="number" name="perbekalan" value={valOrEmpty(formData.perbekalan)} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <div className="border p-2 rounded-lg relative bg-slate-50/50">
              <label className="block text-[9px] font-bold text-slate-500 mb-1">Ballast (ROB)</label>
              <input type="number" name="rob_ballast" value={valOrEmpty(formData.rob_ballast)} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            </div>
          </div>

          {/* JUMLAH (TOTAL) */}
          <div className="border p-2 rounded-lg relative bg-blue-50/50 border-blue-200">
            <label className="block text-[9px] font-bold text-blue-800 mb-1">Jumlah (Total)</label>
            <input type="number" name="total_bobot" value={valOrEmpty(formData.total_bobot)} disabled className="w-full p-2 border bg-blue-100 text-blue-900 font-bold rounded text-sm cursor-not-allowed" />
          </div>
        </div>

        {/* PENUMPANG (Col 3) */}
        <div className="border p-3 rounded-lg relative bg-slate-50/50 h-fit">
          <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">Penumpang</span>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {['pax_1a', 'pax_1b', 'pax_2a', 'pax_2b', 'pax_ekonomi'].map(key => (
              <div key={key}>
                <label className="block text-[9px] uppercase text-slate-400 mb-1">
                  {key === 'pax_ekonomi' ? 'Ekonomi' : key.replace('pax_', 'Kelas ')}
                </label>
                <input
                  type="number"
                  name={key}
                  value={valOrEmpty(formData[key as keyof VoyageLeg] as number)}
                  onChange={handleChange}
                  className="w-full p-1.5 border rounded text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase text-slate-800 font-bold">Total Penumpang</label>
              <input
                type="number"
                value={valOrEmpty(formData.pax_total)}
                disabled
                className="w-24 p-1.5 border bg-slate-200 font-bold rounded text-sm text-slate-700 text-right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MUATAN SECTION */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase">Muatan (Cargo)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Pelabuhan Bongkar/Muat</label>
            <input
              type="text"
              name="pelabuhan_bm"
              value={formData.pelabuhan_bm}
              onChange={handleChange}
              className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm uppercase"
              placeholder="NAMA PELABUHAN"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Kegiatan</label>
            <select
              name="kegiatan_bm"
              value={formData.kegiatan_bm}
              onChange={handleChange}
              className="w-full h-[42px] p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm text-sm"
              style={{
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="">- Pilih Kegiatan -</option>
              <option value="BONGKAR">BONGKAR</option>
              <option value="MUAT">MUAT</option>
              <option value="BONGKAR / MUAT">BONGKAR / MUAT</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Mulai BM</label>
              <input type="text" name="mulai_bm" value={formData.mulai_bm} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Selesai BM</label>
              <input type="text" name="selesai_bm" value={formData.selesai_bm} onChange={handleChange} className="w-full h-[42px] p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" placeholder="00.00" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Dimuat</label>
            <input type="text" name="muatan_dimuat" value={formData.muatan_dimuat === '-' ? '' : formData.muatan_dimuat} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Dibongkar</label>
            <input type="text" name="muatan_dibongkar" value={formData.muatan_dibongkar === '-' ? '' : formData.muatan_dibongkar} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Jumlah yg Dikerjakan</label>
            <input type="text" name="muatan_total" value={formData.muatan_total === '-' ? '' : formData.muatan_total} disabled className="w-full p-2 border bg-slate-200 text-slate-600 rounded cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Muatan Semua</label>
            <input type="number" name="muatan_semua" value={valOrEmpty(formData.muatan_semua)} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

    </form>
  );
};
