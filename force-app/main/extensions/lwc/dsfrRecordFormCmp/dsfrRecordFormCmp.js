import { LightningElement, api } from 'lwc';

export default class DsfrRecordFormCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title;
    @api objectApiName;
    @api recordId;
    @api fieldConfig;
    @api defaultSize = 6;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    fieldList;
    labelOk = false;
    recordTypeId;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for recordForm');
        if (this.isDebug) console.log('connected: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('connected: recordId ', this.recordId);
        if (this.isDebug) console.log('connected: fieldConfig ', this.fieldConfig);

        try {
            let fieldList = JSON.parse(this.fieldConfig);
            if (this.isDebug) console.log('connected: fieldList parsed ', fieldList);
            fieldList.forEach(item => {
                if (!item.size) { item.size = this.defaultSize; }
            });
            this.fieldList = fieldList;
            if (this.isDebug) console.log('connected: fieldList init ', this.fieldList);
        }
        catch (error){
            console.warn('connected: recordForm fieldList parsing failed ', error);
        }
        if (this.isDebug) console.log('connected: END for recordForm');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------

    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START for recordForm',event);
        this.toggleSpinner(false);

        if (!this.recordTypeId) {
            this.recordTypeId = (event.detail.records)[this.recordId].recordTypeId;
            if (this.isDebug) console.log('handleLoad: recordTypeId init ', this.recordTypeId);
        }

        if (!this.labelOk) {
            if (this.isDebug) console.log('handleLoad: initialising labels');
            if (this.isDebug) console.log('handleLoad: details provided ',JSON.stringify(event.detail));

            let objectFields = ((event.detail.objectInfos)[this.objectApiName])?.fields;
            if (this.isDebug) console.log('handleLoad: objectFields fetched ',JSON.stringify(objectFields));
            this.fieldList.forEach(item => {
                if (this.isDebug) console.log('handleLoad: processing field ',item.name);
                if (!item.label) {
                    item.label = objectFields[item.name]?.label;
                }
                if (this.isDebug) console.log('handleLoad: label set for field ',item.label);
            });
            if (this.isDebug) console.log('handleLoad: fieldList updated ',JSON.stringify(this.fieldList));
            this.fieldList = [... this.fieldList];
        }
        
        if (this.isDebug) console.log('handleLoad: END for recordForm');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for recordForm',event);
        this.toggleSpinner(true);
        if (this.isDebug) console.log('handleSubmit: END for recordForm');
    }

    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START for recordForm',event);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleSuccess: END for recordForm');
    }

    handleError(event) {
        if (this.isDebug) console.log('handleError: START for recordForm',event);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleError: END for recordForm');
    }
    
    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START for recordForm',event);

        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('handleCancel: inputFields fetched',inputFields);

        if (inputFields) {
            inputFields.forEach(iter => {iter.reset();});
        }

        if (this.isDebug) console.log('handleCancel: END for recordForm');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);

        let buttons = this.template.querySelectorAll('button.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        if (isShown) {
            if (this.isDebug) console.log('toggleSpinner: showing spinner');
            spinner.classList.remove('slds-hide');
            buttons.forEach(item => {
                item.disabled = true;
            });
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: hiding spinner');
            spinner.classList.add('slds-hide');
            buttons.forEach(item => {
                item.disabled = false;
            });
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }
}