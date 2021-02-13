function copyDocuments(pFromCapId, pToCapId) {
	//01-2021 db added code for this
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;
	//Copies all attachments (documents) from srcCapId to targetCapId
	var docCategories = null;
	if (arguments.list > 2) docCategories = arguments[2];
	var docStatuses = null;
	if (arguments.list > 3) docStatuses = arguments[3];
	var preventDuplicate = true;
	if (arguments.list > 4 && arguments[4] != null) preventDuplicate = arguments[4];
	var newDocStatus = null;
	if (arguments.list > 5) newDocStatus = arguments[5];

//test coed from accela

	var vDocList = aa.document.getDocumentListByEntity(capId, "CAP").getOutput();
if (vDocList) {
    for (var vCounter = 0; vCounter < vDocList.size(); vCounter++) {
        var vDocModel = vDocList.get(vCounter);
        var vDocGroup = vDocModel.docGroup;
        var vDocCat = vDocModel.docCategory;
        for (l in vDocModel)
            if (typeof(vDocModel[l]) != "function") { {
                    aa.print("loop attributes: " + l + " : " + vDocModel[l]);
                }
            }
        for (m in vDocModel)
            if (typeof(vDocModel[m]) == "function") { {
                    aa.print("lmettods: " + m);
                }
            }

        vDocModel.setCapID(vToCapId);
        vDocModel.setEntityID(vToCapId.toString());

        //holdFile=downloadFile2Disk(vDocModel,"","","", true)
        //aa.print("new file: " +holdFile);

        //vDocModel.setFileKey(holdFile);
        //aa.document.updateDocument(vDocModel);
        aa.document.createDocument(vDocModel);
    }
}
	
// to here

	var capDocResult = aa.document.getDocumentListByEntity(pFromCapId, "CAP");
	if (capDocResult.getSuccess()) {
		if (capDocResult.getOutput().size() > 0) {
			for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
				var documentObject = capDocResult.getOutput().get(docInx);
				if (docCategories && !exists(documentObject.getDocCategory(),docCategories)) continue;
				if (docStatuses && !exists(documentObject.getDocStatus(),docStatuses)) continue;

                // Check for Duplicate Document
                documentFound = false;
                if (!preventDuplicate) {
                    var capDocuments2 = aa.document.getDocumentListByEntity(vToCapId, "CAP");
                    if (capDocuments2.getSuccess()) {
                        var capDocumentList2 = capDocuments2.getOutput();
                        if (capDocumentList2.size() > 0) {
                            for (index = 0; index < capDocumentList2.size(); index++) {
                                capDocumentModel2 = capDocumentList2.get(index);
                                if (capDocumentModel.getDocName() == capDocumentModel2.getDocName() && capDocumentModel.getFileKey() == capDocumentModel2.getFileKey()) {
                                    logDebug("Skipping document1: " + capDocumentModel.getDocumentNo() + " " + capDocumentModel.getDocName() + " " + capDocumentModel.getFileKey() + " from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
                                    documentFound = true;
                                }
                            }
                        }
                    }
                }
                if (documentFound) continue;
				
				// download the document content
				var useDefaultUserPassword = false;
				//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
				var EMDSUsername = "laserfiche";
				var EMDSPassword = "pass123";
				for(l in documentObject) if(typeof(documentObject[l])!="function"){{aa.print("loop attributes: " + l + " : " +documentObject[l]);}}
				for(l in documentObject) if(typeof(documentObject[l])=="function"){{aa.print("loop methods: " + l);}}


				//var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
				//var downloadResult = aa.document.downloadFile2Disk(documentObject, "", EMDSUsername, EMDSPassword, useDefaultUserPassword);
				var downloadResult = aa.document.downloadFile2Disk(documentObject,"","","", true);
				if (downloadResult.getSuccess()) {
					var path = downloadResult.getOutput();
					logDebug("path=" + path);
				}

				var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
				documentObject.setDocumentNo(null);
				documentObject.setCapID(vToCapId);
				documentObject.setEntityID(tmpEntId);

				// Open and process file
				try {
					// put together the document content - use java.io.FileInputStream
					var newContentModel = aa.document.newDocumentContentModel().getOutput();
					inputstream = new java.io.FileInputStream(path);
					newContentModel.setDocInputStream(inputstream);
					documentObject.setDocumentContent(newContentModel);

					var newDocResult = aa.document.createDocument(documentObject);
					if (newDocResult.getSuccess()) {
					    var newDocObject = newDocResult.getOutput();
						if (newDocStatus) {
							newDocObject.setDocStatus(newDocStatus);
							aa.document.updateDocument(newDocObject);
						}
						newDocResult.getOutput();
						logDebug("Successfully copied document: " + documentObject.getFileName());
					} else {
						logDebug("Failed to copy document: " + documentObject.getFileName());
						logDebug(newDocResult.getErrorMessage());
					}
				} catch (err) {
					logDebug("Error copying document: " + err.message);
					return false;
				}

			}
		}
	}
}