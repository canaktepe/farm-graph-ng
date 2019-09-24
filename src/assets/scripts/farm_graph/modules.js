myModule = function (callback) {
  var elements;
  farmGraphModule = {
    farmDb: new farmDbModel(),
    notifier: new AWN({
      position: "top-left"
    }),
    storage: {
      firstUsage: "fg-firstUsage"
    },
    selectors: {
      requireConnect: "require-connect",
      requireConnectWarning: "require-connect-warning",
      radius: "radius",
      rectangle: "rect",
      rectangleName: "rect-name",
      active: "active",
      cursorDraw: 'cursorDraw',
      cubic: 'cubicle'
    },
    elements: {
      farmDrawPluginOptions: {
        drawNewButton: "#draw",
        canvas: {
          width: 3000,
          height: 2000,
          grid: true,
          snapGrid: false,
          gridSize: [150, 150]
        },
        rectangle: {
          color: "#9b9b9b",
          selectable: true,
          draggable: true,
          resizable: true
        },
        onDrawComplete(e) {
          if (!e.drawingRect) return;
          farmGraphModule.openModal(false, e, function (item) {
            if (typeof item === "object" && vm.editMode()) {
              e.drawingRect.click();
            }
          });
        },
        onSelectElement(e) {
          var guid = $fg(e).attr("id");
          if (!guid) return;
          vm.selectElement(guid);

          $fg(e).draggable("option", "start", function (evt, ui) {
            $fg(this).click();
            vm.dragStart(evt);
          });
          $fg(e).draggable("option", "drag", function (evt, ui) {
            vm.dragElement(evt, ui);
          });
          $fg(e).resizable("option", "resize", function (event, ui) {
            guid = $fg(e).attr("id");
            vm.resizeElement(event, ui);
            vm.selectElement(guid);
          });
          $fg(e).resizable("option", "start", function (event, ui) {
            guid = $fg(e).attr("id");
            vm.selectElement(guid);
          });
        }
      },
      body: $fg("body"),
      rightCustomScrollBar: $fg("#rightCustomScrollBar"),
      jsonElements: [],
      farm: $fg(".farm"),
      bsSliderFarmZoom: $fg("#bsSliderFarmZoom"),
      ctxMenuSelector: $fg(".context"),
      confirmationSelector: {
        delete: $fg("[data-toggle=confirmation]")
      },
      drawArea: $fg("#draw-area"),
      saveAll: $fg("#saveAll"),
      mainAcceptable: ko.observableArray([3000, 8000, 9000, 11000, 12000]),
      elementModal: {
        selector: $fg("#elementModal"),
        typesBody: $fg("#modalBodyTypes"),
        contentBody: $fg("#modalBodyContent"),
        saveButton: $fg("#saveElement"),
        nextButton: $fg("#nextStep"),
        backButton: $fg("#backStep")
      },
      setupWizardModal: {
        selector: $fg("#wizardModal"),
        continueButton: $fg("#continue"),
        showExamplePic: $fg("#showExamplePic")
      }
    },

    createQueryParams: function (params) {
      return Object.keys(params)
        .map(k => `${k}=${encodeURI(params[k])}`)
        .join("&");
    },

    setScrollBarPosition: function () {
      farmGraphModule.elements.farm.mCustomScrollbar("scrollTo", [0, 0], {
        scrollInertia: 0
      });
    },

    bindCustomScrollBar: function () {
      elements.farm.mCustomScrollbar({
        setLeft: 0,
        autoDraggerLength: true,
        autoHideScrollbar: true,
        keyboard: {
          enable: true
        },
        autoExpandScrollbar: true,
        contentTouchScroll: true,
        documentTouchScroll: true,
        live: "on",
        advanced: {
          autoExpandHorizontalScroll: 2,
          updateOnWindowResize: true,
          updateOnContentResize: true
        },
        axis: "yx",
        theme: "dark-thin"
      });

      farmGraphModule.setScrollBarPosition();
    },

    changeStateFarmSizeBlock: function (show) {
      var coll;
      if (show) {
        coll = "show";
        farmGraphModule.changeStateObjectInfCard(false);
      } else {
        coll = "hide";
      }
      $fg("#canvas-prop-body").collapse(coll);
    },

    changeStateObjectInfCard: function (show) {
      var coll;
      if (show) {
        coll = "show";
        farmGraphModule.changeStateFarmSizeBlock(false);
      } else {
        coll = "hide";
      }
      $fg("#objectInfCard-prop-body").collapse(coll);
    },

    bindExtensionMethods: function () {
      String.prototype.getClass = function () {
        return ".".concat(this);
      };
    },

    toggleEditMode: function () {
      // scroll reload
      elements.farm.css("height", "0");
      elements.farm.css("max-height", "0");
      setTimeout(() => {
        elements.farm.css("height", "100%");
        elements.farm.css("max-height", "100%");
      }, 100);

      var editModeEnable = vm.editMode();
      $fg(selectors.rectangle.getClass()).draggable({
        disabled: !editModeEnable
      });
      $fg(selectors.rectangle.getClass()).resizable({
        disabled: !editModeEnable
      });

      if (!editModeEnable) {
        farmGraphModule.elements.drawArea.farmDraw.drawingDisable();
        $fg(`${selectors.rectangle.getClass()}`).addClass('')
      }

      $fg(`${selectors.active.getClass()}`).removeClass(selectors.active);
      vm.activeElement(null);
    },

    drawAreaClickEvent: function () {
      farmGraphModule.changeStateFarmSizeBlock(true);
      farmGraphModule.changeStateObjectInfCard(false);
    },

    bindFarmDraw: function () {
      elements.drawArea.farmDraw(elements.farmDrawPluginOptions);
      elements.drawArea.on("click", farmGraphModule.drawAreaClickEvent);
      elements.saveAll.on("click", farmGraphModule.saveAll);
    },

    saveAll: function (e) {
      var unsavedObjects = vm.getUnsavedChangeObjects();
      if (unsavedObjects.length > 0) {
        vm.allElementWrite(unsavedObjects, function (success) {
          if (success) {
            farmGraphModule.validationFarmGraph();
          }
        });
      }
    },

    elementUpdatedblClick: function (e) {
      var clickedElement = $fg(e.currentTarget);
      var guid = clickedElement.attr("id");
      vm.getCreatedElement(guid, function (data) {
        if (vm.editMode()) {
          farmGraphModule.openModal(true, data, function (cb) {
            farmGraphModule.fillFormData(data);
          });
        }
      });
      e.stopPropagation();
    },

    setEnableElementsType: function (drct) {
      var parent = $fg(drct.parent).hasClass(selectors.rectangleName) ?
        $fg(drct.parent).parent() :
        $fg(drct.parent);
      var isChild = parent.hasClass(selectors.rectangle);
      var acceptable = elements.mainAcceptable();

      if (isChild) {
        var type = parent.attr("data-type") || parent.data().options.type();
        var options = vm.getTypeOptions(type);
        acceptable = options.acceptable();
      }
      vm.setEnable(acceptable);
    },

    fillFormData: function (data) {
      $fg.each(data.formData(), function (key, value) {
        var formObject = $fg("form#controlData [name=" + key + "]");
        if (formObject.length > 0) {
          var tagName = formObject[0].tagName.toLowerCase();
          switch (tagName) {
            case "input":
              var type = formObject.attr("type").toLowerCase();
              switch (type) {
                case "text":
                  formObject.val(value);
                  break;
                case "hidden":
                  formObject.val(value);
                  break;
                case "radio":
                  formObject
                    .filter("[value=" + value + "]")
                    .attr("checked", true);
                  break;
                case "checkbox":
                  value.filter((v, vi) => {
                    formObject.filter((foi, fo) => {
                      if (v == $fg(fo).val()) {
                        $fg(fo).attr("checked", true);
                      }
                    });
                  });
                  break;
              }
              break;
            case "select":
              var multiple = typeof formObject.attr("multiple") !== "undefined";
              if (multiple) {
                $fg.each(value, function (i, e) {
                  formObject
                    .find("option[value=" + e + "]")
                    .attr("selected", true);
                });
              } else {
                formObject
                  .find("option[value=" + value + "]")
                  .attr("selected", true);
              }
              break;
          }
        }
      });
    },
    getDrawedElementPosition: function (drawedElement) {
      var position = {
        w: 0,
        h: 0,
        x: 0,
        y: 0
      };
      if (drawedElement.options) {
        position.w = parseInt(drawedElement.css("width"));
        position.h = parseInt(drawedElement.css("height"));
        position.x = parseInt(drawedElement.css("left"));
        position.y = parseInt(drawedElement.css("top"));
      } else {
        var savedElement = $fg(`div[id='${drawedElement.guid()}']`);
        if (savedElement) {
          position.w = parseInt(savedElement.css("width"));
          position.h = parseInt(savedElement.css("height"));
          position.x = parseInt(savedElement.css("left"));
          position.y = parseInt(savedElement.css("top"));
        }
      }
      position.y = vm.convertToBottomPosition(position);
      return position;
    },

    setElementRectangleNameText: function (el, update) {
      var element;
      if (update) {
        element = $fg(`div${selectors.rectangle.getClass()}[id='${el.guid()}']`);
        element.options = el;
      } else {
        element = el;
      }

      var options = element.options;

      if (options.formData() && options.formData().NodeName /*device*/ ) {
        var existElement = element.find(
          `div${selectors.rectangleName.getClass()}`
        );
        if (existElement.length > 0) {
          existElement.text(options.formData().NodeName);
        } else {
          existElement = $fg("<div/>", {
              attr: {
                class: selectors.rectangleName
              }
            })
            .text(options.formData().NodeName)
            .appendTo(element);
          if (options.textColor()) existElement.addClass("text-white");
        }
      }

      // if(existElement.height() > existElement.width()){
      //   existElement.addClass('vertical-text');
      // }

    },

    openSetupWizard: function () {
      elements.setupWizardModal.selector.off("shown.bs.modal");
      elements.setupWizardModal.selector.off("hidden.bs.modal");

      elements.setupWizardModal.selector.modal("show");
      elements.setupWizardModal.selector.find("button.close").hide();
      elements.setupWizardModal.selector.on("shown.bs.modal", function () {
        elements.setupWizardModal.showExamplePic.on("click", function (e) {
          var exImg = $fg("<div />", {
              class: "example-picture"
            })
            .css({
              backgroundImage: `url(${baseUrl}assets/images/example-farm-graph-picture.JPG)`,
              position: "absolute"
            })
            .appendTo(elements.setupWizardModal.selector)
            .click(function (c) {
              // $fg(this).fadeOut('300','easing')
              exImg.fadeOut(300, function () {
                $fg(this).remove();
              });
            })
            .fadeIn(300);
        });
      });
    },

    removeModalData: function (key, selector) {
      var data = selector.data();
      if (typeof key === "boolean") {
        $fg.each(data, function (keyNode) {
          selector.removeData(keyNode);
        });
      } else {
        selector.removeData(key);
      }
    },

    parseIntOrDefault: function (value) {
      return value ? parseInt(value) : null;
    },

    openModal: function (update, drct, callback) {
      var drawedElement, parentNode;
      if (drct.drawingRect) {
        drawedElement = drct.drawingRect;
        farmGraphModule.setOpacityModal(true);
      } else {
        drawedElement = drct;
        farmGraphModule.setOpacityModal(false);

        if (drawedElement.formData().NodeId === 0)
          elements.elementModal.selector.data("cowFarmObject", true);
      }

      // off button events
      elements.elementModal.selector.off("shown.bs.modal");
      elements.elementModal.selector.off("hidden.bs.modal");
      elements.elementModal.saveButton.off("click");
      elements.elementModal.nextButton.off("click");
      elements.elementModal.backButton.off("click");
      elements.elementModal.selector.data("saved", false);
      elements.elementModal.selector.data("update", update);
      elements.elementModal.selector.data("editMode", vm.editMode());

      var element =
        typeof drawedElement.get === "function" ?
        drawedElement.get(0) :
        drawedElement.position();

      var position = {
        x: element.offsetLeft || element.x,
        y: element.offsetTop || element.y,
        w: element.offsetWidth || element.w,
        h: element.offsetHeight || element.h
      };
      position.y = vm.convertToBottomPosition(position);

      const params = {
        returnUrl: "FarmGraph.aspx",
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        editMode: vm.editMode()
      };

      //update elemen redirect with NodeId
      if (update) {
        params.ID = parseInt(drawedElement.formData().NodeId);
        if (drawedElement.formData().DeviceTypeId) {
          params.deviceType = drawedElement.formData().DeviceTypeId;
          elements.elementModal.selector.data("deviceType", params.deviceType);
        }
        if (drawedElement.formData().LocationId) {
          // && elements.elementModal.selector.data('cowFarmObject')
          params.locationId = drawedElement.formData().LocationId;
          elements.elementModal.selector.data("locationId", params.locationId);
        }
      } else {
        parentNode = farmGraphModule.getParentNode(drct);
        if (parentNode) {
          params.locationId = parseInt(parentNode.formData().NodeId);
          elements.elementModal.selector.data("locationId", params.locationId);
          elements.elementModal.selector.data(
            "parantName",
            parentNode.formData().NodeName
          );
        }
      }

      const queryParams = farmGraphModule.createQueryParams(params);
      elements.elementModal.selector.data("redirectParams", queryParams);

      //modal showing
      elements.elementModal.selector.modal({
        show: true
      });

      //binding modal save button event
      elements.elementModal.saveButton.on("click", function (e) {
        elements.elementModal.selector.data("saved", true).modal("hide");
        // get selected type forms input data
        var formData = $fg("form#controlData")
          .serializeArray()
          .reduce(function (m, o) {
            var formObject = $fg("form#controlData [name=" + o.name + "]");
            var tagName = formObject[0].tagName.toLowerCase();

            var value = "";
            switch (tagName) {
              case "input":
                var type = formObject.attr("type");
                switch (type) {
                  case "text":
                    value = o.value;
                    break;
                  case "radio":
                    value = o.value;
                    break;
                  case "hidden":
                    value = o.value;
                    break;
                  case "checkbox":
                    value = [];
                    $fg.each(formObject.filter(":checked"), function (i, e) {
                      value.push($fg(e).val());
                    });
                    break;
                }
                break;
              case "select":
                var multiple = typeof formObject.attr("multiple") !== "undefined";
                if (multiple) {
                  value = [];
                  $fg.each(formObject.find("option:selected"), function (i, e) {
                    value.push($fg(e).val());
                  });
                } else value = o.value;
                break;
            }
            m[o.name] = value;
            return m;
          }, {});

        var position = farmGraphModule.getDrawedElementPosition(drawedElement);
        var options;

        if (update) {
          if (elements.elementModal.selector.data("cowFarmObject") != undefined) {
            formData.DeviceTypeId = farmGraphModule.parseIntOrDefault(
              fm.newNodeType()
            );
            formData.LocationId = farmGraphModule.parseIntOrDefault(
              fm.newNodeLocation()
            );
            formData.DeviceUrl = farmGraphModule.parseIntOrDefault(
              fm.newNodeLocation()
            );
          }

          options = drawedElement;
          options.position(position);
          options.formData(formData);
          vm.setElement(options);
        } else {
          var parentGuid = farmGraphModule.getParentGuid(drawedElement);
          var guid = farmGraphModule.guid();
          drawedElement.options.position(position);
          drawedElement.options.positionIsUpdated(false);

          if (typeof fm !== "undefined") {
            if (fm.newNodeType()) {
              formData.DeviceTypeId = parseInt(fm.newNodeType());
            }
          }

          if (parentNode) {
            formData.locationId = parseInt(parentNode.formData().NodeId);
          }

          drawedElement.options.guid(guid);
          drawedElement.options.parentGuid(parentGuid);
          options = drawedElement.options;
          options.formData(formData);

          vm.pushElement(parentGuid, options);
          drawedElement
            .attr({
              id: guid,
              "data-type": options.type()
            })
            .css({
              backgroundColor: options.color(),
              border: options.border(),
              zIndex: options.zIndex()
            })
            .click(farmGraphModule.elementSelectClick)
            .dblclick(farmGraphModule.elementUpdatedblClick);

          if (options.radius()) drawedElement.addClass(selectors.radius);
        }

        if (typeof options.guid() == "string") {
          var oldId = options.guid(),
            newId,
            newName;

          if (typeof fm !== "undefined") {
            newId = parseInt(fm.newNodeId());
            options.guid(newId);
          } else {
            options.guid(-1);
          }

          //add items to database
          farmGraphModule.farmDb.AddNodeItem(ko.toJS(options), function (data) {
            if (data) {
              vm.setElementGuid(oldId, data.guid);
              drawedElement.attr("id", data.guid);
              // options.name(data.name);
              options.guid(data.guid);
              options.formData(data.formData);
              vm.setElement(options);
              farmGraphModule.setElementRectangleNameText(drawedElement, update);
            }
          });
        } else {
          if (typeof fm != "undefined") {
            newName = fm.newNodeName();
            options.formData().NodeName = newName;
          }

          //update the item in the database
          farmGraphModule.farmDb.SetNodeItem(ko.toJS(options), function (data) {
            if (data) {
              options.formData(data.formData);
              farmGraphModule.setElementRectangleNameText(drawedElement, update);
              farmGraphModule.elementConnectedToDb(drawedElement);
            }
          });
        }
        callback(drawedElement);
      });

      //binding modal next button event
      elements.elementModal.nextButton.on("click", function (e) {
        elements.elementModal.contentBody.html("loading page...");
        if (update) {
          var typeForDbModal = vm.activeElement().type();
          elements.elementModal.selector.data("type", typeForDbModal);

          elements.elementModal.contentBody.load(
            process.env.FORMS_PATH + drawedElement.pageTemplate(),
            function (responseText, textStatus, XMLHttpRequest) {
              if (XMLHttpRequest.status == 200) {
                elements.elementModal.selector
                  .find(".modal-title")
                  .text("Update " + drawedElement.name());
              } else if (XMLHttpRequest.status == 404) {
                console.log(pageTemplate + " Page Not Found");
                elements.elementModal.selector.modal("hide");
              }
            }
          );
          return;
        }

        var selectedType = $fg('input[name="farmCheckBox"]:checked').val();
        var elementOptions = vm.getTypeOptions(selectedType);

        if (!elementOptions) return;
        typeForDbModal = selectedType;
        elements.elementModal.selector.data("type", typeForDbModal);

        console.log("insert mode");

        drawedElement.options = elementOptions;
        var pageTemplate = drawedElement.options.pageTemplate();
        elements.elementModal.contentBody.load(
          process.env.FORMS_PATH + pageTemplate,
          function (responseText, textStatus, XMLHttpRequest) {
            if (XMLHttpRequest.status == 200) {
              elements.elementModal.selector
                .find(".modal-title")
                .text("Add New " + drawedElement.options.name());
              $fg("form#controlData input:first").focus();
            } else if (XMLHttpRequest.status == 404) {
              console.log(pageTemplate + " Page Not Found");
              elements.elementModal.selector.modal("hide");
              drawedElement.remove();
            }
          }
        );

        farmGraphModule.setOpacityModal(false);
        //show back, hide next button
        $fg(this).hide();
        elements.elementModal.backButton.show();
        elements.elementModal.saveButton.show();
        elements.elementModal.typesBody.hide();
        elements.elementModal.contentBody.show();
      });

      //binding modal back button event
      elements.elementModal.backButton.on("click", function (e) {
        drawedElement.options = undefined;
        //show next, hide back button
        elements.elementModal.selector.find(".modal-title").text("Select Type");
        $fg(this).hide();
        elements.elementModal.nextButton.show();
        elements.elementModal.saveButton.hide();
        elements.elementModal.contentBody.hide();
        elements.elementModal.typesBody.show();

        $fg(".spec-btn").remove();
      });

      //binding modal shown event
      elements.elementModal.selector.on("shown.bs.modal", function (e) {
        return callback("ok");
      });

      //binding modal hidden event
      elements.elementModal.selector.on("hidden.bs.modal", function (e) {
        var saved = elements.elementModal.selector.data("saved");
        if (!update && !saved) {
          drawedElement.remove();
          vm.activeElement(null);
        }

        //show next, hide back button
        elements.elementModal.saveButton.hide();
        elements.elementModal.backButton.hide();
        elements.elementModal.nextButton.show();
        farmGraphModule.removeModalData(true, elements.elementModal.selector);
      });

      if (!update) {
        //object Types page all types set disable
        vm.setDisableAllTypes();
        //object Types page set enabled according to drawed elements acceptable values
        elements.elementModal.selector.find(".modal-title").text("Select Type");

        farmGraphModule.setEnableElementsType(drct);
        elements.elementModal.contentBody.hide();
        elements.elementModal.typesBody.show();
      } else {
        elements.elementModal.nextButton.click();
        elements.elementModal.typesBody.hide();
        elements.elementModal.contentBody.show();
        elements.elementModal.nextButton.hide();
        elements.elementModal.saveButton.show();
      }
    },

    getParentNode: function (drawedObject) {
      var node;
      var parent = $fg(drawedObject.parent).is(selectors.rectangleName.getClass) ?
        $fg(drawedObject.parent).closest(selectors.rectangle.getClass()) :
        $fg(drawedObject.parent);
      var guid = parent.attr("id");
      vm.getCreatedElement(guid, function (result) {
        node = result;
      });
      return node;
    },

    getParentGuid: function (drawedElement) {
      var parent = drawedElement.parent();
      if (!parent.hasClass("rect")) return null;
      return parent.attr("id");
    },

    bindJsonElements: function (callback) {
      $fg
        .getJSON(process.env.DEVICES_PATH)
        .done(function (data) {
          farmGraphModule.elements.jsonElements = data;
          callback(data);
        })
        .fail(function (jqxhr, textStatus, error) {
          console.log("Request Failed: " + error);
        });
    },

    guid: function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return (
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()
      );
    },

    elementSelectClick: function (e) {
      var obj = $fg(e.currentTarget);
      var guid = obj.attr("id");
      vm.selectElement(guid);
      if (vm.editMode()) {
        $fg(`${selectors.rectangle.getClass()}${selectors.active.getClass()}`).removeClass(selectors.active);
        $fg(this).addClass(selectors.active);
      } else {
        vm.getCreatedElement(guid, function (data) {
          var formData = data.formData();
          if (formData.NodeId === 0) return;

          if (formData) {
            if (formData.DeviceUrl) {
              var url =
                formData.DeviceUrl.indexOf("http") > -1 ?
                formData.DeviceUrl :
                `http://${formData.DeviceUrl}`;
              location.href =
                baseUrl + `Content/BasicGridLinkForwardPage.aspx?Url=${url}`;
              return;
            }

            if (formData.DeviceTypeId === deviceTypes.Vector) {
              location.href = `VectorFeedKitchenDrawing.aspx?returnUrl=FarmGraph.aspx&ID=${
                            formData.NodeId
                            }`;
              return;
            }
          }
          if (data.type() === farmItemTypes.MilkTank) {
            location.href = "AnimalBatchSamplingBulkTank.aspx?page=FarmGraph";
            return;
          }
          farmGraphModule.openModal(true, data, function (cb) {
            farmGraphModule.fillFormData(data);
          });
        });
      }
      e.stopPropagation();
    },

    dataBindModel: function () {
      var self = this;
      self.createItem = function (data, callback) {
        var elem = $fg("<div>", {
            attr: {
              id: data.guid()
            }
          })
          .addClass(selectors.rectangle)
          .css({
            backgroundColor: data.color(),
            border: data.border(),
            zIndex: data.zIndex(),
            // opacity: data.opacity(),
            top: vm.canvasProperties().getHeight() -
              data.position().y -
              data.position().h,
            left: data.position().x,
            width: data.position().w,
            height: data.position().h
          })
          .data("options", data);

        if (!data.isConnected()) elem.addClass(selectors.requireConnect);
        if (data.radius()) elem.addClass(selectors.radius);
        callback(elem);
      };

      self.addItem = function (createdItem) {
        createdItem.appendTo(farmGraphModule.elements.drawArea);
      };
    },

    detectPosition: function (createdItem) {
      var options = createdItem.data("options");

      var parent = null;
      var canvasElements = $fg(`div${selectors.rectangle.getClass()}`).not(
        createdItem
      );

      canvasElements.filter(function (i, item) {
        var obj = $fg(item),
          guid = obj.attr("id");

        var position = {
          w: item.offsetWidth,
          h: item.offsetHeight,
          x: item.offsetLeft,
          y: item.offsetTop
        };

        var left_right = {
          start: position.x,
          end: position.x + position.w
        };

        position.b = vm.convertToBottomPosition(position);

        var top_bottom = {
          start: position.b,
          end: position.b + position.h
        };

        if (
          options.position().x >= left_right.start &&
          options.position().x <= left_right.end &&
          (options.position().y >= top_bottom.start &&
            options.position().y <= top_bottom.end)
        ) {
          vm.getCreatedElement(guid, function (response) {
            if (response.type() === farmItemTypes.Location) {
              parent = {
                id: response.formData().NodeId,
                position: farmGraphModule.calcPos(obj)
              };
            }
          });
        }
      });
      return parent;
    },

    calcPos: function (elm) {
      var position = {
          x: parseInt(elm.css("left")),
          y: parseInt(elm.css("top"))
        },
        curr = elm;
      while (curr.parent().is(selectors.rectangle.getClass())) {
        curr = curr.parent();
        position.x -= parseInt(curr.css("left"));
        position.y -= parseInt(curr.css("top"));
      }
      return position;
    },

    redirectForm: function (page, popupSize, exParams) {
      var redirectParams = farmGraphModule.elements.elementModal.selector.data(
        "redirectParams"
      );
      var src = page + "?" + redirectParams;
      if (exParams) src = src + "&" + exParams;
      farmGraphModule.formOpenDialog(src, popupSize, function () {
        farmGraphModule.elements.elementModal.selector.modal("hide");
      });
    },

    formOpenDialog: function (src, popupSize, callback) {
      windowManager.ShowModalDialog(
        src,
        "Add Item",
        null,
        `Height:${popupSize.height}px;Width:${
            popupSize.width
            }px;Border:thick;AutoCenter:yes`,
        farmGraphModule.formCloseCallBack
      );
      setTimeout(() => {
        callback();
      }, 1000);
    },

    formCloseCallBack: function (sender, args) {
      farmGraphModule.elements.elementModal.selector.modal("hide");
      if (!args) return;
      if (args.device) {
        if (!args.popupSize)
          args.popupSize = {
            width: 750,
            height: 615
          };

        setTimeout(() => {
          farmGraphModule.formOpenDialog(args.url, args.popupSize, function () {
            farmGraphModule.elements.elementModal.selector.modal("hide");
          });
        }, 500);
      } else {
        var url = args.url || args;
        if (!url) return;
        location.href = url;
      }
    },

    formDeviceCallBack: function (sender, args) {
      farmGraphModule.elements.elementModal.selector.modal("hide");
      if (!args) return;
      var url = args.url || args;
      if (!url) return;
      location.href = url;
    },

    elementConnectedToDb: function (data) {
      if (!data.isConnected()) return;
      var element = $fg(`div[id=${data.guid()}]`);
      if (element) {
        element.removeClass(selectors.requireConnect);
        farmGraphModule.notifier.success(
          `${data.formData().NodeName} has beem matched to db!`
        );
      }
    },

    requireConnect: function (element) {
      var toolTipElement = elements.body.find(
          selectors.requireConnectWarning.getClass()
        ),
        toolTipOptions = {
          text: "This drawing has not matched any element in farmgraph!",
          class: selectors.requireConnectWarning,
          events: {
            mouseover: function (event) {
              var options = element.options;
              if (!options || options.isConnected()) return;

              const target = $fg(event.currentTarget),
                zoom = farmGraphModule.elements.drawArea.farmDraw.getZoom(),
                offset = target.offset(),
                left =
                offset.left * zoom +
                (target.outerWidth(true) * zoom -
                  toolTipElement.outerWidth(true)),
                top = offset.top * zoom - toolTipElement.outerHeight(true) - 5;

              toolTipElement.text(toolTipOptions.text).css({
                left: `${left}px`,
                top: `${top}px`
              });

              toolTipElement.stop().fadeIn(600);
            },
            mouseleave(event) {
              try {
                var e = event.toElement || event.relatedTarget;
                if (e.parentNode == this || e == this) return;
                toolTipElement.hide();
              } catch (error) {
                toolTipElement.hide();
              }
            }
          }
        };

      this.init = function () {
        toolTipElement = $fg("<div>", {
          class: toolTipOptions.class
        });
        toolTipElement.appendTo(elements.body);
      };

      if (toolTipElement.length == 0) {
        this.init();
      }

      var options = element.options;
      if (!options || options.isConnected()) return;

      element.on("mouseover", toolTipOptions.events.mouseover);
      element.on("mouseleave", toolTipOptions.events.mouseleave);
    },


    bindDbData: function (JSONData, parentObj) {
      if (JSONData == null) return;
      var dbModel = new farmGraphModule.dataBindModel();

      $fg.each(JSONData, function (i, data) {
        dbModel.createItem(data, function (createdItem) {
          if (createdItem) {
            dbModel.addItem(createdItem);
            createdItem
              .dblclick(farmGraphModule.elementUpdatedblClick)
              .click(farmGraphModule.elementSelectClick)
              .draggable({
                containment: "parent",
                //  grid: elements.farmDrawPluginOptions.canvas.gridSize,
                start: function (evt, ui) {
                  $fg(this).click();
                  vm.dragStart(evt);
                },
                drag: function (evt, ui) {
                  vm.dragElement(evt, ui);
                }
              });

            if (data.resizable()) {
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-nw",
                attr: {
                  id: "nwgrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-ne",
                attr: {
                  id: "negrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-sw",
                attr: {
                  id: "swgrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-se",
                attr: {
                  id: "segrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-n",
                attr: {
                  id: "ngrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-e",
                attr: {
                  id: "egrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-s",
                attr: {
                  id: "sgrip"
                }
              }).appendTo(createdItem);
              $fg("<div>", {
                class: "ui-resizable-handle ui-resizable-w",
                attr: {
                  id: "wgrip"
                }
              }).appendTo(createdItem);
              createdItem.resizable({
                handles: {
                  nw: "#nwgrip",
                  ne: "#negrip",
                  sw: "#swgrip",
                  se: "#segrip",
                  n: "#ngrip",
                  e: "#egrip",
                  s: "#sgrip",
                  w: "#wgrip"
                },
                // minWidth: 200,
                // minHeight: 200,
                containment: "parent",
                autoHide: true,
                // grid: elements.farmDrawPluginOptions.canvas.gridSize,
                start: function (evt, ui) {
                  $fg(this).click();
                  elements.drawArea.off("click");
                },
                resize: function (event, ui) {
                  var guid = $fg(ui.helper).attr("id");
                  vm.selectElement(guid);
                  vm.resizeElement(event, ui);
                },
                stop: function (event, ui) {
                  setTimeout(() => {
                    elements.drawArea.on(
                      "click",
                      farmGraphModule.drawAreaClickEvent
                    );
                  }, 200);
                }
              });
            }
            createdItem.options = data;

            farmGraphModule.isCubicleRender(createdItem);
            farmGraphModule.requireConnect(createdItem);
            farmGraphModule.setElementRectangleNameText(createdItem, false);
          }
        });
      });
    },

    isCubicleRender: function (item) {
      var data = item.options;
      if (!data.formData().Cubicle) return;

      var cubic = item;
      var options = data.formData().Cubicle;

      if (!item.hasClass(selectors.cubic)) {
        item.addClass(selectors.cubic);
      }

      var lineWidth = 2 * farmGraphModule.elements.drawArea.farmDraw.getZoom(),
        border, nofCubic = options.FitNoOfCubicals,
        isHorizontal = !options.FitIsHorizontal,
        isDouble = options.FitIsDouble,
        isFlip = options.FitIsFlipped,
        line = {
          w: parseInt(cubic.outerWidth()),
          h: parseInt(cubic.outerHeight()),
          x: parseInt(cubic.outerWidth()) / nofCubic,
          y: parseInt(cubic.outerHeight()) / nofCubic
        },
        borderWidth = line.w,
        borderHeight = line.h,
        c = $fg('<canvas>', {
          attr: {
            width: parseInt(cubic.outerWidth()),
            height: parseInt(cubic.outerHeight())
          }
        }),
        ctx = c.get(0).getContext("2d");
      ctx.lineWidth = 10;

      var x = line.x;
      var y = line.y;

      if (isDouble) {

        var centerLine;
        if (!isHorizontal) {

          border = {
            top: false,
            right: true,
            bottom: false,
            left: true
          }

          centerLine = {
            x: 0,
            y: parseInt(cubic.outerHeight()) / 2
          }

          ctx.moveTo(centerLine.x, centerLine.y);
          ctx.lineTo(line.w, centerLine.y);
          ctx.stroke();


        } else {

          border = {
            top: true,
            right: false,
            bottom: true,
            left: false
          }

          centerLine = {
            x: parseInt(cubic.outerWidth()) / 2,
            y: 0
          }

          ctx.moveTo(centerLine.x, centerLine.y);
          ctx.lineTo(centerLine.x, line.h);
          ctx.stroke();

        }

      } else {
        if (isHorizontal) {
          border = {
            top: true,
            right: true,
            bottom: true,
            left: false
          }
          if (isFlip) {
            border.left = true;
            border.right = false;
          }
        } else {
          border = {
            top: true,
            right: true,
            bottom: false,
            left: true
          }
          if (isFlip) {
            border.top = false;
            border.bottom = true;
          }
        }
      }
      for (var i = 1; i < nofCubic; i++) {
        if (isHorizontal) {
          ctx.moveTo(0, y);
          ctx.lineTo(line.w, y);
          y += line.y;
        } else {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, line.h);
          x += line.x;
        }
        ctx.stroke();
      }

      if (border.top) {
        ctx.moveTo(0, lineWidth);
        ctx.lineTo(borderWidth, lineWidth);
      }
      if (border.bottom) {
        ctx.moveTo(0, (borderHeight - lineWidth));
        ctx.lineTo(borderWidth, (borderHeight - lineWidth));
      }
      if (border.left) {
        ctx.moveTo(lineWidth, 0);
        ctx.lineTo(lineWidth, borderHeight);
      }
      if (border.right) {
        ctx.moveTo((borderWidth - lineWidth), 0);
        ctx.lineTo((borderWidth - lineWidth), borderHeight);
      }
      ctx.stroke();
      var img = c.get(0).toDataURL('image/png', 0.5);
      cubic.css('background-image', `url(${img})`)
    },

    validationFarmGraph: function () {
      farmGraphModule.farmDb.FarmGraphDimensionValidation(function (data) {
        if (data.Error) {
          var error_msg = $fg("<ul>");
          $fg.each(data.DimensionValidationItems, function (i, validationItem) {
            $fg("<li>")
              .text(validationItem.Message)
              .appendTo(error_msg);
          });
          windowManager.ShowMessageBox(
            "Farm Graph Validation Error",
            error_msg.html()
          );
        }
      });
    },
    unsavedChangedCallback: function (sender, args) {
      var save = args === "YES";
      if (!save) return;
      farmGraphModule.saveAll();
    },
    bootstrapSlider: function () {
      var slider = farmGraphModule.elements.bsSliderFarmZoom.bootstrapSlider({
        formatter: function (value) {
          vm.setZoomValue(value);
          return value;
        }
      });
    },
    contextMenu: function () {
      elements.ctxMenuSelector.contextmenu({
        zIndex: 9998,
        before: function (e, context) {
          if (vm.editMode() === false) return false;

          this.$element
            .find(selectors.rectangle.getClass())
            .on("click.context.data-api", $fg.proxy(this.closemenu, this));
          var target = $fg(e.target).is(selectors.rectangle.getClass()) ?
            $fg(e.target) :
            $fg(e.target).parent();
          target.click();
          if (!target.hasClass(selectors.rectangle)) {
            $fg("#context-menu")
              .find(".dropdown-item:not([data-canvas]),.dropdown-divider")
              .hide();
          } else {
            $fg("#context-menu")
              .children()
              .show();
          }
        },
        onItem: function (context, e) {
          var target = $fg(e.currentTarget);
          if (target.attr("id")) {
            var id = target.attr("id");
            switch (id) {
              case "ddlDrawNewItem":
                $fg(elements.farmDrawPluginOptions.drawNewButton).click();
                break;
              case "ddlDeleteItem":
                break;
            }
          }
        }
      });
    },
    bindConfirmationPopup: function () {
      elements.confirmationSelector.delete.confirmation({
        rootSelector: "[data-toggle=confirmation]",
        onConfirm: function () {
          vm.deleteElement();
        }
        // other options
      });
    },
    bindToolTip: function () {
      $fg('[data-toggle="tooltip"]').tooltip();
      $fg(".tooltip-cm").tooltip({
        trigger: "hover",
        title: "cm"
      });
    },
    ShowNotification: function (data) {
      switch (parseInt(data.responseHeader)) {
        case responseHeaders.UpdateFarmItemSizeAndLocation:
          var activeElement = vm.activeElement();
          farmGraphModule.notifier.success(
            `<span class='font-weight-bold'>${
                    activeElement.formData().NodeName
                    }</span> position has been updated!`
          );
          break;
        case responseHeaders.RemoveNodeItem:
          var activeElement = vm.activeElement();
          farmGraphModule.notifier.success(
            `<span class='font-weight-bold'>${
                    activeElement.formData().NodeName
                    }</span> has been removed!`
          );
          break;
        case responseHeaders.AddNodeItem:
          var activeElement = data.response;
          farmGraphModule.notifier.success(
            `<span class='font-weight-bold'>${
                    activeElement.formData.NodeName
                    }</span> has been added!`
          );
          break;
        case responseHeaders.UpdateFarmSize:
          farmGraphModule.notifier.success(
            `<span class='font-weight-bold'>Farm Size</span> has been updated!`
          );
          break;
        case responseHeaders.SetNodeRouting:
          var activeElement = vm.activeElement();
          farmGraphModule.notifier.success(
            `<span class='font-weight-bold'>${
                    activeElement.formData().NodeName
                    }</span> has been updated routings!`
          );
          break;
        case responseHeaders.UpdateAllFarmItemSizeAndLocation:
          farmGraphModule.notifier.success("All items location and size has been updated!");
          break;
      }
    },
    setOpacityModal: function (show) {
      var opacity = show === true ? 1 : 0;
      elements.elementModal.selector.css({
        opacity: opacity
      });
    },
    init: function (jsonData) {

      elements = this.elements;
      selectors = this.selectors;
      this.bindFarmDraw();
      this.bindExtensionMethods();
      this.bootstrapSlider();
      this.bindDbData(jsonData, null);
      this.contextMenu();
      this.bindCustomScrollBar();
      this.validationFarmGraph();
      this.toggleEditMode();
      // this.bindToolTip();
      // this.bindConfirmationPopup();

      window.addEventListener("beforeunload", function onBeforeUnload(e) {
        var unsavedObjects = vm.getUnsavedChangeObjects();
        if (unsavedObjects.length > 0) {
          var wmActive = windowManager.GetLastActiveWindow();
          if (wmActive) wmActive.DestroyWindow();
          setTimeout(() => {
            windowManager.ShowConfirmation(
              "Unsaved Changes",
              "<p>There are unsaved changes!</p> <p>Do you want to save changes?</p>",
              farmGraphModule.unsavedChangedCallback
            );
          }, 1000);

          // Dialog text doesn't really work in Chrome.
          const dialogText = "A dialog text when leaving the page";
          e.returnValue = dialogText;
          return dialogText;
        }
      });

      window.addEventListener('unload', function (e) {
        var wmActive = windowManager.GetLastActiveWindow();
        if (wmActive) wmActive.DestroyWindow();
      })

      var zoom = vm.setZoomValueByClientScreen(farmGraphModule.elements.bsSliderFarmZoom);
      farmGraphModule.elements.bsSliderFarmZoom.bootstrapSlider("setValue", zoom);

      $fg(window).on("resize load", function (e) {
        if (this == event.target) {
          var zoom = vm.setZoomValueByClientScreen();
          farmGraphModule.elements.bsSliderFarmZoom.bootstrapSlider("setValue", zoom);
          farmGraphModule.setScrollBarPosition();
        }
      });
    }
  };

  init = function () {
    scriptInit();
  }

  callback();
}
