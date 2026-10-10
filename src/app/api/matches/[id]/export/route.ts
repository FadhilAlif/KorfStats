import { NextRequest, NextResponse } from 'next/server';
import { generateScoreSheetWorkbook } from '@/lib/excel/scoresheet-exporter';
import { MatchState } from '@/types/match';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchData: MatchState = await req.json();

    const workbook = await generateScoreSheetWorkbook(matchData);
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `SCORE_SHEET_${matchData.matchCode || params.id}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengekspor file Excel' },
      { status: 500 }
    );
  }
}
