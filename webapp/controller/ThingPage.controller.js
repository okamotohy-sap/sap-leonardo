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

  settingsModel : {
    chartType : {
      name : "Chart Type",
      defaultSelected : "3",
      values : [{
        key : "0",
        name : "Bubble Chart",
        vizType : "timeseries_bubble",
        json : "/bubble/medium.json",
        value : ["Cost"],
        dataset : {
          "dimensions": [{
            "name": "Date",
            "value": "{Date}",
            "dataType":"date"
          }],
          "measures": [{
            "name": "Cost",
            "value": "{Cost}"
          },
          {
            "name": "Revenue",
            "value": "{Revenue}"
          }],

          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            },
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            }
          },
          valueAxis: {
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          categoryAxis: {
            title: {
              visible: true
            }
          },
          sizeLegend: {
            formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
            title: {
              visible: true
            }
          },
          title: {
            visible: false
          }
        }
      },{
        key : "1",
        name : "Column Chart",
        vizType : "timeseries_column",
        json : "/column/medium.json",
        value : ["Cost"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost',
            value: '{Cost}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            },
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            }
          },
          valueAxis: {
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          title: {
            visible: false
          }
        }
      },{
        key : "2",
        name : "Column Chart with multiple Series",
        vizType : "timeseries_column",
        json : "/timeBulletStacked.json",
        value : ["Cost2", "Cost1"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost2',
            value: '{Cost2}'
          },{
            name: 'Cost1',
            value: '{Cost1}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            },
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            }
          },
          valueAxis: {
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          title: {
            visible: false
          }
        }
      },{
        key : "3",
        name : "Line Chart",
        vizType : "timeseries_line",
        json : "/column/timeAxis.json",
        value : ["Revenue"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Revenue',
            value: '{Revenue}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "4",
        name : "Line Chart with Dynamic Value Axis",
        vizType : "timeseries_line",
        json : "/column/timeAxis.json",
        value : ["Revenue"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Revenue',
            value: '{Revenue}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: true
          }
        }
      },{
        key : "5",
        name : "Scatter Chart",
        vizType : "timeseries_scatter",
        json : "/column/large.json",
        value : ["Cost"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost',
            value: '{Cost}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            },
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            }
          },
          valueAxis: {
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          title: {
            visible: false
          }

        }
      },{
        key : "6",
        name : "Combined Column & Line",
        vizType : "timeseries_combination",
        json : "/column/medium.json",
        value : ["Revenue", "Cost"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Revenue',
            value: '{Revenue}'
          },{
            name: 'Cost',
            value: '{Cost}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "7",
        name : "Combined Column & Line with Dual Axis",
        vizType : "dual_timeseries_combination",
        json : "/column/medium.json",
        value : ["Revenue", "Cost"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Revenue',
            value: '{Revenue}'
          },{
            name: 'Cost',
            value: '{Cost}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          valueAxis2: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "8",
        name : "Bullet",
        vizType : "timeseries_bullet",
        json : "/timeBulletStacked.json",
        value : ["Cost", "Budget"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost',
            value: '{Cost}'
          },{
            name: 'Budget',
            value: '{Budget}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            },
            dataPointStyle : {
              rules : [{
                dataContext : {Cost : "*"},
                properties : {
                  color : "sapUiChartPaletteSequentialHue1Light1"
                },
                displayName : "Actual",
                dataName : {Cost : "Actual"}
              }]
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          valueAxis2: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "9",
        name : "Stacked Column",
        vizType : "timeseries_stacked_column",
        json : "/timeBulletStacked.json",
        value : ["Cost2", "Cost1"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost2',
            value: '{Cost2}'
          },{
            name: 'Cost1',
            value: '{Cost1}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          valueAxis2: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "10",
        name : "Stacked Column 100%",
        vizType : "timeseries_100_stacked_column",
        json : "/timeBulletStacked.json",
        value : ["Cost2", "Cost1"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Cost2',
            value: '{Cost2}'
          },{
            name: 'Cost1',
            value: '{Cost1}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          valueAxis2: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "11",
        name : "Waterfall",
        vizType : "timeseries_waterfall",
        json : "/timeWaterFall.json",
        value : ["Change of Stock"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Change of Stock',
            value: '{Change of Stock}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: "lastDataPoint"
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false
            }
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      },{
        key : "12",
        name : "Periodic Waterfall",
        vizType : "timeseries_waterfall",
        json : "/demands_supplies.json",
        value : ["Supplies", "Demands"],
        dataset : {
          dimensions: [{
            name: 'Date',
            value: "{Date}",
            dataType:'date'
          }],
          measures: [{
            name: 'Demands',
            value: '{Demands}'
          },{
            name: 'Supplies',
            value: '{Supplies}'
          }],
          data: {
            path: "/milk"
          }
        },
        vizProperties : {
          plotArea: {
            window: {
              start: "firstDataPoint",
              end: null
            },
            dataLabel: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
              visible: false,
              recapTitle: "End of day",
              showRecap: true
            },
            startValue: 10
          },
          valueAxis: {
            visible: true,
            label: {
              formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
            },
            title: {
              visible: false
            }
          },
          timeAxis: {
            title: {
              visible: false
            },
            interval : {
              unit : ''
            }
          },
          legend: {
            title: {
              visible: false
            },
            label: {
              text: {
                negativeValue: "Demands",
                positiveValue: "Supplies"
              }
            }
          },
          title: {
            visible: false
          },
          interaction: {
            syncValueAxis: false
          }
        }
      }]
    }
  }



  /**
  onNavBack: function (oEvent) {
  //this.getRouter().navTo("Main", {}, true);
  window.history.go(-1)
}
**/
});
});
