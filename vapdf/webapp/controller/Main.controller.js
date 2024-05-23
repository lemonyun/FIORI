sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/pdfstring",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, pdfstring) {//
        "use strict";
        var _fiscal;

        var _quarter;

        var quarterdate = [
            {stmonth : 1, stday : 1, edmonth : 3, edday : 31 },
            {stmonth : 4, stday : 1, edmonth : 6, edday : 30 },
            {stmonth : 7, stday : 1, edmonth : 9, edday : 30 },
            {stmonth : 10, stday : 1, edmonth : 12, edday : 31},
        ]

        var oDataModel;

        return Controller.extend("vapdf.controller.Main", {
            onInit: function () {
                var oSmartFilterBar = this.getView().byId("idSmartFilterBar");
                oSmartFilterBar._sMandatoryErrorMessage = "Fill me";

                setTimeout(() => {
                    oDataModel = this.getView().getModel();
                    // var quarter = 1;
                    // var lo_pickedDateFilter = new sap.ui.model.Filter({
                    //     path: "Quarter",
                    //     operator: sap.ui.model.FilterOperator.EQ,
                    //     value1: quarter
                    // });
                    // var la_filters = new Array(); // Don't normally do this but just for the example.
                    // la_filters.push(lo_pickedDateFilter);

                    oDataModel.read("/VAEntitySet", {
                        success : function(oReturn) {
                            console.log("전체조회: ", oReturn);
                            _fiscal = oReturn.results[0].Vfiscal
                            _quarter = 1

                            //_quarter = oReturn.results[0].Quarter
                            //debugger;
                        },
                        error : function(oError) {
                        console.group("에러", oError);
    
                        }
                    });
                    
                }, 100);
               
            },
            onCreatePDF: function () {
                
                var imgData = pdfstr1;
                var doc = new jsPDF()

                doc.addFileToVFS('malgun.ttf', fontstr);  //_fonts 변수는 Base64 형태로 변환된 내용입니다.
                doc.addFont('malgun.ttf','malgun', 'normal');
                doc.setFont('malgun'); 

                doc.addImage(imgData, 'JPEG', 0, 0, 210, 290) // 양식 이미지 먼저 붙이기

                doc.setFontSize(10)
                doc.text(64, 41, _fiscal) // 연도
                doc.text(86, 41, _quarter.toString()) // 분기

                doc.text(100, 41, quarterdate[_quarter - 1].stmonth.toString()) //
                doc.text(110, 41, quarterdate[_quarter - 1].stday.toString()) // 

                doc.text(124, 41, quarterdate[_quarter - 1].edmonth.toString()) // 
                doc.text(132, 41, quarterdate[_quarter - 1].edday.toString()) // 
                
                doc.text(64, 65, "101-01-12345") // 사업자등록번호
                doc.text(155, 65, "SYNC-REST")
                doc.text(64, 75, "김도현") // 성명(대표자)
                doc.text(155, 75, "종로구 종로2가 XXX") // 사업장 소재지
                
                doc.text(55, 89, _fiscal) // 거래기간 앞
                doc.text(67, 89, quarterdate[_quarter - 1].stmonth.toString()) //
                doc.text(74, 89, quarterdate[_quarter - 1].stday.toString()) // 

                doc.text(85, 89, _fiscal) // 거래기간 뒤
                doc.text(97, 89, quarterdate[_quarter - 1].edmonth.toString()) // 
                doc.text(104, 89, quarterdate[_quarter - 1].edday.toString()) // 

                const dateObj = new Date()
                const month   = (dateObj.getUTCMonth() + 1).toString(); // months from 1-12
                const day     = dateObj.getUTCDate().toString();
                const year    = dateObj.getUTCFullYear().toString();
                
                doc.text(155, 89, year) // 작성일
                doc.text(170, 89, month) // 
                doc.text(180, 89, day) // 

                // doc.text(64, 65, venno) // 사업자등록번호
                

                doc.save("SamplePDF.pdf");

                


            }
        });
    });
