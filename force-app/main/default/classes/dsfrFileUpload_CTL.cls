/***
* @description  Lightning controller to manage related files within an
*               Experience Site.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         April 2023
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

public with sharing class dsfrFileUpload_CTL {
   
    /***
    * @description  Method to upload base64 content as a new ContentDocument and 
    *               automatically link it to a record (as new ContentDocumentLink).
    * @param        content     File content encoded in Base64
    * @param        name        Name of the ContentDocument to be created 
    * @param        recordIds   List of IDs of the records to which the new ContentDocument should be linked 
    * @param        meta        List of field values to be set on the created ContentDocument.
    * @param        sharing     Sharing mode to be set for the link (should be 'V' (Viewer), 'C' (Collaborator) or 'I' (Inferred))
    * @return       Map<String,Object>  Map with details about the ContentVersion (file) and the 
    *                                   ContentDocumentLink (link) created
    * @exception    Various exceptions in case of wrong context or execution failure.
    ***/
    @AuraEnabled
    public static Map<String,Object> uploadFile(final String content, final String name, final List<String> recordIds, final Object meta, final String sharing) {
        System.debug('uploadFile: START for file ' + name);
        System.debug('uploadFile: for record ID ' + recordIds);
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
            throw new System.AuraHandledException(Label.dsfrFileUploadRegistrationFailure);// 'File registration failure'
        }

        
        try {
            list<ContentDocumentLink> newLinks = registerLinks(newFile.Id, recordIds, sharing);
            System.debug('uploadFile: new Links init ' + newLinks);
            if (newLinks != null) {
                result.put('links',newLinks);
            }
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR, 'uploadFile: END KO / link registration failure ' + e);
            throw new System.AuraHandledException(Label.dsfrFileUploadLinkFailure);
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
            List<ContentDocumentLink> newLinks = registerLinks(fileId, new List<String>{recordId}, sharing);            
            System.debug('linkFile: END with ' + newLinks);
            return newLinks[0];
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR, 'linkFile: END KO / link registration failure ' + e);
            throw new System.AuraHandledException(Label.dsfrFileUploadLinkFailure); //  'File Link registration failure'
        }
    }

    /***
    * @description  Method to remove a new ContentDocumentLink between a ContentDocument and 
    *               a record.
    * @param        linkId      ID of the ContentDocumentLink record
    * @exception    Various exceptions in case of wrong context or execution failure.
    ***/
    @AuraEnabled
    public static void unlinkFile(final String linkId) {
        System.debug('unlinkFile: START for link ID ' + linkId);

        try {
            Database.DeleteResult deleteResult = database.delete((ID)linkId,true);
            System.debug('unlinkFile: link deleted with status ' +  deleteResult);

            System.debug('unlinkFile: END OK');
            return;
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR, 'unlinkFile: END KO / deletion failure ' + e.getMessage());
            throw new System.AuraHandledException(Label.dsfrFileUploadUnlinkFailure);
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
    @testVisible
    private static ContentVersion registerFile(final String content, final String name, final Object meta) {
        System.debug('registerFile: START for ' + name);

        ContentVersion newFile = new ContentVersion();
        newFile.VersionData = EncodingUtil.base64Decode(content);
        newFile.Title = name.left(name.lastIndexOf('.'));
        newFile.PathOnClient = name;

        if (meta != null) {
            Map<Object,Object> metaMap = (Map<Object,Object>) meta;
            for(Object iter : metaMap.keySet()) {
                System.debug('registerFile: adding meta field ' + iter);
                newFile.put((String)iter,metaMap.get(iter));
            }
        }
        else {
            System.debug('registerFile: no meta provided');
        }

        System.debug('registerFile: inserting ContentVersion ' + newFile);
        insert newFile;

        System.debug('registerFile: END with ' + newFile);
        return newFile;
    }

    /***
    * @description  Utility method to build and insert a new ContentDocumentLink.
    * @param        fileId      ID of the ContentVersion record to be linked 
    * @param        recordIds   List of IDs of the records to which the new ContentDocument should be linked 
    * @param        sharing     Sharing mode to be set for the link (should be 'V' (Viewer), 'C' (Collaborator) or 'I' (Inferred))
    * @return       ContentDocumentLink  Created record
    * @exception    Various exceptions in case of  wrong context.
    ***/
    private static List<ContentDocumentLink> registerLinks(final String fileId, final List<String> recordIds, final String sharing) {
        System.debug('registerLinks: START for file ' + fileId);
        System.debug('registerLinks: and record ' + recordIds);
        System.debug('registerLinks: with sharing ' + sharing);

        if (String.IsBlank(sharing)) {
            System.debug(LoggingLevel.ERROR, 'registerLinks: END KO / missing sharing mode ');
            throw new System.StringException('Missing Sharing mode for file');
        }

        if ((recordIds == null) || (recordIds.isEmpty())) {
            System.debug('registerLinks: END / no link to register');
            return null;
        }

        ContentVersion fileCV;
        System.debug('registerLinks: fetching ContentDocument Id ');
        try {
            fileCV = [  SELECT ContentDocumentId
                        FROM ContentVersion 
                        WHERE Id =: fileId
                        LIMIT 1];
        }
        catch( Exception e) {
            System.debug(LoggingLevel.ERROR, 'registerLinks: END KO / file fetch failed ' + e.getMessage());
            throw new System.StringException('File retrieval failed ' + e.getMessage());
        }
        System.debug('registerLinks: file ContentDocument Id fetched ' + fileCV);

        List<ContentDocumentLink> newLinks = new List<ContentDocumentLink>();
        for (String iterId : recordIds) {
            System.debug('registerLinks: linking file to record ID ' + iterId);
            ContentDocumentLink newLink = new ContentDocumentLink();
            newLink.ContentDocumentId = fileCV.ContentDocumentId;
            newLink.LinkedEntityId = iterId;
            newLink.ShareType = sharing;
            newLink.Visibility = 'AllUsers'; // Default value for CustomerCommunity users, enforced also for tests by internal users 
            newLinks.add(newLink);
        }

        System.debug('registerLinks: inserting ContentDocumentLinks ' + newLinks);
        insert newLinks;

        System.debug('registerLinks: END with ' + newLinks);
        return newLinks;
    }
}