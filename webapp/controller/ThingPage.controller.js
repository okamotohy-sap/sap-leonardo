sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  'sap/ui/model/json/JSONModel',
  'sap/viz/ui5/format/ChartFormatter',
  'jquery.sap.global',
  'sap/viz/ui5/data/FlattenedDataset',
  'sap/viz/ui5/controls/common/feeds/FeedItem',
  'sap/viz/ui5/format/ChartFormatter',
  'sap/viz/ui5/api/env/Format',
  "sap/ui/iot/elements/IoTEventsOnChartElement"

], function (Controller, formatter, jQuery, JSONModel, FlattenedDataset, FeedItem, ChartFormatter, Format, IoTEventsOnChart) {
  "use strict";
  return Controller.extend("webapp.controller.ThingPage", {
    formatter: formatter,
    onInit: function() {
      this.bRenderChart = true;
			this.bNavMp = false;
      var oRouter = this.getOwnerComponent().getRouter();
      var oModel = new sap.ui.model.json.JSONModel();
      this.getView().setModel(oModel, "thingPageModel");
      oRouter.getRoute("thingpage").attachMatched(this._onRouteMatched, this);
      var oModel2 = new sap.ui.model.json.JSONModel();
      this.byId("idChart").setModel(oModel2, "chartModel");
    },
    /**
    /** Retreive the ThingId and ThingType and do a call to the backend with the expand paramaters to bind it to the header and basic data section **/
    _onRouteMatched: function(oEvent) {
      /* これをいれるとThingPageに進まなくなる。
      sap.ui.getCore().byId("idBusy").close();
      */
      // sap.ui.getCore().byId("idBusy").close();
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


      var sHeaderTitle = arg.headerTitle;
      var sSubHeaderTitle = arg.subHeaderTitle;
      var oChart = this.byId("idChart");
      /*
      oChart.setHeaderTitle("");
      oChart.setSubheaderTitle("");
      this.aPath = oEvent.getParameter("arguments").mpPath.split(".");
      */
      this.eventsContext = sap.ui.getCore().getModel("eventsModel") && sap.ui.getCore().getModel("eventsModel").getData().eventsData;
      oChart.setHeaderTitle("");
      oChart.setSubheaderTitle("");
      oChart.addDefaultPST("TI_SensorTag_CAPPABILITY", "sensorAccX");
      oChart.bChartInit = true;
      oChart.bReload = false;
      oChart.bNavFromMeasuredValue = true;
      oChart.bNavFromEventList = false;
      // this._renderChart(oChart, this.sThingId);

      oChart.setAssetId(this.sThingId, true);
      oChart.rerender();

      // var oData = this.eventsContext.getModel().getProperty(this.eventsContext.getPath()); //Set this to the this context so that it can be accessible everywhere

      //ここまではチャートを表示するためのコード。
      //ここからはチャートの上にイベントを表示する。

      //ここまではうまく行った
      /*
      var oModel = sap.ui.getCore().getModel("measuredValueModel");
      var oMpContext = oEvent.getParameter("context");
      oModel.setProperty("/mpData", oMpContext);
      */

      /*
      var oEventContext = oEvent.getParameter("event");
      var oModel3 = this.getView().getModel("thingPageModel");
      oModel3.setProperty("/eventsData", oEventContext);
      sap.ui.getCore().setModel(oModel3, "eventsModel");
      this.eventsContext = sap.ui.getCore().getModel("eventsModel") && sap.ui.getCore().getModel("eventsModel").getData().eventsData;
      //this._renderEventsOnChart(oChart, this.eventsContext);
      // this._renderEventsOnChart(oChart, this.eventsContext);
      */
      /*
      oChart.setEventsVisible(true);
      var eventsArr = [];
      //この下の部分がうまくいかない。
      var oData = this.eventsContext.getModel().getProperty(this.eventsContext.getPath()); //Set this to the this context so that it can be accessible everywhere
      */
      /*
      eventsArr.push(oData);
      oChart.getModel("chartModel").setData(eventsArr);
      oChart.addDefaultPST("TI_SensorTag_CAPPABILITY", "sensorAccX");
      var oTemplate = new IoTEventsOnChart({
        businessTimeStamp: "{chartModel>BusinessTimestamp}",
        severity: "{chartModel>Severity}",
        eventId: "{chartModel>EventId}",
        eventDescription: "{chartModel>Description}",
        eventProperty: "{chartModel>Property}",
        eventStatus: "{chartModel>Status}"
      });
      oChart.bindAggregation("events", "chartModel>/", oTemplate);
      */
      //this._renderChart();
      /*
      oChart.bChartInit = true;
      oChart.bReload = false;
      oChart.bNavFromMeasuredValue = false;
      oChart.bNavFromEventList = false;
      this._renderChart(oChart, this.sThingId);
      */

      // oChart.setHeaderTitle(sHeaderTitle);
      // oChart.setSubheaderTitle(sSubHeaderTitle);
      /*
      var oMpContext = oEvent.getParameter("context");
      var oModel = this.getView().getModel("thingPageModel");
      */

      //this.getView().setModel(arg,"arg");

      //this.aPath = arg.Property.split(".");
      //this.oChart.addDefaultPST(this.aPath[0], this.aPath[1]);
      /*
      //Bug because the new value wont reflect
      this.oChart.bChartInit = true;
      this.oChart.bReload = false;
      this._renderChart();
      */

      /**
      oModel.setProperty("/mpData", oMpContext);
      var oProperty = oMpContext.getObject(oMpContext.getPath()).measuredValue;

      oChart.setHeaderTitle("");
      oChart.setSubheaderTitle("");
      //this.aPath = oEvent.getParameter("arguments").mpPath.split(".");
      this.aPath = oProperty;
      oChart.addDefaultPST(this.aPath[0], this.aPath[1]);
      oChart.bChartInit = true;
      oChart.bReload = false;
      oChart.bNavFromMeasuredValue = true;
      oChart.bNavFromEventList = false;
      this._renderChart(oChart, this.sThingId);
      **/

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

  _renderEventsOnChart: function(oChart, eventsContext) {
    oChart.setEventsVisible(true);
    var eventsArr = [];
    if (eventsContext && eventsContext.getPath) {
      var oData = eventsContext.getModel().getProperty(eventsContext.getPath()); //Set this to the this context so that it can be accessible everywhere
      eventsArr.push(oData);
      oChart.getModel("chartModel").setData(eventsArr);
      // var aMPPath = oData.Property.split("/");
      /// oChart.addDefaultPST(aMPPath[1], aMPPath[2]);
      oChart.addDefaultPST("TI_SensorTag_CAPPABILITY", "sensorAccX");
      var oTemplate = new IoTEventsOnChart({
        businessTimeStamp: "{chartModel>BusinessTimestamp}",
        severity: "{chartModel>Severity}",
        eventId: "{chartModel>EventId}",
        eventDescription: "{chartModel>Description}",
        eventProperty: "{chartModel>Property}",
        eventStatus: "{chartModel>Status}"
      });
      oChart.bindAggregation("events", "chartModel>/", oTemplate);
    }
    if (!this.bRenderChart) {
      oChart.setAssetId(this.sThingId);
    }

  },

  _renderChart: function(oChart, sThingId) {
    // Workaround as of now because onAfterRendering does not get called for the second time
    if (!this.bRenderChart) {
      oChart.setEventsVisible(false);
      oChart.setAssetId(sThingId);
       //the chart is not getting rendered ,hence we rerender it
      this.oChart.rerender();
    }
  },

/*
  _renderChart: function() {
    // Workaround as of now because onAfterRendering does not get called for the second time
    if (!this.bRenderChart) {
      this.oChart.setEventsVisible(false);
      this.oChart.setAssetId(this.sThingId);
      //the chart is not getting rendered ,hence we rerender it
      this.oChart.rerender();
    }
  },
  */

  /*
  _renderChart: function(oChart, sThingId) {
  // Workaround as of now because onAfterRendering does not get called for the second time
  if (!this.bRenderChart) {
  oChart.setEventsVisible(false);
  oChart.setAssetId(sThingId);
}
}
*/

/**
onNavBack: function (oEvent) {
//this.getRouter().navTo("Main", {}, true);
window.history.go(-1)
}
**/
});
});
