import { LightningElement, api } from 'lwc';

export default class DsfrButtonGroupCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    _buttonList = null;
    @api
    get buttonList() {
        return this._buttonList;
    }
    set buttonList(value) {
        if (this.isDebug) console.log('setting buttonList ',JSON.stringify(value));
        if (value) {
            let buttonList;
            if (typeof value == 'string') {
                try {
                    buttonList = JSON.parse(value);
                }
                catch (error) {
                    console.warn('Issue when parsing buttonList provided ', JSON.stringify(value));
                    console.warn('Issue details ',JSON.stringify(error));
                    buttonList = null;
                }
            }
            else {
                buttonList =[... value];
            }
            this._buttonList = buttonList;      
        }
        else {
            this._buttonList = null;
        }
        if (this.isDebug) console.log('setting buttonList tp ',JSON.stringify(this._buttonList));
    }
    @api size = 'medium';       // Size of the buttons (small, large, medium)
    @api position = 'left';     // Position of the group (left, right, center)
    @api isVertical = false;    // Vertical or horizontal/inline display of the group

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get groupClass() {
        return "fr-btns-group" + (this.isVertical ? " fr-btns-group--" : " fr-btns-group--inline-")
                + (this.size == 'medium' ? 'md' :  (this.size == 'small' ? 'sm' : 'lg'))
                + " fr-btns-group--" + this.position;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START button group for ',JSON.stringify(this.buttonList));
            console.log('connected: group size ',this.size);
            console.log('connected: group position ',this.position);
            console.log('connected: group vertical alignment ',this.isVertical);
        }
        if (this.isDebug) console.log('connected: END button group');
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START button group for ',this.buttonList);
            console.log('rendered: group size ',this.size);
            console.log('rendered: group position ',this.position);
            console.log('rendered: group vertical alignment ',this.isVertical);
        }
        if (this.isDebug) console.log('rendered: END card');
    }
}