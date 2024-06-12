import { LightningElement, api } from 'lwc';
import CLOSE_TITLE from '@salesforce/label/c.dsfrAlertPopupCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.dsfrAlertPopupCloseLabel';

export default class DsfrAlertPopupDsp extends LightningElement {

    //--------------------------------------------
    // Interface Parameters
    //--------------------------------------------
    @api isDebug = false;

    //--------------------------------------------
    // Internal Parameters
    //--------------------------------------------

    isModalOpen = false; // Alert configuration to display (with type, title and message)
    alertConfig;  // Alert configuration to display (with header, type, size, title and message)

    // Promise handling
    _resolve = null;
    _reject =  null;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom getters
    //-----------------------------------
    get titleClass() {
        return  (this.alertConfig?.header ? 'fr-modal__title' : 'fr-modal__title hiddenTitle');
    }
    get titleLabel() {
        return  this.alertConfig?.header || "Modale d'alerte";
    }


    //-----------------------------------
    // Component Initialisation
    //-----------------------------------
    /*renderedCallback() {
        if (this.isDebug) console.log('rendered: START Alert Popup with ',JSON.stringify(alertConfig));

        let closeButton = this.template.querySelector('.fr-link--close');
        if (this.isDebug) console.log('rendered: closeButton fetched ',closeButton);
        closeButton.focus();

        if (this.isDebug) console.log('rendered: END Alert Popup');
    }*/

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START Alert Popup with ',JSON.stringify(this.alertConfig));

        if (this.isModalOpen) {
            if (this.isDebug) console.log('disconnected: closing Popup ');
            this.closeModal();
        }
        else {
            if (this.isDebug) console.log('disconnected: Popup already closed');
        }
        
        if (this.isDebug) console.log('disconnected: END Alert Popup');
    }

    //-----------------------------------
    // Event Handler
    //-----------------------------------
    @api showAlert(alertConfig) {
        if (this.isDebug) console.log('showAlert: START Alert Popup with ',JSON.stringify(alertConfig));
        this.alertConfig = alertConfig;
        this.isModalOpen = true;

        //let modalCmp = this.template.querySelector('dialog');
        let modalCmp = this.refs.modalDialog;
        if (this.isDebug) console.log('showAlert: modalCmp fetched ',modalCmp);
        modalCmp.showModal();
        if (this.isDebug) console.log('showAlert: modalCmp shown');
        modalCmp.classList.add('fr-modal--opened');
        if (this.isDebug) console.log('showAlert: modalCmp classList updated');

        let status = document.addEventListener('keydown',this.handleEscape, false);
        if (this.isDebug) console.log('showAlert: keydown listener registered on document ',status);
        if (this.isDebug) console.log('showAlert: document.body.style ',document.body.style);
        document.body.style.overflowY = 'hidden';
        if (this.isDebug) console.log('showAlert: document style updated ',document.body.style.overflowY);

        setTimeout(() => { 
            let closeButton = this.template.querySelector('button.fr-link--close');
            if (this.isDebug) console.log('showAlert: START fetching closeButton ',closeButton);
            closeButton.focus({ focusVisible: true });
            //event.preventDefault();
            if (this.isDebug) console.log('showAlert: END closeButton focused');
        }, 150);
        
        if (this.isDebug) console.log('showAlert: END Alert Popup returning Promise');
        return  new Promise((resolve,reject)=> {
            if (this.isDebug) console.log('showAlert: promise init START');

            this._resolve = resolve;
            this._reject = reject;
            if (this.isDebug) console.log('showAlert: promise init END');
        });
    }

    //-----------------------------------
    // Event Handler
    //-----------------------------------
    closeModal(event) {
        if (this.isDebug) console.log('closeModal: START');
        if (event) event.preventDefault();
        this.isModalOpen = false;

        //let modalCmp = this.template.querySelector('dialog');
        let modalCmp = this.refs.modalDialog;
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
}