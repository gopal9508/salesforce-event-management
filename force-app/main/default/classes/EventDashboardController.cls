public with sharing class EventDashboardController {

    @AuraEnabled(cacheable=true)
    public static Integer getUpcomingEvents() {
        return [
            SELECT COUNT()
            FROM Event__c
            WHERE Event_Date_Time__c > :System.now()
            AND Status__c = 'Open'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalRegistrations() {
        return [
            SELECT COUNT()
            FROM Registration__c
            WHERE Status__c != 'Cancelled'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalAttendees() {
        return [
            SELECT COUNT()
            FROM Registration__c
            WHERE Attendance__c = true
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Decimal getAverageRating() {
        List<AggregateResult> results = [
            SELECT AVG(Rating__c) averageRating
            FROM Feedback__c
        ];

        if (results.isEmpty() || results[0].get('averageRating') == null) {
            return 0;
        }

        return (Decimal) results[0].get('averageRating');
    }


    // Upcoming Event Details
    public class EventWrapper {

        @AuraEnabled public Id eventId;
        @AuraEnabled public String eventName;
        @AuraEnabled public Datetime eventDate;
        @AuraEnabled public Integer registrations;

        public EventWrapper(
            Id eventId,
            String eventName,
            Datetime eventDate,
            Integer registrations
        ) {
            this.eventId = eventId;
            this.eventName = eventName;
            this.eventDate = eventDate;
            this.registrations = registrations;
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<EventWrapper> getUpcomingEventDetails() {

        List<Event__c> events = [
            SELECT Id, Name, Event_Date_Time__c
            FROM Event__c
            WHERE Event_Date_Time__c > :System.now()
            AND Status__c = 'Open'
            ORDER BY Event_Date_Time__c ASC
            LIMIT 10
        ];

        Map<Id, Integer> registrationCounts = new Map<Id, Integer>();

        for (AggregateResult result : [
            SELECT Event__c eventId, COUNT(Id) total
            FROM Registration__c
            WHERE Status__c != 'Cancelled'
            GROUP BY Event__c
        ]) {
            registrationCounts.put(
                (Id) result.get('eventId'),
                (Integer) result.get('total')
            );
        }

        List<EventWrapper> output = new List<EventWrapper>();

        for (Event__c eventRecord : events) {

            Integer count = registrationCounts.containsKey(eventRecord.Id)
                ? registrationCounts.get(eventRecord.Id)
                : 0;

            output.add(
                new EventWrapper(
                    eventRecord.Id,
                    eventRecord.Name,
                    eventRecord.Event_Date_Time__c,
                    count
                )
            );
        }

        return output;
    }


 // Feedback Summary

// Feedback Summary

public class FeedbackSummaryWrapper {
    @AuraEnabled public Integer rating;
    @AuraEnabled public Integer count;

    public FeedbackSummaryWrapper(Integer rating, Integer count) {
        this.rating = rating;
        this.count = count;
    }
}

@AuraEnabled(cacheable=true)
public static List<FeedbackSummaryWrapper> getFeedbackSummary() {

    Map<Integer, Integer> counts = new Map<Integer, Integer>();

    // Initialize ratings 1 to 5
    for (Integer rating = 1; rating <= 5; rating++) {
        counts.put(rating, 0);
    }

    // Get all feedback records
    List<Feedback__c> feedbackList = [
        SELECT Rating__c
        FROM Feedback__c
        WHERE Rating__c != null
    ];

    // Count each rating
    for (Feedback__c feedback : feedbackList) {

        Integer rating = Integer.valueOf(
            String.valueOf(feedback.Rating__c)
        );

        counts.put(
            rating,
            counts.get(rating) + 1
        );
    }

    // Return 5 to 1
    List<FeedbackSummaryWrapper> output =
        new List<FeedbackSummaryWrapper>();

    for (Integer rating = 5; rating >= 1; rating--) {

        output.add(
            new FeedbackSummaryWrapper(
                rating,
                counts.get(rating)
            )
        );
    }

    return output;
}
}