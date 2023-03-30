/***
* @description  Lightning controller to fetch the details of an
*               Experience Site navigation menu.
*               Part of the PEG_LWR package.
* @author       P-E GROS
* @date         Feb 2023
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

public with sharing class dsfrPicklist_CTL {
    /***
    * @description  Simple method to fetch the list of picklist values for a list of picklist fields.
    * @param        fieldList List of picklist fields (as Object.Field)
    * @return       List<Object> List of pickslity values per field
    * @exception    Various exceptions in case of  wrong context.
    ***/

    @AuraEnabled(cacheable=true)
    public static List<Object> getPicklistValues(List<String> fieldList) {
        System.debug('getPicklistValues: START for ' + fieldList);
        if ((fieldList == null) || (fieldList.isEmpty())) {
            System.debug(LoggingLevel.ERROR, 'getPicklistValues: END KO / Missing fieldList ');
            return new List<Object>();
        }

        List<Object> results = new List<Object>();
        for (String iter : fieldList) {
            System.debug('getPicklistValues: processing field ' + iter);
            List<String> iterParts = iter.split('\\.');
            System.debug('getPicklistValues: parts extracted ' + iterParts);
            if (iterParts.size() != 2) {
                System.debug(LoggingLevel.ERROR, 'getPicklistValues: END KO / bad field name structure ' + iter);
                throw new System.AuraHandledException('Invalid field name structure : ' + iter);
            }

            SObjectType iterObj = Schema.getGlobalDescribe().get(iterParts[0]);
            if (iterObj == null) {
                System.debug(LoggingLevel.ERROR, 'getPicklistValues: END KO / bad object name ' + iter);
                throw new System.AuraHandledException('Invalid object name: ' + iter);
            }

            Map<String,Schema.SObjectField> iterFields = iterObj.getDescribe().fields.getMap();
            Schema.SObjectField iterField = iterFields.get(iterParts[1]);
            if (iterField == null) {
                System.debug(LoggingLevel.ERROR, 'getPicklistValues: END KO / bad field name ' + iter);
                throw new System.AuraHandledException('Invalid field name: ' + iter);
            }

            Schema.DescribeFieldResult iterDesc = iterField.getDescribe();
            if ((iterDesc.getType() != Schema.DisplayType.Picklist) && (iterDesc.getType() != Schema.DisplayType.MultiPicklist)) {
                System.debug(LoggingLevel.ERROR, 'getPicklistValues: END KO / non picklist field ' + iter);
                throw new System.AuraHandledException('Non picklist field name: ' + iter);
            }

            List<Schema.PicklistEntry> iterValueDescs = iterDesc.getPicklistValues();
            System.debug('getPicklistValues: picklist values found ' + iterValueDescs);

            Map<String,Object> iterResult = new Map<String,Object>();
            String iterFullName = iterParts[0] + '_' + iterParts[1];
            System.debug('getPicklistValues: iterFullName prepared ' + iterFullName);
            iterResult.put('fullName',iterFullName);
            iterResult.put('name',iterDesc.getName());
            iterResult.put('label',iterDesc.getLabel());
            List<Object> iterValues = new List<Object>();
            for (Schema.PicklistEntry iterValue : iterValueDescs) {
                Map<String,Object> iterMap = new Map<String,Object>();
                iterMap.put('fullName', iterFullName + '_' + (iterValue.getValue()).replace(' ','_'));
                iterMap.put('label',iterValue.getLabel());
                iterMap.put('value',iterValue.getValue());
                iterMap.put('isActive',iterValue.isActive());
                iterValues.add(iterMap);
            }
            iterResult.put('values',iterValues);
            System.debug('getPicklistValues: result prepared ' + iterResult);
            results.add(iterResult);
        }
        System.debug(LoggingLevel.ERROR, 'getPicklistValues: END / with ' + results);
        return results;
    }
}