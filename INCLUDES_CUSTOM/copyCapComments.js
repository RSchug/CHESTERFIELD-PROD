function copyCapComments(capId, pCapId) {
    var sCapId = aa.cap.getCapIDModel(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();
    var tCapId = aa.cap.getCapIDModel(pCapId.getID1(), pCapId.getID2(), pCapId.getID3()).getOutput();

    var sourceCapScriptModel = aa.cap.getCap(sCapId).getOutput();
    var targetCapScriptModel = aa.cap.getCap(tCapId).getOutput();

    if (sourceCapScriptModel != null && targetCapScriptModel != null) {
        aa.cap.copyComments(sourceCapScriptModel, targetCapScriptModel);
    }
}