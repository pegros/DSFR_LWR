import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi'; 
import basePathName from '@salesforce/community/basePath';

import SELECT_LABEL     from '@salesforce/label/c.dsfrCombinedPicklistSelectLabel';
import SELECT_MESSAGE   from '@salesforce/label/c.dsfrCombinedPicklistSelectMessage';
import SELECT_MISSING   from '@salesforce/label/c.dsfrCombinedPicklistSelectMissing';
import ADD_LABEL        from '@salesforce/label/c.dsfrCombinedPicklistAddLabel';
import ADD_TITLE        from '@salesforce/label/c.dsfrCombinedPicklistAddTitle';
import DELETE_TITLE     from '@salesforce/label/c.dsfrCombinedPicklistDeleteTitle';

export default class DsfrCombinedPicklistCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title;
    @api message;
    @api tag; // for GA4 tracking
    @api fieldLabels;
    @api fieldName;
    @api objectApiName;
    @api recordId;

    @api wrappingCss;
    @api separator = ' - ';

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    fieldFullName;
    labels;
    fieldValues;
    recordTypeId;
    recordValues;
    isReady;
    isSaving = false;   // spinner display control

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    selectLabel = SELECT_LABEL;
    addLabel = ADD_LABEL;
    addTitle = ADD_TITLE;
    deleteTitle = DELETE_TITLE;

    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    /*get addAriaLabel() {
        if (this.isDebug) console.log('addAriaLabel: returning ',this.addLabel + ' ' + this.fieldValues[0].label);
        return this.addLabel + ' ' + this.fieldValues[0].label;
    }*/

    //-----------------------------------------------------
    // Context Data
    //-----------------------------------------------------
    @wire(getRecord, { recordId: '$recordId', fields: '$fieldFullName' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START for Combined Picklist');
        if (data) {
            if (this.isDebug) console.log('wiredRecord: record data fetched ', JSON.stringify(data));
            this.recordTypeId = data.recordTypeId;
            if (this.isDebug) console.log('wiredRecord: recordTypeId set ', this.recordTypeId);

            if (data.fields[this.fieldName].value) {
                if (this.isDebug) console.log('wiredRecord: processing field value ', data.fields[this.fieldName].value);

                let fieldValues = data.fields[this.fieldName].value.split(';');
                if (this.isDebug) console.log('wiredRecord: field values split ', fieldValues);

                //let fieldDisplayValues = data.fields[this.fieldName].displayValue.split(';');
                //if (this.isDebug) console.log('wiredRecord: field displayed values split ', fieldDisplayValues);
                
                let recordValues = [];
                fieldValues.forEach( (item,index) => {
                    if (this.isDebug) console.log('wiredRecord: processing value # ', index);
                    if (this.isDebug) console.log('wiredRecord: and content ', item);
                    let newItem = {
                        value : item,
                        //displayValue : fieldDisplayValues[index],
                        details: []
                    }
                    /*let newItemValues = item.split(this.separator);
                    let newItemLabels = fieldDisplayValues[index].split(this.separator);
                    newItemValues.forEach( (itemUnit,indexUnit) => {
                        if (this.isDebug) console.log('wiredRecord: processing unit # ', indexUnit);
                        newItem.details.push({value: itemUnit, label: newItemLabels[indexUnit]});
                    });
                    if (this.isDebug) console.log('wiredRecord: newItem init ', JSON.stringify(newItem));*/
                    recordValues.push(newItem);
                });
                this.recordValues = recordValues;
                if (this.isDebug) console.log('wiredRecord: record Values init ', JSON.stringify(this.recordValues));

                this.initLabels();
                if (this.isDebug) console.log('wiredRecord: value labels reviewed');

                this.filterValues();
                if (this.isDebug) console.log('wiredRecord: picklist Values filtered');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: no field value returned ');
                this.recordValues = null;
            }
        }
        else if (error) {
            console.warn('wiredRecord: record data fetch failed ', JSON.stringify(error));
        }
        if (this.isDebug) console.log('wiredRecord: END for Combined Picklist');
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: '$fieldFullName' })
    wiredPicklist({ error, data }) {
        if (this.isDebug) console.log('wiredPicklist: START for Combined Picklist');
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: Picklist description fetched ', JSON.stringify(data));

            if (data.values) {
                if (this.isDebug) console.log('wiredPicklists: processing Picklist values');

                let fieldValues = [];
                this.labels.forEach(itemLabel => {
                    fieldValues.push({label: itemLabel, selectAriaLabel: SELECT_LABEL + ' ' +  itemLabel, values: new Map()});
                });
                if (this.isDebug) console.log('wiredPicklists: fieldValues init ', JSON.stringify(fieldValues));

                if (this.isDebug) console.log('wiredPicklists: processing Picklist values ', JSON.stringify(data.values));
                data.values.forEach( (item) => {
                    if (this.isDebug) console.log('wiredPicklist: processing picklist value ', JSON.stringify(item));

                    let itemValues = item.value.split(this.separator);
                    //if (this.isDebug) console.log('wiredPicklist: values split ', JSON.stringify(itemValues));
                    let itemLabels = item.label.split(this.separator);
                    //if (this.isDebug) console.log('wiredPicklist: labels split ', JSON.stringify(itemLabels));

                    itemValues.forEach((itemUnit, indexUnit) => {
                        if (this.isDebug) console.log('wiredPicklist: processing value ', itemUnit);
                        if (!(fieldValues[indexUnit].values.has(itemUnit))) {
                            if (this.isDebug) console.log('wiredPicklist: registering value ', itemUnit);
                            fieldValues[indexUnit].values.set(itemUnit, {label: itemLabels[indexUnit], value: itemUnit, key: itemUnit + '-' + indexUnit});
                        }
                        /*else {
                            if (this.isDebug) console.log('wiredPicklist: value already registered ', itemUnit);
                            if (this.isDebug) console.log('wiredPicklist: in ', JSON.stringify(fieldValues[indexUnit]));
                        }*/
                    });
                });
                fieldValues.forEach( item => {
                    item.values = Array.from(item.values.values());
                    item.values.unshift({label:SELECT_MESSAGE,value:"",key:item.label});
                });
                this.fieldValues = fieldValues;
                if (this.isDebug) console.log('wiredPicklist: fieldValues finalized ', JSON.stringify(this.fieldValues));

                this.initLabels();
                if (this.isDebug) console.log('wiredPicklist: value labels reviewed');
                
                this.filterValues();
                if (this.isDebug) console.log('wiredPicklist: picklist Values filtered');
            }
            else {
                console.warn('wiredPicklist: no Picklist value returned ');
            }
        }
        else if (error) {
            console.warn('wiredPicklists: Picklist fetch failed ', JSON.stringify(error));
        }
        if (this.isDebug) console.log('wiredPicklists: END for Combined Picklist');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Combined Picklist ',this.fieldName);
        if (this.isDebug) console.log('connected: recordId ',this.recordId);
        if (this.isDebug) console.log('connected: objectApiName ',this.objectApiName);

        if ((this.objectApiName) && (this.fieldName)) {
            this.fieldFullName = this.objectApiName + '.' + this.fieldName;
            if (this.isDebug) console.log('connected: fieldFullName init ',this.fieldFullName);
        }
        else {
            console.warn('connected: END KO / missing object of field API Name for Combined Picklist ');
            return;
        }

        if (this.isDebug) console.log('connected: field Labels configured ',this.fieldLabels);
        try {
            this.labels = JSON.parse(this.fieldLabels);
            if (this.isDebug) console.log('connected: field Labels parsed ',this.labels);
        }
        catch(error) {
            console.warn('connected: END KO / field Labels parsing failed for Combined Picklist ', JSON.stringify(error));
            return;
        }

        this.tag = this.tag || this.title || 'Undefined';
        if (this.isDebug) console.log('connected: tag evaluated ', this.tag);

        if (this.isDebug) console.log('connected: END for Combined Picklist');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for Combined Picklist',event);    
        if (this.isDebug) console.log('handleSelect: event details ',JSON.stringify(event.detail));    
        if (this.isDebug) console.log('handleSelect: event src name',event.srcElement.name);    
        if (this.isDebug) console.log('handleSelect: event src name',event.srcElement);    
        
        let selectItem = event.srcElement;
        if (event.detail.value) {
            if (this.isDebug) console.log('handleSelect: value properly set ',event.detail.value); 
            selectItem.setCustomValidity('');
            selectItem.reportValidity();
            if (this.isDebug) console.log('handleSelect: END OK for Combined Picklist'); 
        }
        else {
            console.warn('handleSelect: missing value for selector ',selectItem.name); 
            selectItem.setCustomValidity(SELECT_MISSING);
            selectItem.reportValidity();
            console.warn('handleSelect: END KO for Combined Picklist'); 
        }
    }

    handleAdd(event) {
        if (this.isDebug) console.log('handleAdd: START for Combined Picklist',event);    

        let selectValues = this.template.querySelectorAll('lightning-select');
        if (this.isDebug) console.log('handleAdd: select elements found',selectValues);  
        
        let newValue = {details: []};
        let valueList = [];
        let labelList = [];
        if (this.isDebug) console.log('handleAdd: fieldValues fetched ', JSON.stringify(this.fieldValues));

        let isKO = false;
        selectValues.forEach(item => {
            if (this.isDebug) console.log('handleAdd: processing selector ',item);  
            if (this.isDebug) console.log('handleAdd: with name ',item.name);  
            if (this.isDebug) console.log('handleAdd: with current value ',item.value);  

            if (item.value) {
                let itemValues = this.fieldValues.find(iterField => iterField.label === item.name);
                if (this.isDebug) console.log('handleAdd: itemValues fetched ', JSON.stringify(itemValues));  
                let itemValue = itemValues.values.find(iterValue => iterValue.value === item.value)
                if (this.isDebug) console.log('handleAdd: itemValue found ',JSON.stringify(itemValue));  
                newValue.details.push({label: itemValue.label, value: item.value});
                valueList.push(item.value);
                labelList.push(itemValue.label);
                item.setCustomValidity('');
            }
            else {
                console.warn('handleAdd: missing value for selector ',item.name); 
                isKO = true;
                item.setCustomValidity(SELECT_MISSING);
            }
            item.reportValidity();
        });

        if (isKO) {
            if (this.isDebug) console.log('handleAdd: END KO for Combined Picklist');
            return;
        }

        newValue.value = valueList.join(this.separator);
        newValue.displayValue = labelList.join(this.separator);
        if (this.isDebug) console.log('handleAdd: newValue init', JSON.stringify(newValue));  

        if (this.isDebug) console.log('handleAdd: current recordValues ', JSON.stringify(this.recordValues));  
        if (!this.recordValues) this.recordValues = [];
        this.recordValues.push(newValue);
        if (this.isDebug) console.log('handleAdd: recordValues updated ', JSON.stringify(this.recordValues));  
        if (this.isDebug) console.log('handleAdd: recordValues updated ', JSON.stringify(this.recordValues.slice()));  

        this.updateRecord('add_value');
            
        if (this.isDebug) console.log('handleAdd: END OK for Combined Picklist');
    }

    handleRemove(event) {
        if (this.isDebug) console.log('handleRemove: START for Combined Picklist',event);

        const value2remove = event.target.value;
        if (this.isDebug) console.log('handleRemove: removing item ',value2remove);

        const index = this.recordValues.findIndex(item => item.value === value2remove);
        if (index > -1) {
            if (this.isDebug) console.log('handleRemove: removing element # ', index);
            if (this.isDebug) console.log('handleRemove: current record Values ', JSON.stringify(this.recordValues));
            this.recordValues = this.recordValues.toSpliced(index, 1); 
            if (this.isDebug) console.log('handleRemove: record Values updated ', JSON.stringify(this.recordValues));

            this.updateRecord('remove_value');
        }
        else {
            console.warn('handleRemove: item not found');
        }
        if (this.isDebug) console.log('handleRemove: END for Combined Picklist');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    filterValues = () => {
        if (this.isDebug) console.log('filterValues: START for Combined Picklist');

        if ((this.recordValues) && (this.fieldValues)) {
            if (this.isDebug) console.log('filterValues: processing fieldValues ', JSON.stringify((this.fieldValues[0]).values));
            if (this.isDebug) console.log('filterValues: vs recordValues ', JSON.stringify(this.recordValues));

            (this.fieldValues[0]).values.forEach(item => {
                if (this.isDebug) console.log('filterValues: reviewing ', JSON.stringify(item));

                let itemIndex = this.recordValues.findIndex(itemVal => itemVal.details[0].value === item.value );
                if (this.isDebug) console.log('filterValues: itemIndex determined ', itemIndex);

                if (itemIndex > -1) {
                    item.disabled = true;
                }
                else {
                    item.disabled = false;
                }
            });
            this.fieldValues.forEach(item => {
                item.selection = '';
            });
            this.fieldValues = JSON.parse(JSON.stringify(this.fieldValues));

            if (this.isDebug) console.log('filterValues: fieldValues #0 updated ', JSON.stringify((this.fieldValues[0])));
        }
        else {
            if (this.isDebug) console.log('filterValues: ignoring');
        }
        if (this.isDebug) console.log('filterValues: END for Combined Picklist');
    }

    initLabels = () => {
        if (this.isDebug) console.log('initLabels: START for Combined Picklist');

        if ((this.recordValues) && (this.fieldValues)) {
            if (this.isDebug) console.log('initLabels: processing recordValues ', JSON.stringify(this.recordValues));
            if (this.isDebug) console.log('initLabels: vs fieldValues ', JSON.stringify(this.fieldValues));

            this.recordValues.forEach(item => {
                if (this.isDebug) console.log('initLabels: processing record value ', item.value);
                if (this.isDebug) console.log('initLabels: item ', JSON.stringify(item));

                let itemValues = item.value.split(this.separator);
                if (this.isDebug) console.log('initLabels: itemValues split ', JSON.stringify(itemValues));

                let itemLabels = [];
                itemValues.forEach( (itemV,indexV) => {
                    if (this.isDebug) console.log('initLabels: processing value index ', indexV);
                    if (this.isDebug) console.log('initLabels: and content ', itemV);

                    let itemL = ((this.fieldValues[indexV]).values).find(iter => iter.value === itemV);
                    if (this.isDebug) console.log('initLabels: label found ', JSON.stringify(itemL));

                    itemLabels.push(itemL.label);
                    item.details.push({value: itemV, label: itemL.label});
                });
                item.displayValue = itemLabels.join(this.separator);
                item.deleteTitle = DELETE_TITLE + ' ' + itemLabels.join(' ');
                if (this.isDebug) console.log('initLabels: item finalized ', JSON.stringify(item));
            });
            if (this.isDebug) console.log('initLabels: recordValues updated ', JSON.stringify(this.recordValues));
        }
        else {
            if (this.isDebug) console.log('initLabels: ignoring');
        }
        if (this.isDebug) console.log('initLabels: END for Combined Picklist');
    }

    updateRecord = (operation) => {
        if (this.isDebug) console.log('updateRecord: START for Combined Picklist ',operation);
        this.isSaving = true;

        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_submit',params:{event_source:'dsfrCombinedPicklistCmp',event_site: basePathName,event_category:operation,event_label:this.tag}}}));
        if (this.isDebug) console.log('updateRecord: notifying GA');

        let valueList = [];
        this.recordValues.forEach(item => {
            valueList.push(item.value);
        });
        let newValue = valueList.join(';');
        if (this.isDebug) console.log('updateRecord: newValue init ',newValue);

        const recordData = {fields: {Id : this.recordId}};
        (recordData.fields)[this.fieldName] = valueList.join(';');
        if (this.isDebug) console.log('updateRecord: recordData init ',recordData);

        updateRecord(recordData)
        .then(() => {
            if (this.isDebug) console.log('updateRecord: setting focus on first selector');
            //let firstOptionSelector = this.template.querySelector('.optionSelect');
            let firstOptionSelector = this.template.querySelector('lightning-select');
            if (this.isDebug) console.log('updateRecord: firstOptionSelector fetched', firstOptionSelector);
            firstOptionSelector?.focus();
            if (this.isDebug) console.log('updateRecord: focus set on first option selector');

            this.filterValues();
            if (this.isDebug) console.log('updateRecord: values refiltered', JSON.stringify(this.fieldValues));

            this.template.querySelectorAll('lightning-select').forEach(selector => {
                selector.value = '';
                //selector.setCustomValidity('');
                //selector.reportValidity();
            });
            this.isSaving = false;

            if (this.isDebug) console.log('updateRecord: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_success',params:{event_source:'dsfrCombinedPicklistCmp',event_site: basePathName,event_category:operation,event_label:this.tag}}}));
            if (this.isDebug) console.log('updateRecord: END for Combined Picklist');
        }).catch((error) => {
            this.isSaving = false;
            if (this.isDebug) console.log('updateRecord: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_action_error',params:{event_source:'dsfrCombinedPicklistCmp',event_site: basePathName,event_category:operation,event_label:this.tag}}}));
            console.warn('updateRecord: END KO / for Combined Picklist ',JSON.stringify(error));
        });
        if (this.isDebug) console.log('updateRecord: update requested');
    }
}