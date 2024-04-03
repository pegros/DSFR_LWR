import { LightningElement, api } from 'lwc';
import basePath from "@salesforce/community/basePath";

/**
* @slot foldableSection
*/
export default class DsfrContainerDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration Parameters
    //-----------------------------------------------------
    @api title;
    @api titleClass;
    @api message;
    @api messageClass;
    
    @api wrappingClass;

    @api isCollapsible;
    @api isCollapsed;

    @api isDebug = false;


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    get sectionClass() {
        return (this.isCollapsed ? 'fr-collapse' : 'fr-collapse fr-collapse--expanded');
    }
    get ariaExpanded() {
        return '' + !this.isCollapsed;
    }
    urlReworked = false;


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for container ',this.title);
            console.log('connected: titleClass', this.titleClass);
            console.log('connected: message', this.message);
            console.log('connected: messageClass', this.messageClass);
        }
        //Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('connected: END for container ',this.title);
    }
    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for container ',this.title);
            console.log('rendered: titleClass', this.titleClass);
            console.log('rendered: message', this.message);
            console.log('rendered: messageClass', this.messageClass);
        }
        //Handling strange LWR inputs for fields reset to empty (object value instead of null)
        this.resetInput();
        if (this.isDebug) console.log('rendered: END for container ',this.title);
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    expandCollapse(event) {
        if (this.isDebug) console.log('expandCollapse: START with ',this.isCollapsed);
        this.isCollapsed = !this.isCollapsed;
        if (this.isDebug) console.log('expandCollapse: END with ',this.isCollapsed);
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    resetInput = () => {
        if (this.isDebug)console.log('resetInput: START for container');
        if (this.title) {
            if (typeof this.title == 'number') {
                this.title = '' + this.title;
                if (this.isDebug)console.log('resetInput: title converted ',this.title);
            }
            else if  (typeof this.title !== 'string') {
                this.title = null;
                if (this.isDebug)console.log('resetInput: title reset ');
            }
        }
        else {
            if (this.isDebug)console.log('resetInput: null title ',this.title);
        }
        if (this.message) {
            if (typeof this.message == 'number') {
                this.message = '' + this.message;
                if (this.isDebug) console.log('resetInput: message converted ',this.message);
            }
            else if (typeof this.message !== 'string') {
                this.message = null;
                if (this.isDebug)console.log('resetInput: message reset ');
            }
            else if (!this.urlReworked) {
                // @TODO : START Remove after Summer24 fix
                let prefix = `${basePath}/sfsites/c`;
                let regEx = new RegExp(`(?:${prefix})?(/cms/)`, "g");
                this.message = this.message.replace(regEx, prefix + "$1");
                this.urlReworked = true;
                // @TODO : END Remove after Summer24 fix
            }
        }
        else {
            if (this.isDebug)console.log('resetInput: null message ',this.message);
        }
        if (this.isDebug) console.log('resetInput: END for container');
    }
}