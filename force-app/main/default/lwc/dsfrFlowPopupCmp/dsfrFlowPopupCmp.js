import { LightningElement, api, wire } from 'lwc';
//import { notifyRecordUpdateAvailable, getRecordNotifyChange } from 'lightning/uiRecordApi';
//import basePathName from '@salesforce/community/basePath';

//import CLOSE_TITLE from '@salesforce/label/c.dsfrFlowPopupCloseTitle';
//import CLOSE_LABEL from '@salesforce/label/c.dsfrFlowPopupCloseLabel';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction from '@salesforce/messageChannel/sfpegCustomAction__c';
//import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';
export default class DsfrFlowPopupCmp extends LightningElement {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonTag; // for GA4 tracking
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonAlign;
    @api buttonInactive = 'false';

    @api modalTitle;
    @api showTitle = false; // by default, title is hidden but is included in the modal popup for RGAA reason
    @api modalDesc;         // for aria description of the modal popup (RGAA requirement)
    @api showClose = false; // Show close button in the modal footer

    @api flowName;
    @api flowParameters;

    @api recordId;
    @api doRefresh;

    @api popupChannel;      // notification channel

    @api isDebug = false;

    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    /*isModalOpen = false;
    flowVInput;
    flowStatus;*/
    
    @wire(MessageContext)
    messageContext;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    /*closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;*/

    //-----------------------------------
    // Custom Getters
    //-----------------------------------
    /*get titleClass() {
        return  (this.modalTitle ? 'fr-modal__title' : 'fr-modal__title hiddenTitle');
    }
    get titleLabel() {
        return  this.modalTitle || "Modale de processus";
    }
    get flowInputStr() {
        return JSON.stringify(this.flowInput);
    }*/

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START Flow Popup for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button alignment ',this.buttonAlign);
            console.log('connected: button inactive? ', this.buttonInactive);
            console.log('connected: Flow Name ', this.flowName);
            console.log('connected: Flow Parameters ', this.flowParameters);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: do refresh? ', this.doRefresh);
            console.log('connected: show Close ? ', this.showClose);
        }

        this.modalTitle = this.modalTitle || "Modale de processus";
        this.modalDesc = this.modalDesc || "Fenêtre modale permettant d'executer un processus guidé.",
        this.popupChannel = this.popupChannel || 'DsfrFlowPopup';
        this.buttonTag = this.buttonTag || this.buttonLabel || this.buttonTitle || 'Undefined';
        if (this.isDebug) {
            console.log('connected: Modal Title finalized ', this.modalTitle);
            console.log('connected: Modal Description finalized ', this.modalDesc);
            console.log('connected: popupChannel finalized ', this.popupChannel);
            console.log('connected: buttonTag evaluated ', this.buttonTag);
            console.log('connected: END Flow Popup');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START Flow Popup for ',this.buttonLabel);
            console.log('rendered: button title ',this.buttonTitle);
            console.log('rendered: Flow Name ', this.flowName);
            console.log('rendered: recordId ', this.recordId);
            console.log('rendered: END Flow Popup');
        }
    }
    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openModal(event) {
        if (this.isDebug) console.log('openModal: START Flow ',this.flowName);

        if (this.popupChannel) {
            if (this.isDebug) console.log('openModal: processing action for channel ', this.popupChannel);

            let actionNotif = {
                'channel': this.popupChannel,
                'action': {
                    modalTitle: this.modalTitle,
                    showTitle: this.showTitle,
                    description: this.modalDesc,
                    flowName: this.flowName,
                    showClose: this.showClose,
                    doRefresh: this.doRefresh,
                    recordId: this.recordId,
                    flowParams: this.flowParameters,
                    isDebug: this.isDebug
                }
            };
            if (this.isDebug) console.log('openModal: actionNotif prepared ', JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomAction, actionNotif);
            if (this.isDebug) console.log('openModal: END OK / notification sent');
        }
        else {
            console.error('openModal: END KO / Missing channel in configuration');
        }
    }
    /*    try {
            if (this.isDebug) console.log('openModal: processing flowParameters ', this.flowParameters);
            if (this.isDebug) console.log('openModal: stringified ', JSON.stringify(this.flowParameters));
            if (this.isDebug) console.log('openModal: of type ',typeof this.flowParameters);

            this.flowInput = (typeof this.flowParameters == 'string' ?  JSON.parse(this.flowParameters) : this.flowParameters || []);                
            if (this.isDebug) console.log('openModal: flow Input updated ', JSON.stringify(this.flowInput));

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrFlowPopupCmp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('openModal: GA notified');
        }
        catch (error) {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrFlowPopupCmp',event_site: basePathName,event_category:'config_error',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('openModal: GA notified');
            console.warn('openModal: flowInput parsing failed ', error);
        }

        let modalCmp = this.template.querySelector('dialog');
        if (this.isDebug) console.log('openModal: modalCmp fetched ',modalCmp);
        modalCmp.showModal();
        if (this.isDebug) console.log('openModal: modalCmp shown');
        modalCmp.classList.add('fr-modal--opened');
        if (this.isDebug) console.log('openModal: modalCmp classList updated');

        let status = document.addEventListener('keydown',this.handleEscape, false);
        if (this.isDebug) console.log('openModal: keydown listener registered on document ',status);
        if (this.isDebug) console.log('openModal: document.body.style ',document.body.style);
        document.body.style.overflowY = 'hidden';
        if (this.isDebug) console.log('openModal: document style updated ',document.body.style.overflowY);

        setTimeout(() => { 
            let closeButton = this.template.querySelector('button.fr-link--close');
            if (this.isDebug) console.log('openModal: START fetching closeButton ',closeButton);
            closeButton.focus({ focusVisible: true });
            if (this.isDebug) console.log('openModal: START closeButton focused');
        }, 150);

        this.isModalOpen = true;
        this.flowStatus = 'START';
        if (this.isDebug) console.log('openModal: END Flow ');
    }
    
    handleStatusChange(event) {
        if (this.isDebug) console.log('handleStatusChange: START flow ', this.flowName);
        if (this.isDebug) console.log('handleStatusChange: event ', event);
        if (this.isDebug) console.log('handleStatusChange: status ', event.detail.status);
        this.flowStatus = event.detail.status;
        if (event.detail.status === 'FINISHED') {
            if (this.isDebug) console.log('handleStatusChange: END / closing popup');
            this.closeModal(event);
        }
        else {
            if (this.isDebug) console.log('handleStatusChange: END / ignoring event');
        }
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

        if (event.detail.status === 'FINISHED') {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrFlowPopupCmp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('closeModal: GA notified - flow termination');
        }
        else {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_cancel',params:{event_source:'dsfrFlowPopupCmp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('closeModal: GA notified - popup close');
        }

        if ((this.doRefresh) && (event.detail.status === 'FINISHED')) {
            if (this.isDebug) console.log('closeModal: Triggering refresh');
            
            if (this.recordId) {
                if (this.isDebug) console.log('closeModal: refreshing record ', this.recordId);
                notifyRecordUpdateAvailable([{recordId: this.recordId}]);
                //getRecordNotifyChange([{recordId: this.recordId}]);
                if (this.isDebug) console.log('closeModal: record refresh triggered ');
            }

            let actionNotif = {
                channel: "dsfrRefresh",
                action: {"type": "done","params": {"type": "refresh"}},
                context: null
            };
            if (this.isDebug) console.log('closeModal: actionNotif prepared for page refresh ',JSON.stringify(actionNotif));
            publish(this.messageContext, sfpegCustomNotification, actionNotif);
            if (this.isDebug) console.log('closeModal: Page refresh notification published');

            
            //if (this.isDebug) console.log('closeModal: refreshing page');
            //this.dispatchEvent(new RefreshEvent());
            //window.location.reload();
        }
        
        if (this.isDebug) console.log('closeModal: END');
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
    }*/
}