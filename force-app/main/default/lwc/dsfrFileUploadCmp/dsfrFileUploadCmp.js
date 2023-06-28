import { LightningElement, api } from 'lwc';
import uploadFile from '@salesforce/apex/dsfrFileUpload_CTL.uploadFile';
import userId       from '@salesforce/user/Id';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import UPLOAD_SUCCESS from '@salesforce/label/c.dsfrFileUploadSuccess';
import UPLOAD_COMMENT from '@salesforce/label/c.dsfrFileUploadComment';
import UPLOAD_TYPES from '@salesforce/label/c.dsfrFileUploadTypes';


export default class DsfrFileUploadCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Charger un fichier';
    @api comment;
    @api accept;
    @api contentMeta;
    @api shareMode = 'V';
    @api disabled = false;
    @api wrappingClass;
    @api refreshUser = false;

    @api recordId;
    @api recordIds;
    @api fileId;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    currentUserId = userId;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    isError = false;

    fileName;
    fileContent;

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    uploadSuccess = UPLOAD_SUCCESS;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    get mainClass() {
        return (this.wrappingClass || '') + (this.isError ? ' fr-upload-group fr-input-group--error' : ' fr-upload-group');
    }
    get messageClass() {
        return (this.isError ? 'fr-error-text' : 'fr-valid-text');
    }
    
    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START file upload');
            console.log('connected: label ',this.label);
            console.log('connected: comment ',this.comment);
            console.log('connected: accept ',this.accept);
            console.log('connected: content version metadata ',this.contentMeta);
            console.log('connected: disabled ', this.disabled);
            console.log('connected: refreshUser ', this.refreshUser);
            console.log('connected: currentUserId ', this.currentUserId);
        }
        this.comment = this.comment || UPLOAD_COMMENT;
        this.accept = this.accept || UPLOAD_TYPES;
        if (this.isDebug) {
            console.log('connected: comment reworked ',this.comment);
            console.log('connected: accept reworked ',this.accept);
            console.log('connected: END file upload');
        }
    }

    //-----------------------------------------------------
    // Event handlers
    //-----------------------------------------------------
    handleUpload(event) {
        if (this.isDebug) console.log('handleUpload: START file upload',event);
        this.message = null;

        let fileInput = this.template.querySelector('input.fr-upload');
        
        if (this.isDebug) console.log('handleUpload: files selected ',fileInput.files);
        const selectedFile = fileInput.files[0];
        if (this.isDebug) console.log('handleUpload: file selected ',selectedFile);

        if (!selectedFile) {
            if (this.isDebug) console.log('handleUpload: END / no file selected');
            fileInput.disabled = false;
            return;
        }
        if (this.isDebug) console.log('handleUpload: disabling fileInput ',fileInput);
        fileInput.disabled = true;

        this.fileName = selectedFile.name;
        if (this.isDebug) console.log('handleUpload: fileName registered ',this.fileName);

        let fileReader = new FileReader()
        fileReader.onload = () => {
            if (this.isDebug) console.log('handleUpload: file content loaded',fileReader.result);
            this.fileContent = fileReader.result.split(',')[1];
            if (this.isDebug) console.log('handleUpload: fileContent extracted ', this.fileContent);
            this.registerFile();
            if (this.isDebug) console.log('handleUpload: END file registration requested');
        }
        if (this.isDebug) console.log('handleUpload: fileReader prepared',fileReader);
        fileReader.readAsDataURL(selectedFile)
        if (this.isDebug) console.log('handleUpload: file Content load triggered');
    }

    registerFile() {
        if (this.isDebug) console.log('registerFile: START');

        try {
            let recordIds = [];
            if (this.recordId) {
                if (this.isDebug) console.log('registerFile: registering main recordId ',this.recordId);
                recordIds.push(this.recordId);
            }
            if (this.recordIds) {
                if (this.isDebug) console.log('registerFile: registering other recordIds ',this.recordIds);
                let otherIDs = JSON.parse(this.recordIds);
                recordIds.push(...otherIDs);
            }
            if (this.isDebug) console.log('registerFile: recordIds init ',JSON.stringify(recordIds));

            const uploadData = {
                name: this.fileName,
                content: this.fileContent,
                recordIds: recordIds,
                meta: JSON.parse(this.contentMeta),
                sharing: this.shareMode
            };
            if (this.isDebug) console.log('registerFile: uploadData prepared ', JSON.stringify(uploadData));
            uploadFile(uploadData).then(result => {
                if (this.isDebug) console.log('registerFile: file registered as ', JSON.stringify(result));
                this.fileContent = null;
                //this.message =  this.fileName + ' file uploaded successfully!';
                this.message = this.uploadSuccess.replace('{0}', this.fileName);
                this.isError =  false;

                if (recordIds && recordIds.length > 0) {
                    if (this.isDebug) console.log('registerFile: handling record data reload ',JSON.stringify(recordIds));
                    let recordIdList = [];
                    recordIds.forEach(item => {recordIdList.push({recordId: item})});
                    if (this.refreshUser && this.currentUserId) {
                        if (this.isDebug) console.log('registerFile: registering user for reload ',this.currentUserId);
                        recordIdList.push({recordId: this.currentUserId});
                    }
                    else {
                        if (this.isDebug) console.log('registerFile: Ignoring User / refreshUser ',this.refreshUser);
                        if (this.isDebug) console.log('registerFile: currentUserId ',this.currentUserId);
                    }
                    if (this.isDebug) console.log('registerFile: triggering reload on recordIdList ',JSON.stringify(recordIdList));
                    notifyRecordUpdateAvailable(recordIdList);
                }
                
                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
                fileInput.disabled = false;

                if (this.isDebug) console.log('registerFile: END');
            }).catch(error => {
                console.warn('registerFile: upload failed',error);
                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
                fileInput.disabled = false;
                console.warn('registerFile: END KO / upload failed ',JSON.stringify(error));
                //this.message = JSON.stringify(error);
                this.message = (error.body?.message || error.statusText || 'Erreur technique');
                this.isError = true;
            });
            if (this.isDebug) console.log('registerFile: upload triggered');
        }
        catch (error) {
            let fileInput = this.template.querySelector('input.fr-upload');
            if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
            fileInput.disabled = false;
            console.warn('registerFile: END KO / upload failed ',JSON.stringify(error));
            //this.message = JSON.stringify(error);
            this.message = (error.body?.message || error.statusText || 'Erreur technique');
            this.isError = true;
        }
    }
}