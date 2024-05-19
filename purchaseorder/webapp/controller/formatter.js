sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";
	return {

		checkstate: function (checkState) {

			if (checkState > 1) {
                return sap.ui.core.ValueState.Success;
			} else {
                return sap.ui.core.ValueState.Error;
            }
		}
	};
});