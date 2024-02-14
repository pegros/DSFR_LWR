import { LightningElement, api } from 'lwc';
import currentUserId        from '@salesforce/user/Id';

export default class DsfrContextButtonCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonTag; // for GA4
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonInactive = 'false';
    @api buttonAlign = 'right';

    @api buttonConfig;
    @api buttonAction;
    @api objectApiName;
    @api recordId;

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    userId = currentUserId;     // ID of current User


    //-----------------------------------------------------
    // Initialization
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START action button for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button config ',this.buttonConfig);
            console.log('connected: button action ',this.buttonAction);
            console.log('connected: button object name ',this.objectApiName);
            console.log('connected: button record ID ',this.recordId);
            console.log('connected: button inactive? ', this.buttonInactive);
        }

        this.buttonTag = this.buttonTag || this.buttonLabel || this.buttonTitle || 'Undefined';
        if (this.isDebug) console.log('connected: buttonTag evaluated ', this.buttonTag);

        if (this.isDebug) console.log('connected: END action button');
    }


    //-----------------------------------------------------
    // Event Handling
    //-----------------------------------------------------
    handleAction(event){
        if (this.isDebug) console.log('handleAction: START with action ',this.buttonAction);
        if (this.isDebug) console.log('handleAction: on config ',this.buttonConfig);

        try {
            this.refs.buttonActions.executeBarAction(this.buttonAction,null);
            if (this.isDebug) console.log('handleAction: END / action triggered');
        }
        catch (error) {
            console.warn('handleAction: END KO / action execution failed!', JSON.stringify(error));
        }    
    }

}