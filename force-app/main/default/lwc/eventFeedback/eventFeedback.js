import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';

import FEEDBACK_OBJECT from '@salesforce/schema/Feedback__c';
import REGISTRATION_FIELD from '@salesforce/schema/Feedback__c.Registration__c';
import EVENT_FIELD from '@salesforce/schema/Feedback__c.Event__c';
import RATING_FIELD from '@salesforce/schema/Feedback__c.Rating__c';
import COMMENTS_FIELD from '@salesforce/schema/Feedback__c.Comments__c';
import SUBMITTED_DATE_FIELD from '@salesforce/schema/Feedback__c.Submitted_Date__c';

import getRegistrations from '@salesforce/apex/EventFeedbackController.getRegistrations';

export default class EventFeedback extends LightningElement {

    registrationOptions = [];
    registrationData = [];

    registrationId;
    eventId;
    rating;
    comments;

    ratingOptions = [
        { label: '1 ⭐', value: '1' },
        { label: '2 ⭐⭐', value: '2' },
        { label: '3 ⭐⭐⭐', value: '3' },
        { label: '4 ⭐⭐⭐⭐', value: '4' },
        { label: '5 ⭐⭐⭐⭐⭐', value: '5' }
    ];

    @wire(getRegistrations)
    wiredRegistrations({ data, error }) {

        if (data) {

            this.registrationData = data;

            this.registrationOptions = data.map(registration => ({
                label: `${registration.Name} - ${registration.Event__r.Name} - ${registration.Contact__r.Name}`,
                value: registration.Id
            }));
        }

        if (error) {
            console.error('Registration Error:', error);
        }
    }

    handleRegistrationChange(event) {

        this.registrationId = event.detail.value;

        const selectedRegistration = this.registrationData.find(
            registration => registration.Id === this.registrationId
        );

        if (selectedRegistration) {
            this.eventId = selectedRegistration.Event__c;
        }
    }

    handleRatingChange(event) {
        this.rating = event.detail.value;
    }

    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }

    handleSubmit() {

        if (!this.registrationId || !this.rating || !this.comments) {
            return;
        }

        const fields = {};

        fields[REGISTRATION_FIELD.fieldApiName] = this.registrationId;
        fields[EVENT_FIELD.fieldApiName] = this.eventId;
        fields[RATING_FIELD.fieldApiName] = Number(this.rating);
        fields[COMMENTS_FIELD.fieldApiName] = this.comments;
        fields[SUBMITTED_DATE_FIELD.fieldApiName] =
            new Date().toISOString();

        const recordInput = {
            apiName: FEEDBACK_OBJECT.objectApiName,
            fields: fields
        };

        createRecord(recordInput)
            .then(() => {
                this.resetForm();
            })
            .catch(error => {
                console.error('Feedback Error:', error);
            });
    }

    resetForm() {
        this.registrationId = null;
        this.eventId = null;
        this.rating = null;
        this.comments = null;
    }
}