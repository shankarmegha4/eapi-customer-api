Feature: Validate if boilerplate api provides expected information

@dev @all
Scenario: Status of ping service 
   When I GET /api/v1/walgreens/nodejs/boilerplate/ping
   Then response body path $.status should be ok
