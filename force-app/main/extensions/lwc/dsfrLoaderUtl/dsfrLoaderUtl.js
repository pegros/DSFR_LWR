import { LightningElement, api } from 'lwc';

import { loadStyle } from 'lightning/platformResourceLoader';
import DSFR_RSC from '@salesforce/resourceUrl/dsfr';

export default class DsfrLoaderUtl extends LightningElement {

    //-----------------------------------------------------    
    // Configuration Parameters
    //-----------------------------------------------------
    @api isDebug = false;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START loading DSFR');
        Promise.all([
            loadStyle(this, DSFR_RSC + '/dsfr.min.css'),
            loadStyle(this, DSFR_RSC + '/utility/utility.min.css')
        ]).then(() => {
            if (this.isDebug) console.log('connected: END DSFR loaded');
        });
        if (this.isDebug) console.log('connected: loading DSFR');
    }
}