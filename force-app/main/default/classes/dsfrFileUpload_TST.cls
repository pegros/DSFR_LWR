/***
* @description  Test class for the dsfrFileUpload_CTL class.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         April 2023
* @see          dsfrFileUpload_CTL
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
public class  dsfrFileUpload_TST {

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
	* @description  Test method for the dsfrFileUpload_CTL class, checking the "uploadFile" method
	*               including all error cases.
	* @see          dsfrFileUpload_CTL
	***/

	@isTest
	static void testUploadFile() {
		System.debug('testUploadFile: START');

        if (TST_RCD == null) {
            System.debug('testUploadFile: registering TEST_RCD ');
            TST_RCD = new dsfrTest__c(Name = 'TEST');
            insert TST_RCD;
		    System.debug('testUploadFile: TEST_RCD inserted ' + TST_RCD);
        }

		Test.startTest();

        // Testing passing cases
        System.debug('testUploadFile: TEST 1 - testing passing case with related record ');
		try {
            Map<String,Object> outputMap = dsfrFileUpload_CTL.uploadFile(EncodingUtil.base64Encode(TST_RSC.Body), 'TestUpload', new List<String>{TST_RCD.Id}, null, 'V');
			System.debug('testUploadFile: result returned for normal file' + outputMap);
			Assert.areEqual(2,outputMap.size(),'Upload should return a map with file and link details');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testUploadFile: exception raised for valid file with record' + e.getMessage());
			Assert.fail('No exception should be raised with valid file and record');
		}

        System.debug('testUploadFile: TEST 2 - testing passing case with no related record ');
		try {
            Map<String,Object> outputMap = dsfrFileUpload_CTL.uploadFile(EncodingUtil.base64Encode(TST_RSC.Body), 'TestUpload', null, null, 'V');
			System.debug('testUploadFile: result returned for normal file' + outputMap);
			Assert.areEqual(1,outputMap.size(),'Upload should return a map with only file details');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testUploadFile: exception raised for valid file without record' + e.getMessage());
			Assert.fail('No exception should be raised with valid file and no record');
		}

        // Testing error cases
        System.debug('testUploadFile: TEST 3 - testing missing name');
		try {
            Map<String,Object> outputMap = dsfrFileUpload_CTL.uploadFile(EncodingUtil.base64Encode(TST_RSC.Body), null, null, null, 'V');
			System.debug(LoggingLevel.ERROR,'testUploadFile: result returned for file with no name ' + outputMap);
            Assert.fail('Exception should be raised with file with no name');
		}
		catch (Exception e) {
			System.debug('testUploadFile: Exception properly raised with file with no name' + e.getMessage());
		}

        System.debug('testUploadFile: TEST 4 - testing wrong content');
		try {
            Map<String,Object> outputMap = dsfrFileUpload_CTL.uploadFile(TST_RSC.Body.toString(), 'TestUpload', null, null, 'V');
			System.debug(LoggingLevel.ERROR,'testUploadFile: result returned for file with bad content ' + outputMap);
            Assert.fail('Exception should be raised with file with bad content');
		}
		catch (Exception e) {
			System.debug('testUploadFile: Exception properly raised with file with bad content' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testUploadFile: END');
	}

	/***
	* @description  Test method for the dsfrFileUpload_CTL class, checking the "uploadVersion" method
	*               including all error cases.
	* @see          dsfrFileUpload_CTL
	***/

	@isTest
	static void testUploadVersion() {
		System.debug('testUploatestUploadVersiondFile: START');

        if (TST_RCD == null) {
            System.debug('testUploadVersion: registering TEST_RCD ');
            TST_RCD = new dsfrTest__c(Name = 'TEST');
            insert TST_RCD;
		    System.debug('testUploadVersion: TEST_RCD inserted ' + TST_RCD);
        }

        // Registering initial content
        System.debug('testUploadVersion: initialising test Content Document ');
		ID contentDocumentId;
		try {
            Map<String,Object> outputMap = dsfrFileUpload_CTL.uploadFile(EncodingUtil.base64Encode(TST_RSC.Body), 'TestUpload', new List<String>{TST_RCD.Id}, null, 'V');
			System.debug('testUploadVersion: result returned for normal file' + outputMap);
			Assert.areEqual(2,outputMap.size(),'Upload should return a map with file and link details');
			System.debug('testUploadVersion: normal file' + outputMap);
			ID contentVersionId = ((ContentVersion)(outputMap.get('file'))).Id;
			System.debug('testUploadVersion: version ID extracted ' + contentVersionId);
			contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersionId][0].ContentDocumentId;
			System.debug('testUploadVersion: document ID fetched ' + contentDocumentId);
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testUploadVersion: exception raised for valid file with record' + e.getMessage());
			Assert.fail('No exception should be raised with valid file and record');
		}

		Test.startTest();

		// Testing passing case
        System.debug('testUploadFile: TEST 1 - testing passing case ');
		try {
            ContentVersion result = dsfrFileUpload_CTL.uploadVersion(EncodingUtil.base64Encode(TST_RSC.Body), 'TestUploadVersion', contentDocumentId);
			System.debug('testUploadVersion: result returned for normal file' + result);
			Assert.areEqual(contentDocumentId,result.contentDocumentId,'File Version Upload should return a version for the same document');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testUploadVersion: exception raised for valid file version upload ' + e.getMessage());
			Assert.fail('No exception should be raised with valid file version');
		}

        // Testing error cases
        System.debug('testUploadVersion: TEST 2 - testing missing content ID');
		try {
            ContentVersion result = dsfrFileUpload_CTL.uploadVersion(EncodingUtil.base64Encode(TST_RSC.Body), 'TestUploadVersion2', null);
			System.debug(LoggingLevel.ERROR,'testUploadVersion: result returned for file with no name ' + result);
            Assert.fail('Exception should be raised with file with no name');
		}
		catch (Exception e) {
			System.debug('testUploadFile: Exception properly raised with file with no name' + e.getMessage());
		}

        System.debug('testUploadFile: TEST 3 - testing wrong content');
		try {
			ContentVersion result = dsfrFileUpload_CTL.uploadVersion(TST_RSC.Body.toString(), 'TestUploadVersion3', contentDocumentId);
			System.debug(LoggingLevel.ERROR,'testUploadFile: result returned for file version with bad content ' + result);
            Assert.fail('Exception should be raised with file version with bad content');
		}
		catch (Exception e) {
			System.debug('testUploadFile: Exception properly raised with file version with bad content' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testUploadFile: END');
	}



	/***
	* @description  Test method for the dsfrFileUpload_CTL class, checking the "linkFile" method
	*               including all error cases.
	* @see          dsfrFileUpload_CTL
	***/

	@isTest
	static void testLinkFile() {
		System.debug('testLinkFile: START');

        if (TST_RCD == null) {
            System.debug('testLinkFile: registering TEST_RCD ');
            TST_RCD = new dsfrTest__c(Name = 'TEST');
            insert TST_RCD;
		    System.debug('testLinkFile: TEST_RCD inserted ' + TST_RCD);
        }

		Test.startTest();

        // Registering test file
        ContentVersion testFile = dsfrFileUpload_CTL.registerFile(EncodingUtil.base64Encode(TST_RSC.Body),'LinkTest',null);
        System.debug('testLinkFile: testFile init ' + testFile);

        // Testing passing case
        System.debug('testLinkFile: TEST 1 - testing passing case');
		try {
            Object outputLink = dsfrFileUpload_CTL.linkFile(testFile.Id,TST_RCD.Id,'V');
			System.debug('testLinkFile: returning link ' + outputLink);
			Assert.isNotNull(outputLink,'Linking correct file should provide link details');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testLinkFile: error raised with correct file ' + e.getMessage());
			Assert.fail('Linking correct file should not raise exception');
		}

        // Testing error case
        System.debug('testLinkFile: TEST 2 - testing missing sharing');
		try {
            Object outputLink = dsfrFileUpload_CTL.linkFile(testFile.Id,TST_RCD.Id,null);
			System.debug(LoggingLevel.ERROR,'testLinkFile: returning link with missing sharing ' + outputLink);
			Assert.fail('Missing sharing property should raise exception');
		}
		catch (Exception e) {
			System.debug('testLinkFile: error properly raised with missing sharing ' + e.getMessage());
		}

        System.debug('testLinkFile: TEST 3 - testing missing recordId');
		try {
            Object outputLink = dsfrFileUpload_CTL.linkFile(testFile.Id,null,'V');
			System.debug(LoggingLevel.ERROR,'testLinkFile: returning link with missing recordId ' + outputLink);
			Assert.fail('Missing recordId property should raise exception');
		}
		catch (Exception e) {
            System.debug('testLinkFile: error properly raised with missing recordId ' + e.getMessage());
		}

        System.debug('testLinkFile: TEST 4 - testing unknown file ID');
        String tmpFileId = 'DUMMY';
		try {
            Object outputLink = dsfrFileUpload_CTL.linkFile(tmpFileId,TST_RCD.Id,'V');
			System.debug(LoggingLevel.ERROR,'testLinkFile: returning link with unknown file ID ' + outputLink);
			Assert.fail('Unknown recordId property should raise exception');
		}
		catch (Exception e) {
            System.debug('testLinkFile: error properly raised with unknown recordId ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testLinkFile: END');
	}

	/***
	* @description  Test method for the dsfrFileUpload_CTL class, checking the "unlinkFile" method
	*               including all error cases.
	* @see          dsfrFileUpload_CTL
	***/

	@isTest
	static void testUnlinkFile() {
		System.debug('testUnlinkFile: START');

        if (TST_RCD == null) {
            System.debug('testUnlinkFile: registering TEST_RCD ');
            TST_RCD = new dsfrTest__c(Name = 'TEST');
            insert TST_RCD;
		    System.debug('testUnlinkFile: TEST_RCD inserted ' + TST_RCD);
        }

		Test.startTest();

        // Registering test file
        ContentVersion testFile = dsfrFileUpload_CTL.registerFile(EncodingUtil.base64Encode(TST_RSC.Body),'LinkTest',null);
        System.debug('testUnlinkFile: testFile init ' + testFile);

		ContentDocumentLink testLink = (ContentDocumentLink) dsfrFileUpload_CTL.linkFile(testFile.Id,TST_RCD.Id,'V');
		System.debug('testUnlinkFile: link init ' + testLink);

        // Testing passing case
        System.debug('testUnlinkFile: TEST 1 - testing passing case');
		try {
            dsfrFileUpload_CTL.unlinkFile(testLink.Id);
			System.debug('testUnlinkFile: unlink properly done');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR,'testUnlinkFile: error raised with correct link ' + e.getMessage());
			Assert.fail('Unlinking correct link should not raise exception');
		}

        // Testing error case
        System.debug('testUnlinkFile: TEST 2 - testing invalid link ID');
		try {
            dsfrFileUpload_CTL.unlinkFile(testLink.Id);
			System.debug(LoggingLevel.ERROR,'testUnlinkFile: unlink done with invalid link ID');
			Assert.fail('Invalid link ID should raise exception');
		}
		catch (Exception e) {
			System.debug('testUnlinkFile: error properly raised with missing sharing ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testUnlinkFile: END');
	}
}