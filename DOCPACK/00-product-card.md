---
title: solo-cloud-monitor — Product Card
doc_id: CARD-solo-cloud-monitor
doc_type: product-card
verdict: showcase
version: 0.1
date: 2026-10-11
status: ร่างเพื่อพิจารณา
owner: Product owner (Book Dev)
---

# solo-cloud-monitor — Product Card

## 1. สรุปคุณค่าในหนึ่งประโยค

ตรวจว่าเว็บและ API ของเจ้าของยังตอบอยู่ทุก 5 นาทีด้วย Cloudflare Worker ฟรี พร้อมหน้าสถานะและ JSON

## 2. ปัญหาและผู้ใช้เป้าหมาย

ต้องรู้เมื่อเว็บล่มโดยไม่เสียเงิน ผู้ใช้คือเจ้าของ

## 3. สิ่งที่ทำได้จริงตอนนี้

- Worker (`src/worker.ts`) รัน cron `*/5 * * * *` เก็บสถานะ 24 ชั่วโมงใน KV
- endpoint `/status` (สาธารณะ) และ `/check` (ต้องมี bearer token ที่ตั้งไว้)

## 4. หลักฐานสถานะ

| รายการ | ค่า |
|---|---|
| Stack | TypeScript (Cloudflare Workers, KV) |
| Commit | 7 ครั้ง (2026-07-09 ถึง 2026-10-11) |
| ซอร์สโค้ด | 1 ไฟล์ / 172 บรรทัด |
| เทสต์ | 0 ไฟล์ (ไม่ได้รันในงานนี้) |
| CI | ไม่มี workflow |
| Deploy config | `wrangler.toml` (Cloudflare Worker) |
| Live URL | ไม่ได้ตรวจสด (README ต้อง re-auth Wrangler ก่อน deploy) |

## 5. คุณค่าและจุดต่าง

- ฟรี 100%
- ไม่มีมูลค่าขาย

## 6. ช่องว่างสำคัญ

- รายชื่อบริการใน README (เช่น bookdev.page) อาจล้าสมัยเทียบกับ online-systems.yaml **[ต้องยืนยัน]**
- ไม่มีเทสต์ (0 ไฟล์) และไม่มี CI

## 7. คำตัดสิน

**`showcase`** — เครื่องมือเล็กที่มีประโยชน์ แต่มีฟังก์ชันซ้ำกับ `task systems:status` ที่ probe สุขภาพจากทะเบียน จะเปลี่ยนเป็น `merge` ถ้าเจ้าของเลือกใช้ monitor จากทะเบียนเป็นตัวเดียว

## 8. ขั้นต่อไป

1. เทียบรายการที่ตรวจกับทะเบียนปัจจุบัน
2. เพิ่มเทสต์ของ logic ตรวจสถานะ

## การอนุมัติ

| บทบาท | สถานะ | วันที่ | ลงนาม |
|---|---|---|---|
| Product owner (Book Dev) | รอพิจารณา | — | ________ |

## แหล่งข้อมูล

- `README.md`
- `src/worker.ts`, `wrangler.toml`
