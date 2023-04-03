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
        return (this.cardImage?.includes('delivery/media') ? this.cardImage : '/file-asset/' + this.cardImage);
    }
    get pictoSrc() {
        return (((this.cardImage?.includes('/')) && (!this.cardImage?.includes('delivery/media'))) ? this.cardImage : null);
    }
    get imageTitle() {
        return 'Image pour ' + this.cardTitle;
    }
    get tagList() {
        return ((this.cardTags) ? (this.cardTags.includes(';') ? this.cardTags.split(';') : [this.cardTags]) : null);
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
    get cardImageClass() {
        return 'fr-responsive-img fr-responsive-img--16x9 cardImage-' + this.cardSize;
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
            console.log('connected: card tags ',JSON.stringify(this.cardTags));
            console.log('connected: card image ',this.cardImage);
            console.log('connected: card target ',this.cardTarget);
            console.log('connected: vertical variant? ', this.isVertical);
        }

        // Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('connected: END card');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START card for ',this.cardTitle);
            console.log('rendered: card badge ',this.cardBadge);
            console.log('rendered: card description ',this.cardDescription);
            console.log('rendered: card start details ',this.cardStartDetails);
            console.log('rendered: card end details ',this.cardEndDetails);
            console.log('rendered: card tags ',JSON.stringify(this.cardTags));
            console.log('rendered: card image ',this.cardImage);
            console.log('rendered: card target ',this.cardTarget);
            console.log('rendered: vertical variant? ', this.isVertical);
        }

        // Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('rendered: END card');
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
            if (this.isDebug) console.log('openTarget: navigating to target ');

            const newPageRef = JSON.parse(this.cardTarget);
            if (this.isDebug) console.log('openTarget: newPageRef init ',newPageRef);

            /*this[NavigationMixin.GenerateUrl](newPageRef)
            .then((url) => {
                if (this.isDebug) console.log('openTarget: new url generated ',url);
            });*/

            if (this.isDebug) console.log('openTarget: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    resetInput = () => {
        if (this.isDebug) console.log('resetInput: START for card');
        if ((this.cardTitle) && (typeof this.cardTitle !== 'string')) {
            this.cardTitle = null;
            if (this.isDebug) console.log('resetInput: card title reset ');
        }
        if ((this.cardBadge) && (typeof this.cardBadge !== 'string')) {
            this.cardBadge = null;
            if (this.isDebug) console.log('resetInput: card badge reset ');
        }
        if ((this.cardDescription) &&  (typeof this.cardDescription !== 'string')) {
            this.cardDescription = null;
            if (this.isDebug) console.log('resetInput: card description reset ');
        }
        if ((this.cardStartDetails) &&  (typeof this.cardStartDetails !== 'string')) {
            this.cardStartDetails = null;
            if (this.isDebug) console.log('resetInput: card start detail reset ');
        }
        if ((this.cardEndDetails) && (typeof this.cardEndDetails !== 'string')) {
            this.cardEndDetails = null;
            if (this.isDebug) console.log('resetInput: card end detail reset ');
        }
        if ((this.cardTags) && (typeof this.cardTags !== 'string')) {
            this.cardTags = null;
            if (this.isDebug) console.log('resetInput: card tags reset ');
        }
        if ((this.cardImage) && (typeof this.cardImage !== 'string')) {
            this.cardImage = null;
            if (this.isDebug) console.log('resetInput: card image reset ');
        }
        if (this.isDebug) console.log('resetInput: END for card');
    }
}