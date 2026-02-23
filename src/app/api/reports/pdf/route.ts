import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { formatThaiDate } from "@/lib/thai-date";
import path from "path";

const statusTh: Record<string, string> = {
  in_room: "อยู่ในห้อง",
  treated: "รักษาแล้ว",
  referred: "ส่งต่อ",
  sent_home: "ส่งกลับบ้าน",
};

function generatePdfBuffer(docDef: any, fonts: any): Promise<Buffer> {
  // Dynamic require to bypass Turbopack static analysis
  // eslint-disable-next-line no-eval
  const PdfPrinter = eval('require')("pdfmake/src/printer");
  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(docDef);
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    pdfDoc.on("data", (c: Buffer) => chunks.push(c));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const { dateFrom, dateTo } = await request.json();
    if (!dateFrom || !dateTo) return errorResponse("กรุณาระบุช่วงวันที่");

    const schoolId = session.schoolId;
    const school = schoolId
      ? await queryOne<any>("SELECT name FROM schools WHERE id = ?", [schoolId])
      : null;
    const schoolName = school?.name || "โรงเรียน";
    const staffName = session.fullName || session.email || "";

    const visits = await query<any>(
      `SELECT rv.*, s.full_name as student_name, s.class_name,
        hr.name as room_name, u.full_name as staff_name
       FROM room_visits rv
       LEFT JOIN students s ON rv.student_id = s.id
       LEFT JOIN health_rooms hr ON rv.health_room_id = hr.id
       LEFT JOIN users u ON rv.staff_id = u.id
       WHERE rv.school_id = ? AND rv.visit_date >= ? AND rv.visit_date <= ?
       ORDER BY rv.visit_date ASC, rv.visit_time ASC`,
      [schoolId, dateFrom, dateTo]
    );

    const thaiFrom = formatThaiDate(dateFrom);
    const thaiTo = formatThaiDate(dateTo);
    const today = new Date().toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric",
    });

    // Table body
    const headerRow = [
      "ลำดับ", "วันที่", "เวลา", "ชื่อนักเรียน", "ห้อง",
      "ห้องพยาบาล", "อาการ", "การรักษา", "ยาที่ให้", "สถานะ", "ผู้ดูแล",
    ].map((t) => ({ text: t, bold: true, alignment: "center" as const, fontSize: 9 }));

    const dataRows = visits.map((v: any, i: number) => {
      const d = v.visit_date?.toISOString?.()?.split("T")[0] || String(v.visit_date).split("T")[0];
      return [
        { text: String(i + 1), alignment: "center" as const, fontSize: 9 },
        { text: formatThaiDate(d, true), alignment: "center" as const, fontSize: 9 },
        { text: v.visit_time || "-", alignment: "center" as const, fontSize: 9 },
        { text: v.student_name || "-", fontSize: 9 },
        { text: v.class_name || "-", alignment: "center" as const, fontSize: 9 },
        { text: v.room_name || "-", fontSize: 9 },
        { text: (v.symptoms || "-").substring(0, 80), fontSize: 9 },
        { text: (v.treatment || "-").substring(0, 50), fontSize: 9 },
        { text: v.medication || "-", fontSize: 9 },
        { text: statusTh[v.status] || v.status, alignment: "center" as const, fontSize: 9 },
        { text: v.staff_name || "-", fontSize: 9 },
      ];
    });

    const docDef = {
      pageSize: "A4" as const,
      pageOrientation: "landscape" as const,
      pageMargins: [28, 28, 28, 36] as [number, number, number, number],
      defaultStyle: { font: "Sarabun", fontSize: 10, color: "#000" },

      content: [
        // Header
        { text: schoolName, fontSize: 17, bold: true, alignment: "center" as const },
        { text: "รายงานการใช้ห้องพยาบาล", fontSize: 14, bold: true, alignment: "center" as const, margin: [0, 2, 0, 2] as number[] },
        { text: `ช่วงเวลา: ${thaiFrom}  ถึง  ${thaiTo}`, fontSize: 10, alignment: "center" as const },
        {
          columns: [
            { text: `วันที่พิมพ์: ${today}`, fontSize: 9 },
            { text: `จำนวน: ${visits.length} รายการ`, fontSize: 9, alignment: "center" as const },
            { text: `ผู้พิมพ์: ${staffName}`, fontSize: 9, alignment: "right" as const },
          ],
          margin: [0, 4, 0, 0] as number[],
        },
        // Line
        { canvas: [{ type: "line", x1: 0, y1: 0, x2: 786, y2: 0, lineWidth: 1.5 }], margin: [0, 4, 0, 8] as number[] },

        // Table
        {
          table: {
            headerRows: 1,
            widths: [20, 60, 36, 90, 32, 55, "*", 68, 52, 44, 62],
            body: [headerRow, ...dataRows],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#000",
            vLineColor: () => "#000",
            paddingLeft: () => 3,
            paddingRight: () => 3,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },

        // Signatures
        {
          columns: [
            {
              width: "*",
              stack: [
                { text: "\n\n\n", fontSize: 6 },
                { text: "ลงชื่อ .................................................", alignment: "center" as const, fontSize: 10 },
                { text: "(..................................................)", alignment: "center" as const, fontSize: 10, margin: [0, 2, 0, 0] as number[] },
                { text: "ครูพยาบาล", bold: true, alignment: "center" as const, fontSize: 10, margin: [0, 2, 0, 0] as number[] },
                { text: "วันที่ ......../........./.........", alignment: "center" as const, fontSize: 9, margin: [0, 3, 0, 0] as number[] },
              ],
            },
            {
              width: "*",
              stack: [
                { text: "\n\n\n", fontSize: 6 },
                { text: "ลงชื่อ .................................................", alignment: "center" as const, fontSize: 10 },
                { text: "(..................................................)", alignment: "center" as const, fontSize: 10, margin: [0, 2, 0, 0] as number[] },
                { text: "ผู้อำนวยการ / ครูใหญ่", bold: true, alignment: "center" as const, fontSize: 10, margin: [0, 2, 0, 0] as number[] },
                { text: schoolName, alignment: "center" as const, fontSize: 9, margin: [0, 1, 0, 0] as number[] },
                { text: "วันที่ ......../........./.........", alignment: "center" as const, fontSize: 9, margin: [0, 3, 0, 0] as number[] },
              ],
            },
          ],
          margin: [0, 30, 0, 0] as number[],
        },
      ],

      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: `${schoolName} — รายงานการใช้ห้องพยาบาล`, fontSize: 8, color: "#666" },
          { text: `${thaiFrom} ถึง ${thaiTo}`, fontSize: 8, color: "#666", alignment: "center" as const },
          { text: `หน้า ${currentPage}/${pageCount}`, fontSize: 8, color: "#666", alignment: "right" as const },
        ],
        margin: [28, 0, 28, 0] as number[],
      }),
    };

    const fontsDir = path.join(process.cwd(), "public/fonts");
    const fonts = {
      Sarabun: {
        normal: path.join(fontsDir, "Sarabun-Regular.ttf"),
        bold: path.join(fontsDir, "Sarabun-Bold.ttf"),
        italics: path.join(fontsDir, "Sarabun-Regular.ttf"),
        bolditalics: path.join(fontsDir, "Sarabun-Bold.ttf"),
      },
    };

    const buffer = await generatePdfBuffer(docDef, fonts);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report-${dateFrom}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return errorResponse("เกิดข้อผิดพลาดในการสร้าง PDF: " + error.message, 500);
  }
}
