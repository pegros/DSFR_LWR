import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePathName from '@salesforce/community/basePath';

export default class DsfrTileCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api tileImage = 'logo';
    @api tileTitle;
    @api tileDescription;
    @api tileTag; // For GA4 link tracking
    @api tileTarget;
    @api isVertical = false;
    @api fitImage = false;
    @api tileCss;
    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get imageSrc() {
        return (this.tileImage?.includes('delivery/media') ? this.tileImage : '/file-asset/' + this.tileImage);
    }
    get imageClass() {
        return (this.fitImage ? 'fr-responsive-img tileImage' : 'fr-responsive-img' );
    }
    get pictoSrc() {
        return (((this.tileImage?.includes('/')) && (!this.tileImage?.includes('delivery/media'))) ? this.tileImage : null);
    }
    get tileClass() {
        return 'fr-tile'
                + (this.tileTarget ? ' fr-enlarge-link' : '')
                + (this.isVertical? '' : ' fr-tile--horizontal')
                + (this.tileCss ? ' ' + this.tileCss : '');
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

        this.tileTag = this.tileTag || this.tileLabel || this.tileTitle || 'Undefined';
        if (this.isDebug) console.log('connected: tileTag evaluated ', this.tileTag);
        
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
            if (this.isDebug) console.log('openTarget: navigating to target ');

            if (this.isDebug) console.log('openTarget: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrTileCmp',event_site: basePathName,event_category:'open_target',event_label:this.tileTag}}}));

            const newPageRef = JSON.parse(this.tileTarget);
            if (this.isDebug) console.log('openTarget: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('openTarget: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrTileCmp',event_site: basePathName,event_category:'config_error',event_label:this.tileTag}}}));

            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    resetInput = () => {
        if (this.isDebug)console.log('resetInput: START for tile');
        if (this.tileTitle) {
            if (typeof this.tileTitle == 'number') {
                this.tileTitle = '' + this.tileTitle;
                if (this.isDebug)console.log('resetInput: tile title converted ',this.tileTitle);
            }
            else if  (typeof this.tileTitle !== 'string') {
                this.tileTitle = null;
                if (this.isDebug)console.log('resetInput: tile title reset ');
            }
        }
        if (this.tileDescription) {
            if (typeof this.tileDescription == 'number') {
                this.tileDescription = '' + this.tileDescription;
                if (this.isDebug)console.log('resetInput: tile description converted',this.tileDescription);
            }
            else if (typeof this.tileDescription !== 'string') {
                this.tileDescription = null;
                if (this.isDebug)console.log('resetInput: tile description reset ');
            }
        }
        if ((this.tileImage) && (typeof this.tileImage !== 'string')) {
            this.tileImage = null;
            if (this.isDebug)console.log('resetInput: tile image reset ');
        }
        if (this.isDebug)console.log('resetInput: END for tile');
    }
}