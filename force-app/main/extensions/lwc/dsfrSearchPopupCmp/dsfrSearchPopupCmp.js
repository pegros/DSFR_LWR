import { LightningElement,api,wire } from 'lwc';
import dsfrSearchPopupDsp from "c/dsfrSearchPopupDsp";

// To receive the notifications
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)

export default class DsfrSearchPopupCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api notifChannel;
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation on subcomponents

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
        if (this.isDebug) console.log('connected: START SearchPopup');

        this.notifChannel = this.notifChannel || 'DsfrSearchPopup';
        if (!this.notificationSubscription) {
            if (this.isDebug) console.log('connected: subscribing to notification channel ',this.notifChannel);
            this.notificationSubscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleNotification(message));
                //{ scope: APPLICATION_SCOPE });
        }
        else {
            if (this.isDebug) console.log('connected: notification channels already subscribed ',this.notifChannel);
        }

        if (this.isDebug) console.log('connected: END SearchPopup');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START SearchPopup with ',this.notifChannel);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END SearchPopup');
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    
    handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START SearchPopup with message ',JSON.stringify(message));
        
        if (message.channel) {
            if (message.channel === this.notifChannel) {
                if (this.isDebug) console.log('handleNotification: displaying popup with config ', JSON.stringify(message.action));
                
                if (this.freezeBack) {
                    document.body.style.overflowY = 'hidden';
                    if (this.isDebug) console.log('handleNotification: background scrolling frozen ',document.body.style.overflowY);
                }

                let popupParams = {...message.action};
                popupParams.isDebug = popupParams.isDebug || this.isDebug;
                popupParams.isDebugFine = popupParams.isDebugFine || this.isDebugFine;
                if (this.isDebug) console.log('handleNotification: popup config reworked ', JSON.stringify(popupParams));
                dsfrSearchPopupDsp.open(popupParams)
                .then((result) => {
                    if (this.freezeBack) {
                        document.body.style.overflowY = null;
                        if (this.isDebug) console.log('handleNotification: background scrolling unfrozen ',document.body.style.overflowY);
                    }
                    if (this.isDebug) console.log('handleNotification: END SearchPopup / popup closed',result);
                })
                .catch(err => {
                    if (this.isDebug) console.log('handleNotification: handling error');
                    if (this.freezeBack) {
                        document.body.style.overflowY = null;
                        if (this.isDebug) console.log('handleNotification: background scrolling unfrozen ',document.body.style.overflowY);
                    }
                    console.error('handleNotification: END KO SearchPopup / popup open failed ',JSON.stringify(err));
                });
            }
            else {
                if (this.isDebug) console.log('handleNotification: END SearchPopup / ignoring notification ');
            }
        }
        else {
            console.warn('handleNotification: END KO SearchPopup / no channel specified in notification');
        }
    }       
}