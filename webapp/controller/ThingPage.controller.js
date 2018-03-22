sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller) {
    "use strict";
    return Controller.extend("webapp.controller.ThingPage", {
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavBack: function (oEvent) {
            this.getRouter().navTo("Main", {
            });

        }
    });
});