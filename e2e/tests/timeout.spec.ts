import { test, expect } from '@playwright/test';

test.describe('CodePulse Timeout Resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  });

  test('should handle infinite loop with timeout alert', async ({ page }) => {
    // Select Python language
    const languageSelect = page.locator('select[name="language"]');
    await languageSelect.selectOption('python');

    // Enter infinite loop code
    const editorFrame = page.frameLocator('.monaco-editor iframe').first();
    await editorFrame.locator('textarea').fill('while True:\n    pass');

    // Execute code
    const executeButton = page.locator('button:has-text("Executar")');
    await executeButton.click();

    // Wait for timeout alert (should appear within 6 seconds for 5s backend timeout)
    const timeoutAlert = page.locator('.alert-danger:has-text("Timeout")');
    await expect(timeoutAlert).toBeVisible({ timeout: 7000 });
    
    // Verify alert content
    await expect(timeoutAlert).toContainText('Tempo limite');
  });

  test('should display 408 status on timeout', async ({ page }) => {
    // Select Python language
    const languageSelect = page.locator('select[name="language"]');
    await languageSelect.selectOption('python');

    // Enter infinite loop code
    const editorFrame = page.frameLocator('.monaco-editor iframe').first();
    await editorFrame.locator('textarea').fill('while True:\n    pass');

    // Execute code
    const executeButton = page.locator('button:has-text("Executar")');
    await executeButton.click();

    // Wait for output container
    const outputContainer = page.locator('.output-container');
    await expect(outputContainer).toBeVisible();

    // Verify error message contains 408 status
    const errorMessage = page.locator('.output-container p');
    await expect(errorMessage).toContainText('408');
  });

  test('should not freeze UI during timeout', async ({ page }) => {
    // Select Python language
    const languageSelect = page.locator('select[name="language"]');
    await languageSelect.selectOption('python');

    // Enter infinite loop code
    const editorFrame = page.frameLocator('.monaco-editor iframe').first();
    await editorFrame.locator('textarea').fill('while True:\n    pass');

    // Execute code
    const executeButton = page.locator('button:has-text("Executar")');
    await executeButton.click();

    // Verify button is still clickable during waiting
    await page.waitForTimeout(2000); // Wait 2 seconds
    await expect(executeButton).toBeEnabled();
    
    // Verify we can interact with the editor
    await expect(languageSelect).toBeEnabled();

    // Wait for timeout
    const timeoutAlert = page.locator('.alert-danger:has-text("Timeout")');
    await expect(timeoutAlert).toBeVisible({ timeout: 7000 });
  });
});
