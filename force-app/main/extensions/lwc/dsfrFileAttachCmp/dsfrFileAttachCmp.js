import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
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
            if (this.isDebug) console.log('set: START optionLabels for Files Attach ',value);
            if (this.isDebug) console.log('set: optionValues ',this.optionValues);
            this._optionLabels = value;
            if (this.optionValues) {
                this.initOptions();
                if (this.isDebug) console.log('set: END optionLabels OK for Files Attach / options init ',this.options);
            }
            else {
                if (this.isDebug) console.log('set: END optionLabels OK for Files Attach / no value yet');
            }
        }
        else {
            if (this.isDebug) console.log('set: END optionLabels OK for Files Attach / no label provided');
        }
    }
    _optionValues;
    @api 
    get optionValues() {
        return this._optionValues;
    }
    set optionValues(value) {
        if (value) {
            if (this.isDebug) console.log('set: START optionValues for Files Attach ',value);
            if (this.isDebug) console.log('set: optionLabels ',this.optionLabels);
            this._optionValues = value;
            if (this.optionLabels) {
                this.initOptions();
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / options init ',this.options);
            }
            else if (this.picklistDesc)
            {
                this.initOptionsFromDesc();
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / options init from desc ',this.options);
            }
            else {
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / no label nor picklist desc yet ');
            }
        } else {
            if (this.isDebug) console.log('set: END optionValues OK for Files Attach / no value provided');
        }
    }

    @api refreshUser;

    // File upload parameters
    @api uploadLabel;
    @api uploadComment;
    @api uploadTag; // for GA4 tracking
    @api uploadAccept;
    @api recordIds;

    // File selector parameters
    @api selectLabel;
    @api selectComment;
    @api selectTag; // for GA4 tracking
    @api selectConfig;

    @api wrappingClass;
    @api componentClass;
    @api baseWidth = 6;

    @api doRefresh;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;

    @wire(getObjectInfo, { objectApiName: 'ContentVersion' })
    wiredFileDesc({ error, data }) {;
        if (this.isDebug) console.log('wiredFileDesc: START for File Attach');
        if (data) {
            if (this.isDebug) console.log('wiredFileDesc: Object description fetched ', JSON.stringify(data));
            this.contentVersionRT = data.defaultRecordTypeId;
            if (this.isDebug) console.log('wiredFileDesc: END OK / default RT set ', this.contentVersionRT);
        }
        else if (error) {
            console.warn('wiredFileDesc: END KO for File Attach / Picklist fetch failed ', JSON.stringify(error));
        }
        else {
            console.warn('wiredFileDesc: END OK / no data ');
        }
    }
    
    @wire(getPicklistValues, { recordTypeId: ('$contentVersionRT'), fieldApiName: '$fieldFullName' })
    wiredPicklist({ error, data }) {
        if (this.isDebug) console.log('wiredPicklist: START for File Attach');
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: Picklist description fetched ', JSON.stringify(data));

            this.picklistDesc = data;
            if (this.optionValues) {
                this.initOptionsFromDesc();
                if (this.isDebug) console.log('wiredPicklist: END OK for File Attach / options init from desc ',this.options);
            }
            else {
                console.warn('wiredPicklist: END KO for File Attach / no Picklist value returned ');
            }
        }
        else if (error) {
            console.warn('wiredPicklists: END KO for File Attach / Picklist fetch failed ', JSON.stringify(error));
        }
    }


    
    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    options;
    isOptionSelected = false;
    uploadMeta;
    selectContext;
    fieldFullName;
    contentVersionRT;
    picklistDesc;
    
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

        if (this.fieldName) {
            this.fieldFullName = 'ContentVersion.' + this.fieldName;
            if (this.isDebug) console.log('connected: fieldFullName init ', JSON.stringify(this.fieldFullName));
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

        if (this.isDebug) console.log('handleSelect: reseting file upload component');
        this.template.querySelector('c-dsfr-file-upload-cmp')?.reset();

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
        let optionLabels = this.optionLabels.split(';').sort();
        let optionValues = this.optionValues.split(';').sort();
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


    initOptionsFromDesc = function() {
        if (this.isDebug) console.log('initOptionsFromDesc: initializing options');
        if (this.isDebug) console.log('initOptionsFromDesc: recordId ', this.recordId);
        if (this.isDebug) console.log('initOptionsFromDesc: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('initOptionsFromDesc: optionValues ', this.optionValues);
        if (this.isDebug) console.log('initOptionsFromDesc: picklistDesc ',JSON.stringify(this.picklistDesc));

        let options = [];
        let optionValues = this.optionValues.split(';');
        optionValues.forEach((item) => {
            if (this.isDebug) console.log('initOptionsFromDesc: processing item ',item);
            let itemPicklist = this.picklistDesc.values.find((iter) => iter.value === item);
            if (this.isDebug) console.log('initOptionsFromDesc: item Label found ',JSON.stringify(itemPicklist));
            if (itemPicklist)  {
                options.push({label: itemPicklist.label, value: item});
                if (this.isDebug) console.log('initOptionsFromDesc: item registered');
            }
        });
        this.options = options;
        if (this.isDebug) console.log('initOptionsFromDesc: END / options init ', JSON.stringify(this.options));
    }

}
