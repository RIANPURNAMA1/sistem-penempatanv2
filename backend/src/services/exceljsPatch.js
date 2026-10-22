/**
 * Workaround ExcelJS: file .xlsx yang relationship-nya menunjuk file komentar
 * yang tidak ada (mis. sheet → "../comments2.xml" sementara isinya "comments1.xml")
 * membuat ExcelJS gagal saat read/write:
 *
 *   TypeError: Cannot read properties of undefined (reading 'comments')
 *
 * Patch ini memetakan relationship tersebut ke file komentar/VML yang tersedia
 * (agar komentar tetap terbawa), atau mengosongkan bila tidak ada sama sekali.
 */

const WorksheetXform = require('exceljs/lib/xlsx/xform/sheet/worksheet-xform');

if (!WorksheetXform.prototype.__menduniaPatched) {
  const original = WorksheetXform.prototype.reconcile;

  WorksheetXform.prototype.reconcile = function patchedReconcile(model, options) {
    try {
      const rels = (model && model.relationships) || [];
      if (!rels.length) return original.call(this, model, options);

      const comments = options.comments || (options.comments = {});
      const vmls = options.vmlDrawings || (options.vmlDrawings = {});
      if (!options.__menduniaUsedComments) options.__menduniaUsedComments = new Set();
      if (!options.__menduniaUsedVml) options.__menduniaUsedVml = new Set();

      const commentKeys = Object.keys(comments);
      const vmlKeys = Object.keys(vmls);

      rels.forEach((rel) => {
        const type = String(rel.Type || '');
        if (/comments/i.test(type)) {
          if (comments[rel.Target]) return;
          const key = commentKeys.find(
            (k) => !options.__menduniaUsedComments.has(k)
          );
          if (key) {
            options.__menduniaUsedComments.add(key);
            rel.Target = key;
          } else {
            comments[rel.Target] = { comments: [] };
          }
          return;
        }
        if (/vmlDrawing/i.test(type)) {
          if (vmls[rel.Target]) return;
          const key = vmlKeys.find((k) => !options.__menduniaUsedVml.has(k));
          if (key) {
            options.__menduniaUsedVml.add(key);
            rel.Target = key;
          } else {
            vmls[rel.Target] = { comments: [] };
          }
        }
      });
    } catch (e) {
      /* biarkan error asli muncul di bawah */
    }
    return original.call(this, model, options);
  };

  WorksheetXform.prototype.__menduniaPatched = true;
}

module.exports = { patched: true };
