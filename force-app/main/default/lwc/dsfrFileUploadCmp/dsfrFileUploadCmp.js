import { LightningElement, api, wire } from 'lwc';
import uploadFile       from '@salesforce/apex/dsfrFileUpload_CTL.uploadFile';
import uploadVersion    from '@salesforce/apex/dsfrFileUpload_CTL.uploadVersion';
import userId           from '@salesforce/user/Id';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import basePathName     from '@salesforce/community/basePath';
import getNetworkInfos  from '@salesforce/apex/dsfrFileUpload_CTL.getNetworkInfos';

import UPLOAD_SUCCESS   from '@salesforce/label/c.dsfrFileUploadSuccess';
import UPLOAD_COMMENT   from '@salesforce/label/c.dsfrFileUploadComment';
import UPLOAD_TYPES     from '@salesforce/label/c.dsfrFileUploadTypes';
import UPLOAD_SIZE      from '@salesforce/label/c.dsfrFileUploadSize';
import UPLOAD_SIZE_ERROR from '@salesforce/label/c.dsfrFileUploadSizeError';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';
export default class DsfrFileUploadCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Charger un fichier';
    @api comment;
    @api tag; // for GA4 tracking
    @api accept;
    @api maxSize;
    @api contentMeta;
    @api shareMode = 'I';
    @api disabled = false;
    @api wrappingClass;
    @api refreshUser = false;

    @api recordId;
    @api recordIds;
    @api fileId;

    @api doRefresh;
    @api doNotify = false;

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

    @wire(MessageContext)
    messageContext;

    networkData;
    @wire(getNetworkInfos,{})
    wiredNetworkData({data,error}) {
        if (this.isDebug) console.log('wiredNetworkData: START for File Upload');
        if (data) {
            if (this.isDebug) console.log('wiredNetworkData: data received ', JSON.stringify(data));
            this.networkData = data;

            this.accept = this.accept || this.networkData.AllowedExtensions || UPLOAD_TYPES;
            if (this.isDebug) console.log('wiredNetworkData: accept reworked ',this.accept);

            this.maxSize = (this.maxSize * 1024 || this.networkData.MaxFileSizeKb || parseInt(UPLOAD_SIZE) * 1024) * 1024;
            if (this.isDebug) console.log('wiredNetworkData: maxSize reworked ',this.maxSize);

            if (this.isDebug) console.log('wiredNetworkData: END for File Upload');
        }
        else if (error) {
            this.accept = this.accept || UPLOAD_TYPES;
            if (this.isDebug) console.log('wiredNetworkData: accept reworked ',this.accept);

            this.maxSize = (this.maxSize * 1024 || parseInt(UPLOAD_TYPES) * 1024) * 1024;
            if (this.isDebug) console.log('wiredNetworkData: maxSize reworked ',this.maxSize);

            console.error('wiredNetworkData: END KO for File Upload / error raised ', error);
        }
        else {
            console.warn('wiredNetworkData: END OK for File Upload / no data fetched');
        }
    };

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
            console.log('connected: START file upload ',this.label);
            console.log('connected: comment ',this.comment);
            console.log('connected: accept ',this.accept);
            console.log('connected: content version metadata ',this.contentMeta);
            console.log('connected: disabled ', this.disabled);
            console.log('connected: refreshUser ', this.refreshUser);
            console.log('connected: currentUserId ', this.currentUserId);
            console.log('connected: doNotify ', this.doNotify);
        }
        this.comment = this.comment || UPLOAD_COMMENT;
        this.tag = this.tag || this.label || 'Undefined';
        if (this.isDebug) {
            console.log('connected: tag evaluated ', this.tag);
            console.log('connected: comment reworked ',this.comment);
            console.log('connected: END file upload');
        }
    }

    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------
    // Parent action execution service (for Action Handler parent component, no merge done)
    @api doUpload() {
        if (this.isDebug) console.log('doUpload: START for document ID ', this.fileId);
        if (this.isDebug) console.log('doUpload: with accepted extensions ', this.accept);
        if (this.isDebug) console.log('doUpload: and showAlerts ', this.showAlerts);

        let fileInput = this.template.querySelector('input.fr-upload');
        if (this.isDebug) console.log('doUpload: file upload input found',fileInput);

        if (fileInput) {
            if (this.isDebug) console.log('doUpload: clicking file input');
            fileInput.click();
        }
        if (this.isDebug) console.log('doUpload: END');
    }

    @api reset() {
        if (this.isDebug) console.log('reset: START for FileUpload');
        this.message = null;
        this.isError = false;
        let fileInput = this.template.querySelector('input.fr-upload');
        if (this.isDebug) console.log('reset: fileInput input found ',fileInput);
        /*if (fileInput) {
            if (this.isDebug) console.log('reset: resetting input');
            fileInput.reset();
        }*/
        if (this.isDebug) console.log('reset: END for FileUpload');
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
        else if (selectedFile.size > this.maxSize) {
            if (this.isDebug) console.log('handleUpload: max size is ', this.maxSize);
            console.warn('handleUpload: END / file selected too large ',selectedFile.size);
            this.message = UPLOAD_SIZE_ERROR;
            this.isError = true;
            fileInput.disabled = false;
            return;
        }
        if (this.isDebug) console.log('handleUpload: disabling fileInput ',fileInput);
        fileInput.disabled = true;

        if (this.isDebug) console.log('handleUpload: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_submit',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:(this.fileId ? 'upload_version' : 'upload_file'),event_label:this.tag}}}));

        this.fileName = selectedFile.name;
        if (this.isDebug) console.log('handleUpload: fileName registered ',this.fileName);

        let fileReader = new FileReader();
        fileReader.onload = () => {
            if (this.isDebug) console.log('handleUpload: file content loaded',fileReader.result);
            this.fileContent = fileReader.result.split(',')[1];
            if (this.isDebug) console.log('handleUpload: fileContent extracted ', this.fileContent);
            if (this.fileId) {
                if (this.isDebug) console.log('handleUpload: requesting new version upload');
                this.uploadVersion();
                if (this.isDebug) console.log('handleUpload: END / new version uploaded');
            }
            else {
                if (this.isDebug) console.log('handleUpload: requesting new file registration');
                this.registerFile();
                if (this.isDebug) console.log('handleUpload: END / new file registered');
            }
        }
        if (this.isDebug) console.log('handleUpload: fileReader prepared',fileReader);
        fileReader.readAsDataURL(selectedFile)
        if (this.isDebug) console.log('handleUpload: file Content load triggered');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
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
                let otherIDs = JSON.parse(this.recordIds).filter((item) => item);
                recordIds.push(...otherIDs);
            }
            if (this.isDebug) console.log('registerFile: recordIds init ',JSON.stringify(recordIds));

            const uploadData = {
                name: this.fileName,
                content: this.fileContent,
                recordIds: recordIds,
                sharing: this.shareMode
            };
            if (this.contentMeta) {
                uploadData.meta = JSON.parse(this.contentMeta);
            }
            if (this.isDebug) console.log('registerFile: uploadData prepared ', JSON.stringify(uploadData));
            uploadFile(uploadData).then(result => {
                if (this.isDebug) console.log('registerFile: file registered as ', JSON.stringify(result));
                this.fileContent = null;
                //this.message =  this.fileName + ' file uploaded successfully!';
                //this.message = this.uploadSuccess.replace('{0}', this.fileName);
                this.message = UPLOAD_SUCCESS.replace('{0}', this.fileName);
                this.isError =  false;

                if (this.isDebug) console.log('registerFile: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_success',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:'upload_file',event_label:this.tag}}}));

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

                if (this.doRefresh) {
                    if (this.isDebug) console.log('registerFile: Triggering refresh');
                    let actionNotif = {
                        channel: "dsfrRefresh",
                        action: {"type": "done","params": {"type": "refresh"}},
                        context: null
                    };
                    if (this.isDebug) console.log('registerFile: actionNotif prepared ',JSON.stringify(actionNotif));
                    publish(this.messageContext, sfpegCustomNotification, actionNotif);
                    if (this.isDebug) console.log('registerFile: page refresh notification published');
                }
                else {
                    if (this.isDebug) console.log('registerFile: not refreshing');
                }
                
                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
                fileInput.disabled = false;            
                if (this.isDebug) console.log('registerFile: resetting fileInput ',fileInput);    
                fileInput.value = null;
                if (this.isDebug) console.log('registerFile: END');
            }).catch(error => {
                console.warn('registerFile: upload failed',JSON.stringify(error));

                if (this.isDebug) console.log('registerFile: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_error',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:'upload_file',event_label:this.tag}}}));

                let fileInput = this.template.querySelector('input.fr-upload');
                if (this.isDebug) console.log('registerFile: reactivating fileInput ',fileInput);
                fileInput.disabled = false;
                if (this.isDebug) console.log('registerFile: resetting fileInput ',fileInput);
                fileInput.value = null;
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

            if (this.isDebug) console.log('registerFile: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_error',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:'upload_file',event_label:this.tag}}}));

            console.warn('registerFile: END KO / upload failed ',JSON.stringify(error));
            //this.message = JSON.stringify(error);
            this.message = (error.body?.message || error.statusText || 'Erreur technique');
            this.isError = true;
        }
    }

    uploadVersion() {
        if (this.isDebug) console.log('uploadVersion: START for document ID ',this.fileId);
    
        const uploadData = {
            name: this.fileName,
            content: this.fileContent,
            documentId: this.fileId
        };
        if (this.isDebug) console.log('uploadVersion: uploadData prepared ', JSON.stringify(uploadData));

        uploadVersion(uploadData)
        .then(result => {
            if (this.isDebug) console.log('uploadVersion: version uploaded as ', JSON.stringify(result));
            this.fileContent = null;
            this.message = UPLOAD_SUCCESS.replace('{0}', this.fileName);
            this.isError =  false;

            if (this.isDebug) console.log('registerFile: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_success',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:'upload_version',event_label:this.tag}}}));

            if (this.doRefresh) {
                if (this.isDebug) console.log('uploadVersion: Triggering refresh');
                let actionNotif = {
                    channel: "dsfrRefresh",
                    action: {"type": "done","params": {"type": "refresh"}},
                    context: null
                };
                if (this.isDebug) console.log('uploadVersion: actionNotif prepared ',JSON.stringify(actionNotif));
                publish(this.messageContext, sfpegCustomNotification, actionNotif);
                if (this.isDebug) console.log('uploadVersion: page refresh notification published');
            }
    
            let fileInput = this.template.querySelector('input.fr-upload');
            if (this.isDebug) console.log('uploadVersion: reactivating fileInput ',fileInput);
            fileInput.disabled = false;

            if (this.doNotify) {
                let alertConfig = {
                    alerts:[{type: "success", title: "Opération effectuée", message: this.message}],
                    size:'small'};
                if (this.isDebug) console.log('uploadVersion: END / notifying completion status ', JSON.stringify(alertConfig));
                this.dispatchEvent(new CustomEvent('complete',{ detail: alertConfig}));
            }
            else {
                if (this.isDebug) console.log('uploadVersion: END / no popup');
            }
        })
        .catch(error => {
            console.warn('uploadVersion: upload failed',error);
            let fileInput = this.template.querySelector('input.fr-upload');
            if (this.isDebug) console.log('uploadVersion: reactivating fileInput ',fileInput);
            fileInput.disabled = false;
            
            if (this.isDebug) console.log('registerFile: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_upload_error',params:{event_source:'dsfrFileUploadCmp',event_site: basePathName,event_category:'upload_version',event_label:this.tag}}}));

            if (this.doNotify) {
                let alertConfig = {alerts:[],size:'small'};
                if (error.body?.output?.errors) {
                    alertConfig.header = error.body?.message;
                    error.body.output.errors.forEach(item => {
                        alertConfig.alerts.push({type:'error', message: item.message});
                    })
                }
                else {
                    alertConfig.alerts.push({type:'error', message: (error.body?.message || error.statusText)});
                }
                if (this.isDebug) console.log('uploadVersion: END / notifying completion error ', JSON.stringify(alertConfig));
                this.dispatchEvent(new CustomEvent('complete',{ detail: alertConfig}));
            }
            else {
                console.warn('uploadVersion: END KO / upload failed ',JSON.stringify(error));
                this.message = (error.body?.message || error.statusText || 'Erreur technique');
                this.isError = true;
            }
        });
        if (this.isDebug) console.log('uploadVersion: upload triggered');
    }
}