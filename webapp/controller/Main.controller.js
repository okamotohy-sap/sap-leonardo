sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function (Controller) {
	"use strict";
	return Controller.extend("public.controller.Main", {
		zoomToMap: function (oEvent) {
			oEvent.getParameters().context = oEvent.getParameter("thing");
			this.byId("idMap").doMapZoom(oEvent);
		}
	});
});