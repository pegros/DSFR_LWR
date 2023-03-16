import { LightningElement, api } from 'lwc';

export default class DsfrHighlightDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api message;
    @api messageSize;            
    @api borderColor;            
    //@api backgroundColor;
    
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    get highlightClass() {
        return  (this.borderColor ? 'fr-highlight fr-highlight--' + this.borderColor : 'fr-highlight');
        //    +   (this.backgroundColor ? 'fr-callout--' + this.backgroundColor : '');
    }
    get textClass() {
        switch (this.messageSize) {
            case 'small' :
                return 'fr-text--sm';
            case 'large' :
                return 'fr-text--lg';
            default :
                return '';
        }
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START highlight');
            console.log('connected: message ', this.message);
            console.log('connected: taille ', this.messageSize);
            console.log('connected: couleur bordure ', this.borderColor);
            //console.log('connected: couleur fond ', this.backgroundColor);
            console.log('connected: END highlight');
        }
    }
}