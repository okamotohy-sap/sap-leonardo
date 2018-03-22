sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, formatter) {
    "use strict";
    return Controller.extend("webapp.controller.ThingPage", {
      formatter: formatter,
  		onInit: function() {
  			var oRouter = this.getOwnerComponent().getRouter();
  			var oModel = new sap.ui.model.json.JSONModel();
  			this.getView().setModel(oModel, "thingPageModel");
  			oRouter.getRoute("thingpage").attachMatched(this._onRouteMatched, this);
  		},
      /**
  		/** Retreive the ThingId and ThingType and do a call to the backend with the expand paramaters to bind it to the header and basic data section **/
  		_onRouteMatched: function(oEvent) {
  			var arg = oEvent.getParameter("arguments");
  			this.sThingId = arg.thingId;
  			var sThingType = arg.thingType;
  			var oSeverity = {
  				iHighSeverity: arg.highSeverity,
  				iMediumSeverity: arg.mediumSeverity,
  				iLowSeverity: arg.lowSeverity
  			};
  			var oDetailsThingModel = this._findThingModel(sThingType);
  			if (oDetailsThingModel) {
  				this._readDetailsService(oDetailsThingModel, this.sThingId);
  			} else {
  				var sURL = "/IOTAS-DETAILS-THING-ODATA/CompositeThings/ThingType/v1/" + sThingType;
  				var oNewThingTypeModel = new sap.ui.model.odata.ODataModel(sURL);
  				this._readDetailsService(oNewThingTypeModel, this.sThingId);
  			}
  			//Render the Measured Values Control
  			var oContext = {
  				ThingId: this.sThingId,
  				ThingType: sThingType
  			};
  			this.byId("idMeasuringPoints").doReload(oContext);
  			//Call the events service for rendering timeline and eventList control
  			this._readEventsService(this.sThingId);

  			this.getView().getModel("thingPageModel").setProperty("/severity", oSeverity);
  			if (this.byId("idSemanticBarHBox").getDomRef()) {
  				this._renderSemanticBar(oSeverity.iHighSeverity, oSeverity.iMediumSeverity, oSeverity.iLowSeverity);
  			}
  		},
      _findThingModel: function(sThingType) {
      //Create a loop and just check how many thingModels are created and break if there is no thingModel
      for (var i = 1; i < 100; i++) {
        if (this.getOwnerComponent().getModel("thingModel" + i)) {
          //Compare the thingType with the thingModel thingtype , if it matches then return that thingModel
          var sServiceURL = this.getOwnerComponent().getModel("thingModel" + i).sServiceUrl;
          var matchedThingType = sServiceURL.substring(sServiceURL.lastIndexOf("/") + 1);
          if (sThingType === matchedThingType) {
            return this.getOwnerComponent().getModel("thingModel" + i);
          }
        } else {
          jQuery.sap.log.error(
            "The thingType has not matched with the ThingModel created in the Manifest file , hence need to create a new oData Model for this thingType"
          );
          break;
        }
      }
    }
  /**
        onNavBack: function (oEvent) {
            //this.getRouter().navTo("Main", {}, true);
            window.history.go(-1)
        }
        *//
    });
});
