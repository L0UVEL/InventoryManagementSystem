/// <reference types="cypress" />

describe('Inventory Management System E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage to start each test fresh
    cy.clearLocalStorage();
  });

  it('1. Valid Login (Admin Flow)', () => {
    // Intercept login authentication
    cy.intercept('POST', '/api/auth/authenticate', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-admin-token',
        username: 'admin',
        role: 'ROLE_ADMIN',
        fullName: 'Administrator'
      }
    }).as('adminLogin');

    // Intercept dashboard report API
    cy.intercept('GET', '/api/reports/dashboard', {
      statusCode: 200,
      body: {
        totalItems: 1500,
        lowStockAlertsCount: 3,
        transactionsToday: 12,
        estimatedInventoryValue: 250000,
        recentRequisitions: [
          {
            id: 1,
            transactionId: 'TXN-00101',
            type: 'Internal Req.',
            requestorName: 'Louvel',
            department: 'IT Department',
            date: new Date().toISOString(),
            status: 'Approved',
            items: []
          }
        ]
      }
    }).as('getDashboard');

    // Go to login page
    cy.visit('/login');

    // Fill in the form
    cy.get('input[placeholder*="admin"]').type('admin');
    cy.get('input[type="password"]').type('adminpassword');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify authentication and dashboard requests were triggered
    cy.wait('@adminLogin');
    cy.wait('@getDashboard');

    // Should redirect to Dashboard page
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Check key elements on the dashboard
    cy.contains('h1', 'Dashboard Overview').should('be.visible');
    cy.contains('Total Items').should('be.visible');
    cy.contains('1,500').should('be.visible');
    cy.contains('TXN-00101').should('be.visible');
    cy.contains('IT Department').should('be.visible');
  });

  it('2. Invalid Login', () => {
    // Intercept login to fail
    cy.intercept('POST', '/api/auth/authenticate', {
      statusCode: 401,
      body: { message: 'Invalid username or password.' }
    }).as('loginFail');

    cy.visit('/login');

    // Fill in credentials that fail
    cy.get('input[placeholder*="admin"]').type('wronguser');
    cy.get('input[type="password"]').type('wrongpassword');

    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for the mock API response
    cy.wait('@loginFail');

    // Verify error is shown on the page
    cy.contains('Invalid username or password.').should('be.visible');
  });

  it('3. User Action (Requesting an Item as standard user)', () => {
    // Intercept user login
    cy.intercept('POST', '/api/auth/authenticate', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-user-token',
        username: 'user',
        role: 'ROLE_USER',
        fullName: 'Standard User'
      }
    }).as('userLogin');

    // Intercept products list call
    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [
        {
          id: 42,
          sku: 'SKU-LAPTOP-01',
          name: 'ThinkPad L14',
          category: 'IT Assets',
          basePrice: 45000,
          lowStockThreshold: 2,
          status: 'In Stock'
        }
      ]
    }).as('getProducts');

    // Intercept transaction creation request
    cy.intercept('POST', '/api/transactions', {
      statusCode: 200,
      body: {
        id: 999,
        transactionId: 'RQ-2026',
        type: 'Internal Req.',
        requestorName: 'Standard User',
        department: 'IT Department',
        date: new Date().toISOString(),
        status: 'Pending',
        items: []
      }
    }).as('createTransaction');

    cy.visit('/login');

    // Login as standard user
    cy.get('input[placeholder*="admin"]').type('user');
    cy.get('input[type="password"]').type('userpassword');
    cy.get('button[type="submit"]').click();

    // Wait for Auth and Products API
    cy.wait('@userLogin');
    cy.wait('@getProducts');

    // Should redirect to User Home page (Available Items)
    cy.contains('h1', 'Available Items').should('be.visible');
    cy.contains('ThinkPad L14').should('be.visible');

    // Trigger user action: request item
    cy.contains('button', 'Request').click();

    // The modal should appear
    cy.contains('h4', 'ThinkPad L14').should('be.visible');

    // Fill in requisition details in modal
    cy.get('input[placeholder="e.g. IT Department"]').type('IT Support Group');
    cy.get('input[type="number"]').clear().type('2');

    // Submit standard user action
    cy.contains('button', 'Submit Request').click();

    // Wait for transaction create request
    cy.wait('@createTransaction');

    // Verify modal is dismissed (modal content should no longer be visible)
    cy.contains('h4', 'ThinkPad L14').should('not.exist');
  });

  it('4. Logout Flow', () => {
    // Intercept user login to bypass login form
    cy.intercept('POST', '/api/auth/authenticate', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-user-token',
        username: 'user',
        role: 'ROLE_USER',
        fullName: 'Standard User'
      }
    }).as('userLogin');

    // Intercept product list so page loads
    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: []
    }).as('getProducts');

    cy.visit('/login');

    // Login
    cy.get('input[placeholder*="admin"]').type('user');
    cy.get('input[type="password"]').type('userpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@userLogin');
    cy.wait('@getProducts');

    // Verify we are logged in by checking Sidebar has standard user info
    cy.contains('Standard User').should('be.visible');

    // Trigger logout
    cy.contains('button', 'Logout').click();

    // Verify redirection to login page
    cy.url().should('include', '/login');
    cy.get('button[type="submit"]').should('contain', 'Sign In');

    // Verify local storage is cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    });
  });
});
