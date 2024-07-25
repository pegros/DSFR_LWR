import { LightningElement, api, wire } from 'lwc';
import userId       from '@salesforce/user/Id';
import linkFile     from '@salesforce/apex/dsfrFileUpload_CTL.linkFile';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';

import SELECT_MESSAGE from '@salesforce/label/c.dsfrFileSelectorMessage';
import SELECT_MISSING from '@salesforce/label/c.dsfrFileSelectorMissing';
import SELECT_NO_FILE from '@salesforce/label/c.dsfrFileSelectorNoValue';
import LINK_SUCCESS from '@salesforce/label/c.dsfrFileSelectorSuccess';
import LINK_ERROR from '@salesforce/label/c.dsfrFileSelectorError';

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
        if (this.isDebug) console.log('set FileSelector context: START with value ', value);
        if (this.isDebug) console.log('set FileSelector context: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('set FileSelector context: recordId ', this.recordId);
        if (value) {
            if ((!this._context) || (value !== this._context)) {
                if (this.isDebug) console.log('set FileSelector context: analysing new value ');
                this._context = value;
                try {
                    this.contextJson = JSON.parse(value);
                    if (this.isDebug) console.log('set FileSelector context: value parsed ', this.contextJson);
                    this.message = null;
                    this.isError = false;
                    
                    //let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    let fileSelect = this.refs?.fileSelect;
                    //if (this.isDebug) console.log('FileSelector: deactivating file selector ',fileSelect);
                    //fileSelect.disabled = true;
                    if (fileSelect) {
                        if (this.isDebug) console.log('set FileSelector context: resetting file selector',fileSelect);
                        fileSelect.value = '';
                        fileSelect.setCustomValidity('');
                        fileSelect.reportValidity();
                    }
                }
                catch(error) {
                    console.warn('set FileSelector context: value parsing failed ', JSON.stringify(error));
                    this.contextJson = null;
                    this.message = null;
                    this.isError = false;
                    //this.message = 'Erreur de configuration technique';
                    //this.isError = true;
                    let fileSelect = this.refs?.fileSelect;
                    if (fileSelect) {
                        if (this.isDebug) console.log('set FileSelector context: setting file selector error', fileSelect);
                        fileSelect.value = '';
                        fileSelect.setCustomValidity('Erreur de configuration technique');
                        fileSelect.reportValidity();
                    }
                    console.warn('set FileSelector context: END KO');
                }
            }
            else {
                if (this.isDebug) console.log('set FileSelector context: END / same value provided');
            }
        }
        else {
            if (this.isDebug) console.log('set FileSelector context: END / no value provided');
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
    fileList = [{label: SELECT_NO_FILE,value:""}];
    contextJson;
    ariaDescriptions;

    @wire(MessageContext)
    messageContext;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get hasFiles() {
        return ((this.fileList) && (this.fileList.length > 1));
    }
    get isDisabled() {
        return (this.disabled === 'true');
    }
    get isEnabled() {
        return !this.isDisabled;
    }
    get messageClass() {
        return 'fr-mt-2v ' + (this.isError ? 'fr-error-text' : 'fr-valid-text');
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
            //let fileSelect = this.template.querySelector("select[name='fileSelect']");
            let fileSelect = this.refs.fileSelect;
            console.log('rendered: fileSelect value ', fileSelect?.value);
            console.log('rendered: fileList ', this.fileList);
        }
        if ((!this.ariaDescriptions) || (!this.ariaDescriptions.includes(','))) {
            if (this.isDebug) console.log('rendered: selectComment ID ', this.refs?.selectComment?.id);
            if (this.isDebug) console.log('rendered: selectMessage ID ', this.refs?.selectMessage?.id);
            this.ariaDescriptions = this.refs?.selectComment?.id + (this.refs?.selectMessage ? ',' + this.refs?.selectMessage.id : '');
            if (this.isDebug) console.log('rendered: ariaDescriptions init ', this.ariaDescriptions);
        }
        if (this.isDebug) console.log('rendered: END for file selector');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for file selector',event);

        let fileData =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: file data received',JSON.stringify(fileData));

        let fileList = [];
        if (fileData?.length > 0) {
            fileData.forEach((item) => {
                if (this.isDebug) console.log('handleRecordLoad: processing item ',item);
                fileList.push({label: item.ContentDocument?.Title, value: item.ContentDocument?.LatestPublishedVersionId});
            });
            fileList.unshift({label:SELECT_MESSAGE,value:""});
        }
        else {
            if (this.isDebug) console.log('handleRecordLoad: handling no file case');
            fileList.unshift({label:SELECT_NO_FILE,value:""});
        }

        this.fileList = fileList;

        //let fileSelect = this.template.querySelector("select[name='fileSelect']");
        //if (this.isDebug) console.log('handleRecordLoad: fileSelect',fileSelect);
        /*if (fileSelect) {
            if (this.isDebug) console.log('handleRecordLoad: resetting select value to null');
            fileSelect.value = null;
        }*/

        if (this.isDebug) console.log('handleRecordLoad: END for file selector ', JSON.stringify(this.fileList));
    }

    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for file selector',event);
        this.message = null;
        
        //let fileSelect = this.template.querySelector("select[name='fileSelect']");
        let fileSelect = this.refs.fileSelect;
        if (this.isDebug) console.log('handleSelect: file selector value ',fileSelect?.value);
        fileSelect.setCustomValidity('');
        fileSelect.reportValidity();

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
                    //return fileId === item?.ContentDocument?.LatestPublishedVersionId;
                    return fileId === item.value;
                });
                if (this.isDebug) console.log('handleSelect: file description fetched ', JSON.stringify(fileDesc));
                //this.message = LINK_SUCCESS.replace('{0}', fileDesc?.ContentDocument?.Title);
                this.message = LINK_SUCCESS.replace('{0}', fileDesc?.label);
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

                //let fileSelect = this.template.querySelector("select[name='fileSelect']");
                let fileSelect = this.refs.fileSelect;
                if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                if (fileSelect) {
                    fileSelect.disabled = false;
                    fileSelect.value = '';
                    if (this.isDebug) console.log('handleSelect: resetting file selector');
                }
                if (this.isDebug) console.log('handleSelect: END for file selector');
            })
            .catch(error => {
                if (this.isDebug) console.log('handleSelect: error received ', JSON.stringify(error));

                if (this.isDebug) console.log('handleSelect: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrFileSelectorCmp',event_site: basePathName,event_category:'link_file',event_label:this.tag}}}));

                //let fileSelect = this.template.querySelector("select[name='fileSelect']");
                let fileSelect = this.refs.fileSelect;
                if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                if (fileSelect) {
                    if (this.isDebug) console.log('handleSelect: resetting file selector');
                    fileSelect.disabled = false;
                    fileSelect.value = '';
                }
                //this.message = error.body?.message; //JSON.stringify(error);
                let message = (error.body?.message || error.statusText || LINK_ERROR);
                //this.message = message;
                //this.isError = true;
                fileSelect.setCustomValidity(message);
                fileSelect.reportValidity();
                console.warn('handleSelect: END KO / file registration failed ', message);
            });
            if (this.isDebug) console.log('handleSelect: link triggered');
        }
        else {
            //this.message = 'Merci de sélectionner un fichier dans la liste';
            let fileSelect = this.refs.fileSelect;
            if (this.isDebug) console.log('handleSelect: setting missing selection on fileSelect ',fileSelect);
            fileSelect.setCustomValidity(SELECT_MISSING);
            fileSelect.reportValidity();
            /*this.message = SELECT_MISSING;         
            this.isError = true;*/
            console.warn('handleSelect: END KO / no selection');
        }
    }
}