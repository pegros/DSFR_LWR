import { LightningElement, wire , api} from 'lwc';
import getConfiguration from '@salesforce/apex/sfpegCard_CTL.getConfiguration';
import updateRecord     from '@salesforce/apex/sfpegCard_CTL.updateRecord';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

import CANCEL_LABEL from '@salesforce/label/c.dsfrRecordFormCancel';
import SAVE_LABEL   from '@salesforce/label/c.dsfrRecordFormSave';
import EDIT_LABEL   from '@salesforce/label/c.dsfrRecordFormEdit';


var FORM_CONFIGS = {};

export default class DsfrFormCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api formTitle;             // Main Title of the form
    @api formDescription;       // Main Description of the form
    @api formClass = "fr-container fr-background-alt--grey fr-py-4v";   // CSS Classes for the wrapping form div
    @api sectionClass = "fr-mb-0 fr-fieldset" ; // CSS Classes for the wrapping form div

    @api configName;            // DeveloperName for the sfpegCard__mdt record to be used

    @api isReadOnly = false;    // Display card in readonly mode
    @api isEditMode = false;    // edit mode mode activation

    @api
    get isEditModeString() {
        return '' + this.isEditMode; 
    }
    set isEditModeString(value) {
        if (this.isDebug) console.log('set isEditModeString: START for form with value', value);
        this.isEditMode = (value === 'true');
        if (this.isDebug) console.log('set isEditModeString: END for form with isEditMode ', this.isEditMode);
    }

    @api isDebug = false;       // Debug mode activation

    //-----------------------------------------------------
    // Custom Labels 
    //-----------------------------------------------------

    cancelLabel     = CANCEL_LABEL;
    saveLabel       = SAVE_LABEL;
    forceSaveLabel  = SAVE_LABEL + ' (forcer)';
    editLabel       = EDIT_LABEL;

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    isReady = false;        // Initialization state of the component (to control spinner)
    configDetails = null;   // Global configuration of the component
    isForceSubmit = false;  // second save to bypass 

    //----------------------------------------------------------------
    // Context Data
    //----------------------------------------------------------------
    @api objectApiName;

    _recordId;
    @api 
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        if (this.isDebug) console.log('set recordId: START for form with ', value);

        if ((value) && (typeof value == 'string')) {
            if (this.isDebug) console.log('set recordId: END OK for form / setting recordId and activating form');
            this._recordId = value;
            if (this.configDetails) this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('set recordId: END OK for form / waiting for recordId');
        }
    }

    recordTypeId;

    //----------------------------------------------------------------
    // Custom UI Display getters
    //----------------------------------------------------------------
    
    get showEdit() {
        return !(this.isReadOnly || this.isEditMode);
    }
    get saveDynamicLabel() {
        return (this.isForceSubmit ? this.forceSaveLabel : this.saveLabel);
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for form');
        if (this.isDebug) console.log('connected: recordId provided ',this.recordId);
        if (this.isDebug) console.log('connected: objectApiName provided ',this.objectApiName);

        if (this.isReady) {
            console.warn('connected: END / already ready');
            return;
        }

        if ((!this.configName) || (this.configName === 'N/A')){
            console.warn('connected: END / missing configuration');
            return;
        }

        if (this.isDebug) console.log('connected: config name fetched ', this.configName);
        if (this.isDebug) console.log('connected: FORM_CONFIGS ', FORM_CONFIGS);
        if (FORM_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: configuration already available');
            this.configDetails = FORM_CONFIGS[this.configName];

            if ((this.recordId) && (typeof this.recordId == 'string')) {
                if (this.isDebug) console.log('connected: END OK for form / form record ID already available');
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('connected: END OK for form / awaiting form record ID');
            }
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                try {
                    let config = JSON.parse(result.DisplayConfig__c);
                    if (this.isDebug) console.log('connected: config parsed ');

                    FORM_CONFIGS[this.configName] = {
                        label:      result.MasterLabel,
                        size:       config.size || 12,
                        sections:   config.sections || [],
                        context:    config.context
                    };
                    this.configDetails = FORM_CONFIGS[this.configName];
                    if (this.isDebug) console.log('connected: configuration registered ',JSON.stringify(this.configDetails));

                    ((this.configDetails).sections).forEach((iterSection, iterIndex) => {

                        iterSection.key = 'section-' + iterIndex;
                        iterSection.legendKey = 'section-legend-' + iterIndex;
                        iterSection.legendClass = 'fr-fieldset__legend ' + (iterSection.title ? '' : 'slds-hide');
                        iterSection.title = iterSection.title || 'Section ' + iterIndex;

                        if (iterSection.fields) {
                            (iterSection.fields).forEach(iterField => {
                                iterField.size = iterField.size || iterSection.size || this.configDetails.size;
                            });
                        }
                        else {
                            console.warn('connected: section found with no fields ', JSON.stringify(iterSection));
                        }
                    });
                    if (this.isDebug) console.log('connected: sections reworked ', JSON.stringify(this.configDetails.sections) );
                    
                    if ((this.recordId) && (typeof this.recordId == 'string')) {
                        if (this.isDebug) console.log('connected: END OK for form / form record ID already available');
                        this.isReady = true;
                    }
                    else {
                        if (this.isDebug) console.log('connected: END OK for form / awaiting form record ID');
                    }
                }
                catch (parseError){
                    console.warn('connected: END KO for form / configuration parsing failed ', JSON.stringify(parseError));
                }
            })
            .catch( error => {
                console.warn('connected: END KO for form / configuration fetch error ',JSON.stringify(error));
            });
            if (this.isDebug) console.log('connected: config request sent');
        }
    }


    //----------------------------------------------------------------
    // Event Handlers  
    //---------------------------------------------------------------- 
    
    // Read / Edit mode management
    toggleMode(event) {
        if (this.isDebug) console.log('toggleMode: START for form with edit? ',this.isEditMode);
        event?.preventDefault();

        if (!this.isReadOnly) {
            this.isEditMode = !this.isEditMode;
            if (this.isEditMode) {
                if (this.isDebug) console.log('toggleMode: requesting focus on first input');
                this.focusFirstInput();
            }
        }
        else {
            this.isEditMode = false;
        }
        if (this.isDebug) console.log('toggleMode: END for form with toggled edit? ',this.isEditMode);
    }
    
    // Edit Form management
    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START for form',event);
        this.toggleSpinner(false);

        if ((!this.recordTypeId) && (this.recordId)){
            this.recordTypeId = (event.detail.records)[this.recordId]?.recordTypeId;
            if (this.isDebug) console.log('handleLoad: recordTypeId init ', this.recordTypeId);
        }

        if (this.isEditMode) {
            if (this.isDebug) console.log('handleLoad: requestin focus on first input');
            this.focusFirstInput();
        }
        if (this.isDebug) console.log('handleLoad: END for form');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for form',event);
        this.toggleSpinner(true);

        if (this.isForceSubmit) {
            if (this.isDebug) console.log('handleSubmit: force save via DML triggered');
            event?.preventDefault();

            let recordData = { ObjectApiName: this.objectApiName, Id:this.recordId };
            let inputFields = this.template.querySelectorAll('lightning-input-field');
            inputFields.forEach(item => {
                if (this.isDebug) console.log('handleSubmit: processing field ', item.fieldName);
                if (this.isDebug) console.log('handleSubmit: with value ', JSON.stringify(item.value));
                if ((item.value) &&  (typeof (item.value) === 'object')) {
                    (Object.keys(item.value)).forEach(subItem => {
                        if (this.isDebug) console.log('handleSubmit: processing subItem ', subItem);
                        if (this.isDebug) console.log('handleSubmit: with value ', (item.value)[subItem]);
                        recordData[subItem] = (item.value)[subItem];
                    });
                } 
                else {
                    recordData[item.fieldName] = item.value;
                }
            });
            if (this.isDebug) console.log('handleSubmit: recordData init ', JSON.stringify(recordData));

            updateRecord({record: recordData, bypassSharingRules : false, bypassDuplicateRules : true})
            .then( () => {
                if (this.isDebug) console.log('handleSubmit: END OK / DML update executed');
                getRecordNotifyChange([{recordId: this.recordId}]);
                this.toggleSpinner(false);
                this.isForceSubmit = false;
            })
            .catch( error => {
                console.warn('handleSubmit: END KO / record update error ', JSON.stringify(error));
                this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème technique');
            });
            if (this.isDebug) console.log('handleFormSubmit: request sent');
        }
        else {
            if (this.isDebug) console.log('handleSubmit: END OK / letting standard submit occurring');
        }
    }

    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START for form',event);
        event.preventDefault();
        this.isEditMode = false;
        if (this.isDebug) console.log('handleCancel: END for form');
    }

    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START for form',event);
        event.preventDefault();
        this.isEditMode = false;

        let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
        console.warn('handleSuccess: popupUtil fetched ', popupUtil);
        let alertConfig = {
            alerts:[{type: "success", title: "Mise à jour effectuée", message: "La sauvegarde de vos modifications a été réalisée."}],
            size:'small'};
        popupUtil.showAlert(alertConfig).then(() => {
            if (this.isDebug) console.log('handleSuccess: END /for form popup closed');
        });
        if (this.isDebug) console.log('handleSuccess: popup opened');
    }
 
    handleError(event) {
        if (this.isDebug) console.log('handleError: START for form',event);

        if (this.isDebug) console.log('handleError: event details ',JSON.stringify(event.detail));
        let errors = event.detail?.output?.errors;
        if (this.isDebug) console.log('handleError: #errors raised ',JSON.stringify(errors));

        let duplicateError = false;
        let otherError = false;
        if (errors) {
            errors.forEach(item => {
                if (this.isDebug) console.log('handleError: processing error ',JSON.stringify(item));
                if (item.errorCode === "DUPLICATES_DETECTED") {
                    if (this.isDebug) console.log('handleError: duplicate error found');
                    duplicateError = true;
                }
                else {
                    if (this.isDebug) console.log('handleError: other error found');
                    otherError = true;
                }
            });
        }
        this.isForceSubmit = duplicateError && (!otherError);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleError: END OK / isForceSubmit updated ',this.isForceSubmit);
    }


    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START for form with',isShown);

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
        
        if (this.isDebug) console.log('toggleSpinner: END for form');
    }

    focusFirstInput = function(isShown) {
        if (this.isDebug) console.log('focusFirstInput: START for form');

        let firstInput = this.template.querySelector('lightning-input-field');
        if (this.isDebug) console.log('focusFirstInput: firstInput fetched ',firstInput);
        setTimeout(() => { 
            firstInput?.focus({ focusVisible: true });
            if (this.isDebug) console.log('focusFirstInput: END / focus set on firstInput');
        },500);
        if (this.isDebug) console.log('focusFirstInput: focus requested');
    }
}