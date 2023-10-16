import { LightningElement, api, wire } from 'lwc';
import { RefreshEvent } from 'lightning/refresh';
import { NavigationMixin } from 'lightning/navigation';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';

import CLOSE_TITLE from '@salesforce/label/c.dsfrFormButtonCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.dsfrFormButtonCloseLabel';
import SAVE_LABEL from '@salesforce/label/c.dsfrFormButtonSaveLabel';
import CANCEL_LABEL from '@salesforce/label/c.dsfrFormButtonCancelLabel';

export default class DsfrFormButtonCmp extends  NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonInactive = 'false';
    @api buttonAlign = 'right';

    @api formTitle;
    @api formMessage;
    @api formFieldList;
    @api doRefresh;

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    formFields;
    @api recordId;
    @api objectApiName;
    recordTypeId;
    isModalOpen;

    @wire(MessageContext)
    messageContext;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;
    saveLabel = SAVE_LABEL;
    cancelLabel = CANCEL_LABEL;

    //-----------------------------------
    // Custom getters
    //-----------------------------------
    get titleClass() {
        return  (this.formTitle ? 'fr-modal__title' : 'fr-modal__title hiddenTitle');
    }
    get titleLabel() {
        return  this.formTitle || "Modale d'alerte";
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START form button for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button form ',this.buttonForm);
            console.log('connected: button inactive? ', this.buttonInactive);
            console.log('connected: form title ',this.formTitle);
            console.log('connected: form message ',this.formMessage);
            console.log('connected: form fields ', this.formFieldList);
            console.log('connected: object ',this.objectApiName);
            console.log('connected: record ID ',this.recordId);
        }

        if (this.isDebug) console.log('connected: END action button');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleAction(event) {
        if (this.isDebug) console.log('handleAction: START for Form ',this.buttonLabel);
        if (this.isDebug) console.log('handleAction: event ',event);
        if (this.isDebug) console.log('handleAction: recordId ',this.recordId);
        if (this.isDebug) console.log('handleAction: objectApiName ',this.objectApiName);


        try {
            if (this.isDebug) console.log('handleAction: processing formFieldList ', this.formFieldList);
            if (this.isDebug) console.log('handleAction: stringified ', JSON.stringify(this.formFieldList));
            if (this.isDebug) console.log('handleAction: of type ',typeof this.formFieldList);

            this.formFields = (typeof this.formFieldList == 'string' ?  JSON.parse(this.formFieldList) : this.formFieldList || []);                
            if (this.isDebug) console.log('handleAction: field list updated ', JSON.stringify(this.formFields));
        }
        catch (error) {
            console.warn('handleAction: field list parsing failed ', error);
        }

        let modalCmp = this.template.querySelector('dialog');
        if (this.isDebug) console.log('handleAction: modalCmp fetched ',modalCmp);
        modalCmp.showModal();
        if (this.isDebug) console.log('handleAction: modalCmp shown');
        modalCmp.classList.add('fr-modal--opened');
        if (this.isDebug) console.log('handleAction: modalCmp classList updated');


        let status = document.addEventListener('keydown',this.handleEscape, false);
        if (this.isDebug) console.log('handleAction: keydown listener registered on document ',status);
        if (this.isDebug) console.log('handleAction: document.body.style ',document.body.style);
        document.body.style.overflowY = 'hidden';
        if (this.isDebug) console.log('handleAction: document style updated ',document.body.style.overflowY);

        setTimeout(() => { 
            let closeButton = this.template.querySelector('button.fr-link--close');
            if (this.isDebug) console.log('handleAction: START fetching closeButton ',closeButton);
            closeButton.focus({ focusVisible: true });
            if (this.isDebug) console.log('handleAction: START closeButton focused');
        }, 150);

        //this.toggleSpinner();
        this.isModalOpen = true;

        if (this.isDebug) console.log('handleAction: END Form ');
    }

    closeModal(event) {
        if (this.isDebug) console.log('closeModal: START');
        event.preventDefault();
        this.isModalOpen = false;

        let modalCmp = this.template.querySelector('dialog');
        if (this.isDebug) console.log('closeModal: modalCmp fetched ',modalCmp);
        modalCmp.close();
        if (this.isDebug) console.log('closeModal: modalCmp closed');
        modalCmp.classList.remove('fr-modal--opened');
        if (this.isDebug) console.log('closeModal: modalCmp classList updated');
        
        let status = document.removeEventListener('keydown',this.handleEscape);
        if (this.isDebug) console.log('closeModal: keydown listener removed on document ',status);
        if (this.isDebug) console.log('closeModal: document.body.style ',document.body.style);
        document.body.style.overflowY = null;
        if (this.isDebug) console.log('closeModal: document style updated ',document.body.style.overflowY);

        if (this._resolve) {
            if (this.isDebug) console.log('closeModal: END calling resolve handler');
            this._resolve();
        }
        else {
            if (this.isDebug) console.log('closeModal: END with no promise resolve');
        }
    }

    handleEnter(event) {
        console.log('handleEnter: START');
        if (event.key === 'Enter') {
            if (this.isDebug) console.log('handleEnter: END / closing modal');
            this.closeModal(event);
        }
        else {
            if (this.isDebug) console.log('handleEnter: END / ignoring key ',event.key);
        }
    }

    handleEscape = event => {
        console.log('handleEscape: START');
        if (event.key === 'Escape') {
            if (this.isDebug) console.log('handleEscape: END / closing modal');
            this.closeModal(event);
        }
        else {
            if (this.isDebug) console.log('handleEscape: END / ignoring key ',event.key);
        }
    }

    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START for Form Popup',event);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleLoad: END for Form Popup');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for Form Popup',event);
        this.toggleSpinner(true);
        if (this.isDebug) console.log('handleSubmit: END for Form Popup');
    }

    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START for Form Popup',event);
        
        if (this.doRefresh) {
            if (this.isDebug) console.log('handleSuccess: Triggering refresh');
            let actionNotif = {
                channel: "dsfrRefresh",
                action: {"type": "done","params": {"type": "refresh"}},
                context: null
            };
            if (this.isDebug) console.log('handleSuccess: actionNotif prepared ',JSON.stringify(actionNotif));
            if (this.isDebug) console.log('handleSuccess: END / Publishing page refresh notification');
            publish(this.messageContext, sfpegCustomNotification, actionNotif);
            /*if (this.isDebug) console.log('handleSuccess: refreshing page');
            this.dispatchEvent(new RefreshEvent());
            window.location.reload();*/
        }
        this.toggleSpinner(false);

        if (this.isDebug) console.log('handleSuccess: END for Form Popup / Closing Modal');
        this.closeModal(event);           
    }

    handleError(event) {
        if (this.isDebug) console.log('handleError: START for Form Popup',event);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleError: END for Form Popup');
    }
    
    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START for Form Popup',event);
        if (this.isDebug) console.log('handleCancel: END for Form Popup');
        this.closeModal(event);
    }
    
    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    toggleSpinner = (isShow) => {
        if (this.isDebug) console.log('toggleSpinner: START with',isShow);

        //let spinner = this.template.querySelector('lightning-spinner');
        let spinner = this.template.querySelector('.formSpinner');
        if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);
        let buttons = this.template.querySelectorAll('.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        if (isShow) {
            if (this.isDebug) console.log('toggleSpinner: showing spinner');
            spinner.classList?.remove('slds-hide');
            if (this.isDebug) console.log('toggleSpinner: disabling button');
            buttons.forEach(item => item.disabled = true);
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: hiding spinner');
            spinner.classList?.add('slds-hide');
            if (this.isDebug) console.log('toggleSpinner: reactivating buttons');
            buttons.forEach(item => item.disabled = false);
            this.isModalOpen = true;
        }

        
        if (this.isDebug) console.log('toggleSpinner: END');
    }
}