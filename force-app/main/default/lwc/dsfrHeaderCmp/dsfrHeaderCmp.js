import { LightningElement, api, wire } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import getNavigations from '@salesforce/apex/dsfrNavigationMenu_CTL.getNavigations';

import isGuest from '@salesforce/user/isGuest';
import userId from '@salesforce/user/Id';
import basePathName from '@salesforce/community/basePath';

import LOGIN_LABEL from '@salesforce/label/c.dsfrHeaderLoginLabel';
import LOGOUT_LABEL from '@salesforce/label/c.dsfrHeaderLogoutLabel';
import SEARCH_LABEL from '@salesforce/label/c.dsfrHeaderSearchLabel';
import MENU_LABEL from '@salesforce/label/c.dsfrHeaderMenuLabel';
import CLOSE_LABEL from '@salesforce/label/c.dsfrHeaderCloseLabel';

export default class DsfrHeaderCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api logoTitle = 'Nom du Ministère';
    @api loginUrl; // Obsolete name, now corresponding to the main logo URL
    @api siteTitle = 'Titre du Site';
    @api siteTagline = 'Précisions sur l\'organisation';

    @api topMenu;
    @api mainMenu;

    @api showSearch = false;
    @api searchPage;

    @api hideLogin = false;

    @api isDebug = false;
    
    //-----------------------------------
    // Contextual Parameters
    //-----------------------------------
    isGuestUser = isGuest;
    currentUserId = userId;
    
    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    menuConfig;
    topMenuItems;
    mainMenuItems;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    loginLabel = LOGIN_LABEL;
    logoutLabel = LOGOUT_LABEL;
    searchLabel = SEARCH_LABEL;
    menuLabel = MENU_LABEL;
    closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom Getters
    //-----------------------------------

    get showLogin() {
        return !this.hideLogin;
    }
    /*get loginUrl() {
        return basePathName + '/login';
    }*/
    /*get logoutUrl() {
        return basePathName + '/logout';
    }*/

    //-----------------------------------
    // Context Handling (to set selected tab)
    //-----------------------------------
    @wire(CurrentPageReference) 
    wiredPageRef(data) {
        if (this.isDebug) console.log('wiredPageRef: START for header');
        if (data) {
            if (this.isDebug) console.log('wiredPageRef: data  received ', JSON.stringify(data));
            this.pageRef = data;
            if (this.isDebug) console.log('wiredPageRef: new pageRef ',this.pageRef);
            this[NavigationMixin.GenerateUrl](this.pageRef)
            .then((url) => {
                if (this.isDebug) console.log('wiredPageRef: new url generated ',url);
                if (this.isDebug) console.log('wiredPageRef: current mainMenuItems ', JSON.stringify(this.mainMenuItems));

                if (this.mainMenuItems) {
                    if (this.isDebug) console.log('wiredPageRef: searching tab likeliness');
                    let selectedTab = (this.mainMenuItems ?
                        this.mainMenuItems.reduce((bestMatch, item) => {
                            if (this.isDebug) console.log('wiredPageRef: processing item ',item);
                            if (this.isDebug) console.log('wiredPageRef: previous bestMatch ',bestMatch);

                            if (url.startsWith(item.actionValue)) {
                                if (this.isDebug) console.log('wiredPageRef: matching item found');
                                if (bestMatch) {
                                    if (bestMatch.actionValue.length > item.actionValue.length) {
                                        if (this.isDebug) console.log('wiredPageRef: keeping previous best match');
                                        return bestMatch;
                                    }
                                    else {
                                        if (this.isDebug) console.log('wiredPageRef: matching item found');
                                        return item;
                                    }
                                }
                                else {
                                    if (this.isDebug) console.log('wiredPageRef: no previous best match');
                                    return item;
                                }
                            }
                            else {
                                if (this.isDebug) console.log('wiredPageRef: no match');
                                return bestMatch;
                            }
                        }) : null);
                    if (this.isDebug) console.log('wiredPageRef: tab searched ',selectedTab);

                    if ((selectedTab == this.mainMenuItems[0]) && (url !== selectedTab.actionValue)) {
                        if (this.isDebug) console.log('wiredPageRef: ignoring home page');
                        selectedTab = null;
                    }

                    if (this.isDebug) console.log('wiredPageRef: tab selected ',selectedTab);

                    let tabItems = this.template.querySelectorAll('a.fr-nav__link');
                    if (this.isDebug) console.log('wiredPageRef: tabs fetched ',tabItems);

                    tabItems?.forEach(item => {
                        if (this.isDebug) console.log('wiredPageRef: processing tab ',item);
                        if (this.isDebug) console.log('wiredPageRef: with name ',item.dataset.value);
                        if (item.dataset.value === selectedTab?.label) {
                            item.setAttribute('aria-current','page');
                        }
                        else {
                            item.removeAttribute('aria-current');
                        }
                    });
                    if (this.isDebug) console.log('wiredPageRef: tabs selection updated ',tabItems);
                }
                else {
                    if (this.isDebug) console.log('wiredPageRef: no tab yet ');
                }

                if (this.isDebug) console.log('wiredPageRef: END ');
            });
        }
        else {
            if (this.isDebug) console.log('wiredPageRef: END no data ');
        }
    }


    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for header');
        if (this.isDebug) console.log('connected: topMenu ',this.topMenu);
        if (this.isDebug) console.log('connected: mainMenu', this.mainMenu);

        this.menuConfig = [{label:this.topMenu,showHome:false},{label:this.mainMenu,showHome:true}];
        if (this.isDebug) console.log('connected: menuConfig init ', this.menuConfig);

        if (this.isDebug) console.log('connected: END for header');
    }

    @wire(getNavigations, { menus:'$menuConfig', userId: '$currentUserId'})
    wiredHeaderMenus({ error, data }) {
        if (this.isDebug) console.log('wiredHeaderMenus: START with user ', this.currentUserId);
        if (this.isDebug) console.log('wiredHeaderMenus: menuConfig ',this.menuConfig);
        if (this.isDebug) console.log('wiredHeaderMenus: top menu ',this.topMenu);
        if (this.isDebug) console.log('wiredHeaderMenus: bottom menu ',this.mainMenu);

        if (data) {
            if (this.isDebug) console.log('wiredHeaderMenus: data  received ', JSON.stringify(data));

            let topMenuData = data[this.topMenu] || [];
            let topMenuItems = [];
            topMenuData.forEach(item => {
                if (this.isDebug) console.log('wiredHeaderMenus: processing top menu item ',item);
                let newItem = {... item};
                newItem.labelOrig = item.label;
                if (newItem.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredHeaderMenus: unescaping label');
                    newItem.label = this.htmlDecode(newItem.label);
                }
                if (newItem.label?.includes('#')) {
                    let labelParts = newItem.label.split('#');
                    if (this.isDebug) console.log('wiredHeaderMenus: extracting icon name ', labelParts);
                    newItem.class = 'fr-btn fr-icon-' + labelParts[1];
                    newItem.label = labelParts[0];
                }
                else {
                    newItem.class = 'fr-btn';
                }
                topMenuItems.push(newItem);
            });
            this.topMenuItems = topMenuItems;
            if (this.isDebug) console.log('wiredHeaderMenus: topMenuItems updated',this.topMenuItems);

            let mainMenuData = data[this.mainMenu] || [];
            let mainMenuItems = [];
            mainMenuData.forEach(item => {
                if (this.isDebug) console.log('wiredHeaderMenus: processing main menu item ',item);
                let newItem = {... item};
                newItem.labelOrig = item.label;
                if (newItem.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredHeaderMenus: unescaping label');
                    newItem.label = this.htmlDecode(newItem.label);
                }
                mainMenuItems.push(newItem);
            });
            this.mainMenuItems = mainMenuItems;
            if (this.isDebug) console.log('wiredHeaderMenus: mainMenuItems updated',this.mainMenuItems);
            if (this.isDebug) console.log('wiredHeaderMenus: END / menus initialized');
        }
        else if (error) {
            console.warn('wiredHeaderMenus: END KO for menus fetch / error  received ', JSON.stringify(error));
            this.topMenuItems = [];
            this.mainMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredHeaderMenus: END / no response');
        }
    }

    // Add userId
    /*@wire(getMenuItems, { navLabel: '$topMenu', showHome: false })
    wiredTopMenu({ error, data }) {
        if (this.isDebug) console.log('wiredTopMenu: START for header top menu ',this.topMenu);
        if (data) {
            if (this.isDebug) console.log('wiredTopMenu: data  received ', JSON.stringify(data));
            this.topMenuItems = [];
            data.forEach(item => {
                let newItem = {... item};
                if (item.label?.includes('#')) {
                    let labelParts = item.label.split('#');
                    if (this.isDebug) console.log('wiredTopMenu: extracting icon name ', labelParts);
                    newItem.class = 'fr-btn fr-icon-' + labelParts[1];
                    newItem.label = labelParts[0];
                }
                else {
                    newItem.class = 'fr-btn';
                }
                this.topMenuItems.push(newItem);
            });
            if (this.isDebug) console.log('wiredTopMenu: END / using data as menuItems',this.topMenuItems);
        }
        else if (error) {
            console.warn('wiredTopMenu: END KO for header top menu / error  received ', JSON.stringify(error));
            this.topMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredTopMenu: END / no response');
        }
    }

    @wire(getMenuItems, { navLabel: '$mainMenu', showHome: true })
    wiredMainMenu({ error, data }) {
        if (this.isDebug) console.log('wiredMainMenu: START for header main menu ',this.mainMenu);
        if (data) {
            if (this.isDebug) console.log('wiredMainMenu: data  received ', JSON.stringify(data));
            this.mainMenuItems = [];
            data.forEach(item => {
                let newItem = {... item};
                this.mainMenuItems.push(newItem);
            });
            //this.mainMenuItems[0].isCurrent = 'page';
            if (this.isDebug) console.log('wiredMainMenu: END / using data as menuItems',this.mainMenuItems);
        }
        else if (error) {
            console.warn('wiredMainMenu: END KO for header main menu / error  received ', JSON.stringify(error));
            this.mainMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredMainMenu: END / no response');
        }
    }*/

    renderedCallback() {
        if (this.isDebug) console.log('rendered: header START');

        if (this.isDebug) console.log('rendered: top Menu ',this.topMenu);
        if (this.isDebug) console.log('rendered: main Menu', this.mainMenu);

        if (this.isDebug) console.log('rendered: title ',document?.title);
        if (this.isDebug) console.log('rendered: head title ',document?.head?.title);

        /*console.log('rendered: head list ',document?.head);
        console.log('rendered: head navigation meta ',document?.head?.querySelector('meta[name="navigation"]'));
        console.log('rendered: header head navigation meta value ',document?.head?.querySelector('meta[name="navigation"]')?.content);
        console.log('rendered: header head navigation meta ',document?.querySelector('meta[name="navigation"]'));
        console.log('rendered: header head navigation meta value ',document?.querySelector('meta[name="navigation"]')?.content);
        console.log('rendered: header head navigation meta ',document.querySelector('meta[name=navigation]'));

        console.log('rendered: meta ',document?.querySelectorAll('meta'));

        console.log('rendered: meta #children ',document.head.childNodes.length);
        console.log('rendered: meta children ',document.head.childNodes);

        document.head.childNodes.forEach(item => {
            if (item.nodeName === 'META') {
                console.log('rendered: head item ',item);
                console.log('rendered: head item node type ',item.nodeType);
                console.log('rendered: head item node name ',item.nodeName);
                console.log('rendered: head item name ',item.name);
                console.log('rendered: head item content ',item.content);
            }
            else {
                console.log('rendered: ignoring head item node name ',item.nodeName);
            }
        })

        setTimeout(() => {
            console.log('rendered: head START DELAY ');
            console.log('rendered: head #children ',document.head.children.length);
            console.log('rendered: head children ',document.head.children);
            let countMeta = 0;
            for (let iter = 0 ; iter < document.head.children.length; iter++) {
                console.log('rendered: node ' + iter,document.head.children[iter]);
            }

            console.log('rendered: head countMeta ',countMeta);
            console.log('rendered: head children navigation ',document.head.children['navigation']);
            console.log('rendered: head children navigation ',document.head.children['navigation']);
            console.log('rendered: head END DELAY ');
        },500);   

        console.log('rendered: header head meta ',document.head.meta);*/

        if (this.isDebug) console.log('rendered: header END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Navigation links
    handleLogoClick(event) {
        if (this.isDebug) console.log('handleLogoClick: START for logo link ');
        event.stopPropagation();
        event.preventDefault();
        let newPageRef = {
            type: 'standard__webPage',
            attributes: {
                url: this.loginUrl
            }
        };
        if (this.isDebug) console.log('handleLogoClick: newPageRef prepared ',JSON.stringify(newPageRef));
        
        this[NavigationMixin.Navigate](newPageRef);
        if (this.isDebug) console.log('handleLogoClick: END for logo link');
    }
    handleTopClick(event){
        if (this.isDebug) console.log('handleTopClick: START for header menu ',this.topMenu);
        if (this.isDebug) console.log('handleTopClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleTopClick: topMenuItems ',JSON.stringify(this.topMenuItems));
        this.navigate(event,this.topMenuItems);
        if (this.isDebug) console.log('handleTopClick: END for header menu',this.topMenu);
    }
    handleMainClick(event){
        if (this.isDebug) console.log('handleMainClick: START for header menu ',this.mainMenu);
        if (this.isDebug) console.log('handleMainClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleMainClick: mainMenuItems ', JSON.stringify(this.mainMenuItems));
        this.navigate(event,this.mainMenuItems);
        if (this.isDebug) console.log('handleMainClick: END for header menu',this.topMenu);
    }

    // Login & logout buttons
    handleLogin(event) {
        if (this.isDebug) console.log('handleLogin: START');
        event.stopPropagation();
        event.preventDefault();

        let loginPage = {type:"comm__namedPage",attributes:{name:"Login"}};
        //let loginPage = {type:'standard__webPage',attributes: {url:'/login'}};
        //let loginPage = {type: 'comm__loginPage',attributes: {actionName: 'login'};
        if (this.isDebug) console.log('handleLogin: loginPage init ', JSON.stringify(loginPage));

        this.collapseModals();
        if (this.isDebug) console.log('handleLogin: modal closed');

        this[NavigationMixin.Navigate](loginPage);                                                                      
        if (this.isDebug) console.log('handleLogin: END / navigation triggered');
    }
    handleLogout(event) {
        if (this.isDebug) console.log('handleLogout: START');
        event.stopPropagation();
        event.preventDefault();

        //if (this.isDebug) console.log('handleLogout: location fetched ', window?.location);
        //if (this.isDebug) console.log('handleLogout: hostname fetched ', window?.location?.hostname);
        if (this.isDebug) console.log('handleLogout: basePathName fetched ', basePathName);
        const baseUrl = basePathName.match(/^\/\w+/i);
        if (this.isDebug) console.log('handleLogout: baseUrl extracted ', baseUrl);
        /*const sitePrefix = basePathName.replace(/\/s$/i, ""); // site prefix is the site base path without the trailing "/s"
        const baseUrl = sitePrefix.slice(0,sitePrefix.indexOf('/',1));*/
        let logoutUrl = baseUrl + "/secur/logout.jsp";

        //let baseUrl = basePathName.slice(0,basePathName.indexOf('/',1));
        //if (this.isDebug) console.log('handleLogout: baseUrl extracted ', baseUrl);
        //let logoutUrl = baseUrl + 'vforcesite/secur/logout.jsp?retUrl=' + encodeURI(basePathName);
        if (this.isDebug) console.log('handleLogout: logoutUrl init ', logoutUrl);
        
        /*let logoutPage = {type:'standard__webPage',attributes: {url: logoutUrl}};
        //https://menjs--devpgro.sandbox.my.site.com/RecrutLWRvforcesite/servlet/networks/switch?startURL=%2Fsecur%2Flogout.jsp
        //https://menjs--devpgro.sandbox.my.site.com/RecrutLWRvforcesite/servlet/networks/switch?startURL=%2Fsecur%2Flogout.jsp
        //let logoutPage = {type:'standard__webPage',attributes: {url:'/secur/logout.jsp'}};
        //let logoutPage = {type: 'comm__loginPage',attributes: {actionName: 'logout'};
        if (this.isDebug) console.log('handleLogout: logoutPage init ', JSON.stringify(logoutPage));
        
        this[NavigationMixin.Navigate](logoutPage);*/
        this.collapseModals();
        if (this.isDebug) console.log('handleLogout: modal closed');

        window.open(logoutUrl, '_self');
        if (this.isDebug) console.log('handleLogout: END / navigation triggered');
    }

    // Search button action
    handleSearchKey(event) {
        if (this.isDebug) console.log('handleSearchKey: START',event);
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (this.isDebug) console.log('handleSearchKey: triggering search');
            this.handleSearch(event);
        }
        if (this.isDebug) console.log('handleSearchKey: END');
    }
    handleSearch(event) {
        if (this.isDebug) console.log('handleSearch: START');
        event.stopPropagation();
        event.preventDefault();

        this.collapseModals();
        if (this.isDebug) console.log('handleSearch: modal closed');

        const searchInput = this.template.querySelector('input[name="search-input"]');
        if (this.isDebug) console.log('handleSearch: searchInput fetched ',searchInput);

        const searchValue = searchInput?.value;
        if (this.isDebug) console.log('handleSearch: searchValue extracted ',searchValue);


        let searchPage = (this.searchPage ? {"type":"comm__namedPage","attributes":{"name":this.searchPage}} : {"type":"standard__search"});
        searchPage.state = {"term": searchValue};
        //let searchPage = {type: 'comm__namedPage',attributes:{name: 'Search'},state: {term:"test"}}
        if (this.isDebug) console.log('handleSearch: searchPage init ', JSON.stringify(searchPage));

        this[NavigationMixin.Navigate](searchPage);
        if (this.isDebug) console.log('handleSearch: END / navigation triggered');
    }

    // Expand/collapse of modals when in mobile/narrow mode
    toggleModal(event) {
        if (this.isDebug) console.log('toggleModal: START');
        if (this.isDebug) console.log('toggleModal: event',event);

        const modalName = event.target.dataset.modal;
        if (this.isDebug) console.log('toggleModal: modalName identified ',modalName);

        let modalDiv = this.template.querySelector('div[data-modal=' + modalName + ']');
        if (this.isDebug) console.log('toggleModal: modalDiv found ',modalDiv);

        if (modalDiv) {
            if (this.isDebug) console.log('toggleModal: current classList ',modalDiv.classList);
            if (modalDiv.classList.contains('fr-modal--opened')) {
                if (this.isDebug) console.log('toggleModal: closing modal');
                modalDiv.classList.remove('fr-modal--opened');
            }
            else {
                if (this.isDebug) console.log('toggleModal: opening modal');
                modalDiv.classList.add('fr-modal--opened');
            }
        }
        if (this.isDebug) console.log('toggleModal: END');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------  
    navigate = function(event,menuItems) {
        if (this.isDebug) console.log('navigate: START for menu ', JSON.stringify(menuItems));

        this.collapseModals();
        if (this.isDebug) console.log('navigate: modal closed');

        const selectedLink = event.target.dataset.value;
        if (this.isDebug) console.log('navigate: selectedLink identified ',selectedLink);

        const selectedItem = menuItems.find(item => item.label === selectedLink);
        if (this.isDebug) console.log('navigate: selectedItem found ',JSON.stringify(selectedItem));

        const newPageRef = {
            type: 'standard__webPage',
            attributes: {
                url: selectedItem.actionValue
            }
        };
        if (this.isDebug) console.log('navigate: newPageRef prepared ',JSON.stringify(newPageRef));
        

        this[NavigationMixin.Navigate](newPageRef);
        if (this.isDebug) console.log('navigate: END for navigation menu / Navigation triggered');
        return;
    }

    collapseModals = function() {
        if (this.isDebug) console.log('collapseModals: START');

        let openModal = this.template.querySelector('div.fr-modal--opened');
        if (this.isDebug) console.log('collapseModals: openModal fetched ',openModal);

        if (openModal) {
            if (this.isDebug) console.log('collapseModals: closing modal');
            openModal.classList.remove('fr-modal--opened');
        }

        if (this.isDebug) console.log('collapseModals: END');
    }

    htmlDecode = function(input) {
        if (this.isDebug) console.log('htmlDecode: START with ',input);
        const doc = new DOMParser().parseFromString(input, "text/html");
        let result = doc.documentElement.textContent;
        if (this.isDebug) console.log('htmlDecode: END with ',result);
        return result;
    }
      
}