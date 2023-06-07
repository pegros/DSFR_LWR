import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import CANCEL_LABEL from '@salesforce/label/c.dsfrRecordFormCancel';
import SAVE_LABEL   from '@salesforce/label/c.dsfrRecordFormSave';
import EDIT_LABEL   from '@salesforce/label/c.dsfrRecordFormEdit';

export default class DsfrRecordFormCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api title;
    @api objectApiName;
    @api recordId;

    @api relatedObjectApiName;
    @api relatedRecordIdField;

    @api fieldConfig;
    _requiredFields;
    @api 
    get requiredFields() {
        return this._requiredFields;
    }
    set requiredFields(value) {
        if (this.isDebug) console.log('requiredFields: START with ', value);
        this._requiredFields = value;
        
        let fieldList = [];
        try {
            let fieldConfigList = JSON.parse(this.fieldConfig || []);
            if (this.isDebug) console.log('requiredFields: fieldList parsed ', fieldConfigList);
            fieldConfigList.forEach(item => {
                if (!item.size) { item.size = this.defaultSize; }
                fieldList.push(item)
            });
            if (this.isDebug) console.log('requiredFields: fieldList init from config ', fieldList);
        }
        catch (error){
            console.warn('requiredFields: recordForm fieldList parsing failed ', error);
            this.isReady = false;
        }
        try {
            let requiredFieldList = ((this.requiredFields)?.split(';')) || [];
            if (this.isDebug) console.log('requiredFields: requiredFields split ', requiredFieldList);
            requiredFieldList.forEach(item => {
                fieldList.push({name: item, size : this.defaultSize, required: true})
            });
            if (this.isDebug) console.log('requiredFields: fieldList updated from required fields ', fieldList);
            this.labelOk = false;
        }
        catch (error){
            console.warn('requiredFields: recordForm requiredFields processing failed ', error);
            this.isReady = false;
        }
        this.fieldList = fieldList;
        if (this.isDebug) console.log('requiredFields: END with fieldList ', JSON.stringify(this.fieldList));
    }

    @api defaultSize = 6;
    @api isReadOnly = false;
    @api isEditMode = false;

    _isEditModeString;
    @api 
    get isEditModeString() {
        return this._isEditModeString;
    }
    set isEditModeString(value) {
        if (this.isDebug) console.log('isEditModeString: START with ', value);

        this._isEditModeString = value;
        switch (this._isEditModeString) {
            case 'true' :
            case true :
                this.isEditMode = true;
                break;
            case 'false':
            case false : 
                this.isEditMode = false;
                break;
        }
        if (this.isDebug) console.log('isEditModeString: END with isEditMode ', this.isEditMode);
    }

    @api formClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    relatedFieldList;
    fieldList;
    formObjectApiName;
    formRecordId;
    formRecordTypeId;
    isReady = false;
    labelOk = false;
    message;

    //-----------------------------------------------------
    // Custom Labels 
    //-----------------------------------------------------

    cancelLabel = CANCEL_LABEL;
    saveLabel   = SAVE_LABEL;
    editLabel   = EDIT_LABEL;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------

    @wire(getRecord, { recordId: '$recordId', fields: "$relatedFieldList"})
    wiredRecord({data, error}) {
        if (this.isDebug) console.log('wiredRecord: START for recordForm');

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data received ', data);
            this.formRecordId = getFieldValue(data,(this.relatedFieldList)[0]);
            if (this.isDebug) console.log('wiredRecord: formRecordId init ', this.formRecordId);
            if (this.formRecordId) {
                this.isReady = true;
            }
            else {
                // creation mode not supported for related record
                console.warn('wiredRecord: no ID value provided');
            }
        }
        else {
            console.warn('wiredRecord: record data fetche failed ', error);
            this.formRecordId = null;
        }

        if (this.isDebug) console.log('wiredRecord: END for recordForm');
    }

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for recordForm');
        if (this.isDebug) console.log('connected: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('connected: recordId ', this.recordId);
        if (this.isDebug) console.log('connected: related objectApiName ', this.relatedObjectApiName);
        if (this.isDebug) console.log('connected: related recordId field ', this.relatedRecordIdField);
        if (this.isDebug) console.log('connected: fieldConfig ', this.fieldConfig);
        if (this.isDebug) console.log('connected: requiredFields ', this.requiredFields);
        if (this.isDebug) console.log('connected: isEditModeString? ', this.isEditModeString);

        if (this.relatedRecordIdField) {
            if (this.isDebug) console.log('connected: fetching related record ID');
            this.formObjectApiName = this.relatedObjectApiName;
            this.relatedFieldList = [ this.objectApiName + '.' + this.relatedRecordIdField ];
            if (this.isDebug) console.log('connected: relatedFieldList init ', JSON.stringify(this.relatedFieldList));
        }
        else {
            if (this.isDebug) console.log('connected: using current record ID');
            this.formObjectApiName = this.objectApiName;
            this.formRecordId = this.recordId;
            this.isReady = true;
        }

        if ((this.fieldConfig) && (!this.fieldList)) {
            if (this.isDebug) console.log('connected: initializing static list of fields');
            let fieldList = [];
            try {
                let fieldConfigList = JSON.parse(this.fieldConfig || []);
                if (this.isDebug) console.log('connected: fieldList parsed ', fieldConfigList);
                fieldConfigList.forEach(item => {
                    if (!item.size) { item.size = this.defaultSize; }
                    fieldList.push(item)
                });
                if (this.isDebug) console.log('connected: fieldList init from config ', fieldList);
            }
            catch (error){
                console.warn('connected: recordForm fieldList parsing failed ', error);
                this.isReady = false;
            }
            this.fieldList = fieldList;
        }

        if (this.isDebug) console.log('connected: formObjectApiName init ', this.formObjectApiName);
        if (this.isDebug) console.log('connected: formRecordId init ', this.formRecordId);

        if (this.isDebug) console.log('connected: END for recordForm');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------

    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START for recordForm',event);
        this.toggleSpinner(false);

        if ((!this.formRecordTypeId) && (this.formRecordId)){
            this.formRecordTypeId = (event.detail.records)[this.recordId]?.recordTypeId;
            if (this.isDebug) console.log('handleLoad: formRecordTypeId init ', this.formRecordTypeId);
        }

        if (!this.labelOk) {
            if (this.isDebug) console.log('handleLoad: initialising labels');
            if (this.isDebug) console.log('handleLoad: details provided ',JSON.stringify(event.detail));

            let objectFields = ((event.detail.objectInfos)[this.formObjectApiName])?.fields;
            if (this.isDebug) console.log('handleLoad: objectFields fetched ',JSON.stringify(objectFields));
            this.fieldList.forEach(item => {
                if (this.isDebug) console.log('handleLoad: processing field ',item.name);
                if (!item.label) {
                    item.label = objectFields[item.name]?.label;
                }
                if ((!item.hideHelp) && (!item.help) && (objectFields[item.name]?.inlineHelpText)) {
                    item.help = objectFields[item.name]?.inlineHelpText;
                }
                if (this.isDebug) console.log('handleLoad: label set for field ',item.label);
            });
            if (this.isDebug) console.log('handleLoad: fieldList updated ',JSON.stringify(this.fieldList));
            this.fieldList = [... this.fieldList];
        }
        
        if (this.isDebug) console.log('handleLoad: END for recordForm');
    }

    handleEdit(event) {
        if (this.isDebug) console.log('handleEdit: START for recordForm',event);
        this.message = null;
        this.isEditMode = true;
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleEdit: END for recordForm');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for recordForm',event);
        this.message = null;
        this.toggleSpinner(true);
        if (this.isDebug) console.log('handleSubmit: END for recordForm');
    }

    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START for recordForm',event);
        this.toggleSpinner(false);

        let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
        console.warn('handleSuccess: popupUtil fetched ', popupUtil);
        let alertConfig = {
            alerts:[{type: "info", title: "Opération effectuée", message: "Vos changements ont bien été sauvegardés."}],
            size:'small'};
        popupUtil.showAlert(alertConfig).then(() => {
            if (this.isDebug) console.log('handleSuccess: END / popup closed');
        });
        /*this.message = {
            type: "info",
            title: "Opération effectuée",
            details: "Vos changements ont bien été sauvegardés."
        }*/
        this.isEditMode = false;
        if (this.isDebug) console.log('handleSuccess: END for recordForm');
    }

    handleError(event) {
        if (this.isDebug) console.log('handleError: START for recordForm',event);
        if (this.isDebug) console.log('handleError: event detail received ',JSON.stringify(event.detail));
        this.toggleSpinner(false);
        let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
        console.warn('handleError: popupUtil fetched ', popupUtil);
        let alertConfig = {
            alerts:[{type: "error", title: "Echec de l'opération", message: "La sauvegarde de vos modifications n'a pas pu être réalisée."}],
            size:'small'};
        popupUtil.showAlert(alertConfig).then(() => {
            if (this.isDebug) console.log('handleError: END / popup closed');
        });
        /*this.message = {
            type: "error",
            title: "Echec de l'opération",
            details: "La sauvegarde de vos modifications n'a pas pu être réalisée."
        }*/
        if (this.isDebug) console.log('handleError: END for recordForm');
    }
    
    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START for recordForm',event);
        event.preventDefault();
        this.message = null;

        /*const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('handleCancel: inputFields fetched',inputFields);

        if (inputFields) {
            inputFields.forEach(iter => {iter.reset();});
        }*/

        this.isEditMode = false;
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

        if (spinner) {
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
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: no spinner displayed');
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }
}