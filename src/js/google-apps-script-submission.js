// Properties 4 Creations Form Submission
// Enhanced with Real-time Validation and Improved UX
// Google Apps Script Integration - Production Ready

// Enhanced form validation class
class FormValidator {
  constructor(formEl) {
    this.form = formEl;
    this.fields = {};
    this.init();
  }

  init() {
    // Set up validation for all form groups
    this.form.querySelectorAll('.form-group').forEach(group => {
      const fieldName = group.dataset.field;
      if (fieldName) {
        this.fields[fieldName] = {
          element: group,
          input: group.querySelector('input, textarea, select'),
          required: group.classList.contains('required'),
          errorEl: group.querySelector('.error-message'),
          successEl: group.querySelector('.success-message')
        };

        // Add event listeners for real-time validation
        this.fields[fieldName].input.addEventListener('input', () => this.validateField(fieldName));
        this.fields[fieldName].input.addEventListener('blur', () => this.validateField(fieldName));

        // Add focus states
        this.fields[fieldName].input.addEventListener('focus', () => {
          group.classList.add('has-focus');
        });
        this.fields[fieldName].input.addEventListener('blur', () => {
          group.classList.remove('has-focus');
        });
      }
    });
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return true;

    const value = field.input.value.trim();
    const isRequired = field.required;

    // Clear previous states
    this.clearFieldState(fieldName);

    // Check if field is empty but required
    if (isRequired && !value) {
      this.showFieldError(fieldName, 'This field is required');
      return false;
    }

    // Email validation
    if (fieldName === 'email') {
      if (!value) return !isRequired;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        this.showFieldError(fieldName, 'Please enter a valid email address');
        return false;
      }
    }

    // Phone validation (optional but format if provided)
    if (fieldName === 'phone' && value) {
      const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
      if (!phoneRegex.test(value)) {
        this.showFieldError(fieldName, 'Please enter a valid phone number');
        return false;
      }
    }

    // Name validation
    if (fieldName === 'name') {
      if (value.length < 2) {
        this.showFieldError(fieldName, 'Name must be at least 2 characters');
        return false;
      }
    }

    // Message validation
    if (fieldName === 'message') {
      if (value.length < 10) {
        this.showFieldError(fieldName, 'Message must be at least 10 characters');
        return false;
      }
    }

    // If we get here, validation passed
    if (isRequired || value) {
      this.showFieldSuccess(fieldName);
    }

    return true;
  }

  showFieldError(fieldName, message) {
    const field = this.fields[fieldName];
    field.element.classList.add('has-error');
    field.element.classList.remove('has-success');
    field.errorEl.textContent = message;
    field.errorEl.style.display = 'block';
    field.errorEl.setAttribute('aria-hidden', 'false');
    field.successEl.style.display = 'none';
    field.successEl.setAttribute('aria-hidden', 'true');
    field.input.setAttribute('aria-invalid', 'true');
  }

  showFieldSuccess(fieldName) {
    const field = this.fields[fieldName];
    field.element.classList.add('has-success');
    field.element.classList.remove('has-error');
    field.successEl.style.display = 'block';
    field.successEl.setAttribute('aria-hidden', 'false');
    field.errorEl.style.display = 'none';
    field.errorEl.setAttribute('aria-hidden', 'true');
    field.input.setAttribute('aria-invalid', 'false');
  }

  clearFieldState(fieldName) {
    const field = this.fields[fieldName];
    field.element.classList.remove('has-error', 'has-success');
    field.errorEl.style.display = 'none';
    field.successEl.style.display = 'none';
    field.errorEl.setAttribute('aria-hidden', 'true');
    field.successEl.setAttribute('aria-hidden', 'true');
    field.input.removeAttribute('aria-invalid');
  }

  validateAll() {
    let allValid = true;
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        allValid = false;
      }
    });
    return allValid;
  }
}

// Enhanced form submission with loading states
async function submitLead(formEl) {
  const submitBtn = formEl.querySelector('[type="submit"]');
  const loadingOverlay = formEl.closest('.form-container').querySelector('.form-loading-overlay');
  const validator = new FormValidator(formEl);

  // Validate all fields first
  if (!validator.validateAll()) {
    // Focus on first invalid field
    const firstInvalid = formEl.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return false;
  }

  // Show loading state
  showFormLoading(submitBtn, loadingOverlay);

  const data = {
    name: formEl.querySelector('[name="name"]').value.trim(),
    email: formEl.querySelector('[name="email"]').value.trim(),
    phone: formEl.querySelector('[name="phone"]').value.trim(),
    veteran: !!formEl.querySelector('[name="veteran"]')?.checked,
    message: (formEl.querySelector('[name="message"]') || formEl.querySelector('textarea'))?.value?.trim() || '',
    source: window.location.pathname
  };

  try {
    const resp = await fetch('https://script.google.com/macros/s/AKfycbwxz5eoaGgYOoaKTKEfMm2jHo7buxNnHyu5lkZCkhDYLfbRqNRUW90Sk9yrXGRLjMM3Gw/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await resp.json();
    if (json.success) {
      hideFormLoading(submitBtn, loadingOverlay);
      showFormSuccess(formEl, data);
      formEl.reset();

      // Clear all validation states
      Object.keys(validator.fields).forEach(fieldName => {
        validator.clearFieldState(fieldName);
      });

      // Analytics tracking
      if (window.gtag) {
        gtag('event', 'form_submission', {
          'event_category': 'engagement',
          'event_label': 'property_inquiry',
          'value': 1
        });
      }

      return true;
    } else {
      hideFormLoading(submitBtn, loadingOverlay);
      showFormError(formEl, json.error || 'Submission failed. Please try again.');
      return false;
    }
  } catch (err) {
    console.error('Submit error', err);
    hideFormLoading(submitBtn, loadingOverlay);
    showFormError(formEl, 'Network error. Please check your connection and try again.');
    return false;
  }
}

function showFormLoading(submitBtn, overlay) {
  const originalText = submitBtn.textContent;
  submitBtn.dataset.originalText = originalText;
  submitBtn.innerHTML = '<span class="form-spinner"></span> Sending...';
  submitBtn.disabled = true;
  submitBtn.classList.add('btn-loading');

  if (overlay) {
    overlay.classList.add('active');
  }

  // Add loading state to form container
  const formContainer = submitBtn.closest('.form-container');
  if (formContainer) {
    formContainer.classList.add('submitting');
  }
}

function hideFormLoading(submitBtn, overlay) {
  submitBtn.innerHTML = submitBtn.dataset.originalText || 'Send Message';
  submitBtn.disabled = false;
  submitBtn.classList.remove('btn-loading');

  if (overlay) {
    overlay.classList.remove('active');
  }

  // Remove loading state from form container
  const formContainer = submitBtn.closest('.form-container');
  if (formContainer) {
    formContainer.classList.remove('submitting');
  }
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showFormSuccess(formEl, data) {
  const successDiv = document.createElement('div');
  successDiv.className = 'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4';
  successDiv.setAttribute('role', 'alert');
  successDiv.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Success!</h3>
        <div class="mt-2 text-sm text-green-700">
          <p>Thanks for your interest! We'll contact you within 24 hours about available housing.</p>
        </div>
      </div>
    </div>
  `;

  formEl.parentNode.insertBefore(successDiv, formEl);
  setTimeout(() => successDiv.remove(), 10000);
}

function showFormError(formEl, message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.innerHTML = `
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

  formEl.parentNode.insertBefore(errorDiv, formEl);
  setTimeout(() => errorDiv.remove(), 15000);
}

// Auto-initialize on form pages
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[id*="property-inquiry"], form[action*="property-inquiry"]');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitLead(this).catch(console.error);
    });
  });

  // Show success message if redirected from thank-you page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 max-w-md mx-auto';
    successDiv.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Form Submitted Successfully!</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>We'll contact you within 24 hours about available housing.</p>
          </div>
        </div>
      </div>
    `;
    document.body.insertBefore(successDiv, document.body.firstChild);
  }
});
