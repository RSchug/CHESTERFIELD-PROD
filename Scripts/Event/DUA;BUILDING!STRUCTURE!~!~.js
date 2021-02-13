//DUA:Building/Structure/*/*
var newDocModelArray = documentModelArray.toArray();
for (dl in newDocModelArray) {
   newDocModel = newDocModelArray[dl];
   // logDebug("<font color='green'>Processing Document: " + newDocModel + "</font>");
   logDebug("<font color='green'>Processing Document #" + newDocModel.getDocumentNo()
      + " DocName: " + newDocModel.getDocName()
      + ", DocDesc: " + newDocModel.getDocDescription()
      + ", DocGroup: " + newDocModel.getDocGroup()
      + ", DocCategory: " + newDocModel.getDocCategory()
      + ", DocCategoryByAction: " + newDocModel.getCategoryByAction()
      + ", DocStatus: " + newDocModel.getDocStatus()
      + ", FileKey: " + newDocModel.getFileKey()
      + ", FileName: " + newDocModel.getFileName()
      + ", FileUploadBy: " + newDocModel.getFileUpLoadBy()
      + "</font>");
   // 38B When Document Type of 'Code Modification' is added, then update the Code Modification checkbox and add the document description to Code Modification Document Description.
   if (newDocModel.getDocCategory() == "Code Modification") {
      editAppSpecific("Code Modification", "CHECKED");
      editAppSpecific("Code Modification Document Description", newDocModel.getDocDescription());
   }
}
