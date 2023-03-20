import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';


export default class DsfrCardCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api cardImage = 'logo'; // should be asset file name or picto name
    @api cardBadge;
    @api cardBadgeVariant;
    @api cardTitle;
    @api cardDescription;
    @api cardStartDetails;
    @api cardStartIcon;
    @api cardEndDetails;
    @api cardEndIcon;
    @api cardTags;
    @api cardTarget;
    @api cardSize = 'medium';
    @api cardCss;
    @api isVertical = false; 
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    //tagList;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get imageSrc() {
        return (this.cardImage?.includes('/') ? null : '/file-asset/' + this.cardImage);
    }
    get pictoSrc() {
        return (this.cardImage?.includes('/') ? this.cardImage : null);
    }
    get imageTitle() {
        return 'Image pour ' + this.cardTitle;
    }
    get tagList() {
        return (this.cardTags ? (this.cardTags.includes(';') ? this.cardTags.split(';') : [this.cardTags]) : null);
    }
    get cardStartClass() {
        return (this.cardStartIcon ? 'fr-card__detail fr-icon-' + this.cardStartIcon : 'fr-card__detail');
    }
    get cardEndClass() {
        return (this.cardEndIcon ? 'fr-card__detail fr-icon-' + this.cardEndIcon : 'fr-card__detail');
    }
    get cardClass() {
        let cardClass = 'fr-card fr-enlarge-link';
        if (!this.isVertical) cardClass += ' fr-card--horizontal fr-card--horizontal-tier';
        if (this.cardCss) cardClass += ' ' + this.cardCss;
        switch (this.cardSize) {
            case 'medium':
                return  cardClass;
            case 'small':
                return cardClass + ' fr-card--sm';
            case 'small':
                return cardClass + ' fr-card--lg';
            default:
                return  cardClass;
        }
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START card for ',this.cardTitle);
            console.log('connected: card badge ',this.cardBadge);
            console.log('connected: card description ',this.cardDescription);
            console.log('connected: card start details ',this.cardStartDetails);
            console.log('connected: card end details ',this.cardEndDetails);
            console.log('connected: card tags ',this.cardTags);
            console.log('connected: card image ',this.cardImage);
            console.log('connected: card target ',this.cardTarget);
            console.log('connected: vertical variant? ', this.isVertical);
            console.log('connected: END card');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for card ',this.cardTitle);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: target ',this.cardTarget);
        if (this.cardTarget) {
            if (this.isDebug) console.log('handleLinkClick: navigating to target ');

            const newPageRef = JSON.parse(this.cardTarget);
            if (this.isDebug) console.log('handleLinkClick: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('handleLinkClick: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }
}