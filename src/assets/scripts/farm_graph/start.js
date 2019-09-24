var baseUrl =`${window.location.origin}`;
var $fg = jQuery.noConflict();
window.process = {
  env: {
    FORMS_PATH: baseUrl + '/assets/scripts/farm_graph/forms/',
    DEVICES_PATH: baseUrl + '/assets/scripts/farm_graph/devices.json'
  }
};

var farmItemTypes = {
  "None": 0,
  "FarmSize": 1,
  "Antenna": 2,
  "Device": 3,
  "FeedFence": 4,
  "Cubicles": 5,
  "Wall": 6,
  "Location": 7,
  "FeedArea": 8,
  "Barn": 9,
  "Area": 10,
  "MilkTank": 11,
  "ConcentrateSilo": 12
};
var deviceTypes = {
  "Astronaut": 1,
  "Cosmix": 2,
  "Grazeway": 3,
  "CrsPlus": 4,
  "IDStation": 5,
  "Climate": 6,
  "CalfSetup": 7,
  "Light": 8,
  "AstronautVCPC": 9,
  "Atlantis": 10,
  "CosmixVCPC": 21,
  "MilkoMeter": 25,
  "GrazewayVCPC": 37,
  "CrsPlusVCPC": 39,
  "AstronautA4": 43,
  "CentralUnit": 44,
  "QwesLDReceiver": 45,
  "Vector": 46,
  "SCRService": 47,
  "CRSM3": 48,
  "QwesISOVPU": 49,
  "QwesISOLDReceiver": 50,
  "AstronautA5": 51,
  "SCRF1Collector": 52
};
var responseHeaders = {
  "UpdateFarmItemSizeAndLocation": 0,
  "RemoveNodeItem": 1,
  "GetNodeItems": 2,
  "SetNodeItem": 3,
  "AddNodeItem": 4,
  "FarmGraphDimensionValidation": 5,
  "GetFarmItems": 6,
  "UpdateFarmSize": 7,
  "GetFarm": 8,
  "CreateNewFarmNode": 9,
  "SetNodeRouting": 10,
  "UpdateAllFarmItemSizeAndLocation": 11
};
