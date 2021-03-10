function getFormatedDate(date) {
   if(date==null && date=="")
				  return "";
   var today = new Date(date);
   var dd = today.getDate();
   var mm = today.getMonth() + 1;
   var yy = today.getFullYear();
   var formatedDate = mm + '/' + dd + '/' + yy;
   return formatedDate;
}