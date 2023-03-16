import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DsfrButtonDsp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonTarget;
    @api buttonInactive = 'false';

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    isInactive = false;
    buttonClass = 'fr-btn';

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START button for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button target ',this.buttonTarget);
            console.log('connected: button inactive? ', this.buttonInactive);
        }

        this.isInactive = (this.buttonInactive === 'true');
        if (this.isDebug) console.log('connected: isInactive evaluated ', this.isInactive);

        let buttonClass = 'fr-btn  fr-btn--' + this.buttonVariant;
        switch (this.buttonSize) {
            case 'small':
                buttonClass += ' fr-btn--sm';
                break;
            case 'small':
                buttonClass += ' fr-btn--lg';
                break;
        }
        if (this.buttonIcon) {
            buttonClass += ' fr-btn--icon-' + this.buttonIconPosition + ' fr-icon-' + this.buttonIcon;
        }
        this.buttonClass = buttonClass;
        if (this.isDebug) console.log('connected: buttonClass set ', this.buttonClass);

        if (this.isDebug) console.log('connected: END button');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for button ',this.buttonLabel);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: target ',this.buttonTarget);
        if (this.buttonTarget) {
            if (this.isDebug) console.log('handleLinkClick: navigating to target ');

            const newPageRef = JSON.parse(this.buttonTarget);
            if (this.isDebug) console.log('handleLinkClick: newPageRef init ',newPageRef);

            if (this.isDebug) console.log('handleLinkClick: END opening newPageRef');
            this[NavigationMixin.Navigate](newPageRef);
        }
        else {
            if (this.isDebug) console.log('openTarget: END ignoring navigation');
        }
    }
}