import { LightningElement, api, wire } from 'lwc';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction from '@salesforce/messageChannel/sfpegCustomAction__c';
export default class DsfrFlowPopupCmp extends LightningElement {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonName; // for HTML information 
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
    
    @wire(MessageContext)
    messageContext;

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
        this.buttonTag = this.buttonTag || this.buttonLabel || this.buttonName || this.buttonTitle || 'Undefined';
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
}