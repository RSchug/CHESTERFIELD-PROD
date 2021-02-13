if (wfTask == 'Application Submittal' && exists(wfStatus,['Accepted','Accepted - Plan Review Not Required','Accepted - Plan Review Required'])) {
	//Nature of Work must be populated before Application Submittal Workflow Status is Accepted, Accepted - Plan Review Not Required, or Accepted - Plan Review Required
    if (typeof (AInfo["Nature of Work"]) == "undefined") {
        // Nature of Work is not on this record type
    } else if (AInfo["Nature of Work"] == null) {
        showMessage = true;
        comment('<font size=small><b>Nature of Work Data Field is Required</b></font>');
        cancel = true;
        // 46B. Structure must be linked except for Signs, and Commercial Towers, other accessory structures before Application Submittal Workflow Status is Accepted, Accepted - Plan Review Not Required, or Accepted - Plan Review Required
    } else if (!exists(AInfo["Nature of Work"], ["Accessory Structure", "Communication Tower (includes related equipment shelters)"]) && !(parentCapId && appMatch("Building/Structure/NA/NA", parentCapId))) {
        showMessage = true;
        comment('<font size=small><b>Structure is Required</b></font>');
        cancel = true;
    }
}
