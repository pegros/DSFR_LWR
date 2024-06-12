import { LightningElement,api } from 'lwc';

export default class DsfrBadgeDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api badgeValue;
    @api badgeTitle;
    @api badgeSize = 'medium';
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
        if (this.isDebug) console.log('connected: badge title ', this.badgeTitle);
        if (typeof this.badgeValue == 'number') {
            this.badgeValue = '' + this.badgeValue;
            if (this.isDebug) console.log('connected: badge value converted');
        };

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