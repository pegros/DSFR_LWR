import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import loginViaIdentity from '@salesforce/apex/dsfrSiteManagement_CTL.loginViaIdentity';
import validateCaptcha from '@salesforce/apex/dsfrSiteManagement_CTL.validateCaptcha';
import basePathName from '@salesforce/community/basePath';

export default class DsfrLoginCmp extends NavigationMixin(LightningElement) {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainTitle;
    @api mainDescription;

    @api loginTarget;
    @api tag; // for GA4 tracking

    @api lostPwdTarget;
    @api lostPwdTag; // for GA4 tracking

    @api registerTarget;
    @api registerTag; // for GA4 tracking

    @api useCaptcha = false;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    tmpIdentity;
    tmpPassword;
    isProcessing = false;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get showRegister() {
        return this.registerTarget;
    }

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    @api loginHeader;
    @api loginMessage;
    @api loginLabel;
    @api loginTitle;
    @api registerHeader;
    @api registerLabel;
    @api registerTitle;
    @api lostPwdLabel;
    @api lostPwdTitle;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Login');
        if (this.isDebug) console.log('connected: startUrl ', this.startUrl);

        if (this.useCaptcha) {
            if (this.isDebug) console.log('connected: registering Captcha handler');
            document.addEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('connected: Captcha handler registered');
        }

        this.lostPwdTag = this.lostPwdTag || (this.tag ? this.tag + '_lost_password' : 'lost_password');
        if (this.isDebug) console.log('connected: lostPwdTag evaluated ', this.lostPwdTag);

        this.registerTag = this.registerTag || (this.tag ? this.tag + '_register' : 'register');
        if (this.isDebug) console.log('connected: registerTag evaluated ', this.registerTag);

        this.tag = this.tag || this.mainTitle || 'login';
        if (this.isDebug) console.log('connected: login tag evaluated ', this.tag);

        if (this.isDebug) console.log('connected: END for Login');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for Login');

        if (this.useCaptcha) {
            if (this.isDebug) console.log('disconnected: deregistering Captcha handler');
            document.removeEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('disconnected: Captcha handler deregistered');
        }

        if (this.isDebug) console.log('disconnected: END for Login');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleLogin(event) {
        if (this.isDebug) console.log('handleLogin: START ',event);
        event.preventDefault();
        this.message = null;
        this.toggleSpinner(true);

        let identity = this.template.querySelector('.fr-input[name="username"]').value;
        if (this.isDebug) console.log('handleLogin: identity input fetched ', identity);

        let password = this.template.querySelector('.fr-input[name="password"]').value;
        if (this.isDebug) console.log('handleLogin: password input fetched ', password);

        if (!(identity && password)) {
            if (this.isDebug) console.warn('handleLogin: END KO / missing input');
            this.message = {
                type: "error",
                title: "Echec de connexion",
                details: 'Merci de bien vouloir renseigner tous les champs demandés.'
            };
            this.toggleSpinner(false);
            return;
        }

        if (this.useCaptcha) {
            if (this.isDebug) console.log('handleLogin: challenging captcha');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_login_submit',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'captcha_login',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleLogin: GA notified');
        
            this.tmpIdentity = identity;
            this.tmpPassword = password;
            document.dispatchEvent(new CustomEvent("grecaptchaExecute", {"detail": {action: "login"}}));
            if (this.isDebug) console.log('handleLogin: END / captcha challenge requested');
        }
        else {
            if (this.isDebug) console.log('handleLogin: no captcha challenge required');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_login_submit',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'standard_login',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleLogin: GA notified');

            if (this.isDebug) console.log('handleLogin: loginTarget provided ',this.loginTarget);

            loginViaIdentity({identity:identity, password:password, startUrl:this.loginTarget}).then(result => {
                if (this.isDebug) console.log('handleLogin: login granted ', result);

                // Fallback if GA event cannot be sent (no handler, add blocker...)
                let timeoutID = setTimeout(() => { 
                    this.toggleSpinner(false);
                    if (this.isDebug) console.log('handleLogin: END / opening target (fallback timeout)');
                    window.open(result,'_self');
                },5000);
                if (this.isDebug) console.log('handleLogin: notifying GA with timeout registered', timeoutID);

                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
                    label:'dsfr_login_success',
                    params:{
                        event_source:'dsfrLoginCmp',
                        event_site: basePathName,
                        event_category:'standard_login',
                        event_label:this.tag,
                        event_callback: () => { 
                            this.toggleSpinner(false);
                            if (this.isDebug) console.log('handleLogin: clearing timeout ',timeoutID);
                            clearTimeout(timeoutID);
                            if (this.isDebug) console.log('handleLogin: END for Login / opening target ',result);
                            window.open(result,'_self');
                        }
                    }
                }}));

                /*let pageRef = {type: 'standard__webPage', attributes: {url: result}};
                if (this.isDebug) console.log('handleLogin: END / opening pageRef ', JSON.stringify(pageRef));
                this[NavigationMixin.Navigate](pageRef, false);*/
                /*setTimeout(() => { 
                    if (this.isDebug) console.log('handleLogin: END / opening target');
                    window.open(result,'_self');
                },1000);*/
            }).catch(error => {
                if (this.isDebug) console.log('handleLogin: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_login_error',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'standard_login',event_label:this.tag}}}));
        
                if (this.isDebug) console.log('handleLogin: END KO / login failed ', JSON.stringify(error));
                this.message = {
                    type: "error",
                    title: "Echec de connexion",
                    details: (error.body?.message || error.statusText || '')
                };
                this.toggleSpinner(false);
            });
            if (this.isDebug) console.log('handleLogin: requesting identification and authentication');
        }
    }
    /*
    handleLostPassword(event) {
        if (this.isDebug) console.log('handleLostPassword: START');

        if (this.isDebug) console.log('handleLostPassword: END');
    }*/

    togglePassword(event) {
        if (this.isDebug) console.log('togglePassword: START ',event);

        let passwordInput = this.template.querySelector('.fr-input[name="password"]');
        if (this.isDebug) console.log('togglePassword: password input fetched ', passwordInput);

        if (this.isDebug) console.log('togglePassword: current password input type ', passwordInput.type);
        passwordInput.type = (passwordInput.type == 'password' ? 'text' : 'password');
        if (this.isDebug) console.log('togglePassword: END / password input type updated ', passwordInput.type);
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        this.isProcessing = isShown;

        //let spinner = this.template.querySelector('lightning-spinner');
        //if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);

        let buttons = this.template.querySelectorAll('button.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        //if (spinner) {
            if (isShown) {
                if (this.isDebug) console.log('toggleSpinner: showing spinner');
                //spinner.classList.remove('slds-hide');
                buttons.forEach(item => {
                    item.disabled = true;
                });
            }
            else {
                if (this.isDebug) console.log('toggleSpinner: hiding spinner');
                //spinner.classList.add('slds-hide');
                buttons.forEach(item => {
                    item.disabled = false;
                });
            }
        //}
        //else {
        //    if (this.isDebug) console.log('toggleSpinner: no spinner displayed');
        //}
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }

    handleCaptcha = (event) => {
        if (this.isDebug) console.log('handleCaptcha: START for Login with ',JSON.stringify(event.detail));

        if (event.detail.action !== 'login') {
            if (this.isDebug) console.log('handleCaptcha: END for Login / ignoring action');
            return;
        }

        if (this.isDebug) console.log('handleCaptcha: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_submit',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'captcha_login',event_label:this.tag}}}));

        if (this.isDebug) console.log('handleCaptcha: validating captcha ',  JSON.stringify(event.detail));
        //validateCaptcha({ recaptchaResponse: event.detail.response})
        validateCaptcha(event.detail)
        .then(result => {
            if (this.isDebug) console.log('handleCaptcha: captcha validated');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_success',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'captcha_login',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleCaptcha: GA notified');

            loginViaIdentity({identity:this.tmpIdentity, password:this.tmpPassword, startUrl:this.loginTarget}).then(result => {
                if (this.isDebug) console.log('handleCaptcha: login granted ', result);

                // Fallback if GA event cannot be sent (no handler, add blocker...)
                let timeoutID = setTimeout(() => { 
                    this.toggleSpinner(false);
                    if (this.isDebug) console.log('handleCaptcha: END / opening target (fallback timeout)');
                    window.open(result,'_self');
                },5000);
                if (this.isDebug) console.log('handleCaptcha: notifying GA with timeout registered', timeoutID);

                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
                    label:'dsfr_login_success',
                    params:{
                        event_source:'dsfrLoginCmp',
                        event_site: basePathName,
                        event_category:'captcha_login',
                        event_label:this.tag,
                        event_callback: () => { 
                            this.toggleSpinner(false);
                            if (this.isDebug) console.log('handleCaptcha: clearing timeout ',timeoutID);
                            clearTimeout(timeoutID);
                            if (this.isDebug) console.log('handleCaptcha: END for Login / opening target ',result);
                            window.open(result,'_self');
                        }
                    }
                }}));
                if (this.isDebug) console.log('handleCaptcha: GA notified');

                /*let pageRef = {type: 'standard__webPage', attributes: {url: result}};
                if (this.isDebug) console.log('handleLogin: END / opening pageRef ', JSON.stringify(pageRef));
                this[NavigationMixin.Navigate](pageRef, false);*/
                /*setTimeout(() => { 
                    if (this.isDebug) console.log('handleCaptcha: END for Login / opening target');
                    window.open(result,'_self');
                },1000);*/
            }).catch(error => {
                if (this.isDebug) console.log('handleCaptcha: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_login_error',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'captcha_login',event_label:this.tag}}}));
            
                console.warn('handleCaptcha: END KO for Login / login failed ', JSON.stringify(error));
                this.toggleSpinner(false);
                this.message = {
                    type: "error",
                    title: "Echec de connexion",
                    details: (error.body?.message || error.statusText || '')
                };
            });

            if (this.isDebug) console.log('handleCaptcha: registration requested');
        })
        .catch(error => {
            if (this.isDebug) console.log('handleLogin: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_error',params:{event_source:'dsfrLoginCmp', event_site: basePathName, event_category:'captcha_login',event_label:this.tag}}}));
            
            console.warn('handleCaptcha: END KO for Login / Captcha validation failed ', JSON.stringify(error));
            this.toggleSpinner(false);
            this.message = {
                type: "error",
                title: "Echec de connexion",
                details: (error.body?.message || error.statusText || 'Problème de validation Captcha')
            };
        });
        if (this.isDebug) console.log('handleCaptcha: validation triggered');
    }
}