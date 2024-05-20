sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("purchaseorder.controller.Detail", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
               
                this.oRouter.getRoute("Detail").attachPatternMatched(
                    this._onObjectMatched, this);
                
            },
            _onObjectMatched: function(oEvent) {

                // this._sKey = "/" + oEvent.getParameter("arguments").key;
                // this.getView().bindElement({
                //     path: this._key
                // });
                var oArgu = oEvent.getParameters().arguments;
                var aFilters = [];

                debugger;
                if(oArgu.Pocode) aFilters.push(new Filter('Pocode', FilterOperator.EQ, oArgu.Pocode));

                var oFilter = new Filter({
                    filters : aFilters,
                    and : true
                });

                // this.byId("idPage").setTitle(oArgu.ProductName + " 상품의 주문 조회");
                this.byId("idTable").getBinding("items").filter(oFilter);
            },
            onNavBack: function() {
                debugger;
                this.oRouter.navTo('RouteMain', {
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
