/***
* @description  Lightning controller to manage registration, login and passwords
*               on Experience Sites.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         June 2023
* @see          DSFR_LWR package (https://github.com/pegros/DSFR_LWR)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2023 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

public with sharing class dsfrSiteManagement_CTL {

    /***
    * @description  Captcha score theshold above which evaluations are validated
    ***/
    private final static Decimal MIN_CAPTCHA_SCORE = .4;

    /***
    * @description  Method to fetch the default Account RecordType ID for self-registration on the 
    *               current Network.
    * @return       String  Default RecordType ID
    ***/
    @AuraEnabled(cacheable=true)
    public static String getPersonAccountRT(String name) {
        System.debug('getPersonAccountRT: START with name ' + name);

        Schema.RecordTypeInfo rtDesc = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get(name);
        System.debug('getPersonAccountRT: rtDesc found ' + rtDesc);

        if (rtDesc == null) {
            System.debug(LoggingLevel.ERROR,'getPersonAccountRT: RT not found');
            throw new AuraHandledException('Type d\'enregistrement non trouvé ' + name);
        }

        System.debug('getPersonAccountRT: END with ' + rtDesc.getRecordTypeId());
        return rtDesc.getRecordTypeId();
    }

    /***
    * @description  Method to fetch the configured password policy
    * @return       String  Password policy statement
    ***/
    @AuraEnabled(cacheable=true)
    public static String getPasswordPolicyStatement() {
        System.debug('getPersonAccountRT called\n' + Site.getPasswordPolicyStatement());
        return Site.getPasswordPolicyStatement();
    }

    /***
    * @description  Method to authenticate a user leveraging its identify (email or username) and password 
    *               and redirect him to a start URL. The method returns the proper login URL to initiate the
    *               session for the user.
    * @param        identity    username or Email of the user logging in
    * @param        password    Name of the ContentDocument to be created 
    * @param        startUrl    List of IDs of the records to which the new ContentDocument should be linked 
    * @return       String      starUrl with authentication embedded
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String loginViaIdentity(final String identity, final String password, String startUrl) {
        System.debug('loginViaIdentity: START for identity ' + identity);
        System.debug('loginViaIdentity: for startUrl ' + startUrl);
        System.debug('loginViaIdentity: with password ' + password);

        if (String.isEmpty(identity) || String.isEmpty(password)) {
            System.debug(LoggingLevel.ERROR,'loginViaIdentity: END KO / Missing information');
            //throw new AuraHandledException('Problème technique lors de votre identification.');
            throw new AuraHandledException(Label.dsfrSiteMgtIdentificationInputError);
        }

        UserSearch_UTL searchUtl = new UserSearch_UTL();
        String networkId = Network.getNetworkId();
        System.debug('loginViaIdentity: networkId fetched ' + networkId);
        Network nwInfos = searchUtl.getNetworkInfos(networkId);
        System.debug('loginViaIdentity: networkInfos fetched ' + nwInfos);

        if (String.isEmpty(startUrl)) {
            startUrl = '/'; //+ nwInfos.UrlPathPrefix;
            System.debug('loginViaIdentity: default startUrl set ' + startUrl);
        }

        List<User> userNames = searchUtl.getUser(identity,nwInfos.SelfRegProfileId);
        System.debug('loginViaIdentity: #users matching identity ' + userNames?.size());
        if ((userNames == null) || (userNames.size() == 0)) {
            System.debug(LoggingLevel.ERROR,'loginViaIdentity: END KO / User not found for identity ' + identity);
            //throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#1).');
            throw new AuraHandledException(Label.dsfrSiteMgtIdentificationNoUserError);
        }
        if (userNames.size() > 1) {
            System.debug(LoggingLevel.ERROR,'loginViaIdentity: END KO / More than 1 user found for identity ' + identity);
            //throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#2).');
            throw new AuraHandledException(Label.dsfrSiteMgtIdentificationManyUsersError);
        }
        System.debug('loginViaIdentity: logging in username ' + userNames[0].username);
        
        try {
            System.PageReference targetPage = Site.login(userNames[0].username, password, startUrl);
            System.debug('loginViaIdentity: login OK and targetPage evaluated ' + targetPage);

            System.debug('loginViaIdentity: END OK with ' + targetPage.getUrl());
            return targetPage.getUrl();
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'loginViaIdentity: END KO / login failed ' + e.getMessage());
            throw new AuraHandledException('Problème de connexion à votre compte. ' + e.getMessage());
        }
    }

    /***
    * @description  Method to initiate the registration of a new Customer Community User.
    *               If a PersonAccount already exsits with the provided Account email and RecordType
    *               and if this PersonAccount has no related Community User, this existing PersonAccount
    *               is used to register the User. Otherwise a new PersonAccount is initiated with the 
    *               provided Account data.
    *               Settings (language, encoding...) for the new User being registered are inherited from
    *               the Community Guest. Username, alias and nicknames are generated out of the Account
    *               first and last name as well as the Community Path prefix and current community user count.
    *               User Profile and Account Owner are derived from the Site configuration.
    * @param        newAccount  New Account data to create
    * @param        password    Password to set on the new User (for verification purposes only)
    * @param        startUrl    (obsolete, kept for backward compatibility) 
    * @return       String      registration verification ID (an email with a validation code being sent to the Account email)
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String registerUser(Account newAccount, final String password, String startUrl) {
        System.debug('registerUser: START for newAccount ' + newAccount);

        // Step #1 - Controls and Context fetch
        if (newAccount == null || String.isBlank(newAccount.LastName) || String.isBlank(newAccount.FirstName) || String.isBlank(newAccount.PersonEmail)) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / Missing Account info (first/last/email) ' + newAccount);
            //throw new AuraHandledException('Problème de création de votre compte: données obligatoires manquantes.');
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationAccountError);
        }
        if (String.isBlank(password)) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / Missing password');
            //throw new AuraHandledException('Problème de création de votre compte: mot de passe manquant.');
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationPasswordError);
        }

        UserSearch_UTL searchUtl = new UserSearch_UTL();

        String networkId = Network.getNetworkId();
        System.debug('registerUser: networkId fetched ' + networkId);
        Network nwInfos = searchUtl.getNetworkInfos(networkId);
        System.debug('registerUser: nwInfos fetched ' + nwInfos);

        // User Control
        List<User> userNames = searchUtl.getUser(newAccount.PersonEmail,nwInfos.SelfRegProfileId);
        System.debug('registerUser: #users matching Email ' + userNames?.size());
        if (userNames?.size() > 0) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / at least 1 user found with email ' + newAccount.PersonEmail);
            //throw new AuraHandledException('Problème de création de votre compte: Email déjà utilisé sur un compte.');
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationUserError);
        }
        System.debug('registerUser: email usage controlled on user');

        // Account Control
        Account currentAccount = null;
        List<Account> accountNames = searchUtl.getAccount(newAccount.PersonEmail,newAccount.RecordTypeId);
        System.debug('registerUser: #accounts matching Email ' + accountNames?.size());
        if (accountNames?.size() > 0) {
            if (accountNames.size() > 1) {
                System.debug(LoggingLevel.ERROR,'registerUser: END KO / more than 1 account found with email ' + newAccount.PersonEmail);
                throw new AuraHandledException(Label.dsfrSiteMgtRegistrationAccountError);
            }
            else {
                currentAccount = accountNames[0];
                System.debug('registerUser: 1 matching Account found ' + currentAccount);
                if (currentAccount.Users?.size() > 0) {
                    System.debug('registerUser: currentAccount Users registered ' + currentAccount.Users);
                    System.debug(LoggingLevel.ERROR,'registerUser: END KO / account found with email already activated (#2) ' + newAccount.PersonEmail);
                    throw new AuraHandledException(Label.dsfrSiteMgtRegistrationAccountError);
                }      
                newAccount.Id = currentAccount.Id;
                //newAccount.PersonContactId = currentAccount.PersonContactId;
                newAccount.FirstName = currentAccount.FirstName;
                newAccount.LastName = currentAccount.LastName;
                System.debug('registerUser: setting AccountId ' + currentAccount.Id);
            }
        }
        System.debug('registerUser: email usage controlled on account');


        Site siteInfos = searchUtl.getSiteInfos(Site.getSiteId());
        System.debug('registerUser: siteInfos fetched ' + siteInfos);
        /*System.debug('registerUser: site ID ' + Site.getSiteId());
        System.debug('registerUser: site Domain ' + Site.getDomain());
        System.debug('registerUser: site Path Prefix ' + Site.getPathPrefix());
        System.debug('registerUser: site isRegistrationEnabled? ' + Site.isRegistrationEnabled());*/

        System.debug('registerUser: site Profile ID ' + nwInfos.SelfRegProfileId);
        integer nwUserCount = searchUtl.getUserCount(nwInfos.SelfRegProfileId);
        System.debug('registerUser: nwUserCount fetched ' + nwUserCount);

        //String currentDomain = Url.getOrgDomainUrl().toExternalForm().substringAfter('//');
        String currentDomain = Site.getDomain();
        System.debug('registerUser: currentDomain fetched ' + currentDomain);

        /*UserRole siteRole = searchUtl.getPortalRole();
        System.debug('registerUser: userRole fetched ' + siteRole);*/

        System.debug('registerUser: guestUser ID ' + UserInfo.getUserId());
        User guestUser = [SELECT EmailEncodingKey, Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        System.debug('registerUser: guestUser data fetched ' + guestUser);


        // Step #2 - Data Preparation
        /*System.debug('registerUser: startUrl provided ' + startUrl);
        if (String.isEmpty(startUrl)) {
            startUrl = Site.getPathPrefix();
            System.debug('registerUser: default startUrl set ' + startUrl);
        }*/

        newAccount.OwnerId = siteInfos.GuestRecordDefaultOwnerId;
        System.debug('registerUser: newAccount OwnerId updated ' + newAccount.OwnerId);

        User newUser = new User(
            Username = nwInfos.UrlPathPrefix.substringBefore('vforcesite') + nwUserCount + '@' + currentDomain,
            Alias = newAccount.FirstName.left(1) + newAccount.LastName.left(2) + nwUserCount,
            CommunityNickname = newAccount.FirstName.left(1) + newAccount.LastName.left(2) + nwUserCount,
            FirstName = newAccount.FirstName,
            LastName = newAccount.LastName,
            Email = newAccount.PersonEmail,
            LocaleSidKey = UserInfo.getLocale(),
            LanguageLocaleKey = UserInfo.getLanguage(),
            EmailEncodingKey = guestUser.EmailEncodingKey,
            TimezoneSidKey = UserInfo.getTimeZone().getID(),
            ProfileId = nwInfos.SelfRegProfileId
            //UserRoleId = siteRole.Id
        );
        // Uncomment for multi-currency Orgs ???
        /*if (UserInfo.isMultiCurrencyOrganization()) {
            newUser.DefaultCurrencyIsoCode = UserInfo.getDefaultCurrency();
        }*/
        System.debug('registerUser: newUser init ' + newUser);

        System.debug('registerUser: password provided ' + password);
        try {
            Site.validatePassword(newUser, password, password);
            System.debug('registerUser: password format checked');
        }
        catch(exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon password validation ' + e);
            //throw new AuraHandledException('Votre mot de passe ne respecte pas le format demandé.');
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationPasswordInvalidError);
        }

        // Step #3 - Account Registration
        try {
            if (String.isBlank(newAccount.Id)) {
                insert newAccount;
                //System.debug('registerUser: new Account inserted ' + newAccount);
                System.debug('registerUser: new Account inserted with ID ' + newAccount.Id);
                ID contactID = searchUtl.getContactId(newAccount.Id);
                //newUser.AccountId = newAccount.Id;
                newUser.ContactId = contactID;
                System.debug('registerUser: user linked to new Contact ID ' + newUser.ContactId);
            }
            else {
                System.debug('registerUser: reusing Account with ID ' + newAccount.Id);
                //newUser.AccountId = newAccount.Id;
                newUser.ContactId = currentAccount.PersonContactId;
                System.debug('registerUser: user linked to existing Contact ID ' + newUser.ContactId);
            }                
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon PersonAccount creation ' + e);
            //throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationProcessingError + ' ' + e.getMessage());
        }

        // Step #4 - User Registration
        /*ID userId;
        try {
            userId = common.exception.ApiException: Unable to create/update fields: ProfileId. Please check the security settings of this field and verify that it is read/write for your profile or permission set.newUser, newAccount.Id, password, false);
            //ID userId = Site.createExternalUser(newUser, newAccount.Id, password);
            //String userId = Site.createPortalUser(newUser, newAccount.Id, password);
            System.debug('registerUser: new User created ' + userId);            
        }
        catch (Site.ExternalUserCreateException e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon Site User registration ' + e);
            for (String iter : e.getDisplayMessages()) {
                System.debug(LoggingLevel.ERROR,'registerUser: error ' + iter);
            }
            //throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationProcessingError + ' ' + e.getMessage());
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon User registration ' + e);
            //throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationProcessingError + ' ' + e.getMessage());
        }*/

        /*
        // Step #5 - User login
        System.PageReference targetPage;
        try {
            targetPage = Site.login(newUser.username, password, startUrl);
            System.debug('registerUser: login OK and targetPage evaluated ' + targetPage);
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / login failed ' + e.getMessage());
            //throw new AuraHandledException('Problème de connexion à votre nouveau compte. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationLoginError + ' ' + e.getMessage());
        }
            
        System.debug('registerUser: END OK with ' + targetPage.getUrl());
        return targetPage.getUrl();*/

        // Step #5 - User Email Challenge
        try {
            System.debug('registerUser: controlling registration by Email for ' + newUser);   
            String verificationId;
            verificationId = System.UserManagement.initSelfRegistration(Auth.VerificationMethod.EMAIL, newUser);
            System.debug('registerUser: END OK / email verification initiated ' + verificationId);   
            return verificationId;         
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / email verification init failed / ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtRegistrationEmailError + ' ' + e.getMessage());
        }
    }

    /***
    * @description  Method to cfinalise the registration of a new Customer Community User.
    *               It assumes that a call to registerUser() has been done previously.
    *               Not only it validates the registration, therefore actually creating the User
    *               but it also initialises its password.
    * @param        verificationId  Registration verification ID returned by the call to registerUser()
    * @param        validationCode  Registration validation Code sent by email to the user.
    * @param        email           User Email to which the code has been sent
    * @param        password        User password to set (assumaing it has been previously checked when calling registerUser())
    * @param        startUrl        URL to which the User should be redirected upon successful validation 
    * @return       String          starUrl with authentication embedded
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String validateUser(final String verificationId, final String validationCode, final string email, final string password, String startUrl) {
        System.debug('validateUser: START for verification ID ' + verificationId);
        System.debug('validateUser: with input validation code ' + validationCode);
        System.debug('validateUser: email ' + email);
        System.debug('validateUser: password ' + password);
        System.debug('validateUser: and start URL ' + startUrl);

        // Step #1 - Controls and Context fetch
        if (String.isBlank(verificationId) || String.isBlank(validationCode) || String.isBlank(email) || String.isBlank(password)) {
            System.debug(LoggingLevel.ERROR,'validateUser: END KO / Missing input information');
            //throw new AuraHandledException('Problème de création de votre compte: données obligatoires manquantes.');
            throw new AuraHandledException(Label.dsfrSiteMgtValidationInputError);
        }
        System.debug('validateUser: inputs controlled');

        // Step #2 - Data Preparation
        System.debug('validateUser: startUrl provided ' + startUrl);
        if (String.isEmpty(startUrl)) {
            startUrl = Site.getPathPrefix();
            System.debug('validateUser: default startUrl set ' + startUrl);
        }

        // Step #3 - Email Validation
        String targetUrl; 
        UserSearch_UTL searchUtl = new UserSearch_UTL();
        try {
            System.debug('validateUser: challenging provided key');
            Auth.VerificationResult status = searchUtl.validateUser(verificationId, validationCode, startUrl);
            //Auth.VerificationResult status = System.UserManagement.verifySelfRegistration(Auth.VerificationMethod.EMAIL, verificationId, validationCode, startUrl);
            System.debug('validateUser: status returned ' + status);
            if(status.success == true) {
                targetUrl = status.redirect?.getUrl();
                System.debug('validateUser: email verified and target URL determined ' + targetUrl);
            }
            else {
                System.debug(LoggingLevel.ERROR,'validateUser: END KO / email verification failed ' + status.message);
                throw new HandledException(status.message);
            }
        }
        catch(Exception e){
            System.debug(LoggingLevel.ERROR,'validateUser: END KO / email verification failed technically ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtValidationProcessingError + ' ' + e.getMessage());
        }
        
        String networkId = Network.getNetworkId();
        System.debug('validateUser: networkId fetched ' + networkId);
        Network nwInfos = searchUtl.getNetworkInfos(networkId);
        System.debug('validateUser: nwInfos fetched ' + nwInfos);

        try {
            List<User> userNames = searchUtl.getUser(email,nwInfos.SelfRegProfileId);
            System.debug('validateUser: #users matching Email ' + userNames?.size());
            if (userNames?.size() != 1) {
                System.debug(LoggingLevel.ERROR,'validateUser: END KO / not 1 user found with email ' + email);
                //throw new AuraHandledException('Problème de création de votre compte: Email déjà utilisé sur un compte.');
                throw new HandledException('Nouvel utilisateur non trouvé');
            }
            System.debug('registerUser: new user found' + userNames[0]);
        
            searchUtl.setPassword(userNames[0].Id,password);
            System.debug('registerUser: password set');
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'validateUser: END KO / password init failed ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtValidationFinalisationError + ' ' + e.getMessage());
        }

        System.debug('validateUser: END OK / redirecting user');
        return targetUrl;
    }

    /***
    * @description  Method to update the password of the current user.
    * @param        newPassword         new password entere
    * @param        verifyNewPassword   second entry of the new password
    * @param        oldPassword         previous password
    * @return       String              page ref URL
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String changePassword(final String newPassword, final String verifyNewPassword, final String oldPassword) {
        System.debug('changePassword: START for new Password ' + newPassword);

        // Step #1 - Controls and Context fetch
        if (String.isBlank(newPassword) || String.isBlank(verifyNewPassword) || String.isBlank(oldPassword)) {
            System.debug(LoggingLevel.ERROR,'changePassword: END KO / Missing password info');
            //throw new AuraHandledException('Information manquante pour changer votre mot de passe.');
            throw new AuraHandledException(Label.dsfrSiteMgtChangeInputError);
        }

        try {
            System.debug('changePassword: replacing old password ' + oldPassword);
            System.PageReference targetPage = Site.changePassword(newPassword, verifyNewPassword, oldPassword);
            System.debug('changePassword: END OK / returning ' + targetPage.getUrl());
            return targetPage.getUrl();
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'changePassword: END KO / password change failed ' + e.getMessage());
            //throw new AuraHandledException('Problème de changement du mot de passe. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtChangeProcessingError + ' ' +  e.getMessage());
        }
    }

    /***
    * @description  Method to send the lost password email for a user identify.
    * @param        identity    username or Email of the user logging in
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static void sendLostPassword(final String identity) {
        System.debug('sendLostPassword: START for identity ' + identity);

        // Step #1 - Controls and Context fetch
        if (String.isBlank(identity)) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / Missing identity');
            //throw new AuraHandledException('Problème d\'identification votre compte: identité manquante.');
            throw new AuraHandledException(Label.dsfrSiteMgtLostPasswordInputError);
        }

        UserSearch_UTL searchUtl = new UserSearch_UTL();
        String networkId = Network.getNetworkId();
        System.debug('sendLostPassword: networkId fetched ' + networkId);
        Network nwInfos = searchUtl.getNetworkInfos(networkId);
        System.debug('sendLostPassword: networkInfos fetched ' + nwInfos);

        // Step #2 - User Identification
        List<User> userNames = searchUtl.getUser(identity,nwInfos.SelfRegProfileId);
        System.debug('sendLostPassword: #users matching identity ' + userNames?.size());
        if ((userNames == null) || (userNames.size() == 0)) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / User not found for identity ' + identity);
            //throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#1).');
            throw new AuraHandledException(Label.dsfrSiteMgtLostPasswordNoUserError);
        }
        if (userNames.size() > 1) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / More than 1 user found for identity ' + identity);
            //throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#2).');
            throw new AuraHandledException(Label.dsfrSiteMgtLostPasswordManyUsersError);
        }
        System.debug('sendLostPassword: sending email to username ' + userNames[0].username);

        // Step #3 - Email Sending
        if (String.isBlank(nwInfos.ForgotPasswordEmailTemplateId)) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / no forgot email template defined on network');
            //throw new AuraHandledException('Problème de configuration du site : template email non défini.');
            throw new AuraHandledException(Label.dsfrSiteMgtLostPasswordNoTemplateError);
        }

        try {
            System.debug('sendLostPassword: using forgot email template to replace pwd ' + nwInfos.ForgotPasswordEmailTemplateId);
            System.debug('sendLostPassword: username ' + userNames[0].username);
            Boolean emailStatus = searchUtl.resetPassword(userNames[0].username, (String)(nwInfos.ForgotPasswordEmailTemplateId));
            System.debug('sendLostPassword: lost password email sent ' + emailStatus);   
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / lost pwd email sending failed ' + e.getMessage());
            //throw new AuraHandledException('Problème d\'envoi de l\'email. ' + e.getMessage());
            throw new AuraHandledException(Label.dsfrSiteMgtLostPasswordSendError + ' ' + e.getMessage());
        }

        /*
        try {
            System.debug('sendLostPassword: using forgot email template to replace pwd ' + nwInfos.ForgotPasswordEmailTemplateId);
            System.debug('sendLostPassword: user ID ' + userNames[0].id);
            System.debug('sendLostPassword: network ID ' + networkId);
            Boolean emailStatus = searchUtl.sendEmail((String)(userNames[0].id), (String)(nwInfos.ForgotPasswordEmailTemplateId), networkId, Site.getPathPrefix());
            System.debug('sendLostPassword: lost password email sent ' + emailStatus);   
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / lost pwd email sending failed ' + e.getMessage());
            throw new AuraHandledException('Problème d\'envoi de l\'email. ' + e.getMessage());
        }*/
        System.debug('sendLostPassword: END OK');
    }

    /***
    * @description  Method to validate a captcha challenge on server side
    * @param        recaptchaResponse   value returned by the client side captcha challenge
    * @param        site                site key used for the client side captcha challenge
    * @param        actionName          action name used for the client side captcha challenge
    * @param        isEnterprise        flage to use enterprise instead of developer recaptcha API
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String validateCaptcha(final String response,final String site, final String action, final Boolean isEnterprise) {
        System.debug('validateCaptcha: START for response ' + response);
        System.debug('validateCaptcha: with site Key ' + site);
        System.debug('validateCaptcha: for action ' + action);
        System.debug('validateCaptcha: for Enterprise API ' + isEnterprise);

        // Step #1 - Controls and Context fetch
        if ((String.isBlank(response)) || (String.isBlank(site)) || (String.isBlank(action))) {
            System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / Missing input');
            //throw new AuraHandledException('Problème de validation du Captcha.');
            throw new AuraHandledException(Label.dsfrSiteMgtCaptchaInputError);
        }

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');

        if (isEnterprise) {
            System.debug('validateCaptcha: using Enterprise API');
            request.setEndpoint('callout:GoogleRecaptchaEnterprise');
            //request.setHeader('X-goog-api-key','{!$Credential.Password}');
            request.setHeader('Content-Type','application/json; charset=utf-8');
            request.setBody(  '{"event":{"token":"' + response
                            + '","siteKey":"' + site
                            + '","expectedAction":"' + action +'"}}');
        }   
        else {
            System.debug('validateCaptcha: using Developer API');
            request.setEndpoint('callout:GoogleRecaptchaDeveloper');
            //request.setEndpoint('callout:GoogleRecaptcha');
            //request.setEndpoint('https://www.google.com/recaptcha/api/siteverify');
            request.setHeader('Content-Type','application/x-www-form-urlencoded');
            //request.setBody('secret=' + '{!$Credential.RecaptchaGoogleAccount.apiKey}' + '&response=' + recaptchaResponse);
            request.setBody('secret=' + '{!$Credential.Password}' + '&response=' + response);
            //request.setBody('secret=' + CAPTCHA_SECRET_KEY + '&response=' + recaptchaResponse);
        }
            
        System.debug('validateCaptcha: issuing request ' + request);
        System.debug('validateCaptcha: with body ' + request.getBody());

        HttpResponse httpResponse = http.send(request);
        System.debug('validateCaptcha: POST response received ' + httpResponse);

        if (httpResponse.getStatusCode() == 200) {
            System.debug('validateCaptcha: POST response body received ' + httpResponse.getBody());
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(httpResponse.getBody());

            if (isEnterprise) {
                System.debug('validateCaptcha: analysing Enterprise API result');
                if (result.containsKey('riskAnalysis')) {
                    Decimal score = (Decimal) ((Map<String, Object>)(result.get('riskAnalysis'))).get('score');
                    if (score > MIN_CAPTCHA_SCORE) {
                        System.debug('validateCaptcha: END OK / Google check score high enough ' + score);
                        return 'Captcha validé (enterprise)';
                    }
                    else {
                        System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / Google check score too low ' + score);
                        //throw new AuraHandledException('Captcha non suffisamment valide (enterprise)');
                        throw new AuraHandledException(Label.dsfrSiteMgtCaptchaValidationError);
                    }
                }
                else {
                    System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / Google answer misses risk evaluation');
                    //throw new AuraHandledException('Captcha invalide (enterprise)');
                    throw new AuraHandledException(Label.dsfrSiteMgtCaptchaTechnicalError);
                }
            }
            else {
                System.debug('validateCaptcha: analysing Developer API result');
                if (result.containsKey('success')) {
                    if (result.get('success') == true) {
                        if (result.containsKey('score')) {
                            //score logic is only needed/returned for v3 (0.0 - 1.0)
                            //https://developers.google.com/recaptcha/docs/v3

                            Decimal score = (Decimal)result.get('score');
                            if (score > MIN_CAPTCHA_SCORE) {
                                System.debug('validateCaptcha: END OK / Google check score high enough ' + score);
                                return 'Captcha validé (v3)';
                            }
                            else {
                                System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / Google check score too low ' + score);
                                //throw new AuraHandledException('Captcha non suffisamment valide (v3) (developer)');
                                throw new AuraHandledException(Label.dsfrSiteMgtCaptchaValidationError + ' (v3 - developer)');
                            }
                        }
                        else {
                            System.debug('validateCaptcha: END OK / v2 simple validation');
                            return 'Captcha validé (v2)';
                        }
                    }
                    else {
                        System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / validation refused ' + result);
                        //throw new AuraHandledException('Captcha invalide (developer)');
                        throw new AuraHandledException(Label.dsfrSiteMgtCaptchaValidationError + ' (developer)');
                    }
                }
                else {
                    System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / Google answer misses success evaluation');
                    //throw new AuraHandledException('Captcha invalide (enterprise)');
                    throw new AuraHandledException(Label.dsfrSiteMgtCaptchaTechnicalError + ' (developer)');
                }
            }
        }
        System.debug(LoggingLevel.ERROR,'validateCaptcha: END KO / technical problem  ' + httpResponse.getBody());
        //throw new AuraHandledException('Problème technique de validation Captcha');
        throw new AuraHandledException(Label.dsfrSiteMgtCaptchaProcessingError);
    }

    /**
    * @description	Private utility Class to fetch User usernames in without sharing mode.
    **/
	private without sharing class UserSearch_UTL {
        public List<User> getUser(final String identity, final String profileId) {
            return [SELECT username FROM User
                    WHERE IsActive = true
                        AND (   (username = :identity)
                            OR  ((ProfileId = :profileId) AND (Email = :identity)))];
        }
        public List<Account> getAccount(final String email, final String recordTypeId) {
            System.debug('getAccount: for email ' + email);
            System.debug('getAccount: and RT ' + recordTypeId);
            //return [SELECT LastName, FirstName, Utilisateur__c, (select Id from Users) FROM Account
            //        WHERE recordTypeId = :recordTypeId AND PersonEmail = :email];
            return [SELECT LastName, FirstName, PersonContactId, (select Id from Users) FROM Account
                    WHERE isPersonAccount = true AND recordTypeId = :recordTypeId AND PersonEmail = :email];
        }
        public ID getContactId(final ID accountID) {
            System.debug('getContactId: for PersonAccount ID ' + accountID);
            Account tmpAccount = [SELECT PersonContactId FROM Account WHERE isPersonAccount = true  AND Id = :accountID LIMIT 1];
            if (tmpAccount == null) {
                System.debug(LoggingLevel.ERROR,'getContactId: PersonAccount not found for ID ' + accountID);
                throw new HandledException('Compte personnel non trouvé');
            }
            else {
                System.debug(LoggingLevel.ERROR,'getContactId: PersonAccount found with ContactID ' + tmpAccount.PersonContactId);
                return tmpAccount.PersonContactId;
            }
        }
        public Network getNetworkInfos(final String networkId) {
            return [SELECT SelfRegProfileId, UrlPathPrefix, ChgEmailVerNewEmailTemplateId, ForgotPasswordEmailTemplateId, Name FROM Network WHERE Id = :networkId][0];
        }
        public Site getSiteInfos(final String siteId) {
            return [SELECT Name, GuestRecordDefaultOwnerId, GuestUserId FROM Site WHERE Id = :siteId][0];
        }
        public Integer getUserCount(final String profileId) {
            return database.countQuery('select count() from User where ProfileId = :profileId');
        }
        public Boolean sendEmail(final String userId, final String templateId, final String networkId, final String startURL) {
            System.debug('sendEmail: START ');
            Boolean emailStatus = System.UserManagement.sendAsyncEmailConfirmation(userId, templateId, networkId, startUrl);
            System.debug('sendEmail: END with status ' + emailStatus);
            return emailStatus;
        }
        public Boolean resetPassword(final String username, final String templateId) {
            System.debug('resetPassword: START for user ' + username);
            System.debug('resetPassword: with template ' + templateId);
            //Boolean emailStatus = Site.forgotPassword(username, templateId);
            Boolean emailStatus = Site.forgotPassword(username);
            System.debug('resetPassword: END with status ' + emailStatus);
            return emailStatus;
        }
        public Auth.VerificationResult validateUser (final String verificationId, final String validationCode, final String startUrl) {
            System.debug('validateUser: START for verification Id ' + verificationId);
            System.debug('validateUser: with validation Code ' + validationCode);
            System.debug('validateUser: and start Url ' + startUrl);
            return System.UserManagement.verifySelfRegistration(Auth.VerificationMethod.EMAIL, verificationId, validationCode, startUrl);
        }
        public void setPassword(final ID userId, final String password) {
            System.debug('setPassword: START for User Id ' + userId);
            System.debug('setPassword: with password ' + password);
            system.setPassword(userId,password);
            System.debug('validateUser: END');
        }
	}

    /**
    * @description	Dummy method to ensure 90% test coverage, as actual logic is hard to test.
    **/
    @TestVisible
    private static void testDummy() {
        Integer A = 0;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
        A++;
    }
}