import { LightningElement, api, wire } from 'lwc';
import { createRecord, updateRecord, deleteRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import basePathName from '@salesforce/community/basePath';

import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';

export default class DsfrActionButtonCmp extends  NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonTag; // for GA4
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonInactive = 'false';
    @api buttonAlign = 'right';

    @api buttonAction;

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------

    @wire(MessageContext)
    messageContext;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START action button for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button action ',this.buttonAction);
            console.log('connected: button inactive? ', this.buttonInactive);
        }

        this.buttonTag = this.buttonTag || this.buttonLabel || this.buttonTitle || 'Undefined';
        if (this.isDebug) console.log('connected: buttonTag evaluated ', this.buttonTag);

        if (this.isDebug) console.log('connected: END action button');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleAction(event) {
        if (this.isDebug) console.log('handleAction: START for button ',this.buttonLabel);
        if (this.isDebug) console.log('handleAction: event ',event);

        this.toggleSpinner();

        if (this.isDebug) console.log('handleAction: action fetched ',this.buttonAction);
        if (this.isDebug) console.log('handleAction: stringified ', JSON.stringify(this.buttonAction));
        if (this.isDebug) console.log('handleAction: of type ',typeof this.buttonAction);
        if (this.buttonAction) {                
            const actionDetails = (typeof this.buttonAction == 'string' ? JSON.parse(this.buttonAction) : this.buttonAction);
            if (this.isDebug) console.log('handleAction: actionDetails ready ',actionDetails);

            let actionPromise;
            switch (actionDetails.type) {
                case 'create':
                    if (this.isDebug) console.log('handleAction: triggering create action',JSON.stringify(actionDetails.params));
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:'create_record',event_label:this.buttonTag}}}));
                    if (this.isDebug) console.log('handleAction: GA notified');
                    actionPromise = createRecord(actionDetails.params);
                    break;
                case 'update':
                    if (this.isDebug) console.log('handleAction: triggering update action',JSON.stringify(actionDetails.params));
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:'update_record',event_label:this.buttonTag}}}));
                    if (this.isDebug) console.log('handleAction: GA notified');
                    actionPromise = updateRecord(actionDetails.params);
                    break;
                case 'delete':
                    if (this.isDebug) console.log('handleAction: triggering delete action',JSON.stringify(actionDetails.params));
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:'delete_record',event_label:this.buttonTag}}}));
                    if (this.isDebug) console.log('handleAction: GA notified');
                    actionPromise = deleteRecord(actionDetails.params);
                    break;
                default:
                    console.warn('handleAction: END KO / Unsupported action type');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:'config_error',event_label:this.buttonTag}}}));
                    if (this.isDebug) console.log('handleAction: GA notified');
                    return;
            }

            actionPromise.then(data => {
                if (this.isDebug) console.log('handleAction: operation executed ', JSON.stringify(data));
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:actionDetails.type+'_record',event_label:this.buttonTag}}}));
                if (this.isDebug) console.log('handleAction: GA re-notified');

                let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
                if (this.isDebug) console.log('handleAction: popupUtil fetched ', popupUtil);
                let alertConfig = {
                    alerts:[{type: "success", title: actionDetails.title || "Opération effectuée",  message: actionDetails.message }],
                    size:'small'};
                    //alerts:[{type: "success", title: actionDetails.title || "Opération effectuée", actionDetails.title message: "Vos changements ont bien été sauvegardés."}],
                popupUtil.showAlert(alertConfig).then(() => {
                    if (this.isDebug) console.log('handleAction: analysing next steps in action details ', JSON.stringify(actionDetails));                    
                    if (this.isDebug) console.log('handleAction: for data ', JSON.stringify(data));                    
                    if ((actionDetails.navigate) && (data.id)) {
                        if (this.isDebug) console.log('handleAction: navigating to record', data.id);
                        const newRecordPageRef = {
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: data.id,
                                objectApiName: data.apiName,
                                actionName: 'view'
                           }
                        }
                        if (this.isDebug) console.log('handleAction: END / Navigating to ', JSON.stringify(newRecordPageRef));
                        this[NavigationMixin.Navigate](newRecordPageRef);
                    }
                    else if (actionDetails.reload) {
                        if (this.isDebug) console.log('handleAction: END / Triggering record data reload on ',actionDetails.reload);
                        notifyRecordUpdateAvailable(actionDetails.reload);
                    }
                    else if (actionDetails.refresh) {
                        if (this.isDebug) console.log('handleAction: Triggering refresh');
                        //this.dispatchEvent(new RefreshEvent());
                        //window.location.reload();
                        let actionNotif = {
                            'channel': "dsfrRefresh",
                            'action': {"type": "done","params": {"type": "refresh"}},
                            'context': null
                        };
                        if (this.isDebug) console.log('handleAction: actionNotif prepared ',JSON.stringify(actionNotif));
                        if (this.isDebug) console.log('handleAction: END / Publishing page refresh notification');
                        publish(this.messageContext, sfpegCustomNotification, actionNotif);
                    }
                    else if (this.isDebug) console.log('handleAction: END');
                    this.toggleSpinner();
                });
                if (this.isDebug) console.log('handleAction: popup displayed');
            }).catch(error => {
                console.warn('handleAction: action failed ',error);
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrActionButtonDsp',event_site: basePathName,event_category:'submit_error',event_label:this.buttonTag}}}));
                if (this.isDebug) console.log('handleAction: GA re-notified');

                let alertConfig = {alerts:[],size:'small'};
                if (error.body?.output?.errors) {
                    alertConfig.header = error.body?.message;
                    error.body.output.errors.forEach(item => {
                        alertConfig.alerts.push({type:'error', message: item.message});
                    })
                }
                else {
                    alertConfig.alerts.push({type:'error', message: (error.body?.message || error.statusText)});
                }
                if (this.isDebug) console.log('handleAction: alertConfig init ', JSON.stringify(alertConfig));

                let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
                if (this.isDebug) console.log('handleAction: popupUtil fetched ', popupUtil);
                popupUtil.showAlert(alertConfig).then(() => {
                    if (this.isDebug) console.log('handleAction: END / popup closed');
                });
                this.toggleSpinner();
            });
            
            if (this.isDebug) console.log('handleAction: action trigered');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);
        let button = this.template.querySelector('c-dsfr-button-dsp');
        if (this.isDebug) console.log('toggleSpinner: button found',button);

        if (isShown) {
            if (this.isDebug) console.log('toggleSpinner: showing spinner');
            spinner.classList.remove('slds-hide');
            if (this.isDebug) console.log('toggleSpinner: disabling button');
            button.buttonInactive = true;
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: hiding spinner');
            spinner.classList.add('slds-hide');
            if (this.isDebug) console.log('toggleSpinner: reactivating button');
            button.buttonInactive = false;
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }
}