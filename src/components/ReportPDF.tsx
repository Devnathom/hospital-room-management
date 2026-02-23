import React from "react";
import { Document, Page, Text, View, Font } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Sarabun-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/Sarabun-Bold.ttf"), fontWeight: 700 },
  ],
});

const B = "#000";

const statusTh: Record<string, string> = {
  in_room: "อยู่ในห้อง",
  treated: "รักษาแล้ว",
  referred: "ส่งต่อ",
  sent_home: "ส่งกลับบ้าน",
};

export interface ReportData {
  visits: any[];
  schoolName: string;
  thaiFrom: string;
  thaiTo: string;
  today: string;
  staffName: string;
}

const COLS: [string, number | string, "left" | "center"][] = [
  ["ลำดับ", 24, "center"],
  ["วันที่", 68, "center"],
  ["เวลา", 42, "center"],
  ["ชื่อนักเรียน", 100, "left"],
  ["ห้อง", 42, "center"],
  ["ห้องพยาบาล", 62, "left"],
  ["อาการ", "flex", "left"],
  ["การรักษา", 80, "left"],
  ["ยาที่ให้", 60, "left"],
  ["สถานะ", 52, "center"],
  ["ผู้ดูแล", 68, "left"],
];

function CenteredText({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={{ width: "100%" }}>
      <Text style={[{ textAlign: "center", color: B }, style]}>{children}</Text>
    </View>
  );
}

export default function ReportPDF({ visits, schoolName, thaiFrom, thaiTo, today, staffName }: ReportData) {
  const cells = (v: any, i: number): string[] => [
    String(i + 1),
    v.visit_date_thai || "",
    v.visit_time || "",
    v.student_name || "",
    v.class_name || "-",
    v.room_name || "",
    (v.symptoms || "").substring(0, 80),
    (v.treatment || "-").substring(0, 50),
    v.medication || "-",
    statusTh[v.status] || v.status,
    v.staff_name || "",
  ];

  return (
    <Document title="รายงานการใช้ห้องพยาบาล" author={staffName}>
      <Page size="A4" orientation="landscape"
        style={{ fontFamily: "Sarabun", fontSize: 11, color: B, padding: 28, paddingBottom: 40 }}>

        {/* ===== HEADER ===== */}
        <View style={{ borderBottomWidth: 1.5, borderBottomColor: B, paddingBottom: 8, marginBottom: 8 }}>
          <CenteredText style={{ fontSize: 17, fontWeight: 700 }}>{schoolName}</CenteredText>
          <CenteredText style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>รายงานการใช้ห้องพยาบาล</CenteredText>
          <CenteredText style={{ fontSize: 10, marginTop: 2 }}>{`ช่วงเวลา: ${thaiFrom}  ถึง  ${thaiTo}`}</CenteredText>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <Text style={{ fontSize: 9 }}>{`วันที่พิมพ์: ${today}`}</Text>
            <Text style={{ fontSize: 9 }}>{`จำนวน: ${visits.length} รายการ`}</Text>
            <Text style={{ fontSize: 9 }}>{`ผู้พิมพ์: ${staffName}`}</Text>
          </View>
        </View>

        {/* ===== TABLE ===== */}
        <View style={{ borderWidth: 1, borderColor: B }}>
          {/* Header */}
          <View style={{ flexDirection: "row", backgroundColor: "#e0e0e0" }}>
            {COLS.map(([label, w], ci) => (
              <View key={ci} style={[
                { paddingVertical: 4, paddingHorizontal: 2, borderRightWidth: ci < COLS.length - 1 ? 0.5 : 0, borderRightColor: B },
                typeof w === "number" ? { width: w } : { flex: 1 },
              ]}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: B, textAlign: "center" }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {visits.map((v, ri) => {
            const vals = cells(v, ri);
            return (
              <View key={v.id ?? ri} style={{ flexDirection: "row", borderTopWidth: 0.5, borderTopColor: B }}>
                {COLS.map(([, w, align], ci) => (
                  <View key={ci} style={[
                    { paddingVertical: 3, paddingHorizontal: 2, borderRightWidth: ci < COLS.length - 1 ? 0.5 : 0, borderRightColor: B },
                    typeof w === "number" ? { width: w } : { flex: 1 },
                  ]}>
                    <Text style={{ fontSize: 9, color: B, textAlign: align }}>{vals[ci]}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          {visits.length === 0 && (
            <View style={{ borderTopWidth: 0.5, borderTopColor: B, paddingVertical: 8 }}>
              <Text style={{ fontSize: 10, textAlign: "center" }}>ไม่มีข้อมูล</Text>
            </View>
          )}
        </View>

        {/* ===== SIGNATURES ===== */}
        <View style={{ flexDirection: "row", marginTop: 40 }}>
          {/* ครูพยาบาล */}
          <View style={{ flex: 1 }}>
            <View style={{ height: 40 }} />
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10 }}>ลงชื่อ .................................................</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10, marginTop: 2 }}>(..................................................)</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10, fontWeight: 700, marginTop: 2 }}>ครูพยาบาล</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 9, marginTop: 3 }}>วันที่ ......../........./.........</Text></View>
          </View>

          {/* ผู้อำนวยการ */}
          <View style={{ flex: 1 }}>
            <View style={{ height: 40 }} />
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10 }}>ลงชื่อ .................................................</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10, marginTop: 2 }}>(..................................................)</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 10, fontWeight: 700, marginTop: 2 }}>ผู้อำนวยการ / ครูใหญ่</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 9, marginTop: 1 }}>{schoolName}</Text></View>
            <View style={{ width: "100%" }}><Text style={{ textAlign: "center", fontSize: 9, marginTop: 3 }}>วันที่ ......../........./.........</Text></View>
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <View fixed style={{ position: "absolute", bottom: 12, left: 28, right: 28,
          flexDirection: "row", justifyContent: "space-between",
          borderTopWidth: 0.5, borderTopColor: "#999", paddingTop: 3 }}>
          <Text style={{ fontSize: 8, color: "#666" }}>{`${schoolName} — รายงานการใช้ห้องพยาบาล`}</Text>
          <Text style={{ fontSize: 8, color: "#666" }}>{`${thaiFrom} ถึง ${thaiTo}`}</Text>
          <Text style={{ fontSize: 8, color: "#666" }}
            render={({ pageNumber, totalPages }) => `หน้า ${pageNumber}/${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
