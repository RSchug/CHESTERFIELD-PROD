//Add Fees//
if (!publicUser) {
if (AInfo["Water or sewer line installation or repair?"] == "Yes" && !feeExists("WATERSEWER")){
addFee("WATERSEWER","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Backflow preventor?"] == "Yes" && !feeExists("BACKFLOW")){
addFee("BACKFLOW","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Single-Family Dwelling" && !feeExists("NEWSFD")){
addFee("NEWSFD","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Mobile or Manufactured Home on Private Property" && !feeExists("MANUFACTURED")){
addFee("MANUFACTURED","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Industrialized (Modular Home)" && !feeExists("INDUSTRIAL")){
addFee("INDUSTRIAL","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Addition, Renovation, Conversion" && AInfo["Rough-in Inspection"] == "Not Required" && !feeExists("EXISTROUGH")){
addFee("EXISTROUGH","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Addition, Renovation, Conversion" && AInfo["Rough-in Inspection"] == "Required" && !feeExists("ROUGHIN")){
addFee("ROUGHIN","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Multi-Family Dwelling" && !feeExists("MULTIFAMILY")){
addFee("MULTIFAMILY","CC-BLD-RES-PLUMB","FINAL",houseCount,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Accessory Structure" && !feeExists("ROUGHIN")){
addFee("ROUGHIN","CC-BLD-RES-PLUMB","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-PLUMB","FINAL",1,"Y")}
}