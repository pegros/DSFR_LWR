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
    @api excerpt;
    @api excerptClass;
    @api message;
    @api messageClass;
    
    @api wrappingClass;

    @api isCollapsible;
    @api isCollapsed;
    @api linkTitle = "Nouvelle fenêtre";

    @api isDebug = false;


    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get isH1() {
        return this.titleClass === 'fr-h1';
    }
    get isH2() {
        return this.titleClass === 'fr-h2';
    }
    get isH3() {
        return this.titleClass === 'fr-h3';
    }
    get sectionClass() {
        return (this.isCollapsed ? 'fr-collapse' : 'fr-collapse fr-collapse--expanded');
    }
    get ariaExpanded() {
        return '' + !this.isCollapsed;
    }
    get ariaLabel() {
        return (this.isCollapsed ? 'Ouvrir la section ' : 'Fermer la section ') + this.title;
    }
    get finalExcerptClass() {
        return (this.message ? this.excerptClass + ' fr-mb-4v' : this.excerptClass);
    }

    //----------------------------------------------------------------
    // Technical internal properties
    //----------------------------------------------------------------
    urlReworked = false;


    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for container ',this.title);
            console.log('connected: titleClass', this.titleClass);
            console.log('connected: excerpt', this.excerpt);
            console.log('connected: excerptClass', this.excerptClass);
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
            console.log('rendered: excerpt', this.excerpt);
            console.log('rendered: excerptClass', this.excerptClass);
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
            if (this.isDebug)console.log('resetInput: reworking title ',this.title);
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

        if (this.excerpt) {
            if (this.isDebug)console.log('resetInput: reworking excerpt ',this.excerpt);
            if (typeof this.excerpt == 'number') {
                this.excerpt = '' + this.excerpt;
                if (this.isDebug) console.log('resetInput: excerpt converted ',this.excerpt);
            }
            else if (typeof this.excerpt !== 'string') {
                this.excerpt = null;
                if (this.isDebug) console.log('resetInput: excerpt reset ');
            }
        }
        else {
            if (this.isDebug) console.log('resetInput: null excerpt ',this.excerpt);
        }

        let urlReworked = this.urlReworked;
        if (this.isDebug)console.log('resetInput: urlReworked ? ',this.urlReworked);
        if (this.message) {
            if (this.isDebug)console.log('resetInput: reworking message ',this.message);

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
                urlReworked = true;
                // @TODO : END Remove after Summer24 fix
            
                // replace div by p
                let divRegEx = new RegExp(`<div([^>]*)>`, "g");
                this.message = this.message.replace(divRegEx, '<p' + "$1" + '>');
                this.message = this.message.replaceAll('</div>','</p>');
                if (this.isDebug) console.log('resetInput: divs replaced ',this.message);
                // replace <<< and >>> HTML escaped text by < and >
                this.message = this.message.replaceAll('&gt;&gt;&gt;','>');
                this.message = this.message.replaceAll('&lt;&lt;&lt;','<');
                if (this.isDebug) console.log('resetInput: < and > replaced ',this.message);
                
                // replace xxxx="yyy" HTML escaped text
                let propertyRegEx = new RegExp(`(\\S*)&#61;&#34;(\\S*)&#34;`,"g");
                if (this.isDebug) console.log('resetInput: property matches ',this.message.match(propertyRegEx));
                this.message = this.message.replace(propertyRegEx, "$1" + '="' + "$2" + '"');
                if (this.isDebug) console.log('resetInput: properties replaced ',this.message);

                if (this.linkTitle) {
                    let linkRegEx = new RegExp(`<a `,"g");
                    this.message = this.message.replace(linkRegEx, '<a ' + ' title="' + this.linkTitle +'" ');
                    if (this.isDebug) console.log('resetInput: link titles added ',this.message);
                }            
            }
            this.urlReworked = urlReworked;
        }
        else {
            if (this.isDebug)console.log('resetInput: null message ',this.message);
        }

        if (this.isDebug) console.log('resetInput: END for container');
    }
}