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
    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for container');
            console.log('rendered: title', this.title);
            console.log('rendered: titleClass', this.titleClass);
            console.log('rendered: message', this.message);
            console.log('rendered: messageClass', this.messageClass);
        }

        if ((this.message) && (typeof this.message !== 'string')) {
            if (this.isDebug) console.log('rendered: erasing message');
            this.message = null;
        }

        if (this.isDebug) console.log('rendered: END for container');
    }
}