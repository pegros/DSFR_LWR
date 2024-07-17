import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import basePathName from '@salesforce/community/basePath';

import CLOSE_TITLE from '@salesforce/label/c.dsfrFlowPopupCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.dsfrFlowPopupCloseLabel';

export default class DsfrFlowPopupDsp extends LightningModal {
    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalTitle = "Modale de processus";
    @api showTitle = false;
    @api flowName;
    @api flowParams;
    @api showClose = false;
    @api buttonTag = 'Undefined';

    @api doRefresh;
    @api recordId;
    @api addDSFR = false; // Flag to add the isDSFR Boolean property as input to the Flow

    @api isDebug = false;

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    errorMsg;  
    flowInput;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get flowInputStr() {
        return JSON.stringify(this.flowInput);
    }

    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------
    connectedCallback(event){
        if (this.isDebug) console.log('connected: START FlowPopup with flow ',this.flowName);
        if (this.isDebug) console.log('connected: with modalTitle ',this.modalTitle);

        try {
            if (this.isDebug) console.log('connected: processing flowParameters ', this.flowParams);
            if (this.isDebug) console.log('connected: stringified ', JSON.stringify(this.flowParams));
            if (this.isDebug) console.log('connected: of type ',typeof this.flowParams);

            this.flowInput = (typeof this.flowParams == 'string' ?  JSON.parse(this.flowParams) : this.flowParams || []); 
            if (this.addDSFR) {
                this.flowInput.push({name: "isDSFR",type: "Boolean","value": true});
            }
            if (this.isDebug) console.log('connected: flow Input updated ', JSON.stringify(this.flowInput));

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrFlowPopupDsp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('connected: GA notified - flow start');

            if (this.isDebug) console.log('connected: END FlowPopup');
        }
        catch (error) {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrFlowPopupDsp',event_site: basePathName,event_category:'config_error',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('connected: GA notified - flow start failure');
            console.warn('connected: END KO FlowPopup / flowParameters parsing failed ', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
    }
    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START FlowPopup');
            console.log('rendered: searchForm ',JSON.stringify(this.searchForm));
            console.log('rendered: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('rendered: END FlowPopup');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    handleStatusChange(event) {
        if (this.isDebug) console.log('handleStatusChange: START SearchPopup for flow ',this.flowName);
        event.preventDefault();
        if (this.isDebug) console.log('handleStatusChange: event details',JSON.stringify(event.detail));

        if (event.detail.status === 'FINISHED') {
            if (this.isDebug) console.log('handleStatusChange: END SearchPopup / closing popup');
            this.handleClose(event);
        }
        else {
            if (this.isDebug) console.log('handleStatusChange: END SearchPopup / ignoring event');
        }        
    }

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START SearchPopup with event ',event);
        
        let closeParams;
        if (event.detail.status === 'FINISHED') {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrFlowPopupDsp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('handleClose: GA notified - flow termination');

            closeParams = {doRefresh: this.doRefresh, recordId: this.recordId}
            if (this.isDebug) console.log('handleClose: closeParams init ', JSON.stringify(closeParams));
        }
        else {
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_cancel',params:{event_source:'dsfrFlowPopupDsp',event_site: basePathName,event_category:'flow_popup',event_label:this.buttonTag}}}));
            if (this.isDebug) console.log('handleClose: GA notified - popup close');
        }
        
        this.close(closeParams);
        if (this.isDebug) console.log('handleClose: END SearchPopup / component closed');        
    }
}