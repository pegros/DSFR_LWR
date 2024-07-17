import { LightningElement,api,wire } from 'lwc';
import dsfrFlowPopupDsp from "c/dsfrFlowPopupDsp";

import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
// To receive / send the notifications
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';

export default class DsfrFlowPopupUtl extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api notifChannel;
    @api addDSFR = false;       // Add automatically the isDSFR boolean input parameter
    @api isDebug = false;       // Debug mode activation

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    freezeBack = false;         // to control background freeze when popup is open

    // To receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connected: START FlowPopup');

        this.notifChannel = this.notifChannel || 'DsfrFlowPopup';
        if (!this.notificationSubscription) {
            if (this.isDebug) console.log('connected: subscribing to notification channel ',this.notifChannel);
            this.notificationSubscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleNotification(message));
                //{ scope: APPLICATION_SCOPE });
        }
        else {
            if (this.isDebug) console.log('connected: notification channel already subscribed ',this.notifChannel);
        }

        if (this.isDebug) console.log('connected: END FlowPopup');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START FlowPopup with ',this.notifChannel);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END FlowPopup');
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    
    handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START FlowPopup with message ',JSON.stringify(message));

        if (message.channel) {
            if (message.channel === this.notifChannel) {
                if (this.isDebug) console.log('handleNotification: displaying popup with config ', JSON.stringify(message.action));
                let popupParams = {...message.action};
                popupParams.isDebug = popupParams.isDebug || this.isDebug;
                if (!popupParams.showTitle) {
                    popupParams.title = popupParams.popupTitle;
                }
                popupParams.addDSFR = popupParams.addDSFR || this.addDSFR;
                if (this.isDebug) console.log('handleNotification: config reworked ', JSON.stringify(popupParams));
                
                if (this.freezeBack) {
                    document.body.style.overflowY = 'hidden';
                    if (this.isDebug) console.log('handleNotification: background scrolling frozen ',document.body.style);
                }

                dsfrFlowPopupDsp.open(popupParams)
                .then((result) => {
                    if (this.isDebug) console.log('handleNotification: popup closed',JSON.stringify(result));

                    if (this.freezeBack) {
                        document.body.style.overflowY = null;
                        if (this.isDebug) console.log('handleNotification: background scrolling unfrozen ',document.body.style);
                    }

                    if (result?.doRefresh) {
                        if (this.isDebug) console.log('handleNotification: Triggering refresh');
                        
                        if (result.recordId) {
                            if (this.isDebug) console.log('handleNotification: refreshing record ', result.recordId);
                            notifyRecordUpdateAvailable([{recordId: result.recordId}]);
                            if (this.isDebug) console.log('handleNotification: record refresh triggered ');
                        }
            
                        let actionNotif = {
                            channel: "dsfrRefresh",
                            action: {"type": "done","params": {"type": "refresh"}},
                            context: null
                        };
                        if (this.isDebug) console.log('handleNotification: actionNotif prepared for page refresh ',JSON.stringify(actionNotif));
                        publish(this.messageContext, sfpegCustomNotification, actionNotif);
                        if (this.isDebug) console.log('handleNotification: Page refresh notification published');
                    }
                    else {
                        if (this.isDebug) console.log('handleNotification: no refresh requested');
                    }
                    if (this.isDebug) console.log('handleNotification: END OK FlowPopup');
                })
                .catch(err => {
                    if (this.isDebug) console.log('handleNotification: handling error');
                    if (this.freezeBack) {
                        document.body.style.overflowY = null;
                        if (this.isDebug) console.log('handleNotification: background scrolling unfrozen ',document.body.style);
                    }
                    console.error('handleNotification: END KO FlowPopup / popup open failed ',JSON.stringify(err));
                });
            }
            else {
                if (this.isDebug) console.log('handleNotification: END FlowPopup / ignoring notification ');
            }
        }
        else {
            console.warn('handleNotification: END KO FlowPopup / no channel specified in notification');
        }
    }       
}