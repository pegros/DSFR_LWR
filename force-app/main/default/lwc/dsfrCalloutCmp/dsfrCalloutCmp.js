import { LightningElement, api } from 'lwc';

export default class DsfrCalloutCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api calloutTitle;
    @api calloutDescription;
    @api isTags = false;
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
    /*get tagList() {
        return (this.calloutDescription ? this.calloutDescription.split(';').filter(n => n) : null);
    }*/
    get tagDescription() {
        return (this.calloutDescription ? this.calloutDescription.split(';').filter(n => n).join(', ') : null);
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
    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START callout');
            console.log('rendered: title ', this.calloutTitle);
            console.log('rendered: description ', this.calloutDescription);
            console.log('rendered: variant ', this.calloutVariant);
            console.log('rendered: action label ', this.actionLabel);
            console.log('rendered: action target ', this.actionTarget);
        }

        if ((this.calloutDescription) && (typeof this.calloutDescription !== 'string')) {
            if (this.isDebug) console.log('rendered: erasing Description');
            this.calloutDescription = null;
        }

        if (this.isDebug) console.log('rendered: END callout');
    }
}