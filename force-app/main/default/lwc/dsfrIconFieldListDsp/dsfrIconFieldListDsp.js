import { LightningElement,api } from 'lwc';

export default class DsfrIconFieldListDsp extends LightningElement {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    _values;
    @api 
    get values() {
        return this._values;
    }
    set values(data) {
        if (!data) {
            console.warn('set iconFieldList values: no data provided for IconFieldList ');
            this._values = null;
            return;
        }
        
        try {
            let values;
            if (Array.isArray(data)) {
                values = data;
                if (this.isDebug) console.log('set iconFieldList values: data array used ',JSON.stringify(values));
            }
            else {
                values = JSON.parse(data);
                if (this.isDebug) console.log('set iconFieldList values: data string parsed ',JSON.stringify(values));
            }

            let valueList = [];
            values.forEach(item => {
                if (item.showEmpty || item.value) {
                    if (item.value !== '[object Object]') {
                        if (this.isDebug) console.log('set iconFieldList values: item registered ',JSON.stringify(item));
                        valueList.push(item);
                    }
                    else {
                        if (this.isDebug) console.log('set iconFieldList values: bad value item ignored ',JSON.stringify(item));
                    }
                }
                else {
                    if (this.isDebug) console.log('set iconFieldList values: null value item ignored ',JSON.stringify(item));
                }
            });
            if (this.isDebug) console.log('set iconFieldList values: valueList init ', JSON.stringify(valueList));
            this._values = valueList;
        }
        catch(error) {
            console.error('set iconFieldList values: error while parsing input data ',error);
            this._values = null;
        }
    }

    @api wrappingClass = 'horizontalUL';
    @api fieldClass;
    @api iconClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Component Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        this.wrappingClass = this.wrappingClass || 'horizontalUL'; 
        if (this.isDebug) console.log('connected: START for icon field list');
        if (this.isDebug) console.log('connected: values ', JSON.stringify(this.values));
        if (this.isDebug) console.log('connected: wrappingClass ', this.wrappingClass);
        if (this.isDebug) console.log('connected: fieldClass ', this.fieldClass);
        if (this.isDebug) console.log('connected: iconClass ', this.iconClass);
        if (this.isDebug) console.log('connected: END for icon field list');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START for icon field list');
        if (this.isDebug) console.log('rendered: values ', JSON.stringify(this.values));
        if (this.isDebug) console.log('rendered: wrappingClass ', this.wrappingClass);
        if (this.isDebug) console.log('rendered: fieldClass ', this.fieldClass);
        if (this.isDebug) console.log('rendered: iconClass ', this.iconClass);
        if (this.isDebug) console.log('rendered: END for icon field list');
    }
}