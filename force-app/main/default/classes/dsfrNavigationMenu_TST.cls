/***
* @description  Test class for the dsfrNavigationMenu_CTL class.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         April 2023
* @see          dsfrNavigationMenu_CTL
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
public class  dsfrNavigationMenu_TST {

	/***
	* @description  Test method for the dsfrNavigationMenu_CTL class, checking the "getNavigations" method
	*               including all error cases.
	* @see          dsfrNavigationMenu_CTL
	***/

	@isTest
	static void testGetNavigations() {
		System.debug('testGetNavigations: START');
		Test.startTest();

        List<Object> inputList;
        Map<String,List<ConnectApi.NavigationMenuItem>> outputMap;

        // Passing Cases
        System.debug('testGetNavigations: TEST 1 - testing null input');
        inputList = new List<Object>();
        Map<Object,Object> menu1 = new Map<Object,Object>();
        menu1.put('label','Menu with Home');
        menu1.put('showHome',true);
        inputList.add(menu1);
        Map<Object,Object> menu2 = new Map<Object,Object>();
        menu2.put('label','Menu without Home');
        menu2.put('showHome',false);
        inputList.add(menu2);
        //inputList.add(new Map<Object,Object>('label' => 'Menu with Home', 'showHome' => true));
        //inputList.add(new Map<Object,Object>('label' => 'Menu without Home', 'showHome' => false));
        //(List<Object>) JSON.deserializeUntyped('[{"label":"Menu with Home","showHome":true},{"label":"Menu without Home","showHome":false}]');
        System.debug('testGetNavigations: inputList init ' + inputList);

		try {
			outputMap = dsfrNavigationMenu_CTL.getNavigations(inputList,'UserId');
            System.debug('testGetNavigations: returning ' + outputMap);
			Assert.areEqual(inputList.size(),outputMap?.size(),'Returned Menu Map should contain as many values as the correct input');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetNavigations: Correct input should not raise exception ' + e.getMessage());
            Assert.fail('Null input should not raise exception but return empty list');
		}

        // Error Cases
        System.debug('testGetNavigations: TEST 2 - testing when no menu provided ');
        try {
			outputMap = dsfrNavigationMenu_CTL.getNavigations(null,null);
			System.debug(LoggingLevel.ERROR,'testGetNavigations: no exception raised when no menu provided ' + outputMap);
			Assert.fail('Exception should be raised when no menu provided');
		}
		catch (Exception e) {
			System.debug('testGetNavigations: Exception properly raisedwhen no menu provided ' + e.getMessage());
		}

        System.debug('testGetNavigations: TEST 3 - testing when no networkId available ');
        try {
			outputMap = dsfrNavigationMenu_CTL.getNavigations(inputList,null);
			System.debug(LoggingLevel.ERROR,'testGetNavigations: no exception raised when no networkId available' + outputMap);
			Assert.fail('Exception should be raised when no networkId available');
		}
		catch (Exception e) {
			System.debug('testGetNavigations: Exception properly raised when no networkId available ' + e.getMessage());
		}

        inputList = new List<Object>();
        menu1 = new Map<Object,Object>();
        menu1.put('label','NONE');
        menu1.put('showHome',true);
        inputList.add(menu1);
        //inputList.add(new Map<Object,Object>('label' => 'NONE', 'showHome' => true));
        //inputList = (List<Object>) JSON.deserializeUntyped('[{"label":"NONE","showHome":true}]');
        System.debug('testGetNavigations: TEST 4 - testing no valid menu name ' + inputList);
        try {
			outputMap = dsfrNavigationMenu_CTL.getNavigations(inputList,'UserId');
			System.debug(LoggingLevel.ERROR,'testGetNavigations: no exception raised when no valid menu name' + outputMap);
			Assert.fail('Exception should be raised when no valid menu name');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetConfiguration: Exception properly raised when no valid menu name ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetConfiguration: END');
	}
}