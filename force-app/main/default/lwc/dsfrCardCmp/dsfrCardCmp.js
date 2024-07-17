import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePathName from '@salesforce/community/basePath';

/*var CARD_SIZE = {};*/
export default class DsfrCardCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api cardImage; // should be asset file name or picto name
    @api cardBadge;
    @api cardBadgeVariant;
    @api cardTitle;
    @api cardTitleLevel = 'h3';
    @api cardTag; // for GA4 link tracking
    @api cardDescription;
    @api cardDescriptionFields;
    @api cardStartDetails;
    @api cardStartIcon;
    @api cardEndDetails;
    @api cardEndIcon;
    @api cardBadgeList;
    @api cardBadgeListJson;
    @api cardTags;
    @api cardTarget;
    _cardButtons;
    @api
    get cardButtons() {
        return this._cardButtons;
    }
    set cardButtons(value) {
        if (this.isDebug) console.log('setting cardButtons ',JSON.stringify(value));
        if (value) {
            let cardButtons;
            if (typeof value == 'string') {
                try {
                    cardButtons = JSON.parse(value);
                }
                catch (error) {
                    console.warn('Issue when parsing cardButtons provided ', JSON.stringify(value));
                    console.warn('Issue details ',JSON.stringify(error));
                    cardButtons = null;
                }
            }
            else {
                cardButtons =[... value];
            }
            this._cardButtons = cardButtons;      
        }
        else {
            this._cardButtons = null;
        }
    }
    @api areCardLinks = false; // Flag to indicate that the cardButtons should be actually displayed as links
    @api cardSize = 'medium';
    @api cardCss;
    @api fieldClass;
    @api iconClass;
    @api fitImage = false;
    @api isVertical = false; 
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    //tagList;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get isH2() {
        return this.cardTitleLevel === 'h2';
    }
    get isH3() {
        return this.cardTitleLevel === 'h3';
    }
    get isH4() {
        return this.cardTitleLevel === 'h4';
    }

    get cardTitleStr() {
        if (this.isDebug) console.log('cardTitleStr: value ', this.cardTitle);
        if (this.isDebug) console.log('cardTitleStr: type ',(typeof this.cardTitle));
        if (this.isDebug) console.log('cardTitleStr: returning ',(typeof this.cardTitle == 'number' ? '' + this.cardTitle : this.cardTitle));
        return (typeof this.cardTitle == 'number' ? '' + this.cardTitle : this.cardTitle);
    }
    get imageSrc() {
        return (this.cardImage?.includes('delivery/media') ? this.cardImage : '/file-asset/' + this.cardImage);
    }
    get pictoSrc() {
        return (((this.cardImage?.includes('/')) && (!this.cardImage?.includes('delivery/media'))) ? this.cardImage : null);
    }
    /*get imageTitle() {
        //return 'Image pour ' + this.cardTitle;
        return "";
    }*/
    get hasBadgeList() {
        return (this.cardBadgeListJson || this.cardBadgeList || this.isDebug);
    }
    get badgeList() {
        return ((this.cardBadgeListJson) ? this.cardBadgeListJson : ((this.cardBadgeList) ? JSON.parse(this.cardBadgeList) : null));
    }
    get tagList() {
        return ((this.cardTags) ? (this.cardTags.includes(';') ? this.cardTags.split(';') : [this.cardTags]) : null);
    }
    get cardStartClass() {
        return (this.cardStartIcon ? 'fr-card__detail fr-icon-' + this.cardStartIcon : 'fr-card__detail');
    }
    get cardStartDetailsStr() {
        if (this.isDebug) console.log('cardStartDetailsStr: value ', this.cardStartDetails);
        if (this.isDebug) console.log('cardStartDetailsStr: type ',(typeof this.cardStartDetails));
        if (this.isDebug) console.log('cardStartDetailsStr: returning ',(typeof this.cardStartDetails == 'number' ? '' + this.cardStartDetails : this.cardStartDetails));
        return (typeof this.cardStartDetails == 'number' ? '' + this.cardStartDetails : this.cardStartDetails);
    }
    get cardEndClass() {
        return (this.cardEndIcon ? 'fr-card__detail fr-icon-' + this.cardEndIcon : 'fr-card__detail');
    }
    get cardStartEndStr() {
        if (this.isDebug) console.log('cardStartDetailsStr: value ',this.cardEndDetails);
        if (this.isDebug) console.log('cardStartDetailsStr: type ',(typeof this.cardEndDetails));
        if (this.isDebug) console.log('cardStartEndStr: returning ',(typeof this.cardEndDetails == 'number' ? '' + this.cardEndDetails : this.cardEndDetails));
        return (typeof this.cardEndDetails == 'number' ? '' + this.cardEndDetails : this.cardEndDetails);
    }
    get cardClass() {
        let cardClass = 'fr-card';
        // if there are buttons, the global card link is removed.
        if (this.isDebug) console.log('getting cardClass _cardButtons : ',this._cardButtons);
        if ((this.cardTarget) && !(this._cardButtons)) cardClass += ' fr-enlarge-link';
        if (!this.isVertical) cardClass += ' fr-card--horizontal fr-card--horizontal-tier';
        if (this.cardCss) cardClass += ' ' + this.cardCss;
        switch (this.cardSize) {
            case 'medium':
                return  cardClass;
            case 'small':
                return cardClass + ' fr-card--sm';
            case 'large':
                return cardClass + ' fr-card--lg';
            default:
                return  cardClass;
        }
    }
    get cardImageClass() {
        return 'fr-responsive-img fr-responsive-img--16x9 cardImage-' + this.cardSize + (this.fitImage ? ' cardImageFit' : '');
    }
    get pictoSize() {
        switch (this.cardSize) {
            case 'medium':
                return  'large';
            case 'small':
                return 'medium';
            case 'large':
                return 'x-large';
            default:
                return  'large';
        }
    }
    get hasStart() {
        return this.tagList || this.cardStartDetails || this.cardBadgeListJson || this.cardBadgeList || this.isDebug;
    }
    get hasHeader() {
        return this.cardImage || this.cardBadge;
    }
    get hasCardEnd() {
        //return (this.isDebug || this.cardEndDetails);
        return  this.cardEndDetails;
    }


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START card for ',this.cardTitle);
            console.log('connected: card badge ',this.cardBadge);
            console.log('connected: card description ',this.cardDescription);
            console.log('connected: card description fields ',this.cardDescriptionFields);
            console.log('connected: card start details ',this.cardStartDetails);
            console.log('connected: card end details ',this.cardEndDetails);
            console.log('connected: card tags ',JSON.stringify(this.cardTags));
            console.log('connected: card badge list ',this.cardBadgeList);
            console.log('connected: card badge list JSON ',JSON.stringify(this.cardBadgeListJson));
            console.log('connected: card image ',this.cardImage);
            console.log('connected: card target ',this.cardTarget);
            console.log('connected: card buttons ',JSON.stringify(this.cardButtons));
            console.log('connected: vertical variant? ', this.isVertical);
        }

        this.cardTag = this.cardTag || this.cardLabel || this.cardTitle || 'Undefined';
        if (this.isDebug) console.log('connected: cardTag evaluated ', this.cardTag);

        // Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('connected: END card');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START card for ',this.cardTitle);
            console.log('rendered: card badge ',this.cardBadge);
            console.log('rendered: card description ',this.cardDescription);
            console.log('rendered: card description fields ',this.cardDescriptionFields);
            console.log('rendered: card start details ',this.cardStartDetails);
            console.log('rendered: card end details ',this.cardEndDetails);
            console.log('rendered: card tags ',JSON.stringify(this.cardTags));
            console.log('rendered: card badge list ',this.cardBadgeList);
            console.log('rendered: card badge list JSON ',JSON.stringify(this.cardBadgeListJson));
            console.log('rendered: card image ',this.cardImage);
            console.log('rendered: card target ',this.cardTarget);
            console.log('rendered: card buttons ',JSON.stringify(this.cardButtons));
            console.log('rendered: vertical variant? ', this.isVertical);
            
            /*console.log('rendered: card height for ', this.cardTitle);
            console.log('rendered: max card height', CARD_SIZE['height']);
            let currentHeight = this.refs.cardArticle?.getBoundingClientRect()?.height;
            console.log('rendered: current card height', currentHeight);
            console.log('rendered: current card height from style', this.refs.cardArticle.style.height);
            if (CARD_SIZE?.height) {
                if (currentHeight < CARD_SIZE['height']) {
                    this.refs.cardArticle.style.minHeight = '' + CARD_SIZE.height + 'px';
                    console.log('rendered: current card height upgraded',this.refs.cardArticle.getBoundingClientRect().height);
                }
                else {
                    CARD_SIZE['height'] = currentHeight;
                    console.log('rendered: max card height upgraded',CARD_SIZE['height']);
                }
            }
            else {
                CARD_SIZE['height'] = currentHeight;
                console.log('rendered: max card height init',CARD_SIZE['height']);
            }*/

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

            if (this.isDebug) console.log('openTarget: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrCardCmp',event_site: basePathName,event_category:'open_target',event_label:this.cardTag}}}));

            /*this[NavigationMixin.GenerateUrl](newPageRef)
            .then((url) => {
                if (this.isDebug) console.log('openTarget: new url generated ',url);
            });*/

            if (this.isDebug) console.log('openTarget: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrCardCmp',event_site: basePathName,event_category:'config_error',event_label:this.cardTag}}}));

            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    resetInput = () => {
        if (this.isDebug) console.log('resetInput: START for card');
        if (this.cardTitle) {
            if (typeof this.cardTitle == 'number') {
                this.cardTitle = '' + this.cardTitle;
                if (this.isDebug) console.log('resetInput: card title converted ');
            }
            else if (typeof this.cardTitle !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card title ',JSON.stringify(this.cardTitle));
                this.cardTitle = null;
                if (this.isDebug) console.log('resetInput: card title reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card title ', this.cardTitle);
            }
        }
        if (this.cardBadge) {
            if (typeof this.cardBadge == 'number') {
                this.cardBadge = '' + this.cardBadge;
                if (this.isDebug) console.log('resetInput: card badge converted ');
            }
            else if (typeof this.cardBadge !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card badge ',JSON.stringify(this.cardBadge));
                this.cardBadge = null;
                if (this.isDebug) console.log('resetInput: card badge reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card badge ', this.cardBadge);
            }
        }
        if (this.cardDescription) {
            if (typeof this.cardDescription == 'number') {
                this.cardDescription = '' + this.cardDescription;
                if (this.isDebug) console.log('resetInput: card description converted ');
            }
            else if (typeof this.cardDescription !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card description ',JSON.stringify(this.cardDescription));
                this.cardDescription = null;
                if (this.isDebug) console.log('resetInput: card description reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card description ', this.cardDescription);
            }
        }
        if (this.cardStartDetails) {
            if (typeof this.cardStartDetails == 'number') {
                this.cardStartDetails = '' + this.cardStartDetails;
                if (this.isDebug) console.log('resetInput: card start details converted ');
            }
            else if (typeof this.cardStartDetails !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card start details ',JSON.stringify(this.cardStartDetails));
                this.cardStartDetails = null;
                if (this.isDebug) console.log('resetInput: card start details reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card start details ', this.cardStartDetails);
            }
        }
        if (this.cardEndDetails) {
            if (typeof this.cardEndDetails == 'number') {
                this.cardEndDetails = '' + this.cardEndDetails;
                if (this.isDebug) console.log('resetInput: card end details converted ');
            }
            else if (typeof this.cardEndDetails !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card end details ',JSON.stringify(this.cardEndDetails));
                this.cardEndDetails = null;
                if (this.isDebug) console.log('resetInput: card end details reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card end details ', this.cardEndDetails);
            }
        }
        if (this.cardTags) {
            if (typeof this.cardTags == 'number') {
                this.cardTags = '' + this.cardTags;
                if (this.isDebug) console.log('resetInput: card tags converted ');
            }
            else if (typeof this.cardTags !== 'string') {
                if (this.isDebug) console.log('resetInput: resetting card tags ',JSON.stringify(this.cardTags));
                this.cardTags = null;
                if (this.isDebug) console.log('resetInput: card tags reset ');
            }
            else {
                if (this.isDebug) console.log('resetInput: keeping card tags ', this.cardTags);
            }
        }
        if ((this.cardImage) && (typeof this.cardImage !== 'string')) {
            if (this.isDebug) console.log('resetInput: resetting card image ',JSON.stringify(this.cardImage));
            this.cardImage = null;
            if (this.isDebug) console.log('resetInput: card image reset ');
        }
        else {
            if (this.isDebug) console.log('resetInput: keeping card image ', this.cardImage);
        }
        if (this.isDebug) console.log('resetInput: END for card');
    }
}