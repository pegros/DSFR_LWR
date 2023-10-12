import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import sendLostPassword from '@salesforce/apex/dsfrSiteManagement_CTL.sendLostPassword';
import validateCaptcha from '@salesforce/apex/dsfrSiteManagement_CTL.validateCaptcha';

export default class DsfrLostPasswordCmp extends NavigationMixin(LightningElement) {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainHeader;
    @api formHeader;
    @api formDescription;
    @api sendLabel;
    @api targetPage;
    @api useCaptcha = false;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    tmpIdentity;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for LostPassword');
        if (this.isDebug) console.log('connected: startUrl ', this.startUrl);

        if (this.useCaptcha) {
            if (this.isDebug) console.log('connected: registering Captcha handler');
            document.addEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('connected: Captcha handler registered');
        }

        if (this.isDebug) console.log('connected: END for LostPassword');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for LostPassword');

        if (this.useCaptcha) {
            if (this.isDebug) console.log('disconnected: deregistering Captcha handler');
            document.removeEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('disconnected: Captcha handler deregistered');
        }

        if (this.isDebug) console.log('disconnected: END for LostPassword');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleSend(event) {
        if (this.isDebug) console.log('handleSend: START ',event);
        event.preventDefault();
        this.message = null;
        this.toggleSpinner(true);

        let identity = this.template.querySelector('.fr-input[name="username"]').value;
        if (this.isDebug) console.log('handleSend: identity input fetched ', identity);

        if (!(identity)) {
            console.warn('handleSend: END KO / missing input');
            this.message = {
                type: "error",
                title: "Echec d'envoi",
                details: 'Merci de bien vouloir renseigner tous les champs demandés.'
            };
            this.toggleSpinner(false);
            return;
        }

        if (this.useCaptcha) {
            if (this.isDebug) console.log('handleSend: challenging captcha');
            this.tmpIdentity = identity;
            document.dispatchEvent(new CustomEvent("grecaptchaExecute", {"detail": {action: "lostPwd"}}));
            if (this.isDebug) console.log('handleSend: END / captcha challenge requested');
        }
        else {
            if (this.isDebug) console.log('handleSend: no captcha challenge required');

            sendLostPassword({identity:identity}).then(result => {
                if (this.isDebug) console.log('handleSend: lost pwd email sent',result);
                if (this.isDebug) console.log('handleSend: redirecting to ',this.targetPage);
                this.toggleSpinner(false);
                let pageRef = JSON.parse(this.targetPage);
                this[NavigationMixin.Navigate](pageRef, false);
                if (this.isDebug) console.log('handleSend: END / redirected to target');
            }).catch(error => {
                console.warn('handleSend: END KO / send failed ', JSON.stringify(error));
                this.message = {
                    type: "error",
                    title: "Echec d'envoi",
                    details: (error.body?.message || error.statusText || 'Problème technique')
                };
                this.toggleSpinner(false);
            });
            if (this.isDebug) console.log('handleSend: requesting lost pwd email');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    handleCaptcha = (event) => {
        if (this.isDebug) console.log('handleCaptcha: START for lostPassword with ',JSON.stringify(event.detail));

        if (event.detail.action !== 'lostPwd') {
            if (this.isDebug) console.log('handleCaptcha: END for lostPassword / ignoring action');
            return;
        }

        if (this.isDebug) console.log('handleCaptcha: validating captcha ',  JSON.stringify(event.detail));
        //validateCaptcha({ recaptchaResponse: event.detail.response})
        validateCaptcha(event.detail)
        .then(result => {
            if (this.isDebug) console.log('handleCaptcha: captcha validated');

            sendLostPassword({identity:this.tmpIdentity}).then(result => {
                if (this.isDebug) console.log('handleCaptcha: lost pwd email sent',result);
                if (this.isDebug) console.log('handleCaptcha: redirecting to ',this.targetPage);
                this.toggleSpinner(false);
                let pageRef = JSON.parse(this.targetPage);
                this[NavigationMixin.Navigate](pageRef, false);
                if (this.isDebug) console.log('handleCaptcha: END for lostPassword / redirected to target');
            }).catch(error => {
                console.warn('handleCaptcha: END KO for lostPassword / email send failed ', JSON.stringify(error));
                this.message = {
                    type: "error",
                    title: "Echec d'envoi",
                    details: (error.body?.message || error.statusText || 'Problème technique')
                };
                this.toggleSpinner(false);
            });

            if (this.isDebug) console.log('handleCaptcha: requesting lost pwd email');
        })
        .catch(error => {
            console.warn('handleCaptcha: END KO for lostPassword / Captcha validation failed ',error);
            this.message = {
                type: "error",
                title: "Echec d'envoi",
                details: (error.body?.message || error.statusText || 'Problème de validation Captcha')
            };
            this.toggleSpinner(false);
        });
        if (this.isDebug) console.log('handleCaptcha: validation triggered');
    }

    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);

        let buttons = this.template.querySelectorAll('button.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        if (spinner) {
            if (isShown) {
                if (this.isDebug) console.log('toggleSpinner: showing spinner');
                spinner.classList.remove('slds-hide');
                buttons.forEach(item => {
                    item.disabled = true;
                });
            }
            else {
                if (this.isDebug) console.log('toggleSpinner: hiding spinner');
                spinner.classList.add('slds-hide');
                buttons.forEach(item => {
                    item.disabled = false;
                });
            }
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: no spinner displayed');
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }
}