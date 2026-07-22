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
"[project]/src/app/api/summary/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
async function POST(req) {
    try {
        const body = await req.json();
        const { pgn, playerColor, moves } = body;
        const playerMoves = moves.filter((m)=>m.byColor === playerColor);
        const flagged = playerMoves.filter((m)=>[
                "mistake",
                "blunder",
                "inaccuracy"
            ].includes(m.classification ?? ""));
        const flaggedText = flagged.map((m)=>`ตาที่ ${m.moveNumber} เดิน ${m.san} (ระดับ: ${m.classification}) — เอนจิ้นแนะนำ ${m.bestMoveBefore ?? "ไม่ทราบ"}`).join("\n");
        const prompt = `คุณคือโค้ชหมากรุกมืออาชีพ วิเคราะห์เกมที่จบแล้วให้ผู้เล่นฝั่ง${playerColor === "w" ? "ขาว" : "ดำ"} เป็นภาษาไทย

PGN ของเกม:
${pgn}

รายการตาที่ผู้เล่นเดินพลาด/ไม่แม่นยำ:
${flaggedText || "ไม่มีจุดพลาดสำคัญ"}

โปรดสรุปเป็นภาษาไทย ประมาณ 6-10 ประโยค ครอบคลุม:
1. ภาพรวมของเกม
2. จุดเปลี่ยนสำคัญของเกม (ถ้ามี)
3. รูปแบบข้อผิดพลาดที่เกิดซ้ำๆ
4. คำแนะนำ 2-3 ข้อที่ควรฝึกฝนต่อไป
ห้ามใช้ markdown หนักๆ ตอบเป็นข้อความล้วนอ่านลื่น`;
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
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            summary
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0jr7rzc._.js.map