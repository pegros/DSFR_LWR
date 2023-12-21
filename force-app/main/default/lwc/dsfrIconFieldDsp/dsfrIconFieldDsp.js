import { LightningElement, api } from 'lwc';

export default class DsfrIconFieldDsp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    _value = null;
    @api 
    get value() {
        return this._value;
    }
    set value(data) {
        if (this.isDebug) console.log('set value: value provided for IconField ',data)
        if (data) {
            if (typeof data == 'number') {
                this._value = '' + data;
                if (this.isDebug) console.log('set value: value converted for IconField ',this._value);
            }
            else if (typeof data !== 'string') {
                this._value = null;
                if (this.isDebug) console.log('set value: value reset to null for IconField ',this._value);
            }
            else {
                this._value = data;
                if (this.isDebug) console.log('set value: value kept for IconField ',this._value);
            }
        }
        else {
            this._value = null;
            if (this.isDebug) console.log('set value: value reset to null for IconField ');
        }
    }
    @api iconName;
    @api valuePrefix;
    @api valueSuffix;
    @api showEmpty;
    @api iconClass;
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    get doShowValue() {
        return (this.showEmpty || this._value);
    }

    //-----------------------------------------------------
    // Component Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for icon field');
            console.log('connected: icon name ', this.iconName);
            console.log('connected: value ', this.value);
            console.log('connected: showEmpty ', this.showEmpty);
            console.log('connected: prefix ', this.valuePrefix);
            console.log('connected: suffix ', this.valueSuffix);
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
            console.log('rendered: showEmpty ', this.showEmpty);
            console.log('rendered: prefix ', this.valuePrefix);
            console.log('rendered: suffix ', this.valueSuffix);
            console.log('rendered: END for icon field');
        }
    }

}