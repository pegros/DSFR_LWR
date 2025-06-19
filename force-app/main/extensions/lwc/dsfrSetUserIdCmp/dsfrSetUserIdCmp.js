import { LightningElement, api, wire } from 'lwc';
import userId from '@salesforce/user/Id';
import isGuestUser from '@salesforce/user/isGuest';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';


export default class DsfrSetUserIdCmp extends  NavigationMixin(LightningElement)  {

    //----------------------------------------------------------------
    // Main configuration fields (for Site Builder)
    //----------------------------------------------------------------
    @api isDebug = false;

    currentUserId =userId;

    @wire(CurrentPageReference) 
    wiredPageRef;


    //----------------------------------------------------------------
    // Main configuration fields (for Site Builder)
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for setUserId');
            console.log('connected: CurrentPageReference fetched ', JSON.stringify(this.wiredPageRef));
            console.log('connected: current UserId fetched ', this.currentUserId);
        }

        if (this.wiredPageRef) {
            if (this.wiredPageRef?.state?.userId) {
                if (this.isDebug) console.log('connected: userId already set in page state ', this.wiredPageRef.state.userId);
            }
            else if (userId) {
                if (this.isDebug) console.log('connected: setting userId in page state ', this.currentUserId);
                this.wiredPageRef.state.userId = this.currentUserId;
                if (this.isDebug) console.log('connected: triggering redirect ');
                this[NavigationMixin.Navigate](this.wiredPageRef);
            }
        }
        else {
            if (this.isDebug) console.log('connected: no page ref yet');
        }

        if (this.isDebug) console.log('connected: END for setUserId');
    }
    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for setUserId');
            console.log('rendered: CurrentPageReference fetched ', JSON.stringify(this.wiredPageRef));
            console.log('rendered: current UserId fetched ', this.currentUserId);
        }

        if (this.wiredPageRef) {
            if (this.wiredPageRef?.state?.userId) {
                if (this.isDebug) console.log('rendered: userId already set in page state ', this.wiredPageRef.state.userId);
            }
            else if (userId) {
                if (this.isDebug) console.log('rendered: setting userId in page state ', this.currentUserId);
                this.wiredPageRef.state.userId = this.currentUserId;
                if (this.isDebug) console.log('rendered: triggering redirect ');
                this[NavigationMixin.Navigate](this.wiredPageRef);
            }
        }
        else {
            if (this.isDebug) console.log('rendered: no page ref yet');
        }

        if (this.isDebug) console.log('rendered: END for setUserId');
    }
}