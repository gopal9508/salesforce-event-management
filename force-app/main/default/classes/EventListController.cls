public with sharing class EventListController {

    @AuraEnabled(cacheable=true)
    public static List<Event__c> getEvents() {

        return [
            SELECT Id,
                   Name,
                   Event_Date_Time__c,
                   Location__c,
                   Maximum_Capacity__c,
                   Status__c,
                   Total_Registrations__c
        FROM Event__c
        ORDER BY Event_Date_Time__c ASC
        LIMIT 100
        ];
    }
}