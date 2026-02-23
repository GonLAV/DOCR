/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Architecture from './pages/Architecture';
import BatchProcessing from './pages/BatchProcessing';
import Compare from './pages/Compare';
import Dashboard from './pages/Dashboard';
import DocumentTypeConfiguration from './pages/DocumentTypeConfiguration';
import DocumentViewer from './pages/DocumentViewer';
import Documents from './pages/Documents';
import Features from './pages/Features';
import Pipeline from './pages/Pipeline';
import SystemDesign from './pages/SystemDesign';
import Upload from './pages/Upload';
import Vision from './pages/Vision';
import ExternalSources from './pages/ExternalSources';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Architecture": Architecture,
    "BatchProcessing": BatchProcessing,
    "Compare": Compare,
    "Dashboard": Dashboard,
    "DocumentTypeConfiguration": DocumentTypeConfiguration,
    "DocumentViewer": DocumentViewer,
    "Documents": Documents,
    "Features": Features,
    "Pipeline": Pipeline,
    "SystemDesign": SystemDesign,
    "Upload": Upload,
    "Vision": Vision,
    "ExternalSources": ExternalSources,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};