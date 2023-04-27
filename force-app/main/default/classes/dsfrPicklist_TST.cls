/***
* @description  Test class for the dsfrPicklist_CTL class.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         April 2023
* @see          dsfrPicklist_CTL
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
public class  dsfrPicklist_TST {

	/***
	* @description  Test method for the dsfrPicklist_CTL class, checking the "getPicklistValues" method
	*               including all error cases.
	* @see          dsfrPicklist_CTL
	***/

	@isTest
	static void testGetPicklistValues() {
		System.debug('testGetPicklistValues: START');
		Test.startTest();

        List<String> inputList;
        List<Object> outputList;
        // Passing Cases
        System.debug('testGetPicklistValues: TEST 1 - testing null input');
		try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
            System.debug('testGetPicklistValues: returning ' + outputList);
			Assert.areEqual(0,outputList?.size(),'Empty picklist list should be returned in case of null input');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetPicklistValues: Null input should not raise exception but return empty list ' + e.getMessage());
            Assert.fail('Null input should not raise exception but return empty list');
		}

        inputList = new List<String>{'Opportunity.StageName','Case.Status'};
        System.debug('testGetPicklistValues: TEST 2 - testing standard valid input ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
            System.debug('testGetPicklistValues: returning ' + outputList);
			Assert.areEqual(inputList.size(),outputList?.size(),'Returned picklist list should contain as many values as the correct input');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetPicklistValues: Correct input should not raise exception ' + e.getMessage());
            Assert.fail('Correct input should not raise exception');
		}

        // Error Cases
        inputList = new List<String>{'DUMMY'};
        System.debug('testGetPicklistValues: TEST 3 - testing invalid picklist name structure ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
			System.debug(LoggingLevel.Error,'testGetPicklistValues: no exception raised for invalid picklist name' + outputList);
			Assert.fail('Exception should be raised in case of invalid picklist name');
		}
		catch (Exception e) {
			System.debug('testGetPicklistValues: Exception properly raised in case of invalid picklist name ' + e.getMessage());
		}

        inputList = new List<String>{'Opportunity.StageName','DummyName'};
        System.debug('testGetPicklistValues: TEST 4 - testing invalid picklist name structure ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
			System.debug(LoggingLevel.Error,'testGetPicklistValues: no exception raised for invalid picklist name' + outputList);
			Assert.fail('Exception should be raised in case of invalid picklist name');
		}
		catch (Exception e) {
			System.debug('testGetPicklistValues: Exception properly raised in case of invalid picklist name ' + e.getMessage());
		}

        inputList = new List<String>{'Opportunity.StageName','DummyObject.DummyField'};
        System.debug('testGetPicklistValues: TEST 5 - testing invalid Object name ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
			System.debug(LoggingLevel.Error,'testGetPicklistValues: no exception raised for invalid Object name' + outputList);
			Assert.fail('Exception should be raised in case of invalid Object name');
		}
		catch (Exception e) {
			System.debug('testGetPicklistValues: Exception properly raised in case of invalid Object name ' + e.getMessage());
		}

        inputList = new List<String>{'Opportunity.StageName','Opportunity.DummyField'};
        System.debug('testGetPicklistValues: TEST 6 - testing invalid Field name ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
			System.debug(LoggingLevel.Error,'testGetPicklistValues: no exception raised for invalid Field name' + outputList);
			Assert.fail('Exception should be raised in case of invalid Field name');
		}
		catch (Exception e) {
			System.debug('testGetPicklistValues: Exception properly raised in case of invalid Field name ' + e.getMessage());
		}

        inputList = new List<String>{'Opportunity.StageName','Opportunity.Name'};
        System.debug('testGetPicklistValues: TEST 7 - testing non picklist Field name ' + inputList);
        try {
			outputList = dsfrPicklist_CTL.getPicklistValues(inputList);
			System.debug(LoggingLevel.Error,'testGetPicklistValues: no exception raised for non picklist Field name' + outputList);
			Assert.fail('Exception should be raised in case of non picklist Field name');
		}
		catch (Exception e) {
			System.debug('testGetPicklistValues: Exception properly raised in case of non picklist Field name ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetPicklistValues: END');
	}

}