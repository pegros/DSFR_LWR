import { LightningElement, api } from 'lwc';

import STATE_MESSAGE    from '@salesforce/label/c.dsfrStepperStateMessage';
import NEXT_STATE_LABEL from '@salesforce/label/c.dsfrStepperNextStateLabel';


export default class DsfrStepperCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api steps          = [];       // enables to provide a step list directly (for Flows)
    @api stepsConfig    = null;     // enables to provide a JSON string instead of a step list as input (for Sites)
    @api currentStep    = null;
    @api stepsCss;

    @api isDebug = false;       // Flag to activate debug information

    //-----------------------------------------------------
    // Technical Parameters
    //-----------------------------------------------------
    stepCount;
    currentIndex;
    nextStep;

    currentStateLabel = STATE_MESSAGE;
    nextStateLabel = NEXT_STATE_LABEL;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------
    get stepperClass() {
        return 'fr-stepper ' + (this.stepsCss || '');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    
    connectedCallback() {
        if (this.isDebug) console.log('connected: START stepper');

        if (this.stepsConfig) {
            if (this.isDebug) console.log('connected: initializing stepper from JSON ', this.stepsConfig);
            this.steps = JSON.parse(this.stepsConfig);
        }
        if (this.isDebug) console.log('connected: list of steps to be used ', this.steps);
        this.stepCount = this.steps?.length || 0;

        if (this.isDebug) console.log('connected: current step provided ', this.currentStep);
        this.currentIndex = (this.steps?.indexOf(this.currentStep) || 0) + 1;
        if (this.isDebug) console.log('connected: matching index ', this.currentIndex);

        this.currentStateLabel = this.currentStateLabel.replace('{0}', this.currentIndex);
        this.currentStateLabel = this.currentStateLabel.replace('{1}', this.stepCount);
        if (this.isDebug) console.log('connected: state message init ', this.currentStateLabel);
 
        if (this.currentIndex < this.stepCount) {
            this.nextStep = this.steps.slice(this.currentIndex-1, this.currentIndex+1).pop();
            if (this.isDebug) console.log('connected: next step init ', this.nextStep);
        }

        if (this.isDebug) console.log('connected: END stepper');
    }
}