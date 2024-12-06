/***
* @description  Test class for the dsfrSiteManagement_CTL class.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         August 2023
* @see          dsfrSiteManagement_CTL
* @see          DSFR_LWR package (https://github.com/pegros/DSFR_LWR)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2023 pegros
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

@isTest
@SuppressWarnings('PMD.ClassNamingConventions')
public class  dsfrSiteManagement_TST {

    private static dsfrTest__c      TST_RCD;
    private static StaticResource   TST_RSC = [SELECT Body,Name FROM StaticResource WHERE Name = 'dsfrTestFile' LIMIT 1];

	/***
	* @description Initializes the test context.
	***/
	@testSetup
	static void testSetup() {
		System.debug('testSetup: START');

		String currentUserId = UserInfo.getUserId();
		System.debug('testSetup: currentUserId fetched ' + currentUserId);

		Map<ID,PermissionSet> dsfrPSets = new Map<ID,PermissionSet>([SELECT Name FROM PermissionSet WHERE Name LIKE 'dsfr%']);
		System.debug('testSetup: dsfrPSets fetched ' + dsfrPSets);

		List<PermissionSetAssignment> currentAssignments = [	select PermissionSetId from PermissionSetAssignment
																where AssigneeId = :currentUserId and PermissionSetId in :dsfrPSets.keySet()];
		System.debug('testSetup: currentAssignments fetched ' + currentAssignments);
		for (PermissionSetAssignment iter : currentAssignments) {
			System.debug('testSetup: removing PermissionSet ' + iter.PermissionSetId);
			dsfrPSets.remove(iter.PermissionSetId);
		}
		System.debug('testSetup: dsfrPSets revised ' + dsfrPSets);

		List<PermissionSetAssignment> newAssignments = new List<PermissionSetAssignment>();
		for (PermissionSet iter : dsfrPSets.values()) {
			System.debug('testSetup: sfpegPSets processing PSet ' + iter);
			newAssignments.add(new PermissionSetAssignment(AssigneeId = currentUserId, PermissionSetId = iter.Id));
		}
		System.debug('testSetup: newAssignments init ' + newAssignments);

		insert newAssignments;
		System.debug('testSetup: newAssignments inserted ' + newAssignments);
		System.debug('testSetup: END');
    }

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "getPersonAccountRT" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testGetPersonAccountRT() {
		System.debug('testGetPersonAccountRT: START');

        List<Schema.RecordTypeInfo> RTs =  Account.SObjectType.getDescribe().getRecordTypeInfos();
		System.debug('testGetPersonAccountRT: Account RTs fetched ');
        String RTName = RTs[0]?.getDeveloperName();
		System.debug('testGetPersonAccountRT: Valid RT Name fetched ' + RTName);

		Test.startTest();

        // Testing passing cases
        System.debug('testGetPersonAccountRT: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.getPersonAccountRT(RTName);
			System.debug('testGetPersonAccountRT: result returned for valid RT Name ' + output);
			Assert.isNotNull(output,'A RT ID should be returned for a valid  RT Name');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testGetPersonAccountRT: exception raised for valid file with record' + e.getMessage());
			Assert.fail('No exception should be raised with valid RT Name');
		}

        // Testing error cases
        System.debug('testGetPersonAccountRT: TEST 2 - testing missing name');
		try {
            String output = dsfrSiteManagement_CTL.getPersonAccountRT('');
			System.debug(LoggingLevel.ERROR,'testGetPersonAccountRT: result returned when no RT Name provided ' + output);
            Assert.fail('Exception should be raised when no RT Name provided');
		}
		catch (Exception e) {
			System.debug('testGetPersonAccountRT: Exception properly raised with no RT Name provided ' + e.getMessage());
		}

        System.debug('testGetPersonAccountRT: TEST 3 - testing dummy name');
		try {
            String output = dsfrSiteManagement_CTL.getPersonAccountRT('DUMMY_RT_NAME');
			System.debug(LoggingLevel.ERROR,'testGetPersonAccountRT: result returned when bad RT Name provided ' + output);
            Assert.fail('Exception should be raised when bad RT Name provided');
		}
		catch (Exception e) {
			System.debug('testGetPersonAccountRT: Exception properly raised with bad RT Name provided ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetPersonAccountRT: END');
	}


	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "loginViaIdentity" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testLoginViaIdentity() {
		System.debug('testLoginViaIdentity: START');

		Test.startTest();


        // Testing passing case
        /*System.debug('testLoginViaIdentity: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.loginViaIdentity('Identity', 'password','/test');
			System.debug('testLoginViaIdentity: returning output ' + output);
			Assert.isNotNull(output,'Login should return ');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testLoginViaIdentity: error raised with correct file ' + e.getMessage());
			Assert.fail('Linking correct file should not raise exception');
		}*/

        // Testing error case
        System.debug('testLoginViaIdentity: TEST 2 - testing missing input');
		try {
            String output = dsfrSiteManagement_CTL.loginViaIdentity('DUMMY_IDENTITY', null, null);
			System.debug(LoggingLevel.ERROR,'testLoginViaIdentity: returning output with missing input ' + output);
			Assert.fail('Missing input should raise exception');
		}
		catch (Exception e) {
			System.debug('testLoginViaIdentity: error properly raised with missing input ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testLoginViaIdentity: END');
	}

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "registerUser" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testRegisterUser() {
		System.debug('testRegisterUser: START');

        Account wrongAccount = new Account();
        Account goodAccount = new Account(
            LastName = 'test',
            FirstName = 'test',
            PersonEmail = 'test@test.test'
        );

		Test.startTest();


        // Testing passing case
        /*System.debug('testLoginViaIdentity: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.loginViaIdentity('Identity', 'password','/test');
			System.debug('testLoginViaIdentity: returning output ' + output);
			Assert.isNotNull(output,'Login should return ');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testLoginViaIdentity: error raised with correct file ' + e.getMessage());
			Assert.fail('Linking correct file should not raise exception');
		}*/

        // Testing error case
        System.debug('testRegisterUser: TEST 2 - testing missing input');
		try {
            String output = dsfrSiteManagement_CTL.registerUser(wrongAccount,null,null);
			System.debug(LoggingLevel.ERROR,'testRegisterUser: returning output with missing input ' + output);
			Assert.fail('Missing input should raise exception');
		}
		catch (Exception e) {
			System.debug('testRegisterUser: error properly raised with missing input ' + e.getMessage());
		}

        System.debug('testRegisterUser: TEST 3 - testing missing password');
		try {
            String output = dsfrSiteManagement_CTL.registerUser(goodAccount,null,null);
			System.debug(LoggingLevel.ERROR,'testRegisterUser: returning output with missing password ' + output);
			Assert.fail('Missing password should raise exception');
		}
		catch (Exception e) {
			System.debug('testRegisterUser: error properly raised with missing password ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testRegisterUser: END');
	}

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "changePassword" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testChangePassword() {
		System.debug('testChangePassword: START');

		Test.startTest();

        // Testing passing case
        /*System.debug('testChangePassword: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.changePassword('new', 'new','old');
			System.debug('testChangePassword: returning output ' + output);
			Assert.isNotNull(output,'Change password should return ');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testChangePassword: error raised with correct passwords ' + e.getMessage());
			Assert.fail('Change password should not raise exception');
		}*/

        // Testing error case
        System.debug('testChangePassword: TEST 2 - testing missing input');
		try {
            dsfrSiteManagement_CTL.changePassword(null,null,null);
			System.debug(LoggingLevel.ERROR,'testChangePassword: returning with missing input ');
			Assert.fail('Missing input should raise exception');
		}
		catch (Exception e) {
			System.debug('testChangePassword: error properly raised with missing input ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testChangePassword: END');
	}

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "sendLostPassword" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testSendLostPassword() {
		System.debug('testSendLostPassword: START');

		Test.startTest();

        // Testing passing case
        /*System.debug('testSendLostPassword: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.sendLostPassword('Identity');
			System.debug('testSendLostPassword: returning output ' + output);
			Assert.isNotNull(output,'Sending Lost Password should return ');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testSendLostPassword: error raised with correct identity ' + e.getMessage());
			Assert.fail('Sending Lost Password should not raise exception');
		}*/

        // Testing error case
        System.debug('testSendLostPassword: TEST 2 - testing missing input');
		try {
            dsfrSiteManagement_CTL.sendLostPassword('');
			System.debug(LoggingLevel.ERROR,'testSendLostPassword: returning with missing input ');
			Assert.fail('Missing input should raise exception');
		}
		catch (Exception e) {
			System.debug('testSendLostPassword: error properly raised with missing input ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testSendLostPassword: END');
	}

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "validateCaptcha" method
	*               including all error cases.
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testValidateCaptcha() {
		System.debug('testValidateCaptcha: START');

		Test.startTest();

        // Testing passing case
        /*System.debug('testValidateCaptcha: TEST 1 - testing passing case');
		try {
            String output = dsfrSiteManagement_CTL.validateCaptcha(response,site, action, isEnterprise, isDebug);
			System.debug('testValidateCaptcha: returning output ' + output);
			Assert.isNotNull(output,'Captcha validation should return ');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testValidateCaptcha: error raised with correct inputs ' + e.getMessage());
			Assert.fail('Correct inputs should not raise exception');
		}*/

        // Testing error case
        System.debug('testValidateCaptcha: TEST 2 - testing missing input');
		try {
            dsfrSiteManagement_CTL.validateCaptcha(null,null, null, true, true);
			System.debug(LoggingLevel.ERROR,'testValidateCaptcha: returning with missing input ');
			Assert.fail('Missing input should raise exception');
		}
		catch (Exception e) {
			System.debug('testValidateCaptcha: error properly raised with missing input ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testValidateCaptcha: END');
	}

	/***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "base36encode" method
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testBase36() {
		System.debug('testBase36: START');
		Test.startTest();
		dsfrSiteManagement_CTL.base36encode(123456);
		Test.stopTest();
		System.debug('testBase36: END');
	}

    /***
	* @description  Test method for the dsfrSiteManagement_CTL class, checking the "dummyTest" method
	* @see          dsfrSiteManagement_CTL
	***/

	@isTest
	static void testDummy() {
		System.debug('testDummy: START');
		Test.startTest();
		dsfrSiteManagement_CTL.testDummy();
		Test.stopTest();
		System.debug('testDummy: END');
	}
}