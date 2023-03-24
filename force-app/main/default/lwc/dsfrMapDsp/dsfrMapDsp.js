import { LightningElement, api } from 'lwc';

export default class DsfrMapDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api
    get mainLocation() {
        return JSON.stringify(this.mapMarkers);
    }
    set mainLocation(value) {
        try {
            this.mapMarkers = [{
                location: JSON.parse(value),
                title: this.mainTitle,
                description: this.mainDescription
            }];
            if (this.isDebug) console.log('set mainLocation: mapMarkers init ', JSON.stringify(this.mapMarkers));
        }
        catch (error) {
            console.warn('set mainLocation: issue with location ', error);
        }
    }
    @api mainTitle;
    @api mainDescription;
    @api mapLegend = 'Localisation';
    @api mapZoom = 10;
    @api mapRatio = '1x1';
    @api mapCss;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    mapMarkers;
    mapOptions= {
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true
    }

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    get mapClass() {
        return 'dsfrMap fr-content-media ' + (this.mapCss || '');
    }

    get mapCmpClass() {
        return 'dsfrMapCmp fr-responsive-vid fr-responsive-vid--' + this.mapRatio;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START map for title ', this.mainTitle);
            console.log('connected: main description ', this.mainDescription);
            console.log('connected: map legend ', this.mapLegend);
            console.log('connected: wrapping CSS ', this.MapCss);
            console.log('connected: zoom level ', this.mapZoom);
            console.log('connected: mapMarkers ', JSON.stringify(this.mapMarkers));
            console.log('connected: END map');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START map for title ', this.mainTitle);
            console.log('rendered: main description ', this.mainDescription);
            console.log('rendered: map legend ', this.mapLegend);
            console.log('rendered: mapMarkers ', JSON.stringify(this.mapMarkers));
        }
        this.resetInput();
        if (this.isDebug) console.log('rendered: END map');
    }


     //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    resetInput = () => {
        if (this.isDebug)console.log('resetInput: START for map');
        if ((this.mainTitle) && (typeof this.mainTitle !== 'string')) {
            this.mainTitle = null;
            if (this.isDebug)console.log('resetInput: main title reset ');
        }
        if ((this.mainDescription) && (typeof this.mainDescription !== 'string')) {
            this.mainDescription = null;
            if (this.isDebug)console.log('resetInput: main description reset ');
        }
        if ((this.mapLegend) &&  (typeof this.mapLegend !== 'string')) {
            this.mapLegend = null;
            if (this.isDebug)console.log('resetInput: map legend reset ');
        }
        if (this.isDebug)console.log('resetInput: END for map');
    }
}