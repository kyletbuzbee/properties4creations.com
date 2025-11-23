/**
 * P4C Static Application Bundle
 * Combined client-side functionality for static HTML version
 * Includes Forms, Modals, and core interactivity
 */

/**
 * P4C Static Forms
 * Client-side form handling for static HTML version
 * Handles validation, submission, and form interactions
 */

P4C.Forms = {
    activeForm: null,
    formValidationResults: new Map(),

    // Initialize form functionality
    init: function() {
        console.log('📝 Initializing P4C Forms...');

        // Bind form event handlers
        this.bindFormEvents();

        console.log('✅ P4C Forms initialized');
    },

    // Bind form-related event handlers
    bindFormEvents: function() {
        // Handle form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));

        // Handle form input changes for validation
        document.addEventListener('input', this.handleInputChange.bind(this));
        document.addEventListener('blur', this.handleFieldBlur.bind(this));

        // Handle form-specific buttons
        document.addEventListener('click', function(e) {
            const button = e.target.closest('[data-form-action]');
            if (button) {
                e.preventDefault();
                const action = button.getAttribute('data-form-action');
                const formId = button.getAttribute('data-form-id');
                P4C.Forms.handleFormAction(action, formId);
            }
        });
    },

    // Handle form submission
    handleFormSubmit: function(e) {
        e.preventDefault();
        const form = e.target;

        console.log(`📤 Submitting form: ${form.id || form.name}`);

        // Validate form
        if (this.validateForm(form)) {
            this.submitForm(form);
        } else {
            console.log('❌ Form validation failed');
        }
    },

    // Handle input changes
    handleInputChange: function(e) {
        const field = e.target;
        if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
            this.validateField(field);
        }
    },

    // Handle field blur
    handleFieldBlur: function(e) {
        const field = e.target;
        this.validateField(field);
    },

    // Handle form actions
    handleFormAction: function(action, formId) {
        const form = document.getElementById(formId);

        switch (action) {
            case 'clear':
                if (form) form.reset();
                break;
            case 'reset':
                if (form) form.reset();
                break;
            case 'preview':
                this.previewForm(form);
                break;
        }
    },

    // Validate entire form
    validateForm: function(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Store validation result
        this.formValidationResults.set(form.id || form.name, isValid);

        return isValid;
    },

    // Validate individual field
    validateField: function(field) {
        const required = field.hasAttribute('required');
        const value = field.value.trim();
        let isValid = true;

        // Clear previous error
        this.clearFieldError(field);

        // Check required fields
        if (required && value === '') {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Type-specific validation
        switch (field.type) {
            case 'email':
                isValid = this.validateEmail(value);
                if (!isValid) this.showFieldError(field, 'Please enter a valid email address');
                break;

            case 'tel':
                isValid = this.validatePhone(value);
                if (!isValid) this.showFieldError(field, 'Please enter a valid phone number');
                break;

            case 'password':
                isValid = this.validatePassword(value);
                if (!isValid) this.showFieldError(field, 'Password must be at least 8 characters');
                break;
        }

        // Custom validation rules
        if (field.hasAttribute('data-min-length')) {
            const minLength = parseInt(field.getAttribute('data-min-length'));
            if (value.length < minLength) {
                this.showFieldError(field, `Minimum ${minLength} characters required`);
                isValid = false;
            }
        }

        if (field.hasAttribute('data-max-length')) {
            const maxLength = parseInt(field.getAttribute('data-max-length'));
            if (value.length > maxLength) {
                this.showFieldError(field, `Maximum ${maxLength} characters allowed`);
                isValid = false;
            }
        }

        // Update field styling
        this.updateFieldStyling(field, isValid);

        return isValid;
    },

    // Email validation
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone validation
    validatePhone: function(phone) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone);
    },

    // Password validation
    validatePassword: function(password) {
        return password.length >= 8;
    },

    // Show field error
    showFieldError: function(field, message) {
        field.classList.add('field-error');

        // Create or update error message
        let errorElement = field.parentNode.querySelector('.field-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },

    // Clear field error
    clearFieldError: function(field) {
        field.classList.remove('field-error');

        const errorElement = field.parentNode.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    },

    // Update field styling
    updateFieldStyling: function(field, isValid) {
        field.classList.toggle('field-valid', isValid);
        field.classList.toggle('field-invalid', !isValid);
    },

    // Submit form (Updated for real AJAX submission)
    submitForm: function(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // 1. Visual Loading State
        this.setFormLoading(form, true);

        // 2. Collect Data
        const formData = new FormData(form);

        // 3. Determine Endpoint (Default to Formspree)
        const action = form.getAttribute('action') || 'https://formspree.io/f/xdkjlgwk';

        // 4. Send Data via Fetch (AJAX)
        fetch(action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                this.handleFormSuccess(form);
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Submission failed');
                });
            }
        })
        .catch(error => {
            console.error('Form Error:', error);
            this.handleFormError(form, error);
        })
        .finally(() => {
            this.setFormLoading(form, false, originalBtnText);
        });
    },

    // Send form data to server (Removed - replaced with fetch in submitForm)
    sendFormData: function(form, formData) {
        // Legacy method removed
    },

    // Set form loading state
    setFormLoading: function(form, isLoading) {
        const submitBtn = form.querySelector('[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea');

        if (isLoading) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                submitBtn.classList.add('btn-loading');
            }

            inputs.forEach(input => input.disabled = true);
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                submitBtn.classList.remove('btn-loading');
            }

            inputs.forEach(input => input.disabled = false);
        }
    },

    // Handle form submission success
    handleFormSuccess: function(form, response) {
        // Show success message
        if (P4C.Modals) {
            P4C.Modals.showSuccess('Form submitted successfully!', 3000);
        }

        // Reset form
        form.reset();

        // Clear validation states
        this.clearFormValidation(form);

        // Trigger success callback if defined
        const successCallback = form.getAttribute('data-on-success');
        if (successCallback && window[successCallback]) {
            window[successCallback](response);
        }
    },

    // Handle form submission error
    handleFormError: function(form, error) {
        // Show error message
        if (P4C.Modals) {
            P4C.Modals.showError('Form submission failed. Please try again.');
        }
    },

    // Clear form validation
    clearFormValidation: function(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            this.clearFieldError(field);
            this.updateFieldStyling(field, true);
        });
    },

    // Preview form data
    previewForm: function(form) {
        const formData = {};
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (field.name) {
                formData[field.name] = field.value;
            }
        });

        console.log('📋 Form preview:', formData);

        // Show preview modal
        const previewHTML = Object.entries(formData)
            .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
            .join('');

        if (P4C.Modals) {
            P4C.Modals.showSuccess(`<strong>Form Preview:</strong><br>${previewHTML}`, 5000);
        }
    }
};

/**
 * P4C Static Modals
 * Client-side modal management for static HTML version
 * Handles portals, authentication, and interactive overlays
 */

P4C.Modals = {
    activeModal: null,
    modalStates: {},

    // Initialize modal functionality
    init: function() {
        console.log('📱 Initializing P4C Modals...');

        // Bind modal event handlers
        this.bindModalEvents();

        console.log('✅ P4C Modals initialized');
    },

    // Bind modal trigger events
    bindModalEvents: function() {
        // Bind buttons with data-modal attribute
        document.addEventListener('click', function(e) {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                const modalId = modalTrigger.getAttribute('data-modal');
                e.preventDefault();
                P4C.Modals.open(modalId);
                return;
            }

            // Handle portal-specific buttons
            const portalButton = e.target.closest('[id*="portal"]');
            if (portalButton && portalButton.id) {
                e.preventDefault();
                P4C.Modals.handlePortalAction(portalButton.id);
                return;
            }

            // Handle close buttons
            if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
                e.preventDefault();
                P4C.Modals.closeAll();
                return;
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                P4C.Modals.closeAll();
            }
        });
    },

    // Open a modal by ID
    open: function(modalId) {
        if (!modalId) return;

        const modal = document.getElementById(modalId + '-modal');
        if (!modal) {
            console.warn(`Modal ${modalId} not found`);
            return;
        }

        // Close any currently open modal
        this.closeAll();

        // Show the modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add backdrop click handler
        setTimeout(() => {
            modal.addEventListener('click', this.handleBackdropClick);
        }, 10);

        // Focus management
        const focusableElement = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            focusableElement.focus();
        }

        this.activeModal = modalId;
        this.modalStates[modalId] = { open: true };

        console.log(`📱 Opened modal: ${modalId}`);
    },

    // Close a specific modal
    close: function(modalId) {
        if (!modalId) return;

        const modal = document.getElementById(modalId + '-modal');
        if (!modal) return;

        modal.style.display = 'none';
        modal.removeEventListener('click', this.handleBackdropClick);

        document.body.style.overflow = '';

        this.modalStates[modalId] = { open: false };
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    },

    // Close all modals
    closeAll: function() {
        const modals = document.querySelectorAll('[id*="-modal"]');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.removeEventListener('click', this.handleBackdropClick);
        });

        document.body.style.overflow = '';
        this.activeModal = null;

        Object.keys(this.modalStates).forEach(key => {
            this.modalStates[key].open = false;
        });
    },

    // Handle backdrop click
    handleBackdropClick: function(e) {
        if (e.target === this) {
            P4C.Modals.closeAll();
        }
    },

    // Toggle modal
    toggle: function(modalId) {
        if (this.modalStates[modalId]?.open) {
            this.close(modalId);
        } else {
            this.open(modalId);
        }
    },

    // Handle portal-specific actions
    handlePortalAction: function(buttonId) {
        switch (buttonId) {
            case 'search-toggle':
                this.toggle('global-search');
                break;

            case 'portal-toggle':
                this.open('portal');
                break;

            case 'portal-close':
                this.close('portal');
                break;

            case 'partner-portal':
                this.handlePortalLogin('partner');
                break;

            case 'veteran-portal':
                this.handlePortalLogin('veteran');
                break;
        }
    },

    // Handle portal login
    handlePortalLogin: function(portalType) {
        // Store portal type preference
        localStorage.setItem('preferred-portal', portalType);

        // Close portal selection modal
        this.close('portal');

        // Open actual login modal
        setTimeout(() => {
            this.openLoginModal(portalType);
        }, 300);
    },

    // Open login modal
    openLoginModal: function(portalType) {
        // For static version, we'll simulate authentication
        const loginModal = this.createLoginModal(portalType);
        document.body.appendChild(loginModal);
        this.open('portal-login');
    },

    // Create login modal dynamically
    createLoginModal: function(portalType) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'portal-login-modal';
        modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center';

        modalDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl p-6 m-4 w-full max-w-md">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center capitalize">
                    ${portalType} Portal Login
                </h2>

                <form id="portal-login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center text-sm">
                            <input type="checkbox" id="remember-me" class="mr-2" />
                            Remember me
                        </label>
                        <button type="button" class="text-sm text-blue-600 hover:text-blue-800">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        id="login-submit"
                    >
                        Sign In
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        Don't have an account?
                        <button id="portal-register" class="text-blue-600 hover:text-blue-800 ml-1 font-medium">
                            Request Access →
                        </button>
                    </p>
                </div>

                <button
                    id="login-close"
                    data-modal-close
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        return modalDiv;
    },

    // Show success message
    showSuccess: function(message, duration = 3000) {
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-[100] animate-fade-in';
        successToast.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(successToast);

        setTimeout(() => {
            successToast.remove();
        }, duration);
    },

    // Show error message
    showError: function(message, duration = 5000) {
        const errorToast = document.createElement('div');
        errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-[100] animate-fade-in';
        errorToast.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${message}</span>
                <button onclick="this.parentElement.remove()" class="ml-2 hover:text-gray-200">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(errorToast);

        setTimeout(() => {
            errorToast.remove();
        }, duration);
    },

    // Animate modal content
    animateModal: function(modalId, direction = 'in') {
        const modal = document.getElementById(modalId + '-modal');
        if (!modal) return;

        const content = modal.querySelector('.modal-content') || modal;

        if (direction === 'in') {
            content.style.transform = 'translateY(-20px) scale(0.95)';
            content.style.opacity = '0';

            setTimeout(() => {
                content.style.transition = 'all 0.3s ease-out';
                content.style.transform = 'translateY(0) scale(1)';
                content.style.opacity = '1';
            }, 10);
        } else {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.opacity = '1';

            setTimeout(() => {
                content.style.transition = 'all 0.2s ease-in';
                content.style.transform = 'translateY(-10px) scale(0.95)';
                content.style.opacity = '0';
            }, 10);
        }
    }
};

/**
 * P4C Static Search - ORGANIZED VERSION
 * Client-side search functionality that mimics Next.js GlobalSearch component
 * Provides real-time search with keyboard navigation and filtering
 */

P4C.Search = {
    searchData: [],
    searchInput: null,
    resultsContainer: null,
    debounceTimer: null,
    currentQuery: '',
    selectedIndex: -1,

    // Initialize search functionality
    init: function() {
        console.log('🔍 Initializing P4C Search...');

        try {
            // Load search data first
            this.loadSearchData().then(() => {
                // Check if DOM is ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', this.initSearch.bind(this));
                } else {
                    this.initSearch();
                }
            }).catch(() => {
                console.error('❌ Could not load search data');
            });
        } catch (error) {
            console.error('❌ Error initializing P4C Search:', error);
        }
    },

    // Load search data from JSON file
    loadSearchData: function() {
        // Check if we are running locally without a server
        if (window.location.protocol === 'file:') {
            console.warn('⚠️ Search requires a web server (CORS). Running in offline fallback mode.');
            this.searchData = []; // Empty data so site doesn't crash
            return Promise.resolve();
        }

        return fetch('public/search-index.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load search data');
                }
                return response.json();
            })
            .then(data => {
                this.searchData = data;
                console.log('✅ Search data loaded from JSON');
            })
            .catch(error => {
                console.warn('Search index unavailable:', error.message);
                this.searchData = [];
            });
    },

    // Initialize search UI after data loads
    initSearch: function() {
        try {
            // Get DOM elements
            this.searchInput = document.getElementById('search-input');
            this.resultsContainer = document.getElementById('search-results');

            // Initialize empty state
            this.showEmptyState();

            // Bind event handlers
            this.bindEvents();

            console.log('✅ P4C Search initialized');
        } catch (error) {
            console.error('❌ Error initializing search UI:', error);
        }
    },

    // Bind event handlers
    bindEvents: function() {
        // Search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.onInput.bind(this));
            this.searchInput.addEventListener('keydown', this.onKeydown.bind(this));
        }

        // Search toggle button
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', this.toggleSearch.bind(this));
        }

        // Search close button
        const searchClose = document.getElementById('search-close');
        if (searchClose) {
            searchClose.addEventListener('click', this.closeSearch.bind(this));
        }

        // Keyboard shortcut (Command+K or Ctrl+K)
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch();
            }
        }.bind(this));
    },

    // Toggle search modal
    toggleSearch: function() {
        if (typeof P4C !== 'undefined' && P4C.Modals) {
            P4C.Modals.toggle('search');
        }
    },

    // Close search modal
    closeSearch: function() {
        if (typeof P4C !== 'undefined' && P4C.Modals) {
            P4C.Modals.close('search');
        }
    },

    // Handle search input
    onInput: function(event) {
        try {
            const query = event.target.value.trim();
            this.currentQuery = query;

            // Clear previous timeout
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            // Debounce search
            this.debounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        } catch (error) {
            console.error('Search input error:', error);
        }
    },

    // Handle keyboard navigation
    onKeydown: function(event) {
        try {
            const results = this.resultsContainer ? this.resultsContainer.children : [];
            if (results.length === 0) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
                    this.updateSelection();
                    this.scrollToSelected();
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                    this.updateSelection();
                    this.scrollToSelected();
                    break;

                case 'Enter':
                    event.preventDefault();
                    if (this.selectedIndex >= 0) {
                        const selectedLink = results[this.selectedIndex].querySelector('a');
                        if (selectedLink) {
                            this.closeSearch();
                            window.location.href = selectedLink.href;
                        }
                    }
                    break;

                case 'Escape':
                    event.preventDefault();
                    this.closeSearch();
                    break;
            }
        } catch (error) {
            console.error('Keyboard navigation error:', error);
        }
    },

    // Update visual selection
    updateSelection: function() {
        try {
            const results = this.resultsContainer ? this.resultsContainer.children : [];

            // Remove previous selection
            Array.from(results).forEach(result => {
                result.classList.remove('selected');
            });

            // Add current selection
            if (this.selectedIndex >= 0 && results[this.selectedIndex]) {
                results[this.selectedIndex].classList.add('selected');
            }
        } catch (error) {
            console.error('Selection update error:', error);
        }
    },

    // Scroll selected item into view
    scrollToSelected: function() {
        try {
            if (!this.resultsContainer || this.selectedIndex < 0) return;

            const selectedItem = this.resultsContainer.children[this.selectedIndex];
            if (selectedItem) {
                selectedItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        } catch (error) {
            console.error('Scroll error:', error);
        }
    },

    // Perform search
    performSearch: function(query) {
        try {
            if (!query.trim()) {
                this.showEmptyState();
                return;
            }

            // Filter results
            const results = this.searchData.filter(item => {
                if (!item) return false;

                const searchTerm = query.toLowerCase();
                return (
                    (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                    (item.location && item.location.toLowerCase().includes(searchTerm)) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
            });

            // Sort by relevance
            results.sort((a, b) => {
                const aTitleMatch = a.title && a.title.toLowerCase().includes(query.toLowerCase());
                const bTitleMatch = b.title && b.title.toLowerCase().includes(query.toLowerCase());

                if (aTitleMatch && !bTitleMatch) return -1;
                if (!aTitleMatch && bTitleMatch) return 1;

                return 0;
            });

            // Limit to max results
            const limitedResults = results.slice(0, 10);

            this.displayResults(limitedResults);
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorState();
        }
    },

    // Display search results
    displayResults: function(results) {
        try {
            if (!this.resultsContainer) return;

            this.resultsContainer.innerHTML = '';

            if (results.length === 0) {
                this.showNoResults();
                return;
            }

            results.forEach((result, index) => {
                const resultElement = this.createResultElement(result, index);
                this.resultsContainer.appendChild(resultElement);
            });
        } catch (error) {
            console.error('Display results error:', error);
        }
    },

    // Create result element
    createResultElement: function(result, index) {
        try {
            const element = document.createElement('div');
            element.className = 'p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors';
            element.setAttribute('data-index', index);

            element.innerHTML = `
                <a href="${result.url}" class="flex items-start gap-3 block group" onclick="P4C.Search.closeSearch()">
                    ${this.getTypeIcon(result.type)}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-semibold text-brand-navy truncate">${result.title}</h3>
                            <span class="text-xs text-slate-400 ml-2 flex-shrink-0">${this.getTypeLabel(result.type)}</span>
                        </div>
                        <p class="text-sm text-slate-600 mt-1 line-clamp-2">${result.description}</p>
                        ${this.createMetadata(result)}
                        ${this.createTags(result)}
                    </div>
                </a>
            `;

            return element;
        } catch (error) {
            console.error('Create result element error:', error);
            return document.createElement('div');
        }
    },

    // Get icon for result type
    getTypeIcon: function(type) {
        const icons = {
            project: `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>`,
            resource: `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>`,
            page: `<svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>`
        };
        return icons[type] || icons.page;
    },

    // Get type label
    getTypeLabel: function(type) {
        const labels = { project: 'Project', resource: 'Resource', page: 'Page' };
        return labels[type] || 'Unknown';
    },

    // Create metadata
    createMetadata: function(result) {
        try {
            if (!result.location && !result.price) return '';

            let metadata = '<div class="flex items-center gap-4 mt-2">';

            if (result.location) {
                metadata += `<div class="flex items-center gap-1 text-xs text-slate-500">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    ${result.location}
                </div>`;
            }

            if (result.price) {
                metadata += `<div class="text-xs font-medium text-brand-navy">${result.price}</div>`;
            }

            metadata += '</div>';
            return metadata;
        } catch (error) {
            console.error('Create metadata error:', error);
            return '';
        }
    },

    // Create tags
    createTags: function(result) {
        try {
            if (!result.tags || result.tags.length === 0) return '';

            const tags = result.tags.slice(0, 3);
            let tagsHtml = '<div class="flex gap-1 mt-2">';

            tags.forEach(tag => {
                tagsHtml += `<span class="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">${tag}</span>`;
            });

            if (result.tags.length > 3) {
                tagsHtml += `<span class="text-xs text-slate-400">+${result.tags.length - 3} more</span>`;
            }

            tagsHtml += '</div>';
            return tagsHtml;
        } catch (error) {
            console.error('Create tags error:', error);
            return '';
        }
    },

    // Show states
    showEmptyState: function() {
        try {
            if (!this.resultsContainer) return;
            this.resultsContainer.innerHTML = `
                <div class="p-8 text-center">
                    <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-600 mb-2">Start typing to search</h3>
                    <p class="text-slate-500">Search for properties, housing resources, and site pages</p>
                </div>
            `;
        } catch (error) {
            console.error('Show empty state error:', error);
        }
    },

    showNoResults: function() {
        try {
            if (!this.resultsContainer) return;
            this.resultsContainer.innerHTML = `
                <div class="p-8 text-center">
                    <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-600 mb-2">No results found</h3>
                    <p class="text-slate-500">Try adjusting your search terms or browse our <a href="projects.html" class="text-brand-navy hover:underline">projects</a> and <a href="resources.html" class="text-brand-navy hover:underline">resources</a>.</p>
                </div>
            `;
        } catch (error) {
            console.error('Show no results error:', error);
        }
    },

    showErrorState: function() {
        try {
            if (!this.resultsContainer) return;
            this.resultsContainer.innerHTML = `
                <div class="p-8 text-center">
                    <svg class="w-12 h-12 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-lg font-medium text-red-600 mb-2">Search unavailable</h3>
                    <p class="text-red-500">Please try again or contact support if the issue persists.</p>
                </div>
            `;
        } catch (error) {
            console.error('Show error state error:', error);
        }
    }
};

// Initialize P4C when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Ensure P4C object exists
    window.P4C = window.P4C || {};

    // Flag this as static HTML version
    window.P4C.isStaticHTML = true;
    window.P4C.basePath = '';

    // Initialize all P4C modules
    if (P4C.Forms) P4C.Forms.init();
    if (P4C.Modals) P4C.Modals.init();
    if (P4C.Search) P4C.Search.init();

    console.log('🚀 P4C Static Static Loaded Successfully');
});
