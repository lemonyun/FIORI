sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../controller/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.Detail", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(
                    this._onObjectMatched, this);
                
            },
            _onObjectMatched: function(oEvent) {
                debugger;
                this._sKey = "/" + oEvent.getParameter("arguments").key;
                this.getView().bindElement({
                    path: this._key
                });
            }
            // onBeforeRebindTable: function(oSource) {
            //     debugger;
            //     var binding = oSource.getParameter("arguments");
            //     var oFilter = new sap.ui.model.Filter("STATUS", sap.ui.model.FilterOperator.NE, "D");
            //     binding.filters.push(oFilter);
            // }

            
        });
    });
