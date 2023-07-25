import { LightningElement, api } from 'lwc';

import { loadStyle } from 'lightning/platformResourceLoader';
import DSFR_RSC from '@salesforce/resourceUrl/dsfr';
import DSFR_SLDS_RSC from '@salesforce/resourceUrl/dsfrSlds';

export default class DsfrLoaderUtl extends LightningElement {

    //-----------------------------------------------------    
    // Configuration Parameters
    //-----------------------------------------------------
    @api isDebug = false;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START loading DSFR and Overrides');
        Promise.all([
            loadStyle(this, DSFR_RSC + '/dsfr.min.css'),
            loadStyle(this, DSFR_RSC + '/utility/utility.min.css'),
            loadStyle(this, DSFR_SLDS_RSC)
            //loadStyle(this, DSFR_SLDS_RSC + '/dsfrSlds.css')
        ]).then(() => {
            if (this.isDebug) console.log('connected: END DSFR and Overrides loaded');
        }).catch((error) => {
            console.warn('connected: END DSFR and Overrides loading failed ',JSON.stringify(error));
        });
        if (this.isDebug) console.log('connected: loading DSFR and Overrides ');
    }
}