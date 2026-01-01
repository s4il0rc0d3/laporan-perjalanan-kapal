import React from 'react';

interface Props {
    notes?: string;
}

const ReportExplanation: React.FC<Props> = ({ notes }) => {
    return (
        <div className="mt-4 font-sans text-[8px] print:text-[8pt] leading-tight px-1">
            <div className="flex mb-1">
                <div className="w-44 shrink-0 font-semibold italic">Jelaskan dengan singkat ttg</div>
                <div className="flex-1 italic">
                    Kerusakan, berhenti karena Kamar Mesin, pembuatan Kisah Kapal, lain2 hal,<br />
                    keadaan angin, cuaca, laut, pada waktu berlabuh, keadaan dalamnya air di berting-beting
                </div>
            </div>

            <div className="border border-black p-2 min-h-[120px] relative mt-2 bg-white">
                <div className="font-bold underline text-[7pt] print:text-[8pt] mb-1 ml-4 absolute top-2 left-0">CATATAN:</div>
                <div className="mt-6 px-4 whitespace-pre-wrap text-[7pt] print:text-[8pt] leading-relaxed text-left uppercase">
                    {notes ? notes.toUpperCase() : (
                        <div className="space-y-5 mt-4 opacity-10">
                            <div className="border-b border-black w-full h-1"></div>
                            <div className="border-b border-black w-full h-1"></div>
                            <div className="border-b border-black w-full h-1"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportExplanation;
