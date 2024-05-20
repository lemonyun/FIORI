sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("vapdf.controller.Main", {
            onInit: function () {

            },
            OnCreatePDF: function () {
                //var _fonts = 
                const { PDFDocument, rgb } = require('pdf-lib');
                const fs = require('fs');

                async function modifyPdf() {
                // 기존 PDF 파일을 읽어들임
                const existingPdfBytes = fs.readFileSync('existing.pdf');

                // PDFDocument 인스턴스 생성 및 기존 PDF 파일 로드
                const pdfDoc = await PDFDocument.load(existingPdfBytes);

                // 첫 번째 페이지 가져오기
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];

                // 텍스트 추가
                firstPage.drawText('Hello, world!', {
                    x: 50,
                    y: 500,
                    size: 30,
                    color: rgb(0, 0.53, 0.71),
                });

                // 수정된 PDF 파일 저장
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync('../model/Test.pdf', pdfBytes);
                }

                modifyPdf().catch((err) => console.log(err));
            }
        });
    });
