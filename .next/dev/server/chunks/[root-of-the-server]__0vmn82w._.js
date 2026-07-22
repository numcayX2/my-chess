module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
function evalToThai(evalCp, mate) {
    if (mate !== null) {
        const side = mate > 0 ? "ฝ่ายขาว" : "ฝ่ายดำ";
        return `รุกฆาตได้ใน ${Math.abs(mate)} ตา (ฝั่งที่ได้เปรียบ: ${side})`;
    }
    if (evalCp === null) return "ไม่ทราบค่าประเมิน";
    const pawns = (evalCp / 100).toFixed(2);
    const side = evalCp >= 0 ? "ฝ่ายขาวได้เปรียบ" : "ฝ่ายดำได้เปรียบ";
    return `${side} ประมาณ ${Math.abs(Number(pawns))} เบี้ย (${pawns})`;
}
async function POST(req) {
    try {
        const body = await req.json();
        const { fen, lastMoveSan, moverColor, evalCp, mate, bestMoveSan, classification } = body;
        const prompt = `คุณคือโค้ชหมากรุกที่อธิบายเป็นภาษาไทย กระชับ ตรงประเด็น เข้าใจง่าย ไม่เกิน 4-5 ประโยค
ห้ามใช้สัญลักษณ์ markdown หนักๆ ตอบเป็นข้อความล้วน

ข้อมูลตำแหน่งปัจจุบัน (หลังจากผู้เล่นเดิน):
- FEN: ${fen}
- ผู้เดินล่าสุด: ${moverColor === "w" ? "ฝ่ายขาว (ผู้เล่น)" : "ฝ่ายดำ"}
- หมากที่เดินไป: ${lastMoveSan ?? "ไม่มี (ยังไม่เริ่มเดิน)"}
- การประเมินตำแหน่งหลังเดิน: ${evalToThai(evalCp, mate)}
- หมากที่เอนจิ้นแนะนำว่าดีที่สุดคือ: ${bestMoveSan ?? "ไม่ทราบ"}
- ระดับการเดินนี้ตามเอนจิ้น: ${classification ?? "ไม่ทราบ"}

โปรดอธิบายให้ผู้เล่นเข้าใจว่า:
1. การเดินนี้ดีหรือไม่ดีอย่างไร
2. ถ้าไม่ใช่หมากที่ดีที่สุด ควรเดินอะไรแทนและเพราะเหตุใดจึงดีกว่า
3. คำแนะนำสั้นๆ สำหรับตาต่อไป`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });
        if (!res.ok) {
            const text = await res.text();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Gemini ตอบกลับผิดพลาด (${res.status}): ${text}`
            }, {
                status: 502
            });
        }
        const data = await res.json();
        const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            explanation
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `เรียก Gemini ไม่สำเร็จ: ${message}. ตรวจสอบ GEMINI_API_KEY ใน .env.local`
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0vmn82w._.js.map