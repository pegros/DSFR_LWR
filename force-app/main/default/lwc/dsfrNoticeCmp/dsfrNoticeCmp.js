import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DsfrNoticeCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api noticeTitle;
    @api noticeActionLabel;
    @api noticeAction;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START notice');
            console.log('connected: titre notice ', this.noticeTitle);
            console.log('connected: libellé action notice ', this.noticeActionLabel);
            console.log('connected: action notice ', this.noticeAction);
            console.log('connected: END notice');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for alert ',this.noticeTitle);
        if (this.isDebug) console.log('openTarget: with action label ',this.noticeActionLabel);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: alertAction ',this.noticeAction);
        if (this.noticeAction) {
            if (this.isDebug) console.log('handleLinkClick: navigating to target ');

            const newPageRef = JSON.parse(this.noticeAction);
            if (this.isDebug) console.log('handleLinkClick: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('handleLinkClick: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }
}