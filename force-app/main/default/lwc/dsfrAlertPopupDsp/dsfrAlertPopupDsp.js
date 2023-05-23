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
    // Event Handler
    //-----------------------------------
    @api showAlert(alertConfig) {
        if (this.isDebug) console.log('showAlert: START with ',JSON.stringify(alertConfig));
        this.alertConfig = alertConfig;
        this.isModalOpen = true;
        if (this.isDebug) console.log('showAlert: END returning Promise');
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
        this.isModalOpen = false;

        if (this._resolve) {
            if (this.isDebug) console.log('closeModal: END calling resolve handler');
            this._resolve();
        }
        else {
            if (this.isDebug) console.log('closeModal: END with no promise resolve');
        }
    }
}