import { LightningElement, api, wire } from 'lwc';
import userId       from '@salesforce/user/Id';
import linkFile     from '@salesforce/apex/dsfrFileUpload_CTL.linkFile';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import LINK_SUCCESS from '@salesforce/label/c.dsfrFileSelectorSuccess';
import basePathName from '@salesforce/community/basePath';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';
export default class DsfrFileSelectorCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Sélectionner un fichier';
    @api comment = 'Plusieurs fichiers sont déjà disponibles.';
    @api tag; // for GA4 tracking

    @api configName;

    _context;
    @api 
    get context() {
        return this._context;
    }
    set context(value) {
        if (value) {
            if ((!this._context) || (value !== this._context)) {
                if (this.isDebug) console.log('set FileSelector context: new value provided ', value);
                if (this.isDebug) console.log('set FileSelector context: objectApiName ', this.objectApiName);
                if (this.isDebug) console.log('set FileSelector context: recordId ', this.recordId);
                this._context = value;
                try {
                    this.contextJson = JSON.parse(value);
                    if (this.isDebug) console.log('set FileSelector context: value parsed ', this.contextJson);
                    this.message = null;
                    this.isError = false;
                    let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    //if (this.isDebug) console.log('FileSelector: deactivating file selector ',fileSelect);
                    //fileSelect.disabled = true;
                    if (fileSelect) {
                        if (this.isDebug) console.log('FileSelector: resetting file selector');
                        fileSelect.value = '';
                    }
                }
                catch(error) {
                    console.warn('set FileSelector context: value parsing failed ', error);
                    this.contextJson = null;
                    this.message = 'Erreur de configuration technique';
                    this.isError = true;
                }
            }
            else {
                if (this.isDebug) console.log('set FileSelector context: same value provided');
            }
        }
        else {
            if (this.isDebug) console.log('set FileSelector context: no value provided');
            this.message = null;
            this.isError = false;
        }
    }

    @api shareMode = 'V';
    @api disabled;
    @api wrappingClass;

    @api doRefresh;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    isError = false;
    fileList;
    contextJson;

    @wire(MessageContext)
    messageContext;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get hasFiles() {
        return ((this.fileList) && (this.fileList.length > 0));
    }
    get isDisabled() {
        return (this.disabled === 'true');
    }
    get messageClass() {
        return (this.isError ? 'fr-error-text' : 'fr-valid-text');
    }
    

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for file selector ', this.label);
            console.log('connected: configName ', this.configName);
            console.log('connected: context ', this.context);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
        }
        this.tag = this.tag || this.label || 'Undefined';
        if (this.isDebug) {
            console.log('connected: tag evaluated ', this.tag);
            console.log('connected: END for file selector');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for file selector', this.label);
            console.log('rendered: configName ', this.configName);
            console.log('rendered: recordId ', this.recordId);
            console.log('rendered: context ', this.context);
            console.log('rendered: context parsed ', this.contextJson);
            let fileSelect = this.template.querySelector("select[name='fileSelect']");
            console.log('rendered: fileSelect value ', fileSelect?.value);
            console.log('rendered: fileList ', this.fileList);
            console.log('rendered: END for file selector');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for file selector',event);
        this.fileList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: file list registered',JSON.stringify(this.fileList));

        let fileSelect = this.template.querySelector("select[name='fileSelect']");
        if (this.isDebug) console.log('handleRecordLoad: fileSelect',fileSelect);
        /*if (fileSelect) {
            if (this.isDebug) console.log('handleRecordLoad: resetting select value to null');
            fileSelect.value = null;
        }*/

        if (this.isDebug) console.log('handleRecordLoad: END for file selector');
    }

    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for file selector',event);
        this.message = null;
        
        let fileSelect = this.template.querySelector("select[name='fileSelect']");
        if (this.isDebug) console.log('handleSelect: file selector value ',fileSelect?.value);

        if (fileSelect?.value) {
            if (this.isDebug) console.log('handleSelect: disabling file selector ',fileSelect);
            fileSelect.disabled = true;
            let fileId = fileSelect.value;
            const linkData = {
                fileId: fileId,
                recordId: this.recordId,
                sharing: this.shareMode
            };

            if (this.isDebug) console.log('handleSelect: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrFileSelectorCmp',event_site: basePathName,event_category:'link_file',event_label:this.tag}}}));

            if (this.isDebug) console.log('handleSelect: linkData prepared ', JSON.stringify(linkData));
            linkFile(linkData)
                .then(result => {
                    if (this.isDebug) console.log('handleSelect: file registered as ', JSON.stringify(result));
                    //this.message =  'Le fichier a bien été rattaché!';
                    if (this.isDebug) console.log('handleSelect: looking for file ', fileId);
                    let fileDesc = this.fileList.find((item) => {
                        if (this.isDebug) console.log('handleSelect: analysing file ', JSON.stringify(item));
                        return fileId === item.ContentDocument.LatestPublishedVersionId;
                    });
                    if (this.isDebug) console.log('handleSelect: file description fetched ', JSON.stringify(fileDesc));
                    this.message = LINK_SUCCESS.replace('{0}', fileDesc?.ContentDocument?.Title);
                    this.isError =  false;

                    if (this.isDebug) console.log('handleSelect: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrFileSelectorCmp',event_site: basePathName,event_category:'link_file',event_label:this.tag}}}));

                    if (this.recordId) {
                        if (this.isDebug) console.log('handleSelect: triggering record data reload ',this.recordId);
                        notifyRecordUpdateAvailable([{recordId: this.recordId}]);
                    }

                    if (this.doRefresh) {
                        if (this.isDebug) console.log('handleSelect: Triggering refresh');
                        let actionNotif = {
                            channel: "dsfrRefresh",
                            action: {"type": "done","params": {"type": "refresh"}},
                            context: null
                        };
                        if (this.isDebug) console.log('handleSelect: actionNotif prepared ',JSON.stringify(actionNotif));
                        publish(this.messageContext, sfpegCustomNotification, actionNotif);
                        if (this.isDebug) console.log('handleSelect: page refresh notification published');
                    }

                    let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                    fileSelect.disabled = false;
                    if (this.isDebug) console.log('handleSelect: resetting file selector');
                    fileSelect.value = '';
                    
                    if (this.isDebug) console.log('handleSelect: END for file selector');
                })
                .catch(error => {
                    if (this.isDebug) console.log('handleSelect: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrFileSelectorCmp',event_site: basePathName,event_category:'link_file',event_label:this.tag}}}));

                    let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                    fileSelect.disabled = false;
                    if (this.isDebug) console.log('handleSelect: resetting file selector');
                    fileSelect.value = null;
                    console.warn('handleSelect: END KO / file registration failed ', JSON.stringify(error));
                    //this.message = error.body?.message; //JSON.stringify(error);
                    this.message = (error.body?.message || error.statusText || 'Erreur technique');
                    this.isError = true;
                });
            if (this.isDebug) console.log('handleSelect: link triggered');
        }
        else {
            console.warn('handleSelect: END KO / no selection');
            this.message = 'Merci de sélectionner un fichier dans la liste';
            this.isError = true;
        }
    }
}