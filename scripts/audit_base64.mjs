import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function isBase64(str) {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:') && str.includes(';base64,');
}

function parseBase64Info(str) {
  if (!isBase64(str)) return null;
  const match = str.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return { mime: 'unknown', sizeBytes: str.length };
  const mime = match[1];
  const b64Data = match[2];
  const padding = (b64Data.endsWith('==') ? 2 : b64Data.endsWith('=') ? 1 : 0);
  const sizeBytes = Math.floor((b64Data.length * 3) / 4) - padding;
  return { mime, sizeBytes };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function sanitizeId(id) {
  return (id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function runFullAudit() {
  const auditReport = {
    timestamp: new Date().toISOString(),
    bucketsStatus: {},
    totalBase64Records: 0,
    totalBase64Bytes: 0,
    byTableCount: {},
    findings: []
  };

  const targetBuckets = [
    'vendor-logos',
    'vendor-covers',
    'vendor-gallery',
    'product-images',
    'promotion-receipts',
    'verification-receipts',
  ];

  // 1. Verify Buckets
  const { data: existingBuckets } = await supabase.storage.listBuckets();
  const existingMap = new Map((existingBuckets || []).map(b => [b.id, b]));

  for (const bName of targetBuckets) {
    const bucketObj = existingMap.get(bName);
    let probeSuccess = false;
    let probeError = null;

    try {
      const testPath = `_audit_probe_${Date.now()}.txt`;
      const testBlob = new Blob(['probe'], { type: 'text/plain' });
      const { data, error } = await supabase.storage.from(bName).upload(testPath, testBlob, { upsert: true });
      if (!error && data) {
        probeSuccess = true;
        await supabase.storage.from(bName).remove([testPath]);
      } else {
        probeError = error?.message;
      }
    } catch (e) {
      probeError = e?.message;
    }

    auditReport.bucketsStatus[bName] = {
      exists: Boolean(bucketObj),
      isPublic: bucketObj ? bucketObj.public : null,
      uploadPermissionVerified: probeSuccess,
      error: probeError
    };
  }

  // 2. Query Vendors
  const { data: vendors, error: vErr } = await supabase.from('vendors').select('*');
  if (vendors) {
    for (const v of vendors) {
      const vId = v.id;
      const vName = v.business_name || 'Vendor ' + vId;
      const cleanId = sanitizeId(vId);

      // Logo
      if (isBase64(v.logo_url)) {
        const info = parseBase64Info(v.logo_url);
        const ext = info.mime.split('/')[1] || 'jpg';
        auditReport.findings.push({
          table: 'public.vendors',
          recordId: vId,
          vendorName: vName,
          column: 'logo_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'vendor-logos',
          intendedPath: `${cleanId}/logo_${cleanId}.${ext}`,
        });
      }

      // Cover
      if (isBase64(v.cover_image_url)) {
        const info = parseBase64Info(v.cover_image_url);
        const ext = info.mime.split('/')[1] || 'jpg';
        auditReport.findings.push({
          table: 'public.vendors',
          recordId: vId,
          vendorName: vName,
          column: 'cover_image_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'vendor-covers',
          intendedPath: `${cleanId}/cover_${cleanId}.${ext}`,
        });
      }

      // Gallery URLs
      let gallery = v.gallery_urls;
      if (typeof gallery === 'string') {
        try { gallery = JSON.parse(gallery); } catch(e) {}
      }
      if (Array.isArray(gallery)) {
        gallery.forEach((gUrl, idx) => {
          if (isBase64(gUrl)) {
            const info = parseBase64Info(gUrl);
            const ext = info.mime.split('/')[1] || 'jpg';
            auditReport.findings.push({
              table: 'public.vendors',
              recordId: vId,
              vendorName: vName,
              column: `gallery_urls[${idx}]`,
              mimeType: info.mime,
              sizeBytes: info.sizeBytes,
              formattedSize: formatBytes(info.sizeBytes),
              intendedBucket: 'vendor-gallery',
              intendedPath: `${cleanId}/gallery_${cleanId}_${idx}.${ext}`,
            });
          }
        });
      }

      // CAC Certificate
      if (isBase64(v.cac_certificate_url)) {
        const info = parseBase64Info(v.cac_certificate_url);
        const ext = info.mime.split('/')[1] || 'pdf';
        auditReport.findings.push({
          table: 'public.vendors',
          recordId: vId,
          vendorName: vName,
          column: 'cac_certificate_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'verification-receipts',
          intendedPath: `${cleanId}/cac_doc_${cleanId}.${ext}`,
        });
      }

      // NIN Doc
      if (isBase64(v.nin_doc_url)) {
        const info = parseBase64Info(v.nin_doc_url);
        const ext = info.mime.split('/')[1] || 'pdf';
        auditReport.findings.push({
          table: 'public.vendors',
          recordId: vId,
          vendorName: vName,
          column: 'nin_doc_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'verification-receipts',
          intendedPath: `${cleanId}/nin_doc_${cleanId}.${ext}`,
        });
      }
    }
  }

  // 3. Query Promotion Requests
  const { data: promos } = await supabase.from('promotion_requests').select('*');
  if (promos) {
    for (const p of promos) {
      const pId = p.id;
      const vName = p.vendor_name || 'Vendor ' + p.vendor_id;
      const cleanVId = sanitizeId(p.vendor_id);
      const cleanPId = sanitizeId(pId);

      if (isBase64(p.proof_url)) {
        const info = parseBase64Info(p.proof_url);
        const ext = info.mime.split('/')[1] || 'jpg';
        auditReport.findings.push({
          table: 'public.promotion_requests',
          recordId: pId,
          vendorName: vName,
          column: 'proof_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'promotion-receipts',
          intendedPath: `${cleanVId}/promo_receipt_${cleanPId}.${ext}`,
        });
      }

      if (isBase64(p.banner_image_url)) {
        const info = parseBase64Info(p.banner_image_url);
        const ext = info.mime.split('/')[1] || 'jpg';
        auditReport.findings.push({
          table: 'public.promotion_requests',
          recordId: pId,
          vendorName: vName,
          column: 'banner_image_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'vendor-covers',
          intendedPath: `${cleanVId}/banner_${cleanPId}.${ext}`,
        });
      }
    }
  }

  // 4. Query Products
  const { data: products } = await supabase.from('products').select('*');
  if (products) {
    for (const prod of products) {
      const pId = prod.id;
      const vName = prod.vendor_name || 'Vendor ' + prod.vendor_id;
      const cleanVId = sanitizeId(prod.vendor_id);
      const cleanPId = sanitizeId(pId);

      let images = prod.images;
      if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch(e) {}
      }
      if (Array.isArray(images)) {
        images.forEach((img, idx) => {
          if (isBase64(img)) {
            const info = parseBase64Info(img);
            const ext = info.mime.split('/')[1] || 'jpg';
            auditReport.findings.push({
              table: 'public.products',
              recordId: pId,
              vendorName: `${vName} — "${prod.name}"`,
              column: `images[${idx}]`,
              mimeType: info.mime,
              sizeBytes: info.sizeBytes,
              formattedSize: formatBytes(info.sizeBytes),
              intendedBucket: 'product-images',
              intendedPath: `${cleanVId}/${cleanPId}/prod_${cleanPId}_${idx}.${ext}`,
            });
          }
        });
      }
    }
  }

  // 5. Query Verification Requests
  const { data: verifs } = await supabase.from('verification_requests').select('*');
  if (verifs) {
    for (const vr of verifs) {
      const vrId = vr.id;
      const vName = vr.vendor_name || 'Vendor ' + vr.vendor_id;
      const cleanVId = sanitizeId(vr.vendor_id);
      const cleanVrId = sanitizeId(vrId);

      if (isBase64(vr.proof_url)) {
        const info = parseBase64Info(vr.proof_url);
        const ext = info.mime.split('/')[1] || 'jpg';
        auditReport.findings.push({
          table: 'public.verification_requests',
          recordId: vrId,
          vendorName: vName,
          column: 'proof_url',
          mimeType: info.mime,
          sizeBytes: info.sizeBytes,
          formattedSize: formatBytes(info.sizeBytes),
          intendedBucket: 'verification-receipts',
          intendedPath: `${cleanVId}/verif_receipt_${cleanVrId}.${ext}`,
        });
      }
    }
  }

  // Totals
  auditReport.totalBase64Records = auditReport.findings.length;
  auditReport.totalBase64Bytes = auditReport.findings.reduce((acc, f) => acc + f.sizeBytes, 0);
  auditReport.formattedTotalBytes = formatBytes(auditReport.totalBase64Bytes);

  auditReport.findings.forEach(f => {
    auditReport.byTableCount[f.table] = (auditReport.byTableCount[f.table] || 0) + 1;
  });

  fs.writeFileSync('scripts/audit_output.json', JSON.stringify(auditReport, null, 2));
  console.log('AUDIT COMPLETED SUCCESSFULLY. Output written to scripts/audit_output.json');
}

runFullAudit();
