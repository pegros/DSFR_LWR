import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DsfrAlerteCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api alertType = 'error';            
    @api alertSize = 'medium';

    _alertTitle;
    @api 
    get alertTitle() {
        return this._alertTitle;
    }
    set alertTitle(value) {
        this._alertTitle = value;
        this.showAlert = this._alertTitle || this._alertMessage
    }

    _alertMessage;
    @api 
    get alertMessage() {
        return this._alertMessage;
    }
    set alertMessage(value) {
        this._alertMessage = value;
        this.showAlert = this._alertTitle || this._alertMessage
    }
    @api isTags = false;
    
    //@api alertTitle;
    //@api alertMessage;

    @api alertActionLabel;
    @api alertAction;

    @api alertCss;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    showAlert = false;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    
    get alertClass() {
        return 'fr-alert fr-background-default--grey fr-alert--' + this.alertType + (this.alertSize === 'small' ? ' fr-alert--sm ' : ' ') + (this.alertCss || '');
    }
    get tagList() {
        return (this._alertMessage ? (this._alertMessage.split(';').filter(n => n)) : null);
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