# THRIVE: User Experience and Interface Specification

## Overview

This document provides detailed specifications for the user experience (UX) and user interface (UI) of THRIVE (Therapeutic Health Research Intelligent Virtual Explorer), implemented using Replit Agent. The design focuses on creating an intuitive, accessible interface for Matt Culligan to interact with the system while battling esophageal cancer.

## Core Interface Components

### 1. Main Conversation Interface

#### Visual Design
- **Layout**: Single-column chat interface with messages aligned left (system) and right (user)
- **Color Scheme**: 
  - Primary: Deep blue (#1E3A8A) for header and accent elements
  - Secondary: Soft teal (#0D9488) for system messages
  - Background: Light gray (#F9FAFB) for overall background
  - User Messages: White (#FFFFFF) with light border
- **Typography**:
  - Primary Font: Inter (sans-serif), 16px
  - Headings: Inter Bold, 18-24px
  - Medical Terms: Automatically highlighted in subtle background (#E0F2FE)

#### Input Area
- **Text Input**:
  - Multi-line text field with 50px height (expandable)
  - Placeholder text: "Ask about treatments, research, or upload documents..."
  - Send button with paper airplane icon
- **Quick Action Buttons**:
  - Upload Document (file icon)
  - Voice Input (microphone icon)
  - View Saved Items (bookmark icon)

#### Message Types
- **Text Responses**: 
  - Formatted markdown with support for headers, lists, tables
  - Maximum width of 80% of container
  - Rounded corners (8px) with subtle shadow
- **Structured Information Cards**:
  - Treatment cards with color-coded efficacy indicators
  - Research summary cards with expandable sections
  - Clinical trial cards with location and eligibility highlights
- **Visual Elements**:
  - Charts and graphs for data visualization
  - Timeline displays for treatment history
  - Comparison tables for treatment options

#### Code Implementation
```html
<!-- Main conversation container -->
<div id="thrive-conversation" class="flex flex-col h-full bg-gray-50 p-4">
  <!-- Conversation history -->
  <div id="conversation-history" class="flex-1 overflow-y-auto mb-4 space-y-4">
    <!-- System message example -->
    <div class="flex items-start max-w-4/5">
      <div class="bg-teal-100 rounded-lg p-4 shadow-sm">
        <p class="text-gray-800">Welcome to THRIVE. How can I help with your esophageal cancer research today?</p>
      </div>
    </div>
    
    <!-- User message example -->
    <div class="flex items-start justify-end">
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 max-w-4/5">
        <p class="text-gray-800">What are the latest treatments for stage 4 esophageal cancer?</p>
      </div>
    </div>
    
    <!-- System response with structured information -->
    <div class="flex items-start max-w-4/5">
      <div class="bg-teal-100 rounded-lg p-4 shadow-sm">
        <h3 class="font-bold text-lg mb-2">Latest Treatments for Stage 4 Esophageal Cancer</h3>
        <!-- Treatment cards would be inserted here -->
      </div>
    </div>
  </div>
  
  <!-- Input area -->
  <div class="border-t pt-4">
    <div class="flex items-center bg-white rounded-lg border border-gray-300">
      <div class="flex space-x-2 px-3">
        <button id="upload-button" class="text-gray-500 hover:text-blue-600">
          <svg class="w-5 h-5" <!-- File icon SVG --> </svg>
        </button>
        <button id="voice-button" class="text-gray-500 hover:text-blue-600">
          <svg class="w-5 h-5" <!-- Microphone icon SVG --> </svg>
        </button>
        <button id="saved-items-button" class="text-gray-500 hover:text-blue-600">
          <svg class="w-5 h-5" <!-- Bookmark icon SVG --> </svg>
        </button>
      </div>
      <textarea 
        id="user-input" 
        class="flex-1 py-3 px-4 focus:outline-none resize-none"
        placeholder="Ask about treatments, research, or upload documents..."
        rows="1"
      ></textarea>
      <button id="send-button" class="text-white bg-blue-800 rounded-r-lg p-3">
        <svg class="w-5 h-5" <!-- Send icon SVG --> </svg>
      </button>
    </div>
  </div>
</div>
```

### 2. Dashboard Views

Each dashboard view is accessible via sidebar navigation or through conversation commands.

#### Research Dashboard

**Layout Components:**
- **Search and Filter Bar**:
  - Search input for exploring saved research
  - Dropdown filters for source type, date, and relevance
- **Research Collections**:
  - Horizontally scrollable categories (Treatments, Clinical Trials, Books, etc.)
  - Visual cards for each saved item with title, source, and save date
- **Recent Findings**:
  - Timeline of recently discovered research items
  - Brief summaries with expandable details
- **Topic Clusters**:
  - Visual grouping of related research topics
  - Size indication for volume of information in each cluster

**Interactions:**
- Click on any research item to view full details
- Hover actions reveal options to share, bookmark, or add notes
- Drag-and-drop organization of research collections
- Double-click to edit labels or categories

**Implementation:**
```javascript
// Function to render research dashboard
function renderResearchDashboard() {
  const container = document.getElementById('dashboard-container');
  
  // Clear existing content
  container.innerHTML = '';
  
  // Add search and filter bar
  const searchBar = document.createElement('div');
  searchBar.className = 'flex items-center bg-white p-3 rounded-lg shadow-sm mb-6';
  searchBar.innerHTML = `
    <input type="text" placeholder="Search research..." class="flex-1 border-none focus:outline-none" />
    <div class="flex space-x-2">
      <select class="text-sm border rounded px-2 py-1">
        <option>All Sources</option>
        <option>Medical Journals</option>
        <option>Clinical Trials</option>
        <option>Books</option>
      </select>
      <select class="text-sm border rounded px-2 py-1">
        <option>All Dates</option>
        <option>Last Week</option>
        <option>Last Month</option>
        <option>Last Year</option>
      </select>
      <select class="text-sm border rounded px-2 py-1">
        <option>Most Relevant</option>
        <option>Newest First</option>
        <option>Oldest First</option>
      </select>
    </div>
  `;
  container.appendChild(searchBar);
  
  // Add research collections
  const collections = getUserResearchCollections();
  collections.forEach(collection => {
    const collectionEl = createCollectionElement(collection);
    container.appendChild(collectionEl);
  });
  
  // Add recent findings timeline
  const recentFindings = getRecentFindings();
  const timelineEl = createTimelineElement(recentFindings);
  container.appendChild(timelineEl);
  
  // Add topic clusters
  const topicClusters = getTopicClusters();
  const clustersEl = createClusterVisualization(topicClusters);
  container.appendChild(clustersEl);
}
```

#### Treatment Tracker

**Layout Components:**
- **Current Treatment Panel**:
  - Medication schedule with calendar view
  - Treatment cycle visualization
  - Next appointment reminders
- **Side Effect Tracker**:
  - Severity trends chart
  - Symptom input interface
  - Management recommendations
- **Effectiveness Metrics**:
  - Key health indicators
  - Test result trends
  - Comparison to baseline

**Interactions:**
- Click to log new symptoms or side effects
- Hovering over chart points reveals detailed data
- Calendar interface for viewing historical data
- Toggle between different visualization types

**Implementation:**
```javascript
// Function to update treatment effectiveness chart
function updateEffectivenessChart(healthMetrics) {
  const ctx = document.getElementById('effectiveness-chart').getContext('2d');
  
  // Define chart data
  const data = {
    labels: healthMetrics.dates,
    datasets: [
      {
        label: 'Tumor Marker (CA 19-9)',
        data: healthMetrics.tumorMarkers,
        borderColor: '#0D9488',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Energy Level (self-reported)',
        data: healthMetrics.energyLevels,
        borderColor: '#3B82F6',
        tension: 0.3,
        fill: false
      }
    ]
  };
  
  // Create or update chart
  if (window.effectivenessChart) {
    window.effectivenessChart.data = data;
    window.effectivenessChart.update();
  } else {
    window.effectivenessChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              afterBody: function(context) {
                // Add notes for this date point
                const dateIndex = context[0].dataIndex;
                return healthMetrics.notes[dateIndex] || '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
}
```

#### Clinical Trial Explorer

**Layout Components:**
- **Map View**:
  - Geographic display of nearby trials
  - Distance indicators and location details
- **Trial Cards**:
  - Eligibility match percentage
  - Phase and status indicators
  - Key inclusion/exclusion criteria
- **Timeline View**:
  - Temporal organization of trial start dates
  - Duration and milestone markers
- **Comparison Table**:
  - Side-by-side comparison of selected trials
  - Highlighting of key differences

**Interactions:**
- Click on map markers to view trial details
- Drag slider to adjust geographic search radius
- Multi-select trials for comparison
- Filter trials by type, phase, or eligibility

**Implementation:**
```javascript
// Function to render clinical trial map
function renderTrialMap(trials, userLocation) {
  // Initialize map centered on user location
  const map = new google.maps.Map(document.getElementById("trial-map"), {
    center: userLocation,
    zoom: 8,
  });
  
  // Add markers for each trial location
  trials.forEach(trial => {
    const marker = new google.maps.Marker({
      position: trial.location,
      map: map,
      title: trial.title,
      icon: getMarkerIconByMatchScore(trial.matchScore)
    });
    
    // Add click handler for marker
    marker.addListener("click", () => {
      showTrialDetails(trial);
    });
    
    // Add info window with basic details
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="trial-info-window">
          <h3>${trial.title}</h3>
          <p>Match score: ${trial.matchScore}%</p>
          <p>Phase: ${trial.phase}</p>
          <button onclick="viewTrialDetails('${trial.id}')">View Details</button>
        </div>
      `
    });
    
    marker.addListener("mouseover", () => {
      infoWindow.open(map, marker);
    });
    
    marker.addListener("mouseout", () => {
      infoWindow.close();
    });
  });
  
  // Add radius control
  const radiusControl = document.getElementById("radius-control");
  radiusControl.addEventListener("input", (e) => {
    const radius = parseInt(e.target.value);
    updateSearchRadius(radius, map, userLocation);
  });
}
```

### 3. Document Management Interface

#### Layout Components:
- **Document Library**:
  - Grid/list toggle views of documents
  - Document type icons (lab report, scan, clinical note)
  - Preview thumbnails
- **Category Filters**:
  - Document type selection
  - Date range picker
  - Source filters
- **Document Viewer**:
  - Split-view with original and processed versions
  - Highlighted entities and key information
  - Annotation capabilities

**Interactions:**
- Drag and drop upload functionality
- Click to open document viewer
- Double-click text to add annotations
- Swipe/arrow navigation between documents

**Implementation:**
```javascript
// Function to handle document upload
async function handleDocumentUpload(files) {
  // Show upload progress indicator
  showUploadProgress();
  
  for (const file of files) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', detectDocumentType(file));
      
      // Upload file
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      
      // Process document with appropriate models
      const processedDocument = await processDocument(result.documentId, file.type);
      
      // Update document library
      addDocumentToLibrary(processedDocument);
      
      // Show success message
      showNotification('Document uploaded and processed successfully');
    } catch (error) {
      showNotification('Error uploading document: ' + error.message, 'error');
    }
  }
  
  // Hide upload progress indicator
  hideUploadProgress();
}

// Function to process document based on type
async function processDocument(documentId, fileType) {
  // Determine which processing to apply
  if (fileType.includes('image')) {
    return await processImageDocument(documentId);
  } else if (fileType.includes('pdf')) {
    return await processPdfDocument(documentId);
  } else if (fileType.includes('text')) {
    return await processTextDocument(documentId);
  } else {
    return await processGenericDocument(documentId);
  }
}
```

## Specific Interface Elements

### 1. Treatment Comparison Cards

#### Visual Design
- **Card Container**:
  - White background (#FFFFFF)
  - Rounded corners (12px)
  - Subtle shadow (0 4px 6px rgba(0, 0, 0, 0.1))
  - 80% width of conversation window
- **Header**:
  - Treatment name in bold (20px)
  - Treatment type pill (Chemotherapy, Immunotherapy, etc.)
  - Expand/collapse control
- **Content Sections**:
  - Efficacy: Bar visualization (0-100%)
  - Side Effects: Bullet list with severity indicators
  - Evidence Quality: 5-star rating visualization
  - Key Benefits: Green-highlighted bullet points
  - Key Drawbacks: Red-highlighted bullet points
- **Action Footer**:
  - "Learn More" button
  - "Compare" checkbox
  - "Save" button with bookmark icon

#### Implementation
```html
<div class="treatment-card bg-white rounded-xl shadow p-5 my-4 w-4/5">
  <div class="flex justify-between items-center mb-3">
    <div>
      <h3 class="font-bold text-xl">Pembrolizumab (Keytruda)</h3>
      <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Immunotherapy</span>
    </div>
    <button class="text-gray-500 hover:text-gray-700">
      <svg class="w-5 h-5" <!-- Expand icon SVG --> </svg>
    </button>
  </div>
  
  <div class="treatment-details space-y-4">
    <!-- Efficacy Section -->
    <div>
      <h4 class="font-medium text-sm text-gray-500 mb-1">EFFICACY</h4>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 65%"></div>
      </div>
      <div class="flex justify-between text-xs mt-1">
        <span>Limited</span>
        <span>Very Effective</span>
      </div>
    </div>
    
    <!-- Side Effects Section -->
    <div>
      <h4 class="font-medium text-sm text-gray-500 mb-1">COMMON SIDE EFFECTS</h4>
      <ul class="ml-5 list-disc space-y-1">
        <li class="text-sm">Fatigue <span class="text-orange-500">●●●○○</span></li>
        <li class="text-sm">Skin rash <span class="text-orange-500">●●○○○</span></li>
        <li class="text-sm">Autoimmune reactions <span class="text-orange-500">●●●●○</span></li>
      </ul>
    </div>
    
    <!-- Evidence Quality Section -->
    <div>
      <h4 class="font-medium text-sm text-gray-500 mb-1">EVIDENCE QUALITY</h4>
      <div class="flex text-yellow-400">
        <svg class="w-5 h-5" <!-- Star icon SVG --> </svg>
        <svg class="w-5 h-5" <!-- Star icon SVG --> </svg>
        <svg class="w-5 h-5" <!-- Star icon SVG --> </svg>
        <svg class="w-5 h-5" <!-- Star icon SVG --> </svg>
        <svg class="w-5 h-5 text-gray-300" <!-- Star icon SVG --> </svg>
      </div>
      <p class="text-xs text-gray-500 mt-1">Based on 3 phase III clinical trials</p>
    </div>
  </div>
  
  <!-- Card Footer -->
  <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
      Learn More
    </button>
    <div class="flex items-center space-x-3">
      <label class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-blue-600">
        <span class="ml-1 text-sm text-gray-600">Compare</span>
      </label>
      <button class="text-gray-500 hover:text-blue-600">
        <svg class="w-5 h-5" <!-- Bookmark icon SVG --> </svg>
      </button>
    </div>
  </div>
</div>
```

### 2. Clinical Trial Card

#### Visual Design
- **Card Container**:
  - White background (#FFFFFF)
  - Rounded corners (12px)
  - Border (1px solid #E5E7EB)
  - Highlight bar on left (color indicates match quality)
- **Header**:
  - Trial name in bold (18px)
  - NCT number in light gray (12px)
  - Phase indicator pill
- **Content Sections**:
  - Match Score: Circular percentage visualization
  - Status: Active/Recruiting/Completed indicator
  - Location: Distance from user with map icon
  - Key Eligibility: Expandable bullet points
- **Timeline Section**:
  - Visual timeline of trial phases
  - Current phase highlighted
  - Estimated completion date
- **Action Footer**:
  - "View Details" button
  - "Save Trial" button
  - "Contact Site" button

#### Implementation
```html
<div class="clinical-trial-card bg-white rounded-xl border border-gray-200 overflow-hidden flex my-4">
  <!-- Match quality indicator bar -->
  <div class="w-2 bg-green-500" title="Strong match"></div>
  
  <div class="p-5 flex-1">
    <div class="mb-3">
      <div class="flex justify-between">
        <h3 class="font-bold text-lg">Pembrolizumab and Chemotherapy in Esophageal Cancer</h3>
        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Phase 3</span>
      </div>
      <p class="text-xs text-gray-500">NCT04210115</p>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <!-- Match Score -->
      <div class="flex items-center">
        <div class="relative w-12 h-12 mr-3">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" stroke-dasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="20.35" class="percentage">85%</text>
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium">Match Score</p>
          <p class="text-xs text-gray-500">Based on your profile</p>
        </div>
      </div>
      
      <!-- Status -->
      <div>
        <p class="text-sm font-medium">Status</p>
        <p class="flex items-center">
          <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span class="text-sm">Recruiting</span>
        </p>
      </div>
      
      <!-- Location -->
      <div>
        <p class="text-sm font-medium">Nearest Location</p>
        <p class="text-sm flex items-center">
          <svg class="w-4 h-4 mr-1 text-gray-500" <!-- Map icon SVG --> </svg>
          <span>Memorial Hospital (12.4 mi)</span>
        </p>
      </div>
      
      <!-- Key Eligibility -->
      <div>
        <p class="text-sm font-medium">Key Eligibility</p>
        <button class="text-sm text-blue-600 hover:text-blue-800">
          View Criteria
        </button>
      </div>
    </div>
    
    <!-- Timeline -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-500 mb-2">TIMELINE</h4>
      <div class="relative pt-1">
        <div class="flex mb-2 items-center justify-between">
          <div>
            <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-600">
              Recruiting
            </span>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold inline-block text-blue-600">
              Est. Completion: Dec 2025
            </span>
          </div>
        </div>
        <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div style="width:30%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex space-x-3">
      <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
        View Details
      </button>
      <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium">
        Save Trial
      </button>
      <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium">
        Contact Site
      </button>
    </div>
  </div>
</div>
```

### 3. Research Summary Card

#### Visual Design
- **Card Container**:
  - White background (#FFFFFF)
  - Rounded corners (8px)
  - Subtle border (1px solid #E5E7EB)
- **Header**:
  - Research title in bold (16px)
  - Publication info (journal, date) in gray (12px)
  - Source type icon (journal article, book, etc.)
- **Content Sections**:
  - Key Findings: Expandable bullet points
  - Methodology: Brief paragraph with expandable details
  - Relevance Rating: Color-coded indicator
- **Supporting Elements**:
  - Author credentials
  - Citation count
  - Peer review status
- **Action Footer**:
  - "Read Full Summary" button
  - "Save to Library" button
  - "Cite Source" button

#### Implementation
```html
<div class="research-summary-card bg-white rounded-lg border border-gray-200 p-4 my-3">
  <div class="flex justify-between items-start mb-3">
    <div>
      <h3 class="font-bold text-base">Efficacy of Immunotherapy Combined with Chemotherapy in Advanced Esophageal Cancer</h3>
      <p class="text-xs text-gray-500">Journal of Clinical Oncology • March 2024</p>
    </div>
    <div class="text-blue-600">
      <svg class="w-5 h-5" <!-- Journal article icon SVG --> </svg>
    </div>
  </div>
  
  <!-- Key Findings -->
  <div class="mb-3">
    <h4 class="text-sm font-medium text-gray-500 mb-1">KEY FINDINGS</h4>
    <ul class="ml-5 list-disc space-y-1">
      <li class="text-sm">Pembrolizumab + chemotherapy showed 30% improved overall survival</li>
      <li class="text-sm">PD-L1 expression correlated with treatment response</li>
      <li class="text-sm">Grade 3-4 adverse events occurred in 32% of patients</li>
    </ul>
    <button class="text-xs text-blue-600 hover:text-blue-800 mt-1">
      Show more findings
    </button>
  </div>
  
  <!-- Methodology -->
  <div class="mb-3">
    <h4 class="text-sm font-medium text-gray-500 mb-1">METHODOLOGY</h4>
    <p class="text-sm">Randomized controlled trial with 628 patients across 14 countries. Patients received either pembrolizumab + chemotherapy or placebo + chemotherapy.</p>
    <button class="text-xs text-blue-600 hover:text-blue-800 mt-1">
      View full methodology
    </button>
  </div>
  
  <!-- Supporting Elements -->
  <div class="flex justify-between text-xs text-gray-500 mb-3">
    <span>Authors: Johnson et al. (Mayo Clinic)</span>
    <span>Citations: 47</span>
    <span class="flex items-center">
      <svg class="w-4 h-4 text-green-500 mr-1" <!-- Check icon SVG --> </svg>
      Peer Reviewed
    </span>
  </div>
  
  <!-- Relevance -->
  <div class="flex items-center mb-4">
    <span class="text-xs font-medium mr-2">RELEVANCE TO YOUR CASE:</span>
    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
      High
    </span>
  </div>
  
  <!-- Action Buttons -->
  <div class="flex space-x-2">
    <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
      Read Full Summary
    </button>
    <button class="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
      Save to Library
    </button>
    <button class="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
      Cite Source
    </button>
  </div>
</div>
```

### 4. Notification and Alert System

#### Visual Design
- **Toast Notifications**:
  - Slide in from top-right corner
  - Color-coded by type (info, success, warning, error)
  - Auto-dismiss after 5 seconds (configurable)
  - Dismiss button (X)
- **In-Conversation Alerts**:
  - Inline with conversation flow
  - Bordered container with icon
  - Action buttons where appropriate
- **System Status Indicators**:
  - Connection status in header
  - API usage meter
  - Last update timestamp

#### Implementation
```javascript
// Toast notification system
const notificationSystem = {
  showNotification: function(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} flex items-center p-4 mb-4 rounded-lg`;
    
    // Set background color based on type
    const bgColors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    notification.classList.add(...bgColors[type].split(' '));
    
    // Create icon based on type
    const iconSvg = this.getIconForType(type);
    
    // Create content
    notification.innerHTML = `
      <div class="flex items-center">
        ${iconSvg}
        <div class="ml-3 text-sm font-medium">${message}</div>
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 hover:bg-gray-200" aria-label="Close">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    // Add to notification container
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Setup dismiss button
    const dismissButton = notification.querySelector('button');
    dismissButton.addEventListener('click', () => {
      this.dismissNotification(notification);
    });
    
    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissNotification(notification);
      }, duration);
    }
    
    return notification;
  },
  
  dismissNotification: function(notification) {
    notification.classList.add('opacity-0');
    setTimeout(() => {
      notification.remove();
    }, 300);
  },
  
  getIconForType: function(type) {
    // Return appropriate SVG icon based on notification type
    const icons = {
      info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
      success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
      warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
      error: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
    };
    return icons[type] || icons.info;
  }
};
```

## User Flows

### 1. Initial Onboarding Flow

#### Steps and UI States

1. **Welcome Screen**
   - Intro message explaining THRIVE
   - Get Started button

2. **Basic Profile Setup**
   - Name input
   - Diagnosis details (optional fields with privacy notice)
   - Current treatment info (optional)

3. **Research Preferences**
   - Interest areas selection (checkboxes)
   - Technical language preference slider
   - Information priority ranking

4. **Book Import**
   - Form to enter titles of Matt's 11 books
   - System confirms book recognition

5. **Tour of Features**
   - Quick walkthrough of main capabilities
   - Example questions to try

#### Implementation
```javascript
// Function to handle the onboarding process
function startOnboarding() {
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to THRIVE',
      content: 'Your personalized esophageal cancer research assistant',
      action: 'Get Started'
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      fields: [
        { type: 'text', id: 'name', label: 'Your name', required: true },
        { type: 'select', id: 'diagnosis', label: 'Cancer stage', options: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'], required: false },
        { type: 'textarea', id: 'currentTreatment', label: 'Current treatment (if any)', required: false }
      ],
      action: 'Continue'
    },
    {
      id: 'preferences',
      title: 'Research Preferences',
      fields: [
        { type: 'checkbox-group', id: 'interests', label: 'Areas of interest', 
          options: [
            'Treatment options', 
            'Clinical trials', 
            'Symptom management', 
            'Nutrition', 
            'Alternative therapies'
          ] 
        },
        { type: 'slider', id: 'technicalLevel', label: 'Technical language preference', 
          min: 1, max: 5, 
          labels: ['Simplified', 'Balanced', 'Technical'] 
        }
      ],
      action: 'Continue'
    },
    {
      id: 'books',
      title: 'Your Cancer Books',
      description: 'Enter the titles of books you\'ve purchased so THRIVE can analyze them',
      fields: [
        { type: 'dynamic-list', id: 'bookTitles', label: 'Book titles', 
          buttonText: 'Add another book', 
          initialCount: 3 
        }
      ],
      action: 'Continue'
    },
    {
      id: 'tour',
      title: 'Quick Tour',
      content: 'Let\'s explore what THRIVE can do for you',
      tourPoints: [
        { element: '#conversation-input', title: 'Ask Anything', description: 'Type questions about esophageal cancer research, treatments, or clinical trials' },
        { element: '#research-tab', title: 'Research Library', description: 'Access organized findings from medical literature and your books' },
        { element: '#treatment-tab', title: 'Treatment Tracker', description: 'Compare options and monitor effectiveness' }
      ],
      action: 'Start Using THRIVE'
    }
  ];
  
  renderOnboardingStep(0, steps);
}
```

### 2. Treatment Research Flow

#### Steps and UI States

1. **Initial Question**
   - User asks about treatment options
   - System acknowledges and begins search

2. **Results Overview**
   - Summary of treatment approaches
   - Category grouping (conventional, emerging, alternative)

3. **Treatment Comparison**
   - Side-by-side view of selected treatments
   - Interactive comparison toggles

4. **Personalization**
   - System asks follow-up questions about preferences
   - Adjusts recommendations based on responses

5. **Action Planning**
   - User saves treatments of interest
   - System generates doctor discussion guide

#### Implementation
```javascript
// Function to handle treatment research flow
async function handleTreatmentResearch(query) {
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Step 1: Initial Processing
    const initialResponse = await generateInitialResponse(query);
    addMessageToConversation('system', initialResponse);
    
    // Step 2: Fetch treatment options
    const treatments = await fetchTreatmentOptions(query);
    
    // Categorize treatments
    const categorizedTreatments = categorizeTreatments(treatments);
    
    // Render treatment overview
    const treatmentOverview = createTreatmentOverview(categorizedTreatments);
    addMessageToConversation('system', treatmentOverview);
    
    // Step 3: Setup comparison functionality
    setupTreatmentComparison(treatments);
    
    // Step 4: Ask follow-up questions
    const followUpQuestions = generateFollowUpQuestions(treatments);
    addMessageToConversation('system', followUpQuestions);
    
    // Listen for responses to personalize further
    setupPersonalizationListeners();
    
    // Step 5: Setup action planning functions
    setupActionPlanningFunctions(treatments);
    
  } catch (error) {
    // Handle errors gracefully
    addMessageToConversation('system', {
      type: 'error',
      message: 'I encountered an issue while researching treatments. Let\'s try a different approach.'
    });
    console.error('Treatment research error:', error);
  } finally {
    // Hide typing indicator
    hideTypingIndicator();
  }
}
```

### 3. Document Upload Flow

#### Steps and UI States

1. **Upload Initiation**
   - User clicks upload button or drags file
   - System shows upload progress

2. **Document Processing**
   - Processing indicator
   - Real-time status updates

3. **Information Extraction**
   - System highlights key information
   - User can verify/correct

4. **Results Integration**
   - Document added to library
   - Relevant findings added to knowledge base

5. **Next Actions**
   - System suggests related queries
   - Option to upload more documents

#### Implementation
```javascript
// Function to handle document upload flow
async function documentUploadFlow(files) {
  try {
    // Step 1: Show upload interface
    const uploadInterface = createUploadInterface(files);
    addMessageToConversation('system', uploadInterface);
    
    // Start upload process
    const uploadResults = await uploadDocuments(files);
    
    // Step 2: Process documents
    const processingInterface = createProcessingInterface(uploadResults);
    updateMessageInConversation('system', processingInterface);
    
    // Process each document
    for (const document of uploadResults) {
      await processDocument(document.id);
      updateProcessingProgress(document.id);
    }
    
    // Step 3: Extract and display information
    const extractedInfo = await extractDocumentInformation(uploadResults);
    const extractionInterface = createExtractionInterface(extractedInfo);
    updateMessageInConversation('system', extractionInterface);
    
    // Allow user verification
    await waitForUserVerification(extractedInfo);
    
    // Step 4: Add to knowledge base
    await addToKnowledgeBase(extractedInfo);
    
    // Show confirmation
    const confirmationMessage = createConfirmationMessage(extractedInfo);
    updateMessageInConversation('system', confirmationMessage);
    
    // Step 5: Suggest next actions
    const suggestedActions = generateSuggestedActions(extractedInfo);
    addMessageToConversation('system', suggestedActions);
    
  } catch (error) {
    // Handle errors gracefully
    addMessageToConversation('system', {
      type: 'error',
      message: 'There was a problem processing your document. Let\'s try again.'
    });
    console.error('Document upload error:', error);
  }
}
```

## Animation and Interaction Specs

### 1. Transition Animations

- **Page Transitions**: Fade transition (300ms ease-in-out)
- **Element Entry**: Subtle slide up + fade in (250ms)
- **Card Expansion**: Height animation (200ms ease-out)
- **Modal Windows**: Fade in + scale up (350ms cubic-bezier)

### 2. Interactive Elements

- **Buttons**:
  - Hover: Slight background lightening, cursor pointer
  - Active: Slight scale reduction (0.98)
  - Focus: Blue outline (2px)
- **Input Fields**:
  - Focus: Border highlight + subtle shadow
  - Validation: Color change + icon for error/success
- **Cards and List Items**:
  - Hover: Subtle shadow increase
  - Click: Slight background change
  - Selection: Left border highlight or background shift

### 3. Loading States

- **Initial Loading**: Centered pulsing logo
- **Data Fetching**: Inline skeleton loading state
- **Processing**: Circular progress indicator
- **AI Generation**: Typing indicator with animated dots

## Responsive Design Guidelines

### 1. Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 2. Layout Adjustments

- **Mobile**:
  - Single column layout
  - Full-width cards
  - Collapsed navigation (hamburger menu)
  - Limited visualizations
- **Tablet**:
  - Two-column layout where appropriate
  - Sidebar navigation
  - Simplified visualizations
- **Desktop**:
  - Multi-column layout
  - Expanded visualizations
  - Side-by-side comparisons

### 3. Touch Accommodations

- Minimum touch target size: 44px × 44px
- Increased spacing between interactive elements
- Swipe gestures for navigation
- Pull-to-refresh for data updates

## Accessibility Considerations

### 1. Visual Accessibility

- **Color Contrast**: All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Text Size**: Base font size 16px with relative sizing
- **Focus Indicators**: Visible focus states for keyboard navigation
- **Alternative Text**: All informational images have descriptive alt text

### 2. Screen Reader Support

- **ARIA Labels**: Properly labeled controls and regions
- **Semantic HTML**: Appropriate HTML5 elements for structure
- **Keyboard Navigation**: All functions accessible via keyboard
- **Reading Order**: Logical DOM order for screen readers

### 3. Cognitive Accessibility

- **Clear Language**: Simple, direct language for instructions
- **Consistent Layout**: Predictable positioning of elements
- **Progressive Disclosure**: Information revealed gradually
- **Error Prevention**: Confirmation for important actions

## Implementation Guidelines for Replit Agent

### 1. File Structure

```
/thrive
├── /public
│   ├── index.html
│   ├── favicon.ico
│   └── /assets
│       ├── /icons
│       └── /images
├── /src
│   ├── /components
│   │   ├── ConversationInterface.js
│   │   ├── TreatmentCard.js
│   │   ├── ClinicalTrialCard.js
│   │   ├── ResearchSummary.js
│   │   └── ...
│   ├── /services
│   │   ├── aiService.js
│   │   ├── medicalDataService.js
│   │   ├── documentProcessor.js
│   │   └── ...
│   ├── /utils
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── ...
│   ├── /styles
│   │   ├── main.css
│   │   └── ...
│   ├── App.js
│   └── index.js
├── /tests
│   └── ...
├── package.json
└── README.md
```

### 2. Technology Stack

- **Frontend Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Communication**: Fetch API/Axios
- **UI Components**: Custom components based on design specs

### 3. Performance Optimization

- **Lazy Loading**: Components loaded only when needed
- **Code Splitting**: Bundle splitting for faster initial load
- **Memoization**: React.memo for expensive renders
- **API Caching**: Cache API responses where appropriate
- **Asset Optimization**: Optimized images and SVGs

### 4. Development Approach

- **Component-First**: Build and test individual UI components
- **Iterative Development**: Implement core functionality first
- **Progressive Enhancement**: Add advanced features incrementally
- **User Testing**: Validate with Matt at key milestones
- **Documentation**: Inline code comments and README files

## User Testing Protocol

### 1. Initial Setup Testing

- **Task**: Complete the onboarding process
- **Success Metrics**: Completion time, error rate
- **Feedback Focus**: Clarity of instructions, ease of input

### 2. Basic Query Testing

- **Task**: Ask 5 common questions about esophageal cancer
- **Success Metrics**: Response relevance, response time
- **Feedback Focus**: Answer quality, information organization

### 3. Document Processing Testing

- **Task**: Upload a sample medical document
- **Success Metrics**: Extraction accuracy, processing time
- **Feedback Focus**: Clarity of process, accuracy of results

### 4. Advanced Feature Testing

- **Task**: Compare treatment options and find clinical trials
- **Success Metrics**: Task completion rate, decision confidence
- **Feedback Focus**: Usability of comparison tools, information clarity

## Conclusion

This comprehensive UX/UI specification provides a detailed blueprint for implementing THRIVE using Replit Agent. The design emphasizes usability, clarity of information, and a streamlined experience tailored to Matt Culligan's needs while battling esophageal cancer.

The implementation should prioritize core conversational functionality first, followed by the research organization features, and then the advanced visualization and comparison tools.

Regular feedback from Matt during development will be essential to ensure the system meets his specific needs and preferences as it evolves.
