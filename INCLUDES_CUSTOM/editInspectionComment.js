function editInspectionComment(itemCap, inspectionId, inspcomment) {
               var inspResult = aa.inspection.getInspection(itemCap, inspectionId);
               if (!inspResult.getSuccess()) {
                              logDebug("**ERROR: getting inspection: #" + inspectionId + ". " + inspResult.getErrorMessage());
                              return null;
               }
               inspObj = inspResult.getOutput();
               var inspModel = inspObj.setInspectionComments(String(inspcomment));
               var result = aa.inspection.editInspection(inspObj);
               if (result.getSuccess()) {
                              logDebug("Updated inspection: #" + inspectionId + " " + inspObj.getInspectionType() + inspcomment);
                              return true;
               } else {
                              logDebug("ERROR: updating inspection: #" + inspectionId + " " + inspObj.getInspectionType() + " " + result.getErrorMessage());
                              return false;
               }
}
