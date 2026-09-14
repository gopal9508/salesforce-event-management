import { LightningElement, wire } from 'lwc';

import { createRecord } from 'lightning/uiRecordApi';

import REGISTRATION_OBJECT from '@salesforce/schema/Registration__c';
import EVENT_FIELD from '@salesforce/schema/Registration__c.Event__c';
import CONTACT_FIELD from '@salesforce/schema/Registration__c.Contact__c';
import REGISTRATION_DATE_FIELD from '@salesforce/schema/Registration__c.Registration_Date__c';
import STATUS_FIELD from '@salesforce/schema/Registration__c.Status__c';
import PAYMENT_STATUS_FIELD from '@salesforce/schema/Registration__c.Payment_Status__c';

import getEvents from '@salesforce/apex/EventRegistrationController.getEvents';
import getContacts from '@salesforce/apex/EventRegistrationController.getContacts';
import processPayment from '@salesforce/apex/PaymentIntegrationService.processPayment';

export default class EventRegistration extends LightningElement {

    eventOptions = [];
    contactOptions = [];

    eventId;
    contactId;
    registrationDate;

    status = 'Registered';
    paymentStatus = 'Pending';

    registrationId;

    statusOptions = [
        { label: 'Registered', value: 'Registered' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Attended', value: 'Attended' },
        { label: 'No Show', value: 'No Show' }
    ];

    paymentStatusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Refunded', value: 'Refunded' }
    ];

    @wire(getEvents)
    wiredEvents({ data, error }) {
        if (data) {
            this.eventOptions = data.map(eventRecord => ({
                label: eventRecord.Name,
                value: eventRecord.Id
            }));
        }

        if (error) {
            console.error('Event Error:', error);
        }
    }

    @wire(getContacts)
    wiredContacts({ data, error }) {
        if (data) {
            this.contactOptions = data.map(contact => ({
                label: contact.Name,
                value: contact.Id
            }));
        }

        if (error) {
            console.error('Contact Error:', error);
        }
    }

    handleEventChange(event) {
        this.eventId = event.detail.value;
    }

    handleContactChange(event) {
        this.contactId = event.detail.value;
    }

    handleDateChange(event) {
        this.registrationDate = event.detail.value;
    }

    handleStatusChange(event) {
        this.status = event.detail.value;
    }

    handlePaymentStatusChange(event) {
        this.paymentStatus = event.detail.value;
    }

    handleRegister() {

        if (!this.eventId || !this.contactId || !this.registrationDate) {
            return;
        }

        const fields = {};

        fields[EVENT_FIELD.fieldApiName] = this.eventId;
        fields[CONTACT_FIELD.fieldApiName] = this.contactId;
        fields[REGISTRATION_DATE_FIELD.fieldApiName] = this.registrationDate;
        fields[STATUS_FIELD.fieldApiName] = this.status;
        fields[PAYMENT_STATUS_FIELD.fieldApiName] = 'Pending';

        const recordInput = {
            apiName: REGISTRATION_OBJECT.objectApiName,
            fields: fields
        };

        createRecord(recordInput)
            .then(result => {

                this.registrationId = result.id;
                this.paymentStatus = 'Pending';

                console.log(
                    'Registration created:',
                    this.registrationId
                );
            })
            .catch(error => {

                console.error(
                    'Registration Error:',
                    error
                );
            });
    }

    handlePayment() {

        if (!this.registrationId) {
            return;
        }

        processPayment({
            registrationId: this.registrationId
        })
        .then(result => {

            console.log('Payment Result:', result);

            this.paymentStatus = 'Paid';

            console.log('Payment successful');

        })
        .catch(error => {

            console.error(
                'Payment Error:',
                error
            );

            this.paymentStatus = 'Failed';
        });
    }

    resetForm() {

        this.eventId = null;
        this.contactId = null;
        this.registrationDate = null;

        this.status = 'Registered';
        this.paymentStatus = 'Pending';

        this.registrationId = null;
    }
}