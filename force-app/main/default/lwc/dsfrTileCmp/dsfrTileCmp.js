import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DsfrTileCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api tileImage = 'logo';
    @api tileTitle;
    @api tileDescription;
    @api tileTarget;
    @api isVertical = false;
    @api tileCss;
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get imageSrc() {
        return (this.tileImage?.includes('delivery/media') ? this.tileImage : '/file-asset/' + this.tileImage);
    }
    get pictoSrc() {
        return (((this.tileImage?.includes('/')) && (!this.tileImage?.includes('delivery/media'))) ? this.tileImage : null);
    }
    get tileClass() {
        return "fr-tile fr-enlarge-link" + (this.isVertical? '' : " fr-tile--horizontal") + (this.tileCss ? ' ' + this.tileCss : '');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START tile for ',this.tileTitle);
            console.log('connected: tile description ',this.tileDescription);
            console.log('connected: tile image ',this.tileImage);
            console.log('connected: tile target ',this.tileTarget);
            console.log('connected: vertical variant? ', this.isVertical);
        }
        //Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('connected: END tile');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START tile for ',this.tileTitle);
            console.log('rendered: tile description ',this.tileDescription);
            console.log('rendered: tile image ',this.tileImage);
        }
        // Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('rendered: END tile');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for card ',this.tileTitle);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: target ',this.tileTarget);
        if (this.tileTarget) {
            if (this.isDebug) console.log('handleLinkClick: navigating to target ');

            const newPageRef = JSON.parse(this.tileTarget);
            if (this.isDebug) console.log('handleLinkClick: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('handleLinkClick: END opening newPageRef');
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
        if (this.isDebug)console.log('resetInput: START for tile');
        if ((this.cardTitle) && (typeof this.cardTitle !== 'string')) {
            this.tileTitle = null;
            if (this.isDebug)console.log('resetInput: tile title reset ');
        }
        if ((this.tileDescription) && (typeof this.tileDescription !== 'string')) {
            this.tileDescription = null;
            if (this.isDebug)console.log('resetInput: tile description reset ');
        }
        if ((this.tileImage) && (typeof this.tileImage !== 'string')) {
            this.tileImage = null;
            if (this.isDebug)console.log('resetInput: tile image reset ');
        }
        if (this.isDebug)console.log('resetInput: END for tile');
    }
}