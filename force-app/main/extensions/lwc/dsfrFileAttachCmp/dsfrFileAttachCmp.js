import { LightningElement, api } from 'lwc';

export default class DsfrFileAttachCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Sélectionner un type de fichier';
    @api comment;

    @api fieldName;

    _optionLabels;
    @api 
    get optionLabels() {
        return this._optionLabels;
    }
    set optionLabels(value) {
        if (value) {
            if (this.isDebug) console.log('set: optionLabels ',value);
            if (this.isDebug) console.log('set: optionValues ',this.optionValues);
            this._optionLabels = value;
            if (this.optionValues) {
                this.initOptions();
                if (this.isDebug) console.log('set: options init ',this.options);
            }
        }
    }
    _optionValues;
    @api 
    get optionValues() {
        return this._optionValues;
    }
    set optionValues(value) {
        if (value) {
            if (this.isDebug) console.log('set: optionValues ',value);
            if (this.isDebug) console.log('set: optionLabels ',this.optionLabels);
            this._optionValues = value;
            if (this.optionLabels) {
                this.initOptions();
                if (this.isDebug) console.log('set: options init ',this.options);
            }
        }
    }

    @api refreshUser;

    // File upload parameters
    @api uploadLabel;
    @api uploadComment;
    @api recordIds;

    // File selector parameters
    @api selectLabel;
    @api selectComment;
    @api selectConfig;

    @api wrappingClass;
    @api componentClass;
    @api baseWidth = 6;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    options;
    isOptionSelected = false;
    uploadMeta;
    selectContext;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get hasOptions() {
        return ((this.options) && (this.options.length > 0)); 
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for file attach');
            console.log('connected: configName ', this.label);
            console.log('connected: fieldName ', this.fieldName);
            console.log('connected: optionLabels ', this.optionLabels);
            console.log('connected: optionValues ', this.optionValues);
            console.log('connected: wrappingClass ', this.wrappingClass);
            console.log('connected: refreshUser ', this.refreshUser);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: objectApiName ', this.objectApiName);
        }

        if (this.optionLabels) {
            this.initOptions();
            if (this.isDebug) console.log('connected: options init ', JSON.stringify(this.options));
        }
        else {
            console.warn('connected: no options to init ');
        }
        if (this.isDebug) console.log('connected: END for file attach');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for file attach',event);
        
        let optionSelect = this.template.querySelector("select[name='optionSelect']");
        if (this.isDebug) console.log('handleSelect: option selector value ',optionSelect?.value);

        if (this.isDebug) console.log('handleSelect: recordId ', this.recordId);
        if (this.isDebug) console.log('handleSelect: objectApiName ', this.objectApiName);

        if (optionSelect?.value) {
            let context = {};
            context[this.fieldName] = optionSelect?.value;
            if (this.isDebug) console.log('handleSelect: context prepared ',JSON.stringify(context));

            this.uploadMeta = JSON.stringify(context);
            this.selectContext = this.uploadMeta;
            if (this.isDebug) console.log('handleSelect: context set on file components');
            this.isOptionSelected = true;
        }
        else {
            this.isOptionSelected = false;
        }

        if (this.isDebug) console.log('handleSelect: END for file attach');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    initOptions = function() {
        if (this.isDebug) console.log('initOptions: initializing options');
        if (this.isDebug) console.log('initOptions: recordId ', this.recordId);
        if (this.isDebug) console.log('initOptions: objectApiName ', this.objectApiName);
        let options = [];
        let optionLabels = this.optionLabels.split(';');
        let optionValues = this.optionValues.split(';');
        optionLabels.forEach((item,index) => {
            if (this.isDebug) console.log('initOptions: processing item ',item);
            if (this.isDebug) console.log('initOptions: at index ',index);
            let itemValue = optionValues[index];
            if (this.isDebug) console.log('initOptions: itemValue ',itemValue);
            options.push({label: item, value: itemValue});
        });
        this.options = options;
        if (this.isDebug) console.log('initOptions: options init ', JSON.stringify(this.options));
    }
}