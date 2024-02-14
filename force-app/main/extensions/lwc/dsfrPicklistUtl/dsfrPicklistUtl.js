import { LightningElement, wire , api } from 'lwc';
import { getPicklistValues } from "lightning/uiObjectInfoApi";

export default class DsfrPicklistUtl extends LightningElement {

    //-----------------------------------------------------
    // Configuration Parameters
    //-----------------------------------------------------
    @api picklistField;     // Full Picklist field API Name (as "Object.Field")
    @api recordTypeId;      // Applicable recordType ID
    @api isDebug = false;   // Debug logs activation

    //-----------------------------------------------------
    // Technical Parameters
    //-----------------------------------------------------

    //----------------------------------------------------------------
    // Component Initialisation  
    //----------------------------------------------------------------      
    @wire(getPicklistValues, { recordTypeId: "$recordTypeId", fieldApiName: "$picklistField" })
    wiredPicklistValues({ error, data }) {
        if (this.isDebug) console.log('wiredPicklistValues: START for picklist field ', this.picklistField);
        if (this.isDebug) console.log('wiredPicklistValues: and RT ID ', this.recordTypeId);
        
        if (data) {
            if (this.isDebug) console.log('wiredPicklistValues: Picklist description fetched ', JSON.stringify(data));
            let loadEvt = new CustomEvent('loaded', { detail: { field: this.picklistField, values: data }});
            if (this.isDebug) console.log('wiredPicklistValues: triggering loaded event for parent component ', JSON.stringify(loadEvt.detail));
            this.dispatchEvent(loadEvt);
        }
        else if (error) {
            console.warn('wiredPicklistValues: Picklist fetch failed ', JSON.stringify(error));
            let loadEvt = new CustomEvent('loaded', { detail: { field: this.picklistField, error: JSON.parse(JSON.stringify(error)) }});
            if (this.isDebug) console.log('wiredPicklistValues: triggering loaded error event for parent component ', JSON.stringify(loadEvt.detail));
            this.dispatchEvent(loadEvt);
        }
        if (this.isDebug) console.log('wiredPicklistValues: END for picklist field ', this.picklistField);
    }


}