import { LightningElement, api } from 'lwc';

export default class DsfrIconFieldDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    _value;
    @api 
    get value() {
        return this._value;
    }
    set value(data) {
        if ((data) && (typeof data !== 'string')) {
            this._value = null;
            if (this.isDebug) console.log('set value: value reset to null for IconField ',data);
        }
        else {
            this._value = data;
            if (this.isDebug) console.log('set value: value kept for IconField ',data);
        }
    }
    @api iconName;
    @api iconClass;
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Component Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for icon field');
            console.log('connected: icon name ', this.iconName);
            console.log('connected: value ', this.value);
        }

        this.iconClass = (this.iconClass ? this.iconClass : '') + ' fr-icon-' + this.iconName;
        if (this.isDebug) console.log('connected: icon class init ', this.iconName);
        
        if (this.isDebug) console.log('connected: END for icon field');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for icon field');
            console.log('rendered: icon name ', this.iconName);
            console.log('rendered: value ', this.value);
            console.log('rendered: END for icon field');
        }
    }

}