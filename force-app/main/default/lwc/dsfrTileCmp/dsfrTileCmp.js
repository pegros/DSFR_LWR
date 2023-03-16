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
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get imageSrc() {
        return '/file-asset/' + this.tileImage;
    }
    get tileClass() {
        return "fr-tile fr-enlarge-link" + (this.isVertical? '' : " fr-tile--horizontal");
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START card for ',this.tileTitle);
            console.log('connected: tile description ',this.tileDescription);
            console.log('connected: tile image ',this.tileImage);
            console.log('connected: tile target ',this.tileTarget);
            console.log('connected: vertical variant? ', this.isVertical);
            console.log('connected: END card');
        }
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
}