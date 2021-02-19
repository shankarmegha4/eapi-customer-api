/* eslint-disable no-console */
/* eslint-disable no-undef */
let chai = require('chai');
let chaiHttp = require('chai-http');
// eslint-disable-next-line no-unused-vars
let server = require('../../app');
// eslint-disable-next-line no-unused-vars
let should = chai.should();
chai.use(chaiHttp);
const url = 'http://localhost:8080';
let logging = require('../../utils/logging');


describe('/GET ping service', () => {
	it('it should GET ping status message', (done) => {
		chai.request(url)
			.get('/v1/pharmacy/patient/ping')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.status.should.equal('ok');
				res.body.apiname.should.equal('eapi-customer-rest');
				res.body.apiversion.should.equal('v1_0_0');
				done();
			});
	});
	
});

describe('Test Info/Debug/Error Message Logging', () => {
	it('it should log info message', (done) => {
		logging.logInfo("SampleAplicationName",101,1001,1,"GET","200","Success","TestInfoLog","100ms",null,null);
		done();
	});
	it('it should log info message', (done) => {
		logging.logInfo(null,102,1002,1,"GET","200","Success","TestInfoLog","100ms",null,null);
		done();
	});
	it('it should log Debug message', (done) => {
		logging.logDebug("SampleAplicationName",103,1003,2,"GET","200","Success","TestDebugLog","150ms",null,null);
		done();
	});
	it('it should log Debug message', (done) => {
		logging.logDebug(null,104,1004,2,"GET","200","Success","TestDebugLog","150ms",null,null);
		done();
	});
	it('it should log error message', (done) => {
		let error = new Error("Internal Error")
		logging.logError("SampleAplicationName",105,1005,3,"GET","500","Failure","Error Occured %s", "50ms","KFK-ERR-001","Error accessing input topic",error);
		done();
	});
	it('it should log error message', (done) => {
		let error = new Error("Internal Error")
		logging.logError(null,106,1006,3,"GET","500","Failure","Error Occured %s", "50ms","KFK-ERR-001","Error accessing input topic",error);
		done();
	});


}); 

describe("POST /v1/pharmacy/patient/",()=>{

	/** Insert test record inside DB */
	before(function(done){
 
		var dbo = global.db.db("eapi_data");

		/**Test Obj Creation */
		var patientTestDoc = {

			patientId: "TXTX001",
			firstName: "NAME001" ,
			addressLine1:"ADRESLINE1",
			city:"CITY001",
			zipCode:"ZIP001",
			state:"STATE001",
			cardType:"CARDTYPE001",
			creditCard:"CRD001",
			lastFourDigits:"0000",
			expiryMonth:"12",
			expiryYear:"1111",
			isDefault:true
		};

		// eslint-disable-next-line no-unused-vars
		dbo.collection("tbf0_patient").insertOne(patientTestDoc, function(err,res) {
			if (err) throw err;
		});
		done();
	});

	/** Remove the test data after execution */
	after(function(done){

		var dbo = global.db.db("eapi_data");
		var deleteQuery = { patientId: 'TXTX001' };

		// eslint-disable-next-line no-unused-vars
		dbo.collection("tbf0_patient").deleteOne(deleteQuery, function(err,res) {
			if (err) throw err;
		});
		done();
	});


	it("it should get patient info",(done)=>{

		chai.request(server)
		.post("/v1/pharmacy/patient?patientId=TXTX001")
		.set("Authorization","001")
		.end((err,response)=>{
			
			response.should.have.status(200);
			response.body.should.be.a('object');
			
			response.body.should.have.property('patientId').eq("TXTX001");
			response.body.should.have.property('customerShippingAddress');
			response.body.customerShippingAddress.should.have.property('addressLine1').eq("ADRESLINE1");
			response.body.profilePaymentDetails[0].should.have.property('cardType').eq("CARDTYPE001");

			done();
		});
	});

	it("it should return 404 when no matching records",(done)=>{

		chai.request(server)
		.post("/v1/pharmacy/patient?patientId=TXTX001001")
		.set("Authorization","001")
		.end((err,response)=>{
		
			response.should.have.status(404);
			response.body.should.be.a('object');
			response.body.should.have.property('messages');
			response.body.messages[0].should.have.property('code').eq('WAG_E_SEARCH_1000');
			response.body.messages[0].should.have.property('type').eq('ERROR');
			done();
		});
	});

	it("it should return 405 when invalid method call",(done)=>{

		chai.request(server)
		.get("/v1/pharmacy/patient?patientId=TXTX001")
		.set("Authorization","001")
		.end((err,response)=>{

			response.should.have.status(405);
			response.body.should.be.a('object');
			response.body.should.have.property('messages');
			response.body.messages[0].should.have.property('code').eq('WAG_E_INVALID_METHOD_1001');
			response.body.messages[0].should.have.property('type').eq('ERROR');
			done();
		});
	});

	it("it should return 401 if not authenticated",(done)=>{

		chai.request(server)
		.post("/v1/pharmacy/patient?patientId=TXTX001")
		.end((err,response)=>{

			response.should.have.status(401);
			response.body.should.be.a('object');
			response.body.should.have.property('messages');
			response.body.messages[0].should.have.property('code').eq('WAG_E_UNAUTHORIZED_REQUEST_1001');
			response.body.messages[0].should.have.property('type').eq('ERROR');
			done();
		});
	});

	it("it should return 400 when request have missing patientId",(done)=>{

		chai.request(server)
		.post("/v1/pharmacy/patient")
		.end((err,response)=>{

			response.should.have.status(400);
			response.body.should.be.a('object');
			response.body.should.have.property('messages');
			response.body.messages[0].should.have.property('code').eq('WAG_E_INVALID_REQUEST_1001');
			response.body.messages[0].should.have.property('type').eq('ERROR');
			done();
		});
	});

	describe("Test DB Conectivity",()=>{

		var dbconnection;

		before(function(done){

			dbconnection=global.db;
			global.db=undefined;//mocking db- connection as 'undefined'
			done();
		});

		after(function(done){

			global.db=dbconnection; //resetting db connection back.
			done();
		});
	
		it("it should return 503 when db is down",(done)=>{
			
			chai.request(server)
			.post("/v1/pharmacy/patient?patientId=TXTX001")
			.set("Authorization","001")
			.end((err,response)=>{
				
				response.should.have.status(503);
				response.body.should.be.a('object');
				response.body.should.have.property('messages');
				response.body.messages[0].should.have.property('code');
				response.body.messages[0].should.have.property('type');
				done();
			});
	
		});
	});

});



