  formNodeModel = function (data) {
    var self = this;
    self.data = ko.observableArray(data);
    self.data().push({
      NodeId: -1,
      NodeName: "Select"
    });
    self.newNodeName = ko.observable();
    self.newNodeId = ko.observable();
    self.newNodeType = ko.observable();
    self.newNodeLocation = ko.observable();
    self.newNodeUrl = ko.observable();
  };

  canvasModel = function (data) {
    var self = this;
    self.zoom = ko.observable(data.zoom);
    self.width = ko.observable(data.width);
    self.height = ko.observable(data.height);
    self.getWidth = ko.computed({
      read: function () {
        return self.width();
      },
      write: function (value) {
        if (value.length == 0) value = 0;
        self.width(parseInt(value));
      }
    });
    self.getHeight = ko.computed({
      read: function () {
        return self.height();
      },
      write: function (value) {
        if (value.length == 0) value = 0;
        self.height(parseInt(value));
      }
    });
    self.canvasUpdated = ko.observable(false);
    self.wizardContinueEnabled = ko.computed(function () {
      return self.height() >= 500 && self.width() >= 500;
    });

    self.width.subscribe(function (value) {
      self.canvasUpdated(true);
    });
    self.height.subscribe(function (value) {
      self.canvasUpdated(true);
    });
  };

  routingTypeModel = function (data) {
    var self = this;
    self.id = ko.observable(data.id);
    self.type = ko.observable(data.type);
  };

  const routingTypes = [
    // new routingTypeModel({
    //     id: 1,
    //     type: "Routing"
    // }),
    new routingTypeModel({
      id: 2,
      type: "Routing (DDS)"
    })
  ];

  routingModel = function (prop) {
    var self = this;
    self.id = ko.observable(prop.id);
    self.from = ko.observable(prop.from);
    self.to = ko.observable(prop.to);
    self.gate = ko.observable(prop.gate);
    self.isDefault = ko.observable(prop.isDefault);
    self.isChanged = ko.observable(prop.isChanged);
    self.isDeleted = ko.observable(prop.isDeleted);
    self.to.subscribe(function (value) {
      self.isChanged(true);
    });
    self.isDeleted.subscribe(function (value) {
      self.isChanged(true);
    });
    self.isDefault.subscribe(function (value) {
      self.isChanged(true);
    });
  };

  jsonToModel = function (data) {
    var self = this;
    self.parentGuid = ko.observable(data.parentGuid);
    self.acceptable = ko.observable(data.acceptable);
    self.border = ko.observable(data.border);
    self.textColor = ko.observable(data.textColor);
    self.color = ko.observable(data.color);
    self.zIndex = ko.observable(data.zIndex);
    self.formData = ko.observable(data.formData);
    self.guid = ko.observable(data.guid);
    self.id = ko.observable(data.id);
    self.name = ko.observable(data.name);
    self.order = ko.observable(data.order);
    self.pageTemplate = ko.observable(data.pageTemplate);
    self.position = ko.observable(data.position);

    self.getX = ko.computed({
      read: function () {
        if (!self.position()) return;
        return self.position().x;
      },
      write: function (x) {
        self.position().x = x;
        self.positionIsUpdated(true);
      }
    });
    self.getY = ko.computed({
      read: function () {
        if (!self.position()) return;
        return self.position().y;
      },
      write: function (y) {
        self.position().y = y;
        self.positionIsUpdated(true);
      }
    });
    self.getW = ko.computed({
      read: function () {
        if (!self.position()) return;
        return self.position().w;
      },
      write: function (w) {
        self.position().w = w;
        self.positionIsUpdated(true);
      }
    });
    self.getH = ko.computed({
      read: function () {
        if (!self.position()) return;
        return self.position().h;
      },
      write: function (h) {
        self.position().h = h;
        self.positionIsUpdated(true);
      }
    });

    self.resizable = ko.observable(data.resizable);
    self.radius = ko.observable(data.radius);
    self.status = ko.observable(data.status);
    self.type = ko.observable(data.type);
    self.positionIsUpdated = ko.observable(data.positionIsUpdated);
    self.routableItems = ko.observable(data.routableItems);
    self.routingEnabled = ko.observable(
      data.routingEnabled || {
        input: false,
        output: false,
        ignoredTypes: []
      }
    );

    self.isConnected = ko.computed(function () {
      if (!data.formData) return;
      return self.formData().NodeId > 0;
    });

    // If this part is a device, it is being checked has for a DeviceTypeId
    // if not a device, routable control being with "self.rotingEnabled"
    self.routingIsEnable = ko.computed(function () {
      var output = false;
      if (self.routableItems() != null) {
        var item = ko.utils.arrayFirst(self.routableItems(), function (item) {
          if (item.deviceTypeId && self.formData() != null) {
            if (item.deviceTypeId == self.formData().DeviceTypeId) return item;
          } else return false;
        });
        output = item == null ? false : item.output;
      } else output = self.routingEnabled().output;
      return output;
    });

    if (self.routingIsEnable()) {
      self.routings = ko.observableArray([]);
      self.routingType = data.routingType ?
        ko.observable(new routingTypeModel(data.routingType)) :
        ko.observable(routingTypes[0]);
      if (data.routings) {
        if (data.routings.length > 0) {
          $fg.each(data.routings, function (i, item) {
            self.routings.push(
              new routingModel({
                id: item.id,
                from: data.guid,
                to: item.to,
                gate: item.gate,
                isDefault: item.isDefault,
                isChanged: item.isChanged,
                isDeleted: item.isDeleted
              })
            );
          });
        }
      }
    }
  };

  scriptInit = function(){

  var jsonData = [];
  farmGraphModule.bindJsonElements(function (jsonResponse) {
    farmGraphModule.farmDb.GetFarmItems(jsonResponse, function (data) {
      jsonData = data;
      if (jsonData.length > 0) {
        jsonData = jsonData.map(function (item) {
          return new jsonToModel(item);
        });
      }

      ko.bindingHandlers.directionName = {
        init: function () {
          vm.routingButtonVisible();
        },
        update: function (element, valueAccessor) {
          var index = ko.utils.unwrapObservable(valueAccessor());
          var ldnDirections = [1, 2, 3, 4];
          var ddsDirections = ["L", "R", "LR", "LL", "RL", "RR"];

          //this part using for routing scroller
          var parent = $fg(element).parent();
          parent.find(".dropdown-toggle").off("click");
          parent.find(".dropdown-toggle").on("click", function (e) {
            if ($fg(this).attr("aria-expanded") == "true") return;
            parent.find(".dropdown-scroller").mCustomScrollbar({
              scrollbarPosition: "outside"
            });
            e.preventDefault();
          });
          //this part using for routing scroller end
          var directionName;
          if (
            vm
            .activeElement()
            .routingType()
            .id() === 1
          ) {
            directionName = ldnDirections[index];
            if (!directionName)
              $fg(element)
              .parent()
              .remove();
          } else if (
            vm
            .activeElement()
            .routingType()
            .id() === 2
          ) {
            directionName = ddsDirections[index];
          }
          $fg(element).text(directionName);
        }
      };

      ko.bindingHandlers.routingSetDefault = {
        init: function (element, valueAccessor) {
          var data = ko.utils.unwrapObservable(valueAccessor());
          ko.utils.arrayFilter(vm.activeElement().routings(), function (route) {
            if (data.from() == route.from() && data.isDefault()) {
              $fg(element).attr("checked", true);
            }
          });

          $fg(element).on("click", function () {
            return ko.utils.arrayFilter(vm.activeElement().routings(), function (
              route
            ) {
              route.isDefault(false);
              if (route.id() == data.id()) route.isDefault(true);
            });
          });
        }
      };

      ko.bindingHandlers.hoverToggle = {
        init: function (element, valueAccessor) {
          var guid = valueAccessor();
          if (ko.isObservable(guid)) guid = guid();
          var showObj = $fg(`div${selectors.rectangle.getClass()}[id='${guid}']`);
          ko.utils.registerEventHandler(element, "mouseover", function () {
            ko.utils.toggleDomNodeCssClass(
              element,
              ko.utils.unwrapObservable("bg-light"),
              true
            );
            showObj.addClass("show-route");
          });
          ko.utils.registerEventHandler(element, "mouseout", function () {
            ko.utils.toggleDomNodeCssClass(
              element,
              ko.utils.unwrapObservable("bg-light"),
              false
            );
            showObj.removeClass("show-route");
          });
          ko.utils.registerEventHandler(element, "click", function () {
            ko.utils.toggleDomNodeCssClass(
              element,
              ko.utils.unwrapObservable("bg-light"),
              false
            );
            showObj.removeClass("show-route");
          });
        }
      };

      viewModel = function () {
        var self = this;
        self.editMode = ko.observable(false);
        self.devices = ko.observableArray([]);
        self.physicals = ko.observableArray([]);
        self.objects = ko.observableArray([]);
        self.allTypes = ko.observableArray([]);
        self.createdElements = ko.observableArray(jsonData);
        self.routableElements = ko.computed(function () {
          return ko.utils.arrayFilter(self.createdElements(), function (item) {
            return item.routingEnabled().input || item.routingIsEnable();
          });
        });
        self.activeElement = ko.observable(null);
        self.searchElementKeyword = ko.observable("");
        self.filteredCreatingElementsByRoutable = ko.observableArray([]);
        self.textColor = ko.observable();
        self.routingTypes = ko.observableArray(routingTypes);
        self.screen = ko.observable(window.screen);

        self.setZoomValueByClientScreen = function (slider) {
          var width = window.innerWidth;
          var height = window.innerHeight;
          var windowWidth = farmGraphModule.elements.drawArea.outerWidth(true);
          var windowHeight = farmGraphModule.elements.drawArea.outerHeight(true);
          if (self.editMode())
            width = width - $fg("#drawingObjectBlock").outerWidth(true);
          var zoom = Math.min(width / windowWidth, height / windowHeight) * 100;
          return Math.floor(zoom);
        };

        self.canvasProperties = ko.observable(
          new canvasModel({
            zoom: self.setZoomValueByClientScreen(),
            width: farmGraphModule.elements.farmDrawPluginOptions.canvas.width,
            height: farmGraphModule.elements.farmDrawPluginOptions.canvas.height
          })
        );

        self.getAllTypes = ko.computed(function () {
          var allTypes = self
            .devices()
            .concat(self.physicals())
            .concat(self.objects());
          self.allTypes(allTypes);
        });

        self.legendaPicture = ko.observable(
          `url(${baseUrl}/assets/images/legenda-preview.jpg)`
        );
        self.legenda = ko.computed(function () {
          return ko.utils
            .arrayFilter(self.allTypes(), function (item) {
              return (
                item.type() == farmItemTypes.Barn ||
                item.type() == farmItemTypes.Location ||
                item.type() == farmItemTypes.Area ||
                item.type() == farmItemTypes.FeedFence ||
                item.type() == farmItemTypes.Device
              );
            })
            .sort(function (a, b) {
              return a.order() - b.order();
            });
        });

        self.setZoomValue = function (value) {
          self.canvasProperties().zoom(value);
          $fg(".farm-draw-zone").css({
            zoom: value + "%",
            "-moz-transform": "scale(" + value / 100 + ")",
            "-webkit-transform-origin": "top left"
          });
          farmGraphModule.setScrollBarPosition();
        };

        self.changeRoutingType = function (routingType) {
          if (typeof routingType == "undefined")
            routingType = self.routingTypes()[0];

          self.routingButtonVisible();
          var activeElement = self.activeElement();
          activeElement.routingType(routingType);

          if (routingType === self.routingTypes()[0] /*ldn*/ ) {
            var activeElementRoutings = self.activeElement().routings();
            if (activeElementRoutings.length > 4) {
              var removeSize = activeElementRoutings.length - 4;
              var start = activeElementRoutings.length - removeSize;
              self
                .activeElement()
                .routings()
                .splice(start, removeSize);
            }
          }
        };

        self.selectRoutingElement = function (data, element) {
          var $this = this,
            directionname = $fg(element)
            .closest(".row")
            .children(":eq(0)")
            .text();

          return ko.utils.arrayFilter(self.activeElement().routings(), function (
            route
          ) {
            if (route.id() == data.id()) {
              route.to({
                id: $this.guid(),
                name: $this.formData().NodeName
              });
              route.gate = directionname;
            }
          });
        };

        self.newRoutingVisible = ko.observable(true);

        self.getElementActiveRoutings = function () {
          var activeElement = self.activeElement();
          if (!activeElement || !activeElement.routings) return;

          return ko.utils.arrayFilter(activeElement.routings(), function (
            routing
          ) {
            return !routing.isDeleted();
          });
        };

        //routing add button visibility function
        self.routingButtonVisible = function () {
          var activeElement = self.activeElement();
          if (!activeElement.routings) return;

          var ldnSize = 4,
            ddsSize = 6,
            selectedRtType = activeElement.routingType().id(),
            routingCount = ko.utils.arrayFilter(
              activeElement.routings(),
              function (route) {
                return route.isDeleted() == false;
              }
            ).length;

          if (
            (selectedRtType == 1 && routingCount >= ldnSize) ||
            (selectedRtType == 2 && routingCount >= ddsSize)
          )
            self.newRoutingVisible(false);
          else self.newRoutingVisible(true);
        };

        self.addNewRouting = function () {
          var activeElement = self.activeElement();
          if (!activeElement) return;

          var deletedRouting = ko.utils.arrayFirst(
            activeElement.routings(),
            function (route) {
              return route.isDeleted() == true;
            }
          );

          var to = {
            id: 0,
            name: ""
          };

          var gate = "";

          if (deletedRouting) {
            deletedRouting.to(to);
            deletedRouting.isDefault(false);
            deletedRouting.isChanged(false);
            deletedRouting.isDeleted(false);
            self.routingButtonVisible();
            return;
          }

          activeElement.routings.push(
            new routingModel({
              id: farmGraphModule.guid(),
              from: activeElement.guid(),
              to: to,
              gate: gate,
              isDefault: false,
              isChanged: false,
              isDeleted: false
            })
          );
          self.routingButtonVisible();
        };

        self.removeRouting = function () {
          var $this = this;
          ko.utils.arrayFilter(self.activeElement().routings(), function (route) {
            if ($this.id() == route.id()) route.isDeleted(true);
          });
          self.routingButtonVisible();
        };

        self.setDefaultRouting = function (data) {
          return ko.utils.arrayFilter(self.activeElement().routings(), function (
            route
          ) {
            route.isDefault(false);
            if (route.id() == data.id()) route.isDefault(true);
          });
        };

        self.switchToEditMode = function () {
          self.editMode(!self.editMode());
          farmGraphModule.toggleEditMode();
          var zoom = self.setZoomValueByClientScreen();
          farmGraphModule.elements.bsSliderFarmZoom.bootstrapSlider("setValue", zoom);
          farmGraphModule.setScrollBarPosition();
        };

        self.allElementWrite = function (data, callback) {
          var farmItems = [];

          ko.utils.arrayForEach(data, function (item) {
            var activeElement = item,
              positionToSnap = farmGraphModule.elements.drawArea.farmDraw.snapToGrid(
                activeElement.position().x,
                activeElement.position().y,
                activeElement.position().w,
                activeElement.position().h
              ),
              farmItem = {
                guid: activeElement.guid(),
                position: positionToSnap,
                formData: activeElement.formData()
              },
              activeElementDomObj = $fg(`div[id="${activeElement.guid()}"]`)
              .data("options", activeElement);

            if (farmItem.formData.LocationId) {
              var detectedLocation = farmGraphModule.detectPosition(
                activeElementDomObj
              );
              if (detectedLocation) {
                if (detectedLocation.id != farmItem.formData.LocationId) {
                  console.log(`${farmItem.formData.NodeName} has changed location from ${farmItem.formData.LocationId} to ${detectedLocation.id}...`);
                  farmItem.formData.LocationId = detectedLocation.id;
                }
              }
            }

            if (activeElement.positionIsUpdated())
              farmItems.push(farmItem);
          });

          if (farmItems.length > 0) {
            farmGraphModule.farmDb.SetFarmAllItemSizeAndLocation(farmItems, function (success) {
              if (!success) return;
              ko.utils.arrayForEach(data, function (item) {
                item.positionIsUpdated(false);
              });
              callback(success);
            });
          }

        }

        self.activeElementWrite = function (guid) {

          var activeElement;
          if (guid) {
            self.getCreatedElement(guid, function (item) {
              activeElement = item;
            });
          } else {
            activeElement = self.activeElement();
          }

          var positionToSnap = farmGraphModule.elements.drawArea.farmDraw.snapToGrid(
              activeElement.position().x,
              activeElement.position().y,
              activeElement.position().w,
              activeElement.position().h
            ),
            farmItem = {
              guid: activeElement.guid(),
              position: positionToSnap,
              formData: activeElement.formData()
            },
            activeElementDomObj = $fg(`div[id="${activeElement.guid()}"]`)
            .data("options", activeElement);

          if (farmItem.formData.LocationId) {
            var detectedLocation = farmGraphModule.detectPosition(
              activeElementDomObj
            );
            if (detectedLocation) {
              if (detectedLocation.id != farmItem.formData.LocationId) {
                console.log(`${farmItem.formData.NodeName} has changed location from ${farmItem.formData.LocationId} to ${detectedLocation.id}...`);
                farmItem.formData.LocationId = detectedLocation.id;
              }
            }
          }

          if (activeElement.positionIsUpdated()) {
            farmGraphModule.farmDb.SetFarmItemSizeAndLocation(farmItem, function (success) {
              if (!success) return;
              activeElement.position(positionToSnap);
              activeElement.positionIsUpdated(false);
              //set canvas element position
              activeElementDomObj.css({
                width: positionToSnap.w,
                height: positionToSnap.h,
                top: self.convertToBottomPosition(positionToSnap),
                left: positionToSnap.x
              });

              if (!guid) farmGraphModule.validationFarmGraph();
            });
          }

          if (activeElement.routingIsEnable()) {
            var routings = ko.utils.arrayFilter(
              activeElement.routings(),
              function (rou) {
                return rou.isChanged();
              }
            );

            if (routings.length === 0) return;
            farmGraphModule.farmDb.SetNodeRouting(ko.toJS(routings), function (
              response
            ) {
              if (!response) return;
              $fg.each(response, function (i, aro) {
                routings[i].id(parseInt(aro.id));
                routings[i].isChanged(false);
              });
            });
          }
        };

        self.getUnsavedChangeObjects = function () {
          return ko.utils.arrayFilter(self.createdElements(), function (
            element,
            i
          ) {
            return element.positionIsUpdated();
          });
        };

        self.getActiveElement = ko.pureComputed({
            read: function () {
              return self.activeElement() ?
                self.activeElement() : {
                  name: "Not Selected",
                  position: ko.observable({
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0
                  })
                };
            },
            write: function () {
              self.activeElementWrite();
            }
          },
          viewModel
        );

        self.convertToBottomPosition = function (pos) {
          return self.canvasProperties().getHeight() - pos.y - pos.h;
        };

        self.startPointer = {
          x: 0,
          y: 0
        };

        self.dragStart = function (evt) {
          var zoom = farmGraphModule.elements.drawArea.farmDraw.getZoom();
          self.startPointer.y =
            (evt.pageY - farmGraphModule.elements.drawArea.offset().top) / zoom -
            parseInt($fg(evt.target).css("top"));
          self.startPointer.x =
            (evt.pageX - farmGraphModule.elements.drawArea.offset().left) / zoom -
            parseInt($fg(evt.target).css("left"));
        };

        self.updateChangeEvent = function () {
          // this part is important for unsaved changes
          var activeElement = self.activeElement();
          if (activeElement.positionIsUpdated() === false) {
            activeElement.positionIsUpdated(true);
            console.log(activeElement.guid() + " NodeId position updated!");
          }
        };

        self.dragElement = function (evt, ui) {
          var zoom = farmGraphModule.elements.drawArea.farmDraw.getZoom();
          var canvasTop = farmGraphModule.elements.drawArea.offset().top;
          var canvasLeft = farmGraphModule.elements.drawArea.offset().left;
          var canvasHeight = farmGraphModule.elements.drawArea.height();
          var canvasWidth = farmGraphModule.elements.drawArea.width();

          // Fix for zoom
          ui.position.top = Math.round(
            (evt.pageY - canvasTop) / zoom - self.startPointer.y
          );
          ui.position.left = Math.round(
            (evt.pageX - canvasLeft) / zoom - self.startPointer.x
          );

          // Check if element is outside canvas
          if (ui.position.left <= 0) ui.position.left = 0;
          if (ui.position.left + $fg(ui.helper).outerWidth() >= canvasWidth)
            ui.position.left = Math.round(
              canvasWidth - $fg(ui.helper).outerWidth()
            );
          if (ui.position.top <= 0) ui.position.top = 0;
          if (ui.position.top + $fg(ui.helper).outerHeight() >= canvasHeight)
            ui.position.top = Math.round(
              canvasHeight - $fg(ui.helper).outerHeight()
            );

          // Finally, make sure offset aligns with position
          ui.offset.top = Math.round(ui.position.top + canvasTop);
          ui.offset.left = Math.round(ui.position.left + canvasLeft);

          var pos = {
            x: typeof ui.position.left == "number" ?
              ui.position.left : self.getActiveElement().position().x,
            y: typeof ui.position.top == "number" ?
              ui.position.top : self.getActiveElement().position().y,
            w: self.getActiveElement().position().w,
            h: self.getActiveElement().position().h
          };

          pos.y = Math.round(self.convertToBottomPosition(pos));

          self.getActiveElement().position(pos);
          self.updateChangeEvent();
        };

        self.resizeElement = function (event, ui) {
          // zoom calculating for draggable item position
          var zoom = farmGraphModule.elements.drawArea.farmDraw.getZoom();
          if (ui.size) {
            var changeWidth = ui.size.width - ui.originalSize.width;
            var newWidth = ui.originalSize.width + changeWidth / zoom;
            var changeHeight = ui.size.height - ui.originalSize.height;
            var newHeight = ui.originalSize.height + changeHeight / zoom;
            var changeLeft = ui.position.left - ui.originalPosition.left;
            var newLeft = ui.originalPosition.left + changeLeft / zoom;
            var changeTop = ui.position.top - ui.originalPosition.top;
            var newTop = ui.originalPosition.top + changeTop / zoom;

            var border = Math.round(
              parseFloat($fg(event.target).css("borderLeftWidth")) * 2
            );

            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (
              newWidth + newLeft + border >=
              farmGraphModule.elements.drawArea.width()
            )
              newWidth = Math.round(
                farmGraphModule.elements.drawArea.width() - newLeft
              );
            if (
              newHeight + newTop + border >=
              farmGraphModule.elements.drawArea.height()
            )
              newHeight = Math.round(
                farmGraphModule.elements.drawArea.height() - newTop
              );

            ui.size.width = Math.round(newWidth);
            ui.size.height = Math.round(newHeight);
            ui.position.left = Math.round(newLeft);
            ui.position.top = Math.round(newTop);

            var pos = {
              x: typeof ui.position.left == "number" ?
                ui.position.left : self.getActiveElement().position().x,
              y: typeof ui.position.top == "number" ?
                ui.position.top : self.getActiveElement().position().y,
              w: typeof ui.size.width == "number" ?
                ui.size.width : self.getActiveElement().position().w,
              h: typeof ui.size.height == "number" ?
                ui.size.height : self.getActiveElement().position().h
            };

            pos.y = Math.round(self.convertToBottomPosition(pos));
            self.getActiveElement().position(pos);
            self.updateChangeEvent();
          }
        };

        self.setEnable = function (acceptable) {
          var data = self
            .devices()
            .concat(self.physicals())
            .concat(self.objects());

          ko.utils.arrayForEach(data, function (el) {
            ko.utils.arrayFilter(acceptable, function (acc) {
              if (acc == el.id()) {
                el.status(true);
              }
            });
          });
          return true;
        };

        self.deleteIsActive = ko.computed(function () {
          var activeElement = self.activeElement();
          var active = false;
          if (activeElement) {
            active = !activeElement.routingIsEnable() ?
              true :
              activeElement && self.getElementActiveRoutings().length === 0;
          }
          return active;
        });

        self.deleteElement = function () {
          if (
            vm.activeElement().routingIsEnable() &&
            vm.getElementActiveRoutings().length > 0
          ) {
            farmGraphModule.notifier.warning(
              `<span class='font-weight-bold'>${
              vm.activeElement().formData().NodeName
            }</span> linked with one or a few items!<br />You cannot delete this item!`
            );
          } else {
            elements.confirmationSelector.delete.on(
              "confirmed.bs.confirmation",
              function () {
                var activeElement = self.activeElement();

                removeAllRoutingRelations = function (item) {
                  if (!item.routingEnabled().output) return;

                  if (item.routings().length > 0) {
                    var ruleForRoutingType =
                      item.routingType().id() == self.routingTypes()[0].id() ?
                      item.parentGuid() == activeElement.parentGuid() ||
                      item.guid() == activeElement.parentGuid() :
                      true;

                    if (ruleForRoutingType) {
                      ko.utils.arrayForEach(item.routings(), function (route, i) {
                        if (route.to().id == activeElement.guid()) {
                          item.routings().splice(i, 1);
                        }
                      });
                    }
                  }
                };

                deleteElementOnCanvas = function () {
                  var guid = activeElement.guid();
                  self.createdElements().some(function iter(o, i, a) {
                    // removeAllRoutingRelations(o);
                    if (o.guid() === guid) {
                      a.splice(i, 1);
                      $fg(`div[id="${guid}"]`).remove();
                      self.activeElement(null);
                    }
                  });
                };

                // remove active element
                if (activeElement) {
                  //working this part if new drawed element removing
                  if (typeof activeElement.guid() === "string") {
                    deleteElementOnCanvas();
                    return;
                  }
                  //remove element from db
                  farmGraphModule.farmDb.RemoveNodeItem(
                    ko.toJS(activeElement),
                    function (result) {
                      if (result.Error) {
                        var wmActive = windowManager.GetLastActiveWindow();
                        if (wmActive) wmActive.DestroyWindow();

                        windowManager.ShowMessageBox(
                          "Farm Graph Validation Error",
                          result.Message
                        );
                        return;
                      }
                      //remove element on canvas
                      deleteElementOnCanvas();
                    }
                  );
                }
              }
            );
          }
        };

        // self.setTextColor = function () {
        //     var rgba = self.activeElement().color();
        //     if (rgba == "transparent") return "rgba(0,0,0,0)";

        //     var colors = rgba.match(/^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/);
        //     var brightness = 5;

        //     var r = colors[3];
        //     var g = colors[4];
        //     var b = colors[5];
        //     var a  = colors[6];

        //     var ir = Math.floor((255 - r) * brightness);
        //     var ig = Math.floor((255 - g) * brightness);
        //     var ib = Math.floor((255 - b) * brightness);
        //     var ia = a ? `,${a}` :'';

        //     return `rgb(${ir},${ig},${ib}${ia})`;
        // };

        self.setDisableAllTypes = function () {
          var data = self
            .devices()
            .concat(self.physicals())
            .concat(self.objects());
          ko.utils.arrayForEach(data, function (el) {
            el.status(false);
          });
          $fg('input[name="farmCheckBox"]').prop("checked", false);
        };

        self.getTypeOptions = function (type) {
          if (!type) return;
          var data = vm.allTypes();
          var el = ko.utils.arrayFirst(data, function (item) {
            return item.type() == type;
          });
          return el;
        };

        self.loadFarmElements = function () {
          ko.utils.arrayForEach(
            farmGraphModule.elements.jsonElements.devices,
            function (el) {
              self.devices.push($fg.extend(true, {}, new jsonToModel(el)));
            }
          );
          ko.utils.arrayForEach(
            farmGraphModule.elements.jsonElements.physicals,
            function (el) {
              self.physicals.push($fg.extend(true, {}, new jsonToModel(el)));
            }
          );
          ko.utils.arrayForEach(
            farmGraphModule.elements.jsonElements.objects,
            function (el) {
              self.objects.push($fg.extend(true, {}, new jsonToModel(el)));
            }
          );
        };

        self.pushElement = function (parentGuid, element) {
          var newElement = new jsonToModel(ko.toJS(element));
          self.createdElements.push(newElement);
        };

        self.getCreatedElement = function (guid, callback) {
          if (!guid) return;
          self.createdElements().some(function iter(o, i, a) {
            if (o.guid() == guid) {
              callback(o);
            }
          });
        };

        self.editElement = function () {
          var activeGuid = self.activeElement().guid();
          $fg("div[id=" + activeGuid + "]").dblclick();
          return;
        };

        self.setElement = function (option) {
          self.getCreatedElement(option.guid(), function (callback) {
            // callback.name(option.name());
            callback.formData(option.formData());
          });
        };

        self.setElementGuid = function (oldGuid, guid) {
          self.getCreatedElement(oldGuid, function (callback) {
            callback.guid(guid);
          });
        };

        self.selectElement = function (guid) {
          if (!guid) return;
          farmGraphModule.changeStateFarmSizeBlock(false);
          farmGraphModule.changeStateObjectInfCard(true);
          self.getCreatedElement(guid, function (item) {
            if (!item.formData()) return;
            self.activeElement(item);
            // var textColor = self.setTextColor(item.color);
            // self.textColor(textColor);
            if (item.routingEnabled().output) {
              self.changeRoutingType(item.routingType());
              self.routingButtonVisible();
            }
          });
        };

        self.getSelectableRouteElement = function () {
          var activeElement = self.activeElement();
          if (!activeElement) return;

          self.filteredCreatingElementsByRoutable([]);
          var routeableElements = self.routableElements();
          routeableElements.some(function iter(o, i, a) {
            var input = false;
            if (o.routableItems()) {
              var routableItem = ko.utils.arrayFirst(o.routableItems(), function (
                roi
              ) {
                return activeElement.formData().DeviceTypeId === roi.deviceTypeId;
              });
              if (routableItem.ignoredTypes.length == 0) {
                input = routableItem.input;
              } else {
                input =
                  ko.utils.arrayFilter(routableItem.ignoredTypes, function (it) {
                    return o.formData().DeviceTypeId === it;
                  }).length == 0;
              }
            } else {
              input = o.routingEnabled().input;
            }
            if (o !== activeElement && input) {
              var ruleForRoutingType =
                activeElement.routingType().id() == self.routingTypes()[0].id() ?
                o.parentGuid() == activeElement.parentGuid() ||
                o.guid() == activeElement.parentGuid() :
                true;

              if (ruleForRoutingType) {
                var hasRoute =
                  ko.utils.arrayFilter(activeElement.routings(), function (item) {
                    return (
                      item.to().id === o.guid() && item.isDeleted() === false
                    );
                  }).length > 0;

                if (hasRoute == false)
                  self.filteredCreatingElementsByRoutable.push(o);
              }
            }
          });
        };

        self.saveCanvas = function (d, e) {
          var ct = $fg(e.currentTarget);
          if (ct.is("#continue")) {
            window.localStorage.setItem(farmGraphModule.storage.firstUsage, true);
          }

          var size = {
            Length: self.canvasProperties().width(),
            Width: self.canvasProperties().height()
          };

          if (self.canvasProperties().canvasUpdated()) {
            farmGraphModule.farmDb.UpdatefarmSize(size, function (data) {
              if (data) {
                farmGraphModule.elements.drawArea.empty();
                farmGraphModule.elements.drawArea.css({
                  width: size.Length + "px",
                  height: size.Width + "px"
                });

                farmGraphModule.bindDbData(jsonData, null);
                var zoom = self.setZoomValueByClientScreen();
                farmGraphModule.elements.bsSliderFarmZoom.bootstrapSlider("setValue", zoom);
                farmGraphModule.setScrollBarPosition();
                farmGraphModule.changeStateFarmSizeBlock(false);
                self.canvasProperties().canvasUpdated(false);
              }
            });
          }
        };
        self.loadFarmElements();
      };

      (function () {
        farmGraphModule.farmDb.GetFarm(function (farm) {
          if (farm == null) {
            //create a new when it has not farm in sytFarmItems table
            var farmNodeModel = {
              nodeId: 1,
              name: "Farm",
              width: 5000,
              length: 2500
            };

            farmGraphModule.farmDb.CreateNewFarmNode(farmNodeModel, function (
              data
            ) {
              if (data) {
                farm = {
                  width: data.Width,
                  height: data.Length
                };
              }
            });
          }

          if (farm) {
            farmGraphModule.elements.farmDrawPluginOptions.canvas.width =
              farm.width;
            farmGraphModule.elements.farmDrawPluginOptions.canvas.height =
              farm.height;


            vm = new viewModel();
            ko.applyBindings(vm);
            farmGraphModule.init(jsonData);
            if (
              jsonData.length === 0 &&
              !window.localStorage.getItem(farmGraphModule.storage.firstUsage)
            ) {
              farmGraphModule.openSetupWizard();
            }
          }
        });
      })();
    });
  });
}
