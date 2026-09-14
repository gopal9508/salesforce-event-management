public class EventTriggerHandler {

    public static void handleAfterUpdate(
        List<Event__c> newEvents,
        Map<Id, Event__c> oldMap
    ) {

        Set<Id> cancelledEventIds = new Set<Id>();

        for (Event__c event : newEvents) {

            Event__c oldEvent = oldMap.get(event.Id);

            if (event.Status__c == 'Cancelled' &&
                oldEvent.Status__c != 'Cancelled') {

                cancelledEventIds.add(event.Id);
            }
        }

        if (cancelledEventIds.isEmpty()) {
            return;
        }

        List<Registration__c> registrations = [
            SELECT Id, Status__c
            FROM Registration__c
            WHERE Event__c IN :cancelledEventIds
        ];

        for (Registration__c reg : registrations) {
            reg.Status__c = 'Cancelled';
        }

        if (!registrations.isEmpty()) {
            update registrations;
        }
    }
}