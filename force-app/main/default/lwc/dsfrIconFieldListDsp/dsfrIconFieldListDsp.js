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
            console.warn('set values: no data provided for IconFieldList ');
            this._values = null;
            return;
        }
        
        try {
            let values;
            if (Array.isArray(data)) {
                values = data;
                if (this.isDebug) console.log('set values: data array used ',values);
            }
            else {
                values = JSON.parse(data);
                if (this.isDebug) console.log('set values: data string parsed ',values);
            }

            let valueList = [];
            values.forEach(item => {
                if (item.value) {
                    if (item.value !== '[object Object]') {
                        if (this.isDebug) console.log('set values: item registered ',item);
                        valueList.push(item);
                    }
                    else {
                        if (this.isDebug) console.log('set values: bad value item ignored ',item);
                    }
                }
                else {
                    if (this.isDebug) console.log('set values: null value item ignored ',item);
                }
            });
            if (this.isDebug) console.log('set values: valueList init ', JSON.stringify(valueList));
            this._values = valueList;
        }
        catch(error) {
            console.error('set values: error while parsing input data ',error);
            this._values = null;
        }
    }

    @api wrappingClass;
    @api fieldClass;
    @api iconClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Component Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for icon field list');
        if (this.isDebug) console.log('connected: values ', this.values);
        if (this.isDebug) console.log('connected: END for icon field list');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START for icon field list');
        if (this.isDebug) console.log('rendered: values ', this.values);
        if (this.isDebug) console.log('rendered: END for icon field list');
    }
}