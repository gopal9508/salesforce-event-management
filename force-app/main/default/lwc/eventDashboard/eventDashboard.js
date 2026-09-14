import { LightningElement, wire } from 'lwc';

import getUpcomingEvents from '@salesforce/apex/EventDashboardController.getUpcomingEvents';
import getTotalRegistrations from '@salesforce/apex/EventDashboardController.getTotalRegistrations';
import getTotalAttendees from '@salesforce/apex/EventDashboardController.getTotalAttendees';
import getAverageRating from '@salesforce/apex/EventDashboardController.getAverageRating';
import getUpcomingEventDetails from '@salesforce/apex/EventDashboardController.getUpcomingEventDetails';
import getFeedbackSummary from '@salesforce/apex/EventDashboardController.getFeedbackSummary';

export default class EventDashboard extends LightningElement {

    upcomingEvents = 0;
    totalRegistrations = 0;
    totalAttendees = 0;
    averageRating = 0;

    upcomingEventDetails = [];
    feedbackSummary = [];


    @wire(getUpcomingEvents)
    wiredUpcomingEvents({ data }) {
        if (data) {
            this.upcomingEvents = data;
        }
    }


    @wire(getTotalRegistrations)
    wiredTotalRegistrations({ data }) {
        if (data) {
            this.totalRegistrations = data;
        }
    }


    @wire(getTotalAttendees)
    wiredTotalAttendees({ data }) {
        if (data) {
            this.totalAttendees = data;
        }
    }


    @wire(getAverageRating)
    wiredAverageRating({ data }) {
        if (data) {
            this.averageRating = data;
        }
    }


    @wire(getUpcomingEventDetails)
    wiredUpcomingEventDetails({ data }) {
        if (data) {
            this.upcomingEventDetails = data;
        }
    }


@wire(getFeedbackSummary)
wiredFeedbackSummary({ data, error }) {

    console.log('Feedback Summary Data:', JSON.stringify(data));
    console.log('Feedback Summary Error:', error);

    if (data) {
        this.feedbackSummary = data.map(item => ({
            rating: item.rating,
            stars: '⭐'.repeat(Number(item.rating)),
            count: item.count
        }));

        console.log('Feedback Summary Array:', JSON.stringify(this.feedbackSummary));
    }
}
}