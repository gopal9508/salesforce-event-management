public with sharing class PaymentIntegrationService {

    @AuraEnabled
    public static String processPayment(Id registrationId) {

        try {

            Registration__c reg = [
                SELECT Id, Name, Payment_Status__c
                FROM Registration__c
                WHERE Id = :registrationId
                LIMIT 1
            ];

            HttpRequest req = new HttpRequest();

            req.setEndpoint('callout:Payment_Gateway/products/add');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');

            Map<String, Object> paymentData = new Map<String, Object>{
                'registrationId' => registrationId,
                'amount' => 1000,
                'paymentStatus' => 'Paid'
            };

            req.setBody(JSON.serialize(paymentData));

            Http http = new Http();

            HttpResponse res = http.send(req);

            System.debug('Payment Response Status: ' + res.getStatusCode());
            System.debug('Payment Response Body: ' + res.getBody());

            if (res.getStatusCode() == 200 ||
                res.getStatusCode() == 201) {

                reg.Payment_Status__c = 'Paid';
                update reg;

                return 'Payment successful';
            }

            return 'Payment failed. HTTP Status: '
                + res.getStatusCode()
                + ' Body: '
                + res.getBody();

        } catch (Exception e) {

            System.debug('Payment Error: ' + e.getMessage());

            return 'Payment failed. Error: ' + e.getMessage();
        }
    }
}