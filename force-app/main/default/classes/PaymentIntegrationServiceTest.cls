@IsTest
private class PaymentIntegrationServiceTest {

    private class PaymentMock implements HttpCalloutMock {

        public HttpResponse respond(HttpRequest req) {

            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"id":1,"title":"Payment Successful"}');

            return res;
        }
    }

    @IsTest
    static void testProcessPayment() {

        Event__c eventRecord = new Event__c(
            Name = 'Test Payment Event',
            Event_Date_Time__c = System.now().addDays(5),
            Location__c = 'Bhopal',
            Maximum_Capacity__c = 50,
            Status__c = 'Open'
        );
        insert eventRecord;

       Contact testContact = new Contact(
    LastName = 'Test Contact',
    Email = 'test@example.com'
);
insert testContact;

Registration__c registration = new Registration__c(
    Event__c = eventRecord.Id,
    Contact__c = testContact.Id,
    Registration_Date__c = System.now(),
    Status__c = 'Registered',
    Payment_Status__c = 'Pending'
);
        insert registration;

        Test.setMock(HttpCalloutMock.class, new PaymentMock());

        Test.startTest();

        String result =
            PaymentIntegrationService.processPayment(registration.Id);

        Test.stopTest();

        Registration__c updatedRegistration = [
            SELECT Payment_Status__c
            FROM Registration__c
            WHERE Id = :registration.Id
        ];

        System.assertEquals('Payment successful', result);
        System.assertEquals('Paid', updatedRegistration.Payment_Status__c);
    }
}