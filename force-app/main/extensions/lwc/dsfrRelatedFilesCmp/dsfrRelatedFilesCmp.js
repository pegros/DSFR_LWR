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
    configDetails;


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

        if (!this.configDetails) {
            let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            if (this.isDebug) console.log('handleRecordLoad: fetching listCmp ',listCmp);

            this.configDetails =  listCmp.configuration?.display || {};
            if (this.isDebug) console.log('handleRecordLoad: initial configDetails ',JSON.stringify(this.configDetails));
            
            if (!this.configDetails.isReady) {
                if (this.isDebug) console.log('handleRecordLoad: initialising configDetails');
            
                if (!this.configDetails.linkId) {
                    this.configDetails.linkId = ['Id'];
                }
                else if (typeof this.configDetails.linkId === 'string') {
                    this.configDetails.linkId = (this.configDetails.linkId).split('.');
                }
                if (!this.configDetails.contentId) {
                    this.configDetails.contentId = ['ContentDocumentId'];
                }
                else if (typeof this.configDetails.contentId === 'string') {
                    this.configDetails.contentId = (this.configDetails.contentId).split('.');
                }
                if (!this.configDetails.title) {
                    this.configDetails.title = ['ContentDocument','Title'];
                }
                else if (typeof this.configDetails.title === 'string') {
                    this.configDetails.title = (this.configDetails.title).split('.');
                }
                if (!this.configDetails.details) {
                    this.configDetails.details = [{value:['ContentDocument','FileType']},{value:['ContentDocument','ContentSize'],suffix:'octets'}];
                }
                else {
                    (this.configDetails.details).forEach( detailIter => {
                        if (this.isDebug) console.log('handleRecordLoad: analysing detail ', JSON.stringify(detailIter));
                        if (typeof detailIter.value === 'string') {
                            if (this.isDebug) console.log('handleRecordLoad: splitting detail value');
                            detailIter.value = (detailIter.value).split('.');
                        }
                    });
                }
                this.configDetails.isReady = true;
                if (this.isDebug) console.log('handleRecordLoad: configDetails init ',JSON.stringify(this.configDetails));
            }
        }

        let baseRecordList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: list loaded ',JSON.stringify(event.detail));

        let targetRecordList = [];
        if (baseRecordList) {
            if (this.isDebug) console.log('handleRecordLoad: processing list');

            baseRecordList.forEach(item => {
                if (this.isDebug) console.log('handleRecordLoad: processing row ',JSON.stringify(item));
                let newItem = {
                    title: this.getValue(this.configDetails.title,item) || '???',
                    linkId: this.getValue(this.configDetails.linkId,item) || '???',
                    contentId: this.getValue(this.configDetails.contentId,item) || '???',
                    details: []
                };
                if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                (this.configDetails.details).forEach(detailItem => {
                    if (this.isDebug) console.log('handleRecordLoad: processing detailItem ',JSON.stringify(detailItem));
                    let newItemDetail = {... detailItem};
                    newItemDetail.value = this.getValue(detailItem.value,item);
                    if (newItemDetail.value) {
                        newItem.details.push(newItemDetail);
                    }
                });
                if (this.isDebug) console.log('handleRecordLoad: newItem init ',JSON.stringify(newItem));
                targetRecordList.push(newItem);
            });
        }

        this.fileList =  targetRecordList;
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

        /*let pageRef = {
            type: 'standard__webPage',
            attributes: {
                url: '/sfc/servlet.shepherd/document/download/' + fileId //+ '?operationContext=S1'
            }
        };
        if (this.isDebug) console.log('handleDownload: opening pageRef ', JSON.stringify(pageRef));

        this[NavigationMixin.Navigate](pageRef, false);*/

        let pageRef = '/sfc/servlet.shepherd/document/download/' + fileId;
        if (this.isDebug) console.log('handleDownload: opening pageRef ', pageRef);
        window.open(pageRef,'_blank');

        if (this.isDebug) console.log('handleDownload: END');
    }

    handleUnlink(event){
        if (this.isDebug) console.log('handleUnlink: START',event);

        event.preventDefault();

        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('handleUnlink: spinner found',spinner);
        if (spinner) {
            if (this.isDebug) console.log('handleUnlink: showing spinner');
            spinner.classList.remove('slds-hide');
        }

        let linkId = event.srcElement?.name;
        if (this.isDebug) console.log('handleUnlink: linkId determined ', linkId);
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

                if (spinner) {
                    if (this.isDebug) console.log('handleUnlink: hiding spinner');
                    spinner.classList.add('slds-hide');
                }
                if (this.isDebug) console.log('handleUnlink: END');
            })
            .catch(error => {
                console.warn('handleUnlink: END KO / file registration failed ', JSON.stringify(error));
                if (spinner) {
                    if (this.isDebug) console.log('handleUnlink: hiding spinner');
                    spinner.classList.add('slds-hide');
                }
            });
        if (this.isDebug) console.log('handleUnlink: unlink triggered');
    }


    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    getValue = function(fieldPath,data) {
        let fieldValue = data;
        fieldPath.forEach(iter => {
            fieldValue = fieldValue[iter];
        });
        return fieldValue;
    }
}