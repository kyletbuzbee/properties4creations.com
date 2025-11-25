// Properties 4 Creations Enhanced Form Submission
// Uses Google Apps Script as free backend for form submissions
// Features: Client validation, loading states, accessibility, progressive enhancement

(function() {
  'use strict';

  class P4CFormHandler {
    constructor(options = {}) {
      this.endpoint = options.endpoint || 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec';
      this.initializeForms();
    }

    initializeForms() {
      // Handle all forms with property inquiry
      const forms = document.querySelectorAll('form[action*="property-inquiry"], form[id*="property-inquiry"], form[name*="property-inquiry"]');
      forms.forEach(form => {
        form.addEventListener('submit', this.handleSubmit.bind(this), { passive: false });
        this.initializeFieldAccessibility(form);
      });
    }

    initializeFieldAccessibility(form) {
      // Add aria-describedby to form fields
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        const fieldName = field.name || field.id;
        if (fieldName) {
          const errorId = `${fieldName}-error`;
          const existingError = document.getElementById(errorId);

          // Ensure error message exists
          if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.id = errorId;
            errorDiv.className = 'form-error hidden';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.setAttribute('aria-live', 'polite');
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
          }

          // Add aria-describedby
          const existingDescribedBy = field.getAttribute('aria-describedby') || '';
          if (!existingDescribedBy || !existingDescribedBy.includes(errorId)) {
            field.setAttribute('aria-describedby', (existingDescribedBy ? existingDescribedBy + ' ' : '') + errorId);
          }

          // Handle field validation on blur
          field.addEventListener('blur', () => this.validateField(field));
          field.addEventListener('input', () => this.clearFieldError(field));
        }
      });
    }

    async handleSubmit(e) {
      e.preventDefault();

      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], [data-submit]');
      const formData = this.extractFormData(form);

      // Client-side validation
      if (!this.validateForm(form, formData)) {
        return;
      }

      // UX: Show loading state
      this.setFormSubmitting(form, true);

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          this.handleSuccess(form, formData);
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.handleError(form, error.message || 'There was a problem submitting the form. Please try again or call us.');
      } finally {
        // Reset loading state
        setTimeout(() => this.setFormSubmitting(form, false), 1000);
      }
    }

    extractFormData(form) {
      const data = {};
      const elements = form.querySelectorAll('input, textarea, select');

      elements.forEach(element => {
        const name = element.name;
        if (name) {
          if (element.type === 'checkbox') {
            data[name] = element.checked;
          } else if (element.type === 'radio') {
            if (element.checked) {
              data[name] = element.value;
            }
          } else {
            data[name] = element.value.trim();
          }
        }
      });

      // Add timestamp and source tracking
      data.timestamp = new Date().toISOString();
      data.source = window.location.pathname;
      data.userAgent = navigator.userAgent;

      return data;
    }

    validateForm(form, data) {
      let isValid = true;
      const requiredFields = ['name', 'email'];

      // Check required fields
      requiredFields.forEach(field => {
        const element = form.querySelector(`[name="${field}"], [id="${field}"]`);
        if (!data[field]) {
          this.showFieldError(element, `${this.getFieldLabel(element)} is required.`);
          isValid = false;
        }
      });

      // Email validation
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          const emailField = form.querySelector('[name="email"], [id="email"]');
          this.showFieldError(emailField, 'Please enter a valid email address.');
          isValid = false;
        }
      }

      return isValid;
    }

    validateField(field) {
      const value = field.value.trim();
      const fieldName = field.name || field.id;

      // Clear previous error
      this.clearFieldError(field);

      // Required field validation
      if (field.hasAttribute('required') && !value) {
        this.showFieldError(field, `${this.getFieldLabel(field)} is required.`);
        return;
      }

      // Email validation
      if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.showFieldError(field, 'Please enter a valid email address.');
        }
      }

      // Phone validation (optional, basic format check)
      if (fieldName === 'phone' && value && !/^\(?[\d\s\-\(\)]{10,}$/.test(value.replace(/\D/g, ''))) {
        this.showFieldError(field, 'Please enter a valid phone number.');
      }
    }

    getFieldLabel(field) {
      // Try to find a label element
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) {
        return label.textContent.replace('*', '').trim();
      }

      // Fallback to name or placeholder
      return field.placeholder || field.name || 'This field';
    }

    showFieldError(field, message) {
      const errorId = `${field.name || field.id}-error`;
      const errorElement = document.getElementById(errorId);

      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        field.setAttribute('aria-invalid', 'true');
        errorElement.setAttribute('aria-live', 'polite');
      }

      // Apply error styling
      field.classList.add('border-red-500', 'focus:border-red-500');
      field.setAttribute('aria-invalid', 'true');
    }

    clearFieldError(field) {
      const errorId = `${field.name || field.id}-error`;
      const errorElement = document.getElementById(errorId);

      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
      }

      // Remove error styling
      field.classList.remove('border-red-500', 'focus:border-red-500');
      field.removeAttribute('aria-invalid');
    }

    setFormSubmitting(form, isSubmitting) {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], [data-submit]');
      const originalText = submitBtn?.textContent || submitBtn?.value || 'Submit';

      if (isSubmitting) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.textContent = submitBtn.value = 'Sending...';
        submitBtn.classList.add('loading');
      } else {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-disabled');
        submitBtn.textContent = submitBtn.value = originalText;
        submitBtn.classList.remove('loading');
      }
    }

    handleSuccess(form, data) {
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4';
      successMessage.setAttribute('role', 'alert');
      successMessage.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Success!</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Thanks for your interest! We'll contact you within 24 hours.</p>
            </div>
          </div>
        </div>
      `;

      // Insert success message
      form.parentNode.insertBefore(successMessage, form);

      // Reset form
      form.reset();

      // Disable form temporarily
      form.querySelectorAll('input, textarea, select, button').forEach(el => {
        el.disabled = true;
      });

      // Remove success message and re-enable form after 10 seconds
      setTimeout(() => {
        successMessage.remove();
        form.querySelectorAll('input, textarea, select, button').forEach(el => {
          el.disabled = false;
        });
      }, 10000);

      // Track success event
      if (window.gtag) {
        gtag('event', 'form_submission', {
          'event_category': 'engagement',
          'event_label': 'property_inquiry',
          'value': 1
        });
      }
    }

    handleError(form, message) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4';
      errorMessage.setAttribute('role', 'alert');
      errorMessage.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>${message}</p>
              <p class="mt-2">
                <a href="tel:+19032831770" class="text-red-600 underline">Call us directly: (903) 283-1770</a>
              </p>
            </div>
          </div>
        </div>
      `;

      // Insert error message
      form.parentNode.insertBefore(errorMessage, form);

      // Remove error message after 15 seconds
      setTimeout(() => {
        errorMessage.remove();
      }, 15000);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // You'll need to set your actual Apps Script deploy URL
      const formHandler = new P4CFormHandler({
        endpoint: 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec'
      });
    });
  } else {
    // Document already loaded - for lazy script loading
    const formHandler = new P4CFormHandler({
      endpoint: 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec'
    });
  }

  // Export for global access
  window.P4C = window.P4C || {};
  window.P4C.FormHandler = P4CFormHandler;

})();
