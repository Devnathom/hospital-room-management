import pdfMake from "pdfmake/build/pdfmake";
import { formatThaiDate } from "@/lib/thai-date";

const statusTh: Record<string, string> = {
  in_room: "อยู่ในห้อง",
  treated: "รักษาแล้ว",
  referred: "ส่งต่อ",
  sent_home: "ส่งกลับบ้าน",
};

async function loadFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let fontsRegistered = false;

async function ensureFonts() {
  if (fontsRegistered) return;

  const [regularB64, boldB64] = await Promise.all([
    loadFontAsBase64("/fonts/Sarabun-Regular.ttf"),
    loadFontAsBase64("/fonts/Sarabun-Bold.ttf"),
  ]);

  (pdfMake as any).vfs = {
    "Sarabun-Regular.ttf": regularB64,
    "Sarabun-Bold.ttf": boldB64,
  };

  (pdfMake as any).fonts = {
    Sarabun: {
      normal: "Sarabun-Regular.ttf",
      bold: "Sarabun-Bold.ttf",
      italics: "Sarabun-Regular.ttf",
      bolditalics: "Sarabun-Bold.ttf",
    },
  };

  fontsRegistered = true;
}

interface GeneratePdfOptions {
  visits: any[];
  dateFrom: string;
  dateTo: string;
  schoolName: string;
  staffName: string;
}

export async function generateAndOpenPdf({
  visits,
  dateFrom,
  dateTo,
  schoolName,
  staffName,
}: GeneratePdfOptions) {
  await ensureFonts();

  const thaiFrom = formatThaiDate(dateFrom);
  const thaiTo = formatThaiDate(dateTo);
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerRow = [
    "ลำดับ", "วันที่", "เวลา", "ชื่อนักเรียน", "ห้อง",
    "ห้องพยาบาล", "อาการ", "การรักษา", "ยาที่ให้", "สถานะ", "ผู้ดูแล",
  ].map((t) => ({ text: t, bold: true, alignment: "center" as const, fontSize: 9 }));

  const dataRows = visits.map((v: any, i: number) => {
    const d = v.visit_date?.split?.("T")[0] || String(v.visit_date).split("T")[0];
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

  const docDef: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [28, 28, 28, 36],
    defaultStyle: { font: "Sarabun", fontSize: 10, color: "#000" },

    content: [
      { text: schoolName, fontSize: 17, bold: true, alignment: "center" },
      { text: "รายงานการใช้ห้องพยาบาล", fontSize: 14, bold: true, alignment: "center", margin: [0, 2, 0, 2] },
      { text: `ช่วงเวลา: ${thaiFrom}  ถึง  ${thaiTo}`, fontSize: 10, alignment: "center" },
      {
        columns: [
          { text: `วันที่พิมพ์: ${today}`, fontSize: 9 },
          { text: `จำนวน: ${visits.length} รายการ`, fontSize: 9, alignment: "center" },
          { text: `ผู้พิมพ์: ${staffName}`, fontSize: 9, alignment: "right" },
        ],
        margin: [0, 4, 0, 0],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 786, y2: 0, lineWidth: 1.5 }], margin: [0, 4, 0, 8] },

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

      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "\n\n\n", fontSize: 6 },
              { text: "ลงชื่อ .................................................", alignment: "center", fontSize: 10 },
              { text: "(..................................................)", alignment: "center", fontSize: 10, margin: [0, 2, 0, 0] },
              { text: "ครูพยาบาล", bold: true, alignment: "center", fontSize: 10, margin: [0, 2, 0, 0] },
              { text: "วันที่ ......../........./.........", alignment: "center", fontSize: 9, margin: [0, 3, 0, 0] },
            ],
          },
          {
            width: "*",
            stack: [
              { text: "\n\n\n", fontSize: 6 },
              { text: "ลงชื่อ .................................................", alignment: "center", fontSize: 10 },
              { text: "(..................................................)", alignment: "center", fontSize: 10, margin: [0, 2, 0, 0] },
              { text: "ผู้อำนวยการ / ครูใหญ่", bold: true, alignment: "center", fontSize: 10, margin: [0, 2, 0, 0] },
              { text: schoolName, alignment: "center", fontSize: 9, margin: [0, 1, 0, 0] },
              { text: "วันที่ ......../........./.........", alignment: "center", fontSize: 9, margin: [0, 3, 0, 0] },
            ],
          },
        ],
        margin: [0, 30, 0, 0],
      },
    ],

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `${schoolName} — รายงานการใช้ห้องพยาบาล`, fontSize: 8, color: "#666" },
        { text: `${thaiFrom} ถึง ${thaiTo}`, fontSize: 8, color: "#666", alignment: "center" },
        { text: `หน้า ${currentPage}/${pageCount}`, fontSize: 8, color: "#666", alignment: "right" },
      ],
      margin: [28, 0, 28, 0],
    }),
  };

  pdfMake.createPdf(docDef).open();
}
