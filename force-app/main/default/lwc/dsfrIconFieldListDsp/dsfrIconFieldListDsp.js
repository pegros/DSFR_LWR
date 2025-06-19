import { LightningElement,api,wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
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
                let dataString = data;
                if (data.includes('ESCAPE(((')) {
                    if (this.isDebug) console.log('set iconFieldList values: quote escaping required ');

                    let escapeMatches = [...data.matchAll(/ESCAPE(\(\(\()(.*?)(\)\)\))/gms)];
                    if (this.isDebug) console.log('set iconFieldList values: quote escapeMatches found ',escapeMatches);
    
                    escapeMatches.forEach(matchIter => {
                        if (this.isDebug) console.log('set iconFieldList values: processing matchIter ',matchIter);
                        let newMatchValue = (matchIter[2]).replace(/"/gms,'\\"');
                        newMatchValue = (newMatchValue).replace(/[\r\n\t]/gms,' ');
                        if (this.isDebug) console.log('set iconFieldList values: newMatchValue ', newMatchValue);
                        dataString = dataString.replace(matchIter[0],newMatchValue);
                    });
                    if (this.isDebug) console.log('set iconFieldList values: mergeResult HTML escaped');
                }
                else {
                    if (this.isDebug) console.log('set iconFieldList values: no HTML escaping required ');
                }
                values = JSON.parse(dataString);
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
            this._values = (valueList.length > 0 ? valueList : null);
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
    // Technical parameters
    //-----------------------------------------------------
    isSiteBuilder = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @wire(CurrentPageReference)
    wiredPage(data){
        if (this.isDebug) console.log('wiredPage: START iconFieldList for values ',this._values);
        if (this.isDebug) console.log('wiredPage: with page ',JSON.stringify(data));

        let app = data && data.state && data.state.app;
        if (this.isDebug) console.log('wiredPage: app extracted ',app);
        this.isSiteBuilder = (app === 'commeditor');

        if (this.isDebug) console.log('wiredPage: END iconFieldList with isSiteBuilder',this.isSiteBuilder);
    };

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