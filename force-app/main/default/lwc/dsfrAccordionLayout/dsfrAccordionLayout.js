import { LightningElement,api } from 'lwc';

    //-----------------------------------------------------
    // Content Sections
    //-----------------------------------------------------
/**
 * @slot section1
 * @slot section2
 * @slot section3
 * @slot section4
 * @slot section5
 */

export default class DsfrAccordeonLayout extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title1;
    @api isOpen1 = false;
    @api title2;
    @api isOpen2 = false;
    @api title3;
    @api isOpen3 = false;
    @api title4;
    @api isOpen4 = false;
    @api title5;
    @api isOpen5 = false;

    @api isDebug = false;
    
    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    get sectionClass1() {
        return (this.isOpen1 ? 'fr-collapse--expanded' : 'fr-collapse' );
    }
    get sectionClass2() {
        return (this.isOpen2 ? 'fr-collapse--expanded' : 'fr-collapse' );
    }
    get sectionClass3() {
        return (this.isOpen3 ? 'fr-collapse fr-collapse--expanded' : 'fr-collapse' );
    }
    get sectionClass4() {
        return (this.isOpen4 ? 'fr-collapse fr-collapse--expanded' : 'fr-collapse' );
    }
    get sectionClass5() {
        return (this.isOpen5 ? 'fr-collapse--expanded' : 'fr-collapse' );
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START accordeon');
            console.log('connected: title 1 ', this.title1);
            console.log('connected: isOpen 1 ', this.isOpen1);
            console.log('connected: title 2 ', this.title2);
            console.log('connected: isOpen 2 ', this.isOpen2);
            console.log('connected: title 3 ', this.title3);
            console.log('connected: isOpen 3 ', this.isOpen3);
            console.log('connected: title 4 ', this.title4);
            console.log('connected: isOpen 4 ', this.isOpen4);
            console.log('connected: title 5 ', this.title5);
            console.log('connected: isOpen 5 ', this.isOpen5);
            console.log('connected: END accordeon');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    toggleSection = function(event) {
        if (this.isDebug) console.log('toggleSection: START accordeon');
        if (this.isDebug) console.log('toggleSection: event ',event);
        if (this.isDebug) console.log('toggleSection: event target value ', event?.target?.value);
        event.stopPropagation();
        event.preventDefault();
        
        if (this.isDebug) console.log('toggleSection: current value ', this[event?.target?.value]);
        this[event?.target?.value] = !(this[event?.target?.value]);
        if (this.isDebug) console.log('toggleSection: toggled value ', this[event?.target?.value]);

        if (this.isDebug) console.log('toggleSection: END accordeon');
    }
}