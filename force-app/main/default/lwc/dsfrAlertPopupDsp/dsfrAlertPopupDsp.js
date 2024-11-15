import { api } from 'lwc';

import LightningModal from 'lightning/modal';

import CLOSE_TITLE from '@salesforce/label/c.dsfrAlertPopupCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.dsfrAlertPopupCloseLabel';

export default class DsfrAlertPopupDsp extends LightningModal {

    //--------------------------------------------
    // Interface Parameters
    //--------------------------------------------
    @api alerts;

    @api isDebug = false;

    //--------------------------------------------
    // Internal Parameters
    //--------------------------------------------



    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom getters
    //-----------------------------------
    get showAlerts() {
        return this.alerts && this.alerts.length > 0;
    }
    get alertsStr() {
        return JSON.stringify(this.alerts);
    }

    //-----------------------------------
    // Component Initialisation
    //-----------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START Alert Popup with ',JSON.stringify(this.alerts));
        if (this.isDebug) console.log('connected: with modalTitle ',modalTitle);
        //this.disableClose = true;
        if (this.isDebug) console.log('connected: END Alert');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START Alert Popup with ',JSON.stringify(this.alerts));
        if (this.isDebug) console.log('disconnected: END Alert Popup');
    }

    //-----------------------------------
    // Event Handler
    //-----------------------------------
    handleClose(event){
        if (this.isDebug) console.log('handleClose: START Alert Popup with event ',event);
        //this.disableClose = false;
        this.close();
        if (this.isDebug) console.log('handleClose: END Alert Popup');        
    }

}