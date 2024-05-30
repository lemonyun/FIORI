sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../controller/formatter",
    "sap/ui/core/format/DateFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.Main", {
            formatter: formatter,
            onInit: function () {

            },
            handleItemPress: function(oEvent) {
                debugger;
                var oTable = oEvent.getSource();
                var oContext = oTable.getSelectedItem().getBindingContext();
                var aPocodes = oContext.getPath().split("'");

                this.getOwnerComponent().getRouter().navTo("Detail", {
                    Pocode : aPocodes[1]
                }, true);

                // var oTable = oEvent.getSource();
                // var oContext = oTable.getSelectedItem().getBindingContext();

                // this.getOwnerComponent().getRouter().navTo("Detail", {
                //     key: oContext.getPath().substr(1)
                // }, false);

            },
            fnDateToString: function (sValue) {
                if(sValue){
                var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern : 'yyyy년 MM월 dd일'
                });
                return oFormat.format(sValue);
                }
            }

            
        });
    });
