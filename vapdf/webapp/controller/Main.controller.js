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
        var _oCount = 0;

        var quarterdate = [
            { stmonth: 1, stday: 1, edmonth: 3, edday: 31 },
            { stmonth: 4, stday: 1, edmonth: 6, edday: 30 },
            { stmonth: 7, stday: 1, edmonth: 9, edday: 30 },
            { stmonth: 10, stday: 1, edmonth: 12, edday: 31 },
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
                } else if (remain != 0 && totSamount > 0) {
                    numstr = _zeroPad(remain, 3);
                } else {
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
                } else if (remain != 0 && totBamount > 0) {
                    numstr = _zeroPad(remain, 3);
                } else {
                    numstr = remain.toString();
                }
                doc.text(xPos, ypos, numstr); // 

                xPos -= 10;
            }

            doc.text(70, ypos, aAmount.length.toString()); // 매출차수

            debugger;
            if (bIsV) {
                doc.text(80, ypos, _vCount.toString()); // 매수
            } else {

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

                if (oFilterData.Quarter == undefined) {
                    sap.m.MessageToast.show("분기를 먼저 입력해주세요");
                    return;
                }
                _quarter = oFilterData.Quarter.ranges[0].value1;



                var filter = new sap.ui.model.Filter("Quarter", sap.ui.model.FilterOperator.EQ, _quarter);
                var aFilters = [];

                aFilters.push(filter);

                oDataModel.read("/VAEntitySet", {
                    filters: aFilters,
                    success: function (oReturn) {
                        console.log("전체조회: ", oReturn);
                        _fiscal = oReturn.results[0].Vfiscal

                        var imgData = pdfstr1;
                        var doc = new jsPDF()

                        doc.addFileToVFS('malgun.ttf', fontstr);  //_fonts 변수는 Base64 형태로 변환된 내용입니다.
                        doc.addFont('malgun.ttf', 'malgun', 'normal');
                        doc.setFont('malgun');

                        //------------------------------------------------매출 ---------------------------------------------//
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
                        doc.text(64, 75, "구도현") // 성명(대표자)
                        doc.text(155, 75, "종로구 종로2가") // 사업장 소재지

                        doc.text(55, 89, _fiscal) // 거래기간 앞
                        doc.text(67, 89, quarterdate[_quarter - 1].stmonth.toString()) //
                        doc.text(74, 89, quarterdate[_quarter - 1].stday.toString()) // 

                        doc.text(85, 89, _fiscal) // 거래기간 뒤
                        doc.text(97, 89, quarterdate[_quarter - 1].edmonth.toString()) // 
                        doc.text(104, 89, quarterdate[_quarter - 1].edday.toString()) // 

                        var dateObj = new Date()
                        var month = (dateObj.getUTCMonth() + 1).toString(); // months from 1-12
                        var day = dateObj.getUTCDate().toString();
                        var year = dateObj.getUTCFullYear().toString();

                        doc.text(155, 89, year) // 작성일
                        doc.text(170, 89, month) // 
                        doc.text(180, 89, day) // 

                        // doc.text(64, 65, venno) // 사업자등록번호


                        var aAgamount = []
                        var aResults = oReturn.results;
                        // {Agname : '' Samount '' : bAmount '' count : '' docno : }

                        for (var i = 0; i < aResults.length; i++) { // 매출 공급가액 및 세액 합산
                            if (aResults[i].Taxcode.substring(0, 1) == 'A' && aResults[i].Agcode != 'HB0000' && aResults[i].Agcode != 'HB0014'
                            ) {
                                _aCount++;
                                var bIsExist = false;
                                for (var j = 0; j < aAgamount.length; j++) {
                                    if (aAgamount[j].Agname == aResults[i].Agname) {
                                        bIsExist = true;
                                        break;
                                    }
                                }

                                if (bIsExist) { // 있으면 금액 누적
                                    aAgamount[j].Samount += Number(aResults[i].Samount);
                                    aAgamount[j].Bamount += Number(aResults[i].Bamount);
                                    aAgamount[j].Count = aAgamount[j].Count + 1;
                                } else { // 없으면 추가
                                    aAgamount.push({
                                        Agname: aResults[i].Agname,
                                        Samount: Number(aResults[i].Samount),
                                        Bamount: Number(aResults[i].Bamount),
                                        Count: 1,
                                        Venno: aResults[i].Venno
                                    });
                                }
                            } else {
                                continue;
                            }


                        }

                        var AgtotSamount = 0;
                        var AgtotBamount = 0;
                        for (var i = 0; i < aAgamount.length; i++) {
                            AgtotSamount += Number(aAgamount[i].Samount);
                            AgtotBamount += Number(aAgamount[i].Bamount);
                        }
                        // 숫자 48 000 000

                        _printAmount(122, AgtotSamount, AgtotBamount, doc, aAgamount, false);
                        _printAmount(160, AgtotSamount, AgtotBamount, doc, aAgamount, false);
                        _printAmount(178, AgtotSamount, AgtotBamount, doc, aAgamount, false);

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
                                } else if (remain != 0 && Samount > 0) {
                                    numstr = _zeroPad(remain, 3);
                                } else {
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
                                } else if (remain != 0 && Bamount > 0) {
                                    numstr = _zeroPad(remain, 3);
                                } else {
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
                        doc.text(64, 72, "구도현") // 성명(대표자)
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
                            if (aResults[i].Taxcode.substring(0, 2) == 'VA' || aResults[i].Taxcode.substring(0, 2) == 'VB') {
                                _vCount++;
                                var bIsExist = false;
                                for (var j = 0; j < aVenamount.length; j++) {
                                    if (aVenamount[j].Venname == aResults[i].Venname) {
                                        bIsExist = true;
                                        break;
                                    }
                                }

                                if (bIsExist) { // 있으면 금액 누적
                                    aVenamount[j].Samount += Number(aResults[i].Samount);
                                    aVenamount[j].Bamount += Number(aResults[i].Bamount);
                                    aVenamount[j].Count = aVenamount[j].Count + 1;
                                } else { // 없으면 추가
                                    aVenamount.push({
                                        Venname: aResults[i].Venname,
                                        Samount: Number(aResults[i].Samount),
                                        Bamount: Number(aResults[i].Bamount),
                                        Count: 1,
                                        Venno: aResults[i].Venno
                                    });
                                }
                            } else {
                                continue;
                            }


                        }

                        var VentotSamount = 0;
                        var VentotBamount = 0;
                        for (var i = 0; i < aVenamount.length; i++) {
                            VentotSamount += Number(aVenamount[i].Samount);
                            VentotBamount += Number(aVenamount[i].Bamount);
                        }
                        // 숫자 48 000 000

                        _printAmount(122, VentotSamount, VentotBamount, doc, aVenamount, true);
                        _printAmount(160, VentotSamount, VentotBamount, doc, aVenamount, true);
                        _printAmount(176, VentotSamount, VentotBamount, doc, aVenamount, true);

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
                                } else if (remain != 0 && Samount > 0) {
                                    numstr = _zeroPad(remain, 3);
                                } else {
                                    numstr = remain.toString();
                                }
                                doc.text(xPos, yPos, numstr); // 

                                xPos -= 8;
                            }

                            var Bamount = aVenamount[i].Bamount;
                            xPos = 166;
                            while (Bamount > 0) {
                                var remain = Bamount % 1000;
                                Bamount = Math.floor(Bamount / 1000);
                                var numstr = '';
                                if (remain == 0) {
                                    numstr = '000';
                                } else if (remain != 0 && Bamount > 0) {
                                    numstr = _zeroPad(remain, 3);
                                } else {
                                    numstr = remain.toString();
                                }
                                doc.text(xPos, yPos, numstr); // 

                                xPos -= 8;
                            }

                            yPos += 7;
                        }

// ------------------------------------------------------------------신용카드---------------------------------------------------------------

                        doc.addPage();


                        doc.addImage(pdfstr3, 'JPEG', 0, 0, 210, 290)
                        doc.setFontSize(10)

                        doc.addPage();

                        doc.addImage(pdfstr8, 'JPEG', 0, 0, 210, 290)
                        
                        

                        // doc.text(64, 43, _fiscal) // 연도
                        // doc.text(87, 43, _quarter.toString()) // 분기

                        // doc.text(98, 43, quarterdate[_quarter - 1].stmonth.toString()) //
                        // doc.text(109, 43, quarterdate[_quarter - 1].stday.toString()) // 

                        // doc.text(123, 43, quarterdate[_quarter - 1].edmonth.toString()) // 
                        // doc.text(131, 43, quarterdate[_quarter - 1].edday.toString()) // 

                        // doc.text(155, 65, "101-01-12345") // 사업자등록번호
                        // doc.text(64, 65, "SYNC-REST")
                        // doc.text(64, 74, "구도현") // 성명(대표자)

                        var aOnamount = []

                        for (var i = 0; i < aResults.length; i++) { // 매출 공급가액 및 세액 합산
                            if (aResults[i].Agcode == 'HB0000') {
                                _oCount++;
                                var bIsExist = false;
                                for (var j = 0; j < aOnamount.length; j++) {
                                    if (aOnamount[j].Agcode == aResults[i].Agcode) {
                                        bIsExist = true;
                                        break;
                                    }
                                }

                                if (bIsExist) { // 있으면 금액 누적
                                    aOnamount[j].Samount += Number(aResults[i].Samount);
                                    aOnamount[j].Bamount += Number(aResults[i].Bamount);
                                    aOnamount[j].Count = aOnamount[j].Count + 1;
                                } else { // 없으면 추가
                                    aOnamount.push({
                                        Agcode: aResults[i].Agcode,
                                        Samount: Number(aResults[i].Samount),
                                        Bamount: Number(aResults[i].Bamount),
                                        Count: 1,
                                        Venno: aResults[i].Venno
                                    });
                                }
                            } else {
                                continue;
                            }

                        }

                        // doc.text(88, 101, _oCount.toString()); // 
                        // doc.text(88, 133, _oCount.toString()); // 
                        // doc.text(113, 165, _oCount.toString()); // 

                        // doc.text(118, 101, aOnamount[0].Samount.toString()); // 
                        // doc.text(118, 133, aOnamount[0].Samount.toString()); // 
                        // doc.text(138, 165, aOnamount[0].Samount.toString()); // 
                        // doc.text(160, 101, aOnamount[0].Bamount.toString()); // 
                        // doc.text(160, 133, aOnamount[0].Bamount.toString()); // 
                        // doc.text(167, 165, aOnamount[0].Bamount.toString()); // 

                        // doc.setFontSize(8)
                        // doc.text(78, 165, aOnamount[0].Venno); // 
                        // doc.text(35, 165, "2000-3000-4444-5555"); // 

//------------------------------------------------공제받지 못한 매입세액 명세서--------------------------------------------------------------------


                        doc.addPage();
                        doc.setFontSize(10);

                        doc.addImage(pdfstr6, 'JPEG', 0, 0, 210, 290)

                        doc.text(64, 43, _fiscal) // 연도
                        doc.text(85, 43, _quarter.toString()) // 분기

                        doc.text(99, 43, quarterdate[_quarter - 1].stmonth.toString()) //
                        doc.text(107, 43, quarterdate[_quarter - 1].stday.toString()) // 

                        doc.text(123, 43, quarterdate[_quarter - 1].edmonth.toString()) // 
                        doc.text(130, 43, quarterdate[_quarter - 1].edday.toString()) // 

                        doc.text(155, 67, "101-01-12345") // 사업자등록번호
                        doc.text(54, 65, "SYNC-REST")
                        doc.text(105, 65, "구도현") // 성명(대표자)



                        var dedCount = 0;
                        var dedtotSAmount = 0;
                        var dedtotBAmount = 0;


                        for (var i = 0; i < aResults.length; i++) { // 매출 공급가액 및 세액 합산
                            if (aResults[i].Taxcode == 'VC') {
                                dedCount++;
                                dedtotSAmount += Number(aResults[i].Samount);
                                dedtotBAmount += Number(aResults[i].Bamount);
                            } else {
                                continue;
                            }

                        }

                        doc.text(105, 94, dedCount.toString())
                        doc.text(120, 94, dedtotSAmount.toString())
                        doc.text(150, 94, dedtotBAmount.toString())

                        doc.text(105, 120, dedCount.toString())
                        doc.text(120, 120, dedtotSAmount.toString())
                        doc.text(150, 120, dedtotBAmount.toString())




//------------------------------------------------부가가치세 신고서 1pg-----------------------------------------------------------------------------------------

                        doc.addPage();
                        doc.setFontSize(8);

                        doc.addImage(pdfstr4, 'JPEG', 0, 0, 210, 290)


                        doc.text(34, 55, _fiscal) // 연도
                        doc.text(50, 55, _quarter.toString()) // 분기

                        doc.text(59, 55, quarterdate[_quarter - 1].stmonth.toString()) //
                        doc.text(67, 55, quarterdate[_quarter - 1].stday.toString()) // 

                        doc.text(76, 55, quarterdate[_quarter - 1].edmonth.toString()) // 
                        doc.text(83, 55, quarterdate[_quarter - 1].edday.toString()) // 

                        doc.text(145, 60, "1  0  1       0  1       1  2  3  4  5") // 사업자등록번호
                        doc.text(57, 60, "SYNC-REST")
                        doc.text(100, 60, "구도현") // 성명(대표자)

                        doc.text(59, 74, "종로구 종로2가") // 사업장 주소
                        doc.text(100, 68, "010-1234-5678") // 전화번호
                        doc.text(59, 68, "1999.12.31") // 생년월일

                        doc.text(100, 89, AgtotSamount.toString())
                        doc.text(160, 89, AgtotBamount.toString())

                        doc.text(100, 100, aOnamount[0].Samount.toString())
                        doc.text(160, 100, aOnamount[0].Bamount.toString())

                        doc.text(100, 120, (aOnamount[0].Samount + AgtotSamount).toString())
                        doc.text(160, 120, (aOnamount[0].Bamount + AgtotBamount).toString())

                        doc.text(100, 124, VentotSamount.toString())
                        doc.text(160, 124, VentotBamount.toString())

                        doc.text(100, 146, VentotSamount.toString())
                        doc.text(160, 146, VentotBamount.toString())

                        doc.text(100, 150, dedtotSAmount.toString())
                        doc.text(160, 150, dedtotBAmount.toString())

                        doc.text(100, 154, (VentotSamount - dedtotSAmount).toString())
                        doc.text(160, 154, (VentotBamount - dedtotBAmount).toString())

                        doc.text(160, 158, (aOnamount[0].Bamount + AgtotBamount - VentotBamount + dedtotBAmount).toString())


                        doc.setFontSize(20);
                        doc.text(88, 33, 'V');

//-------------------------------------------------신고서 2pg-------------------------------------------------------------------------------------

                        doc.addPage();
                        doc.setFontSize(8);

                        doc.addImage(pdfstr5, 'JPEG', 0, 0, 210, 290)

                        // doc.text(120, 80, aOnamount[0].Samount.toString())
                        // doc.text(165, 80, aOnamount[0].Bamount.toString())

                        // doc.text(120, 113, aOnamount[0].Samount.toString())
                        doc.text(120, 122, dedtotSAmount.toString())
                        doc.text(165, 122, dedtotBAmount.toString())

                        doc.text(120, 134, dedtotSAmount.toString())
                        doc.text(165, 134, dedtotBAmount.toString())
                        
//------------------------------------------발행금액 집계표--------------------------------------------//
                        doc.addPage();
                        doc.setFontSize(10);

                        doc.addImage(pdfstr7, 'JPEG', 0, 0, 210, 290)
                        
                        doc.text(64, 45, _fiscal) // 연도
                        doc.text(85, 45, _quarter.toString()) // 분기

                        doc.text(99, 45, quarterdate[_quarter - 1].stmonth.toString()) //
                        doc.text(107, 45, quarterdate[_quarter - 1].stday.toString()) // 

                        doc.text(123, 45, quarterdate[_quarter - 1].edmonth.toString()) // 
                        doc.text(130, 45, quarterdate[_quarter - 1].edday.toString()) // 

                        doc.text(155, 90, "101-01-12345") // 사업자등록번호
                        doc.text(54, 75, "SYNC-REST")
                        doc.text(155, 75, "구도현") // 성명(대표자)
                        doc.text(54, 90, "종로") // 성명(대표자)

                        doc.text(60, 140, (aOnamount[0].Bamount + aOnamount[0].Samount).toString());
                        doc.text(95, 140, (aOnamount[0].Bamount + aOnamount[0].Samount).toString());
                        doc.text(95, 151, (aOnamount[0].Bamount + aOnamount[0].Samount).toString());
                        doc.text(70, 207, (aOnamount[0].Bamount + aOnamount[0].Samount).toString());
                        


                        //doc.text( )

                        
                        doc.save("부가세신고서.pdf");
                    },
                    error: function (oError) {
                        console.group("에러", oError);

                    }
                });





            }
        });
    });
