//addAgenda(capID, hearingItem.getMeetingGroupIdString(),hearingItem.getMeetingIdString(),60,null,"Added via script");
function addAgenda(capID,meetingGroupID,meetingID,duration,reason,comments){
	try
	{
		var result = aa.meeting.scheduleMeeting(capID, meetingGroupID, meetingID, duration, reason, comments);
		if(result.getSuccess())
		{
			logDebug("Meeting is scheduled successfully.");
		}
		else
		{ 
			logDebug("Failed to schedule a meeting to a Record.");
		}
	}catch(err){
		logDebug("Method name: addAgenda. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}
