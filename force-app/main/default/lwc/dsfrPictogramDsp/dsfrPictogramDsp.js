import { LightningElement, api } from 'lwc';
import DSFR from '@salesforce/resourceUrl/dsfr';

export default class DsfrPictogrammeDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api pictoName;
    @api pictoSize = 'medium';
    @api pictoClass = '';
    @api isDebug = false;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    get pictoSrc() {
        return DSFR + '/artwork/pictograms/' + this.pictoName + '.svg';
    }
    get pictoCss() {
        //(this.pictoClass || '') + 
        return  (this.pictoSize == 'none' ? this.pictoClass : this.pictoClass + ' dsfrPicto dsfrPicto-' + this.pictoSize) ;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        this.pictoName = this.pictoName?.trim();
        if (this.isDebug) {
            console.log('connected: START pictogram');
            console.log('connected: picto name ', this.pictoName);
            console.log('connected: picto size ', this.pictoSize);
            console.log('connected: picto class ', this.pictoClass);
            console.log('connected: END pictogram');
        }
    }
}