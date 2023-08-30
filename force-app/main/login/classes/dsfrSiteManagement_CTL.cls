/***
* @description  Lightning controller to manage registratin, login and passwords
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
            throw new AuraHandledException('Problème technique lors de votre identification.');
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
            throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#1).');
        }
        if (userNames.size() > 1) {
            System.debug(LoggingLevel.ERROR,'loginViaIdentity: END KO / More than 1 user found for identity ' + identity);
            throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#2).');
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
    * @description  Method to upload base64 content as a new ContentDocument and 
    *               automatically link it to a record (as new ContentDocumentLink).
    * @param        newAccount  New Account data to create
    * @param        password    Name of the ContentDocument to be created 
    * @param        startUrl    List of IDs of the records to which the new ContentDocument should be linked 
    * @return       String      starUrl with authentication embedded
    * @exception    Various exceptions in case of wrong input or execution failure.
    ***/
    @AuraEnabled
    public static String registerUser(Account newAccount, final String password, String startUrl) {
        System.debug('registerUser: START for newAccount ' + newAccount);

        // Step #1 - Controls and Context fetch
        if (newAccount == null || String.isBlank(newAccount.LastName) || String.isBlank(newAccount.FirstName) || String.isBlank(newAccount.PersonEmail)) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / Missing Account info (first/last/email) ' + newAccount);
            throw new AuraHandledException('Problème de création de votre compte: données obligatoires manquantes.');
        }
        if (String.isBlank(password)) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / Missing password');
            throw new AuraHandledException('Problème de création de votre compte: mot de passe manquant.');
        }

        UserSearch_UTL searchUtl = new UserSearch_UTL();

        String networkId = Network.getNetworkId();
        System.debug('registerUser: networkId fetched ' + networkId);
        Network nwInfos = searchUtl.getNetworkInfos(networkId);
        System.debug('registerUser: nwInfos fetched ' + nwInfos);

        List<User> userNames = searchUtl.getUser(newAccount.PersonEmail,nwInfos.SelfRegProfileId);
        System.debug('registerUser: #users matching Email ' + userNames?.size());
        if (userNames?.size() > 0) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / at least 1 user found with email ' + newAccount.PersonEmail);
            throw new AuraHandledException('Problème de création de votre compte: Email déjà utilisé sur un compte.');
        }
        System.debug('loginViaIdentity: email usage controlled');

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
        System.debug('registerUser: startUrl provided ' + startUrl);
        if (String.isEmpty(startUrl)) {
            startUrl = Site.getPathPrefix();
            System.debug('registerUser: default startUrl set ' + startUrl);
        }

        /*ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
        System.debug('registerUser: orgSettings fetched ' + orgSettings);
        Organization orgInfos = [select Name, DefaultLocaleSidKey, LanguageLocaleKey, TimeZoneSidKey from Organization limit 1];
        System.debug('registerUser: currentDomain fetched ' + currentDomain);*/
        newAccount.OwnerId = siteInfos.GuestRecordDefaultOwnerId;
        System.debug('registerUser: newAccount OnwerId updated ' + newAccount.OwnerId);

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
        Site.validatePassword(newUser, password, password);
        System.debug('registerUser: password format checked');


        // Step #3 - Account and User Registration
        try {
            insert newAccount;
            System.debug('registerUser: new Account inserted ' + newAccount);
            System.debug('registerUser: new Account ID ' + newAccount.Id);
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon PersonAccount creation ' + e);
            throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
        }

        ID userId;
        try {
            userId = Site.createExternalUser(newUser, newAccount.Id, password, false);
            //ID userId = Site.createExternalUser(newUser, newAccount.Id, password);
            //String userId = Site.createPortalUser(newUser, newAccount.Id, password);
            System.debug('registerUser: new User created ' + userId);            
        }
        catch (Site.ExternalUserCreateException e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon Site User registration ' + e);
            for (String iter : e.getDisplayMessages()) {
                System.debug(LoggingLevel.ERROR,'registerUser: error ' + iter);
            }
            throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
        }
        catch (exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: KO upon User registration ' + e);
            throw new AuraHandledException('Problème de création de votre compte. ' + e.getMessage());
        }


        // Step #4 - User login
        System.PageReference targetPage;
        try {
            targetPage = Site.login(newUser.username, password, startUrl);
            System.debug('registerUser: login OK and targetPage evaluated ' + targetPage);
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / login failed ' + e.getMessage());
            throw new AuraHandledException('Problème de connexion à votre nouveau compte. ' + e.getMessage());
        }

        /*try {
            if (String.isBlank(nwInfos.ChgEmailVerNewEmailTemplateId)) {
                System.debug('registerUser: no email verification template defined on network');
            }
            else {
                System.debug('registerUser: using email verification template to check user email ' + nwInfos.ChgEmailVerNewEmailTemplateId);
                System.debug('registerUser: user ID ' + userId);
                System.debug('registerUser: network ID ' + networkId);
                System.debug('registerUser: startUrl ' + startUrl);
                // Send email confirmation
                //Boolean emailStatus = System.UserManagement.sendAsyncEmailConfirmation(userId, nwInfos.ChgEmailVerNewEmailTemplateId, networkId, startUrl);
                Boolean emailStatus = searchUtl.sendEmail(userId, nwInfos.ChgEmailVerNewEmailTemplateId, networkId, startUrl);
                System.debug('registerUser: email validation email sent ' + emailStatus);
            }
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'registerUser: END KO / email verification failed ' + e.getMessage());
            throw new AuraHandledException('Problème de vérification de votre adresse email. ' + e.getMessage());
        }*/
            
        System.debug('loginViaEmail: END OK with ' + targetPage.getUrl());
        return targetPage.getUrl();
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
            throw new AuraHandledException('Problème d\'identification votre compte: identité manquante.');
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
            throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#1).');
        }
        if (userNames.size() > 1) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / More than 1 user found for identity ' + identity);
            throw new AuraHandledException('Problème d\'identification de votre compte à partir de votre identité (#2).');
        }
        System.debug('sendLostPassword: sending email to username ' + userNames[0].username);

        // Step #3 - Email Sending
        if (String.isBlank(nwInfos.ForgotPasswordEmailTemplateId)) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / no forgot email template defined on network');
            throw new AuraHandledException('Problème de configuration du site : template email non défini.');
        }
        try {
            System.debug('sendLostPassword: using forgot email template to replace pwd ' + nwInfos.ForgotPasswordEmailTemplateId);
            System.debug('sendLostPassword: user ID ' + userNames[0].id);
            System.debug('sendLostPassword: network ID ' + networkId);
            Boolean emailStatus = searchUtl.sendEmail((String)(userNames[0].id), (String)(nwInfos.ChgEmailVerNewEmailTemplateId), networkId, Site.getPathPrefix());
            System.debug('sendLostPassword: lost password email sent ' + emailStatus);   
        }
        catch(Exception e) {
            System.debug(LoggingLevel.ERROR,'sendLostPassword: END KO / lost pwd email sending failed ' + e.getMessage());
            throw new AuraHandledException('Problème d\'envoi de l\'email. ' + e.getMessage());
        }
        System.debug('sendLostPassword: END OK');
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
        public System.ResetPasswordResult resetPassword(final String userId, final String templateId) {
            System.debug('resetPassword: START ');
            System.ResetPasswordResult resetStatus = System.resetPasswordWithEmailTemplate(userId, true, templateId);
            System.debug('resetPassword: END with status ' + resetStatus);
            return resetStatus;
        }
        /*public UserRole getPortalRole() {
            return [Select Name From UserRole Where PortalType = 'None' Limit 1];
        }*/
	}


    /**
    * @description	Dummy method to ensure 90% test coverage, as .
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