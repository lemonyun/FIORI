sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../controller/formatter",
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
                var oTable = oEvent.getSource();
                var oContext = oTable.getSelectedItem().getBindingContext();

                this.getOwnerComponent().getRouter().navTo("Detail", {
                    key: oContext.getPath().substr(1)
                }, false);
            }
            
        });
    });
