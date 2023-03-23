import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DsfrAlerteCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api alertType = 'error';            
    @api alertSize = 'medium';
    @api alertTitle;
    @api alertMessage;
    @api alertActionLabel;
    @api alertAction;

    @api alertCss;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    
    get alertClass() {
        return 'fr-alert fr-background-default--grey fr-alert--' + this.alertType + (this.alertSize === 'small' ? ' fr-alert--sm ' : ' ') + (this.alertCss || '');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START alerte');
            console.log('connected: type alerte ', this.alertType);
            console.log('connected: taille alerte ', this.alertSize);
            console.log('connected: titre alerte ', this.alertTitle);
            console.log('connected: message alerte ', this.alertMessage);
            console.log('connected: libellé action alerte ', this.alertActionLabel);
            console.log('connected: action alerte ', this.alertAction);
            console.log('connected: END alerte');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for alert ',this.alertTitle);
        if (this.isDebug) console.log('openTarget: with action label ',this.alertActionLabel);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: alertAction ',this.alertAction);
        if (this.alertAction) {
            if (this.isDebug) console.log('handleLinkClick: navigating to target ');

            const newPageRef = JSON.parse(this.alertAction);
            if (this.isDebug) console.log('handleLinkClick: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('handleLinkClick: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }
}