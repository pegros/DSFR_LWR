import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
//import { getPicklistValues } from 'lightning/uiObjectInfoApi';
//import { getObjectInfos } from 'lightning/uiObjectInfoApi';
import getPicklistValues from '@salesforce/apex/dsfrPicklist_CTL.getPicklistValues';

export default class DsfrSearchCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api inputPlaceholder;      // search term input placeholder
    @api searchButtonTitle;     // search button title
    @api showSearch = false;    // Display search bar
    @api searchPage;            // Search page name (if not standard one)
    @api mainCriteria;          // Main criteria configuration
    @api criteria;              // Additional criteria configuration

    @api wrappingClass;         // Classes pour modifier le style du conteneur du composant 
    @api headerClass;           // Classes pour modifier le style du titre des critères complémentaires.

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    mainFieldList;          // Picklist field API Names for main Criteria
    fieldList;              // Picklist field API Names for additional Criteria

    currentState;           // Current page state
    searchTerm;             // Current page state search term

    mainCriteriaList;       // main criteria values
    mainCriteriaSelected;   // list of selected main criteria
    criteriaList;           // additional criteria values
    criteriaSelected;       // list of selected additional criteria

    isReady = false;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------

    get searchTermInput() {
        return (this.mainCriteriaList?.length > 0 ? 5 : 9);
    }

    //-----------------------------------------------------
    // Context Data
    //-----------------------------------------------------
    @wire(getPicklistValues, { fieldList: '$mainFieldList' })
    wiredMainPicklists({ error, data }) {
        if (this.isDebug) console.log('wiredMainPicklists: START for main search criteria');
        if (data) {
            if (this.isDebug) console.log('wiredMainPicklists: Picklist descriptions fetched ', JSON.stringify(data));
            let criteriaList = JSON.parse(JSON.stringify(data));

            if (this.currentState) {
                if (this.isDebug) console.log('wiredMainPicklists: setting initial states');
                let mainCriteriaSelected = [];
                this.mainCriteriaList = this.initCriteria(criteriaList,this.currentState,mainCriteriaSelected);
                if (mainCriteriaSelected.length > 0) {
                    this.mainCriteriaSelected = mainCriteriaSelected;
                    if (this.isDebug) console.log('wiredMainPicklists: initial selection set', JSON.stringify(this.mainCriteriaSelected));
                }
                else {
                    if (this.isDebug) console.log('wiredMainPicklists: no initial selection');
                }
            }
            else {
                if (this.isDebug) console.log('wiredMainPicklists: no current state to set');
                this.mainCriteriaList = criteriaList;
            }
        }
        else if (error) {
            console.warn('wiredMainPicklists: Picklist fetch failed ', JSON.stringify(error));
            this.mainCriteriaList = [];
        }
        if (this.isDebug) console.log('wiredMainPicklists: END for main search criteria');
    }

    @wire(getPicklistValues, { fieldList: '$fieldList' })
    wiredPicklists({ error, data }) {
        if (this.isDebug) console.log('wiredPicklists: START for search criteria ');
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: Picklist descriptions fetched ', JSON.stringify(data));
            let criteriaList = JSON.parse(JSON.stringify(data));

            criteriaList.forEach(item => {
                if (item.values.length < 11) {
                    item.isTag = true;
                }
            });
            if (this.isDebug) console.log('wiredPicklists: Picklist tags init ', JSON.stringify(criteriaList));

            if (this.currentState) {
                if (this.isDebug) console.log('wiredPicklists: setting initial states');
                let criteriaSelected = [];
                this.criteriaList = this.initCriteria(criteriaList,this.currentState,criteriaSelected);
                if (criteriaSelected.length > 0) {
                    this.criteriaSelected = criteriaSelected;
                    if (this.isDebug) console.log('wiredPicklists: initial selection set', JSON.stringify(this.criteriaSelected));
                }
                else {
                    if (this.isDebug) console.log('wiredPicklists: no initial selection');
                }
            }
            else {
                if (this.isDebug) console.log('wiredPicklists: no current state to set');
                this.criteriaList = criteriaList;
            }
        }
        else if (error) {
            console.warn('wiredPicklists: Picklist fetch failed ', JSON.stringify(error));
            this.criteriaList = [];
        }
        if (this.isDebug) console.log('wiredPicklists: END for search criteria');
    }

    @wire(CurrentPageReference) 
    wiredPageRef(data) {
        if (this.isDebug) console.log('wiredPageRef: START for search');
        if (this.isDebug) console.log('wiredPageRef: page ref provided ', JSON.stringify(data));

        this.currentState = data.state;
        if (this.isDebug) console.log('wiredPageRef: current state set ', JSON.stringify(this.currentState));

        this.searchTerm = (this.currentState.term || '').trim();
        if (this.isDebug) console.log('wiredPageRef: search term updated ', this.searchTerm);

        if (this.mainCriteriaList) {
            if (this.isDebug) console.log('wiredPageRef: resetting main criteria ');
            this.mainCriteriaSelected = this.reviewCriteria(this.mainCriteriaList,this.currentState);
        }
        if (this.criteriaList) {
            if (this.isDebug) console.log('wiredPageRef: resetting criteria ');
            this.criteriaSelected = this.reviewCriteria(this.criteriaList,this.currentState);
        }

        if (this.isDebug) console.log('wiredPageRef: END for search');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for search');
        if (this.isDebug) console.log('connected: showSearch ', this.showSearch);
        
        if (this.mainCriteria) {
            if (this.isDebug) console.log('connected: processing mainCriteria ', this.mainCriteria);
            try {
                this.mainFieldList = JSON.parse(this.mainCriteria);
                if (this.isDebug) console.log('connected: main field list registered ', mainFieldList);
            }
            catch (error) {
                console.warn('connected: main criteria parsing failed ', error);
            }
        }
        if (this.criteria) {
            if (this.isDebug) console.log('connected: processing criteria ', this.criteria);
            try {
                this.fieldList = JSON.parse(this.criteria);
                if (this.isDebug) console.log('connected: additional field list registered ', fieldList);
            }
            catch (error) {
                console.warn('connected: additional criteria parsing failed ', error);
            }
        }

        if (this.isDebug) console.log('connected: END for search');
    }

    /*renderedCallback() {
        if (this.isDebug) console.log('rendered: START for search');

        if (this.isDebug) console.log('rendered: currentState ', JSON.stringify(this.currentState));
        if (this.isDebug) console.log('rendered: searchTerm ',this.searchTerm);

        if (this.isDebug) console.log('rendered: END for search');
    }*/

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    // Expand/Collapse events
    expandCollapse(event) {
        if (this.isDebug) console.log('expandCollapse: START');
        if (this.isDebug) console.log('expandCollapse: event ',event);
        event.stopPropagation();
        event.preventDefault();

        let currentTarget = event.target?.value;
        if (this.isDebug) console.log('expandCollapse: current target fetched ', currentTarget);

        let currentStatus =  event.target?.ariaExpanded;
        if (this.isDebug) console.log('expandCollapse: current status fetched ', currentStatus);

        let currentSection = this.template.querySelector("div.fr-collapse[data-name='" + currentTarget + "']");
        if (this.isDebug) console.log('expandCollapse: current section fetched ', currentSection);
        
        if (currentStatus == "true") {
            if (this.isDebug) console.log('expandCollapse: collapsing section');
            currentSection.classList?.remove("fr-collapse--expanded");
            event.target.ariaExpanded = "false";
        }
        else {
            if (this.isDebug) console.log('expandCollapse: expanding section');
            currentSection.classList.add("fr-collapse--expanded");
            event.target.ariaExpanded = "true";
        }

        if (this.isDebug) console.log('expandCollapse: END');
    }

    // Search term input events
    handleInputLeave(event){
        if (this.isDebug) console.log('handleInputLeave: START for search with term ',this.searchTerm);
        event.stopPropagation();
        event.preventDefault();

        let searchInput = this.template.querySelector('input.mainSearch');
        if (this.isDebug) console.log('handleInputLeave: searchInput found ', searchInput);
        if (searchInput) {
            this.searchTerm = searchInput.value;
            if (this.isDebug) console.log('handleInputLeave: term updated ');
        }

        if (this.isDebug) console.log('handleInputLeave: END for search with term ',this.searchTerm);
    }

    // Option Selection events
    toggleMenuSelect(event){
        if (this.isDebug) console.log('toggleMenuSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleMenuSelect: event ',event);
        if (this.isDebug) console.log('toggleMenuSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleMenuSelect: selected Name ',event.srcElement.dataset.name);
        if (this.isDebug) console.log('toggleMenuSelect: previous situation ', event.srcElement.ariaCurrent);

        /*let srcCmp = this.template.querySelector("a.menuSelector[data-name='"+ event.srcElement.dataset.name +"']");
        if (this.isDebug) console.log('toggleMenuSelect: srcCmp fetched ', srcCmp);
        if (this.isDebug) console.log('toggleMenuSelect: with attributes ',srcCmp.getAttributeNames());*/

        if (event.srcElement.ariaCurrent) {
            if (this.isDebug) console.log('toggleMenuSelect: deselecting item');
            event.srcElement.removeAttribute('aria-current');
            //srcCmp.removeAttribute('aria-current');
            // delete srcCmp.ariaCurrent
            //event.srcElement.ariaCurrent = '';
        }
        else {
            if (this.isDebug) console.log('toggleMenuSelect: selecting item');
            event.srcElement.ariaCurrent = 'selection';
            //srcCmp.ariaCurrent = 'selection';
        }

        if (this.isDebug) console.log('toggleMenuSelect: new situation ', event.srcElement.ariaCurrent);
        //if (this.isDebug) console.log('toggleMenuSelect: new situation ', srcCmp.ariaCurrent);

        this.activateApply(false);
        this.activateSearch(false);
        this.mainCriteriaSelected = this.selectOption(event.srcElement.dataset.name,this.mainCriteriaList,this.mainCriteriaSelected,(event.srcElement.ariaCurrent === 'selection'));
        if (this.isDebug) console.log('toggleMenuSelect: END for search');
    }
    toggleTagSelect(event){
        if (this.isDebug) console.log('toggleTagSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleTagSelect: event ',event);
        if (this.isDebug) console.log('toggleTagSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleTagSelect: selected Name ',event.srcElement.dataset.name);
        if (this.isDebug) console.log('toggleTagSelect: situation ', event.srcElement.ariaPressed);

        event.srcElement.ariaPressed = (event.srcElement.ariaPressed === "true" ? "false" : "true");

        this.activateApply(false);
        this.activateSearch(false);
        this.criteriaSelected = this.selectOption(event.srcElement.dataset.name,this.criteriaList,this.criteriaSelected,(event.srcElement.ariaPressed === "true"));

        if (this.isDebug) console.log('toggleTagSelect: END for search');
    }
    toggleCheckSelect(event) {
        if (this.isDebug) console.log('toggleCheckSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleCheckSelect: event ',event);
        if (this.isDebug) console.log('toggleCheckSelect: event detail ',event.detail);

        const selectName = event.srcElement.dataset.name;
        if (this.isDebug) console.log('toggleCheckSelect: selected Name ', selectName);
        
        let selectInput = this.template.querySelector("input.checkSelector[name='" + selectName + "']");
        if (this.isDebug) console.log('toggleCheckSelect: selectInput found ', selectInput);

        if (selectInput) {
            let selectState = selectInput.checked;
            if (this.isDebug) console.log('toggleCheckSelect: selectInput check state ',selectState);
            selectInput.checked = !selectState;
            if (this.isDebug) console.log('toggleCheckSelect: selectInput updated ',selectInput);
            if (this.isDebug) console.log('toggleCheckSelect: selectInput state ',selectInput.checked);
            this.activateApply(false);
            this.activateSearch(false);
            this.criteriaSelected = this.selectOption(selectName,this.criteriaList,this.criteriaSelected,selectInput.checked);
            if (this.isDebug) console.log('toggleCheckSelect: selectInput finalized ',selectInput);
            if (this.isDebug) console.log('toggleCheckSelect: selectInput state ',selectInput.checked);
        }
        else {
            console.warn('toggleCheckSelect: selectInput not found ', selectName);
        }

        if (this.isDebug) console.log('toggleCheckSelect: END for search');
    }

    deselectMainCriteria(event) {
        if (this.isDebug) console.log('deselectMainCriteria: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('deselectMainCriteria: event ',event);
        if (this.isDebug) console.log('deselectMainCriteria: event detail ',event.detail);
        if (this.isDebug) console.log('deselectMainCriteria: selected Name ',event.srcElement);

        const selectName = event.srcElement.dataset.name;
        if (this.isDebug) console.log('deselectMainCriteria: selected Name ', selectName);

        if (this.isDebug) console.log('deselectMainCriteria: current selection ', JSON.stringify(this.mainCriteriaSelected));
        let selectedOption = this.mainCriteriaSelected.find(item => item.fullName === selectName);
        if (!selectedOption) {
            console.warn('deselectMainCriteria: option not found ', selectName);
            return;
        }
        selectedOption.selected = false;
        this.mainCriteriaSelected = this.mainCriteriaSelected.filter(item => item.fullName !== selectName);
        if (this.isDebug) console.log('deselectMainCriteria: selection updated ', JSON.stringify(this.mainCriteriaSelected));

        let menuElement = this.template.querySelector("a.menuSelector[data-name='" + selectName + "']");
        if (this.isDebug) console.log('deselectMainCriteria: menuElement found ', menuElement);
        if (menuElement) {
            menuElement.removeAttribute('aria-current');
            if (this.isDebug) console.log('deselectMainCriteria: menuElement unselected ',menuElement);
            this.activateApply(false);
            this.activateSearch(false);
        }
        else {
            console.warn('deselectMainCriteria: menuElement not found ', selectName);
        }

        if (this.isDebug) console.log('deselectMainCriteria: END for search');
    }
    deselectCriteria(event) {
        if (this.isDebug) console.log('deselectCriteria: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('deselectCriteria: event ',event);
        if (this.isDebug) console.log('deselectCriteria: event detail ',event.detail);
        if (this.isDebug) console.log('deselectCriteria: selected Name ',event.srcElement);

        const selectName = event.srcElement.dataset.name;
        if (this.isDebug) console.log('deselectCriteria: selected Name ', selectName);

        if (this.isDebug) console.log('deselectCriteria: current selection ', JSON.stringify(this.criteriaSelected));
        let selectedOption = this.criteriaSelected.find(item => item.fullName === selectName);
        if (!selectedOption) {
            console.warn('deselectCriteria: option not found ', selectName);
            return;
        }
        selectedOption.selected = false;
        this.criteriaSelected = this.criteriaSelected.filter(item => item.fullName !== selectName);
        if (this.isDebug) console.log('deselectCriteria: selection updated ', JSON.stringify(this.criteriaSelected));

        let checkElement = this.template.querySelector("input.checkSelector[name='" + selectName + "']");
        if (this.isDebug) console.log('deselectCriteria: checkElement found ', checkElement);
        if (checkElement) {
            checkElement.checked = false;
            if (this.isDebug) console.log('deselectCriteria: checkElement unselected ',checkElement);
            this.activateApply(false);
            this.activateSearch(false);
        }
        else {
            let tagElement = this.template.querySelector("button.tagSelector[data-name='" + selectName + "']");
            if (this.isDebug) console.log('deselectCriteria: tagElement found ', tagElement);
            if (tagElement) {
                tagElement.ariaPressed = false;
                if (this.isDebug) console.log('deselectCriteria: tagElement unselected ',tagElement);
                this.activateApply(false);
                this.activateSearch(false);
            }
            else {
                console.warn('deselectCriteria: no tag or check Element found ', selectName);
            }
        }

        if (this.isDebug) console.log('deselectCriteria: END for search');
    }

    // Search trigger events
    handleSearchKey(event) {
        if (this.isDebug) console.log('handleSearchKey: START',event);
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (this.isDebug) console.log('handleSearchKey: triggering search');
            this.updateSearch(event);
        }
        else {
            this.activateApply(false);
            this.activateSearch(false);
        }
        if (this.isDebug) console.log('handleSearchKey: END');
    }
    
    updateSearch(event) {
        if (this.isDebug) console.log('updateSearch: START for search');

        let newState = JSON.parse(JSON.stringify(this.currentState));
        if (this.isDebug) console.log('updateSearch: newState prepared ', JSON.stringify(newState));

        let searchInput = this.template.querySelector('input.mainSearch');
        if (this.isDebug) console.log('updateSearch: searchInput found ', searchInput);
        if (searchInput) {
            newState.term = searchInput.value;
            if (this.isDebug) console.log('updateSearch: term updated ', JSON.stringify(newState));
        }
        
        let criteriaSelections = {};

        let menuSelectors = this.template.querySelectorAll('a.menuSelector');
        if (this.isDebug) console.log('updateSearch: all menu Selectors fetched ',menuSelectors);
        for (let item of menuSelectors) {
            if (this.isDebug) console.log('updateSearch: processing menu option ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.ariaCurrent === 'selection') {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: menu selections extracted ', JSON.stringify(criteriaSelections));

        let tagSelectors = this.template.querySelectorAll('button.tagSelector');
        if (this.isDebug) console.log('updateSearch: all tag Selectors fetched ',tagSelectors);
        for (let item of tagSelectors) {
            if (this.isDebug) console.log('updateSearch: processing tag ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.ariaPressed === 'true') {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: tag selections extracted ', JSON.stringify(criteriaSelections));

        let checkSelectors = this.template.querySelectorAll('input.checkSelector');
        if (this.isDebug) console.log('updateSearch: all checkbox Selectors fetched ',checkSelectors);
        for (let item of checkSelectors) {
            if (this.isDebug) console.log('updateSearch: processing checkbox ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.checked) {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: checkbox selections extracted ', JSON.stringify(criteriaSelections));

        for (let iterCriteria in criteriaSelections) {
            if (this.isDebug) console.log('updateSearch: preparing state for criteria ', iterCriteria);
            if (criteriaSelections[iterCriteria].length > 0) {
                if (this.isDebug) console.log('updateSearch: registering selected values', JSON.stringify(criteriaSelections[iterCriteria]));
                newState[iterCriteria] = criteriaSelections[iterCriteria].join(';');
            }
            else {
                if (this.isDebug) console.log('updateSearch: unregistering criteria');
                delete newState[iterCriteria];
            }
        }
        if (this.isDebug) console.log('updateSearch: newState finalized ', JSON.stringify(newState));

        let expandedElements = this.template.querySelectorAll(".fr-collapse--expanded");
        if (this.isDebug) console.log('updateSearch: expandedElements fetched ', expandedElements);
        if (expandedElements) {
            if (this.isDebug) console.log('updateSearch: closing expanded items');
            expandedElements.forEach(item => {
                if (this.isDebug) console.log('updateSearch: processing element ', item);
                item.classList?.remove("fr-collapse--expanded");
            });
        }
        if (this.isDebug) console.log('updateSearch: expandedElements closed');

        let searchPage = (this.searchPage ? {"type":"comm__namedPage","attributes":{"name":this.searchPage}} : {"type":"standard__search"});
        searchPage.state = newState;
        if (this.isDebug) console.log('updateSearch: searchPage init ', JSON.stringify(searchPage));

        setTimeout(() => {
            if (this.isDebug) console.log('updateSearch: navigating ');
            this[NavigationMixin.Navigate](searchPage);
        },1000);
        this.activateApply(true);
        this.activateSearch(true);
        if (this.isDebug) console.log('updateSearch: END for search');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    initCriteria = function(criteriaList, pageState, selectionList) {
        if (this.isDebug) console.log('initCriteria: START ');
        if (this.isDebug) console.log('initCriteria: criteria list ', JSON.stringify(criteriaList));
        if (this.isDebug) console.log('initCriteria: page state ', JSON.stringify(pageState));

        criteriaList.forEach(item => {
            if (this.isDebug) console.log('initCriteria: processing criteria ', item.fullName);

            if (pageState[item.name]) {
                if (this.isDebug) console.log('initCriteria: processing criteria state ', pageState[item.name]);

                let selectedItems = (pageState[item.name]).split(';');
                if (this.isDebug) console.log('initCriteria: selectedItems extracted ',selectedItems);

                selectedItems.forEach(selectItem => {
                    if (this.isDebug) console.log('initCriteria: processing selected value ',selectItem);

                    let itemValue = (item.values).find(iterVal => {return (iterVal.value === selectItem);});
                    if (this.isDebug) console.log('initCriteria: criteria item found ', JSON.stringify(itemValue));

                    if (itemValue) {
                        itemValue.selected = true;
                        selectionList.push(itemValue);
                    }
                    else {
                        console.warn('initCriteria: value not found ',selectItem);
                        console.warn('initCriteria: for criteria ',item.fullName);
                    }
                });
                if (this.isDebug) console.log('initCriteria: criteria values selection updated ',JSON.stringify(item.values));
            }
            else {
                if (this.isDebug) console.log('initCriteria: ignoring picklist (no state)');
            }
        });

        if (this.isDebug) console.log('initCriteria: END with ', JSON.stringify(criteriaList));
        return criteriaList;
    }
    reviewCriteria = function(criteriaList, pageState) {
        if (this.isDebug) console.log('reviewCriteria: START ');
        if (this.isDebug) console.log('reviewCriteria: criteria list ', JSON.stringify(criteriaList));
        if (this.isDebug) console.log('reviewCriteria: page state ', JSON.stringify(pageState));

        let selectionList = [];
        criteriaList.forEach(item => {
            if (this.isDebug) console.log('reviewCriteria: processing criteria ', item.fullName);

            if (pageState[item.name]) {
                if (this.isDebug) console.log('reviewCriteria: processing criteria state ', pageState[item.name]);

                let selectedItems = (pageState[item.name]).split(';');
                if (this.isDebug) console.log('reviewCriteria: selectedItems extracted ',selectedItems);

                item.values.forEach(iterVal => {
                    if (selectedItems.includes(iterVal.value)) {
                        iterVal.selected = true;
                        selectionList.push(iterVal);
                    }
                    else {
                        iterVal.selected = false;
                    }
                });
                if (this.isDebug) console.log('reviewCriteria: criteria values selection reset ',JSON.stringify(item.values));
            }
            else {
                if (this.isDebug) console.log('reviewCriteria: resetting all values (no criteria state)');
                item.values.forEach(iterVal => {iterVal.selected = false;});
                if (this.isDebug) console.log('reviewCriteria: criteria values selection reset ',JSON.stringify(item.values));
            }
        });

        if (this.isDebug) console.log('reviewCriteria: END with ', JSON.stringify(criteriaList));
        return selectionList;
    }
    activateApply = function(state) {
        if (this.isDebug) console.log('activateApply: START for state ',state);
        let applyButton = this.template.querySelector('.applyButton');
        if (this.isDebug) console.warn('activateApply: applyButton found ', applyButton);
        if (applyButton) {
            applyButton.disabled = state;
            if (this.isDebug) console.warn('activateApply: applyButton activated');
        }
        else {
            if (this.isDebug) console.warn('activateApply: no applyButton to activate');
        }
    }
    activateSearch = function(state) {
        if (this.isDebug) console.log('activateSearch: START for state ',state);
        let searchButton = this.template.querySelector('.searchButton');
        if (this.isDebug) console.warn('activateSearch: searchButton found ', searchButton);
        if (searchButton) {
            searchButton.disabled = state;
            if (this.isDebug) console.warn('activateSearch: searchButton activated');
        }
        else {
            if (this.isDebug) console.warn('activateSearch: no searchButton to activate');
        }
    }
    selectOption = function(optionName,sourceList,selectionList,isSelected) {
        if (this.isDebug) console.log('selectOption: START for optionName ',optionName);
        if (this.isDebug) console.log('selectOption: isSelected? ',isSelected);
        if (this.isDebug) console.log('selectOption: sourceList ',JSON.stringify(sourceList));
        if (this.isDebug) console.log('selectOption: selectionList ',JSON.stringify(selectionList));

        if (isSelected) {
            if (this.isDebug) console.log('selectOption: adding selection');

            let selectedOption;
            sourceList.forEach(itemL => {
                if ((!selectedOption) && (itemL.values)) selectedOption = itemL.values.find(itemO => itemO.fullName === optionName);
            })
            if (this.isDebug) console.log('selectOption: selectedOption found ',JSON.stringify(selectedOption));

            if (selectedOption) {
                selectedOption.selected = true;
                let newSelectionList = (selectionList ? [... selectionList] : []);
                newSelectionList.push(selectedOption);
                if (this.isDebug) console.log('selectOption: END / selectionList updated ',JSON.stringify(newSelectionList));
                return newSelectionList;
            }
            console.warn('selectOption: END / option not found ',optionName);
            return selectionList;
        }
        else {
            if (this.isDebug) console.log('selectOption: removing selection');
            let selectedOption = selectionList.find(item => item.fullName === optionName);
            if (selectedOption) {
                selectedOption.selected = false;
                let newSelectionList = selectionList.filter(item => item.fullName !== optionName);
                if (this.isDebug) console.log('selectOption: END / selectionList updated ',JSON.stringify(newSelectionList));
                return newSelectionList;
            }
            console.warn('selectOption: END / option not found ',optionName);
            return selectionList;
        }
    } 
}