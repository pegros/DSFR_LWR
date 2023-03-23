import { api, LightningElement } from 'lwc';

import CLOSE_TITLE from '@salesforce/label/c.dsfrFlowPopupCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.dsfrFlowPopupCloseLabel';

export default class DsfrFlowPopupCmp extends LightningElement {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonInactive = 'false';

    @api modalTitle;
    @api flowName;
    @api flowParameters;

    @api isDebug = false;

    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    isInactive = false;
    buttonClass = 'fr-btn';
    isModalOpen = false;
    flowVInput;
    
    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom Getters
    //-----------------------------------
    get flowInputStr() {
        console.log('connected: START Flow Popup for ',this.buttonLabel);
        return JSON.stringify(this.flowInput);
    }

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
            console.log('connected: button inactive? ', this.buttonInactive);
            console.log('connected: Modal Title ', this.modalTitle);
            console.log('connected: Flow Name ', this.flowName);
            console.log('connected: Flow Parameters ', this.flowParameters);
        }

        try {
        this.isInactive = (this.buttonInactive === 'true');
        if (this.isDebug) console.log('connected: isInactive evaluated ', this.isInactive);

        let buttonClass = 'fr-btn  fr-btn--' + this.buttonVariant;
        switch (this.buttonSize) {
            case 'small':
                buttonClass += ' fr-btn--sm';
                break;
            case 'small':
                buttonClass += ' fr-btn--lg';
                break;
        }
        if (this.buttonIcon) {
            buttonClass += ' fr-btn--icon-' + this.buttonIconPosition + ' fr-icon-' + this.buttonIcon;
        }
        this.buttonClass = buttonClass;
        if (this.isDebug) console.log('connected: buttonClass set ', this.buttonClass);
        }
        catch (error) {
            console.warn('connected: init failed ', error);
        }

        /*try {
            this.flowVInput = JSON.parse(this.flowParameters);
            if (this.isDebug) console.log('connected: flowVInput parsed ', JSON.stringify(this.flowVInput));
        }
        catch (error) {
            console.warn('connected: flowVInput parsing failed ', error);
        }*/

        if (this.isDebug) console.log('connected: END button');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    toggleModal(event) {
        if (this.isDebug) console.log('toggleModal: START from ',this.isModalOpen);
        if (!this.isModalOpen) {
            if (this.isDebug) console.log('toggleModal: revising flowVInput for ', this.flowName);
            try {
                this.flowInput = JSON.parse(this.flowParameters);
                if (this.isDebug) console.log('toggleModal: flowVInput updated ', JSON.stringify(this.flowInput));
            }
            catch (error) {
                console.warn('toggleModal: flowVInput parsing failed ', error);
            }
        }
        this.isModalOpen = !this.isModalOpen;
        if (this.isDebug) console.log('toggleModal: END with ', this.isModalOpen);
    }
    handleStatusChange(event) {
        if (this.isDebug) console.log('handleStatusChange: START flow ', this.flowName);
        if (this.isDebug) console.log('handleStatusChange: event ', event);
        if (this.isDebug) console.log('handleStatusChange: status ', event.detail.status);
        if (event.detail.status === 'FINISHED') {
            if (this.isDebug) console.log('handleStatusChange: closing popup');
            this.isModalOpen = !this.isModalOpen;
        }
        if (this.isDebug) console.log('handleStatusChange: END');
    }
}