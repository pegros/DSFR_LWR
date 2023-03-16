import { LightningElement, api } from 'lwc';

export default class DsfrTagDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api tagLabel;
    @api tagIcon;
    @api tagSize;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    tagClass;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START tag ', this.tagLabel);
            console.log('connected: size ', this.tagSize);
        }
        let tagClass = 'fr-tag';
        if (this.tagSize === 'small')  tagClass += ' fr-tag--sm';
        if (this.tagIcon)  tagClass += ' fr-tag--icon-left fr-fi-' + this.tagIcon;
        this.tagClass = tagClass;
        if (this.isDebug) {
            console.log('connected: tagClass init ', this.tagClass);
            console.log('connected: END tag');
        }
    }
}