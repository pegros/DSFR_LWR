import { LightningElement, api } from 'lwc';

export default class DsfrCalloutCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api calloutTitle;
    @api calloutDescription;
    @api calloutVariant;          

    @api actionLabel;
    @api actionTarget;
    
    @api calloutCss;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    get calloutClass() {
        return  (this.calloutVariant ? 'fr-callout fr-fi-information-line fr-callout--' + this.calloutVariant : 'fr-callout fr-fi-information-line') + (this.calloutCss ? ' ' + this.calloutCss  : '');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START callout');
            console.log('connected: title ', this.calloutTitle);
            console.log('connected: description ', this.calloutDescription);
            console.log('connected: variant ', this.calloutVariant);
            console.log('connected: action label ', this.actionLabel);
            console.log('connected: action target ', this.actionTarget);
            console.log('connected: END callout');
        }
    }
}