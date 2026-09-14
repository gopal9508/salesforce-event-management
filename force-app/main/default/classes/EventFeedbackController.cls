public with sharing class EventFeedbackController {

    @AuraEnabled(cacheable=true)
    public static List<Registration__c> getRegistrations() {

        return [
            SELECT Id, Name, Event__c, Event__r.Name, Contact__c, Contact__r.Name
            FROM Registration__c
            WHERE Status__c = 'Attended'
            ORDER BY Registration_Date__c DESC
            LIMIT 100
        ];
    }
}