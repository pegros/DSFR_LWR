import { LightningElement,api } from 'lwc';

export default class DsfrBadgeDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api badgeValue;
    @api badgeSize = 'medium'; // trest
    @api badgeVariant; 
    @api showIcon = false; 
    @api isDebug = false; 

    //-----------------------------------------------------
    // Internal parameters
    //-----------------------------------------------------
    badgeClass = 'fr-badge';

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START badge');
        if (this.isDebug) console.log('connected: badge value ', this.badgeValue);

        let badgeClass = 'fr-badge';
        if (this.isDebug) console.log('connected: badge size ', this.badgeSize);
        if (this.badgeSize === 'small') badgeClass += ' fr-badge-sm';

        if (this.isDebug) console.log('connected: badge variant ', this.badgeVariant);
        badgeClass += ' fr-badge--' + this.badgeVariant;

        if (!this.showIcon) badgeClass += ' fr-badge--no-icon';
        this.badgeClass = badgeClass;
        if (this.isDebug) console.log('connected: badgeClass set ', this.badgeClass);

        if (this.isDebug) console.log('connected: END badge');
    }
}