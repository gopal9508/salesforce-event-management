import { LightningElement, wire } from 'lwc';
import getEvents from '@salesforce/apex/EventListController.getEvents';

export default class EventList extends LightningElement {

    events = [];

    @wire(getEvents)
    wiredEvents({ data, error }) {

        if (data) {
            this.events = data;
        }

        if (error) {
            console.error('Event List Error:', error);
        }
    }
}
