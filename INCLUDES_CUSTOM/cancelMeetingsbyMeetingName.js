//aa.print("cancelMeetingsbyMeetingName:" + cancelMeetingsbyMeetingName(capId, "PLANNING COMMISSION HEARING"));
function cancelMeetingsbyMeetingName(capID, MeetingName)
{
   // This function cancels all active meeting by capId and meeting name
   // and returns the total number of meetings canceled
	try
	{
	   var meetingsCancelled = 0;
	   agendaArr = aa.meeting.getMeetingsByCAP(capID, false).getOutput();
	   for (rec in agendaArr.toArray())
	   {
		  var agendaItem = agendaArr.toArray()[rec];
		  var meetingID = agendaItem.getMeetingID();
		  var meetingGroupID = agendaItem.getMeetingGroupID();
		  var meetingDate = agendaItem.getMeeting().getStartDate();
		  var meetingModel = agendaItem.getMeeting();
		  var tempMeetingType = meetingModel.getMeetingType().toString();
		  aa.print("tempMeetingType:" + tempMeetingType);
		  
		  if (tempMeetingType == MeetingName)
		  {
			 meetingsCancelled ++ ;
			 aa.meeting.removeAgendaFromMeeting(meetingGroupID, meetingID, capID);
		  }
	   }
	   return meetingsCancelled;
	}catch(err){
		logDebug("Method name: cancelMeetingsbyMeetingName. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}
