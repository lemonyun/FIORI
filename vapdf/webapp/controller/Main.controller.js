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

        var _aCount = 0;
        var _vCount = 0;

        var quarterdate = [
            {stmonth : 1, stday : 1, edmonth : 3, edday : 31 },
            {stmonth : 4, stday : 1, edmonth : 6, edday : 30 },
            {stmonth : 7, stday : 1, edmonth : 9, edday : 30 },
            {stmonth : 10, stday : 1, edmonth : 12, edday : 31},
        ]

        var oDataModel;

        function _zeroPad(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
          }

        function _printAmount(ypos, totSamount, totBamount, doc, aAmount, bIsV) {
            var xPos = 130; // 공급가액 총액
            while (totSamount > 0) {
                var remain = totSamount % 1000;
                totSamount = Math.floor(totSamount / 1000);
                var numstr = '';
                if (remain == 0) {
                    numstr = '000';
                }else if (remain != 0 && totSamount > 0){
                    numstr = _zeroPad(remain, 3);
                }else {
                    numstr = remain.toString();
                }
                doc.text(xPos, ypos, numstr); // 
                
                xPos -= 10;
            }

            xPos = 182; // 세액 총액
            while (totBamount > 0) {
                var remain = totBamount % 1000;
                totBamount = Math.floor(totBamount / 1000);
                var numstr = '';
                if (remain == 0) {
                    numstr = '000';
                }else if (remain != 0 && totBamount > 0){
                    numstr = _zeroPad(remain, 3);
                }else {
                    numstr = remain.toString();
                }
                doc.text(xPos, ypos, numstr); // 
                
                xPos -= 10;
            }

            doc.text(70, ypos, aAmount.length.toString()); // 매출차수

            debugger;
            if(bIsV) {
                doc.text(80, ypos, _vCount.toString()); // 매수
            }else {

                doc.text(80, ypos, _aCount.toString()); // 매수
            }

        }

        return Controller.extend("vapdf.controller.Main", {
            onInit: function () {

                    // var quarter = 1;
                    // var lo_pickedDateFilter = new sap.ui.model.Filter({
                    //     path: "Quarter",
                    //     operator: sap.ui.model.FilterOperator.EQ,
                    //     value1: quarter
                    // });
                    // var la_filters = new Array(); // Don't normally do this but just for the example.
                    // la_filters.push(lo_pickedDateFilter);
                    

               
            },
            onCreatePDF: function () {
                oDataModel = this.getView().getModel();

                var oSmartFilterBar = this.byId("idSmartFilterBar");
                var oFilterData = oSmartFilterBar.getFilterData();
                _quarter = oFilterData.Quarter.ranges[0].value1;

                var filter = new sap.ui.model.Filter("Quarter", sap.ui.model.FilterOperator.EQ, _quarter);
                var aFilters = [];

                aFilters.push(filter);

                    oDataModel.read("/VAEntitySet", {
                        filters : aFilters,
                        success : function(oReturn) {
                            console.log("전체조회: ", oReturn);
                            _fiscal = oReturn.results[0].Vfiscal

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
                            doc.text(155, 75, "종로구 종로2가") // 사업장 소재지
                            
                            doc.text(55, 89, _fiscal) // 거래기간 앞
                            doc.text(67, 89, quarterdate[_quarter - 1].stmonth.toString()) //
                            doc.text(74, 89, quarterdate[_quarter - 1].stday.toString()) // 

                            doc.text(85, 89, _fiscal) // 거래기간 뒤
                            doc.text(97, 89, quarterdate[_quarter - 1].edmonth.toString()) // 
                            doc.text(104, 89, quarterdate[_quarter - 1].edday.toString()) // 

                            var dateObj = new Date()
                            var month   = (dateObj.getUTCMonth() + 1).toString(); // months from 1-12
                            var day     = dateObj.getUTCDate().toString();
                            var year    = dateObj.getUTCFullYear().toString();
                            
                            doc.text(155, 89, year) // 작성일
                            doc.text(170, 89, month) // 
                            doc.text(180, 89, day) // 

                            // doc.text(64, 65, venno) // 사업자등록번호
                            
 
                            var aAgamount = []
                            var aResults = oReturn.results;
                            // {Agname : '' Samount '' : bAmount '' count : '' docno : }

                            for (var i = 0; i < aResults.length; i++) { // 매출 공급가액 및 세액 합산
                                if(aResults[i].Taxcode.substring(0, 1) == 'A' && aResults[i].Agcode != 'HB0000' && aResults[i].Agcode != 'HB0014'
                            ){
                                    _aCount++;
                                    var bIsExist = false;
                                    for (var j = 0; j < aAgamount.length; j++) {
                                        if (aAgamount[j].Agname == aResults[i].Agname){
                                            bIsExist = true;
                                            break;
                                        }
                                    }

                                    if (bIsExist) { // 있으면 금액 누적
                                        aAgamount[j].Samount += Number(aResults[i].Samount); 
                                        aAgamount[j].Bamount += Number(aResults[i].Bamount);
                                        aAgamount[j].Count = aAgamount[j].Count + 1;
                                    } else { // 없으면 추가
                                        aAgamount.push ({ 
                                            Agname : aResults[i].Agname, 
                                            Samount : Number(aResults[i].Samount),  
                                            Bamount : Number(aResults[i].Bamount), 
                                            Count : 1, 
                                            Venno : aResults[i].Venno
                                        });
                                    }
                                }else {
                                    continue;
                                }
                                

                            }

                            var totSamount = 0;
                            var totBamount = 0;
                            for (var i = 0; i < aAgamount.length; i++) {
                                totSamount += Number(aAgamount[i].Samount);
                                totBamount += Number(aAgamount[i].Bamount);
                            }
                            // 숫자 48 000 000
                            
                            _printAmount(122, totSamount, totBamount, doc, aAgamount, false);
                            _printAmount(160, totSamount, totBamount, doc, aAgamount, false);
                            _printAmount(178, totSamount, totBamount, doc, aAgamount, false);
                            
                            var yPos = 217
                            doc.setFontSize(8)
                            for (var i = 0; i < aAgamount.length; i++) {
                                doc.text(32, yPos, aAgamount[i].Venno); // 사업자등록번호
                                doc.text(54, yPos, aAgamount[i].Agname); // 상호
                                doc.text(85, yPos, aAgamount[i].Count.toString()); // 매수
                             
                                var Samount = aAgamount[i].Samount;
                                var xPos = 123
                                while (Samount > 0) {
                                    var remain = Samount % 1000;
                                    Samount = Math.floor(Samount / 1000);
                                    var numstr = '';
                                    if (remain == 0) {
                                        numstr = '000';
                                    }else if (remain != 0 && Samount > 0){
                                        numstr = _zeroPad(remain, 3);
                                    }else {
                                        numstr = remain.toString();
                                    }
                                    doc.text(xPos, yPos, numstr); // 
                                    
                                    xPos -= 7;
                                }

                                var Bamount = aAgamount[i].Bamount;
                                xPos = 166;
                                while (Bamount > 0) {
                                    var remain = Bamount % 1000;
                                    Bamount = Math.floor(Bamount / 1000);
                                    var numstr = '';
                                    if (remain == 0) {
                                        numstr = '000';
                                    }else if (remain != 0 && Bamount > 0){
                                        numstr = _zeroPad(remain, 3);
                                    }else {
                                        numstr = remain.toString();
                                    }
                                    doc.text(xPos, yPos, numstr); // 
                                    
                                    xPos -= 7;
                                }

                                yPos += 7;
                            }

// ------------------------------------------매입 ------------------------------- //
                            doc.addPage();
                            
                            doc.addImage(pdfstr2, 'JPEG', 0, 0, 210, 290)

                            doc.setFontSize(10)
                            doc.text(64, 41, _fiscal) // 연도
                            doc.text(86, 41, _quarter.toString()) // 분기

                            doc.text(99, 41, quarterdate[_quarter - 1].stmonth.toString()) //
                            doc.text(109, 41, quarterdate[_quarter - 1].stday.toString()) // 

                            doc.text(123, 41, quarterdate[_quarter - 1].edmonth.toString()) // 
                            doc.text(131, 41, quarterdate[_quarter - 1].edday.toString()) // 
                            
                            doc.text(64, 65, "101-01-12345") // 사업자등록번호
                            doc.text(155, 65, "SYNC-REST")
                            doc.text(64, 72, "김도현") // 성명(대표자)
                            doc.text(155, 72, "종로구 종로2가") // 사업장 소재지
                            
                            doc.text(55, 84, _fiscal) // 거래기간 앞
                            doc.text(67, 84, quarterdate[_quarter - 1].stmonth.toString()) //
                            doc.text(74, 84, quarterdate[_quarter - 1].stday.toString()) // 

                            doc.text(85, 84, _fiscal) // 거래기간 뒤
                            doc.text(97, 84, quarterdate[_quarter - 1].edmonth.toString()) // 
                            doc.text(104, 84, quarterdate[_quarter - 1].edday.toString()) // 
                            
                            doc.text(155, 84, year) // 작성일
                            doc.text(170, 84, month) // 
                            doc.text(180, 84, day) // 

                            // doc.text(64, 65, venno) // 사업자등록번호
                            
 
                            var aVenamount = []
                            var aResults = oReturn.results;
                            // {Agname : '' Samount '' : bAmount '' count : '' docno : }

                            for (var i = 0; i < aResults.length; i++) { // 매출 공급가액 및 세액 합산
                                if(aResults[i].Taxcode.substring(0, 1) == 'V'){
                                    _vCount++;
                                    var bIsExist = false;
                                    for (var j = 0; j < aVenamount.length; j++) {
                                        if (aVenamount[j].Venname == aResults[i].Venname){
                                            bIsExist = true;
                                            break;
                                        }
                                    }

                                    if (bIsExist) { // 있으면 금액 누적
                                        aVenamount[j].Samount += Number(aResults[i].Samount); 
                                        aVenamount[j].Bamount += Number(aResults[i].Bamount);
                                        aVenamount[j].Count = aVenamount[j].Count + 1;
                                    } else { // 없으면 추가
                                        aVenamount.push ({ 
                                            Venname : aResults[i].Venname, 
                                            Samount : Number(aResults[i].Samount),  
                                            Bamount : Number(aResults[i].Bamount), 
                                            Count : 1, 
                                            Venno : aResults[i].Venno
                                        });
                                    }
                                }else {
                                    continue;
                                }
                                

                            }

                            var totSamount = 0;
                            var totBamount = 0;
                            for (var i = 0; i < aVenamount.length; i++) {
                                totSamount += Number(aVenamount[i].Samount);
                                totBamount += Number(aVenamount[i].Bamount);
                            }
                            // 숫자 48 000 000

                            _printAmount(122, totSamount, totBamount, doc, aVenamount, true);
                            _printAmount(160, totSamount, totBamount, doc, aVenamount, true);
                            _printAmount(176, totSamount, totBamount, doc, aVenamount, true);
                            
                            var yPos = 217
                            doc.setFontSize(8)
                            for (var i = 0; i < aVenamount.length; i++) {
                                doc.text(32, yPos, aVenamount[i].Venno); // 사업자등록번호
                                doc.text(54, yPos, aVenamount[i].Venname); // 거래처이름
                                doc.text(85, yPos, aVenamount[i].Count.toString()); // 매수
                             
                                var Samount = aVenamount[i].Samount;
                                var xPos = 123
                                while (Samount > 0) {
                                    var remain = Samount % 1000;
                                    Samount = Math.floor(Samount / 1000);
                                    var numstr = '';
                                    if (remain == 0) {
                                        numstr = '000';
                                    }else if (remain != 0 && Samount > 0){
                                        numstr = _zeroPad(remain, 3);
                                    }else {
                                        numstr = remain.toString();
                                    }
                                    doc.text(xPos, yPos, numstr); // 
                                    
                                    xPos -= 7;
                                }

                                var Bamount = aVenamount[i].Bamount;
                                xPos = 166;
                                while (Bamount > 0) {
                                    var remain = Bamount % 1000;
                                    Bamount = Math.floor(Bamount / 1000);
                                    var numstr = '';
                                    if (remain == 0) {
                                        numstr = '000';
                                    }else if (remain != 0 && Bamount > 0){
                                        numstr = _zeroPad(remain, 3);
                                    }else {
                                        numstr = remain.toString();
                                    }
                                    doc.text(xPos, yPos, numstr); // 
                                    
                                    xPos -= 7;
                                }

                                yPos += 7;
                            }

                            doc.save("SamplePDF.pdf");
















                        },
                        error : function(oError) {
                        console.group("에러", oError);
    
                        }
                    });

                
                


            }
        });
    });
