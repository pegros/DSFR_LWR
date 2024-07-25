import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';

import SELECT_MESSAGE from '@salesforce/label/c.dsfrFileAttachSelectMessage';
import SELECT_MISSING from '@salesforce/label/c.dsfrFileAttachSelectMissing';
import SELECT_NO_VALUE from '@salesforce/label/c.dsfrFileAttachSelectNoValue';

export default class DsfrFileAttachCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Sélectionner un type de fichier';
    @api comment;

    @api fieldName;

    @api optionLabels; // OBSOLETE
    /*_optionLabels;
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
    }*/
    _optionValues;
    @api 
    get optionValues() {
        return this._optionValues;
    }
    set optionValues(value) {
        if (value) {
            if (this.isDebug) console.log('set: START optionValues for Files Attach ',value);
            //if (this.isDebug) console.log('set: optionLabels ',this.optionLabels);
            this._optionValues = value;
            /*if (this.optionLabels) {
                this.initOptions();
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / options init ',this.options);
            }
            else*/ if (this.picklistDesc)
            {
                this.initOptionsFromDesc();
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / options init from desc ',this.options);
            }
            else {
                if (this.isDebug) console.log('set: END optionValues OK for Files Attach / no picklist desc yet ');
                //if (this.isDebug) console.log('set: END optionValues OK for Files Attach / no label nor picklist desc yet ');
            }
        }
        else {
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

    /*
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
    */

    
    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    options;            // actual options available for selection
    selection;          // current selection
    isOptionSelected = false;   // Flag controlling the display of the file input / select components
    uploadMeta;         // ContentVersion metadata prepared for file upload
    selectContext;
    fieldFullName;      // Picklist field full name for value fetch
    fieldFullNames;     // as list for picklist utility usage
    contentVersionRT;
    picklistDesc;       
    selectCommentId;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get hasOptions() {
        return ((this.options) && (this.options.length > 0)); 
    }
    /*get selectCommentId() {
        if (this.isDebug) console.log('selectCommentId: returning ',this.refs?.selectComment?.id);
        return this.refs?.selectComment?.id;
    }*/

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
            this.fieldFullNames = [this.fieldFullName];
            if (this.isDebug) console.log('connected: fieldFullNames init ', JSON.stringify(this.fieldFullNames));
        }

        /*if (this.optionLabels) {
            this.initOptions();
            if (this.isDebug) console.log('connected: options init ', JSON.stringify(this.options));
        }
        else {
            console.warn('connected: no options to init ');
        }*/
        if (this.isDebug) console.log('connected: END for file attach');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for file attach');
            console.log('rendered: configName ', this.label);
        }
        if (!this.selectCommentId) {
            console.log('rendered: selectCommentId init ', this.refs?.selectComment?.id);
            this.selectCommentId = this.refs?.selectComment?.id;
        }
        if (this.isDebug) console.log('rendered: END for file attach');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handlePicklists(event) {
        if (this.isDebug) console.log('handlePicklists: START for file attach');
        
        if (event.detail?.error) {
            console.warn('handlePicklists: END KO for file attach / Picklist fetch failed ', JSON.stringify(event.detail.error));
        }
        else {
            if (this.isDebug) console.log('handlePicklists: picklist details loaded ', JSON.stringify(event.detail));
            this.picklistDesc = (event.detail)[0];
            if (this.isDebug) console.log('handlePicklists: picklistDesc init ', JSON.stringify(this.picklistDesc));
            this.initOptionsFromDesc();
            if (this.isDebug) console.log('handlePicklists: END OK for file attach');
        }
    }

    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for file attach',event);
        if (this.isDebug) console.log('handleSelect: event details ',JSON.stringify(event.detail));    

        let optionSelect = this.refs.optionSelect;
        if (this.isDebug) console.log('handleSelect: selection ',optionSelect.value);    

        if (optionSelect?.value) {
            if (this.isDebug) console.log('handleSelect: value properly set ',event.detail.value); 
            optionSelect.setCustomValidity('');
            optionSelect.reportValidity();
            if (this.isDebug) console.log('handleSelect: validity updated'); 
        }
        else {
            console.warn('handleSelect: missing value for option selector '); 
            optionSelect.setCustomValidity(SELECT_MISSING);
            optionSelect.reportValidity();
            this.isOptionSelected = false;
            console.warn('handleSelect: END KO for file attach'); 
            return;
        }

        if (this.isDebug) console.log('handleSelect: recordId ', this.recordId);
        if (this.isDebug) console.log('handleSelect: objectApiName ', this.objectApiName);

        let context = {};
        context[this.fieldName] = optionSelect.value;
        if (this.isDebug) console.log('handleSelect: context prepared ',JSON.stringify(context));

        this.uploadMeta = JSON.stringify(context);
        this.selectContext = this.uploadMeta;
        if (this.isDebug) console.log('handleSelect: context set on file components',this.selectContext);
        this.isOptionSelected = true;

        if (this.isDebug) console.log('handleSelect: resetting file upload component',this.refs.fileUpload);
        this.refs.fileUpload?.reset();

        if (this.isDebug) console.log('handleSelect: END for file attach');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    /*initOptions = function() {
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
    }*/

    initOptionsFromDesc = function() {
        if (this.isDebug) console.log('initOptionsFromDesc: initializing options');
        if (this.isDebug) console.log('initOptionsFromDesc: recordId ', this.recordId);
        if (this.isDebug) console.log('initOptionsFromDesc: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('initOptionsFromDesc: optionValues ', this.optionValues);
        if (this.isDebug) console.log('initOptionsFromDesc: picklistDesc ',JSON.stringify(this.picklistDesc));


        let options = [];
        let optionValues = this.optionValues?.split(';');
        if (optionValues?.length > 0) {
            optionValues.forEach((item) => {
                if (this.isDebug) console.log('initOptionsFromDesc: processing item ',item);
                let itemPicklist = this.picklistDesc.values.find((iter) => iter.value === item);
                if (this.isDebug) console.log('initOptionsFromDesc: item Label found ',JSON.stringify(itemPicklist));
                if (itemPicklist)  {
                    options.push({label: itemPicklist.label, value: item});
                    if (this.isDebug) console.log('initOptionsFromDesc: item registered');
                }
            });
            options.unshift({label:SELECT_MESSAGE,value:""});
        }
        else {
            if (this.isDebug) console.log('initOptionsFromDesc: handling no value case');
            options.unshift({label:SELECT_NO_VALUE,value:""});
        }

        this.options = options;
        if (this.isDebug) console.log('initOptionsFromDesc: END / options init ', JSON.stringify(this.options));
    }
}