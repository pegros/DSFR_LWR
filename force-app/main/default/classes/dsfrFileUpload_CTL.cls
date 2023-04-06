public with sharing class dsfrFileUpload_CTL {
   
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
        // ShareType is either 'V', 'C', or 'I'
        // V = Viewer, C = Collaborator, I = Inferred
        newLink.ShareType = sharing;

        System.debug('registerLink: inserting ContentDocumentLink ' + newLink);
        insert newLink;

        System.debug('registerLink: END with ' + newLink);
        return newLink;
    }
}