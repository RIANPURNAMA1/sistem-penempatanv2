/**
 * Workaround ExcelJS 4.4.0 untuk dua hal:
 *
 * 1) File .xlsx yang relationship-nya menunjuk file komentar yang tidak ada
 *    (mis. sheet → "../comments2.xml" sementara isinya "comments1.xml")
 *    membuat ExcelJS gagal saat read/write:
 *
 *      TypeError: Cannot read properties of undefined (reading 'comments')
 *
 *    Patch ini memetakan relationship tersebut ke file komentar/VML yang tersedia
 *    (agar komentar tetap terbawa), atau mengosongkan bila tidak ada sama sekali.
 *
 * 2) ExcelJS menulis elemen anak <sheetPr> dengan urutan yang melanggar skema
 *    OOXML (CT_SheetPr): ia menulis tabColor → pageSetUpPr → outlinePr,
 *    sedangkan spesifikasi (ECMA-376) mewajibkan tabColor → outlinePr →
 *    pageSetUpPr. Hampir semua template asli Excel memiliki <outlinePr>,
 *    sehingga file hasil generate ditolak Excel saat dibuka:
 *
 *      Removed Part: /xl/worksheets/sheet1.xml part with XML error.
 *      Load error. Line 2, column 0.
 *
 *    Patch ini menulis ulang urutan elemen <sheetPr> sesuai skema, sekaligus
 *    menaruh <legacyDrawing> (komentar) tepat setelah <drawing> sesuai CT_Worksheet.
 */

const WorksheetXform = require('exceljs/lib/xlsx/xform/sheet/worksheet-xform');
const SheetPropertiesXform = require('exceljs/lib/xlsx/xform/sheet/sheet-properties-xform');
const RelType = require('exceljs/lib/xlsx/rel-type');

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

if (!SheetPropertiesXform.prototype.__menduniaPatched) {
  // Skema CT_SheetPr: tabColor, outlinePr, pageSetUpPr.
  SheetPropertiesXform.prototype.render = function patchedRender(xmlStream, model) {
    if (!model) return;

    xmlStream.addRollback();
    xmlStream.openNode('sheetPr');

    let inner = false;
    inner = this.map.tabColor.render(xmlStream, model.tabColor) || inner;
    inner = this.map.outlinePr.render(xmlStream, model.outlineProperties) || inner;
    inner = this.map.pageSetUpPr.render(xmlStream, model.pageSetup) || inner;

    if (inner) {
      xmlStream.closeNode();
      xmlStream.commit();
    } else {
      xmlStream.rollback();
    }
  };

  SheetPropertiesXform.prototype.__menduniaPatched = true;
}

if (!WorksheetXform.prototype.__menduniaRenderPatched) {
  const originalRender = WorksheetXform.prototype.render;

  // Skema CT_Worksheet menempatkan <legacyDrawing> tepat setelah <drawing>,
  // sedangkan ExcelJS menuliskannya paling akhir (setelah <extLst>).
  WorksheetXform.prototype.render = function patchedRender(xmlStream, model) {
    const originalLeafNode = xmlStream.leafNode;
    const map = this.map;
    const originalDrawingRender = map.drawing.render;

    // Kumpulkan node <legacyDrawing> lebih awal agar bisa ditulis tepat
    // setelah <drawing> (posisi yang diwajibkan skema).
    const legacyNodes = [];
    ((model && model.rels) || []).forEach((rel) => {
      if (rel.Type === RelType.VmlDrawing) {
        legacyNodes.push(['legacyDrawing', { 'r:id': rel.Id }]);
      }
    });

    // Cegah ExcelJS menulis ulang <legacyDrawing> di posisi yang salah.
    xmlStream.leafNode = function patchedLeafNode(name, attributes, text) {
      if (name === 'legacyDrawing') return undefined;
      return originalLeafNode.call(xmlStream, name, attributes, text);
    };

    map.drawing.render = function patchedDrawingRender(stream, drawingModel) {
      const result = originalDrawingRender.call(this, stream, drawingModel);
      legacyNodes.forEach(([name, attributes]) => {
        originalLeafNode.call(stream, name, attributes);
      });
      return result;
    };

    try {
      return originalRender.call(this, xmlStream, model);
    } finally {
      delete xmlStream.leafNode;
      delete map.drawing.render;
    }
  };

  WorksheetXform.prototype.__menduniaRenderPatched = true;
}

module.exports = { patched: true };
