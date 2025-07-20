// Zoning Code Administration Portal - JavaScript (Multi-page version)
class ZoningAdminPortal {
    constructor() {
        this.currentSection = null;
        this.sectionData = this.initializeSectionData();
        this.init();
    }

    init() {
        this.setupDashboardCards();
        this.setupFileUpload();
        this.setupToggles();
        this.setupTabs();
        this.setupSearch();
        this.setupTreeNavigation();
        this.setupTableActions();
        this.setupFormHandling();
        this.setupMobileMenu();
        this.setupUserDropdown();
        this.setupZoningCodeInterface();
        this.initializePage();
    }

    // Initialize page-specific functionality
    initializePage() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'dashboard':
                this.updateDashboardStats();
                this.setupDashboardTabs();
                break;
            case 'ai-settings':
                this.initializeAISettings();
                break;
            case 'import':
                this.resetImportForm();
                break;
            case 'zoning-code':
                this.initializeZoningCode();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        return filename || 'dashboard';
    }

    // Initialize Butuan City zoning data
    initializeSectionData() {
        return {
            'chapter-32': {
                title: 'ORDINANCE NO. 2024-15 - BUTUAN CITY ZONING CODE',
                type: 'Ordinance',
                parent: 'None',
                ordinanceRef: 'Ord. No. 2024-15',
                lastUpdated: '2024-06-15',
                content: `
                    <h3>Butuan City Comprehensive Zoning Ordinance</h3>
                    <p>This ordinance shall be known and may be cited as the "Butuan City Zoning Ordinance of 2024," establishing comprehensive zoning regulations for the territorial jurisdiction of Butuan City, Agusan del Norte, Philippines.</p>
                    <p>The purpose of this ordinance is to promote the health, safety, peace, morals, comfort, convenience and general welfare of the inhabitants of Butuan City through the regulation of land use and development.</p>
                `,
                history: [
                    { action: 'Ordinance enacted', user: 'Butuan City Council', date: '2024-06-15', type: 'creation' },
                    { action: 'Public hearing conducted', user: 'Planning Office', date: '2024-05-20', type: 'review' }
                ]
            },
            'article-1': {
                title: 'ARTICLE I - GENERAL PROVISIONS',
                type: 'Article',
                parent: 'chapter-32',
                ordinanceRef: 'Ord. No. 2024-15, Art. I',
                lastUpdated: '2024-06-15',
                content: `
                    <h3>General Provisions</h3>
                    <p>This article contains the fundamental provisions, definitions, and administrative framework for the implementation of zoning regulations in Butuan City.</p>
                    <p>The provisions herein establish the legal foundation for land use planning and development control within the city's territorial boundaries.</p>
                `,
                history: [
                    { action: 'Article finalized', user: 'Maria Santos', date: '2024-06-10', type: 'update' },
                    { action: 'Draft reviewed', user: 'Planning Team', date: '2024-05-25', type: 'review' }
                ]
            },
            'sec-1-1': {
                title: 'Sec. 1-1 - Short Title',
                type: 'Section',
                parent: 'article-1',
                ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-1',
                lastUpdated: '2024-06-08',
                content: `
                    <h3>Short Title</h3>
                    <p>This ordinance shall be known and may be cited as the <strong>"Butuan City Zoning Ordinance of 2024"</strong> or the <strong>"Butuan City Comprehensive Zoning Code."</strong></p>
                    <p>References to this ordinance in other local legislation, permits, or official documents may use the abbreviated citation <em>"BCZO 2024."</em></p>
                `,
                history: [
                    { action: 'Section approved', user: 'Juan Dela Cruz', date: '2024-06-08', type: 'approval' },
                    { action: 'Title revised', user: 'Maria Santos', date: '2024-06-05', type: 'update' },
                    { action: 'Initial draft created', user: 'Planning Office', date: '2024-05-15', type: 'creation' }
                ]
            },
            'sec-1-2': {
                title: 'Sec. 1-2 - Purpose and Intent',
                type: 'Section',
                parent: 'article-1',
                ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-2',
                lastUpdated: '2024-06-08',
                content: `
                    <h3>Purpose and Intent</h3>
                    <p>The purpose of this zoning ordinance is to:</p>
                    <ul>
                        <li>Promote the health, safety, peace, morals, comfort, convenience and general welfare of the inhabitants of Butuan City;</li>
                        <li>Facilitate the adequate provision of transportation, water, sewerage, schools, parks and other public requirements;</li>
                        <li>Secure safety from fire, panic, flood and other dangers;</li>
                        <li>Provide adequate light and air and prevent overcrowding of land;</li>
                        <li>Facilitate sustainable economic development and environmental protection;</li>
                        <li>Preserve the natural beauty and cultural heritage of Butuan City.</li>
                    </ul>
                `,
                history: [
                    { action: 'Environmental goals added', user: 'Environmental Officer', date: '2024-06-08', type: 'update' },
                    { action: 'Cultural heritage provision added', user: 'Tourism Office', date: '2024-06-03', type: 'update' },
                    { action: 'Initial draft created', user: 'Planning Office', date: '2024-05-15', type: 'creation' }
                ]
            },
            'sec-1-3': {
                title: 'Sec. 1-3 - Authority',
                type: 'Section',
                parent: 'article-1',
                ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-3',
                lastUpdated: '2024-06-07',
                content: `
                    <h3>Authority</h3>
                    <p>This ordinance is enacted pursuant to the authority vested in the City Government of Butuan under:</p>
                    <ul>
                        <li>Republic Act No. 7160, otherwise known as the "Local Government Code of 1991";</li>
                        <li>Presidential Decree No. 1096, otherwise known as the "National Building Code of the Philippines";</li>
                        <li>Republic Act No. 9003, otherwise known as the "Ecological Solid Waste Management Act";</li>
                        <li>Other applicable national and local laws, ordinances, and regulations.</li>
                    </ul>
                `,
                history: [
                    { action: 'Legal references updated', user: 'City Legal Officer', date: '2024-06-07', type: 'update' },
                    { action: 'Section reviewed', user: 'Maria Santos', date: '2024-06-01', type: 'review' },
                    { action: 'Initial draft created', user: 'Planning Office', date: '2024-05-15', type: 'creation' }
                ]
            },
            'sec-1-4': {
                title: 'Sec. 1-4 - Definitions',
                type: 'Section',
                parent: 'article-1',
                ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-4',
                lastUpdated: '2024-06-10',
                content: `
                    <h3>Definitions</h3>
                    <p>For the purpose of this ordinance, the following terms shall have the meanings indicated:</p>
                    <p><strong>Building:</strong> Any structure having a roof supported by columns or walls for the housing or enclosure of persons, animals, chattels or property of any kind.</p>
                    <p><strong>Lot:</strong> A parcel of land occupied or intended to be occupied by a use authorized by this ordinance, including one or more main buildings together with accessory buildings, open spaces, and parking spaces.</p>
                    <p><strong>Setback:</strong> The minimum horizontal distance between a building or structure and the nearest lot line.</p>
                    <p><strong>Use:</strong> The purpose for which land or a building is arranged, designed, or intended, or for which it is or may be occupied.</p>
                `,
                history: [
                    { action: 'Additional definitions added', user: 'Technical Team', date: '2024-06-10', type: 'update' },
                    { action: 'Definitions reviewed', user: 'Legal Team', date: '2024-06-05', type: 'review' },
                    { action: 'Initial definitions drafted', user: 'Planning Office', date: '2024-05-18', type: 'creation' }
                ]
            },
            'article-2': {
                title: 'ARTICLE II - ZONING DISTRICTS AND REGULATIONS',
                type: 'Article',
                parent: 'chapter-32',
                ordinanceRef: 'Ord. No. 2024-15, Art. II',
                lastUpdated: '2024-06-12',
                content: `
                    <h3>Zoning Districts and Regulations</h3>
                    <p>This article establishes the various zoning districts within Butuan City and specifies the regulations governing land use, building standards, and development requirements for each district.</p>
                    <p>The zoning districts are designed to promote orderly development while preserving the city's natural resources and cultural heritage.</p>
                `,
                history: [
                    { action: 'District boundaries finalized', user: 'GIS Team', date: '2024-06-12', type: 'update' },
                    { action: 'Public consultation held', user: 'Planning Office', date: '2024-05-28', type: 'consultation' }
                ]
            },
            'sec-2-1': {
                title: 'Sec. 2-1 - Establishment of Districts',
                type: 'Section',
                parent: 'article-2',
                ordinanceRef: 'Ord. No. 2024-15, Art. II, Sec. 2-1',
                lastUpdated: '2024-06-12',
                content: `
                    <h3>Establishment of Districts</h3>
                    <p>For the purpose of this ordinance, Butuan City is hereby divided into the following zoning districts:</p>
                    <ul>
                        <li><strong>R-1:</strong> Low Density Residential District</li>
                        <li><strong>R-2:</strong> Medium Density Residential District</li>
                        <li><strong>R-3:</strong> High Density Residential District</li>
                        <li><strong>C-1:</strong> Neighborhood Commercial District</li>
                        <li><strong>C-2:</strong> General Commercial District</li>
                        <li><strong>I-1:</strong> Light Industrial District</li>
                        <li><strong>I-2:</strong> Heavy Industrial District</li>
                        <li><strong>A:</strong> Agricultural District</li>
                    </ul>
                `,
                history: [
                    { action: 'District classifications finalized', user: 'Planning Team', date: '2024-06-12', type: 'update' },
                    { action: 'Initial districts drafted', user: 'GIS Team', date: '2024-05-30', type: 'creation' }
                ]
            },
            'sec-2-2': {
                title: 'Sec. 2-2 - Residential Districts',
                type: 'Section',
                parent: 'article-2',
                ordinanceRef: 'Ord. No. 2024-15, Art. II, Sec. 2-2',
                lastUpdated: '2024-06-11',
                content: `
                    <h3>Residential Districts</h3>
                    <p>Residential districts are established to provide suitable areas for dwelling units while maintaining neighborhood character and preventing overcrowding.</p>
                    <p><strong>R-1 Low Density Residential:</strong> Single-family detached dwellings with minimum lot area of 300 square meters.</p>
                    <p><strong>R-2 Medium Density Residential:</strong> Single-family and duplex dwellings with minimum lot area of 200 square meters.</p>
                    <p><strong>R-3 High Density Residential:</strong> Multi-family dwellings, townhouses, and low-rise apartments with minimum lot area of 150 square meters.</p>
                `,
                history: [
                    { action: 'Density requirements updated', user: 'Housing Office', date: '2024-06-11', type: 'update' },
                    { action: 'Residential standards drafted', user: 'Planning Team', date: '2024-05-28', type: 'creation' }
                ]
            },
            'sec-2-3': {
                title: 'Sec. 2-3 - Commercial Districts',
                type: 'Section',
                parent: 'article-2',
                ordinanceRef: 'Ord. No. 2024-15, Art. II, Sec. 2-3',
                lastUpdated: '2024-06-10',
                content: `
                    <h3>Commercial Districts</h3>
                    <p>Commercial districts are established to provide areas for retail trade, services, and other commercial activities that serve the community.</p>
                    <p><strong>C-1 Neighborhood Commercial:</strong> Small-scale retail and service establishments serving immediate neighborhoods.</p>
                    <p><strong>C-2 General Commercial:</strong> Large-scale retail, offices, hotels, and entertainment facilities serving the broader community.</p>
                    <p>All commercial establishments must comply with parking, landscaping, and signage requirements as specified in this ordinance.</p>
                `,
                history: [
                    { action: 'Commercial standards updated', user: 'Business Permits Office', date: '2024-06-10', type: 'update' },
                    { action: 'Commercial zones defined', user: 'Economic Development Office', date: '2024-05-25', type: 'creation' }
                ]
            },
            'sec-2-4': {
                title: 'Sec. 2-4 - Industrial Districts',
                type: 'Section',
                parent: 'article-2',
                ordinanceRef: 'Ord. No. 2024-15, Art. II, Sec. 2-4',
                lastUpdated: '2024-06-09',
                content: `
                    <h3>Industrial Districts</h3>
                    <p>Industrial districts are established to provide suitable areas for manufacturing, processing, and related industrial activities while protecting other land uses from potential adverse effects.</p>
                    <p><strong>I-1 Light Industrial:</strong> Light manufacturing, warehousing, and research facilities with minimal environmental impact.</p>
                    <p><strong>I-2 Heavy Industrial:</strong> Heavy manufacturing, processing plants, and industrial facilities with appropriate environmental controls.</p>
                    <p>All industrial developments must comply with environmental protection standards and buffer requirements.</p>
                `,
                history: [
                    { action: 'Environmental standards added', user: 'Environmental Office', date: '2024-06-09', type: 'update' },
                    { action: 'Industrial zones established', user: 'Planning Team', date: '2024-05-22', type: 'creation' }
                ]
            },
            'article-3': {
                title: 'ARTICLE III - ADMINISTRATION AND ENFORCEMENT',
                type: 'Article',
                parent: 'chapter-32',
                ordinanceRef: 'Ord. No. 2024-15, Art. III',
                lastUpdated: '2024-06-14',
                content: `
                    <h3>Administration and Enforcement</h3>
                    <p>This article establishes the administrative procedures, enforcement mechanisms, and penalty provisions for the implementation of this zoning ordinance.</p>
                    <p>The City Planning and Development Office shall serve as the primary implementing agency for this ordinance.</p>
                `,
                history: [
                    { action: 'Enforcement procedures updated', user: 'Legal Affairs Office', date: '2024-06-14', type: 'update' },
                    { action: 'Administrative guidelines drafted', user: 'CPDO', date: '2024-06-01', type: 'creation' }
                ]
            },
            'sec-3-1': {
                title: 'Sec. 3-1 - Zoning Administrator',
                type: 'Section',
                parent: 'article-3',
                ordinanceRef: 'Ord. No. 2024-15, Art. III, Sec. 3-1',
                lastUpdated: '2024-06-13',
                content: `
                    <h3>Zoning Administrator</h3>
                    <p>The City Planning and Development Officer shall serve as the Zoning Administrator and shall be responsible for:</p>
                    <ul>
                        <li>Administration and enforcement of this zoning ordinance</li>
                        <li>Issuance of zoning permits and certificates</li>
                        <li>Conducting zoning compliance inspections</li>
                        <li>Maintaining official zoning maps and records</li>
                        <li>Processing applications for zoning variances and special permits</li>
                    </ul>
                `,
                history: [
                    { action: 'Administrator duties clarified', user: 'CPDO', date: '2024-06-13', type: 'update' },
                    { action: 'Administrative structure established', user: 'City Administrator', date: '2024-06-01', type: 'creation' }
                ]
            },
            'sec-3-2': {
                title: 'Sec. 3-2 - Building Permits',
                type: 'Section',
                parent: 'article-3',
                ordinanceRef: 'Ord. No. 2024-15, Art. III, Sec. 3-2',
                lastUpdated: '2024-06-12',
                content: `
                    <h3>Building Permits</h3>
                    <p>No building or structure shall be erected, altered, or used until a building permit has been issued by the City Engineer's Office in accordance with this ordinance.</p>
                    <p>Building permit applications must include:</p>
                    <ul>
                        <li>Site development plan showing compliance with setback requirements</li>
                        <li>Architectural and structural plans</li>
                        <li>Zoning compliance certificate from the Planning Office</li>
                        <li>Environmental compliance certificate (if required)</li>
                    </ul>
                `,
                history: [
                    { action: 'Permit requirements updated', user: 'City Engineer', date: '2024-06-12', type: 'update' },
                    { action: 'Building permit process established', user: 'Building Official', date: '2024-05-28', type: 'creation' }
                ]
            },
            'sec-3-3': {
                title: 'Sec. 3-3 - Violations and Penalties',
                type: 'Section',
                parent: 'article-3',
                ordinanceRef: 'Ord. No. 2024-15, Art. III, Sec. 3-3',
                lastUpdated: '2024-06-14',
                content: `
                    <h3>Violations and Penalties</h3>
                    <p>Any person, firm, or corporation violating any provision of this ordinance shall be subject to the following penalties:</p>
                    <p><strong>First Offense:</strong> Fine of not less than ₱5,000 but not more than ₱10,000</p>
                    <p><strong>Second Offense:</strong> Fine of not less than ₱10,000 but not more than ₱20,000</p>
                    <p><strong>Third and Subsequent Offenses:</strong> Fine of not less than ₱20,000 but not more than ₱50,000 and/or imprisonment of not more than 6 months</p>
                    <p>Each day of continued violation shall constitute a separate offense.</p>
                `,
                history: [
                    { action: 'Penalty amounts finalized', user: 'Legal Affairs Office', date: '2024-06-14', type: 'update' },
                    { action: 'Enforcement penalties drafted', user: 'City Legal Officer', date: '2024-06-05', type: 'creation' }
                ]
            }
        };
    }

    // Dashboard Cards Navigation - Updated for multi-page
    setupDashboardCards() {
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const targetPage = card.getAttribute('data-link');
                if (targetPage) {
                    // Navigate to the corresponding HTML page
                    window.location.href = `${targetPage}.html`;
                }
            });
        });
    }

    updateDashboardStats() {
        // Simulate real-time updates
        const queryCount = document.querySelector('.stat-number');
        if (queryCount) {
            const currentCount = parseInt(queryCount.textContent.replace('+', ''));
            // Simulate small increments
            if (Math.random() > 0.7) {
                queryCount.textContent = `+${currentCount + Math.floor(Math.random() * 3) + 1}`;
            }
        }
    }

    setupDashboardTabs() {
        const tabBtns = document.querySelectorAll('.tab-nav .tab-btn');
        const tabContents = document.querySelectorAll('.dashboard-tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabBtns.forEach(tab => tab.classList.remove('active'));
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show target tab content
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
            });
        });
    }

    // Enhanced Zoning Code Interface Setup
    setupZoningCodeInterface() {
        if (this.getCurrentPage() !== 'zoning-code') return;

        // Setup tree navigation with expand/collapse
        this.setupEnhancedTreeNavigation();
        
        // Setup content tabs
        this.setupContentTabs();
        
        // Setup section selection
        this.setupSectionSelection();
    }

    initializeZoningCode() {
        // Initialize with empty state
        this.showEmptyState();
    }

    setupEnhancedTreeNavigation() {
        const treeChildren = document.querySelectorAll('.tree-child.has-children');
        
        treeChildren.forEach(child => {
            child.addEventListener('click', (e) => {
                // Check if click is on the expand/collapse arrow area
                const rect = child.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                
                // If click is in the first 24px (arrow area), just toggle expansion
                if (clickX <= 24) {
                    e.stopPropagation();
                    
                    // Toggle expanded state
                    child.classList.toggle('expanded');
                    
                    // Show/hide grandchildren
                    const grandchildren = child.querySelector('.tree-grandchildren');
                    if (grandchildren) {
                        const isVisible = grandchildren.style.display !== 'none';
                        grandchildren.style.display = isVisible ? 'none' : 'block';
                    }
                } else {
                    // Click is on the text area, select the section
                    e.stopPropagation();
                    const sectionId = child.getAttribute('data-section');
                    if (sectionId) {
                        this.selectSection(sectionId, child);
                    }
                }
            });
        });

        // Setup main chapter/ordinance selection
        const treeHeader = document.querySelector('.tree-header[data-section]');
        if (treeHeader) {
            treeHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionId = treeHeader.getAttribute('data-section');
                this.selectSection(sectionId, treeHeader);
            });
        }
    }

    setupSectionSelection() {
        const grandchildren = document.querySelectorAll('.tree-grandchild');
        
        grandchildren.forEach(grandchild => {
            grandchild.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const sectionId = grandchild.getAttribute('data-section');
                if (sectionId) {
                    this.selectSection(sectionId, grandchild);
                }
            });
        });
    }

    setupContentTabs() {
        const tabs = document.querySelectorAll('.content-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    selectSection(sectionId, element) {
        console.log('Selecting section:', sectionId); // Debug log
        
        // Remove previous selections
        document.querySelectorAll('.tree-child, .tree-grandchild, .tree-header').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to current element
        element.classList.add('selected');
        
        // Store current section
        this.currentSection = sectionId;
        
        // Load section content
        this.loadSectionContent(sectionId);
        
        // Show section content area
        this.showSectionContent();
    }

    loadSectionContent(sectionId) {
        const sectionData = this.sectionData[sectionId];
        console.log('Loading section data for:', sectionId, sectionData); // Debug log
        
        if (!sectionData) {
            console.warn('No section data found for:', sectionId);
            return;
        }

        // Update section title
        const titleElement = document.getElementById('section-title');
        if (titleElement) {
            titleElement.textContent = sectionData.title;
        }
        
        // Load content
        const contentElement = document.getElementById('zoning-content');
        if (contentElement) {
            contentElement.innerHTML = sectionData.content;
        }
        
        // Load metadata
        this.loadMetadata(sectionData);
        
        // Load history
        this.loadHistory(sectionData.history || []);
        
        // Reset to content tab
        this.switchTab('content');
    }

    loadMetadata(sectionData) {
        const ordinanceRef = document.getElementById('ordinance-ref');
        const lastUpdated = document.getElementById('last-updated');
        const sectionType = document.getElementById('section-type');
        const parentSection = document.getElementById('parent-section');
        
        if (ordinanceRef) ordinanceRef.textContent = sectionData.ordinanceRef || 'N/A';
        if (lastUpdated) lastUpdated.textContent = sectionData.lastUpdated || 'N/A';
        if (sectionType) sectionType.textContent = sectionData.type || 'Section';
        if (parentSection) {
            parentSection.textContent = 
                sectionData.parent !== 'None' && this.sectionData[sectionData.parent] 
                    ? this.sectionData[sectionData.parent].title 
                    : sectionData.parent || 'N/A';
        }
    }

    loadHistory(historyItems) {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        historyItems.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-content">
                    <div class="history-action">${item.action}</div>
                    <div class="history-meta">${item.user} • ${item.date}</div>
                </div>
                <button class="history-view-btn">View</button>
            `;
            historyList.appendChild(historyItem);
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName); // Debug log
        
        // Update tab buttons
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Update content panels
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const activePanel = document.getElementById(`${tabName}-panel`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    showSectionContent() {
        const emptyState = document.getElementById('empty-state');
        const sectionContent = document.getElementById('section-content');
        
        console.log('Showing section content'); // Debug log
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (sectionContent) {
            sectionContent.style.display = 'block';
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const sectionContent = document.getElementById('section-content');
        
        console.log('Showing empty state'); // Debug log
        
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
        if (sectionContent) {
            sectionContent.style.display = 'none';
        }
    }

    // File Upload Handling
    setupFileUpload() {
        const uploadArea = document.querySelector('.upload-area');
        const uploadBtn = document.querySelector('.upload-btn');

        if (uploadArea) {
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--accent-primary)';
                uploadArea.style.backgroundColor = 'var(--bg-tertiary)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.backgroundColor = 'transparent';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.backgroundColor = 'transparent';
                
                const files = Array.from(e.dataTransfer.files);
                this.handleFileUpload(files);
            });
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.html,.txt';
                input.onchange = (e) => {
                    const files = Array.from(e.target.files);
                    this.handleFileUpload(files);
                };
                input.click();
            });
        }
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        const uploadArea = document.querySelector('.upload-area');
        const validFiles = files.filter(file => {
            const validTypes = ['application/pdf', 'application/msword', 
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'text/html', 'text/plain'];
            return validTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|html|txt)$/i);
        });

        if (validFiles.length !== files.length) {
            this.showNotification('Some files were skipped. Only PDF, Word, HTML, and text files are supported.', 'warning');
        }

        if (validFiles.length > 0) {
            uploadArea.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon icon-lg" viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: currentColor; fill: none; stroke-width: 2;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <div class="upload-text">${validFiles.length} file(s) selected</div>
                <div class="upload-subtext">${validFiles.map(f => f.name).join(', ')}</div>
                <button class="upload-btn">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                    </svg>
                    Choose Different Files
                </button>
            `;
            
            // Re-setup upload button
            this.setupFileUpload();
        }
    }

    resetImportForm() {
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon icon-lg" viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: currentColor; fill: none; stroke-width: 2;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                </div>
                <div class="upload-text">Drag and drop files here</div>
                <div class="upload-subtext">or click the button below to browse files</div>
                <button class="upload-btn">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                    </svg>
                    Browse Files
                </button>
            `;
            this.setupFileUpload();
        }
    }

    // Toggle Switches
    setupToggles() {
        const toggles = document.querySelectorAll('.toggle-input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const label = e.target.closest('.toggle-label');
                if (label) {
                    const setting = label.textContent.trim();
                    console.log(`${setting}: ${e.target.checked ? 'enabled' : 'disabled'}`);
                }
            });
        });
    }

    // Tab Navigation
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs in the same group
                const tabGroup = btn.closest('.tab-nav, .settings-tabs');
                if (tabGroup) {
                    tabGroup.querySelectorAll('.tab-btn').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    btn.classList.add('active');
                }
            });
        });
    }

    // Search Functionality
    setupSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.performSearch(query, input);
            });
        });
    }

    performSearch(query, inputElement) {
        const page = inputElement.closest('.page');
        if (!page) return;

        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'regulations':
            case 'faqs':
            case 'users':
                this.searchTable(query, page);
                break;
            case 'zoning-code':
                this.searchTree(query, page);
                break;
        }
    }

    searchTable(query, page) {
        const rows = page.querySelectorAll('.data-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }

    searchTree(query, page) {
        const treeItems = page.querySelectorAll('.tree-child, .tree-grandchild');
        treeItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    }

    // Tree Navigation (legacy support)
    setupTreeNavigation() {
        // This is now handled by setupEnhancedTreeNavigation for zoning-code page
        if (this.getCurrentPage() === 'zoning-code') return;
        
        const treeHeaders = document.querySelectorAll('.tree-header');
        const treeChildren = document.querySelectorAll('.tree-child');

        treeHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const children = header.nextElementSibling;
                if (children && children.classList.contains('tree-children')) {
                    const isVisible = children.style.display !== 'none';
                    children.style.display = isVisible ? 'none' : 'block';
                    // Update the folder icon based on expanded/collapsed state
                    const icon = header.querySelector('svg');
                    if (icon) {
                        const pathElement = icon.querySelector('path');
                        if (isVisible) {
                            // Collapsed folder icon
                            pathElement.setAttribute('d', 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z');
                        } else {
                            // Expanded folder icon
                            pathElement.setAttribute('d', 'M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776');
                        }
                    }
                }
            });
        });

        treeChildren.forEach(child => {
            child.addEventListener('click', () => {
                // Remove active state from all children
                treeChildren.forEach(c => c.classList.remove('active'));
                child.classList.add('active');
                
                // Show content in main area
                this.showTreeContent(child.textContent);
            });
        });
    }

    showTreeContent(title) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="width: 100%; text-align: left;">
                    <h2 style="color: var(--text-primary); margin-bottom: 1rem;">${title}</h2>
                    <div style="color: var(--text-secondary); line-height: 1.6;">
                        <p>This section contains the detailed regulations and provisions for ${title.toLowerCase()}.</p>
                        <br>
                        <p>Content would be loaded here from the zoning code database, including:</p>
                        <ul style="margin: 1rem 0; padding-left: 2rem;">
                            <li>Permitted uses</li>
                            <li>Dimensional requirements</li>
                            <li>Special provisions</li>
                            <li>Parking requirements</li>
                        </ul>
                        <p>Use the editor tools above to modify this section.</p>
                    </div>
                </div>
            `;
        }
    }

    // Table Actions
    setupTableActions() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const svg = btn.querySelector('svg');
                const row = btn.closest('tr');
                
                if (svg) {
                    const path = svg.querySelector('path').getAttribute('d');
                    // Check if it's an edit icon (pencil path)
                    if (path.includes('M16.862')) {
                    this.editTableRow(row);
                    } 
                    // Check if it's a delete icon (trash path)
                    else if (path.includes('M14.74')) {
                    this.deleteTableRow(row);
                    }
                }
            });
        });
    }

    editTableRow(row) {
        const cells = row.querySelectorAll('td');
        const data = Array.from(cells).slice(0, -1).map(cell => cell.textContent.trim());
        
        this.showNotification(`Editing: ${data[0]}`, 'info');
        // In a real app, this would open an edit modal
    }

    deleteTableRow(row) {
        const firstCell = row.querySelector('td');
        const identifier = firstCell ? firstCell.textContent.trim() : 'item';
        
        if (confirm(`Are you sure you want to delete ${identifier}?`)) {
            row.style.opacity = '0.5';
            setTimeout(() => {
                row.remove();
                this.showNotification(`${identifier} deleted successfully`, 'success');
            }, 300);
        }
    }

    // Form Handling
    setupFormHandling() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });

        // AI Settings specific
        const testConnectionBtn = document.querySelector('.secondary-btn');
        const saveSettingsBtn = document.querySelector('.primary-btn');

        if (testConnectionBtn && testConnectionBtn.textContent.includes('Test Connection')) {
            testConnectionBtn.addEventListener('click', () => {
                this.testAIConnection();
            });
        }

        if (saveSettingsBtn && saveSettingsBtn.textContent.includes('Save Settings')) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveAISettings();
            });
        }

        // Training button
        const trainBtn = document.querySelector('.training-card .primary-btn');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => {
                this.startAITraining();
            });
        }
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Form submitted:', data);
        this.showNotification('Form submitted successfully', 'success');
    }

    testAIConnection() {
        const btn = document.querySelector('.secondary-btn');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = `
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            Testing...
        `;
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            this.showNotification('AI connection test successful', 'success');
        }, 2000);
    }

    saveAISettings() {
        const btn = document.querySelector('.primary-btn');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = `
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
            </svg>
            Saving...
        `;
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            this.showNotification('AI settings saved successfully', 'success');
        }, 1500);
    }

    startAITraining() {
        const btn = document.querySelector('.training-card .primary-btn');
        const originalText = btn.textContent;
        
        btn.innerHTML = `
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            Training...
        `;
        btn.disabled = true;
        
        // Simulate training progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                clearInterval(interval);
                btn.textContent = originalText;
                btn.disabled = false;
                this.showNotification('AI training completed successfully', 'success');
                
                // Update last trained time
                const lastTrained = document.querySelector('.info-item');
                if (lastTrained) {
                    const now = new Date();
                    lastTrained.innerHTML = `<strong>Last trained:</strong> ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                }
            } else {
                btn.innerHTML = `
                    <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 8px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                    </svg>
                    Training... ${Math.floor(progress)}%
                `;
            }
        }, 500);
    }

    initializeAISettings() {
        // Initialize range slider display
        const rangeInput = document.querySelector('.form-range');
        if (rangeInput) {
            const updateRangeDisplay = () => {
                const label = rangeInput.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.textContent = `Temperature (${rangeInput.value})`;
                }
            };
            
            rangeInput.addEventListener('input', updateRangeDisplay);
            updateRangeDisplay();
        }

        // Setup AI Settings tab switching
        this.setupAISettingsTabs();
    }

    setupAISettingsTabs() {
        const tabBtns = document.querySelectorAll('.settings-tabs .tab-btn');
        const tabContents = document.querySelectorAll('[id^="tab-"]');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabBtns.forEach(tab => tab.classList.remove('active'));
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show target tab content
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
            });
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // User Dropdown Toggle
    setupUserDropdown() {
        const userProfile = document.getElementById('user-profile');
        const userDropdown = document.getElementById('user-dropdown');

        if (userProfile && userDropdown) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });

            // Handle dropdown item clicks
            const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const text = item.textContent.trim();
                    
                    if (text === 'Log out') {
                        this.handleLogout();
                    } else if (text === 'Profile') {
                        this.handleProfile();
                    } else if (text === 'Settings') {
                        this.handleSettings();
                    }
                    
                    userDropdown.classList.remove('active');
                });
            });
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.showNotification('Logging out...', 'info');
            // In a real app, this would redirect to login page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    handleProfile() {
        this.showNotification('Profile page would open here', 'info');
        // In a real app, this would navigate to profile page
    }

    handleSettings() {
        this.showNotification('Redirecting to settings...', 'info');
        // Navigate to AI settings page
        setTimeout(() => {
            window.location.href = 'ai-settings.html';
        }, 500);
    }

    // Mobile Menu Toggle
    setupMobileMenu() {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
        `;
        menuToggle.style.cssText = `
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1001;
            background: var(--accent-primary);
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 1.25rem;
            cursor: pointer;
        `;

        document.body.appendChild(menuToggle);

        menuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
            sidebar.classList.toggle('open');
            }
        });

        // Show on mobile
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaQuery = (e) => {
            menuToggle.style.display = e.matches ? 'block' : 'none';
        };
        
        mediaQuery.addListener(handleMediaQuery);
        handleMediaQuery(mediaQuery);
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Regulation Modal Logic
function setupRegulationModal() {
    const modal = document.getElementById('regulation-modal');
    const openBtns = [
        ...document.querySelectorAll('.primary-btn'), // Add New Regulation
        ...document.querySelectorAll('.action-btn')   // Edit buttons
    ];
    const closeBtn = document.getElementById('modal-close');
    const overlay = modal;
    const tabs = modal.querySelectorAll('.modal-tab');
    const panels = modal.querySelectorAll('.modal-panel');
    const form = document.getElementById('regulation-form');

    // Open modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            tabs.forEach(tab => tab.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            tabs[0].classList.add('active');
            panels[0].classList.add('active');
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            modal.style.display = 'none';
        }
    });

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = modal.querySelector(`#modal-panel-${tab.dataset.tab}`);
            if (panel) panel.classList.add('active');
        });
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        // Optionally, show a notification or update the table
    });
}

// Initialize modal logic for regulations page
if (window.location.pathname.includes('regulations.html')) {
    document.addEventListener('DOMContentLoaded', setupRegulationModal);
}

// FAQ Modal Logic
function setupFAQModal() {
    const modal = document.getElementById('faq-modal');
    const openBtn = document.querySelector('.primary-btn'); // Add New FAQ
    const editBtns = document.querySelectorAll('.action-btn'); // Edit buttons
    const closeBtn = document.getElementById('faq-modal-close');
    const overlay = modal;
    const form = document.getElementById('faq-form');
    const title = document.getElementById('faq-modal-title');
    const subtitle = document.getElementById('faq-modal-subtitle');
    const question = document.getElementById('faq-question');
    const answer = document.getElementById('faq-answer');
    const zoneCode = document.getElementById('faq-zoneCode');
    const category = document.getElementById('faq-category');

    // Sample Butuan City FAQ data for edit
    const sample = {
        question: 'What can I build in a C5-3 zone?',
        answer: 'In a C5-3 zone (Central Commercial District), you can build high-density commercial buildings including office towers, retail establishments, hotels, and entertainment venues. Residential use is permitted with special permits. There is no absolute height limit, but buildings are subject to sky exposure plane regulations. The maximum Floor Area Ratio (FAR) is 15.0, which can be increased with bonuses for public amenities.',
        zoneCode: 'C5-3',
        category: 'Use'
    };

    // Open modal for Add
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        title.textContent = 'Create New FAQ';
        subtitle.textContent = 'Add a new frequently asked question to the system.';
        question.value = '';
        answer.value = '';
        zoneCode.value = '';
        category.value = 'Use';
        modal.style.display = 'flex';
    });

    // Open modal for Edit
    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            title.textContent = 'Edit FAQ';
            subtitle.textContent = 'Make changes to the existing FAQ.';
            question.value = sample.question;
            answer.value = sample.answer;
            zoneCode.value = sample.zoneCode;
            category.value = sample.category;
            modal.style.display = 'flex';
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            modal.style.display = 'none';
        }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        // Optionally, show a notification or update the table
    });
}

// Initialize FAQ modal logic for faqs page
if (window.location.pathname.includes('faqs.html')) {
    document.addEventListener('DOMContentLoaded', setupFAQModal);
}

// User Modal Logic
function setupUserModal() {
    const modal = document.getElementById('user-modal');
    const openBtn = document.querySelector('.primary-btn'); // Add New User
    const editBtns = document.querySelectorAll('.action-btn'); // Edit buttons
    const closeBtn = document.getElementById('user-modal-close');
    const overlay = modal;
    const form = document.getElementById('user-form');
    const title = document.getElementById('user-modal-title');
    const subtitle = document.getElementById('user-modal-subtitle');
    const nameField = document.getElementById('user-name');
    const emailField = document.getElementById('user-email');
    const roleField = document.getElementById('user-role');
    const departmentField = document.getElementById('user-department');
    const passwordField = document.getElementById('user-password');
    const passwordLabel = document.getElementById('password-label');
    const passwordHelp = document.getElementById('password-help');

    // Sample user data for edit
    const sampleUsers = {
        'John Smith': {
            name: 'John Smith',
            email: 'john.smith@planning.nyc.gov',
            role: 'Administrator',
            department: 'Planning Department'
        },
        'Sarah Johnson': {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@planning.nyc.gov',
            role: 'Editor',
            department: 'Zoning Division'
        },
        'Michael Brown': {
            name: 'Michael Brown',
            email: 'michael.brown@planning.nyc.gov',
            role: 'Viewer',
            department: 'GIS Team'
        }
    };

    // Open modal for Add New User
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        title.textContent = 'Create New User';
        subtitle.textContent = 'Add a new user to the system.';
        passwordLabel.textContent = 'Password';
        passwordField.placeholder = 'New password';
        passwordHelp.textContent = 'Password must be at least 8 characters long';
        passwordField.required = true;
        
        // Clear form
        nameField.value = '';
        emailField.value = '';
        roleField.value = '';
        departmentField.value = '';
        passwordField.value = '';
        
        modal.style.display = 'flex';
    });

    // Open modal for Edit User
    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const row = btn.closest('tr');
            const userName = row.cells[0].textContent.trim();
            const userData = sampleUsers[userName];
            
            if (userData) {
                title.textContent = 'Edit User';
                subtitle.textContent = 'Make changes to the existing user.';
                passwordLabel.textContent = 'Password';
                passwordField.placeholder = 'Leave blank to keep current';
                passwordHelp.textContent = 'Leave blank to keep current password';
                passwordField.required = false;
                
                // Populate form with existing data
                nameField.value = userData.name;
                emailField.value = userData.email;
                roleField.value = userData.role;
                departmentField.value = userData.department;
                passwordField.value = '';
                
                modal.style.display = 'flex';
            }
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            modal.style.display = 'none';
        }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validation
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate password for new users
        if (title.textContent === 'Create New User' && data.password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        modal.style.display = 'none';
        
        // Show success message
        if (title.textContent === 'Create New User') {
            showNotification(`User "${data.name}" created successfully`, 'success');
        } else {
            showNotification(`User "${data.name}" updated successfully`, 'success');
        }
    });

    // Helper function for notifications (if not already defined)
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize user modal logic for users page
if (window.location.pathname.includes('users.html')) {
    document.addEventListener('DOMContentLoaded', setupUserModal);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ZoningAdminPortal();
    
    // Export for global access
    window.zoningApp = app;
    
    console.log(`Zoning Code Administration Portal loaded successfully - Page: ${app.getCurrentPage()}`);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.zoningApp) {
        // Refresh data when page becomes visible
        const currentPage = window.zoningApp.getCurrentPage();
        if (currentPage === 'dashboard') {
            window.zoningApp.updateDashboardStats();
        }
    }
});
