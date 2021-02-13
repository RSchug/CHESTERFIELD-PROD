function getInspectionComment(itemCap, inspectionId) {
	           var comment = "No Comment";
               var inspResult = aa.inspection.getInspection(itemCap, inspectionId);
               if (inspResult.getSuccess()) {
                   inspObj = inspResult.getOutput();           
				   comment = inspObj.getInspectionComments();		  
							  
               }
               return comment;
}
