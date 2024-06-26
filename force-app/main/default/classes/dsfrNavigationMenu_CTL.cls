/***
* @description  Lightning controller to fetch the details of an
*               Experience Site navigation menu.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         Feb 2023
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

public with sharing class dsfrNavigationMenu_CTL {

    /***
    * @description  Static constant containing all navigation items types not supported in custom
    *               LWC navigation component.
    ***/
    final private static List<ConnectApi.NavigationMenuItemType> EXCLUDED_TYPES = new List<ConnectApi.NavigationMenuItemType>{
        ConnectApi.NavigationMenuItemType.Event,
        ConnectApi.NavigationMenuItemType.SystemLink
    };

    /***
    * @description  Simple method to fetch the list of supported menu items included
    *               in a navigation menu given its label displayed in the Site Builder.
    *               It assumes that the call is done from an Experience Site to retrieve
    *               its Network ID.
    * @param        navigationLabel Label of the Navigation Menu
    * @param        includeHome     
    * @return       List<ConnectApi.NavigationMenuItem> List of supported menu items
    * @exception    Various exceptions in case of missing input or wrong context.
    ***/

    /*
    @AuraEnabled(cacheable=true)
    public static List<ConnectApi.NavigationMenuItem> getMenuItems(String navLabel, Boolean showHome) {
        System.debug('getMenuItems: START for ' + navLabel);
        System.debug('getMenuItems: with home? ' + showHome);
        if (String.isEmpty(navLabel)) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / Missing navigation Label');
            throw new System.AuraHandledException('Missing Navigation Menu Label!');
        }

        String networkId = Network.getNetworkId();
        if (String.isEmpty(networkId)) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / No networkId');
            throw new System.AuraHandledException('Network ID not available!');
        }
        System.debug('getMenuItems: networkId retrieved ' + networkId);

        NavigationLinkSet navigationLinkSet = [ SELECT DeveloperName
                                                FROM NavigationLinkSet
                                                WHERE NetworkId = :networkId AND MasterLabel = :navLabel
                                                LIMIT 1];
        if (navigationLinkSet == null) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / No navigation found with label ' + navLabel + ' on network ' + networkId);
            throw new System.AuraHandledException('Navigation menu not found!');
        }
        System.debug('getMenuItems: navigationLinkSet retrieved ' + navigationLinkSet);
        String navName = navigationLinkSet.DeveloperName;

        ConnectApi.NavigationMenuItemCollection navMenu = ConnectApi.NavigationMenu.getCommunityNavigationMenu(
            networkId, null, navName,
            ConnectApi.PublishStatus.Live, false, showHome, EXCLUDED_TYPES);
        System.debug('getMenuItems: navigation Menu retrieved ' + navMenu);

        List<ConnectApi.NavigationMenuItem> navItems = navMenu.menuItems;
        System.debug('getMenuItems: END returning ' + navItems);
        return navItems;
    }
    */

    /***
    * @description  Method to fetch the list of supported menu items included in a set of navigation menu given their master labels
    *               configured in for a Site.
    *               It assumes that the call is done from an Experience Site to retrieve its Network ID.
    *               User ID is simply used to trigger a reevaluation of the menu when switching from guest to connected mode
    *               (and bypass the cacheable setting) and nor actually used in the logic.
    * @param        navigationMenus Map of Navigation Menu Labels with a boolean indicating if Home should be included for each one.
    * @param        userId          User ID for which the navigation menu details should be requested.
    * @return       List<ConnectApi.NavigationMenuItem> List of supported menu items
    * @exception    Various exceptions in case of missing input or wrong context.
    ***/

    @AuraEnabled(cacheable=true)
    public static Map<String,List<ConnectApi.NavigationMenuItem>> getNavigations(final List<Object> menus, final String userId) {
        System.debug('getNavigations: START for ' + menus);
        System.debug('getNavigations: with userId ' + userId);
        
        if ((menus == null) || (menus.isEmpty())) {
            System.debug(LoggingLevel.ERROR, 'getNavigations: END KO / Missing navigation menus' + menus);
            throw new System.AuraHandledException('Missing Navigation Menus !');
        }

        String networkId;
        if (!Test.isRunningTest()) {
            networkId = Network.getNetworkId();
        }
        else {
            System.debug('getNavigations: setting networkId to userId for tests');
            networkId = userId;
        }
        if (String.isEmpty(networkId)) {
            System.debug(LoggingLevel.ERROR, 'getNavigations: END KO / No networkId');
            throw new System.AuraHandledException('Network ID not available!');
        }
        System.debug('getNavigations: networkId retrieved ' + networkId);

        Map<String,Boolean> menuMap = new Map<String,Boolean>();
        for (Object iter : menus) {
            System.debug(LoggingLevel.FINEST, 'getNavigations: analysing menu ' + iter);
            Map<Object,Object> iterObj = (Map<Object,Object>)(iter);
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterObj converted ' + iterObj);
            String iterLabel = (String)(iterObj.get('label'));
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterLabel extracted ' + iterLabel);
            Boolean iterShowHome = (Boolean)(iterObj.get('showHome'));
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterShowHome extracted ' + iterShowHome);
            menuMap.put(iterLabel,iterShowHome);
        }
        System.debug('getNavigations: menuMap prepared ' + menuMap);

        List<NavigationLinkSet> navigationLinkSets;
        if (!Test.isRunningTest()) {
            navigationLinkSets= [   SELECT DeveloperName, MasterLabel
                                    FROM NavigationLinkSet
                                    WHERE NetworkId = :networkId AND MasterLabel in :menuMap.keySet()];
        }
        else {
            System.debug(LoggingLevel.ERROR, 'getNavigations: setting test navigation set');
            navigationLinkSets = new List<NavigationLinkSet>();
            for (String iter : menuMap.keySet()) {
                if (iter != 'NONE') {
                    System.debug(LoggingLevel.FINEST, 'getNavigations: registering menu ' + iter);
                    navigationLinkSets.add(new NavigationLinkSet(DeveloperName = iter, MasterLabel = iter));
                }
                else {
                    System.debug(LoggingLevel.FINEST, 'getNavigations: ignoring menu ' + iter);
                    navigationLinkSets = null;
                    break;
                }
            }
        }
        if (navigationLinkSets == null) {
            System.debug(LoggingLevel.ERROR, 'getNavigations: END KO / No navigation menus found with labels ' + menuMap.keySet() + ' on network ' + networkId);
            throw new System.AuraHandledException('Navigation menus not found!');
        }
        System.debug('getNavigations: navigationLinkSet retrieved ' + navigationLinkSets);

        Map<String,List<ConnectApi.NavigationMenuItem>> resultMap = new Map<String,List<ConnectApi.NavigationMenuItem>>();
        for (NavigationLinkSet iter : navigationLinkSets) {
            System.debug('getNavigations: processing menu ' + iter);

            Boolean iterShowHome = menuMap.get(iter.MasterLabel);
            System.debug('getNavigations: ShowHome? ' + iterShowHome);

            ConnectApi.NavigationMenuItemCollection iterMenu;
            if (!Test.isRunningTest()) {
                iterMenu =  ConnectApi.NavigationMenu.getCommunityNavigationMenu(
                                    networkId, null, iter.DeveloperName,
                                    ConnectApi.PublishStatus.Live, false, iterShowHome, EXCLUDED_TYPES);
                System.debug('getNavigations: navigation Menu retrieved ' + iterMenu);
            }
            else {
                System.debug('getNavigations: setting test navigation menu');
                iterMenu = new ConnectApi.NavigationMenuItemCollection();
                iterMenu.menuItems = new List<ConnectApi.NavigationMenuItem>();
                ConnectApi.NavigationMenuItem newItem = new ConnectApi.NavigationMenuItem();
                if (iterShowHome) {
                    System.debug('getNavigations: home option');
                    newItem.Label = 'Home';
                    newItem.actionValue = 'www.home.test';
                }
                else {
                    System.debug('getNavigations: no home option');
                    newItem.Label = 'Other';
                    newItem.actionValue = 'www.other.test';
                }
                iterMenu.menuItems.add(newItem);
            }
            resultMap.put(iter.MasterLabel,iterMenu.menuItems);
            System.debug('getNavigations: menuItems registered ' + iterMenu.menuItems);
        }
        System.debug('getNavigations: END returning ' + resultMap);
        return resultMap;
    }
}