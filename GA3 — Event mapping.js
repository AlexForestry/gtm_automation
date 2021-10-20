function eventMappingAuto() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Event mapping");
  var values = sheet.getDataRange().getValues();
  const valuesLength = values.length;

  //begin must-part of every json file
  var outputText = '{\n"exportFormatVersion": 2,\n"containerVersion": {\n';
  
  //part with tag-filling function
  var outputTagText = '"tag": [\n';
  for (var i = 1; i < valuesLength; i++) {
    //initialization of variables
    var tagId = i*2;
    var triggerId = (i*2)-1;
    var tagName = values[i][1];
    var tagCategory = values[i][3];
    var tagAction = values[i][4];
    var tagLabel = values[i][5];
    var tagType = values[i][11];
    var tagInteraction = values[i][14];
    var tagGA = values[i][15];

    //making response
    outputTagText += '{\n"accountId": "1",\n"containerId": "1",\n"tagId": "' + tagId + '",\n"name": "' + tagName + '",\n"type": "ua",\n"parameter": [\n{\n"type": "BOOLEAN",\n"key": "nonInteraction",\n"value": "' + tagInteraction + '"\n},\n{\n"type": "BOOLEAN",\n"key": "overrideGaSettings",\n"value": "false"\n},\n{\n"type": "TEMPLATE",\n"key": "eventCategory",\n"value": "' + tagCategory + '"\n},\n{\n"type": "TEMPLATE",\n"key": "trackType",\n"value": "TRACK_EVENT"\n},\n{\n"type": "TEMPLATE",\n"key": "gaSettings",\n"value": "' + tagGA + '"\n},\n{\n"type": "TEMPLATE",\n"key": "eventAction",\n"value": "' + tagAction + '"\n},\n{\n"type": "TEMPLATE",\n"key": "eventLabel",\n"value": "' + tagLabel + '"\n}\n],\n';
    if (tagType.match(/Page view|Click — All Elements|Element Visibility — (ID|CSS)|Scroll Depth|Custom Event|Javascript Error/)){
      outputTagText += '"firingTriggerId": [\n"' + triggerId + '"\n],\n';
    } //if we have unique type of trigger — skip for manual filling
    outputTagText += '"parentFolderId": "1",\n"tagFiringOption": "ONCE_PER_EVENT"\n}';

    if (valuesLength - i === 1) { //check of end response or not
      outputTagText += '\n';
    } else {
      outputTagText += ',\n';
    }
  }
  outputTagText += '],\n';

  //part with trigger-filling function
  var outputTriggerText = '"trigger": [\n';
  for (var i = 1; i < values.length; i++) {
    //initialization of variables
    var triggerId = (i*2)-1;
    var triggerName = values[i][1];
    var triggerPageType = values[i][2];
    var triggerCategory = values[i][3];
    var triggerType = values[i][11];
    var triggerComparison = values[i][12];
    var triggerArgument = values[i][13];

    //translate into JSON format comparison answer
    switch (triggerComparison) {
      case 'Contains':
        triggerComparison = 'CONTAINS';
        break;
      case 'Exactly':
        triggerComparison = 'EQUALS';
        break;
      case 'RegEx':
        triggerComparison = 'MATCH_REGEX';
        break;
      case 'None':
        triggerComparison = 'None';
        break;
    }

    //place escape symbols before quotation — full ESCAPAAAATION :)
    triggerArgument = triggerArgument.replace(/"/g, '\\"');

    //making response
    switch (triggerType) {
      case 'Page view':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "PAGEVIEW",\n"filter": [\n{\n"type": "CONTAINS",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "arg0",\n"value": "' + triggerCategory + '"\n},\n{\n"type": "TEMPLATE",\n"key": "arg1",\n"value": "' + triggerPageType + '"\n}\n]\n}\n],\n"parentFolderId": "1"\n}';
        break;
      case 'Click — All Elements':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "CLICK",\n"filter": [\n{\n"type": "CSS_SELECTOR",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "arg0",\n"value": "{{Click Element}}"\n},\n{\n"type": "TEMPLATE",\n"key": "arg1",\n"value": "' + triggerArgument + '"\n}\n]\n}';
        if(triggerComparison !== "None") {
          if (triggerPageType !== "Sitewide") {
            outputTriggerText += ',\n{\n"type": "' + triggerComparison + '",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "arg0",\n"value": "{{pageType}}"\n},\n{\n"type": "TEMPLATE",\n"key": "arg1",\n"value": "' + triggerPageType + '"\n}\n]\n}';
          } 
        }
        outputTriggerText += '\n],\n"parentFolderId": "1"\n}';
        break;
      case 'Element Visibility — ID':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "ELEMENT_VISIBILITY",\n"parentFolderId": "1",\n"parameter": [\n{\n"type": "BOOLEAN",\n"key": "useOnScreenDuration",\n"value": "false"\n},\n{\n"type": "BOOLEAN",\n"key": "useDomChangeListener",\n"value": "true"\n},\n{\n"type": "TEMPLATE",\n"key": "elementId",\n"value": "' + triggerArgument + '"\n},\n{\n"type": "TEMPLATE",\n"key": "firingFrequency",\n"value": "ONCE_PER_ELEMENT"\n},\n{\n"type": "TEMPLATE",\n"key": "selectorType",\n"value": "ID"\n},\n{\n"type": "TEMPLATE",\n"key": "onScreenRatio",\n"value": "50"\n}\n]\n}';
        break;
      case 'Element Visibility — CSS':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "ELEMENT_VISIBILITY",\n"parentFolderId": "1",\n"parameter": [\n{\n"type": "BOOLEAN",\n"key": "useOnScreenDuration",\n"value": "false"\n},\n{\n"type": "BOOLEAN",\n"key": "useDomChangeListener",\n"value": "true"\n},\n{\n"type": "TEMPLATE",\n"key": "elementSelector",\n"value": "' + triggerArgument + '"\n},\n{\n"type": "TEMPLATE",\n"key": "firingFrequency",\n"value": "ONCE_PER_ELEMENT"\n},\n{\n"type": "TEMPLATE",\n"key": "selectorType",\n"value": "CSS"\n},\n{\n"type": "TEMPLATE",\n"key": "onScreenRatio",\n"value": "50"\n}\n]\n}';
        break;
      case 'Scroll Depth':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "SCROLL_DEPTH",\n"parentFolderId": "1",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "verticalThresholdUnits",\n"value": "PERCENT"\n},\n{\n"type": "TEMPLATE",\n"key": "verticalThresholdsPercent",\n"value": "10, 20, 30, 40, 50, 60, 70, 80, 90, 100"\n},\n{\n"type": "BOOLEAN",\n"key": "verticalThresholdOn",\n"value": "true"\n},\n{\n"type": "TEMPLATE",\n"key": "triggerStartOption",\n"value": "WINDOW_LOAD"\n},\n{\n"type": "BOOLEAN",\n"key": "horizontalThresholdOn",\n"value": "false"\n}\n]\n}';
        break;
      case 'Custom Event':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "CUSTOM_EVENT",\n"customEventFilter": [\n{\n"type": "EQUALS",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "arg0",\n"value": "{{_event}}"\n},\n{\n"type": "TEMPLATE",\n"key": "arg1",\n"value": "' + triggerArgument + '"\n}\n]\n}\n]';
        if(triggerComparison !== "None") {
          if (triggerPageType !== "Sitewide") {
          outputTriggerText += ',\n"filter": [\n{\n"type": "' + triggerComparison + '",\n"parameter": [\n{\n"type": "TEMPLATE",\n"key": "arg0",\n"value": "{{pageType}}"\n},\n{\n"type": "TEMPLATE",\n"key": "arg1",\n"value": "' + triggerPageType + '"\n}\n]\n}\n]';
          }
        }
        outputTriggerText += ',\n"parentFolderId": "1"\n}';
        break;
      case 'Javascript Error':
        outputTriggerText += '{\n"accountId": "1",\n"containerId": "1",\n"triggerId": "' + triggerId + '",\n"name": "' + triggerName + '",\n"type": "JS_ERROR",\n"parentFolderId": "1"\n}';
        break;
    }
    
    //check of end response or not
    if (valuesLength - i === 1) {
      outputTriggerText += '\n';
    } else {
      outputTriggerText += ',\n';
    }
  }
  outputTriggerText += '],\n';

  //connect tag data, trigger data and end must-part
  outputText += outputTagText + outputTriggerText + '"folder": [\n{\n"accountId": "1",\n"containerId": "1",\n"folderId": "1",\n"name": "ConversionRate.store"\n}\n],\n"builtInVariable": [\n{\n"accountId": "1",\n"containerId": "1",\n"type": "PAGE_PATH",\n"name": "Page Path"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "EVENT",\n"name": "Event"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "CLICK_ELEMENT",\n"name": "Click Element"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "CLICK_URL",\n"name": "Click URL"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "CLICK_TEXT",\n"name": "Click Text"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "SCROLL_DEPTH_THRESHOLD",\n"name": "Scroll Depth Threshold"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "SCROLL_DEPTH_UNITS",\n"name": "Scroll Depth Units"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "SCROLL_DEPTH_DIRECTION",\n"name": "Scroll Direction"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "ELEMENT_VISIBILITY_RATIO",\n"name": "Percent Visible"\n},\n{\n"accountId": "1",\n"containerId": "1",\n"type": "ELEMENT_VISIBILITY_TIME",\n"name": "On-Screen Duration"\n}\n]\n}\n}';

  var date = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy");
  var docName = SpreadsheetApp.getActive().getName();
  var output = DriveApp.createFile("Event mapping — auto output of project \'" + docName + '\'\| ' + date + ".json", outputText);
}