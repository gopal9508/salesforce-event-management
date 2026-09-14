public with sharing class EventRegistrationController {

    @AuraEnabled(cacheable=true)
    public static List<Event__c> getEvents() {

        return [
            SELECT Id, Name, Event_Date_Time__c
            FROM Event__c
            WHERE Event_Date_Time__c >= :System.now()
            AND Status__c = 'Open'
            ORDER BY Event_Date_Time__c ASC
            LIMIT 50
        ];
    }


    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {

        return [
            SELECT Id, Name, Email
            FROM Contact
            ORDER BY Name
            LIMIT 100
        ];
    }
}