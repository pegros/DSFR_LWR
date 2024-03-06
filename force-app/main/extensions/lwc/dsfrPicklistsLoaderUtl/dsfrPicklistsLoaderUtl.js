import { LightningElement, api, wire } from 'lwc';
import { getObjectInfos }   from "lightning/uiObjectInfoApi";
import getConfig from '@salesforce/apex/sfpegMerge_CTL.getConfig';

var DSFR_PICKLIST_VALUES = {};
var DSFR_OBJECT_DESCS = {};

export default class DsfrPicklistsLoaderUtl extends LightningElement {

    //----------------------------------------------------------------
    // Configuration fields
    //----------------------------------------------------------------
    @api picklistFields;    // List of picklist fields
    @api isDebug = false;   // Debug logs activation
    @api isDebugFine = false; // Fine Debug logs activation (on children components)

    //-----------------------------------------------------
    // Technical Parameters
    //-----------------------------------------------------
    isInitDone = false;     // Flag to track that init has been done (for first render)
    rtsReady = false;       // Flag to track that RTs have been loaded (or no RT loading required)
    objectsReady = false;   // Flag to track that Object Descs have been loaded
    picklistsReady = false; // Flag to track that Picslist are ready to load

    rts2load = {RT:[]};    // List of RT IDs to fetch (identified as "Object.DevName")
    objects2load = [];      // List of Objects desc to load
    fields2load = [];       // List of picklist Fields desc to load

    loadedObjects;          // Object descs loaded
    fieldsLoaded = [];      // List of picklist Fields with descs loaded
    loadedPicklists = {};   // Picklist descs loaded

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------   
  
    connectedCallback() {
        if (this.isDebug) console.log('connected: START Loader for picklist fields ',JSON.stringify(this.picklistFields));
        if (this.isDebug) console.log('connected: END');
    }

    renderedCallback(){
        if (this.isDebug) console.log('rendered: START Loader for picklist fields ',JSON.stringify(this.picklistFields));

        if (this.isInitDone) {
            if (this.isDebug) console.log('rendered: current config available ', JSON.stringify(this.refs.configUtl.getMap('dsfrPicklists')));
            if (this.isDebug) console.log('rendered: END / Init already done');
            return;
        }

        if (!this.picklistFields) {
            console.warn('wiredObjects: no picklist list provided');
            let loadEvt = new CustomEvent('loaded', { detail: { error: {message: 'No picklist list provided'} }});
            if (this.isDebug) console.log('wiredObjects: triggering loaded error event for parent component ', JSON.stringify(loadEvt.detail));
            this.dispatchEvent(loadEvt);
            return;
        }
        
        let configMap = this.refs.configUtl.getMap('dsfrPicklists') || {};
        if (this.isDebug) console.log('rendered: configMap fetched ', JSON.stringify(configMap));

        this.picklistFields.forEach(item => {
            if (this.isDebug) console.log('rendered: processing field ',item);

            if (!configMap[item]) {
                if (this.isDebug) console.log('rendered: analysing field for values load ',item);

                if (item.includes('.')) {
                    let itemParts = item.split('.');
                    let itemObject = itemParts[0];
                    let itemField = itemParts[1];
                    let itemRTname = itemParts[2];
                    if (this.isDebug) console.log('rendered: objectName extracted ',itemObject);
                    if (this.isDebug) console.log('rendered: field extracted ',itemField);
                    if (this.isDebug) console.log('rendered: RT name extracted ',itemRTname);

                    if (!this.objects2load.includes(itemObject)) {
                        if (this.isDebug) console.log('rendered: registering new object desc to load',itemObject);
                        this.objects2load.push(itemObject);
                    }
                    
                    if (itemRTname) {
                        let itemRT = itemObject + '.' + itemRTname;
                        if (this.isDebug) console.log('rendered: registering field with RT',itemRT);
                        if (!this.rts2load.RT.includes(itemRT)) {
                            if (this.isDebug) console.log('rendered: registering new RT ID to load',itemRT);
                            this.rts2load.RT.push(itemRT);
                        }
                        this.fields2load.push({name: item, field: itemObject + '.' + itemField, rt: itemRT});
                    }
                    else {
                        // Loading master RT systematically to fetch all possible values
                        if (this.isDebug) console.log('rendered: registering field with master RT');
                        this.fields2load.push({name: item, field: item, rtId: '012000000000000AAA'});
                    }
                }
                else {
                    console.warn('rendered: bad picklist field name provided ', item);
                    let loadEvt = new CustomEvent('loaded', { detail: { error: {message: 'Bad picklist field name provided ' + item} }});
                    if (this.isDebug) console.log('rendered: triggering loaded error event for parent component ', JSON.stringify(loadEvt.detail));
                    this.dispatchEvent(loadEvt);
                    if (this.isDebug) console.log('rendered: END KO / Loader for picklist fields ',JSON.stringify(this.picklistFields));
                    return;
                }
            }
            else {
                if (this.isDebug) console.log('rendered: field values already available ', JSON.stringify(configMap[item]));
            }
        });
        if (this.isDebug) console.log('rendered: RTs to load init ',JSON.stringify(this.rts2load));
        if (this.isDebug) console.log('rendered: objects to load init ',JSON.stringify(this.objects2load));
        if (this.isDebug) console.log('rendered: fields to load init ',JSON.stringify(this.fields2load));

        this.isInitDone = true;
        if (this.objects2load.length > 0) {
            if (this.rts2load.RT.length == 0) {
                if (this.isDebug) console.log('rendered: no RT to load');
                this.rtsReady = true;
                if (this.isDebug) console.log('rendered: END / waiting for object and RT descs to load');
            }
            else {
                if (this.isDebug) console.log('rendered: END / waiting for object descs to load');
            }
        }
        else {
            if (this.isDebug) console.log('rendered: END / returning field descs directly');
            this.returnValues();
        }
    }

    //----------------------------------------------------------------
    // Data fetch  
    //----------------------------------------------------------------   
  
    @wire(getObjectInfos, { objectApiNames: "$objects2load" })
    wiredObjects({ error, data }) {
        if (this.isDebug) console.log('wiredObjects: START for objects ', JSON.stringify(this.objects2load));
        
        if (data) {
            if (this.isDebug) console.log('wiredObjects: Object descriptions fetched ', JSON.stringify(data));

            if (data.results) {
                let loadedObjects = {};
                data.results.forEach(item => {
                    if (this.isDebug) console.log('wiredObjects: registering Object desc for ', item.result.apiName);
                    loadedObjects[item.result.apiName] = item.result;
                });
                this.loadedObjects = loadedObjects;
                this.objectsReady = true;
                if (this.isDebug) console.log('wiredObjects: Object descs registered');

                if (this.rtsReady) {
                    if (this.isDebug) console.log('wiredObjects: END / triggering picklist load');
                    this.picklistsReady = true;
                }
                else {
                    if (this.isDebug) console.log('wiredObjects: END / waiting for RT descs');
                }
            }
            else {
                console.warn('wiredObjects: END / no Object description fetched');
            }
        }
        else if (error) {
            console.warn('wiredObjects: Picklist fetch failed ', JSON.stringify(error));
            let loadEvt = new CustomEvent('loaded', { detail: { error: error }});
            if (this.isDebug) console.log('wiredObjects: END / triggering error load event for parent component ', JSON.stringify(loadEvt.detail));
            this.dispatchEvent(loadEvt);
        }
    }

    @wire(getConfig, { configMap: "$rts2load" })
    wiredRTs({ error, data }) {
        if (this.isDebug) console.log('wiredRTs: START for RTs ', JSON.stringify(this.rts2load));

        if (data) {
            if (this.isDebug) console.log('wiredRTs: RTs fetched ', JSON.stringify(data));

            this.fields2load.forEach(iterField => {
                if (this.isDebug) console.log('wiredRTs: processing field ', iterField.name);

                if (iterField.rt) {
                    if (this.isDebug) console.log('wiredRTs: setting RT ID for ', iterField.rt);
                    iterField.rtId = data.RT[iterField.rt];
                }
                else {
                    if (this.isDebug) console.log('wiredRTs: master RT used');
                }
            });
            this.rtsReady = true;
            if (this.isDebug) console.log('wiredRTs: All RT IDs registered',JSON.stringify(this.fields2load));

            if (this.objectsReady) {
                if (this.isDebug) console.log('wiredRTs: END / triggering picklist load');
                this.picklistsReady = true;
            }
            else {
                if (this.isDebug) console.log('wiredRTs: END / waiting for Object descs');
            }
        }
        else if (error) {
            console.warn('wiredRTs: END / RT ID fetch failed ', JSON.stringify(error));
            let loadEvt = new CustomEvent('loaded', { detail: { error: error }});
            if (this.isDebug) console.log('wiredRTs: END / triggering error load event for parent component ', JSON.stringify(loadEvt.detail));
            this.dispatchEvent(loadEvt);
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------   

    handleLoaded(event){
        if (this.isDebug) console.log('handleLoaded: START with event ',JSON.stringify(event.detail));
        
        if (event.detail?.error) {
            console.warn('handleLoaded: END KO with error ',JSON.stringify(event.detail.error));
            let loadEvt = new CustomEvent('loaded', { detail: { error: JSON.parse(JSON.stringify(event.detail.error))}});
            this.dispatchEvent(loadEvt);
        }
        else {
            if (this.isDebug) console.log('handleLoaded: registering field values for ', event.detail.name);
            this.loadedPicklists[event.detail.name] = event.detail.values;
            this.fieldsLoaded.push(event.detail.name);

            if (this.fieldsLoaded.length < this.fields2load.length) {
                if (this.isDebug) console.log('handleLoaded: END / waiting for additional field descs',this.fields2load.length - this.fieldsLoaded.length);
            }
            else {
                if (this.isDebug) console.log('handleLoaded: END / returning all field descs', JSON.stringify(this.fieldsLoaded));
                this.returnValues();
            }
        }
    }
    
    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------   

    returnValues = () => {
        if (this.isDebug) console.log('returnValues: START with picklist fields ',JSON.stringify(this.picklistFields));
        
        let configMap = this.refs.configUtl.getMap('dsfrPicklists') || {};
        if (this.isDebug) console.log('returnValues: configMap fetched ', JSON.stringify(configMap));

        if (this.isDebug) console.log('returnValues: Picklist descs loaded ',JSON.stringify(this.loadedPicklists));

        let picklistDescs = [];
        this.picklistFields.forEach(item => {
            if (this.isDebug) console.log('returnValues: processing field ',item);
            if (configMap[item]) {
                if (this.isDebug) console.log('returnValues: using available config ',JSON.stringify(configMap[item]));
                picklistDescs.push(configMap[item]);
            }
            else {
                if (this.isDebug) console.log('returnValues: initialising new config ');

                let itemParts = item.split('.');
                let itemObject = itemParts[0];
                let itemField = itemParts[1];
                let itemRT = itemParts[2];
                if (this.isDebug) console.log('returnValues: for object ',itemObject);
                if (this.isDebug) console.log('returnValues: and RT ',itemRT);

                let itemObjDeps = this.loadedObjects[itemObject].dependentFields;
                if (this.isDebug) console.log('returnValues: with deps ',JSON.stringify(itemObjDeps));

                let itemFieldDesc = this.loadedObjects[itemObject].fields[itemField];
                if (this.isDebug) console.log('returnValues: and field desc ',JSON.stringify(itemFieldDesc));

                //let itemFullName = itemObject + '_' + itemField + (itemRT ? '_' + itemRT : '');
                let itemFullName = itemObject + '_' + itemField;
                if (this.isDebug) console.log('returnValues: fullName init ',itemFullName);

                let itemValues = this.formatValues(itemFullName, this.loadedPicklists[item]);
                if (this.isDebug) console.log('returnValues: itemValues formatted');

                let itemDesc = {fullName: itemFullName, name: itemField, label: itemFieldDesc.label, values: itemValues};
                if (this.hasControls(itemField,itemObjDeps)) {
                    if (this.isDebug) console.log('returnValues: processing controlling field');
                    let controlData = this.extractControls(itemField,null,itemObject,itemObjDeps);
                    if (controlData) {
                        if (this.isDebug) console.log('returnValues: adding controls');
                        if (controlData.controlling.length > 0) itemDesc.controlling = controlData.controlling;
                        if (controlData.controlledBy) itemDesc.controlledBy = controlData.controlledBy;
                    }
                }
                
                picklistDescs.push(itemDesc);
                this.refs.configUtl.setConfig('dsfrPicklists',item,itemDesc);
                if (this.isDebug) console.log('returnValues: new desc registered',JSON.stringify(itemDesc));
            }
        })
        if (this.isDebug) console.log('returnValues: picklistDescs init ', JSON.stringify(picklistDescs));

        let loadEvt = new CustomEvent('loaded', { detail: picklistDescs});
        if (this.isDebug) console.log('returnValues: triggering loaded event for parent component ', JSON.stringify(loadEvt.detail));
        this.dispatchEvent(loadEvt);
        if (this.isDebug) console.log('returnValues: END');
    }

    hasControls = (field, dependencies) => {
        if (this.isDebug) console.log('hasControls: START for field ',field);

        let depStr = JSON.stringify(dependencies);
        if (this.isDebug) console.log('hasControls: and dependencies ',depStr);
        
        let result = depStr.includes(field);
        if (this.isDebug) console.log('hasControls: END returning ',result);
        return result;
    }

    extractControls = (field, controllingField, object, dependencies) => {
        if (this.isDebug) console.log('extractControls: START for field ',field);
        if (this.isDebug) console.log('extractControls: and controlling field ',controllingField);

        for (let iter in dependencies) {
            if (iter === field) {
                if (this.isDebug) console.log('extractControls: field found in dependencies');
                let result = {controlling: []};
                if (controllingField) {
                    result.controlledBy = object + '.' + controllingField;
                }
                for (let iterDep in dependencies[field]) {
                    result.controlling.push(object + '.' + iterDep);
                }
                if (this.isDebug) console.log('extractControls: END returning ', JSON.stringify(result));
                return result;
            }
            else {
                if (this.isDebug) console.log('extractControls: searching field in dependencides');
                for (let iterDep in dependencies[iter]) {
                    let result = this.extractControls(field, iter, object, dependencies[iter]);
                    if (result) {
                        if (this.isDebug) console.log('extractControls: END propagating ', JSON.stringify(result));
                        return result;
                    }
                }
            }
        }
        if (this.isDebug) console.log('extractControls: END returning null (field not found)');
        return null;
    }

    formatValues = (fieldFullName, picklistDesc) => {
        if (this.isDebug) console.log('formatValues: START for field ',fieldFullName);
        if (this.isDebug) console.log('formatValues: with desc ',JSON.stringify(picklistDesc));

        let controllingValues = {};
        Object.keys(picklistDesc.controllerValues).forEach(iter => {
            if (this.isDebug) console.log('formatValues: registering controlling value ',iter);
            let iterVal = '' + picklistDesc.controllerValues[iter];
            if (this.isDebug) console.log('formatValues: with code ',iterVal);
            controllingValues[iterVal] = iter;
        });
        if (this.isDebug) console.log('formatValues: for field ',JSON.stringify(controllingValues));

        let result = [];
        picklistDesc.values.forEach(item => {
            if (this.isDebug) console.log('formatValues: formatting value ',JSON.stringify(item));
            let itemVal = {fullName: (fieldFullName + '-' + item.value).replaceAll(' ','_'), value: item.value, label: item.label};
            if (item.validFor.length > 0) {
                let itemValid = [];
                item.validFor.forEach(ctlItem => {
                    if (this.isDebug) console.log('formatValues: setting validFor item ',ctlItem);
                    //itemValid.push(Object.keys(picklistDesc.controllerValues)[ctlItem]);
                    itemValid.push(controllingValues['' + ctlItem]);
                });
                itemVal.validFor = itemValid;
            }
            result.push(itemVal);
            if (this.isDebug) console.log('formatValues: value registered ',JSON.stringify(itemVal));
        })

        if (this.isDebug) console.log('hasControls: END returning ',JSON.stringify(result));
        return result;
    }
}