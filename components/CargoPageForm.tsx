
import React from 'react';
import { CargoActivity, SafetyData, CrewMember } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  cargoLogs: CargoActivity[];
  setCargoLogs: React.Dispatch<React.SetStateAction<CargoActivity[]>>;
  safetyData: SafetyData;
  setSafetyData: React.Dispatch<React.SetStateAction<SafetyData>>;
  crewList: CrewMember[];
  setCrewList: React.Dispatch<React.SetStateAction<CrewMember[]>>;
}

export const CargoPageForm: React.FC<Props> = ({
  cargoLogs,
  setCargoLogs,
  safetyData,
  setSafetyData,
  crewList,
  setCrewList
}) => {

  const addCargoRow = () => {
    setCargoLogs([
      ...cargoLogs,
      {
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        pelabuhan: '',
        tanggal: '',
        mulai_tgl: '',
        mulai_jam: '',
        selesai_tgl: '',
        selesai_jam: '',
        jenis_kegiatan: ''
      }
    ]);
  };

  const updateCargoRow = (id: string, field: keyof CargoActivity, value: string) => {
    setCargoLogs(logs => logs.map(log => log.id === id ? { ...log, [field]: value } : log));
  };

  const deleteCargoRow = (id: string) => {
    setCargoLogs(logs => logs.filter(log => log.id !== id));
  };

  const updateSafety = (field: keyof SafetyData, value: string) => {
    const val = typeof value === 'string' ? value.toUpperCase() : value;
    setSafetyData(prev => ({ ...prev, [field]: val }));
  };

  const updateCrew = (index: number, field: keyof CrewMember, value: string) => {
    const val = typeof value === 'string' ? value.toUpperCase() : value;
    const newCrew = [...crewList];
    newCrew[index] = { ...newCrew[index], [field]: val };
    setCrewList(newCrew);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Section 1: Laporan Bongkar Muat Removed - Now synced from LPK Form */}

      <div className="space-y-6">
        {/* Section 1: Awak Kapal - Pindah ke Atas & Full Width */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">1. Daftar Awak Kapal</h2>
          <p className="text-xs text-slate-500 mb-4">Isi nama awak kapal dan NRP sesuai jabatan.</p>

          <div className="border rounded overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3 text-left w-[160px]">Jabatan</th>
                  <th className="p-3 text-center">N a m a</th>
                  <th className="p-3 text-center w-[150px]">NRP</th>
                  <th className="p-3 text-center w-[160px]">Tgl Ditempatkan</th>
                  <th className="p-3 text-center w-[160px]">Tgl Dipindahkan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {crewList.map((crew, originalIdx) => {
                  if (crew.jabatan === 'ABK lainnya') return null;
                  return (
                    <tr key={originalIdx} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-3 font-semibold text-xs text-slate-700 bg-slate-50/50">{crew.jabatan}</td>
                      <td className="p-1">
                        <input
                          type="text"
                          className={`w-full p-2 border rounded outline-none transition-all text-center uppercase ${['Nakhoda', 'Mualim I'].includes(crew.jabatan) ? 'bg-slate-100 text-slate-500 cursor-not-allowed italic border-slate-200' : 'bg-white border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                          value={crew.nama}
                          onChange={e => updateCrew(originalIdx, 'nama', e.target.value)}
                          placeholder="-"
                          disabled={['Nakhoda', 'Mualim I'].includes(crew.jabatan)}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          className={`w-full p-2 border rounded outline-none transition-all text-center uppercase ${['Nakhoda', 'Mualim I'].includes(crew.jabatan) ? 'bg-slate-100 text-slate-500 cursor-not-allowed italic border-slate-200' : 'bg-white border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                          value={crew.nrp}
                          onChange={e => updateCrew(originalIdx, 'nrp', e.target.value)}
                          placeholder="-"
                          disabled={['Nakhoda', 'Mualim I'].includes(crew.jabatan)}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="date"
                          className="w-full p-2 border border-slate-300 rounded outline-none bg-white text-xs cursor-pointer text-center hover:border-blue-400 focus:border-blue-500"
                          value={crew.tanggal_ditempatkan || ''}
                          onChange={e => updateCrew(originalIdx, 'tanggal_ditempatkan', e.target.value)}
                          onClick={(e) => e.currentTarget.showPicker()}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="date"
                          className="w-full p-2 border border-slate-300 rounded outline-none bg-white text-xs cursor-pointer text-center hover:border-blue-400 focus:border-blue-500"
                          value={crew.tanggal_dipindahkan || ''}
                          onChange={e => updateCrew(originalIdx, 'tanggal_dipindahkan', e.target.value)}
                          onClick={(e) => e.currentTarget.showPicker()}
                        />
                      </td>
                    </tr>
                  );
                })}
                {/* Footer untuk Total Crew */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2 text-xs text-slate-700 italic px-4">JUMLAH ABK SELURUHNYA DI ATAS KAPAL</td>
                  <td className="p-2 text-center text-sm text-blue-700">
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                      value={safetyData.jumlah_abk_total}
                      onChange={e => updateSafety('jumlah_abk_total', e.target.value)}
                      placeholder={(crewList.filter(c => c.nama && c.nama.trim() !== '' && c.nama !== '-').length).toString()}
                    />
                  </td>
                  <td colSpan={2} className="p-2 text-center text-[10px] text-slate-500">ORANG</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Data Keselamatan & Latihan - Di bawah Crew */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">2. Data Keselamatan & Latihan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border p-4 rounded-lg bg-slate-50">
                <h3 className="font-bold text-sm mb-3 border-b pb-1 text-slate-700">Sekoci & Rakit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Sekoci (Peraturan)</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={safetyData.sekoci_menurut_peraturan} onChange={e => updateSafety('sekoci_menurut_peraturan', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Sekoci (Ada)</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={safetyData.sekoci_ada} onChange={e => updateSafety('sekoci_ada', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rakit (Peraturan)</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={safetyData.rakit_menurut_peraturan} onChange={e => updateSafety('rakit_menurut_peraturan', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rakit (Ada)</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={safetyData.rakit_ada} onChange={e => updateSafety('rakit_ada', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-lg bg-slate-50">
                <h3 className="font-bold text-sm mb-3 border-b pb-1 text-slate-700">Tanggal Latihan</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-medium text-slate-700">Sekoci diadakan tgl:</label>
                    <input type="text" className="w-2/3 p-2 border rounded bg-white shadow-sm" value={safetyData.latihan_sekoci_tgl} onChange={e => updateSafety('latihan_sekoci_tgl', e.target.value)} placeholder="ex: 8 & 15 Juli" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-medium text-slate-700">Kebakaran diadakan tgl:</label>
                    <input type="text" className="w-2/3 p-2 border rounded bg-white shadow-sm" value={safetyData.latihan_kebakaran_tgl} onChange={e => updateSafety('latihan_kebakaran_tgl', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border p-4 rounded-lg bg-slate-50">
                <h3 className="font-bold text-sm mb-3 border-b pb-1 text-slate-700">Kondisi Alat & Service</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    ['pompa_hydran', 'Pompa Hydran'],
                    ['pemadam_api', 'Alat Pemadam Api'],
                    ['saluran_hydran', 'Saluran Hydran'],
                    ['gasmasker', 'Gas Masker'],
                    ['alat_oxygen', 'Alat Oxygen'],
                    ['mes', 'MES (Marine Evacuation)'],
                    ['kemudi_darurat', 'Kemudi Darurat'],
                    ['naik_dok_terakhir', 'Kapal Naik Dok Terakhir di']
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <label className="text-[11px] text-slate-600 w-1/2">{label}</label>
                      <input
                        type="text"
                        className="w-1/2 p-1.5 border rounded text-xs bg-white"
                        value={safetyData[key as keyof SafetyData]}
                        onChange={e => updateSafety(key as keyof SafetyData, e.target.value)}
                      />
                    </div>
                  ))}

                  <div className="h-px bg-slate-200 my-2"></div>

                  {[
                    ['service_co2_system', 'CO2 System'],
                    ['service_apar_foam', 'APAR Foam'],
                    ['service_apar_co2', 'APAR CO2'],
                    ['service_apar_powder', 'APAR Powder'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-blue-700 w-1/2">{label} Service</label>
                      <input
                        type="date"
                        className="w-1/2 p-1.5 border rounded text-xs cursor-pointer bg-white"
                        value={safetyData[key as keyof SafetyData]}
                        onChange={e => updateSafety(key as keyof SafetyData, e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker()}
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2">
                    <label className="text-[11px] font-bold text-red-600 w-1/2 uppercase">Pemeriksaan Tikus</label>
                    <input
                      type="date"
                      className="w-1/2 p-1.5 border border-red-200 rounded text-xs cursor-pointer bg-red-50"
                      value={safetyData.pemeriksaan_tikus}
                      onChange={e => updateSafety('pemeriksaan_tikus', e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* MOVED HERE: Tanda Tangan */}
      {/* Tanda Tangan Section Removed as requested - Auto Sync from Global Settings used */}
    </div>
  );
};