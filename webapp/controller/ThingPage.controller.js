sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  'sap/ui/model/json/JSONModel',
  'sap/viz/ui5/format/ChartFormatter',
  'jquery.sap.global',
  'sap/viz/ui5/data/FlattenedDataset',
  'sap/viz/ui5/controls/common/feeds/FeedItem',
  'sap/viz/ui5/format/ChartFormatter',
  'sap/viz/ui5/api/env/Format'

], function (Controller, formatter, jQuery, JSONModel, FlattenedDataset, FeedItem, ChartFormatter, Format) {
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
      /**
      this.byId("idMeasuringPoints").doReload(oContext);
      //Call the events service for rendering timeline and eventList control

      this._readEventsService(this.sThingId);
      this.getView().getModel("thingPageModel").setProperty("/severity", oSeverity);
      if (this.byId("idSemanticBarHBox").getDomRef()) {
      this._renderSemanticBar(oSeverity.iHighSeverity, oSeverity.iMediumSeverity, oSeverity.iLowSeverity);
    }
    **/
  },

  _renderSemanticBar: function(urgent, important, information) {
    var oHeaderImage = this.byId("ObjectPageLayoutHeaderTitle").getAggregation("_objectImage");
    if (!oHeaderImage) {
      oHeaderImage = {};
      oHeaderImage.aCustomStyleClasses = [];
    }
    for (var i = 0; i <= oHeaderImage.aCustomStyleClasses.length; i++) {
      oHeaderImage.aCustomStyleClasses.pop();
    }
    if (urgent > 0) {
      $(".objectPageHeaderImage").css({
        'border-left-color': '#bb0000',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".headerImage").css({
        'border-left-color': '#bb0000',
        'border-left-style': 'solid',
        'border-left-width': '.5rem',
        'color': 'white'
      });
      $(".objectSematicBar").css({
        'background-color': '#bb0000',
        'margin': '0rem'
      });
      //$(".sapUxAPObjectPageHeaderIdentifier .sapUxAPObjectPageHeaderObjectImageForce .sapUxAPObjectPageHeaderStickied .sapUxAPObjectPageHeaderObjectImage").css({'border-left-color': 'red', 'border-left-style': 'solid', 'border-left-width': '.5rem'});
      oHeaderImage.aCustomStyleClasses.push("thingPageRedSematic");
    } else if (important > 0) {
      $(".objectPageHeaderImage").css({
        'border-left-color': '#e78c07',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".headerImage").css({
        'border-left-color': '#e78c07',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".objectSematicBar").css({
        'background-color': '#e78c07',
        'margin': '0rem'
      });
      oHeaderImage.aCustomStyleClasses.push("thingPageOrangeSematic");
    } else if (information > 0) {
      $(".objectPageHeaderImage").css({
        'border-left-color': '#2b7d2b',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".headerImage").css({
        'border-left-color': '#2b7d2b',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".objectSematicBar").css({
        'background-color': '#2b7d2b',
        'margin': '0rem'
      });
      oHeaderImage.aCustomStyleClasses.push("thingPageGreenSematic");
    } else {
      $(".objectPageHeaderImage").css({
        'border-left-color': '#d3d7d9',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".headerImage").css({
        'border-left-color': '#d3d7d9',
        'border-left-style': 'solid',
        'border-left-width': '.5rem'
      });
      $(".objectSematicBar").css({
        'background-color': '#d3d7d9',
        'margin': '0rem'
      });
      oHeaderImage.aCustomStyleClasses.push("thingPageGreySematic");
    }
    oHeaderImage.aCustomStyleClasses.push("sapUxAPObjectPageHeaderObjectImage");

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
  },

  _readDetailsService: function(oDetailsModel, sThingId) {
    var that = this;
    oDetailsModel.read("/Things('" + sThingId + "')", {
      urlParameters: {
        "$expand": "DYN_ENT_gbs_leonardo_com_itelligencegroup_iot_demo_sensor__Image,DYN_ENT_gbs_leonardo_com_itelligencegroup_iot_demo_sensor__TI_SensorTag_CAPPABILITY"
      },
      success: function(oData) {
        that.getView().getModel("thingPageModel").setProperty("/detailsData", oData);
        var oThingImage = that.byId("idHeaderImage");
        oThingImage.attachError(that.onImageLoadError, that);
        oThingImage.setSrc("/backend-image/things/" + that.sThingId);
        sap.ui.getCore().byId("idBusy").close();
      },
      error: function(oError) {
        jQuery.sap.log.error(oError);
        sap.ui.getCore().byId("idBusy").close();
      }
    });
  },

  onImageLoadError: function() {
    this.byId("ObjectPageLayout").getHeaderTitle().setObjectImageURI("sap-icon://machine");
    this.byId("idHeaderImage").setVisible(false);
    this.byId("idHeaderIcon").setVisible(true);
  },

  _readEventsService: function(sThingId) {
    var that = this;
    this.byId("idEventList").setThingId(sThingId);
    this.byId("idEventList").doReloadControl = true;
    var oEventsModel = this.getOwnerComponent().getModel("events");
    var oFilter = new sap.ui.model.Filter("ThingId", sap.ui.model.FilterOperator.EQ, sThingId);
    var oSorter = new sap.ui.model.Sorter("BusinessTimestamp", true); // sort descending
    oEventsModel.read("/Events", {
      filters: [oFilter],
      sorters: [oSorter],
      urlParameters: {
        "$top": "6",
        "$skip": "0"
      },
      success: function(oData) {
        that.getView().getModel("thingPageModel").setProperty("/eventsData", oData.results);
      },
      error: function(oError) {
        jQuery.sap.log.error(oError);
      }
    });
  },

  createContent: function(oController) {
    var oPage = new sap.ui.iot.controls.IoTChart({
      thingId :"<thingId>";
      id : "idChart";
      noOfHours :"24";
      isSliderVisible :true;
      events : [
      new sap.ui.iot.elements.IoTEventsOnChartElement({
      eventStatus :"<status string>"
      eventProperty :"<property String>"
      eventDescription :"<description string>"
      eventId :"<eventId string>"
      businessTimeStamp :"<date Object>"
      severity :"1<integer>"
      })
      ]
    });

    }


/**
onNavBack: function (oEvent) {
//this.getRouter().navTo("Main", {}, true);
window.history.go(-1)
}
**/
});
});
