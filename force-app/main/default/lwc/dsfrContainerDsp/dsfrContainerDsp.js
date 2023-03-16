import { LightningElement, api } from 'lwc';

export default class DsfrContainerDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration Parameters
    //-----------------------------------------------------
    @api title;
    @api titleClass;
    @api message;
    @api messageClass;
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for container');
            console.log('connected: title', this.title);
            console.log('connected: titleClass', this.titleClass);
            console.log('connected: message', this.message);
            console.log('connected: messageClass', this.messageClass);
            console.log('connected: END for container');
        }
    }
}