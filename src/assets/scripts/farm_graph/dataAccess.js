farmDbModel = function () {
  var self = this;
  self.serviceUrl = window.baseUrl + "Content/FarmGraph.aspx";
  self.options = {
    type: 'POST',
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    beforeSend: function (jqXHR, settings) {
      var preloader = $fg(".container-fluid .preloader");
      if (preloader.length > 0) {
        preloader.show();
      } else {
        var preloader = $fg("<div>", {
          class: "preloader"
        })
        var text = $fg("<div>").text("processing...");
        text.appendTo(preloader);
        preloader.appendTo($fg(".container-fluid")[0]);
      }
    },
    complete: function (jqXHR, textStatus) {
      var preloader = $fg(".container-fluid .preloader");
      preloader.fadeOut(300);
    }
  };

  self.Post = function (u, data, async, callback) {
    var url = self.serviceUrl + u;
    var options = $fg.extend(true, self.options, {
      url: url,
      data: data,
      async: async,
      success: function (response, textStatus, jqXHR) {
        var fgRequestAjaxResponseHeader = jqXHR.getResponseHeader("FarmGraphAjaxRequestHeader");
        var error = (response.d === null || response.d === undefined) ? false : response.d.Error;
        if (!error)
          farmGraphModule.ShowNotification({
            responseHeader: fgRequestAjaxResponseHeader,
            response: response.d
          });
        if (response) callback(response);
      },
      error: function (error) {
        callback(error);
      }
    });

    $fg.ajax(options);
  }

  self.CreateNewFarmNode = function (farm, callback) {
    var data = JSON.stringify({
      farmNode: {
        Width: farm.width,
        Length: farm.length,
        NodeId: farm.nodeId,
        Name: farm.name
      }
    })
    self.Post('/CreateNewFarmNode', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.GetFarm = function (callback) {

    callback( {
      height: 2359,
      width: 8810,
    });
    return;

    self.Post("/GetFarm", {}, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback({
          width: result.Width,
          height: result.Length
        });
      } else callback(null);
    })
  }

  self.UpdatefarmSize = function (size, callback) {
    var data = JSON.stringify({
      farm: {
        Length: size.Length,
        Width: size.Width
      }
    })
    self.Post("/UpdateFarmSize", data, true, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.GetFarmItems = function (default_data, callback) {
    var template = default_data.devices.concat(default_data.objects).concat(default_data.physicals);
    var data = JSON.stringify({
      template
    });


    // test step
    $fg.getJSON(baseUrl + '/assets/scripts/farm_graph/data.json')
    .done(function (data) {
      callback(data.d);
    })
    return;
    //test step end


    self.Post("/GetFarmItems", data, true, function (response) {
      var result = [];
      if (response.d) {
        result = response.d;
      }
      callback(result);
    })
  }

  self.SetFarmAllItemSizeAndLocation = function (farmItems, callback) {
    var data = JSON.stringify({
      farmItems
    })
    self.Post('/UpdateFarmAllItemSizeAndLocation', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.SetFarmItemSizeAndLocation = function (farmItem, callback) {
    var data = JSON.stringify({
      farmItem
    })
    self.Post('/UpdateFarmItemSizeAndLocation', data, true, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.RemoveNodeItem = function (nodeItem, callback) {
    var data = JSON.stringify({
      nodeItem
    });
    self.Post('/RemoveNodeItem', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.GetNodeItems = function (typeId, locationId, callback) {
    var data = JSON.stringify({
      typeId,
      locationId
    });

    self.Post('/GetNodeItems', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.SetNodeItem = function (nodeItem, callback) {
    var data = JSON.stringify({
      nodeItem
    });
    self.Post('/SetNodeItem', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.SetNodeRouting = function (routing, callback) {
    var data = JSON.stringify({
      routing
    })
    self.Post('/SetNodeRouting', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.AddNodeItem = function (nodeItem, callback) {
    var data = JSON.stringify({
      nodeItem
    });
    self.Post('/AddNodeItem', data, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }

  self.FarmGraphDimensionValidation = function (callback) {
    self.Post('/FarmGraphDimensionValidation', null, false, function (response) {
      if (response.d) {
        var result = response.d;
        callback(result);
      }
    })
  }
}
