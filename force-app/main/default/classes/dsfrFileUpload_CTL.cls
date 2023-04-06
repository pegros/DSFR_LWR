/***
* @description  Lightning controller to manage related files within an
*               Experience Site.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         April 2023
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

public with sharing class dsfrFileUpload_CTL {
   
    /***
    * @description  Method to upload base64 content as a new ContentDocument and 
    *               automatically link it to a record (as new ContentDocumentLink).
    * @param        content     File content encoded in Base64
    * @param        name        Name of the ContentDocument to be created 
    * @param        recordId    ID of the record to which the new ContentDocument should be linked 
    * @param        meta        List of field values to be set on the created ContentDocument.
    * @param        sharing     Sharing mode to be set for the link (should be 'V' (Viewer), 'C' (Collaborator) or 'I' (Inferred))
    * @return       Map<String,Object>  Map with details about the ContentVersion (file) and the 
    *                                   ContentDocumentLink (link) created
    * @exception    Various exceptions in case of wrong context or execution failure.
    ***/
    @AuraEnabled
    public static Map<String,Object> uploadFile(final String content, final String name, final String recordId, final Object meta, final String sharing) {
        System.debug('uploadFile: START for file ' + name);
        System.debug('uploadFile: for record ID ' + recordId);
        System.debug('uploadFile: with meta ' + meta);
        System.debug('uploadFile: and content ' + content);

        Map<String,Object> result = new Map<String,Object>();
        ContentVersion newFile;
        try {
            newFile = registerFile(content, name, meta);
            System.debug('uploadFile: new File init ' + newFile);
            result.put('file',newFile);
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR, 'uploadFile: END KO / file registration failure ' + e);
            throw new System.AuraHandledException('File registration failure');
        }

        try {
            ContentDocumentLink newLink = registerLink(newFile.Id, recordId, sharing);
            System.debug('uploadFile: new Link init ' + newLink);
            if (newLink != null) {
                result.put('link',newLink);
            }
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR, 'uploadFile: END KO / link registration failure ' + e);
            throw new System.AuraHandledException('File Link registration failure');
        }

        System.debug('uploadFile: END with ' + result);
        return result;
    }
  
    /***
    * @description  Method to register a new ContentDocumentLink between a ContentDocument and 
    *               a record.
    * @param        fileId      ID of the ContentVersion record
    * @param        recordId    ID of the record to which the new ContentDocument should be linked 
    * @param        sharing     Sharing mode to be set for the link (should be 'V' (Viewer), 'C' (Collaborator) or 'I' (Inferred))
    * @return       Object      ContentDocumentLinkcreated
    * @exception    Various exceptions in case of wrong context or execution failure.
    ***/
    @AuraEnabled
    public static Object linkFile(final String fileId, final String recordId, final String sharing) {
        System.debug('linkFile: START for file ID ' + fileId);
        System.debug('linkFile: for record ID ' + recordId);
        System.debug('linkFile: and sharing ' + sharing);

        try {
            ContentDocumentLink newLink = registerLink(fileId, recordId, sharing);            
            System.debug('linkFile: END with ' + newLink);
            return newLink;
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR, 'linkFile: END KO / link registration failure ' + e);
            throw new System.AuraHandledException('File Link registration failure');
        }
    }


    /***
    * @description  Utility method to build and insert a new ContentVersion.
    * @param        content     File content encoded in Base64
    * @param        name        Name of the ContentDocument to be created 
    * @param        meta        List of field values to be set on the created ContentDocument.
    * @return       ContentVersion  Created record
    * @exception    Various exceptions in case of  wrong context.
    ***/
    private static ContentVersion registerFile(final String content, final String name, final Object meta) {
        System.debug('registerFile: START for ' + name);

        ContentVersion newFile = new ContentVersion();
        newFile.VersionData = EncodingUtil.base64Decode(content);
        newFile.Title = name;
        newFile.PathOnClient = name;

        Map<Object,Object> metaMap = (Map<Object,Object>) meta;
        for(Object iter : metaMap.keySet()) {
            System.debug('registerFile: adding meta field ' + iter);
            newFile.put((String)iter,metaMap.get(iter));
        }

        System.debug('registerFile: inserting ContentVersion ' + newFile);
        insert newFile;

        System.debug('registerFile: END with ' + newFile);
        return newFile;
    }

    /***
    * @description  Utility method to build and insert a new ContentDocumentLink.
    * @param        fileId      ID of the ContentVersion record to be linked 
    * @param        recordId    ID of the record to which the new ContentDocument should be linked 
    * @param        sharing     Sharing mode to be set for the link (should be 'V' (Viewer), 'C' (Collaborator) or 'I' (Inferred))
    * @return       ContentDocumentLink  Created record
    * @exception    Various exceptions in case of  wrong context.
    ***/
    private static ContentDocumentLink registerLink(final String fileId, final String recordId, final String sharing) {
        System.debug('registerLink: START for file ' + fileId);
        System.debug('registerLink: and record ' + recordId);
        System.debug('registerLink: with sharing ' + sharing);

        if (String.IsBlank(sharing)) {
            System.debug(LoggingLevel.ERROR, 'uploadFile: END KO / missing sharing mode ');
            throw new System.StringException('Missing Sharing mode for file');
        }

        if (recordId == null) {
            System.debug('registerLink: END / no link to register');
            return null;
        }

        ContentDocumentLink newLink = new ContentDocumentLink();
        newLink.ContentDocumentId = [   SELECT ContentDocumentId 
                                        FROM ContentVersion 
                                        WHERE Id =: fileId    ].ContentDocumentId;
        newLink.LinkedEntityId = recordId;
        newLink.ShareType = sharing;

        System.debug('registerLink: inserting ContentDocumentLink ' + newLink);
        insert newLink;

        System.debug('registerLink: END with ' + newLink);
        return newLink;
    }
}