import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import ADD_LABEL from '@salesforce/label/c.dsfrCombinedPicklistAddLabel';
import DELETE_TITLE from '@salesforce/label/c.dsfrCombinedPicklistDeleteTitle';


export default class DsfrCombinedPicklistCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title;
    @api message;
    @api fieldLabels;
    @api fieldName;
    @api objectApiName;
    @api recordId;

    @api wrappingCss;
    @api separator = ' - ';
    @api inactive = false;
    //@api filterValues = true;

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

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    addLabel = ADD_LABEL;
    deleteTitle = DELETE_TITLE;

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
                    fieldValues.push({label: itemLabel, values: new Map()});
                });
                if (this.isDebug) console.log('wiredPicklists: fieldValues init ', JSON.stringify(fieldValues));

                if (this.isDebug) console.log('wiredPicklists: processing Picklist values ', JSON.stringify(data.values));
                data.values.forEach( (item) => {
                    if (this.isDebug) console.log('wiredPicklist: processing value ', JSON.stringify(item));

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
                })
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

        if (this.isDebug) console.log('connected: END for Combined Picklist');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for Combined Picklist',event);    
        let selectValues = this.template.querySelectorAll('.fr-select');
         
        let isReady = true;
        selectValues.forEach(item => {
            if (item.value) {
                if (this.isDebug) console.log('handleSelect: selector OK ',item.label);    
            }
            else {
                if (this.isDebug) console.log('handleSelect: selector KO ',item.label);    
                isReady = false;
            }
        });

        if (isReady) {
            if (this.isDebug) console.log('handleSelect: activating add button');  
            let addButton = this.template.querySelector('.addButton');
            addButton.disabled = false;
        }
        else {
            if (this.isDebug) console.log('handleSelect: add button remains disabled');  
        }

        if (this.isDebug) console.log('handleSelect: END for Combined Picklist');    
    }

    handleAdd(event) {
        if (this.isDebug) console.log('handleAdd: START for Combined Picklist',event);    

        let selectValues = this.template.querySelectorAll('.fr-select');
        if (this.isDebug) console.log('handleAdd: select elements found',selectValues);  
        
        let newValue = {details: []};
        let valueList = [];
        let labelList = [];
        selectValues.forEach(item => {
            if (this.isDebug) console.log('handleAdd: processing selector ',item);  
            if (this.isDebug) console.log('handleAdd: with name ',item.name);  
            if (this.isDebug) console.log('handleAdd: with current value ',item.value);  
            if (this.isDebug) console.log('handleAdd: and label ',item.options[item.selectedIndex].innerHTML);  
            newValue.details.push({label: item.options[item.selectedIndex].innerHTML, value: item.value});
            valueList.push(item.value);
            labelList.push(item.options[item.selectedIndex].innerHTML);

            for(var i = 0; i < (item.options).length; i++) {
                if (this.isDebug) console.log('handleAdd: resetting option ', (item.options)[i].innerHTML);  
                (item.options)[i].selected = (i == 0);
            }
        });
        newValue.value = valueList.join(this.separator);
        newValue.displayValue = labelList.join(this.separator);
        if (this.isDebug) console.log('handleAdd: newValue init', JSON.stringify(newValue));  

        if (this.isDebug) console.log('handleAdd: current recordValues ', JSON.stringify(this.recordValues));  
        if (!this.recordValues) this.recordValues = [];
        this.recordValues.push(newValue);
        if (this.isDebug) console.log('handleAdd: recordValues updated ', JSON.stringify(this.recordValues));  
        if (this.isDebug) console.log('handleAdd: recordValues updated ', JSON.stringify(this.recordValues.slice()));  

        if (this.isDebug) console.log('handleAdd: disabling add button');  
        let addButton = this.template.querySelector('.addButton');
        addButton.disabled = true;

        this.updateRecord();
            
        if (this.isDebug) console.log('handleAdd: END for Combined Picklist');
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

            this.updateRecord();
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
            if (this.isDebug) console.log('filterValues: fieldValues updated ', JSON.stringify((this.fieldValues[0]).values));
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
                if (this.isDebug) console.log('initLabels: item finalized ', JSON.stringify(item));
            });
            if (this.isDebug) console.log('initLabels: recordValues updated ', JSON.stringify(this.recordValues));
        }
        else {
            if (this.isDebug) console.log('initLabels: ignoring');
        }
        if (this.isDebug) console.log('initLabels: END for Combined Picklist');
    }

    updateRecord = () => {
        if (this.isDebug) console.log('updateRecord: START for Combined Picklist');

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
            if (this.isDebug) console.log('updateRecord: END for Combined Picklist');
        }).catch((error) => {
            console.warn('updateRecord: END KO / for Combined Picklist ',JSON.stringify(error));
        });
        if (this.isDebug) console.log('updateRecord: update requested');
    }
}