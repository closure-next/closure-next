import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Component, type ComponentInterface, type DomHelper } from '@closure-next/core';
import TestWrapper from './TestWrapper.svelte';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';

class TestComponent extends Component implements ComponentInterface {
  private title: string = '';
  
  constructor(domHelper?: DomHelper) {
    super(domHelper);
  }

  setTitle(title: string): void {
    this.title = title;
    const element = this.getElement();
    if (element) {
      element.setAttribute('data-title', this.title);
    }
  }
  
  getTitle(): string {
    return this.title;
  }

  public override createDom(): void {
    super.createDom();
    const element = this.getElement();
    if (element) {
      element.setAttribute('data-testid', 'test-component');
      element.setAttribute('data-title', this.title);
    }
  }
}

describe('Svelte Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  test('should render Closure component', async () => {
    const { container } = render(TestWrapper, {
      props: {
        component: TestComponent
      }
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const element = container.querySelector('[data-testid="test-component"]');
    expect(element).toBeTruthy();
    expect(container.querySelector('[data-testid="closure-wrapper"]')).toBeTruthy();
  });

  test('should handle props', async () => {
    const { container } = render(TestWrapper, {
      props: {
        component: TestComponent,
        props: {
          title: 'Test Title'
        }
      }
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const element = container.querySelector('[data-testid="test-component"]');
    expect(element).toBeTruthy();
    expect(element).toHaveAttribute('data-title', 'Test Title');
  });

  test('should update on prop changes', async () => {
    const { container, component } = render(TestWrapper, {
      props: {
        component: TestComponent,
        props: {
          title: 'Initial Title'
        }
      }
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const element = container.querySelector('[data-testid="test-component"]');
    expect(element).toBeTruthy();
    expect(element).toHaveAttribute('data-title', 'Initial Title');

    // Update props through Svelte component
    component.$set({ props: { title: 'Updated Title' } });

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(element).toHaveAttribute('data-title', 'Updated Title');
  });

  test('should clean up on destroy', async () => {
    const { container, component } = render(TestWrapper, {
      props: {
        component: TestComponent
      }
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const element = container.querySelector('[data-testid="test-component"]');
    expect(element).toBeTruthy();

    // Get the Closure component instance
    const closureInstance = (element as any)._closureComponent;
    expect(closureInstance).toBeTruthy();

    const disposeSpy = jest.spyOn(closureInstance, 'dispose');
    component.$destroy();

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(disposeSpy).toHaveBeenCalled();
  });

  test('should handle events', async () => {
    const { container } = render(TestWrapper, {
      props: {
        component: TestComponent
      }
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const element = container.querySelector('[data-testid="test-component"]');
    expect(element).toBeTruthy();

    // Get the Closure component instance
    const closureInstance = (element as any)._closureComponent;
    expect(closureInstance).toBeTruthy();

    // Set up event handler
    const handler = jest.fn();
    closureInstance.addEventListener('click', handler);

    // Simulate click
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for event handling
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(handler).toHaveBeenCalled();
  });
});
