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

export default class DsfrTabLayout extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title1;
    @api titleIcon1;
    @api title2;
    @api titleIcon2;
    @api title3;
    @api titleIcon3;
    @api title4;
    @api titleIcon4;
    @api title5;
    @api titleIcon5;

    @api openTab = "1";

    @api isDebug = false;
    
    //-----------------------------------------------------
    // Internal parameters
    //-----------------------------------------------------
    isOpen1 = true;
    isOpen2 = false;
    isOpen3 = false;
    isOpen4 = false;
    isOpen5 = false;

    //-----------------------------------------------------
    // Custom getters 
    //-----------------------------------------------------
    get tabIndex1() {return (this.isOpen1 ? '0' : '-1');};
    get tabIndex2() {return (this.isOpen2 ? '0' : '-1');};
    get tabIndex3() {return (this.isOpen3 ? '0' : '-1');};
    get tabIndex4() {return (this.isOpen4 ? '0' : '-1');};
    get tabIndex5() {return (this.isOpen5 ? '0' : '-1');};

    get titleClass1() {return (this.titleIcon1 ? 'fr-tabs__tab fr-tabs__tab--icon-left fr-icon-' + this.titleIcon1 : 'fr-tabs__tab');};
    get titleClass2() {return (this.titleIcon2 ? 'fr-tabs__tab fr-tabs__tab--icon-left fr-icon-' + this.titleIcon2 : 'fr-tabs__tab');};
    get titleClass3() {return (this.titleIcon3 ? 'fr-tabs__tab fr-tabs__tab--icon-left fr-icon-' + this.titleIcon3 : 'fr-tabs__tab');};
    get titleClass4() {return (this.titleIcon4 ? 'fr-tabs__tab fr-tabs__tab--icon-left fr-icon-' + this.titleIcon4 : 'fr-tabs__tab');};
    get titleClass5() {return (this.titleIcon5 ? 'fr-tabs__tab fr-tabs__tab--icon-left fr-icon-' + this.titleIcon5 : 'fr-tabs__tab');};

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START tabs');
            console.log('connected: title 1 ', this.title1);
            console.log('connected: icon 1 ', this.titleIcon1);
            console.log('connected: title 2 ', this.title2);
            console.log('connected: icon 2 ', this.titleIcon2);
            console.log('connected: title 3 ', this.title3);
            console.log('connected: icon 3 ', this.titleIcon3);
            console.log('connected: title 4 ', this.title4);
            console.log('connected: icon 4 ', this.titleIcon4);
            console.log('connected: title 5 ', this.title5);
            console.log('connected: icon 5 ', this.titleIcon5);
            console.log('connected: openTab ', this.openTab);
        }

        if (this.openTab !== "1") {
            if (this.isDebug) console.log('connected: resetting isOpen flags');
            this.isOpen1 = false;
            this[('isOpen' + this.openTab)] = true;
        }

        if (this.isDebug) {
            console.log('connected: isOpen1 ', this.isOpen1);
            console.log('connected: isOpen2 ', this.isOpen2);
            console.log('connected: isOpen3 ', this.isOpen3);
            console.log('connected: isOpen4 ', this.isOpen4);
            console.log('connected: isOpen5 ', this.isOpen5);
            console.log('connected: END tabs');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    toggleSection = function(event) {
        if (this.isDebug) console.log('toggleSection: START tabs');
        if (this.isDebug) console.log('toggleSection: event ',event);
        if (this.isDebug) console.log('toggleSection: event target value ', event?.target?.value);
        if (this.isDebug) console.log('toggleSection: current openTab value ', this.openTab);
        event.stopPropagation();
        event.preventDefault();

        if (event.target.value !== this.openTab) {
            if (this.isDebug) console.log('toggleSection: changing selected tab');
            this[('isOpen' + this.openTab)] = false;
            this.openTab = event.target.value;
            this[('isOpen' + this.openTab)] = true;
            if (this.isDebug) {
                console.log('toggleSection: new openTab ', this.openTab);
                console.log('toggleSection: isOpen1 ', this.isOpen1);
                console.log('toggleSection: isOpen2 ', this.isOpen2);
                console.log('toggleSection: isOpen3 ', this.isOpen3);
                console.log('toggleSection: isOpen4 ', this.isOpen4);
                console.log('toggleSection: isOpen5 ', this.isOpen5);
            }
        }
        else {
            if (this.isDebug) console.log('toggleSection: no tab change');
        }

        if (this.isDebug) console.log('toggleSection: END tabs');
    }
}