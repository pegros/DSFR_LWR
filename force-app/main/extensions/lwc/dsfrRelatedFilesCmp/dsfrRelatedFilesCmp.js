import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import userId from '@salesforce/user/Id';
import unlinkFile from '@salesforce/apex/dsfrFileUpload_CTL.unlinkFile';
import DOWNLOAD_TITLE from '@salesforce/label/c.dsfrRelatedFilesDownloadTitle';
import UPLOAD_TITLE from '@salesforce/label/c.dsfrRelatedFilesUploadTitle';
import DELETE_TITLE from '@salesforce/label/c.dsfrRelatedFilesDeleteTitle';


export default class DsfrRelatedFilesCmp extends NavigationMixin(LightningElement)  {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label;
    @api configName;
    @api showUpload = false;
    @api showDelete = false;
    @api disabled = false;

    _listContext;
    @api 
    get listContext() {
        return this._listContext;
    }
    set listContext(value) {
        let listContext;
        try {
            if (this.isDebug) console.log('set listContext: value provided ', JSON.stringify(value));
            listContext = JSON.parse(value);
            if (this.isDebug) console.log('set listContext: value parsed ', JSON.stringify(listContext));
        }
        catch(error) {
            console.warn('set listContext: value parsing failed ', error);
            this._listContext = null;
            return;
        }
        this._listContext = listContext;
        if (this.isDebug) console.log('set listContext: value set ', JSON.stringify(this._listContext));
    }
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;
    fileList;

    isReady = false;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    downloadTitle = DOWNLOAD_TITLE;
    uploadTitle = UPLOAD_TITLE;
    deleteTitle = DELETE_TITLE;


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for related files');
            console.log('connected: configName ', this.configName);
            console.log('connected: listContext ', this.listContext);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: showUpload? ', this.showUpload);
            console.log('connected: showDelete? ', this.showDelete);
            console.log('connected: END for related files');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for related files',event);
        this.fileList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: file list registered',JSON.stringify(this.fileList));
        this.isReady = true;
        if (this.isDebug) console.log('handleRecordLoad: END for related files');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------

    handleDownload(event){
        if (this.isDebug) console.log('handleDownload: START',event);

        event.preventDefault();

        let fileId = event.srcElement?.name;
        if (this.isDebug) console.log('handleDownload: fileId determined ', fileId);

        let pageRef = {
            type: 'standard__webPage',
            attributes: {
                url: '/sfc/servlet.shepherd/document/download/' + fileId
            }
        };
        if (this.isDebug) console.log('handleDownload: opening pageRef ', pageRef);

        this[NavigationMixin.Navigate](pageRef, false);

        if (this.isDebug) console.log('handleDownload: END');
    }

    handleUnlink(event){
        if (this.isDebug) console.log('handleUnlink: START',event);

        event.preventDefault();

        let linkId = event.srcElement?.name;
        if (this.isDebug) console.log('handleUnlink: linkId determined ', linkId);

        unlinkFile({linkId: linkId})
            .then(() => {
                if (this.isDebug) console.log('handleUnlink: file unlinked');

                let listCmp = this.template.querySelector("c-sfpeg-list-cmp");
                if (this.isDebug) console.log('handleUnlink: listCmp fetched',listCmp);
                listCmp.doRefresh();
                if (this.isDebug) console.log('handleUnlink: file list refresh triggered');

                if (this.recordId) {
                    if (this.isDebug) console.log('handleUnlink: triggering record data reload ',this.recordId);
                    notifyRecordUpdateAvailable([{recordId: this.recordId}]);
                }
                if (this.isDebug) console.log('handleUnlink: END');
            })
            .catch(error => {
                console.warn('handleUnlink: END KO / file registration failed ', JSON.stringify(error));
            });
        if (this.isDebug) console.log('handleUnlink: unlink triggered');
    }


    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

}